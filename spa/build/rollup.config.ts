import commonjs from '@rollup/plugin-commonjs';
import {nodeResolve} from '@rollup/plugin-node-resolve';
import replace from '@rollup/plugin-replace';
import terser from '@rollup/plugin-terser';
import tailwind from '@tailwindcss/postcss';
import cssnano from 'cssnano';
import path from 'node:path';
import {defineConfig, RollupOptions} from 'rollup';
import esbuild from 'rollup-plugin-esbuild';
import postcss from 'rollup-plugin-postcss';
import {copyFiles, notifyBrowser} from './plugins.js';

// Set base values and use the watch flag to distinguish between development v production builds
const isDevelopment = process.env.ROLLUP_WATCH === 'true';
const outputFolder = 'dist';

const options: RollupOptions = {

    input: 'src/index.ts',
    output: {

        // Output ECMAScript modules
        dir: outputFolder,
        format: 'esm',

        // Define chunks names for the entry point app chunk, and any initial chunks referenced in index.html
        entryFileNames: 'app.bundle.js',
        chunkFileNames: '[name].bundle.js',
        manualChunks: (id: string) => {

            if (!id.includes('node_modules')) {
                return null;
            }

            return 'vendor';
        },

        // Enable source maps and us correct paths to support debugging
        sourcemap: true,
        sourcemapPathTransform: (relativeSourcePath: string, sourcemapPath: string) => {
            return path.resolve(path.dirname(sourcemapPath), relativeSourcePath);
        },
    },

    watch: {
        clearScreen: false,
    },

    plugins: [

        // Use browser resolution for node_modules
        nodeResolve({
            browser: true,
        }),

        // Convert any commonjs libraries from the node_modules folder to ECMAScript
        commonjs(),

        // Set IS_DEBUG to true in development mode
        replace({
            'IS_DEBUG': JSON.stringify(isDevelopment),
            preventAssignment: true,
        }),

        // Use esbuild as an up to date plugin for building typescript code
        esbuild({
            tsconfig: './tsconfig.json',
            target: 'es2020',
        }),

        // Copy these static files to the output folder when a build completes
        copyFiles(outputFolder, [
            'favicon.ico',
            'index.html',
            'spa.config.json',
        ]),

        ...(isDevelopment ? [

            // Build development CSS, and implement live reloading
            postcss({
                extract: 'app.css',
                plugins: [
                    tailwind(),
                ]
            }),
            notifyBrowser(),

        ] : [

            // Minify CSS and JavaScript for release builds
            postcss({
                extract: 'app..css',
                plugins: [
                    tailwind(),
                    cssnano(),
                ]
            }),
            terser(),
        ]),
    ],
};

export default defineConfig(options);
