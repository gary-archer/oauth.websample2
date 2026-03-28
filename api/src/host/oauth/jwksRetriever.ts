import {createRemoteJWKSet, customFetch, JWTVerifyGetKey, RemoteJWKSetOptions} from 'jose';
import {fetch, RequestInit} from 'undici';
import {OAuthConfiguration} from '../configuration/oauthConfiguration.js';
import {HttpProxy} from '../utilities/httpProxy.js';

/*
 * A singleton that caches the result of createRemoteJWKSet, to ensure efficient lookup
 */
export class JwksRetriever {

    private readonly remoteJWKSet: JWTVerifyGetKey;
    private readonly httpProxy: HttpProxy;

    /*
     * Customize the JWKS URI download to support using an HTTP proxy
     */
    public constructor(configuration: OAuthConfiguration, httpProxy: HttpProxy) {

        this.httpProxy = httpProxy;
        this.setupCallbacks();

        const jwksOptions = {
            [customFetch]: this.fetchJwks,
        } as RemoteJWKSetOptions;

        this.remoteJWKSet = createRemoteJWKSet(new URL(configuration.jwksEndpoint), jwksOptions);
    }

    /*
     * Return the global object
     */
    public getRemoteJWKSet(): JWTVerifyGetKey {
        return this.remoteJWKSet;
    }

    /*
     * Support the use of an HTTP proxy during requests to the authorization server
     */
    private async fetchJwks(url: string) {

        const options: RequestInit = {
            dispatcher: this.httpProxy.getDispatcher() || undefined,
        };

        return await fetch(url, options);
    }

    /*
     * Set up async callbacks
     */
    private setupCallbacks(): void {
        this.fetchJwks = this.fetchJwks.bind(this);
    }
}
