/*
 * Imports
 */
'use strict';
const express = require('express');
const WebServer = require('./webServer');
const WebApi = require('./logic/webApi');

/*
 * Read configuration
 */
const apiConfig = require('../api.config.json');

/*
 * Create the express app
 */
const expressApp = express();

/*
 * Configure the web server
 */
let webServer = new WebServer(expressApp);
webServer.configureRoutes();

/*
 * Configure the API
 */
var api = new WebApi(expressApp, apiConfig);
api.configureRoutes();

/*
 * Start listening for HTTP requests
 */
expressApp.listen(apiConfig.app.port, () => {
    console.log(`Server is listening on HTTP port ${apiConfig.app.port}`);
});