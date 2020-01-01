import {Client, IntrospectionResponse, Issuer, UserinfoResponse} from 'openid-client';
import {ApiClaims} from '../../logic/entities/apiClaims';
import {ClientError} from '../../logic/errors/clientError';
import {OAuthConfiguration} from '../configuration/oauthConfiguration';
import {ErrorHandler} from '../errors/errorHandler';

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
    public async authenticateAndSetClaims(accessToken: string, claims: ApiClaims): Promise<number> {

        // Our implementation introspects the token to get token claims
        const expiry = await this._introspectTokenAndSetTokenClaims(accessToken, claims);

        // It then adds user info claims
        await this._setCentralUserInfoClaims(accessToken, claims);

        // It then returns the token expiry as a cache time to live
        return expiry;
    }

    /*
     * Make a call to the introspection endpoint to read our token
     */
    private async _introspectTokenAndSetTokenClaims(accessToken: string, claims: ApiClaims): Promise<number> {

        // Create the Open Id Client
        const client = new this._issuer.Client({
            client_id: this._oauthConfig.clientId,
            client_secret: this._oauthConfig.clientSecret,
        });

        try {

            // Make an introspection request
            const tokenData: IntrospectionResponse = await client.introspect(accessToken);
            if (!tokenData.active) {
                throw ClientError.create401('Access token is expired and failed introspection');
            }

            // Read protocol claims and we will use the immutable user id as the subject claim
            const userId = this._getClaim((tokenData as any).uid, 'uid');
            const clientId = this._getClaim(tokenData.client_id, 'client_id');
            const scope = this._getClaim(tokenData.scope, 'scope');

            // Update the claims object then return the expiry claim
            claims.setTokenInfo(userId, clientId, scope.split(' '));

            // Return the token expiry
            return this._getClaim((tokenData as any).exp, 'exp');

        } catch (e) {

            // Report introspection errors clearly
            throw ErrorHandler.fromIntrospectionError(e, (this._issuer as any).introspection_endpoint);
        }
    }

    /*
     * We will read central user data by calling the Open Id Connect User Info endpoint
     * For many companies it may instead make sense to call a Central User Info API
     */
    private async _setCentralUserInfoClaims(accessToken: string, claims: ApiClaims): Promise<void> {

        // Create the Open Id Client
        const client = new this._issuer.Client({
            client_id: this._oauthConfig.clientId,
        });

        try {

            // Make a user info request
            const userInfo: UserinfoResponse = await client.userinfo(accessToken);

            // Read user info claims
            const givenName = this._getClaim(userInfo.given_name, 'given_name');
            const familyName = this._getClaim(userInfo.family_name, 'family_name');
            const email = this._getClaim(userInfo.email, 'email');

            // Update the claims object
            claims.setCentralUserInfo(givenName, familyName, email);

        } catch (e) {

            // Report user info errors clearly
            throw ErrorHandler.fromUserInfoError(e, this._issuer.metadata.userinfo_endpoint!!);
        }
    }

    /*
     * Sanity checks when receiving claims to avoid failing later with a cryptic error
     */
    private _getClaim(claim: string | undefined, name: string): any {

        if (!claim) {
            throw ErrorHandler.fromMissingClaim(name);
        }

        return claim;
    }

    /*
     * Plumbing to ensure that the this parameter is available in async callbacks
     */
    private _setupCallbacks(): void {
        this.authenticateAndSetClaims = this.authenticateAndSetClaims.bind(this);
    }
}
