import {Request} from 'express';
import {Client, custom, IntrospectionResponse, Issuer, UserinfoResponse} from 'openid-client';
import {ApiClaims} from '../../logic/entities/apiClaims';
import {ClientError} from '../../logic/errors/clientError';
import {OAuthConfiguration} from '../configuration/oauthConfiguration';
import {ErrorHandler} from '../errors/errorHandler';
import {HttpProxy} from '../utilities/httpProxy';

/*
 * The entry point for OAuth related operations
 */
export class Authenticator {

    private readonly _oauthConfig: OAuthConfiguration;
    private readonly _issuer: Issuer<Client>;

    public constructor(oauthConfig: OAuthConfiguration, issuer: Issuer<Client>) {
        this._oauthConfig = oauthConfig;
        this._issuer = issuer;
        this._setupCallbacks();
    }

    /*
     * Our form of authentication performs introspection and user info lookup
     */
    public async validateTokenAndGetClaims(accessToken: string, request: Request, claims: ApiClaims): Promise<void> {

        // Our implementation introspects the token to get token claims
        await this._introspectTokenAndGetTokenClaims(accessToken, claims);

        // It then adds user info claims
        await this._getUserInfoClaims(accessToken, claims);
    }

    /*
     * Make a call to the introspection endpoint to read our token
     */
    private async _introspectTokenAndGetTokenClaims(accessToken: string, claims: ApiClaims): Promise<void> {

        // Create the Open Id Client
        const client = new this._issuer.Client({
            client_id: this._oauthConfig.clientId,
            client_secret: this._oauthConfig.clientSecret,
        });
        client[custom.http_options] = HttpProxy.getOptions;

        try {

            // Make an introspection request
            const tokenData: IntrospectionResponse = await client.introspect(accessToken);
            if (!tokenData.active) {
                throw ClientError.create401('Access token is expired and failed introspection');
            }

            // Read protocol claims
            const userId = this._getClaim((tokenData as any).sub, 'sub');
            const clientId = this._getClaim(tokenData.client_id, 'client_id');
            const scope = this._getClaim(tokenData.scope, 'scope');
            const expiry = parseInt(this._getClaim((tokenData as any).exp, 'exp'), 10);

            // Make sure the client is allowed to call this API
            const scopes = scope.split(' ');
            if (!scopes.find((s) => s === this._oauthConfig.requiredScope)) {
                throw ClientError.create401('Access token does not have a valid scope for this API');
            }

            // Update the claims object then return the expiry claim
            claims.setTokenInfo(userId, clientId, scopes, expiry);

        } catch (e) {

            // Report introspection errors clearly
            throw ErrorHandler.fromIntrospectionError(e, (this._issuer as any).introspection_endpoint);
        }
    }

    /*
     * We will read central user data by calling the Open Id Connect User Info endpoint
     * For many companies it may instead make sense to call a Central User Info API
     */
    private async _getUserInfoClaims(accessToken: string, claims: ApiClaims): Promise<void> {

        // Create the Open Id Client
        const client = new this._issuer.Client({
            client_id: this._oauthConfig.clientId,
        });
        client[custom.http_options] = HttpProxy.getOptions;

        try {

            // Make a user info request
            const userInfo: UserinfoResponse = await client.userinfo(accessToken);

            // Read user info claims
            const givenName = this._getClaim(userInfo.given_name, 'given_name');
            const familyName = this._getClaim(userInfo.family_name, 'family_name');
            const email = this._getClaim(userInfo.email, 'email');

            // Update the claims object
            claims.setUserInfo(givenName, familyName, email);

        } catch (e) {

            // Report user info errors clearly
            throw ErrorHandler.fromUserInfoError(e, this._issuer.metadata.userinfo_endpoint!);
        }
    }

    /*
     * Sanity checks when receiving claims to avoid failing later with a cryptic error
     */
    private _getClaim(claim: string | undefined, name: string): string {

        if (!claim) {
            throw ErrorHandler.fromMissingClaim(name);
        }

        return claim;
    }

    /*
     * Plumbing to ensure that the this parameter is available in async callbacks
     */
    private _setupCallbacks(): void {
        this.validateTokenAndGetClaims = this.validateTokenAndGetClaims.bind(this);
    }
}
