/*
 * A holder for application settings
 */
export interface ApiConfiguration {
    sslCertificateFileName: string;
    sslCertificatePassword: string;
    trustedOrigins: string[];
    useProxy: boolean;
    proxyUrl: string;
}
