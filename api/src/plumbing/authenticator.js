'use strict';
const OpenIdClient = require('openid-client');
const HttpsProxyAgent = require('https-proxy-agent');
const ApiLogger = require('./apiLogger');
const ErrorHandler = require('./errorHandler');

/*
 * This handles debugging to Fiddler or Charles so that we can view requests to Okta
 * I am currently having to use the 1.17.0 openid-client due to a got library issue described here
 * https://github.com/sindresorhus/got/issues/427
 */
if (process.env.HTTPS_PROXY) {
    OpenIdClient.Issuer.defaultHttpOptions = {
        agent: new  HttpsProxyAgent(process.env.HTTPS_PROXY)
    };
}

/*
 * An issuer object containing metadata, which is read the first time only
 */
let issuer = null;

/*
 * A class to handle getting claims for our API
 */
class Authenticator {
    
    /*
     * Class setup
     */
    constructor(oauthConfig, accessToken) {
        
        this._oauthConfig = oauthConfig;
        this._accessToken = accessToken;
        this._setupCallbacks();
    }
    
    /*
     * When we receive a new token, look up the data
     */
    validateTokenAndLookupClaims() {

        return this._getMetadata()
            .then(this._readTokenData)
            .then(this._readCentralUserData)
            .then(this._readProductClaims);
    }

    /*
     * Make a call to the metadata endpoint for the first API request
     */
    _getMetadata() {

        if (issuer !== null) {
            return Promise.resolve();
        }

        return OpenIdClient.Issuer.discover(this._oauthConfig.authority)
            .then(data => {

                issuer = data;
                return Promise.resolve();
            })
            .catch(e => {

                return Promise.reject(ErrorHandler.fromMetadataError(e, this._oauthConfig.authority));
            });
    }
    
    /*
     * Make a call to the introspection endpoint to read our token
     */
    _readTokenData() {

        // Create the Authorization Server client
        let client = new issuer.Client({
            client_id: this._oauthConfig.client_id,
            client_secret: this._oauthConfig.client_secret
        });

        // Use it to do the introspection
        return client.introspect(this._accessToken)
            .then(data => {

                if (!data.active) {

                    // Return a 401 if the token is no longer active
                    return Promise.reject(ErrorHandler.getInvalidTokenError());
                }
                else {
                    
                     // Otherwise return the data from the token with protocol claims removed
                    let tokenData = {
                        exp: data.exp,
                        claims: {
                            userId: data.sub,
                            clientId: data.cid,
                            scope: data.scope
                        }
                    };
                    
                    // Provide claims to the API's business operation
                    return Promise.resolve(tokenData);
                }
            })
            .catch(error => {

                // Return a 500 if there is an unexpected failure
                return Promise.reject(ErrorHandler.fromIntrospectionError(error, issuer.introspection_endpoint));
            });
    }
    
    /*
     * We will read central user data by calling the Open Id Connect endpoint, but a custom API could also be used
     */
    _readCentralUserData(tokenData) {
        
        // Create the Authorization Server client
        let client = new issuer.Client({
            client_id: this._oauthConfig.client_id,
            client_secret: this._oauthConfig.client_secret
        });

        // Use it to get user info
        return client.userinfo(this._accessToken)
            .then(userInfo => {

                // Extend token data with central user info
                tokenData.claims.given_name = userInfo.given_name;
                tokenData.claims.family_name = userInfo.family_name;
                tokenData.claims.email = userInfo.email;
            
                // Return the result
                return Promise.resolve(tokenData);
            })
            .catch(error => {

                // Return a 500 if there is an unexpected failure
                return Promise.reject(ErrorHandler.fromUserInfoError(error, issuer.userinfo_endpoint));
            });
    }
    
    /*
     * We could read product claims here if needed, and include them in the claims cache
     */
    _readProductClaims(userData) {
        return Promise.resolve(userData); 
    }
    
    /*
     * Plumbing to ensure that the this parameter is available in async callbacks
     */
    _setupCallbacks() {
        this._readTokenData = this._readTokenData.bind(this);
        this._readCentralUserData = this._readCentralUserData.bind(this);
        this._readProductClaims = this._readProductClaims.bind(this);
    }
}

module.exports = Authenticator;