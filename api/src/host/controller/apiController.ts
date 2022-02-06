import {NextFunction, Request, Response} from 'express';
import onHeaders from 'on-headers';
import {ClaimsPrincipal} from '../../logic/entities/claims/claimsPrincipal';
import {ClientError} from '../../logic/errors/clientError';
import {ErrorCodes} from '../../logic/errors/errorCodes';
import {CompanyRepository} from '../../logic/repositories/companyRepository';
import {CompanyService} from '../../logic/services/companyService';
import {UserInfoService} from '../../logic/services/userInfoService';
import {JsonFileReader} from '../../logic/utilities/jsonFileReader';
import {ClaimsCache} from '../claims/claimsCache';
import {SampleCustomClaimsProvider} from '../claims/sampleCustomClaimsProvider';
import {Configuration} from '../configuration/configuration';
import {ErrorFactory} from '../errors/errorFactory';
import {ExceptionHandler} from '../errors/exceptionHandler';
import {Authenticator} from '../oauth/authenticator';
import {Authorizer} from '../oauth/authorizer';
import {ScopeVerifier} from '../oauth/scopeVerifier';
import {HttpProxy} from '../utilities/httpProxy';
import {ResponseWriter} from '../utilities/responseWriter';

/*
 * A class to route API requests to business logic classes
 */
export class ApiController {

    private readonly _configuration: Configuration;
    private readonly _claimsCache: ClaimsCache;
    private readonly _httpProxy: HttpProxy;

    public constructor(configuration: Configuration) {

        this._httpProxy = new HttpProxy(configuration);
        this._configuration = configuration;
        this._claimsCache = new ClaimsCache(this._configuration.oauth);
        this._setupCallbacks();
    }

    /*
     * The entry point for authorization and claims handling
     */
    public async authorizationHandler(request: Request, response: Response, next: NextFunction): Promise<void> {

        // Create authorization related classes on every API request
        const authenticator = new Authenticator(this._configuration.oauth, this._httpProxy);
        const customClaimsProvider = new SampleCustomClaimsProvider();
        const authorizer = new Authorizer(this._claimsCache, authenticator, customClaimsProvider);

        // Call the authorizer to do the work
        const claims = await authorizer.authorizeRequestAndGetClaims(request);

        // On success, set claims against the request context and move on to the service logic
        response.locals.claims = claims;
        next();
    }

    /*
     * Return the user info claims from authorization
     */
    public async getUserInfo(request: Request, response: Response): Promise<void> {

        // Check that the access token allows access to this type of data
        const claims = this._getClaims(response);

        // First check scopes
        ScopeVerifier.enforce(claims.token.scopes, 'profile');

        // Create a user service and ask it for the user info
        const service = new UserInfoService(claims.userInfo);
        ResponseWriter.writeObjectResponse(response, 200, service.getUserInfo());
    }

    /*
     * Return a list of companies
     */
    public async getCompanyList(request: Request, response: Response): Promise<void> {

        // Check that the access token allows access to this type of data
        const claims = this._getClaims(response);
        ScopeVerifier.enforce(claims.token.scopes, 'transactions_read');

        // Create the service instance and its dependencies on every API request
        const reader = new JsonFileReader();
        const repository = new CompanyRepository(reader);
        const service = new CompanyService(repository, claims.custom);

        // Get the data and return it in the response
        const result = await service.getCompanyList();
        ResponseWriter.writeObjectResponse(response, 200, result);
    }

    /*
     * Return company transactions
     */
    public async getCompanyTransactions(request: Request, response: Response): Promise<void> {

        // Check that the access token allows access to this type of data
        const claims = this._getClaims(response);
        ScopeVerifier.enforce(claims.token.scopes, 'transactions_read');

        // Create the service instance and its dependencies on every API request
        const reader = new JsonFileReader();
        const repository = new CompanyRepository(reader);
        const service = new CompanyService(repository, claims.custom);

        // Get the supplied id as a number, and return 400 if invalid input was received
        const id = parseInt(request.params.id, 10);
        if (isNaN(id) || id <= 0) {
            throw new ClientError(
                400,
                ErrorCodes.invalidCompanyId,
                'The company id must be a positive numeric integer');
        }

        const result = await service.getCompanyTransactions(id);
        ResponseWriter.writeObjectResponse(response, 200, result);
    }

    /*
     * Remove the ETag header from API responses
     */
    /* eslint-disable @typescript-eslint/no-unused-vars */
    public onWriteHeaders(
        request: Request,
        response: Response,
        next: NextFunction): void {

        onHeaders(response, () => response.removeHeader('ETag'));
        next();
    }

    /*
     * Handle requests to routes that do not exist, by logging the error and returning a client response
     */
    /* eslint-disable @typescript-eslint/no-unused-vars */
    public onRequestNotFound(
        request: Request,
        response: Response,
        next: NextFunction): void {

        const clientError = ErrorFactory.fromRequestNotFound();
        ExceptionHandler.handleError(clientError, response);

        ResponseWriter.writeObjectResponse(
            response,
            clientError.statusCode,
            clientError.toResponseFormat());
    }

    /*
     * Handle exceptions thrown by the API, by logging the error and returning a client response
     */
    public onException(
        unhandledException: any,
        request: Request,
        response: Response): void {

        const clientError = ExceptionHandler.handleError(unhandledException, response);

        ResponseWriter.writeObjectResponse(
            response,
            clientError.statusCode,
            clientError.toResponseFormat());
    }

    /*
     * A helper utility to get typed claims
     */
    private _getClaims(response: Response): ClaimsPrincipal {
        return response.locals.claims;
    }

    /*
     * Set up async callbacks
     */
    private _setupCallbacks(): void {
        this.authorizationHandler = this.authorizationHandler.bind(this);
        this.getUserInfo = this.getUserInfo.bind(this);
        this.getCompanyList = this.getCompanyList.bind(this);
        this.getCompanyTransactions = this.getCompanyTransactions.bind(this);
    }
}
