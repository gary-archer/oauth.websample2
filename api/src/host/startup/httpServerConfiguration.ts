import cors from 'cors';
import express from 'express';
import {Application} from 'express';
import fs from 'fs-extra';
import https from 'https';
import {Configuration} from '../configuration/configuration.js';
import {ApiController} from '../controller/apiController.js';
import {ApiLogger} from '../logging/apiLogger.js';

/*
 * Configure HTTP behaviour at application startup
 */
export class HttpServerConfiguration {

    private readonly _express: Application;
    private readonly _configuration: Configuration;
    private readonly _apiLogger: ApiLogger;
    private readonly _apiController: ApiController;

    public constructor(expressApp: Application, configuration: Configuration, logger: ApiLogger) {

        this._express = expressApp;
        this._configuration = configuration;
        this._apiLogger = logger;
        this._apiController = new ApiController(this._configuration);
    }

    /*
     * Set up Web API routes and initialize the API
     */
    public async initializeApi(): Promise<void> {

        // Grant API access to the web origin
        const corsOptions = {
            origin: this._configuration.api.trustedOrigins,
            maxAge: 86400,
        };
        this._express.use('/api/*_', cors(corsOptions));
        this._express.use('/api/*_', this._apiController.onWriteHeaders);

        // Add cross cutting concerns
        this._express.use('/api/*_', this._apiLogger.logRequest);
        this._express.use('/api/*_', this._apiController.authorizationHandler);

        // API routes containing business logic
        this._express.get('/api/userinfo', this._apiController.getUserInfo);
        this._express.get('/api/companies', this._apiController.getCompanyList);
        this._express.get('/api/companies/:id/transactions', this._apiController.getCompanyTransactions);

        // Handle errors after routes are defined
        this._express.use('/api/*_', this._apiController.onRequestNotFound);
        this._express.use('/api/*_', this._apiController.onException);
    }

    /*
     * For code sample simplicity, the API serves web content, though a real API would not do this
     */
    public initializeWebStaticContentHosting(): void {

        this._express.use('/spa', express.static('../spa'));
        this._express.use('/favicon.ico', express.static('../spa/favicon.ico'));
    }

    /*
     * Start serving requests
     */
    public async startListening(): Promise<void> {

        const port = this._configuration.api.port;
        if (this._configuration.api.sslCertificateFileName && this._configuration.api.sslCertificatePassword) {

            // Load the certificate file from disk
            const pfxFile = await fs.readFile(this._configuration.api.sslCertificateFileName);
            const sslOptions = {
                pfx: pfxFile,
                passphrase: this._configuration.api.sslCertificatePassword,
            };

            // Start listening on HTTPS
            const httpsServer = https.createServer(sslOptions, this._express);
            httpsServer.listen(port, () => {
                console.log(`API is listening on HTTPS port ${port}`);
            });

        } else {

            // Otherwise listen over HTTP
            this._express.listen(port, () => {
                console.log(`API is listening on HTTP port ${port}`);
            });
        }
    }
}
