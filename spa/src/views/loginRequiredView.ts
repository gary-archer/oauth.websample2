import $ from 'jquery';

/*
 * Logic related to the simple logout view
 */
export class LoginRequiredView {

    /*
     * Show logout details when the view loads
     */
    public async load(): Promise<void> {

        const html =
            `<div class='row'>
                <div class='col-12 text-center mx-auto'>
                    <h5>You are logged out - click HOME to sign in ...</h5>
                </div>
            </div>`;
        $('#main').html(html);
    }
}
