/*
 * A utility class to keep our HTML storage organised
 */
export class HtmlStorageHelper {

    private static _prefix = 'basicspa.'
    private static _oidcLogLevelKeyName = 'oidc-log-level';


    public static get oidcLogLevel(): string {
        return sessionStorage.getItem(`${HtmlStorageHelper._prefix}${HtmlStorageHelper._oidcLogLevelKeyName}`) ?? '';
    }

    public static set oidcLogLevel(value: string) {
        sessionStorage.setItem(`${HtmlStorageHelper._prefix}${HtmlStorageHelper._oidcLogLevelKeyName}`, value);
    }
}
