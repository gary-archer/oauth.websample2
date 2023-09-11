import {createHash} from 'crypto';
import {Request} from 'express';
import {ClaimsPrincipal} from '../../logic/entities/claims/claimsPrincipal.js';
import {ClientError} from '../../logic/errors/clientError.js';
import {CachedClaims} from '../claims/cachedClaims.js';
import {ClaimsCache} from '../claims/claimsCache.js';
import {ExtraClaimsProvider} from '../claims/extraClaimsProvider.js';
import {Authenticator} from './authenticator.js';

/*
 * The entry point for the processing to validate tokens and lookup claims
 * Our approach provides extensible claims to our API and enables good performance
 */
export class Authorizer {

    private readonly _cache: ClaimsCache;
    private readonly _authenticator: Authenticator;
    private readonly _extraClaimsProvider: ExtraClaimsProvider;

    public constructor(
        cache: ClaimsCache,
        authenticator: Authenticator,
        extraClaimsProvider: ExtraClaimsProvider) {

        this._cache = cache;
        this._authenticator = authenticator;
        this._extraClaimsProvider = extraClaimsProvider;
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
        const accessTokenHash = createHash('sha256').update(accessToken).digest('hex');
        const cachedClaims = await this._cache.getClaimsForToken(accessTokenHash);
        if (cachedClaims) {
            return new ClaimsPrincipal(tokenClaims, cachedClaims.userInfo, cachedClaims.extra);
        }

        // Look up extra claims not in the JWT access token when the token is first received
        const userInfo = await this._authenticator.getUserInfo(accessToken);
        const extraClaims = await this._extraClaimsProvider.lookupExtraClaims(tokenClaims);
        const claimsToCache = new CachedClaims(userInfo, extraClaims);

        // Cache the extra claims for subsequent requests with the same access token
        await this._cache.addClaimsForToken(accessTokenHash, claimsToCache, tokenClaims.exp!);

        // Return the final claims used by the API's authorization logic
        return new ClaimsPrincipal(tokenClaims, claimsToCache.userInfo, claimsToCache.extra);
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
