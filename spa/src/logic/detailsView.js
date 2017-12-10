'use strict';
import HttpClient from 'httpClient';
import $ from 'jquery';

/*
 * Logic related to the list view
 */
export default class DetailsView {
    
    /*
     * Construction
     */
    constructor(authenticator, baseUrl, id) {
        this._authenticator = authenticator;
        this._apiBaseUrl = baseUrl;
        this._id = id;
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
        let url = `${this._apiBaseUrl}/golfers/${this._id}`;
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
    _renderData(golfer) {
        
        // Use the full size image
        let golferImage = $(`<a>
                               <img src='images/${golfer.name}.png' class='img-responsive'>
                             </a>`);
            
        // Render summary details
        let golferDiv = $(`<div class='col-xs-6'>
                             <div>Name : <b>${golfer.name}</b></div>
                             <div>Tour Wins : <b>${golfer.tour_wins}</b></div>
                           </div>`);
        golferDiv.append(golferImage);
        $('#detailsContainer').append(golferDiv);
        
        // Render the tour wins container
        let tourWinsDiv = $(`<div class='col-xs-6'>
                               <div><b>All Tour Wins</b></div>
                               <ul id='wins_list'></ul>
                             </div>`);
        $('#detailsContainer').append(tourWinsDiv);
        
        // Render individual win details
        golfer.wins.forEach(win => {
            let info = `${win.year} : ${win.eventName}`;
            $('#wins_list').append($('<li>').html(info));
        });
        
        return Promise.resolve();
    }
    
    /*
     * Plumbing to ensure that the this parameter is available in async callbacks
     */
    _setupCallbacks() {
        this._renderData = this._renderData.bind(this);
   }
}