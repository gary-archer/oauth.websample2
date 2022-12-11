import {createRemoteJWKSet, JWSHeaderParameters, FlattenedJWSInput, RemoteJWKSetOptions} from 'jose';
import {GetKeyFunction} from 'jose/dist/types/types';
import {OAuthConfiguration} from '../configuration/oauthConfiguration';
import {HttpProxy} from '../utilities/httpProxy';

/*
 * A singleton that caches the result of createRemoteJWKSet, to ensure efficient lookup
 */
export class JwksRetriever {

    private readonly _remoteJWKSet: GetKeyFunction<JWSHeaderParameters, FlattenedJWSInput>;

    public constructor(configuration: OAuthConfiguration, httpProxy: HttpProxy) {

        // View requests via an HTTP proxy if required
        const jwksOptions = {
            agent: httpProxy.agent,
        } as RemoteJWKSetOptions;

        // Create this object only once
        this._remoteJWKSet = createRemoteJWKSet(new URL(configuration.jwksEndpoint), jwksOptions);
    }

    public get remoteJWKSet(): GetKeyFunction<JWSHeaderParameters, FlattenedJWSInput> {
        return this._remoteJWKSet;
    }
}
