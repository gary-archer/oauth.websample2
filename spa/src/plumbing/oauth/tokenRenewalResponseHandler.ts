import {UserManager} from 'oidc-client';
import {OAuthConfiguration} from '../../configuration/oauthConfiguration';

/*
 * Receive iframe token renewal responses
 */
export class TokenRenewalResponseHandler {

    private readonly _userManager: UserManager;

    public constructor(configuration: OAuthConfiguration) {

        const settings = {
            authority: configuration.authority,
            client_id: configuration.clientId,
        } ;

        this._userManager = new UserManager(settings);
    }

    /*
     * Handle token renewal responses from the authorization server
     */
    public async handleSilentTokenRenewalResponse(): Promise<void> {

        // If the page loads with a state query parameter we classify it as an OAuth response
        const args = new URLSearchParams(location.search);
        const state = args.get('state');
        if (state) {

            // Start processing of the authorization response on the iframe
            // Any errors are reported via the authenticator class of the main window
            await this._userManager.signinSilentCallback();
        }
    }
}
