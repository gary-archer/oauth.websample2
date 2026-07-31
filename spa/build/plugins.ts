import fs from 'node:fs/promises';
import  path from 'path';
import open from 'open';
import {Plugin} from 'rollup';

/*
 * A simple file copy plugin
 */
export function copyFiles(outputDir: string, files: string[]): Plugin {

    return {
        name: 'copy-files',
        writeBundle: {
            sequential: true,
            async handler() {

                for (const file of files) {

                    const targetPath = path.join(outputDir, path.basename(file));
                    await fs.copyFile(file, targetPath);
                }
            },
        },
    };
}

/*
 * Open the browser when the first development build completes, or notify it to reload
 */
let isOpen = false;
export function notifyBrowser(): Plugin {

    const plugin: Plugin = {
        name: 'notify-browser',
        writeBundle: {
            sequential: true,
            async handler() {

                const webHostUrl = 'https://www.authsamples-dev.com';
                if (!isOpen) {

                    isOpen = true;
                    open(`${webHostUrl}/spa/`);

                } else {

                    await fetch(`${webHostUrl}/reload`);
                }
            },
        },
    };

    return plugin;
}
