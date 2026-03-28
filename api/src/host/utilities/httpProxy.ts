import {EnvHttpProxyAgent} from 'undici';
import {Configuration} from '../configuration/configuration.js';

/*
 * Manage routing outbound calls from the API via an HTTP proxy
 */
export class HttpProxy {

    private readonly agent: EnvHttpProxyAgent | null;

    /*
     * Create an HTTP agent to route requests to
     */
    public constructor(configuration: Configuration) {

        if (!configuration.api.useProxy) {

            this.agent = null;

        } else {

            this.agent = new EnvHttpProxyAgent({
                httpsProxy: configuration.api.proxyUrl,
            });
        }
    }

    /*
     * Return the agent to be assigned during HTTP requests
     */
    public getDispatcher(): EnvHttpProxyAgent | null {
        return this.agent;
    }
}
