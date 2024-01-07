import {InMemoryWebStorage, UserManager, WebStorageStateStore} from 'oidc-client';
import urlparse from 'url-parse';
import {OAuthConfiguration} from '../../configuration/oauthConfiguration';
import {ErrorCodes} from '../errors/errorCodes';
import {ErrorFactory} from '../errors/errorFactory';
import {UIError} from '../errors/uiError';
import {HtmlStorageHelper} from '../utilities/htmlStorageHelper';
import {OAuthUserInfo} from './oauthUserInfo';

/*
 * The entry point for initiating login and token requests
 */
export class Authenticator {

    private readonly _configuration: OAuthConfiguration;
    private readonly _userManager: UserManager;
    private _loginTime: number | null;

    public constructor(configuration: OAuthConfiguration) {

        // Create OIDC settings from our application configuration
        this._configuration = configuration;
        const settings = {

            // The OpenID Connect base URL
            authority: configuration.authority,

            // Core OAuth settings for our app
            client_id: configuration.clientId,
            redirect_uri: configuration.redirectUri,
            scope: configuration.scope,

            // Use the Authorization Code Flow (PKCE)
            response_type: 'code',

            // Tokens are stored only in memory, which is better from a security viewpoint
            userStore: new WebStorageStateStore({ store: new InMemoryWebStorage() }),

            // Store redirect state such as PKCE verifiers in session storage, for more reliable cleanup
            stateStore: new WebStorageStateStore({ store: sessionStorage }),

            // The SPA handles 401 errors and does not do silent token renewal in the background
            silent_redirect_uri: configuration.redirectUri,
            automaticSilentRenew: false,

            // The UI loads user info from the OpenID Connect user info endpoint
            loadUserInfo: true,

            // Indicate the logout return path and listen for logout events from other browser tabs
            post_logout_redirect_uri: configuration.postLogoutRedirectUri,
        };

        // Create the user manager
        this._userManager = new UserManager(settings);
        this._loginTime = null;
    }

    /*
     * Get an access token and login if required
     */
    public async getAccessToken(): Promise<string> {

        // On most calls we just return the existing token from memory
        const user = await this._userManager.getUser();
        if (user && user.access_token) {
            return user.access_token;
        }

        // Otherwise try to refresh the access token
        return this.refreshAccessToken(null);
    }

    /*
     * Try to refresh an access token
     */
    public async refreshAccessToken(error: UIError | null): Promise<string> {

        // This flag avoids an unnecessary refresh attempt when the app first loads
        if (HtmlStorageHelper.isLoggedIn) {

            // Protect against redirect loops if APIs are misconfigured
            if (error != null) {
                await this._preventRedirectLoop(error);
            }

            if (this._configuration.provider === 'cognito') {

                // For Cognito, refresh the access token using a refresh token stored in JavaScript memory
                const user = await this._userManager.getUser();
                if (user && user.refresh_token) {
                    await this._performAccessTokenRenewalViaRefreshToken();
                }

            } else {

                // For other providers, assume that prompt=none is supported and use the traditional SPA solution
                await this._performAccessTokenRenewalViaIframeRedirect();
            }

            // Return a renewed access token if found
            const updatedUser = await this._userManager.getUser();
            if (updatedUser && updatedUser.access_token) {
                return updatedUser.access_token;
            }
        }

        // Trigger a login redirect if we cannot get an access token
        // Also end the API request in a controlled way, by throwing an error that is not rendered
        await this._startLogin();
        throw ErrorFactory.getFromLoginRequired();
    }

    /*
     * Handle the response from the authorization server
     */
    public async handleLoginResponse(): Promise<void> {
        return this._handleLoginResponse();
    }

    /*
     * Redirect in order to log out at the authorization server and remove vendor cookies
     */
    public async startLogout(): Promise<void> {
        return this._startLogout();
    }

    /*
     * Handler logout notifications from other browser tabs
     */
    public async onExternalLogout(): Promise<void> {
        await this._resetDataOnLogout();
    }

    /*
     * Get user info, which is available once authentication has completed
     */
    public async getUserInfo(): Promise<OAuthUserInfo | null> {

        const user = await this._userManager.getUser();
        if (user && user.profile) {
            if (user.profile.given_name && user.profile.family_name) {

                return {
                    givenName: user.profile.given_name,
                    familyName: user.profile.family_name,
                };
            }
        }

        return null;
    }

    /*
     * This method is for testing only, to make the access token in storage act like it has expired
     */
    public async expireAccessToken(): Promise<void> {

        const user = await this._userManager.getUser();
        if (user) {

            // Add a character to the signature to make it fail validation
            user.access_token = `${user.access_token}x`;
            this._userManager.storeUser(user);
        }
    }

    /*
     * Do the interactive login redirect on the main window
     */
    private async _startLogin(): Promise<void> {

        // Otherwise start a login redirect, by first storing the SPA's client side location
        // Some apps might also want to store form fields being edited in the state parameter
        const data = {
            hash: location.hash.length > 0 ? location.hash : '#',
        };

        try {
            // Start a login redirect
            await this._userManager.signinRedirect({
                state: data,
            });

        } catch (e: any) {

            // Handle OAuth specific errors, such as those calling the metadata endpoint
            throw ErrorFactory.getFromLoginOperation(e, ErrorCodes.loginRequestFailed);
        }
    }

    /*
     * Handle the response from the authorization server
     */
    private async _handleLoginResponse(): Promise<void> {

        // If the page loads with a state query parameter we classify it as an OAuth response
        const urlData = urlparse(location.href, true);
        if (urlData.query && urlData.query.state) {

            // Only try to process a login response if the state exists
            const storedState = await this._userManager.settings.stateStore?.get(urlData.query.state);
            if (storedState) {

                let redirectLocation = '#';
                try {

                    // Handle the login response
                    const user = await this._userManager.signinRedirectCallback();

                    // We will return to the app location before the login redirect
                    redirectLocation = user.state.hash;

                    // Update login state
                    HtmlStorageHelper.isLoggedIn = true;
                    this._loginTime = new Date().getTime();

                } catch (e: any) {

                    // Handle and rethrow OAuth response errors
                    throw ErrorFactory.getFromLoginOperation(e, ErrorCodes.loginResponseFailed);

                } finally {

                    // Always replace the browser location, to remove OAuth details from back navigation
                    history.replaceState({}, document.title, redirectLocation);
                }
            }
        }
    }

    /*
     * If an API returns a 401 immediately after login, then the API configuration is wrong and will fail permanently
     * In such cases, avoid a redirect loop for the user of the frontend app
     * My app uses a small tolerance so that expiry testing also works
     */
    private async _preventRedirectLoop(error: UIError): Promise<void> {

        if (this._loginTime! != null) {

            const currentTime = new Date().getTime();
            const millisecondsSinceLogin = currentTime - this._loginTime;
            if (millisecondsSinceLogin < 250) {

                await this._resetDataOnLogout();
                throw error;
            }
        }
    }

    /*
     * Redirect in order to log out at the authorization server and remove the session cookie
     */
    private async _startLogout(): Promise<void> {

        try {

            // Instruct other tabs to logout
            HtmlStorageHelper.raiseLoggedOutEvent();

            if (this._configuration.provider === 'cognito') {

                // Cognito requires a vendor specific logout request URL
                location.replace(this._getCognitoEndSessionRequestUrl());

            } else {

                // Otherwise use a standard end session request message
                await this._userManager.signoutRedirect();
            }

        } catch (e: any) {

            // Handle failures
            throw ErrorFactory.getFromLogoutOperation(e, ErrorCodes.logoutRequestFailed);
        }
    }

    /*
     * Try to refresh the access token by manually triggering a silent token renewal on an iframe
     * This will fail if there is no authorization server SSO cookie yet
     * It will fail in some browsers, which will not send the 3rd party SSO cookie due to RFC6265bis restrictions
     * It may also fail if there has been no top level redirect yet for the current browser session
     * The top level redirect may serve as a user gesture after which the browser also sends the SSO cookie silently
     */
    private async _performAccessTokenRenewalViaIframeRedirect(): Promise<void> {

        try {

            // Redirect on an iframe using the Authorization Server session cookie and prompt=none
            // This instructs the Authorization Server to not render the login page on the iframe
            // If the request fails there should be a login_required error returned from the Authorization Server
            await this._userManager.signinSilent();

        } catch (e: any) {

            if (e.error === ErrorCodes.loginRequired) {

                // Clear data and our code will then trigger a new login redirect
                await this._resetDataOnLogout();

            } else {

                // Rethrow any technical errors
                throw ErrorFactory.getFromTokenError(e, ErrorCodes.tokenRenewalError);
            }
        }
    }

    /*
     * It is not recommended to use a refresh token in the browser, even when stored only in memory, as in this sample
     * The browser cannot store a long lived token securely and malicious code could potentially access it
     * When using memory storage and a new browser tab is opened, there is an unwelcome browser redirect
     */
    private async _performAccessTokenRenewalViaRefreshToken(): Promise<void> {

        try {

            // The library will use the refresh token grant to get a new access token
            await this._userManager.signinSilent();

        } catch (e: any) {

            // When the session expires this will fail with an 'invalid_grant' response
            if (e.error === ErrorCodes.sessionExpired) {

                // Clear token data and our code will then trigger a new login redirect
                await this._resetDataOnLogout();

            } else {

                // Rethrow any technical errors
                throw ErrorFactory.getFromTokenError(e, ErrorCodes.tokenRenewalError);
            }
        }
    }

    /*
     * Cognito uses a vendor specific logout solution do we must build the request URL manually
     */
    private _getCognitoEndSessionRequestUrl(): string {

        let url = `${this._configuration.customLogoutEndpoint}`;
        url += `?client_id=${this._configuration.clientId}&logout_uri=${this._configuration.postLogoutRedirectUri}`;
        return url;
    }

    /*
     * Clean data when the session expires or the user logs out
     */
    private async _resetDataOnLogout(): Promise<void> {

        await this._userManager.removeUser();
        HtmlStorageHelper.isLoggedIn = false;
        this._loginTime = null;
    }
}
