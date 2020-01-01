import $ from 'jquery';
import {Configuration} from '../configuration/configuration';
import {ErrorHandler} from '../plumbing/errors/errorHandler';

/*
 * Logic related to making HTTP calls
 */
export class ConfigurationLoader {

    /*
     * Download JSON data from the app config file
     */
    public static async download(url: string): Promise<Configuration> {

        try {

            return await $.ajax({
                url,
                type: 'GET',
                dataType: 'json',
            }) as Configuration;

        } catch (xhr) {

            // Capture error details
            throw ErrorHandler.getFromWebDownloadError(xhr, url);
        }
    }
}
