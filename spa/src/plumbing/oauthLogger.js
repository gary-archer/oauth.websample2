'use strict';
import {Log as OidcLog} from 'oidc-client';
import $ from 'jquery';

/*
 * Make OIDC logging more visible in the UI rather than using console.log
 */
export default class OAuthLogger {

    static initialize(level){
        OidcLog.logger = OAuthLogger;
        OidcLog.level = level;
    }
    
    /*
     * OIDC messages
     */
    static debug() {
        OAuthLogger._output('Oidc.Debug', arguments);
    }
    
    static info() {
        OAuthLogger._output('Oidc.Info', arguments);
    }
    
    static warn() {
        OAuthLogger._output('Oidc.Warn', arguments);
    }
    
    static error() {
        OAuthLogger._output('Oidc.Error', arguments);
    }
    
    /*
     * Handle log output
     */
    static _output(prefix, args) {
        
        let text = Array.prototype.slice.call(args).join(' : ');
        let html = `<b>${prefix}</b> : ${text}`;
        $('#trace').append($('<li>').html(html));
    }
}