'use strict';
const ApiError = require('./apiError');
const ApiLogger = require('./apiLogger');

/*
 * A class to handle composing and reporting errors
 */
class ErrorHandler {
    
    /*
     * Handle the server error and get client details
     */
    static handleError(exception) {
       
        // Ensure that the error is of type ApiError
        let serverError = ErrorHandler._fromException(exception);
        
        // Log the full error to the service
        ApiLogger.error(JSON.stringify(serverError));
        
        // Create details for the client
        let clientInfo = {
            status: (serverError.statusCode === 401) ? 401 : 500,
            wwwAuthenticate: '',
            error: {
                area: serverError.area,
                message: serverError.message
            }
        };
        
        // Set the WWW-Authenticate header if returning a 401
        if (clientInfo.status === 401) {
            clientInfo.wwwAuthenticate = 'Bearer';
            if (serverError.wwwAuthenticateReason.length > 0) {
                clientInfo.wwwAuthenticate += `,error="${serverError.wwwAuthenticateReason}"`;
            }
        }

        return clientInfo;
    }
    
    /*
     * Get an error object for a missing token
     */
    static getNoTokenError() {
        
        return new ApiError({
            statusCode: 401,
            area: 'Token',
            message: 'No access token supplied'    
        });
    }

    /*
     * Get an error object for token expired / revoked
     */
    static getInvalidTokenError() {
        
        return new ApiError({
            statusCode: 401,
            area: 'Token',
            message: 'Invalid or expired access token',
            wwwAuthenticateReason: 'invalid_token'
        });
    }
    
    /*
     * Handle the request promise error for metadata lookup failures
     */
    static fromMetadataError(responseError, url) {
        
        let apiError = new ApiError({
            statusCode: 500,
            area: 'Metadata Lookup',
            url: url,
            message: 'Metadata lookup failed'
        });
        ErrorHandler._updateErrorFromHttpResponse(apiError, responseError);
        return apiError;
    }
    
    /*
     * Handle the request promise error for introspection failures
     */
    static fromIntrospectionError(responseError, url) {
        
        // Already handled expiry errors
        if (responseError instanceof ApiError) {
            return responseError
        }

        let apiError = new ApiError({
            statusCode: 500,
            area: 'Token Validation',
            url: url,
            message: 'Token validation failure'
        });
        ErrorHandler._updateErrorFromHttpResponse(apiError, responseError);
        return apiError;
    }
    
    /*
     * Handle the request promise error for user info failures
     */
    static fromUserInfoError(responseError, url) {
        
        let apiError = new ApiError({
            statusCode: 500,
            area: 'User Info Lookup',
            url: url,
            message: 'User info lookup failed'
        });
        ErrorHandler._updateErrorFromHttpResponse(apiError, responseError);
        return apiError;
    }
    
    /*
     * Update error fields with response details
     */
    static _updateErrorFromHttpResponse(apiError, responseError) {
        
        if (responseError.error && responseError.error.error && responseError.error.error_description) {
            
            // Include OAuth error details if returned
            apiError.message += ` : ${responseError.error.error}`;
            apiError.details = responseError.error.error_description;
        }
        else {
          
            // Otherwise capture exception details
            apiError.details = responseError;
        }
    }
    
    /*
     * Ensure that all errors are of ApiError exception type
     */
    static _fromException(exception) {
        
        // Already handled
        if (exception instanceof ApiError) {
            return exception;
        }

        // Do a to string on the exception to get details
        return new ApiError({
            statusCode: 500,
            message: 'Problem encountered',
            area: 'Exception',
            details: exception.toString()
        });
    }
}

module.exports = ErrorHandler;