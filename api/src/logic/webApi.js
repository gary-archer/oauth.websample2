'use strict';
const cors = require('cors');

// Import our class definitions
const IcoRepository = require('./icoRepository');
const ClaimsHandler = require('../plumbing/claimsHandler');
const ErrorHandler = require('../plumbing/errorHandler');
const ApiLogger = require('../plumbing/apiLogger');

/*
 * A Web API class to manage routes
 */
class WebApi {

    /*
     * Class setup
     */
    constructor(expressApp, apiConfig) {
        
        // Store fields
        this._expressApp = expressApp;
        this._apiConfig = apiConfig;

        // Configure cross origin requests
        let corsOptions = { origin: apiConfig.app.trusted_origins };
        this._expressApp.use('/api/*', cors(corsOptions));
        
        // Set up the API logger
        ApiLogger.initialize();
        this._setupCallbacks();
    }

    /*
     * Set up Web API routes
     */
    configureRoutes() {
        
        // First do token validation and claims handling
        this._expressApp.get('/api/*', this._claimsMiddleware);
        
        // Next process API operations
        this._expressApp.get('/api/userclaims/current', this._getUserClaims);
        this._expressApp.get('/api/icos', this._getIcoList);
        this._expressApp.get('/api/icos/:contract_address', this._getIcoTransactions);
        
        // Unhandled exceptions
        this._expressApp.use('/api/*', this._unhandledExceptionMiddleware);
    }

    /*
     * The first middleware is for token validation and claims handling, which occurs before business logic
     */
    _claimsMiddleware(request, response, next) {

        response.setHeader('Content-Type', 'application/json');
        ApiLogger.info('API call', 'Processing claims'); 

        // Do the validation and get claims
        let handler = new ClaimsHandler(this._apiConfig.oauth);
        handler.validateTokenAndGetClaims(request.header('authorization'))
            .then(claims => {

                // Set resulting claims for the API operation
                response.locals.claims = claims;
                next();
            })
            .catch(e => {

                // Ensure promises are rejected correctly
                this._writeResponseError(e, response);
            });
    }
    
    /*
     * Return user info to the UI
     */
    _getUserClaims(request, response, next) {

        // Get all server claims
        let serverClaims = response.locals.claims;

        // Return information useful to the UI
        let uiClaims = {
            given_name: serverClaims.given_name,
            family_name: serverClaims.family_name,
            email: serverClaims.email
        };

        response.end(JSON.stringify(uiClaims));
    }

    /*
     * Return the list of ICOs
     */
    _getIcoList(request, response, next) {
        
        let repository = new IcoRepository();
        ApiLogger.info('API call', 'Request for ICO list');
        
        let icos = repository.getList();
        response.end(JSON.stringify(icos));
    }

    /*
     * Return the details for a transaction
     */
    _getIcoTransactions(request, response, next) {
        
        let repository = new IcoRepository();
        ApiLogger.info('API call', `Request for transaction details for ICO: ${request.params.contract_address}`);
        
        let transaction = repository.getTransactions(request.params.contract_address);
        if (transaction) {
            response.end(JSON.stringify(transaction));
        }
        else {
            response.status(404).send(`The ICO with contract address ${request.params.contract_address} was not found`);
        }
    }

    /*
     * Catch any unhandled exceptions
     */
    _unhandledExceptionMiddleware(unhandledException, request, response, next) {

        this._writeResponseError(unhandledException, response);
    }

    /*
     * Return an error response to the client
     */
    _writeResponseError(exception, response) {

        // Get error details
        let clientInfo = ErrorHandler.handleError(exception);

        // Set the standard header if required
        if (clientInfo.wwwAuthenticate) {
            response.setHeader('WWW-Authenticate', clientInfo.wwwAuthenticate);
        }
        
        // Send the response to the client
        response.status(clientInfo.status).send(JSON.stringify(clientInfo.error));
    }

    /*
     * Set up async callbacks
     */
    _setupCallbacks() {
        this._claimsMiddleware = this._claimsMiddleware.bind(this);
        this._getIcoTransactions = this._getIcoTransactions.bind(this);
        this._unhandledExceptionMiddleware = this._unhandledExceptionMiddleware.bind(this);
        this._writeResponseError = this._writeResponseError.bind(this);
    }
}

module.exports = WebApi;