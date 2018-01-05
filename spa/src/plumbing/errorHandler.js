'use strict';
import UIError from 'uiError';
import $ from 'jquery';

/*
 * A class to handle composing and reporting errors
 */
export default class ErrorHandler {
    
    /*
     * Output fields from an AppError object, depending on what is populated
     */
    static reportError(exception) {
        
        // Ensure that the error is of type UIError
        let error = ErrorHandler.getFromException(exception);
        
        // Only report real errors
        if (error.nonError) {
            return;
        }
        
        $('#errorContainer').removeClass('hide');
        $('#error').text('');
        
        if (error.message.length > 0) {
            $('#error').append($('<li>').html(`Message : <b>${error.message}</b>`));
        }
        
        if (error.statusCode > -1) {
            $('#error').append($('<li>').html(`Status Code: <b>${error.statusCode}</b>`));
        }
        
        if (error.area.length > 0) {
            $('#error').append($('<li>').html(`Area : <b>${error.area}</b>`));
        }
        
        if (error.url.length > 0) {
            $('#error').append($('<li>').html(`URL : <b>${error.url}</b>`));
        }

        $('#error').append($('<li>').html(`Time : <b>${error.time.toUTCString()}</b>`));
        
        if (error.details.length > 0) {
            $('#error').append($('<li>').html(`Details : <b>${error.details}</b>`));
        }
    }
    
    /*
     * Used when we want to short circuit execution and reject a promise
     */
    static getNonError() {
        
        return new UIError({
            nonError: true
        });
    }
    
    /*
     * Sign in request errors most commonly 
     */
    static getFromOAuthSignInRequest(e) {
        
        // Already handled errors
        if (e instanceof UIError) {
            return e;
        }
        
        let error = new UIError({
            message: 'Sign in request error',
            area: 'OAuth'
        });

        // Improve this Okta specific error calling the metadata endpoint
        if (e.message && e.message === 'Network Error') {
            error.area = 'CORS';
            error.message = 'Cross origin request was not allowed';
            error.statusCode = 0;
        }
        else {
            error.details = e.toString();
        }
        
        return error;
    }
    
    /*
     * Sign in request errors most commonly 
     */
    static getFromOAuthSignInResponse(e) {
        
        // Already handled errors
        if (e instanceof UIError) {
            return e;
        }
        
        let error = new UIError({
            message: 'Sign in response error',
            statusCode: 400,
            area: 'OAuth'
        });
        
        if (e.error && e.error_description) {
            error.message += ` : ${e.error}`;
            error.details = e.error_description;
        }
        
        return error;
    }
    
    /*
     * Return an object for Ajax errors
     */
    static getFromAjaxError(xhr, url) {
        
        // Already handled errors
        if (xhr instanceof UIError) {
            return xhr;
        }
        
        let error = new UIError({
            message: 'Error calling server',
            statusCode: xhr.status,
            area: 'Ajax',
            url: url
        });

        if (xhr.status === 0 ) {
            
            error.area += ' / CORS';
            error.message = 'Cross origin request was not allowed';
        }
        else if (xhr.status === 200 ) {
            
            error.area = ' / JSON';
            error.message = 'Parsing JSON data failed';
        }
        else {
            
            // See if there is an API error
            let apiError = ErrorHandler._getApiErrorFromResponse(xhr.responseText);
            if (apiError && apiError.area && apiError.message) {
                error.area = `API / ${apiError.area}`;
                error.message = apiError.message;
            }
        }
        
        return error;
    }
    
    /*
     * Return an error based on the exception type or properties
     */
    static getFromException(e) {
        
        // Already handled errors
        if (e instanceof UIError) {
            return e;
        }
        
        // Call to string on the exception
        return new UIError({
            message: 'Problem encountered',
            area: 'Exception',
            details: e.toString()
        });
    }
    
    /*
     * Try to deserialize an API error object
     */
    static _getApiErrorFromResponse(responseText) {

        try {
            return JSON.parse(responseText);
        }
        catch(e) {
            return null;
        }
    }
}