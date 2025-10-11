import fs from 'node:fs/promises';
import {ErrorCodes} from '../errors/errorCodes.js';
import {ServerError} from '../errors/serverError.js';

/*
 * A simple utility to deal with the infrastructure of reading JSON files
 */
export class JsonFileReader {

    /*
     * Read the data and handle errors
     */
    public async readData<T>(filePath: string): Promise<T> {

        try {

            const json = await fs.readFile(filePath, 'utf-8');
            return JSON.parse(json) as T;

        } catch (e: any) {

            throw new ServerError(ErrorCodes.fileReadError, `Problem encountered reading file ${filePath}`, e.stack);
        }
    }
}
