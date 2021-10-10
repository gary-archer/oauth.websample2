/*
 * A utility class to keep our HTML storage organised
 */
export class HtmlStorageHelper {

    private static _prefix = 'basicspa.'
    private static _loggedInKey = 'loggedin';
    private static _externalLogoutKey = 'external-logout';
    private static _oidcLogLevelKeyName = 'oidc-log-level';

    /*
     * Return true if the user is logged in
     */
    public static get isLoggedIn(): boolean {

        const key = `${HtmlStorageHelper._prefix}${HtmlStorageHelper._loggedInKey}`;
        const value = localStorage.getItem(key);
        return !!value;
    }

    /*
     * Set whether logged in
     */
    public static set isLoggedIn(value: boolean) {

        const key = `${HtmlStorageHelper._prefix}${HtmlStorageHelper._loggedInKey}`;
        localStorage.setItem(key, String(value));
    }

    /*
     * Notify other tabs when we logout
     */
    public static set multiTabLogout(value: boolean) {

        const key = `${HtmlStorageHelper._prefix}${HtmlStorageHelper._externalLogoutKey}`;
        localStorage.setItem(key, String(value));
    }

    /*
     * Receive a notification when another tab logs out
     */
    public static isMultiTabLogoutEvent(event: StorageEvent) {

        if (event.storageArea == localStorage) {

            const key = `${HtmlStorageHelper._prefix}${HtmlStorageHelper._externalLogoutKey}`;
            if (event.key === key && event.newValue === 'true') {
                return true;
            }
        }

        return false;
    }

    /*
     * Get the log level for viewing OIDC client library details
     */
    public static get oidcLogLevel(): string {

        const key = `${HtmlStorageHelper._prefix}${HtmlStorageHelper._oidcLogLevelKeyName}`;
        return sessionStorage.getItem(key) || '';
    }

    /*
     * Record the log level for viewing OIDC client library details
     */
    public static set oidcLogLevel(value: string) {

        const key = `${HtmlStorageHelper._prefix}${HtmlStorageHelper._oidcLogLevelKeyName}`;
        sessionStorage.setItem(key, value);
    }
}
