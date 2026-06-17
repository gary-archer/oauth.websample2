import mustache from 'mustache';
import {ApiClient} from '../api/client/apiClient';
import {CompanyTransactions} from '../api/entities/companyTransactions';
import {ErrorCodes} from '../plumbing/errors/errorCodes';
import {CurrentLocation} from '../plumbing/utilities/currentLocation';
import {DomUtils} from './domUtils';

/*
 * The transactions view takes up the entire screen except for the header
 */
export class TransactionsView {

    private readonly apiClient: ApiClient;
    private readonly companyId: string;
    private data: CompanyTransactions | null;

    public constructor(apiClient: ApiClient, companyId: string) {
        this.apiClient = apiClient;
        this.companyId = companyId;
        this.data = null;
    }

    public getCompanyId(): string {
        return this.companyId;
    }

    /*
    * Wait for data then render it
    */
    public async run(forceReload: boolean): Promise<void> {

        try {

            // Record the current location, to support deep linking after login
            CurrentLocation.path = location.hash;

            // Try to get data if required
            if (!this.data || forceReload) {
                this.data = await this.apiClient.getCompanyTransactions(this.companyId);
            }

            // Render the latest data
            this.renderData(this.data);

        } catch (uiError: any) {

            // Handle invalid input due to typing an id into the browser address bar
            if (uiError.statusCode === 404 && uiError.errorCode === ErrorCodes.companyNotFound) {

                // User typed an id value outside of valid company ids
                location.hash = '#';

            } else if (uiError.statusCode === 400 && uiError.errorCode === ErrorCodes.invalidCompanyId) {

                // User typed an invalid id such as 'abc'
                location.hash = '#';

            } else {

                // Clear previous content on error
                DomUtils.text('#main', '');
                throw uiError;
            }
        }
    }

    /*
     * Render data after receiving it from the API
     */
    private renderData(data: CompanyTransactions): void {

        const viewModel = {
            title: `Today's Transactions for ${data.company.name}`,
            transactions: data.transactions.map((transaction) => {
                return {
                    id: transaction.id,
                    investorId: transaction.investorId,
                    formattedAmountUsd: Number(transaction.amountUsd).toLocaleString(),
                };
            }),
        };

        const htmlTemplate =
            `<div class='mt-3'>
                <div class='bg-gray-100 p-3 text-center font-bold'>
                    {{title}}
                </div>
                <div class='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 p-3'>
                    {{#transactions}}
                        <div class='rounded-lg border border-gray-300'>
                            <div class='p-3'>
                                <div class='flex mt-1'>
                                    <div class='w-1/2'>Transaction ID</div>
                                    <div class='w-1/2 text-right font-bold text-blue-700'>{{id}}</div>
                                </div>
                                <div class='flex mt-1'>
                                    <div class='w-1/2'>Investor ID</div>
                                    <div class='w-1/2 text-right font-bold text-blue-700'>{{investorId}}</div>
                                </div>
                                <div class='flex mt-1'>
                                    <div class='w-1/2'>Amount USD</div>
                                    <div class='w-1/2 text-right font-bold text-green-700'>{{formattedAmountUsd}}</div>
                                </div>
                            </div>
                        </div>
                    {{/transactions}}
                </div>
            </div>`;

        const html = mustache.render(htmlTemplate, viewModel);
        DomUtils.html('#main', html);
    }
}
