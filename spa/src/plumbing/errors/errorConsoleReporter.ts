import {ErrorFactory} from './errorFactory';
import {ErrorFormatter} from './errorFormatter';

/*
 * A utility class for errors we don't want to bother the user about
 */
export class ErrorConsoleReporter {

    /*
     * Output error fields as name / value pairs
     */
    public static output(error: any): void {

        const uiError = ErrorFactory.getFromException(error);
        const fields = ErrorFormatter.getErrorFields(uiError);

        fields.forEach((f) => {
            console.log(`${f.label}: ${f.value}`);
        });
    }
}
