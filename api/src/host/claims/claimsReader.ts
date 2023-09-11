import {ErrorFactory} from '../errors/errorFactory.js';

/*
 * A utility to read claims defensively
 */
export class ClaimsReader {

    /*
     * Sanity checks when receiving claims to avoid failing later with a cryptic error
     */
    public static getClaim(claim: string | undefined, name: string): string {

        if (!claim) {
            throw ErrorFactory.fromMissingClaim(name);
        }

        return claim;
    }
}
