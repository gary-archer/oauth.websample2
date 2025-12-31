import mustache from 'mustache';
import {ApiClient} from '../api/client/apiClient';
import {Company} from '../api/entities/company';
import {CurrentLocation} from '../plumbing/utilities/currentLocation';
import {DomUtils} from './domUtils';

/*
 * The companies list view takes up the entire screen except for the header
 */
export class CompaniesView {

    private readonly apiClient: ApiClient;
    private data: Company[] | null;

    public constructor(apiClient: ApiClient) {
        this.apiClient = apiClient;
        this.data = null;
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
                this.data = await this.apiClient.getCompanyList();
            }

            // Render the latest data
            this.renderData(this.data);

        } catch (e: any) {

            // Clear previous content on error
            DomUtils.text('#main', '');
            throw e;
        }
    }

    /*
     * Create a view model and render HTML from the API response
     */
    private renderData(data: Company[]): void {

        const viewModel = {} as any;
        viewModel.companies = data.map((company: Company) => {
            return {
                id: company.id,
                name: company.name,
                region: company.region,
                formattedTargetUsd: Number(company.targetUsd).toLocaleString(),
                formattedInvestmentUsd: Number(company.investmentUsd).toLocaleString(),
                noInvestors: company.noInvestors,
            };
        });

        if (window.innerWidth >= 768) {
            this.renderDesktopView(viewModel);
        } else {
            this.renderMobileView(viewModel);
        }
    }

    /*
     * Render a list view on large screens
     */
    private renderDesktopView(viewModel: any): void {

        const htmlTemplate =
            `<div class='card border-0'>
                <div class='card-header row'>
                    <div class ='col-2 fw-bold text-center'>Account</div>
                    <div class ='col-2 fw-bold text-center'>Region</div>
                    <div class ='col-2'></div>
                    <div class ='col-2 fw-bold text-end'>Target USD</div>
                    <div class ='col-2 fw-bold text-end'>Investment USD</div>
                    <div class ='col-2 fw-bold text-end'># Investors</div>
                </div>
                <div class='card-body'>
                    {{#companies}}
                        <div class='row listRow'>
                            <div class='col-2 my-auto text-center'>
                                {{name}}
                            </div>
                            <div class='col-2 my-auto text-center'>
                                {{region}}
                            </div>
                            <div class='col-2 my-auto text-center'>
                                <a href='#company={{id}}'>View Transactions</a>
                            </div>
                            <div class='col-2 my-auto moneycolor fw-bold text-end'>
                                {{formattedTargetUsd}}
                            </div>
                            <div class='col-2 my-auto moneycolor fw-bold text-end'>
                                {{formattedInvestmentUsd}}
                            </div>
                            <div class='col-2 my-auto fw-bold text-end'>
                                {{noInvestors}}
                            </div>
                        </div>
                    {{/companies}}
                </div>
            </div>`;

        const html = mustache.render(htmlTemplate, viewModel);
        DomUtils.html('#main', html);
    }

    /*
     * Render a card view on small screens
     */
    private renderMobileView(viewModel: any): void {

        const htmlTemplate =
            `<div class='card border-0'>
                <div class='card-header row'>
                    <div class='col-12 text-center mx-auto fw-bold'>
                        Company List
                    </div>
                </div>
                <div class='card-body'>
                    {{#companies}}
                        <div class='row mobileHeaderRow'>
                            <div class='col-6 h4'>
                                <a href='#company={{id}}'>{{name}}</a>
                            </div>
                            <div class='col-6 h4 fw-bold'>
                                {{region}}
                            </div>
                        </div>
                        <div class='row mobileRow'>
                            <div class='col-6'>
                                Target USD
                            </div>
                            <div class='col-6 moneycolor fw-bold'>
                                {{formattedTargetUsd}}
                            </div>
                        </div>
                        <div class='row mobileRow'>
                            <div class='col-6'>
                                Investment USD
                            </div>
                            <div class='col-6 moneycolor fw-bold'>
                                {{formattedInvestmentUsd}}
                            </div>
                        </div>
                        <div class='row mobileRow'>
                            <div class='col-6'>
                                # Investors
                            </div>
                            <div class='col-6 moneycolor fw-bold'>
                                {{noInvestors}}
                            </div>
                        </div>
                    {{/companies}}
                </div>
            </div>`;

        const html = mustache.render(htmlTemplate, viewModel);
        DomUtils.html('#main', html);
    }
}
