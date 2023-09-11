import axios, {AxiosRequestConfig} from 'axios';
import {JWTPayload, JWTVerifyOptions, jwtVerify} from 'jose';
import {UserInfoClaims} from '../../logic/entities/claims/userInfoClaims.js';
import {ClientError} from '../../logic/errors/clientError.js';
import {ErrorCodes} from '../../logic/errors/errorCodes.js';
import {ClaimsReader} from '../claims/claimsReader.js';
import {OAuthConfiguration} from '../configuration/oauthConfiguration.js';
import {ErrorFactory} from '../errors/errorFactory.js';
import {HttpProxy} from '../utilities/httpProxy.js';
import {JwksRetriever} from './jwksRetriever.js';

/*
 * The entry point for OAuth related operations
 */
export class Authenticator {

    private readonly _configuration: OAuthConfiguration;
    private readonly _jwksRetriever: JwksRetriever;
    private readonly _httpProxy: HttpProxy;

    public constructor(configuration: OAuthConfiguration, jwksRetriever: JwksRetriever, httpProxy: HttpProxy) {
        this._configuration = configuration;
        this._jwksRetriever = jwksRetriever;
        this._httpProxy = httpProxy;
    }

    /*
     * Make a call to the introspection endpoint to read our token
     */
    public async validateToken(accessToken: string): Promise<JWTPayload> {

        const options = {
            algorithms: ['RS256'],
            issuer: this._configuration.issuer,
        } as JWTVerifyOptions;

        // AWS Cognito does not include an audience claim in access tokens
        if (this._configuration.audience) {
            options.audience = this._configuration.audience;
        }

        // Validate the token and get its claims
        let claims: JWTPayload;
        try {

            const result = await jwtVerify(accessToken, this._jwksRetriever.remoteJWKSet, options);
            claims = result.payload;

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

        // The sample API requires the same scope for all endpoints, and it is enforced here
        // In AWS this is a URL value of the form https://api.authsamples.com/investments
        const scopes = ClaimsReader.getClaim(claims['scope'] as string, 'scope');
        if (scopes.indexOf(this._configuration.scope) === -1) {

            throw new ClientError(
                403,
                ErrorCodes.insufficientScope,
                'The token does not contain sufficient scope for this API');
        }

        return claims;
    }

    /*
     * The API can get OAuth user info if required, by calling the user info endpoint
     */
    public async getUserInfo(accessToken: string): Promise<UserInfoClaims> {

        try {

            const options = {
                url: this._configuration.userInfoEndpoint,
                method: 'GET',
                headers: {
                    'accept': 'application/json',
                    'Authorization': `Bearer ${accessToken}`,
                },
                httpsAgent: this._httpProxy.agent,
            };

            const response = await axios.request(options as AxiosRequestConfig);
            const userInfo = response.data as any;

            const givenName = ClaimsReader.getClaim(userInfo.given_name, 'given_name');
            const familyName = ClaimsReader.getClaim(userInfo.family_name, 'family_name');
            const email = ClaimsReader.getClaim(userInfo.email, 'email');
            return new UserInfoClaims(givenName, familyName, email);

        } catch (e: any) {

            // Report user info errors clearly
            throw ErrorFactory.fromUserInfoError(e, this._configuration.userInfoEndpoint);
        }
    }
}
