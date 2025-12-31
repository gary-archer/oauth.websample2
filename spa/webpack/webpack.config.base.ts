import CopyPlugin from 'copy-webpack-plugin';
import path from 'path';
import webpack from 'webpack';

const dirname = process.cwd();
const config: webpack.Configuration = {

    // Set the working folder and build bundles for the browser
    context: path.resolve(dirname, '.'),
    target: ['web'],

    // Always output source maps for SPAs
    devtool: 'source-map',

    entry: {

        // Specify the application entry point
        app: ['./src/index.ts'],
    },
    module: {
        rules: [
            {
                // Files with a .ts extension are loaded by the Typescript loader
                test: /\.ts$/,
                use: 'ts-loader',
                exclude: /node_modules/,
            },
        ],
    },
    resolve: {

        // Set extensions for import statements, and the .js extension allows us to import modules from JS libraries
        extensions: ['.ts', '.js'],
    },
    output: {

        // Output bundles to a dist folder
        path: path.resolve(dirname, './dist'),
        filename: '[name].bundle.js',
        module: true,
        clean: true,
    },
    experiments: {
        outputModule: true,
    },
    optimization: {

        // Indicate that third party code is built to a separate vendor bundle file
        splitChunks: {
            cacheGroups: {
                vendor: {
                    chunks: 'initial',
                    name: 'vendor',
                    test: /node_modules/,
                    enforce: true,
                },
            },
        },
    },
    plugins: [

        // Copy static files to the dist folder
        new CopyPlugin({
            patterns: [
                {
                    from: 'index.html',
                    to: path.resolve('dist'),
                },
                {
                    from: 'css',
                    to: path.resolve('dist'),
                },
                {
                    from: 'favicon.ico',
                    to: path.resolve('dist'),
                },
                {
                    from: 'spa.config.json',
                    to: path.resolve('dist'),
                },
            ]
        }),
    ]
};

export default config;
