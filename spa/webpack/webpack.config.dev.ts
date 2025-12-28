import fs from 'fs';
import path from 'path';
import webpack from 'webpack';
import webpackDevServer from 'webpack-dev-server';
import {merge} from 'webpack-merge';
import baseConfig from './webpack.config.base.js';

const dirname = process.cwd();
const devServer: webpackDevServer.Configuration = {

    // Use HTTPS and a real world domain name for local development
    server: {
        type: 'https',
        options: {
            pfx: fs.readFileSync('../certs/authsamples-dev.ssl.p12'),
            passphrase: 'Password1',
        },
    },
    static: {
        directory: path.join(dirname, './dist'),
        publicPath: '/spa/',
    },
    port: 443,
    open: 'https://www.authsamples-dev.com/spa',

    // Output bundles to disk to enable viewing of the final ECMAScript code in bundle files
    devMiddleware: {
        writeToDisk: true,
    },

    // Serve the index.html file for this subfolder for not found routes like /spa/xxx
    historyApiFallback: {
        index: '/spa/',
    },
    hot: true,
    allowedHosts: [
        'www.authsamples-dev.com',
    ],
};

const devConfig: webpack.Configuration = {

    // Let webpack know this is a development build
    mode: 'development',
    devServer,

    // Enable stepping through the SPA's TypeScript code in the Visual Studio Code debugger
    output: Object.assign({}, baseConfig.output, {
        devtoolModuleFilenameTemplate: 'file:///[absolute-resource-path]',
    }),

    // Pass a variable through to the frontend to tell it to display stack traces
    plugins:[
        new webpack.DefinePlugin({
            IS_DEBUG: 'true',
        }),
    ],
};

export default merge(baseConfig, devConfig);
