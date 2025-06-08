import {JWTPayload} from 'jose';
import {ExtraClaims} from '../../logic/entities/claims/extraClaims.js';
import {ClaimsReader} from './claimsReader.js';

/*
 * Add extra claims that you cannot, or do not want to, manage in the authorization server
 */
export class ExtraClaimsProvider {

    /*
     * Given a manager ID look up extra values from the API's own data
     */
    public async lookupExtraClaims(jwtClaims: JWTPayload): Promise<ExtraClaims> {

        // A real API would use a database, but this API uses a mock implementation
        const managerId = ClaimsReader.getStringClaim(jwtClaims, 'manager_id');
        if (managerId === '20116') {

            // These claims are used for the guestadmin@example.com user account
            return ExtraClaims.create('Global Manager', ['Europe', 'USA', 'Asia']);

        } else if (managerId == '10345') {

            // These claims are used for the guestuser@example.com user account
            return ExtraClaims.create('Regional Manager', ['USA']);

        } else {

            // Use empty claims for unrecognized users
            return new ExtraClaims();
        }
    }
}
