import mustache from 'mustache';
import {ErrorCodes} from '../plumbing/errors/errorCodes';
import {ErrorFactory} from '../plumbing/errors/errorFactory';
import {ErrorField} from '../plumbing/errors/errorField';
import {ErrorFormatter} from '../plumbing/errors/errorFormatter';
import {UIError} from '../plumbing/errors/uiError';
import {DomUtils} from './domUtils';

/*
 * The error view renders error details
 */
export class ErrorView {

    public constructor() {
        this.setupCallbacks();
    }

    /*
     * Do the initial render to create the HTML, which remains hidden until there is an error
     */
    public load(): void {

        DomUtils.createDiv('#container', 'errorcontainer');
        const html =
            `<div class='bg-white rounded-lg mt-3'>
                <div class='grid grid-cols-12'>
                    <div class='col-span-2'>
                    </div>    
                    <div id='errortitle' class='col-span-8 text-red-600 text-2xl text-center'>
                    </div>
                    <div class='col-span-2 text-right p-3'>
                        <button id='btnClearError' type='button'>x</button>
                    </div>
                </div>
                <div id='errorform' class='items-center mt-5'>
                </div>
            </div>`;

        DomUtils.html('#errorcontainer', html);
        DomUtils.hide('#errorcontainer');
        DomUtils.onClick('#btnClearError', this.clear);
    }

    /*
     * Do the error rendering given an exception
     */
    public report(exception: any): void {

        // Get the error into an object
        const error = ErrorFactory.getFromException(exception);
        if (error.getErrorCode() == ErrorCodes.loginRequired) {

            // Do not render this error and instead move to the login required view
            location.hash = '#loggedout';

        } else {

            // Otherwise render the error
            this.renderError(error);
        }
    }

    /*
     * Clear content and hide error details
     */
    public clear(): void {
        DomUtils.text('#errortitle', '');
        DomUtils.text('#errorform', '');
        DomUtils.hide('#errorcontainer');
    }

    /*
     * Render the error to the UI
     */
    private renderError(error: UIError): void {

        // Clear content and make the form visible
        DomUtils.text('#errortitle', '');
        DomUtils.text('#errorform', '');
        DomUtils.show('#errorcontainer');

        // Render the title
        DomUtils.text('#errortitle', 'Problem Encountered');

        // Render the error fields
        const errorHtml =
            this.getFieldsHtml(ErrorFormatter.getErrorFields(error)) +
            this.getStackHtml(ErrorFormatter.getErrorStack(error));
        DomUtils.html('#errorform', errorHtml);
    }

    /*
     * Get the HTML for the error fields
     */
    private getFieldsHtml(fields: ErrorField[]): string {

        const htmlTemplate =
            `{{#fields}}
                <div class='grid grid-cols-12 px-3 mt-3'>
                    <div class='col-span-4'>
                        {{label}}
                    </div>
                    {{#isUserAction}}
                        <div class='col-span-8 text-green-700 font-bold'>
                            {{value}}
                        </div>
                    {{/isUserAction}}
                    {{#isValue}}
                        <div class='col-span-8 text-blue-700 font-bold'>
                            {{value}}
                        </div>
                    {{/isValue}}
                    {{#isIdentifier}}
                        <div class='col-span-8 text-red-700 font-bold'>
                            {{value}}
                        </div>
                    {{/isIdentifier}}
                </div>
            {{/fields}}`;

        return mustache.render(htmlTemplate, {fields: fields});
    }

    /*
     * Get the HTML for the error stack trace
     */
    private getStackHtml(field: ErrorField | null): string {

        if (!field) {
            return '';
        }

        const htmlTemplate =
            `<div class='grid grid-cols-12 px-3 mt-3' />
                 <div class='col-span-4'>
                     {{label}}
                 </div>
                 <div class='col-span-8'>
                    <span class='text-sm'>{{value}}</span>
                 </div>
             </div>`;

        return mustache.render(htmlTemplate, field);
    }

    /*
     * Plumbing to make the this parameter available in callbacks
     */
    private setupCallbacks(): void {
        this.clear = this.clear.bind(this);
    }
}
