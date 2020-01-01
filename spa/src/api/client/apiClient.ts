import $ from 'jquery';
import {ErrorHandler} from '../../plumbing/errors/errorHandler';
import {Authenticator} from '../../plumbing/oauth/authenticator';
import {Company} from '../entities/company';
import {CompanyTransactions} from '../entities/companyTransactions';
import {UserInfoClaims} from '../entities/userInfoClaims';

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
     * We download user info from the API so that we can get any data we need
     */
    public async getUserInfo(): Promise<UserInfoClaims> {

        return await this._callApi(`userclaims/current`, 'GET') as UserInfoClaims;
    }

    /*
     * We download user info from the API so that we can get any data we need
     */
    public async getCompanyList(): Promise<Company[]> {

        return await this._callApi(`companies`, 'GET') as Company[];
    }

    /*
     * We download user info from the API so that we can get any data we need
     */
    public async getCompanyTransactions(id: string): Promise<CompanyTransactions> {

        return await this._callApi(`companies/${id}/transactions`, 'GET') as CompanyTransactions;
    }

    /*
     * A central method to get data from an API and handle 401 retries
     */
    private async _callApi(path: string, method: string, dataToSend?: any): Promise<any> {

        // Get the full path
        const url = `${this._apiBaseUrl}${path}`;

        // Get the access token, and if it does not exist a login redirect will be triggered
        let token = await this._authenticator.getAccessToken();

        try {

            // Call the API
            return await this._callApiWithToken(url, method, dataToSend, token);

        } catch (error1) {

            // Report Ajax errors if this is not a 401
            if (!this._isApi401Error(error1)) {
                throw ErrorHandler.getFromApiError(error1, url);
            }

            // If we received a 401 then clear the failing access token from storage and get a new one
            await this._authenticator.clearAccessToken();
            token = await this._authenticator.getAccessToken();

            // The general pattern for calling an OAuth secured API is to retry 401s once with a new token
            try {
                // Call the API again
                return await this._callApiWithToken(url, method, dataToSend, token);

            } catch (error2) {
                // Report Ajax errors for the retry
                throw ErrorHandler.getFromApiError(error2, url);
            }
        }
    }

    /*
     * Do the work of calling the API
     */
    private async _callApiWithToken(url: string, method: string, dataToSend: any, accessToken: string): Promise<any> {

        const options: any = {
            url,
            dataType: 'json',
            contentType: 'application/json',
            type: method,
            beforeSend: (xhr: any) => {

                if (accessToken !== null) {
                    xhr.setRequestHeader ('Authorization', 'Bearer ' + accessToken);
                }
            },
        };

        if (dataToSend) {
            options.data = dataToSend;
        }

        return await $.ajax(options);
    }

    /*
     * API 401s are handled via a retry with a new token
     */
    private _isApi401Error(error: any) {

        if (error.status === 401) {
            return true;
        }

        return false;
    }
}
