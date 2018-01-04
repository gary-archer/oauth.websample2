'use strict';

// Data is hard coded for now
const summaryData = require('../../data/transactionsSummary.json');
const detailsData = require('../../data/transactionsDetails.json');

/*
 * An API controller for getting data about transactions
 */
class TransactionRepository {
    
        /*
         * Return the list of transactions
         */
        getList() {
            return summaryData;
        }
        
        /*
         * Return details for a transaction by its hash
         */
        getDetails(tx_hash) {
            return detailsData.transactions.find(g => g.tx_hash === tx_hash);
        }
    }

module.exports = TransactionRepository;