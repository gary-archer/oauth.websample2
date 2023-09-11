import {JWTPayload} from 'jose';
import {ExtraClaims} from '../../logic/entities/claims/extraClaims.js';
import {ClaimsReader} from './claimsReader.js';

/*
 * Add extra claims that you cannot, or do not want to, manage in the authorization server
 */
export class ExtraClaimsProvider {

    /*
     * Get claims from the API's own database based on the subkect claim in an AWS Cognito access token
     */
    public async lookupExtraClaims(jwtClaims: JWTPayload): Promise<ExtraClaims> {

        // A real API would use a database, but this API uses a mock implementation
        const subject = ClaimsReader.getClaim(jwtClaims.sub, 'sub') as string;
        if (subject === '77a97e5b-b748-45e5-bb6f-658e85b2df91') {

            // These claims are used for the guestadmin user account
            return new ExtraClaims('20116', 'admin', 'Global Manager', ['Europe', 'USA', 'Asia']);

        } else {

            // These claims are used for the guestuser user account
            return new ExtraClaims('10345', 'user', 'Regional Manager', ['USA']);
        }
    }
}
