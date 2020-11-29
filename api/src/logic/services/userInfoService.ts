import {ApiClaims} from '../entities/apiClaims';
import {UserInfoClaims} from '../entities/userInfoClaims';

/*
 * Our user info service runs after claims handling has completed
 */
export class UserInfoService {

    private readonly _claims: ApiClaims;

    public constructor(claims: ApiClaims) {
        this._claims = claims;
    }

    /*
     * We can return any user info to the API, not just data from tokens
     */
    public getUserClaims(): UserInfoClaims {

        return {
            givenName: this._claims.givenName,
            familyName: this._claims.familyName,
            email: this._claims.email,
        };
    }
}
