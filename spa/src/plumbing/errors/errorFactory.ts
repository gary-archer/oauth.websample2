import {ErrorCodes} from './errorCodes';
import {UIError} from './uiError';

/*
 * A class to handle error processing
 */
export class ErrorFactory {

    /*
     * Return an error based on the exception type or properties
     */
    public static getFromException(exception: any): UIError {

        // Already handled errors
        if (exception instanceof UIError) {
            return exception;
        }

        // Create the error
        const error = new UIError(
            'Web UI',
            ErrorCodes.generalUIError,
            'A technical problem was encountered in the UI',
            exception.stack);

        // Set technical details from the received exception
        error.setDetails(ErrorFactory.getExceptionMessage(exception));
        return error;
    }

    /*
     * A login required error is thrown to short circuit execution when the UI cannot get an access token
     */
    public static getFromLoginRequired(): UIError {

        return new UIError(
            'Login',
            ErrorCodes.loginRequired,
            'No access token is available and a login is required');
    }

    /*
     * Handle sign in errors, which may have an OAuth error and error_description
     */
    public static getFromLoginOperation(exception: any, errorCode: string): UIError {

        // Already handled errors
        if (exception instanceof UIError) {
            return exception;
        }

        // Create the error
        const error = new UIError(
            'Login',
            errorCode,
            'A technical problem occurred during login processing',
            exception.stack);

        // Set technical details from the received exception
        error.setDetails(ErrorFactory.getOAuthExceptionMessage(exception));
        return error;
    }

    /*
     * Handle sign out errors
     */
    public static getFromLogoutOperation(exception: any, errorCode: string): UIError {

        // Already handled errors
        if (exception instanceof UIError) {
            return exception;
        }

        // Create the error
        const error = new UIError(
            'Logout',
            errorCode,
            'A technical problem occurred during logout processing',
            exception.stack);

        // Set technical details from the received exception
        error.setDetails(ErrorFactory.getOAuthExceptionMessage(exception));
        return error;
    }

    /*
     * Handle errors to the token endpoint
     */
    public static getFromTokenError(exception: any, errorCode: string): UIError {

        // Already handled errors
        if (exception instanceof UIError) {
            return exception;
        }

        // Create the error
        const error = new UIError(
            'Token',
            errorCode,
            'A technical problem occurred during token processing',
            exception.stack);

        // Set technical details from the received exception
        error.setDetails(ErrorFactory.getOAuthExceptionMessage(exception));
        return error;
    }

    /*
     * Return an object for Ajax errors
     */
    public static getFromJsonParseError(): UIError {

        return new UIError(
            'Data',
            ErrorCodes.jsonDataError,
            'HTTP response data was not valid JSON and could not be parsed');
    }

    /*
     * Return an object for Ajax errors
     */
    public static getFromHttpError(exception: any, url: string, source: string): UIError {

        // Already handled errors
        if (exception instanceof UIError) {
            return exception;
        }

        // Calculate the status code
        let statusCode = 0;
        if (exception.response && exception.response.status) {
            statusCode = exception.response.status;
        }

        let error = null;
        if (statusCode === 0) {

            // This status is generally a CORS or availability problem
            error = new UIError(
                'Network',
                ErrorCodes.networkError,
                `A network problem occurred when the UI called the ${source}`,
                exception.stack);
            error.setDetails(this.getExceptionMessage(exception));

        } else if (statusCode >= 200 && statusCode <= 299) {

            // This status is generally a JSON parsing error
            error = new UIError(
                'JSON',
                ErrorCodes.jsonDataError,
                `'A technical problem occurred parsing data from the ${source}`,
                exception.stack);
            error.setDetails(this.getExceptionMessage(exception));

        } else {

            // Create an error indicating a data problem
            error = new UIError(
                source,
                ErrorCodes.responseError,
                `An error response was returned from the ${source}`,
                exception.stack);
            error.setDetails(this.getExceptionMessage(exception));

            // Override the default with a server response when received and CORS allows us to read it
            if (exception.response && exception.response.data && typeof exception.response.data === 'object') {
                ErrorFactory.updateFromApiErrorResponse(error, exception.response.data);
            }
        }

        error.setStatusCode(statusCode);
        error.setUrl(url);
        return error;
    }

    /*
     * Try to update the default API error with response details
     */
    private static updateFromApiErrorResponse(error: UIError, apiError: any): void {

        // Attempt to read the API error response
        if (apiError) {

            // Set the code and message, returned for both 4xx and 5xx errors
            if (apiError.code && apiError.message) {
                error.setErrorCode(apiError.code);
                error.setDetails(apiError.message);
            }

            // Set extra details returned for 5xx errors
            if (apiError.area && apiError.id && apiError.utcTime) {
                error.setApiErrorDetails(apiError.area, apiError.id, apiError.utcTime);
            }
        }
    }

    /*
     * Get the message from an OAuth exception
     */
    private static getOAuthExceptionMessage(exception: any): string {

        let oauthError = '';
        if (exception.error) {
            oauthError = exception.error;
            if (exception.error_description) {
                oauthError += ` : ${exception.error_description.replace(/\+/g, ' ')}`;
            }
        }

        if (oauthError) {
            return oauthError;
        } else {
            return ErrorFactory.getExceptionMessage(exception);
        }
    }

    /*
     * Get the message from an exception and avoid returning [object Object]
     */
    private static getExceptionMessage(exception: any): string {

        if (exception.message) {
            return exception.message;
        }

        const details = exception.toString();
        if (details !== {}.toString()) {
            return details;
        }

        return '';
    }
}
