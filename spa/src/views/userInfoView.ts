import Handlebars from 'handlebars';
import $ from 'jquery';
import {ApiClient} from '../api/client/apiClient';

/*
 * The user info view renders details of the logged in user
 */
export class UserInfoView {

    /*
     * Run the view
     */
    public async load(rootElement: string, apiClient: ApiClient): Promise<void> {

        // Show nothing when logged out
        if (location.hash.indexOf('loggedout') !== -1) {
            $('#username').text('');
            return;
        }

        // Make the API call to get user info
        const claims = await apiClient.getUserInfo();

        // Render results
        if (claims && claims.givenName && claims.familyName) {

            // Use Handlebars to compile the HTML and handle dangerous characters securely
            const htmlTemplate = `{{givenName}} {{familyName}}`;
            const template = Handlebars.compile(htmlTemplate);
            const html = template(claims);

            // Update the UI
            $(`#${rootElement}`).text(html);
        }
    }
}
