import Handlebars from 'handlebars';
import $ from 'jquery';
import {ErrorCodes} from '../plumbing/errors/errorCodes';
import {ErrorHandler} from '../plumbing/errors/errorHandler';
import {ErrorReporter} from '../plumbing/errors/errorReporter';
import {UIError} from '../plumbing/errors/uiError';

/*
 * The error view renders error details
 */
export class ErrorView {

    public constructor() {
        this._setupCallbacks();
    }

    /*
     * Do the initial render
     */
    public load(): void {

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
                <div id='errorform'  class='col-12'>
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

        // Get error details ready for display
        const reporter = new ErrorReporter();
        const viewModel = {
            title: reporter.getErrorTitle(error),
            lines: reporter.getErrorLines(error),
        };

        // Render the title
        const titleTemplate = Handlebars.compile(`{{title}}`);
        const titleHtml = titleTemplate(viewModel);
        $('#errortitle').html(titleHtml);

        // Render the lines
        const htmlTemplate =
        `{{#each this}}
            <div class='row'>
                <div class='col-4'>
                    {{title}}
                </div>
                <div class='col-8 valuecolor font-weight-bold'>
                    {{value}}
                </div>
            </div>
        {{/each}}`;

        const linesTemplate = Handlebars.compile(htmlTemplate);
        const linesHtml = linesTemplate(viewModel.lines);
        $('#errorform').html(linesHtml);
    }

    /*
     * Plumbing to make the this parameter available in callbacks
     */
    private _setupCallbacks(): void {
        this.clear = this.clear.bind(this);
   }
}
