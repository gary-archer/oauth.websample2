'use strict';
import Authenticator from 'authenticator';
import ErrorHandler from 'errorHandler';
import UIError from 'uiError';
import $ from 'jquery';

/*
 * Logic related to making HTTP calls
 */
export default class HttpClient {
    
    /*
     * Get JSON data from the app config file
     */
    static loadAppConfiguration(filePath) {
        
        return $.ajax({
                url: filePath,
                type: 'GET',
                dataType: 'json'
            })
            .catch(xhr => {
                let error = ErrorHandler.getFromAjaxError(xhr, filePath);
                return Promise.reject(error);
            });
        
        return Promise.resolve();
    }
    
    /*
     * Get data from an API URL and handle retries if needed
     */
    static callApi(url, method, dataToSend, authenticator) {
        
        // Get a token
        return authenticator.getAccessToken()
            .then(token => {

                // Call the API
                return HttpClient._callApiWithToken(url, method, dataToSend, token)
                    .then (data => {
                        
                        // Return data if successful
                        return Promise.resolve(data);
                    })
                    .catch (xhr1 => {

                        // Report erors other than 401
                        if (xhr1.status !== 401) {
                            let ajaxError = ErrorHandler.getFromAjaxError(xhr1, url);
                            return Promise.reject(ajaxError);
                        }

                        // Clear the token that is failing
                        return authenticator.clearAccessToken()
                            .then(() => {

                                // Get a new token
                                return authenticator.getAccessToken()
                                    .then(token => {

                                        // Call the API again
                                        return HttpClient._callApiWithToken(url, method, dataToSend, token)
                                            .then(data => {
                        
                                                // Return data if successful
                                                return Promise.resolve(data);
                                            })
                                            .catch(xhr2 => {

                                                // Report erors
                                                let ajaxError = ErrorHandler.getFromAjaxError(xhr2, url);
                                                return Promise.reject(ajaxError);
                                            });
                                    });
                            });
                    });
            });
    }
    
    /*
     * Do the work of calling the API
     */
    static _callApiWithToken(url, method, dataToSend, accessToken) {
        
        return $.ajax({
                url: url,
                data: JSON.stringify(dataToSend | {}),
                dataType: 'json',
                contentType: 'application/json',
                type: method,
                beforeSend: function (xhr) {
                    xhr.setRequestHeader ('Authorization', 'Bearer ' + accessToken);
                }
            });
    }
}