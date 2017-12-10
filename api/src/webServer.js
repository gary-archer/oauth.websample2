'use strict';
const path = require('path');
const WebFilesRoot = '../../';

/*
 * A primitive web server for our simple web content
 */
class WebServer {

    /*
     * Class setup
     */
    constructor(expressApp) {
        this._expressApp = expressApp;
    }

    /*
     * Set up Web API listening
     */
    configureRoutes() {
        
        this._expressApp.get('/spa/*', this._getWebResource);
        this._expressApp.get('/spa', this._getWebRootResource);
        this._expressApp.get('/favicon.ico', this._getFavicon);
    }

    /*
     * Serve up the requested web file
     */
    _getWebResource(request, response) {
        
        let resourcePath = request.path.replace('spa/', '');
        if (resourcePath === '/') {
            resourcePath = 'index.html';
        }
        
        let webFilePath = path.join(`${__dirname}/${WebFilesRoot}/spa/${resourcePath}`);
        response.sendFile(webFilePath);
    }

    /*
        * Serve up the requested web file
        */
    _getWebRootResource(request, response) {
        
        let webFilePath = path.join(`${__dirname}/${WebFilesRoot}/spa/index.html`);
        response.sendFile(webFilePath);
    }

    /*
        * Serve up our favicon
        */
    _getFavicon(request, response) {
        
        let webFilePath = path.join(`${__dirname}/${WebFilesRoot}/spa/favicon.ico`);
        response.sendFile(webFilePath);
    }
}

module.exports = WebServer;