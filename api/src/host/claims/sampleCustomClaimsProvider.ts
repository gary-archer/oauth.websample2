import {Request} from 'express';
import {ApiClaims} from '../../logic/entities/apiClaims';
import {CustomClaimsProvider} from './customClaimsProvider';

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
     */
    private _lookupAuthorizationData(claims: ApiClaims): void {

        // Our blog's code samples have two fixed users and use the below mock implementation:
        // - guestadmin@mycompany.com is an admin and sees all data
        // - guestuser@mycompany.com is not an admin and only sees data for their own region
        claims.isAdmin = claims.email.toLowerCase().indexOf('admin') !== -1;
        if (!claims.isAdmin) {
            claims.regionsCovered = ['USA'];
        }
    }
}
