import mustache from 'mustache';
import {ApiClient} from '../api/client/apiClient';
import {Company} from '../api/entities/company';
import {DomUtils} from './domUtils';

/*
 * The companies list view takes up the entire screen except for the header
 */
export class CompaniesView {

    private readonly apiClient: ApiClient;

    public constructor(apiClient: ApiClient) {
        this.apiClient = apiClient;
    }

    /*
     * Wait for data then render it
     */
    public async load(): Promise<void> {

        try {

            // Try to get data
            const data = await this.apiClient.getCompanyList();

            // Render new content
            this.renderData(data);

        } catch (e: any) {

            // Clear previous content on error
            DomUtils.text('#main', '');
            throw e;
        }
    }

    /*
     * Render HTML based on the API response
     */
    private renderData(data: Company[]): void {

        // Build a view model from the API data
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

        // Construct a template
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
                                {{formattedTargetUsd}}<br/>
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

        // Update the main elemnent's content in a manner that handles dangerous characters correctly
        const html = mustache.render(htmlTemplate, viewModel);
        DomUtils.html('#main', html);
    }
}
