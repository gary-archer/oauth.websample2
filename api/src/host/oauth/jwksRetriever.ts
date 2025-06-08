import axios from 'axios';
import {createRemoteJWKSet, customFetch, JWTVerifyGetKey, RemoteJWKSetOptions} from 'jose';
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
     * To support the use of an HTTP proxy I use axios to download the JWKS
     */
    private async fetchJwks(url: string): Promise<any> {

        const options = {
            url,
            method: 'GET',
            headers: {
                'accept': 'application/json',
            },
            httpsAgent: this.httpProxy.getAgent(),
        };

        const response = await axios.request(options);
        return {
            status: response.status,
            json: async () => response.data,
        };
    }

    /*
     * Set up async callbacks
     */
    private setupCallbacks(): void {
        this.fetchJwks = this.fetchJwks.bind(this);
    }
}
