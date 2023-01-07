import NodeCache from 'node-cache';
import {OAuthConfiguration} from '../configuration/oauthConfiguration.js';
import {CachedClaims} from './cachedClaims.js';

/*
 * A simple in memory claims cache for our API
 */
export class ClaimsCache {

    private readonly _cache: NodeCache;

    /*
     * Create the cache at application startup
     */
    /* eslint-disable @typescript-eslint/no-unused-vars */
    public constructor(configuration: OAuthConfiguration) {

        // Create the cache and set a default time to live in seconds
        const defaultExpirySeconds = configuration.claimsCacheTimeToLiveMinutes * 60;
        this._cache = new NodeCache({
            stdTTL: defaultExpirySeconds,
        });

        // If required add debug output here to verify expiry occurs when expected
        this._cache.on('expired', (key: string, value: any) => {
            console.log(`Expired token has been removed from the cache (hash: ${key})`);
        });
    }

    /*
     * Get claims from the cache or return null if not found
     */
    public async getClaimsForToken(accessTokenHash: string): Promise<CachedClaims | null> {

        // Get the token hash and see if it exists in the cache
        const claims = await this._cache.get<CachedClaims>(accessTokenHash);
        if (!claims) {

            // If this is a new token and we need to do claims processing
            console.debug(`New token will be added to claims cache (hash: ${accessTokenHash})`);
            return null;
        }

        // Otherwise return cached claims
        console.debug(`Found existing token in claims cache (hash: ${accessTokenHash})`);
        return claims;
    }

    /*
     * Add claims to the cache until the token's time to live
     */
    public async addClaimsForToken(accessTokenHash: string, claims: CachedClaims, expiry: number): Promise<void> {

        // Use the exp field returned from the token to work out the expiry time
        const epochSeconds = Math.floor((new Date() as any) / 1000);
        let secondsToCache = expiry - epochSeconds;
        if (secondsToCache > 0) {

            // Get the hash and output debug info
            console.debug(`Token to be cached will expire in ${secondsToCache} seconds (hash: ${accessTokenHash})`);

            // Do not exceed the maximum time we configured
            if (secondsToCache > this._cache.options.stdTTL!) {
                secondsToCache = this._cache.options.stdTTL!;
            }

            // Cache the token until the above time
            console.debug(`Adding token to claims cache for ${secondsToCache} seconds (hash: ${accessTokenHash})`);
            await this._cache.set(accessTokenHash, claims, secondsToCache);
        }
    }
}
