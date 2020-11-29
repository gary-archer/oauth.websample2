import {UserManager, WebStorageStateStore} from 'oidc-client';
import urlparse from 'url-parse';
import {OAuthConfiguration} from '../../configuration/oauthConfiguration';
import {ErrorCodes} from '../errors/errorCodes';
import {ErrorHandler} from '../errors/errorHandler';
import {HybridTokenStorage} from './hybridTokenStorage';

/*
 * The entry point for initiating login and token requests
 */
export class Authenticator {

    // The OIDC Client class does all of the real security processing
    private readonly _userManager: UserManager;

    /*
     * Configure the OIDC Client library when constructed
     */
    public constructor(config: OAuthConfiguration) {

        // Create OIDC settings from our application configuration
        const settings = {

            // The Open Id Connect base URL
            authority: config.authority,

            // Core OAuth settings for our app
            client_id: config.clientId,
            redirect_uri: config.appUri,
            scope: config.scope,

            // Use the Authorization Code Flow (PKCE)
            response_type: 'code',

            // We silently renew explicitly rather than in the background
            automaticSilentRenew: false,
            silent_redirect_uri: config.appUri,

            // We get extended user info from our API and do not use this feature
            loadUserInfo: false,

            // Tokens are stored only in memory, but we store multi tab state in local storage
            // https://auth0.com/docs/tokens/guides/store-tokens
            userStore: new WebStorageStateStore({ store: new HybridTokenStorage() }),

            // Indicate the path in our app to return to after logout
            post_logout_redirect_uri: `${config.appUri}${config.postLogoutPath}`,
        };

        // Create the user manager
        this._userManager = new UserManager(settings);
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

        // If a new token is needed or the page is refreshed, try to refresh the access token
        return this.refreshAccessToken();
    }

    /*
     * Try to refresh an access token
     */
    public async refreshAccessToken(): Promise<string> {

        // See if the user is stored in any browser tab
        let user = await this._userManager.getUser();
        if (user) {

            // Try to refresh the access token via an iframe redirect
            await this._performTokenRefresh();

            // Return the renewed access token if found
            user = await this._userManager.getUser();
            if (user && user.access_token) {
                return user.access_token;
            }
        }

        // Otherwise trigger a login redirect
        await this._startLogin();

        // End the API request which brought us here with an error code that can be ignored
        throw ErrorHandler.getFromLoginRequired();
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
     * This method is for testing only, to make the access token in storage act like it has expired
     */
    public async expireAccessToken(): Promise<void> {

        const user = await this._userManager.getUser();
        if (user) {

            user.access_token = 'x' + user.access_token + 'x';
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
                state: JSON.stringify(data),
            });

        } catch (e) {

            // Handle OAuth specific errors, such as those calling the metadata endpoint
            throw ErrorHandler.getFromLoginRequest(e, ErrorCodes.loginRequestFailed);
        }
    }

    /*
     * Handle the response from the authorization server
     */
    private async _handleLoginResponse(): Promise<void> {

        // If the page loads with a state query parameter we classify it as an OAuth response
        const urlData = urlparse(location.href, true);
        if (urlData.query && urlData.query.state) {

            let redirectLocation = '#';
            try {

                // Only try to process a login response if the state exists
                const storedState = await this._userManager.settings.stateStore?.get(urlData.query.state);
                if (storedState) {

                    // Handle the login response
                    const user = await this._userManager.signinRedirectCallback();

                    // Get the hash URL before the login redirect
                    const data = JSON.parse(user.state);
                    redirectLocation = data.hash;
                }

            } catch (e) {

                // Handle and rethrow OAuth response errors
                throw ErrorHandler.getFromLoginResponse(e, ErrorCodes.loginResponseFailed);

            } finally {

                // Always replace the browser location, to remove OAuth details from back navigation
                history.replaceState({}, document.title, redirectLocation);
            }
        }
    }

    /*
     * Redirect in order to log out at the authorization server and remove the session cookie
     */
    private async _startLogout(): Promise<void> {

        try {
            // Do the redirect
            await this._userManager.signoutRedirect();

        } catch (e) {
            throw ErrorHandler.getFromLogoutRequest(e, ErrorCodes.logoutRequestFailed);
        }
    }

    /*
     * Try to refresh the access token by manually triggering a silent token renewal on an iframe
     */
    private async _performTokenRefresh(): Promise<void> {

        try {

            // Redirect on an iframe using the Authorization Server session cookie and prompt=none
            // A different scope could be requested by also supplying an object with a scope= property
            await this._userManager.signinSilent();

        } catch (e) {

            if (e.error === ErrorCodes.loginRequired) {

                // For session expired errors, clear token data and return success, to force a login redirect
                await this._userManager.removeUser();
            }
            else {

                // Rethrow other errors
                throw ErrorHandler.getFromTokenError(e, ErrorCodes.tokenRenewalError);
            }
        }
    }
}
