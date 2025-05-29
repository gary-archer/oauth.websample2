import NodeCache from 'node-cache';
import {ExtraValues} from '../../logic/entities/claims/extraValues.js';
import {OAuthConfiguration} from '../configuration/oauthConfiguration.js';

/*
 * A simple in memory cache for extra authorization values
 */
export class ClaimsCache {

    private readonly cache: NodeCache;
    private readonly defaultTimeToLiveSeconds: number;

    /*
     * Create the cache at application startup
     */
    /* eslint-disable @typescript-eslint/no-unused-vars */
    public constructor(configuration: OAuthConfiguration) {

        // Create the cache and set a default time to live in seconds
        this.defaultTimeToLiveSeconds = configuration.claimsCacheTimeToLiveMinutes * 60;
        this.cache = new NodeCache({
            stdTTL: this.defaultTimeToLiveSeconds,
        });

        // If required add debug output here to verify expiry occurs when expected
        this.cache.on('expired', (key: string, value: any) => {
            console.log(`Values for expired access token have been removed from the cache (hash: ${key})`);
        });
    }

    /*
     * Get authorization values from the cache or return null if not found
     */
    public getExtraUserValues(accessTokenHash: string): ExtraValues | null {

        // Get the token hash and see if it exists in the cache
        const values = this.cache.get<ExtraValues>(accessTokenHash);
        if (!values) {

            // If this is a new token and we need to do claims processing
            console.debug(`New values will be added to claims cache (hash: ${accessTokenHash})`);
            return null;
        }

        // Otherwise return cached values
        console.debug(`Found existing values in claims cache (hash: ${accessTokenHash})`);
        return values;
    }

    /*
     * Add authorization values to the cache until the token's time to live
     */
    public setExtraUserValues(accessTokenHash: string, values: ExtraValues, expiry: number): void {

        // Use the exp field returned from the token to work out the expiry time
        const epochSeconds = Math.floor((new Date() as any) / 1000);
        let secondsToCache = expiry - epochSeconds;
        if (secondsToCache > 0) {

            // Get the hash and output debug info
            console.debug(`Values to be cached will expire in ${secondsToCache} seconds (hash: ${accessTokenHash})`);

            // Do not exceed the maximum time we configured
            if (secondsToCache > this.defaultTimeToLiveSeconds) {
                secondsToCache = this.defaultTimeToLiveSeconds;
            }

            // Cache the token until the above time
            console.debug(`Adding values to claims cache for ${secondsToCache} seconds (hash: ${accessTokenHash})`);
            this.cache.set(accessTokenHash, values, secondsToCache);
        }
    }
}
