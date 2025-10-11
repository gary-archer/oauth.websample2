import express from 'express';
import fs from 'node:fs/promises';
import {Configuration} from '../configuration/configuration.js';
import {ErrorFactory} from '../errors/errorFactory.js';
import {ApiLogger} from '../logging/apiLogger.js';
import {HttpServerConfiguration} from './httpServerConfiguration.js';

const logger = new ApiLogger();
try {

    // First load configuration
    const apiConfigJson = await fs.readFile('api.config.json', 'utf-8');
    const apiConfig = JSON.parse(apiConfigJson) as Configuration;

    // Next configure web server behaviour
    const expressApp = express();
    const httpServer = new HttpServerConfiguration(expressApp, apiConfig, logger);
    await httpServer.initializeApi();

    // We will also host web static content
    httpServer.initializeWebStaticContentHosting();

    // Start receiving requests
    await httpServer.startListening();

} catch (e: any) {

    // Report startup errors
    const error = ErrorFactory.fromServerError(e);
    logger.startupError(error);
}
