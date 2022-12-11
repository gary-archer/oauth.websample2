import {CustomClaims} from '../../logic/entities/claims/customClaims';
import {TokenClaims} from '../../logic/entities/claims/tokenClaims';
import {UserInfoClaims} from '../../logic/entities/claims/userInfoClaims';
import {CustomClaimsProvider} from './customClaimsProvider';

/*
 * An example of including domain specific details in cached claims
 */
export class SampleCustomClaimsProvider implements CustomClaimsProvider {

    /*
     * Add domain specific claims from the API's own database
     */
    public async getCustomClaims(token: TokenClaims, userInfo: UserInfoClaims): Promise<CustomClaims> {

        const isAdmin = userInfo.email.toLowerCase().indexOf('admin') !== -1;
        if (isAdmin) {

            // For admin users we hard code this user id, assign a role of 'admin' and grant access to all regions
            // The CompanyService class will use these claims to return all transactions data
            return new CustomClaims('20116', 'admin', ['Europe', 'USA', 'Asia']);

        } else {

            // For other users we hard code this user id, assign a role of 'user' and grant access to only one region
            // The CompanyService class will use these claims to return only transactions for the US region
            return new CustomClaims('10345', 'user', ['USA']);
        }
    }
}
