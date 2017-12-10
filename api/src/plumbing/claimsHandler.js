/*
 * Token validation
 */

'use strict';
const Authenticator = require('./authenticator');
const ClaimsCache = require('./claimsCache');
const ErrorHandler = require('./errorHandler');

/*
 * An entry point class for claims processing
 */
class ClaimsHandler {
    
    /*
     * Class setup
     */
    constructor(oauthConfig) {
        this._oauthConfig = oauthConfig;
    }

    /*
     * Handle validating an access token and updating the claims cache
     */
    validateTokenAndGetClaims(authorizationHeader) {
        
        // Read the access token from the header
        let accessToken = this._readBearerToken(authorizationHeader);
        if (!accessToken) {
            return Promise.reject(ErrorHandler.getNoTokenError());
        }
        
        // Bypass validation and use cached results if they exist
        let cachedClaims = ClaimsCache.getClaimsForToken(accessToken);
        if (cachedClaims !== null) {
            return Promise.resolve(cachedClaims);
        }

        // Otherwise create a class to do authentication processing
        let authenticator = new Authenticator(this._oauthConfig, accessToken);
        return authenticator.validateTokenAndLookupClaims()
            .then(data => {

                // Save claims to the cache until the token expiry time
                ClaimsCache.addClaimsForToken(accessToken, data.exp, data.claims);
                return Promise.resolve(data.claims);
            });
    }
    
    /*
     * Try to read the token from the authorization header
     */
    _readBearerToken(authorizationHeader) {
    
        if (authorizationHeader) {
            let parts = authorizationHeader.split(' ');
            if (parts.length === 2 && parts[0] === 'Bearer') {
                return parts[1];
            }
        }

        return null;
    }
}

module.exports = ClaimsHandler;