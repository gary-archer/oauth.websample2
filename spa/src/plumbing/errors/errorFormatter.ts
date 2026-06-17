import {ErrorField} from './errorField';
import {UIError} from './uiError';

/*
 * A class to manage error formatting
 */
export class ErrorFormatter {

    /*
     * Get error fields ready with formatted values
     */
    public static getErrorFields(error: UIError): ErrorField[] {

        const fields: ErrorField[] = [];

        // Display technical details that are OK to show to users
        if (error.message.length > 0) {
            fields.push(ErrorFormatter.createUserActionField('User Message', error.message));
        }

        if (error.getArea().length > 0) {
            fields.push(ErrorFormatter.createValueField('Area', error.getArea()));
        }

        if (error.getErrorCode().length > 0) {
            fields.push(ErrorFormatter.createValueField('Error Code', error.getErrorCode()));
        }

        if (error.getStatusCode() > 0) {
            fields.push(ErrorFormatter.createValueField('Status Code', error.getStatusCode().toString()));
        }

        if (error.getInstanceId() > 0) {
            fields.push(ErrorFormatter.createIdentifierField('Id', error.getInstanceId().toString()));
        }

        if (error.getUtcTime().length > 0) {

            const errorTime = Date.parse(error.getUtcTime());
            const displayTime = new Date(errorTime).toLocaleString('en', {
                timeZone: 'utc',
                day: '2-digit',
                month: 'short',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                hour12: false,
            }).replace(/,/g, '');
            fields.push(ErrorFormatter.createValueField('UTC Time', displayTime));
        }

        if (error.getDetails().length > 0) {
            fields.push(ErrorFormatter.createValueField('Details', error.getDetails()));
        }

        if (error.getUrl().length > 0) {
            fields.push(ErrorFormatter.createValueField('URL', error.getUrl()));
        }

        return fields;
    }

    /*
     * Return the stack separately, since it is rendered in smaller text
     */
    public static getErrorStack(error: UIError): ErrorField | null {

        // In debug builds render the stack trace as a long string
        // We can then look up results at https://sourcemaps.info
        if (IS_DEBUG) {
            if (error.stack) {
                return ErrorFormatter.createValueField('Stack', error.stack);
            }
        }

        return null;
    }

    /*
     * Create an error field to represent a user action
     */
    private static createUserActionField(label: string, value: string): ErrorField {

        return {
            label,
            value,
            isUserAction: true,
            isValue: false,
            isIdentifier: false,
        };
    }

    /*
     * Create a field representing a normal error value
     */
    private static createValueField(label: string, value: string): ErrorField {

        return {
            label,
            value,
            isUserAction: false,
            isValue: true,
            isIdentifier: false,
        };
    }

    /*
     * Create a field representing an error identifier
     */
    private static createIdentifierField(label: string, value: string): ErrorField {

        return {
            label,
            value,
            isUserAction: false,
            isValue: false,
            isIdentifier: true,
        };
    }
}
