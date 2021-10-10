import axios, {AxiosRequestConfig} from 'axios';
import {createRemoteJWKSet} from 'jose/jwks/remote';
import {jwtVerify} from 'jose/jwt/verify';
import {URL} from 'url';
import {TokenClaims} from '../../logic/entities/claims/tokenClaims';
import {UserInfoClaims} from '../../logic/entities/claims/userInfoClaims';
import {ClientError} from '../../logic/errors/clientError';
import {OAuthConfiguration} from '../configuration/oauthConfiguration';
import {ErrorFactory} from '../errors/errorFactory';
import {HttpProxy} from '../utilities/httpProxy';

/*
 * The entry point for OAuth related operations
 */
export class Authenticator {

    private readonly _configuration: OAuthConfiguration;
    private readonly _httpProxy: HttpProxy;

    public constructor(configuration: OAuthConfiguration, httpProxy: HttpProxy) {
        this._configuration = configuration;
        this._httpProxy = httpProxy;
    }

    /*
     * Make a call to the introspection endpoint to read our token
     */
    public async validateToken(accessToken: string): Promise<TokenClaims> {

        try {

            // Download token signing public keys from the Authorization Server, which are then cached
            const jwksOptions = {
                agent: this._httpProxy.agent,
            };
            const remoteJwkSet = createRemoteJWKSet(new URL(this._configuration.jwksEndpoint), jwksOptions);

            // Perform the JWT validation according to best practices
            const options = {
                algorithms: [this._configuration.algorithm],
                issuer: this._configuration.issuer,
                audience: this._configuration.audience,
            };
            const result = await jwtVerify(accessToken, remoteJwkSet, options);

            // Read protocol claims
            const userId = this._getClaim(result.payload.sub, 'sub');
            const scope = this._getClaim(result.payload['scope'] as string, 'scope');
            const expiry = result.payload.exp!;

            // Return the claims object
            return new TokenClaims(userId, scope.split(' '), expiry);

        } catch (e: any) {

            // Generic errors are returned when the JWKS download fails
            if (e.code === 'ERR_JOSE_GENERIC') {
                throw ErrorFactory.fromJwksDownloadError(e, this._configuration.jwksEndpoint);
            }

            // Otherwise return a 401 error, such as when a JWT with an invalid 'kid' value is supplied
            let details = 'JWT verification failed';
            if (e.message) {
                details += ` : ${e.message}`;
            }

            throw ClientError.create401(details);
        }
    }

    /*
     * Perform OAuth user info lookup when required
     */
    public async getUserInfo(accessToken: string): Promise<UserInfoClaims> {

        try {

            const options = {
                url: this._configuration.userInfoEndpoint,
                method: 'POST',
                headers: {
                    'content-type': 'application/x-www-form-urlencoded',
                    'accept': 'application/json',
                    'Authorization': `Bearer ${accessToken}`,
                },
                httpsAgent: this._httpProxy.agent,
            };

            const response = await axios.request(options as AxiosRequestConfig);
            const userInfo = response.data;

            const givenName = this._getClaim(userInfo.given_name, 'given_name');
            const familyName = this._getClaim(userInfo.family_name, 'family_name');
            const email = this._getClaim(userInfo.email, 'email');
            return new UserInfoClaims(givenName, familyName, email);

        } catch (e) {

            // Report user info errors clearly
            throw ErrorFactory.fromUserInfoError(e, this._configuration.userInfoEndpoint);
        }
    }

    /*
     * Sanity checks when receiving claims to avoid failing later with a cryptic error
     */
    private _getClaim(claim: string | undefined, name: string): string {

        if (!claim) {
            throw ErrorFactory.fromMissingClaim(name);
        }

        return claim;
    }
}
