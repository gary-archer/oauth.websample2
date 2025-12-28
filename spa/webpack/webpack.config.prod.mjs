import webpack from 'webpack';
import {merge} from 'webpack-merge';
import baseConfig from './webpack.config.base.mjs';

export default merge(baseConfig, {

    // Let webpack know this is a production build
    mode: 'production',

    // Disable performance warnings about bundle sizes
    performance: {
        hints: false
    },

    // Pass a variable through to the frontend to tell it to not display stack traces
    plugins:[
        new webpack.DefinePlugin({
            IS_DEBUG: 'false',
        }),
    ]
});