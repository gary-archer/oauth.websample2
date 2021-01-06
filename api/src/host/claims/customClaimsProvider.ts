import {Request} from 'express';
import {ApiClaims} from '../../logic/entities/apiClaims';

/*
 * An interface for providing custom claims that the business logic can implement
 */
export interface CustomClaimsProvider {

    addCustomClaims(accessToken: string, request: Request, claims: ApiClaims): Promise<void>;
}
