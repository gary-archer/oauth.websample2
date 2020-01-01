import Handlebars from 'handlebars';
import $ from 'jquery';

/*
 * Logic related to the simple logout view
 */
export class LogoutView {

    /*
     * Show logout details when the view loads
     */
    public async load(): Promise<void> {

        // Construct a Handlebars template
        const htmlTemplate =
        `<div class='row'>
            <div class='col-xs-12'>
                <h5>You are logged out - click <a href='#'>here</a> to log back in ...</h5>
            </div>
        </div>`;

        // Update the main elemnent's content with default data
        const template = Handlebars.compile(htmlTemplate);
        const html = template({});
        $('#main').html(html);
    }
}
