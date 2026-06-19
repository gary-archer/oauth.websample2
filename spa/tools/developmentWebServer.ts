import express, {NextFunction, Request, Response} from 'express';
import fs from 'node:fs/promises';
import https from 'node:https';
import {WebSocketServer, WebSocket} from 'ws';

/*
 * Create the Express host and set a strict content security policy
 */
const app = express();
app.use('/*_', setSecurityHeaders);

/*
 * Load SSL certificate files from disk
 */
const pfxData = await fs.readFile('../certs/authsamples-dev.ssl.p12');
const httpsOptions = {
    pfx: pfxData,
    passphrase: 'Password1',
};

/*
 * Create the HTTPS server and a web socket on the same port
 */
const server = https.createServer(httpsOptions, app);
const wss = new WebSocketServer({
    server,
    path: '/reload'
});

/*
 * Add a reload endpoint that rollup builds call, which notifies the browser client to reload itself
 */
app.get('/reload', (request: Request, response: Response) => {

    console.log('Web socket server broadcasting reload event ...');
    for (const client of wss.clients) {
        if (client.readyState === WebSocket.OPEN) {
            client.send('reload');
        }
    }
    response.sendStatus(204);
});

/*
 * Serve the static content
 */
const spaBasePath = '/spa/';
const spaPhysicalRoot = 'dist';
app.use(spaBasePath, express.static(spaPhysicalRoot));
app.get('*_', handleNotFoundPath);

/*
 * Start listening
 */
const port = 443;
server.listen(port, () => {
    console.log(`Web host is listening on HTTPS port ${port} ...`);
});

/*
 * Use a strong content security policy for development
 */
function setSecurityHeaders(request: Request, response: Response, next: NextFunction): any {

    const authorizationServerHost = 'https://login.authsamples.com';
    const metadataHost = 'https://cognito-idp.eu-west-2.amazonaws.com';
    const apiHost = 'https://api.authsamples-dev.com:446';

    const trustedHosts = [
        authorizationServerHost,
        metadataHost,
        apiHost,
    ];

    let policy = "default-src 'none';";
    policy += " script-src 'self';";
    policy += ` connect-src 'self' ${trustedHosts.join(' ')};`;
    policy += " child-src 'self';";
    policy += " img-src 'self';";
    policy += " style-src 'self';";
    policy += " object-src 'none';";
    policy += " frame-ancestors 'self';";
    policy += ` frame-src 'self' ${authorizationServerHost};`;
    policy += " base-uri 'self';";
    policy += " form-action 'self'";

    response.setHeader('content-security-policy', policy);
    response.setHeader('strict-transport-security', 'max-age=31536000; includeSubdomains; preload');
    response.setHeader('x-frame-options', 'DENY');
    response.setHeader('x-xss-protection', '1; mode=block');
    response.setHeader('x-content-type-options', 'nosniff');
    response.setHeader('referrer-policy', 'same-origin');
    next();
}

/*
 * Handle paths that don't map to physical resources
 */
function handleNotFoundPath(request: Request, response: Response) {

    const requestPath = request.path.toLowerCase();
    if (requestPath === '/favicon.ico') {

        // Serve the root level favicon.ico file
        const rootPhysicalPath = './';
        response.sendFile('favicon.ico', {root: rootPhysicalPath});

    } else if (requestPath.startsWith(spaBasePath)) {

        // Within the SPA serve the default document
        response.sendFile('index.html', {root: spaPhysicalRoot});

    } else {

        // For other paths, redirect to the SPA
        response.redirect(spaBasePath);
    }
}
