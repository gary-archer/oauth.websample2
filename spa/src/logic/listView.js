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
        return HttpClient.callApi(`${this._apiBaseUrl}/golfers`, 'GET', null, this._authenticator);
    }
    
    /*
     * Render data
     */
    _renderData(data) {

        data.golfers.forEach(golfer => {

            // Set up the image and a click handler
            let golferLink = $(`<a href='#' class='img-thumbnail'>
                                  <img class='golferImage' src='images/${golfer.name}_tn.png' class='img-responsive' data-id='${golfer.id}'>
                                </a>`);
            
            // Set text properties
            let golferDiv = $(`<div class='col-xs-3'>
                                 <div>Name : <b>${golfer.name}</b></div>
                                 <div>Tour Wins : <b>${golfer.tour_wins}</b></div>
                               </div>`);
            
            // Update the DOM
            golferDiv.append(golferLink);
            $('#listContainer').append(golferDiv);
        });
        
        // Add event handlers for image clicks
        $('.golferImage').on('click', this._selectGolferDetails);
        return Promise.resolve();
    }
    
    /*
     * When a thumbnail is clicked we will request details data and then update the view
     */
    _selectGolferDetails(e) {
        let golferId = $(e.target).attr('data-id');
        location.hash = `#golfer=${golferId}`;
        e.preventDefault();
    }
    
    /*
     * Plumbing to ensure that the this parameter is available in async callbacks
     */
    _setupCallbacks() {
        this._renderData = this._renderData.bind(this);
        this._selectGolferDetails = this._selectGolferDetails.bind(this);
   }
}