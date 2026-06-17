import {HtmlStorageHelper} from '../plumbing/utilities/htmlStorageHelper';
import {DomUtils} from './domUtils';

/*
 * Logic related to the simple logout view
 */
export class LoginRequiredView {

    /*
     * Show logout details when the view loads
     */
    public async load(): Promise<void> {

        setTimeout(() => {
            HtmlStorageHelper.clearLoggedOutEvent();
        }, 250);

        const html =
            `<div class='text-lg text-center'>
                You are signed out - sign in to access the app ...
            </div>`;
        DomUtils.html('#main', html);
    }
}
