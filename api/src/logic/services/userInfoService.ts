import {ClaimsPrincipal} from '../entities/claims/claimsPrincipal.js';

/*
 * The SPA gets OAuth user info from the authorization server
 * It gets extra user attributes from the business data by calling the API
 */
export class UserInfoService {

    private readonly _claims: ClaimsPrincipal;

    public constructor(claims: ClaimsPrincipal) {
        this._claims = claims;
    }

    public getUserInfo(): any {

        return {
            title: this._claims.extra.title,
            regions: this._claims.extra.regions,
        };
    }
}
