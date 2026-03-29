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
        error.setDetails(ErrorFactory.getExceptionMessage(exception));
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
        error.setDetails(ErrorFactory.getExceptionMessage(exception));
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
            'A technical problem occurred fetching tokens',
            exception.stack);

        // Set technical details from the received exception
        error.setDetails(ErrorFactory.getExceptionMessage(exception));
        return error;
    }

    /*
     * Exceptions during fetches could be caused by CORS misconfiguration, server unavailable or JSON parsing failures
     */
    public static getFromFetchError(exception: any, url: string, source: string): UIError {

        // Already handled
        if (exception instanceof UIError) {
            return exception;
        }

        let error: UIError;
        if (exception.constructor.name === 'SyntaxError') {

            // Handle JSON parse errors
            error = new UIError(
                'Data',
                ErrorCodes.dataError,
                `Unexpected data received from the ${source}`);

        } else {

            // Handle connection or CORS errors
            error = new UIError(
                'Connection',
                ErrorCodes.connectionError,
                `A connection error occurred when the UI called the ${source}`,
                exception.stack);
        }

        error.setDetails(this.getExceptionMessage(exception));
        error.setUrl(url);
        return error;
    }

    /*
     * Response errors can contain an API error response or may be issued by an API gateway
     */
    public static async getFromFetchResponseError(response: Response, source: string): Promise<UIError> {

        const error = new UIError(
            source,
            ErrorCodes.responseError,
            `An error response was returned from the ${source}`
        );
        error.setStatusCode(response.status);
        return error;
    }

    /*
     * Response errors can contain an API error response or may be issued by an API gateway
     */
    public static async getFromApiResponseError(response: Response): Promise<UIError> {

        const error = await this.getFromFetchResponseError(response, 'web API');

        try {
            // The API returns JSON responses for all errors so try to read JSON
            const apiError = await response.json();
            if (apiError) {

                if (apiError.code && apiError.message) {
                    error.setErrorCode(apiError.code);
                    error.setDetails(apiError.message);
                }

                // Set extra details returned for 5xx errors
                if (apiError.area && apiError.id && apiError.utcTime) {
                    error.setApiErrorDetails(apiError.area, apiError.id, apiError.utcTime);
                }
            }
        } catch {
            // Swallow JSON parse errors for unexpected responses
        }

        return error;
    }

    /*
     * Get the message from an exception
     */
    private static getExceptionMessage(exception: any): string {

        // Prefer to return the message
        if (exception.message) {
            return exception.message;
        }

        // Otherwise get raw details and avoid returning [object Object]
        const details = exception.toString();
        if (details !== {}.toString()) {
            return details;
        }

        return '';
    }
}
