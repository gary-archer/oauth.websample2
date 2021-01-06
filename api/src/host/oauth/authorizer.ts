import {Request} from 'express';
import hasher from 'js-sha256';
import {ApiClaims} from '../../logic/entities/apiClaims';
import {ClientError} from '../../logic/errors/clientError';
import {ClaimsCache} from '../claims/claimsCache';
import {CustomClaimsProvider} from '../claims/customClaimsProvider';
import {Authenticator} from './authenticator';

/*
 * The entry point for the processing to validate tokens and lookup claims
 * Our approach provides extensible claims to our API and enables good performance
 */
export class Authorizer {

    private readonly _cache: ClaimsCache;
    private readonly _authenticator: Authenticator;
    private readonly _customClaimsProvider: CustomClaimsProvider;

    public constructor(
        cache: ClaimsCache,
        authenticator: Authenticator,
        customClaimsProvider: CustomClaimsProvider) {

        this._cache = cache;
        this._authenticator = authenticator;
        this._customClaimsProvider = customClaimsProvider;
    }

    /*
     * Authorize a request and return claims on success, which can then be injected into business logic
     */
    public async authorizeRequestAndGetClaims(request: Request): Promise<ApiClaims> {

        // First read the access token
        const accessToken = this._readAccessToken(request);
        if (!accessToken) {
            throw ClientError.create401('No access token was supplied in the bearer header');
        }

        // Return cached claims immediately if found
        const accessTokenHash = hasher.sha256(accessToken);
        const cachedClaims = await this._cache.getClaimsForToken(accessTokenHash);
        if (cachedClaims) {
            return cachedClaims;
        }

        // Otherwise create new claims which we will populate
        const claims = new ApiClaims();

        // Do the work for token introspection and user info lookup
        await this._authenticator.validateTokenAndGetClaims(accessToken, request, claims);

        // Look up any product specific custom claims if required
        await this._customClaimsProvider.addCustomClaims(accessToken, request, claims);

        // Cache the claims against the token hash until the token's expiry time
        await this._cache.addClaimsForToken(accessTokenHash, claims);

        // Return the new claims
        return claims;
    }

    /*
     * Try to read the token from the authorization header
     */
    private _readAccessToken(request: Request): string | null {

        const authorizationHeader = request.header('authorization');
        if (authorizationHeader) {
            const parts = authorizationHeader.split(' ');
            if (parts.length === 2 && parts[0] === 'Bearer') {
                return parts[1];
            }
        }

        return null;
    }
}
