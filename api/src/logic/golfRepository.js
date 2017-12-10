'use strict';
const summaryData = require('../../data/golfers.json');
const detailsData = require('../../data/golferTourWins.json');

/*
 * An API controller for golf operations
 */
class GolfRepository {
    
        /*
         * Return summary data for our golfer entities
         */
        getList() {
            return summaryData;
        }
        
        /*
         * Return details for a golfer entity by id
         */
        getDetails(id) {
    
            let foundGolfer = summaryData.golfers.find(g => g.id === id);
            if (foundGolfer) {
    
                let foundGolferDetails = detailsData.golfers.find(g => g.id === id);
                foundGolfer.wins = foundGolferDetails.wins;
            }
    
            return foundGolfer;
        }
    }

module.exports = GolfRepository;