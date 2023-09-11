/*
 * Some example claims that may not be present in the access token
 * In some cases this may be due to authorization server limitations
 * In other cases they may be easier to manage outside the authorization server
 * The API's service logic treats such values as claims though
 */
export class ExtraClaims {

    private _managerId: string;
    private _role: string;
    private _title: string;
    private _regions: string[];

    public constructor(managerId: string, role: string, title: string, regions: string[]) {
        this._managerId = managerId;
        this._role = role;
        this._title = title;
        this._regions = regions;
    }

    public get managerId(): string {
        return this._managerId;
    }

    public get role(): string {
        return this._role;
    }

    public get title(): string {
        return this._title;
    }

    public get regions(): string[] {
        return this._regions;
    }
}
