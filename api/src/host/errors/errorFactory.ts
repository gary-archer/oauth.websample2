import {ServerError} from '../../logic/errors/serverError.js';
import {ClientError} from '../../logic/errors/clientError.js';
import {ErrorCodes} from '../../logic/errors/errorCodes.js';

/*
 * A class to handle trapping errors
 */
export class ErrorFactory {

    /*
     * Ensure that all errors used by business logic have a known type
     */
    public static fromException(exception: any): ServerError | ClientError {

        // Already handled 500 errors
        if (exception instanceof ServerError) {
            return exception;
        }

        // Already handled 4xx errors
        if (exception instanceof ClientError) {
            return exception;
        }

        // Handle general exceptions
        return ErrorFactory.fromServerError(exception);
    }

    /*
     * Process exception details
     */
    public static fromServerError(exception: any): ServerError {

        const serverError = new ServerError(
            ErrorCodes.serverError,
            'An unexpected exception occurred in the API',
            exception.stack);
        serverError.setDetails(this.getExceptionDetails(exception));
        return serverError;
    }

    /*
     * Handle requests to API routes that don't exist
     */
    public static fromRequestNotFound(): ClientError {

        return new ClientError(
            404,
            ErrorCodes.requestNotFound,
            'An API request was sent to a route that does not exist');
    }

    /*
     * Handle the error for key identifier lookups
     */
    public static fromJwksDownloadError(exception: any, url: string): ServerError {

        const error = new ServerError(
            ErrorCodes.jwksDownloadError,
            'Problem downloading token signing keys',
            exception.stack);

        const details = this.getExceptionDetails(exception);
        error.setDetails(`${details}, URL: ${url}`);
        return error;
    }

    /*
     * The error thrown if we cannot find an expected claim during OAuth processing
     */
    public static fromMissingClaim(claimName: string): ServerError {

        const error = new ServerError(ErrorCodes.insufficientScope, 'Authorization Data Not Found');
        error.setDetails(`An empty value was found for the expected claim ${claimName}`);
        return error;
    }

    /*
     * Get the message from an exception
     */
    private static getExceptionDetails(exception: any): string {

        // Prefer to return a code and message
        const code = exception?.code || exception?.cause?.code || '';
        const message = exception.message || '';

        const parts = [];
        if (code) {
            parts.push(code);
        }
        if (code) {
            parts.push(message);
        }

        if (parts.length > 0) {
            return parts.join(', ');
        }

        // Otherwise get raw details and avoid returning [object Object]
        const details = exception.toString();
        if (details !== {}.toString()) {
            return details;
        }

        return '';
    }
}
