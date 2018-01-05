'use strict';
import HttpClient from 'httpClient';
import $ from 'jquery';

/*
 * Logic related to the transactions view
 */
export default class TransactionsView {
    
    /*
     * Construction
     */
    constructor(authenticator, baseUrl, contract_address) {
        this._authenticator = authenticator;
        this._apiBaseUrl = baseUrl;
        this._contract_address = contract_address;
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
        $('.listcontainer').addClass('hide');
        $('.transactionscontainer').removeClass('hide');
        $('#error').text('');
    }
    
    /*
     * Make the Ajax request
     */
    _getData() {
        
        // Call the API
        let url = `${this._apiBaseUrl}/icos/${this._contract_address}`;
        return HttpClient.callApi(url, 'GET', null, this._authenticator)
            .then(data => {
                
                // Render results
                this._renderData(data);
                return Promise.resolve();
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
    _renderData(data) {

        $('.transactionslist').text('');
        $('#tokenHeader').text(`Transactions for ${data.token_name}`);
        
        data.transactions.forEach(transaction => {

            // Format fields for display
            let amountUsd = transaction.amount_usd.toFixed(6);
            let amountEth = transaction.amount_eth.toFixed(6);

            // Render the UI
            let transactionDiv = $(`<div class='item col-xs-6'>
                                      <div class='thumbnail'>
                                        <div class='caption row text-left'>
                                          <div class='col-xs-2'><h4>TxHash</h4></div>
                                          <div class='col-xs-10 hash'><h4>${transaction.tx_hash}</h4></div>  
                                        </div>
                                        <div class='caption row text-left'>
                                          <div class='col-xs-2 left-align'>From</div>
                                          <div class='col-xs-10'>
                                            <span class='account'>${transaction.from}</span>
                                          </div>
                                        </div>
                                        <div class='caption row text-left'>
                                          <div class='col-xs-2'>To</div>
                                          <div class='col-xs-10'>
                                            <span class='account'>${transaction.to}</span>
                                          </div>
                                        </div>
                                        <div class='caption row text-left amount'>
                                          <div class='col-xs-2'>USD</div>
                                          <div class='col-xs-10'>${amountUsd}</div>
                                        </div>
                                        <div class='caption row text-left amount'>
                                          <div class='col-xs-2'>ETH</div>
                                          <div class='col-xs-10'>${amountEth}</div>
                                        </div>
                                      </div>
                                    </div>`);

            // Update the DOM
            $('.transactionslist').append(transactionDiv);
        });
    }
    
    /*
     * Plumbing to ensure that the this parameter is available in async callbacks
     */
    _setupCallbacks() {
        this._renderData = this._renderData.bind(this);
   }
}