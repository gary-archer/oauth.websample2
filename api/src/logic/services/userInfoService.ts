import {CustomClaims} from '../entities/claims/customClaims';
import {UserInfoClaims} from '../entities/claims/userInfoClaims';

/*
 * We can return any user data to our UI clients here, including both OAuth and non OAuth data
 */
export class UserInfoService {

    private readonly _userInfoClaims: UserInfoClaims;
    private readonly _customClaims: CustomClaims;

    public constructor(userInfoClaims: UserInfoClaims, customClaims: CustomClaims) {
        this._userInfoClaims = userInfoClaims;
        this._customClaims = customClaims;
    }

    public getUserInfo(): any {

        return {
            givenName: this._userInfoClaims.givenName,
            familyName: this._userInfoClaims.familyName,
            regions: this._customClaims.userRegions,
        };
    }
}
