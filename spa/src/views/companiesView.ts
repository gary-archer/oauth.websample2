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
            `<div class='mt-3'>
                <div class='grid grid-cols-12 bg-gray-100 p-3'>
                    <div class='col-span-2 font-bold text-center'>Account</div>
                    <div class='col-span-2 font-bold text-center'>Region</div>
                    <div class='col-span-2'></div>
                    <div class='col-span-2 font-bold text-right'>Target USD</div>
                    <div class='col-span-2 font-bold text-right'>Investment USD</div>
                    <div class='col-span-2 font-bold text-right'># Investors</div>
                </div>
                <div>
                    {{#companies}}
                        <div class='grid grid-cols-12 p-3 p-3 mt-5'>
                            <div class='col-span-2 text-center'>
                                {{name}}
                            </div>
                            <div class='col-span-2 text-center'>
                                {{region}}
                            </div>
                            <div class='col-span-2 text-center'>
                                <a href='#company={{id}}' class='text-blue-600 underline'>View Transactions</a>
                            </div>
                            <div class='col-span-2 text-green-700 font-bold text-right'>
                                {{formattedTargetUsd}}
                            </div>
                            <div class='col-span-2 text-green-700 font-bold text-right'>
                                {{formattedInvestmentUsd}}
                            </div>
                            <div class='col-span-2 font-bold text-right'>
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
            `<div class='mt-3'>
                <div class='bg-gray-100 p-3 font-bold text-center'>
                    Company List
                </div>
                <div class='mt-3'>
                    {{#companies}}
                        <div class='p-3'>
                            <div class='grid grid-cols-12'>
                                <div class='col-span-6 text-2xl font-medium'>
                                    <a href='#company={{id}}' class='text-blue-600 underline'>{{name}}</a>
                                </div>
                                <div class='col-span-6 font-bold text-2xl font-medium'>
                                    {{region}}
                                </div>
                            </div>
                            <div class='grid grid-cols-12 mt-10'>
                                <div class='col-span-6'>
                                    Target USD
                                </div>
                                <div class='col-span-6 text-green-700 font-bold'>
                                    {{formattedTargetUsd}}
                                </div>
                            </div>
                            <div class='grid grid-cols-12 mt-5'>
                                <div class='col-span-6'>
                                    Investment USD
                                </div>
                                <div class='col-span-6 text-green-700 font-bold'>
                                    {{formattedInvestmentUsd}}
                                </div>
                            </div>
                            <div class='grid grid-cols-12 mt-5'>
                                <div class='col-span-6'>
                                    # Investors
                                </div>
                                <div class='col-span-6 font-bold'>
                                    {{noInvestors}}
                                </div>
                            </div>
                            <hr class='text-gray-300 mt-5' />
                        </div>
                    {{/companies}}
                </div>
            </div>`;

        const html = mustache.render(htmlTemplate, viewModel);
        DomUtils.html('#main', html);
    }
}
