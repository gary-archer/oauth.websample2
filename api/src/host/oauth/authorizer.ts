import {Request} from 'express';
import hasher from 'js-sha256';
import {ClaimsPrincipal} from '../../logic/entities/claims/claimsPrincipal.js';
import {ClientError} from '../../logic/errors/clientError.js';
import {CachedClaims} from '../claims/cachedClaims.js';
import {ClaimsCache} from '../claims/claimsCache.js';
import {CustomClaimsProvider} from '../claims/customClaimsProvider.js';
import {Authenticator} from './authenticator.js';

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
     * Authorize a request and set up the claims principal, including domain specific claims
     */
    public async authorizeRequestAndGetClaims(request: Request): Promise<ClaimsPrincipal> {

        // First read the access token
        const accessToken = this._readAccessToken(request);
        if (!accessToken) {
            throw ClientError.create401('No access token was supplied in the bearer header');
        }

        // On every API request we validate the JWT, in a zero trust manner
        const tokenClaims = await this._authenticator.validateToken(accessToken);

        // Return cached claims immediately if found
        const accessTokenHash = hasher.sha256(accessToken);
        const cachedClaims = await this._cache.getClaimsForToken(accessTokenHash);
        if (cachedClaims) {
            return new ClaimsPrincipal(tokenClaims, cachedClaims.userInfo, cachedClaims.custom);
        }

        // With Cognito the API looks up extra claims when the access token is first received
        const userInfo = await this._authenticator.getUserInfo(accessToken);
        const customClaims = await this._customClaimsProvider.getCustomClaims(tokenClaims, userInfo);
        const claimsToCache = new CachedClaims(userInfo, customClaims);

        // Cache the extra claims for subsequent requests with the same access token
        await this._cache.addClaimsForToken(accessTokenHash, claimsToCache, tokenClaims.expiry);
        return new ClaimsPrincipal(tokenClaims, claimsToCache.userInfo, claimsToCache.custom);
    }

    /*
     * Try to read the token from the authorization header
     */
    private _readAccessToken(request: Request): string | null {

        const authorizationHeader = request.header('authorization');
        if (authorizationHeader) {
            const parts = authorizationHeader.split(' ');
            if (parts.length === 2 && parts[0].toLowerCase() === 'bearer') {
                return parts[1];
            }
        }

        return null;
    }
}
