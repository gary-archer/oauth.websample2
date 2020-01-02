import $ from 'jquery';
import urlparse from 'url-parse';
import {ApiClient} from '../api/client/apiClient';
import {CompaniesView} from './companiesView';
import {ErrorView} from './errorView';
import {LogoutView} from './logoutView';
import {TransactionsView} from './transactionsView';

/*
 * A very primitive router to deal with switching views
 */
export class Router {

    private _apiClient: ApiClient;
    private _errorView: ErrorView;

    public constructor(apiClient: ApiClient, errorView: ErrorView) {
        this._apiClient = apiClient;
        this._errorView = errorView;
    }

    /*
     * Execute a view based on the hash URL data
     */
    public async loadView(): Promise<void> {

        // Disable buttons until the view is ready
        this._disableSessionControls();

        // Clear errors from the previous view
        this._errorView.clear();

        // Our simplistic routing works out which main view to show from a couple of known hash fragments
        if (location.hash.indexOf('loggedout') !== -1) {

            // If the user has explicitly logged out show this view
            const view = new LogoutView();
            await view.load();

        } else {

            // Do simple routing based on hash parameters
            const hashData = this._getLocationHashData();
            if (hashData.company) {

                // If there is an id we move to the transactions view
                const view = new TransactionsView(this._apiClient, hashData.company);
                await view.load();

            } else {

                // Otherwise we show the companies list view
                const view = new CompaniesView(this._apiClient);
                await view.load();
            }
        }

        // Enable buttons after data loads
        if (location.hash.indexOf('loggedout') === -1) {
            this._enableSessionControls();
        }
    }

    /*
     * Update session controls when loading data
     */
    private _disableSessionControls(): void {
        $('.sessionbutton').prop('disabled', true);
    }

    /*
     * Update session controls after loading data
     */
    private _enableSessionControls(): void {
        $('.sessionbutton').prop('disabled', false);
    }

    /*
     * Get hash fragments into a dictionary
     */
    private _getLocationHashData(): any {

        if (location.hash.startsWith('#')) {
            const data = urlparse('?' + location.hash.substring(1), true);
            if (data && data.query)  {
                return data.query;
            }
        }

        return {};
    }
}
