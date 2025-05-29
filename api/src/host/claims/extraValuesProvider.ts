import {JWTPayload} from 'jose';
import {ExtraValues} from '../../logic/entities/claims/extraValues.js';
import {ClaimsReader} from './claimsReader.js';

/*
 * Add extra values that you cannot, or do not want to, manage in the authorization server
 */
export class ExtraValuesProvider {

    /*
     * Get authorization values from the API's own database based on the subkect claim in an AWS Cognito access token
     */
    public async lookupExtraValues(jwtClaims: JWTPayload): Promise<ExtraValues> {

        // A real API would use a database, but this API uses a mock implementation
        const managerId = ClaimsReader.getStringClaim(jwtClaims, 'manager_id');
        if (managerId === '20116') {

            // These values are used for the guestadmin@example.com user account
            return new ExtraValues('Global Manager', ['Europe', 'USA', 'Asia']);

        } else if (managerId == '10345') {

            // These values are used for the guestuser@example.com user account
            return new ExtraValues('Regional Manager', ['USA']);

        } else {

            // Use empty values for unrecognized users
            return new ExtraValues('', []);
        }
    }
}
