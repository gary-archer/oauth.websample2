import {CustomClaims} from '../../logic/entities/claims/customClaims.js';
import {TokenClaims} from '../../logic/entities/claims/tokenClaims.js';
import {UserInfoClaims} from '../../logic/entities/claims/userInfoClaims.js';

/*
 * An interface for providing custom claims from the API's own data
 */
export interface CustomClaimsProvider {
    getCustomClaims(token: TokenClaims, userInfo: UserInfoClaims): Promise<CustomClaims>;
}
