'use strict';
import HttpClient from 'httpClient';
import $ from 'jquery';

/*
 * Logic related to the details view
 */
export default class DetailsView {
    
    /*
     * Construction
     */
    constructor(authenticator, baseUrl, tx_hash) {
        this._authenticator = authenticator;
        this._apiBaseUrl = baseUrl;
        this._tx_hash = tx_hash;
        this._setupCallbacks();
    }
    
    /*
     * Make the request for data
     */
    execute() {
        this._showView();
        return this._getData();
    }
    
    /*
     * Update visibility to show empty content while waiting for data
     */
    _showView() {
        $('#listContainer').addClass('hide');
        $('#detailsContainer').removeClass('hide');

        $('#detailsContainer').text('');
        $('#error').text('');
    }
    
    /*
     * Make the Ajax request
     */
    _getData() {
        
        // Call the API
        let url = `${this._apiBaseUrl}/transactions/${this._tx_hash}`;
        return HttpClient.callApi(url, 'GET', null, this._authenticator)
            .then(data => {
                
                // Render results
                return this._renderData(data);
            })
            .catch(uiError => {
                
                // If an invalid id is typed in the browser then return to the list page
                if (uiError.statusCode === 404) {
                   location.hash ='#';
                   return Promise.resolve();
                }
            
                // Otherwise propagate the error
                return Promise.reject(uiError);
            });
    }
    
    /*
     * Render data
     */
    _renderData(transaction) {
        
        // Set text properties from the details data
        let transactionDiv = $(`<div class='col-xs-3'>
                                  <div>Tx Hash: <b>${transaction.tx_hash}</b></div>
                                  <div>Tx Receipt Status: <b>${transaction.tx_receipt_status}</b></div>
                                  <div>From account: <b>${transaction.from}</b></div>
                                  <div>To account: <b>${transaction.to}</b></div>
                                  <div>Value (ETH): <b>${transaction.value_eth}</b></div>
                                  <div>Value (USD): <b>${transaction.value_usd}</b></div>
                                  <div>Gas Limit: <b>${transaction.gas_limit}</b></div>
                                  <div>Gas Used: <b>${transaction.gas_used}</b></div>
                                  <div>Gas Price: <b>${transaction.gas_price}</b></div>
                                  <div>Actual TX Cost: <b>${transaction.actual_tx_cost}</b></div>
                                  <div>Cumulative Gas Used: <b>${transaction.cumulative_gas_used}</b></div>
                                </div>`);
        $('#detailsContainer').append(transactionDiv);
        
        return Promise.resolve();
    }
    
    /*
     * Plumbing to ensure that the this parameter is available in async callbacks
     */
    _setupCallbacks() {
        this._renderData = this._renderData.bind(this);
   }
}