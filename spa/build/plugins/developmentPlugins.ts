import {Plugin} from 'rollup';
import open from 'open';

/*
 * Open the browser when the first development build completes, or notify it to reload
 */
let isOpen = false;
export function notifyBrowser(): Plugin {

    const plugin: Plugin = {
        name: 'notify-browser',
        async writeBundle(): Promise<void> {

            const webHostUrl = 'https://www.authsamples-dev.com';
            if (!isOpen) {

                isOpen = true;
                open(`${webHostUrl}/spa/`);

            } else {

                await fetch(`${webHostUrl}/reload`);
            }
        }
    };

    return plugin;
}
