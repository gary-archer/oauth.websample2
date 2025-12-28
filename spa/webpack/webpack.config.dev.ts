import webpack from 'webpack';
import {merge} from 'webpack-merge';
import baseConfig from './webpack.config.base.js';

const devConfig: webpack.Configuration = {

    // Let webpack know this is a development build
    mode: 'development',

    // Enable stepping through the SPA's TypeScript code in the Visual Studio Code debugger
    output: Object.assign({}, baseConfig.output, {
        devtoolModuleFilenameTemplate: 'file:///[absolute-resource-path]'
    }),

    // Pass a variable through to the frontend to tell it to display stack traces
    plugins:[
        new webpack.DefinePlugin({
            IS_DEBUG: 'true',
        }),
    ],
};

export default merge(baseConfig, devConfig);
