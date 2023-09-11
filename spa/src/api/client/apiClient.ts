import axios, {Method} from 'axios';
import {ErrorFactory} from '../../plumbing/errors/errorFactory';
import {Authenticator} from '../../plumbing/oauth/authenticator';
import {AxiosUtils} from '../../plumbing/utilities/axiosUtils';
import {ApiUserInfo} from '../entities/apiUserInfo';
import {Company} from '../entities/company';
import {CompanyTransactions} from '../entities/companyTransactions';

/*
 * Logic related to making API calls
 */
export class ApiClient {

    private readonly _apiBaseUrl: string;
    private readonly _authenticator: Authenticator;

    public constructor(apiBaseUrl: string, authenticator: Authenticator) {

        this._apiBaseUrl = apiBaseUrl;
        if (!this._apiBaseUrl.endsWith('/')) {
            this._apiBaseUrl += '/';
        }

        this._authenticator = authenticator;
    }

    /*
     * Get a list of companies
     */
    public async getCompanyList(): Promise<Company[]> {

        return await this._callApi('companies', 'GET') as Company[];
    }

    /*
     * Get a list of transactions for a single company
     */
    public async getCompanyTransactions(id: string): Promise<CompanyTransactions> {

        return await this._callApi(`companies/${id}/transactions`, 'GET') as CompanyTransactions;
    }

    /*
     * The front end gets domain specific user info from its API
     */
    public async getUserInfo(): Promise<ApiUserInfo> {

        return await this._callApi('userinfo', 'GET') as ApiUserInfo;
    }

    /*
     * A central method to get data from an API and handle 401 retries
     */
    private async _callApi(path: string, method: Method, dataToSend?: any): Promise<any> {

        // Get the full path
        const url = `${this._apiBaseUrl}${path}`;

        // Get the access token, and if it does not exist a login redirect will be triggered
        let token = await this._authenticator.getAccessToken();

        try {

            // Call the API
            return await this._callApiWithToken(url, method, dataToSend, token);

        } catch (e: any) {

            // Report Ajax errors if this is not a 401
            if (e.statusCode !== 401) {
                throw e;
            }

            // If we received a 401 then try to refresh the access token
            token = await this._authenticator.refreshAccessToken();

            // The general pattern for calling an OAuth secured API is to retry 401s once with a new token
            return await this._callApiWithToken(url, method, dataToSend, token);
        }
    }

    /*
     * Do the work of calling the API
     */
    private async _callApiWithToken(
        url: string,
        method: Method,
        dataToSend: any,
        accessToken: string): Promise<any> {

        try {

            const response = await axios.request({
                url,
                method,
                data: dataToSend,
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                },
            });

            AxiosUtils.checkJson(response.data);
            return response.data;

        } catch (e: any) {
            throw ErrorFactory.getFromHttpError(e, url, 'web API');
        }
    }
}
