/*
 * Our claims principal
 */
export class ApiClaims {

    // Claims from the OAuth access token
    private _subject: string;
    private _clientId: string;
    private _scopes: string[];
    private _expiry: number;

    // Claims from the OAuth user info endpoint
    private _givenName: string;
    private _familyName: string;
    private _email: string;

    // Custom claims that originate from the API's own database
    private _userDatabaseId: string;
    private _isAdmin: boolean;
    private _regionsCovered: string[];

    /*
     * Give fields default values
     */
    public constructor() {
        this._subject = '';
        this._clientId = '';
        this._scopes = [];
        this._expiry = 0;
        this._givenName = '';
        this._familyName = '';
        this._email = '';
        this._userDatabaseId = '';
        this._isAdmin = false;
        this._regionsCovered = [];
    }

    public get subject(): string {
        return this._subject;
    }

    public get clientId(): string {
        return this._clientId;
    }

    public get scopes(): string[] {
        return this._scopes;
    }

    public get expiry(): number {
        return this._expiry;
    }

    public get givenName(): string {
        return this._givenName;
    }

    public get familyName(): string {
        return this._familyName;
    }

    public get email(): string {
        return this._email;
    }

    public get userDatabaseId(): string {
        return this._userDatabaseId;
    }

    public set userDatabaseId(value: string) {
        this._userDatabaseId = value;
    }

    public get isAdmin(): boolean {
        return this._isAdmin;
    }

    public set isAdmin(value: boolean) {
        this._isAdmin = value;
    }

    public get regionsCovered(): string[] {
        return this._regionsCovered;
    }

    public set regionsCovered(value: string[]) {
        this._regionsCovered = value;
    }

    /*
     * Set claims from the OAuth access token
     */
    public setTokenInfo(subject: string, clientId: string, scopes: string[], expiry: number): void {
        this._subject = subject;
        this._clientId = clientId;
        this._scopes = scopes;
        this._expiry = expiry;
    }

    /*
     * Set claims returned from the OAuth user info endpoint
     */
    public setUserInfo(givenName: string, familyName: string, email: string): void {
        this._givenName = givenName;
        this._familyName = familyName;
        this._email = email;
    }
}
