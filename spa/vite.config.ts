// import path from 'path';
import {ConfigEnv, defineConfig, UserConfig} from 'vite';

// const dirname = process.cwd();
export default defineConfig((configEnv: ConfigEnv) => {

    const userConfig: UserConfig = {

        base: '/spa',
        build: {
            minify: configEnv.mode === 'production',
            outDir: 'dist',
            rollupOptions: {
                input: './src/index.ts',
                output: {

                    entryFileNames: 'app.bundle.js',
                    chunkFileNames: '[name].bundle.js',
                    manualChunks: (id: string) => {
                        if (id.includes('node_modules')) {
                            return 'vendor';
                        }
                    },
                    sourcemap: true,
                },
            }
        },
        define: {
            IS_DEBUG: `${configEnv.mode === 'development'}`
        },
    };

    return userConfig;
});
