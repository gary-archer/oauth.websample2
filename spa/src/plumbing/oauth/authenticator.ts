import {InMemoryWebStorage, UserManager, UserManagerSettings, WebStorageStateStore} from 'oidc-client';
import urlparse from 'url-parse';
import {OAuthConfiguration} from '../../configuration/oauthConfiguration';
import {ErrorCodes} from '../errors/errorCodes';
import {ErrorHandler} from '../errors/errorHandler';
import {UIError} from '../errors/uiError';

/*
 * The entry point for initiating login and token requests
 */
export class Authenticator {

    // A session key used to avoid the user logging in whenever the page is refreshed
    private readonly canRefreshKey = 'canSilentlyRenew';

    // The OIDC Client class does all of the real security processing
    private readonly _userManager: UserManager;

    /*
     * OIDC Client setup
     */
    public constructor(config: OAuthConfiguration) {

        // Create OIDC settings from our application configuration
        const settings = {
            authority: config.authority,
            client_id: config.clientId,
            redirect_uri: config.appUri,
            silent_redirect_uri: config.appUri,
            post_logout_redirect_uri: `${config.appUri}${config.postLogoutPath}`,
            scope: config.scope,

            // Use the Authorization Code Flow (PKCE)
            response_type: 'code',

            // We silently renew explicitly rather than in the background
            automaticSilentRenew: false,

            // We are not using these features and we get extended user info from our API
            loadUserInfo: false,
            monitorSession: false,

            // Tokens are stored only in memory, which generally does best in security reviews and PEN tests
            // https://auth0.com/docs/tokens/guides/store-tokens
            userStore: new WebStorageStateStore({ store: new InMemoryWebStorage() }),

        } as UserManagerSettings;

        // Create the user manager
        this._userManager = new UserManager(settings);
        this._setupCallbacks();
    }

    /*
     * Get an access token and login if required
     */
    public async getAccessToken(): Promise<string> {

        // On most calls we just return the existing token from memory
        const user = await this._userManager.getUser();
        if (user && user.access_token && user.access_token.length > 0) {
            return user.access_token;
        }

        // If a new token is needed or the page is refreshed, try to refresh the access token
        const accessToken = await this._refreshAccessToken();
        if (accessToken && accessToken.length > 0) {
            return accessToken;
        }

        // Otherwise start a login redirect and manage application state
        const error = await this._handleLoginRedirect();
        throw error;
    }

    /*
     * Handle the response from the authorization server
     */
    public async handleLoginResponse(): Promise<void> {
        return await this._handleLoginResponse();
    }

    /*
     * Redirect in order to log out at the authorization server and remove vendor cookies
     */
    public async startLogout(): Promise<void> {
        return await this._startLogout();
    }

    /*
     * Clear the current access token from storage to force a login
     */
    public async clearAccessToken(): Promise<void> {
        await this._userManager.removeUser();
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
     * Try to refresh the access token by manually triggering a silent token renewal on an iframe
     */
    private async _refreshAccessToken(): Promise<string> {

        const canRefresh = sessionStorage.getItem(this.canRefreshKey);
        if (canRefresh) {

            try {

                // Redirect on an iframe using the Authorization Server session cookie and prompt=none
                // A different scope could be requested by also supplying an object with a scope property
                const user = await this._userManager.signinSilent();
                if (user) {
                    return user.access_token;
                }
            } catch (e) {

                // A login required error means we need to do a full login redirect
                if (e.error !== ErrorCodes.loginRequired) {

                    // In this code sample we report any other errors, such as iframe timeouts
                    // An alternative approach would be to return an empty token instead
                    throw e;
                }
            }
        }

        return '';
    }

    /*
     * If there is no token but the page has previously loaded, we attempt a silent renewal on an iframe
     */
    private async _handleLoginRedirect(): Promise<UIError> {

        // Otherwise start a login redirect, by first storing the SPA's client side location
        // Note that some apps might also want to store form fields here
        const data = {
            hash: location.hash.length > 0 ? location.hash : '#',
        };

        try {
            // Start a login redirect
            await this._userManager.signinRedirect({state: JSON.stringify(data)});

            // Short circuit normal SPA page execution and do not try to render the view
            return ErrorHandler.getFromLoginRequired();

        } catch (e) {

            // Handle OAuth specific errors, such as those calling the metadata endpoint
            return ErrorHandler.getFromOAuthRequest(e, ErrorCodes.loginRequestFailed);
        }
    }

    /*
     * Handle the response from the authorization server
     */
    private async _handleLoginResponse(): Promise<void> {

        // If the page loads with a state query parameter we classify it as an OAuth response
        const urlData = urlparse(location.href, true);
        if (urlData.query && urlData.query.state) {

            try {

                // Handle the response
                const user = await this._userManager.signinRedirectCallback();

                // Get the hash URL before the redirect
                const data = JSON.parse(user.state);

                // Replace the browser location, to prevent tokens being available during back navigation
                history.replaceState({}, document.title, data.hash);

                // Also enable page refresh without logging in
                sessionStorage.setItem(this.canRefreshKey, 'true');

            } catch (e) {

                // Prevent back navigation problems after errors
                history.replaceState({}, document.title, '#');

                // Handle OAuth response errors
                throw ErrorHandler.getFromOAuthResponse(e, ErrorCodes.loginResponseFailed);
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

            // Remove the logged in session key
            sessionStorage.removeItem(this.canRefreshKey);

        } catch (e) {
            throw ErrorHandler.getFromOAuthRequest(e, ErrorCodes.logoutRequestFailed);
        }
    }

    /*
     * Plumbing to ensure that the this parameter is available in async callbacks
     */
    private _setupCallbacks(): void {
        this.clearAccessToken = this.clearAccessToken.bind(this);
        this.getAccessToken = this.getAccessToken.bind(this);
   }
}
