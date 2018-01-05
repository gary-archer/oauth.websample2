'use strict';

// Our sample is just using hard coded fictional data
const icoList = require('../../data/icoList.json');
const allTransactions = require('../../data/icoTransactions.json');

/*
 * A simple API controller for getting data about Initial Coin Offerings and their transactions
 */
class IcoRepository {
    
        /*
         * Return the list of ICOs
         */
        getList() {
            return icoList;
        }
        
        /*
         * Return transactions for an ICO given its contract address
         */
        getTransactions(contract_address) {
            
            let foundIco = icoList.icos.find(i => i.contract_address === contract_address);
            if (foundIco) {
    
                let foundIcoTransactions = allTransactions.icos.find(i => i.contract_address === contract_address);
                if (foundIcoTransactions) {
                    foundIco.transactions = foundIcoTransactions.transactions;
                }
            }
    
            return foundIco;
        }
    }

module.exports = IcoRepository;