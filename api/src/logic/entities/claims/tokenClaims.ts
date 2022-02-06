/*
 * Claims included in the JWT
 */
export class TokenClaims {

    private _subject: string;
    private _scopes: string[];
    private _expiry: number;

    public constructor(subject: string, scopes: string[], expiry: number) {
        this._subject = subject;
        this._scopes = scopes;
        this._expiry = expiry;
    }

    public get subject(): string {
        return this._subject;
    }

    public get scopes(): string[] {
        return this._scopes;
    }

    public get expiry(): number {
        return this._expiry;
    }
}
