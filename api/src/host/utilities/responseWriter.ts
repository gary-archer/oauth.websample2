import {Response} from 'express';
import {ClientError} from '../../logic/errors/clientError.js';

/*
 * Helper methods to write the response
 */
export class ResponseWriter {

    /*
     * Return data to the caller
     */
    public static writeSuccessResponse(response: Response, statusCode: number, data: any): void {

        response.setHeader('content-type', 'application/json');
        response.status(statusCode).send(JSON.stringify(data));
    }

    /*
     * This blog's clients read a JSON response, to handle OAuth errors in the same way as other errors
     * Also add the standard www-authenticate header for interoperability
     */
    public static writeErrorResponse(response: Response, error: ClientError, scope: string): void {

        if (error.getStatusCode() === 401) {
            response.setHeader(
                'www-authenticate',
                `Bearer error="${error.getStatusCode()}", error_description="${error.message}"`);
        }

        if (error.getStatusCode() === 403) {
            response.setHeader(
                'www-authenticate',
                `Bearer error="${error.getStatusCode()}", error_description="${error.message}", scope="${scope}"`);
        }

        response.setHeader('content-type', 'application/json');
        response.status(error.getStatusCode()).send(JSON.stringify(error.toResponseFormat()));
    }

    /*
     * Write an error response for not found routes
     */
    public static writeNotFoundErrorResponse(response: Response, error: ClientError): void {

        response.setHeader('content-type', 'application/json');
        response.status(error.getStatusCode()).send(JSON.stringify(error.toResponseFormat()));
    }
}
