import moment from 'moment';
import {ErrorLine} from './errorLine';
import {UIError} from './uiError';

/*
 * For silent token renewal errors we avoid impacting the end user and output to the console
 */
export class ErrorReporter {

    /*
     * Return a title for display
     */
    public getErrorTitle(error: UIError): string {
        return error.message;
    }

    /*
     * Get error fields for display
     */
    public getErrorLines(error: UIError): ErrorLine[] {

        const lines: ErrorLine[] = [];

        // Display technical details that are OK to show to users
        if (error.area.length > 0) {
            lines.push(this._createErrorLine('Area', error.area));
        }

        if (error.errorCode.length > 0) {
            lines.push(this._createErrorLine('Error Code', error.errorCode));
        }

        if (error.statusCode > 0) {
            lines.push(this._createErrorLine('Status Code', error.statusCode.toString()));
        }

        if (error.instanceId > 0) {
            lines.push(this._createErrorLine('Id', error.instanceId.toString()));
        }

        if (error.utcTime.length > 0) {
            const displayTime = moment(error.utcTime).format('DD MMM YYYY HH:mm:ss');
            lines.push(this._createErrorLine('UTC Time', displayTime));
        }

        if (error.details.length > 0) {
            lines.push(this._createErrorLine('Details', error.details));
        }

        if (error.url.length > 0) {
            lines.push(this._createErrorLine('URL', error.url));
        }

        // In debug builds render the stack trace as a long string
        // We can then look up results at https://sourcemaps.info
        if (SHOW_STACK_TRACE) {
            if (error.stack) {
                lines.push(this._createErrorLine('Stack', error.stack));
            }
        }

        return lines;
    }

    /*
     * For silent token renewal errors we avoid impacting the end user and output to the console
     */
    public outputToConsole(error: UIError) {

        const lines = this.getErrorLines(error);
        lines.forEach((l) => {
            console.log(`${l.title}: ${l.value}`);
        });
    }

    /*
     * Return an error line as an object
     */
    private _createErrorLine(title: string, value: string): ErrorLine {

        return {
            title,
            value,
        } as ErrorLine;
    }
}
