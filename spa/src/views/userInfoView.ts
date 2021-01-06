import $ from 'jquery';
import mustache from 'mustache';
import {ApiClient} from '../api/client/apiClient';

/*
 * The user info view renders details of the logged in user
 */
export class UserInfoView {

    /*
     * Run the view
     */
    public async load(rootElement: string, apiClient: ApiClient): Promise<void> {

        // Make the API call to get user info
        const claims = await apiClient.getUserInfo();

        // Render results
        if (claims && claims.givenName && claims.familyName) {

            const html = mustache.render('{{givenName}} {{familyName}}', claims);
            $(`#${rootElement}`).text(html);
        }
    }

    /*
     * Clear the view when we are logged out
     */
    public clear(rootElement: string): void {
        $(`#${rootElement}`).text('');
    }
}
