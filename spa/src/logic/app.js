'use strict';
import Authenticator from 'authenticator';
import HttpClient from 'httpClient';
import ListView from 'listView';
import DetailsView from 'detailsView';
import UrlHelper from 'urlHelper';
import ErrorHandler from 'errorHandler';
import $ from 'jquery';

/*
 * The application class
 */
class App {
    
    /*
     * Class setup
     */
    constructor() {
        // Create class members
        this._appConfig = null;
        this._authenticator = null;
        
        // Initialize
        this._setupCallbacks();
    }
    
    /*
     * The entry point for the SPA
     */
    execute() {
        
        // Set up click handlers
        $('#btnHome').click(this._onHome);
        $('#btnRefreshData').click(this._onRefreshData);
        $('#btnExpireAccessToken').click(this._onExpireToken);
        
        // Download configuration, then handle login, then handle login responses
        this._getAppConfig()
            .then(this._configureAuthentication)
            .then(this._handleLoginResponse)
            .then(this._getUserClaims)
            .then(this._runPage)
            .catch(e => { ErrorHandler.reportError(e); });
    }
    
    /*
     * Download application configuration
     */
    _getAppConfig()  {
        return HttpClient.loadAppConfiguration('spa.config.json')
        .then(config => {
            this._appConfig = config;
            return Promise.resolve();
        });
    }
    
    /*
     * Point OIDC logging to our application logger and then supply OAuth settings
     */
    _configureAuthentication() {
        this._authenticator = new Authenticator(this._appConfig.oauth);
    }
    
    /*
     * Handle login responses on page load and get claims from our API afterwards
     */
    _handleLoginResponse() {
        
        return this._authenticator.handleLoginResponse();
    }
    
    /*
     * Download user claims from the API, which can contain any data we like
     */
    _getUserClaims() {
        
        return HttpClient.callApi(`${this._appConfig.app.api_base_url}/userclaims/current`, 'GET', null, this._authenticator)
            .then(claims => {
                if (claims.given_name && claims.family_name) {
                    $('#loginInfoContainer').removeClass('hide');
                    $('#userName').text(`${claims.given_name} ${claims.family_name}`);
                }
                return Promise.resolve();
            });
    }

    /*
     * Once login startup login processing has completed, start listening for hash changes
     */
    _runPage() {
        return this._executeView().then(() => {
            $(window).on('hashchange', this._onHashChange);
        });
    }
    
    /*
     * Execute a view based on the hash URL data
     */
    _executeView() {
        
        let hashData = UrlHelper.getLocationHashData();
        if (!hashData.golfer) {
            let listView = new ListView(this._authenticator, this._appConfig.app.api_base_url);
            return listView.execute();
        }
        else {
            let detailsView = new DetailsView(this._authenticator, this._appConfig.app.api_base_url, hashData.golfer);
            return detailsView.execute();
        }
    }
    
    /*
     * Change the view based on the hash URL and catch errors
     */
    _onHashChange() {
        this._executeView()
            .catch(e => { ErrorHandler.reportError(e); });
    }
    
    /*
     * Button handler to reset the hash location to the list view and refresh
     */
    _onHome() {
        location.hash = '#';
    }
    
    /*
     * Force a page reload
     */
    _onRefreshData() {
        this._executeView()
            .catch(e => { ErrorHandler.reportError(e); });
    }
    
    /*
     * Force a new access token to be retrieved
     */
    _onExpireToken() {
        this._authenticator.clearAccessToken();
    }
    
    /*
     * Plumbing to ensure that the this parameter is available in async callbacks
     */
    _setupCallbacks() {
        this._configureAuthentication = this._configureAuthentication.bind(this);
        this._handleLoginResponse = this._handleLoginResponse.bind(this);
        this._getUserClaims = this._getUserClaims.bind(this);
        this._runPage = this._runPage.bind(this);
        this._executeView = this._executeView.bind(this);
        this._onHashChange = this._onHashChange.bind(this);
        this._onRefreshData = this._onRefreshData.bind(this);
        this._onExpireToken = this._onExpireToken.bind(this);
   }
}

/*
 * Start the application
 */
let app = new App();
app.execute();