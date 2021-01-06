import $ from 'jquery';
import mustache from 'mustache';
import {EventEmitter} from '../plumbing/events/eventEmitter';
import {EventNames} from '../plumbing/events/eventNames';
import {TraceLine} from '../plumbing/oauth/trace/traceLine';

/*
 * The trace view renders OIDC library details
 */
export class TraceView {

    /*
     * Clear the trace initially
     */
    public constructor() {
        this._setupCallbacks();
    }

    /*
     * Initialize trace controls at application startup
     */
    public load(): void {

        const html =
            `<div class='row'>
                <div class='col-1'>
                    <button id='btnClearTrace' type='button'>x</button>
                </div>
                <div class='col-11'>
                    <ul id='trace'></ul>
                </div>
            </div>`;

        $('#tracecontainer').html(html);
        $('#tracecontainer').hide();

        // Wire up the click handler
        $('#btnClearTrace').on('click', this._onClear);

        // Start listening for data to render
        EventEmitter.subscribe(EventNames.ON_TRACE, this._receiveTraceLine);
    }

    /*
     * Append to log output when received
     */
    private _receiveTraceLine(line: TraceLine): void {

        // Construct a template
        const htmlTemplate =
            `<li>
                <span class='font-weight-bold'>{{prefix}}</span>
                <span> {{message}}</span>
            </li>`;

        // Render the HTML and handle dangerous characters securely
        const html = mustache.render(htmlTemplate, line);
        $('#trace').append(html);

        // Make sure controls are visible
        $('#tracecontainer').show();
        const clearButton = $('#btnClearTrace');
        clearButton.show();
    }

    /*
     * Clear the trace list and hide the clear button
     */
    private _onClear(): void {
        $('#tracecontainer').hide();
        $('#trace').html('');
        $('#btnClearTrace').hide();
    }

    /*
     * Plumbing to make the this parameter available in callbacks
     */
    private _setupCallbacks(): void {
        this._onClear = this._onClear.bind(this);
    }
}
