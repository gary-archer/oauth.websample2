/*
 * A holder for OAuth settings
 */
export interface OAuthConfiguration {
    authority: string;
    requiredScope: string;
    clientId: string;
    clientSecret: string;
    maxClaimsCacheMinutes: number;
}
