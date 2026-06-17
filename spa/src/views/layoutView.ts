import {DomUtils} from './domUtils';

/*
 * Create the parent layout view with spacing from the edge of the browser
 */
export class LayoutView {

    public load(): void {
        DomUtils.createDiv('#root', 'container', 'sm:px-8 md:px-16 lg:px-24 py-2');
    }
}
