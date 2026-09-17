import { defineConfig } from 'tsup'

export default defineConfig({
    entry: [ 'src/**/**.ts' ],
    outDir: 'build',
    format: ['esm'],
    target: 'esnext',
    sourcemap: false,
    dts: false,
    clean: true,
    external: [
        '@napi-rs/canvas',
        'discord.js',
    ],
    define: {
        'process.env.ENV': JSON.stringify('PROD'),
    }
});
