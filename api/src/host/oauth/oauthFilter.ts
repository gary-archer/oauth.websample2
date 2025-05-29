import {createHash} from 'crypto';
import {Request} from 'express';
import {ClaimsPrincipal} from '../../logic/entities/claims/claimsPrincipal.js';
import {ClientError} from '../../logic/errors/clientError.js';
import {ClaimsCache} from '../claims/claimsCache.js';
import {ExtraValuesProvider} from '../claims/extraValuesProvider.js';
import {AccessTokenValidator} from './accessTokenValidator.js';

/*
 * The entry point for the processing to validate tokens and look up claims
 * This approach demonstrates one way to provide extensible authorization values to the API's business logic
 */
export class OAuthFilter {

    private readonly cache: ClaimsCache;
    private readonly accessTokenValidator: AccessTokenValidator;
    private readonly extraValuesProvider: ExtraValuesProvider;

    public constructor(
        cache: ClaimsCache,
        accessTokenValidator: AccessTokenValidator,
        extraValuesProvider: ExtraValuesProvider) {

        this.cache = cache;
        this.accessTokenValidator = accessTokenValidator;
        this.extraValuesProvider = extraValuesProvider;
    }

    /*
     * Authorize a request and set up the claims principal
     */
    public async authorizeRequestAndGetClaims(request: Request): Promise<ClaimsPrincipal> {

        // First read the access token
        const accessToken = this.readAccessToken(request);
        if (!accessToken) {
            throw ClientError.create401('No access token was supplied in the bearer header');
        }

        // On every API request we validate the JWT, in a zero trust manner
        const tokenClaims = await this.accessTokenValidator.execute(accessToken);

        // Return extra authorization values immediately if they are cached
        const accessTokenHash = createHash('sha256').update(accessToken).digest('hex');
        let extraValues = this.cache.getExtraUserValues(accessTokenHash);
        if (extraValues) {
            return new ClaimsPrincipal(tokenClaims, extraValues);
        }

        // Look up extra authorization values not in the JWT access token when the token is first received
        extraValues = await this.extraValuesProvider.lookupExtraValues(tokenClaims);

        // Cache the extra values for subsequent requests with the same access token
        this.cache.setExtraUserValues(accessTokenHash, extraValues, tokenClaims.exp || 0);

        // Return the final object used by the API's authorization logic
        return new ClaimsPrincipal(tokenClaims, extraValues);
    }

    /*
     * Try to read the token from the authorization header
     */
    private readAccessToken(request: Request): string | null {

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
