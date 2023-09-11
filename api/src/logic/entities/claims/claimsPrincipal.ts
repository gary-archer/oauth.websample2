import {JWTPayload} from 'jose';
import {ExtraClaims} from './extraClaims.js';
import {UserInfoClaims} from './userInfoClaims.js';

/*
 * Our claims principal contains claims from the token and other sources
 */
export class ClaimsPrincipal {

    private _tokenClaims: JWTPayload;
    private _userInfoClaims: UserInfoClaims;
    private _extraClaims: ExtraClaims;

    public constructor(tokenClaims: JWTPayload, userInfoClaims: UserInfoClaims, extraClaims: ExtraClaims) {
        this._tokenClaims = tokenClaims;
        this._userInfoClaims = userInfoClaims;
        this._extraClaims = extraClaims;
    }

    public get token(): JWTPayload {
        return this._tokenClaims;
    }

    public get userInfo(): UserInfoClaims {
        return this._userInfoClaims;
    }

    public get extra(): ExtraClaims {
        return this._extraClaims;
    }
}
