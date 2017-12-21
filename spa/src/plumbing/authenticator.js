'use strict';
import {UserManager as OidcUserManager} from 'oidc-client';
import {Log as OidcLog} from 'oidc-client';
import Crypto from 'crypto';
import OAuthLogger from 'oauthLogger';
import ErrorHandler from 'errorHandler';

/*
 * The entry point for initiating login and token requests
 */
export default class Authenticator {
    
    /*
     * Class setup
     */
    constructor(config) {

        // Create OIDC settings from our application configuration
        let settings = {
            authority: config.authority,
            client_id: config.client_id,
            redirect_uri: config.redirect_uri,
            scope: config.scope,
            
            // Initially we'll use this flow for simplicity
            response_type: 'token',
            
            // Disable these features which we are not using
            loadUserInfo: false,
            monitorSession: false,
            automaticSilentRenew: false
        };
        
        // Initialise OIDC
        this._userManager = new OidcUserManager(settings);
        OAuthLogger.initialize(OidcLog.NONE);
        this._setupCallbacks();
    }
    
    /*
     * Clear the current access token from storage
     */
    clearAccessToken() {

        return this._userManager.getUser()
            .then(user => {

                if (!user) {
                    return Promise.resolve(); 
                }

                user.access_token = null;
                this._userManager.storeUser(user);
            });
    }
    
    /*
     * Get an access token and login if required
     */
    getAccessToken() {

        return this._userManager.getUser()
            .then(user => {

                // See if a token exists in HTML5 storage
                if (user && user.access_token) {
                    return user.access_token;
                }

                // Store the SPA's client side location
                let data = {
                    hash: location.hash.length > 0 ? location.hash : '#'
                };

                // Use the lower level method to get the URL
                return this._userManager.createSigninRequest({state: JSON.stringify(data)})
                    .then(request => {

                        // Okta requires a nonce parameter with response_type=token so generate one before redirecting
                        let nonce = this._generateNonce();
                        request.url += `&nonce=${nonce}`;
                        location.replace(request.url);

                        // Short circuit page processing
                        return Promise.reject(ErrorHandler.getNonError());
                    })
                    .catch(e => {

                        // Handle OAuth specific errors here, such as those calling the metadata endpoint
                        return Promise.reject(ErrorHandler.getFromOAuthSignInRequest(e));
                    });
                });
    }
    
    /*
     * Handle the response from logging in
     */
    handleLoginResponse() {
        
        if (location.hash.indexOf('state') === -1) {
            return Promise.resolve();
        }
        
        return this._userManager.signinRedirectCallback()
            .then(response => {

                // Restore the SPA's client side location before returning
                let data = JSON.parse(response.state);
                location.replace(location.pathname + data.hash);
                return Promise.resolve();
            })
            .catch(e => {
            
                // Handle OAuth specific errors here
                return Promise.reject(ErrorHandler.getFromOAuthSignInResponse(e));
            });
    }

    /*
     * Generate a nonce since Okta requires one with response type=token but OIDC Client does not supply one
     */
    _generateNonce() {
        return Crypto.randomBytes(16)
            .toString('base64')
            .replace(/\+/g, '-')
            .replace(/\//g, '_')
            .replace(/=/g, '');
    }
    
    /*
     * Plumbing to ensure that the this parameter is available in async callbacks
     */
    _setupCallbacks() {
        this.clearAccessToken = this.clearAccessToken.bind(this);
        this.getAccessToken = this.getAccessToken.bind(this);
   }
}