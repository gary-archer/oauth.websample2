import {Response} from 'express';
import {ClientError} from '../../logic/errors/clientError';

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
     * Return an error to the caller
     */
    public static writeErrorResponse(response: Response, error: ClientError): void {

        // Write standard headers
        response.setHeader('content-type', 'application/json');
        if (error.statusCode === 401) {

            const realm = 'mycompany.com';
            let wwwAuthenticateHeader = `Bearer realm="${realm}"`;
            wwwAuthenticateHeader += `, error="${error.errorCode}"`;
            wwwAuthenticateHeader += `, error_description="${error.message}"`;
            response.setHeader('www-authenticate', wwwAuthenticateHeader);
        }

        // Write the data
        response.status(error.statusCode).send(JSON.stringify(error.toResponseFormat()));
    }
}
