import TunnelAgent from 'tunnel-agent';
import Url from 'url';

/*
 * Some HTTP libraries require an agent to be expressed in order to see traffic in Fiddler or Charles
 */
export class DebugProxyAgent {

    /*
     * Activate debugging if required
     */
    public static initialize(useProxy: boolean, proxyUrl: string): void {
        if (useProxy) {
            const opts = Url.parse(proxyUrl);
            DebugProxyAgent._agent = TunnelAgent.httpsOverHttp({
                proxy: opts,
            });
        }
    }

    /*
     * Return the configured agent
     */
    public static get(): any {
        return DebugProxyAgent._agent;
    }

    /*
     * Return true if debugging
     */
    public static isDebuggingActive(): any {
        return DebugProxyAgent._agent !== null;
    }

    // The global agent instance
    private static _agent: any;
}
