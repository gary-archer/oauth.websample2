import {CustomClaims} from './customClaims.js';
import {TokenClaims} from './tokenClaims.js';
import {UserInfoClaims} from './userInfoClaims.js';

/*
 * Our claims principal contains claims from the token and other sources
 */
export class ClaimsPrincipal {

    private _tokenClaims: TokenClaims;
    private _userInfoClaims: UserInfoClaims;
    private _customClaims: CustomClaims;

    public constructor(tokenClaims: TokenClaims, userInfoClaims: UserInfoClaims, customClaims: CustomClaims) {
        this._tokenClaims = tokenClaims;
        this._userInfoClaims = userInfoClaims;
        this._customClaims = customClaims;
    }

    public get token(): TokenClaims {
        return this._tokenClaims;
    }

    public get userInfo(): UserInfoClaims {
        return this._userInfoClaims;
    }

    public get custom(): CustomClaims {
        return this._customClaims;
    }
}
