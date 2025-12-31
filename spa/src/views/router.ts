import {ApiClient} from '../api/client/apiClient';
import {CompaniesView} from './companiesView';
import {DomUtils} from './domUtils';
import {ErrorView} from './errorView';
import {LoginRequiredView} from './loginRequiredView';
import {TransactionsView} from './transactionsView';

/*
 * A very primitive router to deal with switching views
 */
export class Router {

    private apiClient: ApiClient;
    private errorView: ErrorView;
    private companiesView: CompaniesView | null;
    private transactionsView: TransactionsView | null;

    public constructor(apiClient: ApiClient, errorView: ErrorView) {

        this.apiClient = apiClient;
        this.errorView = errorView;
        this.companiesView = null;
        this.transactionsView = null;
    }

    /*
     * Run the view based on the hash URL data
     */
    public async runView(forceReload: boolean): Promise<void> {

        // Initialise
        DomUtils.createDiv('#root', 'main');
        this.errorView.clear();

        if (this.isInLoggedOutView()) {

            // If the user needs to sign in, show the login required view
            const view = new LoginRequiredView();
            await view.load();

        } else {

            // The transactions view has a URL such as #company=2
            const companyId = this.getTransactionsViewId();
            if (companyId) {

                // If there is an id we move to the transactions view
                const view = this.createTransactionsView(companyId);
                await view.run(forceReload);

            } else {

                // Otherwise we show the companies list view
                const view = this.createCompaniesView();
                await view.run(forceReload);
            }
        }
    }

    /*
     * Return true if we are in the home view
     */
    public isInHomeView(): boolean {
        return !this.getTransactionsViewId() && !this.isInLoggedOutView();
    }

    /*
     * The transactions view has a URL such as #company=2
     */
    public getTransactionsViewId(): string {

        if (location.hash) {
            const args = new URLSearchParams('?' + location.hash.substring(1));
            return args.get('company') || '';
        }

        return '';
    }

    /*
     * The logged out view has some special logic related to not showing user info
     */
    public isInLoggedOutView(): boolean {
        return location.hash.indexOf('loggedout') !== -1;
    }

    /*
     * Create the companies view the first time
     */
    private createCompaniesView(): CompaniesView {

        if (!this.companiesView) {
            this.companiesView = new CompaniesView(this.apiClient);
        }

        return this.companiesView;
    }

    /*
     * Create the transactions view the first time or if the company ID changes
     */
    private createTransactionsView(companyId: string): TransactionsView {

        if (!this.transactionsView || this.transactionsView.getCompanyId() !== companyId) {
            this.transactionsView = new TransactionsView(this.apiClient, companyId);
        }

        return this.transactionsView;
    }
}
