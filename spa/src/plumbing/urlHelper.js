'use strict';

/*
 * URL utilities
 */
export default class UrlHelper {

    /*
     * Parse the hash fragment into an object
     */
    static getLocationHashData() {

        let params = {}

        let idx = location.hash.indexOf('#');
        if (idx !== -1) {

            let hashParams = location.hash.slice(idx + 1).split('&')
            hashParams.map(hash => {
                let [key, val] = hash.split('=')
                params[key] = decodeURIComponent(val)
            })
        }

        return params;
    }
}