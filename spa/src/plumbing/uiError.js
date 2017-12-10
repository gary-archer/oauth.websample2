'use strict';

/*
 * A simple error class for the UI
 */
export default class UIError {

    /*
     * Let callers supply a subset of named parameters via object destructuring
     */
    constructor({
        message = '',
        statusCode = -1,
        area = '',
        url = '',
        time = new Date(),
        details = '',
        nonError = false
    }) {
        this._message = message;
        this._statusCode = statusCode;
        this._area = area;
        this._url = url;
        this._time = time;
        this._details = details;
        this._nonError = nonError;
    }
    
    /*
     * Return properties for display
     */
    get message() {
        return this._message;
    }
    
    set message(message) {
        this._message = message;
    }
    
    get statusCode() {
        return this._statusCode;
    }
    
    set statusCode(statusCode) {
        this._statusCode = statusCode;
    }
    
    get area() {
        return this._area;
    }
    
    set area(area) {
        this._area = area;
    }

    get url() {
        return this._url;
    }

    get time() {
        return this._time;
    }

    get details() {
        return this._details;
    }
    
    set details(details) {
        this._details = details;
    }
    
    get nonError() {
        return this._nonError;
    }
}