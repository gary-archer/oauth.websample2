/*
 * Domain specific claims that are stored outside the Authorization Server
 */
export class CustomClaims {

    private _userId: string;
    private _userRole: string;
    private _userRegions: string[];

    public constructor(userId: string, userRole: string, userRegions: string[]) {
        this._userId = userId;
        this._userRole = userRole;
        this._userRegions = userRegions;
    }

    public get userDatabaseId(): string {
        return this._userId;
    }

    public get userRole(): string {
        return this._userRole;
    }

    public get userRegions(): string[] {
        return this._userRegions;
    }
}
