import { defineConfig } from 'tsup';

export default defineConfig([
  {
    name: 'main',
    entry: { 'microcms-js-sdk': './src/index.ts' },
    format: ['cjs', 'esm'],
    legacyOutput: true,
    sourcemap: true,
    clean: true,
    bundle: true,
    splitting: false,
    dts: true,
    minify: true,
  },
  {
    name: 'iife',
    entry: { 'microcms-js-sdk': './src/index.ts' },
    legacyOutput: true,
    format: ['iife'],
    platform: 'browser',
    globalName: 'microcms',
    bundle: true,
    sourcemap: true,
    splitting: false,
    dts: false,
    minify: true,
  },
]);
