'use strict';
const winston = require('winston');

/*
 * Configure colours
 */
winston.addColors({
  info: 'white',
  warn: 'yellow',
  error: 'red' 
});

/*
 * A class to handle validating tokens received by the API
 */
class ApiLogger {
    
    /*
     * Initialize and set the logging level
     */
    static initialize() {
        winston.remove(winston.transports.Console);
        winston.add(winston.transports.Console, {
          level: 'info',
          colorize: true
        });
    }
    
    /*
     * Log info level
     */
    static info() {
        winston.info(ApiLogger._getText(arguments));
    }
    
    /*
     * Log warn level
     */
    static warn() {
        winston.warn(ApiLogger._getText(arguments));
    }
    
    /*
     * Log error level
     */
    static error() {
        winston.error(ApiLogger._getText(arguments));
    }
    
    /*
     * Get the text to output
     */
    static _getText(args) {
        
        let text = Array.prototype.slice.call(args).join(' : ');
        return text;
    }
}

module.exports = ApiLogger;