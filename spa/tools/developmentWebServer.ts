import express, {Request, Response} from 'express';
import fs from 'fs/promises';
import https from 'https';
import {WebSocketServer, WebSocket} from 'ws';

/*
 * Create the Express host
 */
const app = express();

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
