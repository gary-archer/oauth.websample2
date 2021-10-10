import cors from 'cors';
import {Application, NextFunction, Request, Response} from 'express';
import fs from 'fs-extra';
import https from 'https';
import {Configuration} from '../configuration/configuration';
import {ApiController} from '../controller/apiController';
import {ApiLogger} from '../logging/apiLogger';
import {WebStaticContent} from './webStaticContent';

/*
 * Configure HTTP behaviour at application startup
 */
export class HttpServerConfiguration {

    private readonly _expressApp: Application;
    private readonly _configuration: Configuration;
    private readonly _apiLogger: ApiLogger;
    private readonly _apiController: ApiController;
    private readonly _webStaticContent: WebStaticContent;

    public constructor(expressApp: Application, configuration: Configuration, logger: ApiLogger) {
        this._expressApp = expressApp;
        this._configuration = configuration;
        this._apiLogger = logger;
        this._apiController = new ApiController(this._configuration);
        this._webStaticContent = new WebStaticContent();
    }

    /*
     * Set up Web API routes and initialize the API
     */
    public async initializeApi(): Promise<void> {

        // Allow cross origin requests from the SPA and disable API response caching
        const corsOptions = { origin: this._configuration.api.trustedOrigins };
        this._expressApp.use('/api/*', cors(corsOptions) as any);
        this._expressApp.use('/api/*', this._apiController.onWriteHeaders);

        // All API requests are authorized first
        this._expressApp.use('/api/*', this._catch(this._apiLogger.logRequest));
        this._expressApp.use('/api/*', this._catch(this._apiController.authorizationHandler));

        // API routes containing business logic
        this._expressApp.get('/api/userinfo', this._catch(this._apiController.getUserInfo));
        this._expressApp.get('/api/companies', this._catch(this._apiController.getCompanyList));
        this._expressApp.get(
            '/api/companies/:id/transactions',
            this._catch(this._apiController.getCompanyTransactions));

        // Handle failure scenarios
        this._expressApp.use('/api/*', this._apiController.onRequestNotFound);
        this._expressApp.use('/api/*', this._apiController.onException);
    }

    /*
     * The sample also provides some simple hosting of web static content, for convenience
     */
    public initializeWebStaticContentHosting(): void {

        this._expressApp.get('/spa/*', this._webStaticContent.getWebResource);
        this._expressApp.get('/spa', this._webStaticContent.getWebDefaultResource);
        this._expressApp.get('/favicon.ico', this._webStaticContent.getFavicon);
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
            const httpsServer = https.createServer(sslOptions, this._expressApp);
            httpsServer.listen(port, () => {
                console.log(`API is listening on HTTPS port ${port}`);
            });

        } else {

            // Otherwise listen over HTTP
            this._expressApp.listen(port, () => {
                console.log(`API is listening on HTTP port ${port}`);
            });
        }
    }

    /*
     * Deal with Express unhandled promise exceptions during async API requests
     * https://medium.com/@Abazhenov/using-async-await-in-express-with-node-8-b8af872c0016
     */
    private _catch(fn: any): any {

        return (request: Request, response: Response, next: NextFunction) => {

            Promise
                .resolve(fn(request, response, next))
                .catch((e) => {
                    this._apiController.onException(e, request, response);
                });
        };
    }
}
