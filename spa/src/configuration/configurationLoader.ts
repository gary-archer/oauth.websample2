import {Configuration} from '../configuration/configuration';
import {ErrorFactory} from '../plumbing/errors/errorFactory';

/*
 * Logic related to making HTTP calls
 */
export class ConfigurationLoader {

    /*
     * Download JSON data from the app config file
     * For development purposes we use a timestamp to force this on every page reload
     */
    public static async download(fileName: string): Promise<Configuration> {

        const url = `${fileName}?t=${new Date().getTime()}`;
        try {

            const response = await fetch(url);
            if (response.ok) {
                return await response.json() as Configuration;
            }

            throw await ErrorFactory.getFromFetchResponseError(response, 'web host');

        } catch (e: any) {

            throw ErrorFactory.getFromFetchError(e, url, 'web host');
        }
    }
}
