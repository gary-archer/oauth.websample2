import Handlebars from 'handlebars';
import $ from 'jquery';
import {ApiClient} from '../api/client/apiClient';
import {Company} from '../api/entities/company';

/*
 * The companies list view takes up the entire screen except for the header
 */
export class CompaniesView {

    private readonly _apiClient: ApiClient;

    public constructor(apiClient: ApiClient) {
        this._apiClient = apiClient;
        this._setupCallbacks();
    }

    /*
     * Wait for data then render it
     */
    public async load(): Promise<void> {

        // Clear existing content
        $('#main').html('');

        // Try to get data
        const data = await this._apiClient.getCompanyList();

        // Render new content
        this._renderData(data);
    }

    /*
     * Render HTML based on the API response
     */
    private _renderData(data: Company[]): void {

        // Build a view model from the API data
        const viewModel = data.map((company: Company) => {
            return {
                id: company.id,
                name: company.name,
                formattedTargetUsd: Number(company.targetUsd).toLocaleString(),
                formattedInvestmentUsd: Number(company.investmentUsd).toLocaleString(),
                noInvestors: company.noInvestors,
            };
        });

        // Construct a Handlebars template
        const htmlTemplate =
        `<div class='card border-0'>
            <div class='card-header row'>
                <div class ='col-1'></div>
                <div class ='col-2 font-weight-bold'>Account</div>
                <div class ='col-3'></div>
                <div class ='col-2 font-weight-bold'>Target USD</div>
                <div class ='col-2 font-weight-bold'>Investment USD</div>
                <div class ='col-2 font-weight-bold'># Investors</div>
            </div>
            <div>
                {{#each this}}
                    <div class='row'>
                        <div class='col-1 my-auto'>
                            <img src='images/{{id}}.svg' />
                        </div>
                        <div class='col-2 my-auto'>
                            {{name}}
                        </div>
                        <div class='col-3 my-auto'>
                            <a href='#company={{id}}'>View Transactions</a>
                        </div>
                        <div class='col-2 my-auto moneycolor font-weight-bold'>
                            {{formattedTargetUsd}}<br/>
                        </div>
                        <div class='col-2 my-auto moneycolor font-weight-bold'>
                            {{formattedInvestmentUsd}}
                        </div>
                        <div class='col-2 my-auto font-weight-bold'>
                            {{noInvestors}}
                        </div>
                    </div>
                {{/each}}
            </div>
        </div>`;

        // Update the main elemnent's content in a manner that handles dangerous characters correctly
        const template = Handlebars.compile(htmlTemplate);
        const html = template(viewModel);
        $('#main').html(html);
    }

    /*
     * Plumbing to ensure that the this parameter is available in async callbacks
     */
    private _setupCallbacks(): void {
        this._renderData = this._renderData.bind(this);
   }
}
