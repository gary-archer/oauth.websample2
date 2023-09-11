import {ExtraClaims} from '../../logic/entities/claims/extraClaims.js';
import {UserInfoClaims} from '../../logic/entities/claims/userInfoClaims.js';

/*
 * Claims that are cached between requests
 */
export class CachedClaims {

    private _userInfoClaims: UserInfoClaims;
    private _extraClaims: ExtraClaims;

    public constructor(userInfoClaims: UserInfoClaims, extraClaims: ExtraClaims) {
        this._userInfoClaims = userInfoClaims;
        this._extraClaims = extraClaims;
    }

    public get userInfo(): UserInfoClaims {
        return this._userInfoClaims;
    }

    public get extra(): ExtraClaims {
        return this._extraClaims;
    }
}
