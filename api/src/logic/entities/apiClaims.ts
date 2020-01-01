/*
 * Our API claims class
 */
export class ApiClaims {

    // The immutable user id from the access token, which may exist in the API's database
    private _userId!: string;

    // The client id, which typically represents the calling application
    private _clientId!: string;

    // OAuth scopes can represent high level areas of the business
    private _scopes!: string[];

    // Data from the OAuth user info endpoint
    private _givenName!: string;
    private _familyName!: string;
    private _email!: string;

    // An example of an advanced claim used for authorization
    private _regionsCovered!: string[];

    public get userId(): string {
        return this._userId;
    }

    public get clientId(): string {
        return this._clientId;
    }

    public get scopes(): string[] {
        return this._scopes;
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

    /*
     * Set token claims after introspection
     */
    public setTokenInfo(userId: string, clientId: string, scopes: string[]) {
        this._userId = userId;
        this._clientId = clientId;
        this._scopes = scopes;
    }

    /*
     * Set informational fields after user info lookup
     */
    public setCentralUserInfo(givenName: string, familyName: string, email: string) {
        this._givenName = givenName;
        this._familyName = familyName;
        this._email = email;
    }

    public get regionsCovered(): string[] {
        return this._regionsCovered;
    }

    public set regionsCovered(regionsCovered: string[]) {
        this._regionsCovered = regionsCovered;
    }
}
