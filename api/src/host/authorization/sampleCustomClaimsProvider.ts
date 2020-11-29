import {Request} from 'express';
import {ApiClaims} from '../../logic/entities/apiClaims';
import {CustomClaimsProvider} from '../oauth/customClaimsProvider';

/*
 * An example of including domain specific details in cached claims
 */
export class SampleCustomClaimsProvider implements CustomClaimsProvider {

    /*
     * Add details from the API's own database
     */
    public async addCustomClaims(accessToken: string, request: Request, claims: ApiClaims): Promise<void> {

        // Look up the user id in the API's own database
        this._lookupDatabaseUserId(claims);

        // Look up the user id in the API's own data
        this._lookupAuthorizationData(claims);
    }

    /*
     * A real implementation would get the subject / email claims and find a match in the API's own data
     */
    private _lookupDatabaseUserId(claims: ApiClaims): void {
        claims.userDatabaseId = '10345';
    }

    /*
     * A real implementation would look up authorization data from the API's own data
     * This could include user roles and any data used for enforcing authorization rules
     */
    private _lookupAuthorizationData(claims: ApiClaims): void {

        // We use a coverage based authorization rule where the user can only use data for these regions
        claims.regionsCovered = ['Europe', 'USA'];
    }
}
