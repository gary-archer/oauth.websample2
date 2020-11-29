import $ from 'jquery';
import mustache from 'mustache';
import {ErrorCodes} from '../plumbing/errors/errorCodes';
import {ErrorHandler} from '../plumbing/errors/errorHandler';
import {ErrorFormatter} from '../plumbing/errors/errorFormatter';
import {ErrorLine} from '../plumbing/errors/errorLine';
import {UIError} from '../plumbing/errors/uiError';

/*
 * The error view renders error details
 */
export class ErrorView {

    /*
     * Do the initial render
     */
    public load(): void {

        // Render the containing HTML
        const html =
            `<div class='card border-0'>
                <div class='row'>
                    <div id='errortitle' class='col-10 errorcolor largetext font-weight-bold text-center'>
                    </div>
                    <div class='col-2 text-right'>
                        <button id='btnClearError' type='button'>x</button>
                    </div>
                </div>
                <div class='row card-body'>
                    <div id='errorform' class='col-12'>
                    </div>
                </div>
            </div>`;
        $('#errorcontainer').html(html);
        $('#errorcontainer').hide();

        // Set up click handlers
        $('#btnClearError').click(this.clear);
    }

    /*
     * Do the error rendering given an exception
     */
    public report(exception: any): void {

        // Get the error into an object
        const error = ErrorHandler.getFromException(exception) as UIError;

        // Do not render if we are just short circuiting page execution to start a login redirect
        if (error.errorCode !== ErrorCodes.loginRequired) {

            // Otherwise render the error fields
            this._renderError(error);
        }
    }

    /*
     * Clear content and hide error details
     */
    public clear(): void {
        $('#errorform').html('');
        $('#errortitle').html('');
        $('#errorcontainer').hide();
    }

    /*
     * Render the error to the UI
     */
    private _renderError(error: UIError): void {

        // Clear content and make the form visible
        $('#errorform').html('');
        $('#errortitle').html('');
        $('#errorcontainer').show();

        // Render the title
        $('#errortitle').html('Problem Encountered');

        // Render the error fields
        const errorHtml =
            this._getLinesHtml(ErrorFormatter.getErrorLines(error)) +
            this._getStackHtml(ErrorFormatter.getErrorStack(error));
        $('#errorform').html(errorHtml);
    }

    /*
     * Get the HTML for the error lines
     */
    private _getLinesHtml(errorLines: ErrorLine[]): string {

        const htmlTemplate =
            `{{#lines}}
                <div class='row'>
                    <div class='col-4'>
                        {{label}}
                    </div>
                    <div class='col-8 valuecolor font-weight-bold'>
                        {{value}}
                    </div>
                </div>
            {{/lines}}`;

        return mustache.render(htmlTemplate, {lines: errorLines});
    }

    /*
     * Get the HTML for the error stack trace
     */
    private _getStackHtml(stackLine: ErrorLine | null): string {

        if (!stackLine) {
            return '';
        }

        const htmlTemplate =
            `<div class='row' />
                <div class='col-4'>
                    &nbsp;
                </div>
                <div class='col-8'>
                    &nbsp;
                </div>
            </div>
            <div class='row' />
                 <div class='col-4'>
                     {{label}}
                 </div>
                 <div class='col-8 small'>
                     {{value}}
                 </div>
             </div>`;

        return mustache.render(htmlTemplate, stackLine);
    }
}
