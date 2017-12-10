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
        
        // Get a token if required
        return authenticator.getAccessToken()
            .then(token => {
            
                // Call the API
                return HttpClient._callApiWithToken(url, method, dataToSend, authenticator, token);
            })
            .catch(e => {

                // Already handled errors
                if (e instanceof UIError) {
                    return Promise.reject(e);
                }

                // Handle Ajax errors
                if (e.status && e.status === 401) {
                    
                    // Clear the access token from storage since it is not working
                    return authenticator.clearAccessToken()
                        .then(() => {
                            
                            // Get a new access token
                            return authenticator.getAccessToken()
                                .then(token => {

                                    // Call the API again
                                    return HttpClient._callApiWithToken(url, method, dataToSend, authenticator, token);
                                });
                        });
                }

                // Report exceptions
                return Promise.reject(ErrorHandler.getFromException(e));
            });
    }
    
    /*
     * Do the work of calling the API
     */
    static _callApiWithToken(url, method, dataToSend, authenticator, accessToken) {
        
        return $.ajax({
                url: url,
                data: JSON.stringify(dataToSend | {}),
                dataType: 'json',
                contentType: 'application/json',
                type: method,
                beforeSend: function (xhr) {
                    xhr.setRequestHeader ('Authorization', 'Bearer ' + accessToken);
                }
            })
            .then(data => {
                return Promise.resolve(data);
            })
            .catch(xhr => {

                // Rethrow 401s to the caller
                if (xhr.status === 401) {
                    return Promise.reject(xhr);
                }

                // Report Ajax errors
                let ajaxError = ErrorHandler.getFromAjaxError(xhr, url);
                return Promise.reject(ajaxError);
            });
    }
}