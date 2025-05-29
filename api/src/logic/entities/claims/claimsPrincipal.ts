import {JWTPayload} from 'jose';
import {ExtraValues} from './extraValues.js';

/*
 * Our claims principal contains claims from the token and other authorization values
 */
export class ClaimsPrincipal {

    private jwtClaims: JWTPayload;
    private extraValues: ExtraValues;

    public constructor(jwtClaims: JWTPayload, extraValues: ExtraValues) {
        this.jwtClaims = jwtClaims;
        this.extraValues = extraValues;
    }

    public getJwt(): JWTPayload {
        return this.jwtClaims;
    }

    public getExtra(): ExtraValues {
        return this.extraValues;
    }
}
