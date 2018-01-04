'use strict';
import HttpClient from 'httpClient';
import DetailsView from 'detailsView';
import $ from 'jquery';

/*
 * Logic related to the list view
 */
export default class ListView {
    
    /*
     * Construction
     */
    constructor(authenticator, baseUrl) {
        this._authenticator = authenticator;
        this._apiBaseUrl = baseUrl;
        this._setupCallbacks();
    }
    
    /*
     * Make the request for data
     */
    execute() {
        this._showView();
        return this._requestData().then(this._renderData);
    }
    
    /*
     * Update visibility to show empty content while waiting for data
     */
    _showView() {
        $('#listContainer').removeClass('hide');
        $('#detailsContainer').addClass('hide');

        $('#listContainer').text('');
        $('#error').text('');
    }
    
    /*
     * Start the Ajax request
     */
    _requestData() {
        return HttpClient.callApi(`${this._apiBaseUrl}/transactions`, 'GET', null, this._authenticator);
    }
    
    /*
     * Render data
     */
    _renderData(data) {

        data.transactions.forEach(transaction => {

            // Set text properties
            let transactionDiv = $(`<div class='item col-xs-6'>
                                      <div class='thumbnail'>
                                        <div class='caption row'>
                                          <div class ='col-xs-2'>TxHash</div>
                                          <div class ='col-xs-10 hash'><h4>${transaction.tx_hash}</h4></div>  
                                        </div>
                                        <div class='caption row'>
                                          <div class ='col-xs-2'>Accounts</div>
                                          <div class ='col-xs-10'>
                                            <span class='account'>${transaction.from}</span> - <span class='account'>${transaction.to}</span>
                                          </div>
                                        </div>
                                        <div class='caption row'>
                                          <div class ='col-xs-9'>
                                            <h4>${transaction.amount_eth} ETH / ${transaction.amount_usd} USD</h4>
                                          </div>
                                          <div class ='col-xs-3'>
                                            <a class='btn btn-success pull-right' data-id='${transaction.tx_hash}'>Details</a>
                                          </div>
                                        <div>
                                      </div>
                                    </div>`);

            // A click handler selects details
            $('a').on('click', this._selectTransactionDetails);
            
            // Update the DOM
            $('#listContainer').append(transactionDiv);
        });
        
        return Promise.resolve();
    }
    
    /*
     * When a thumbnail is clicked we will request details data and then update the view
     */
    _selectTransactionDetails(e) {
        
        let tx_hash = $(e.target).attr('data-id');
        location.hash = `#tx_hash=${tx_hash}`;
        e.preventDefault();
    }
    
    /*
     * Plumbing to ensure that the this parameter is available in async callbacks
     */
    _setupCallbacks() {
        this._renderData = this._renderData.bind(this);
        this._selectTransactionDetails = this._selectTransactionDetails.bind(this);
   }
}