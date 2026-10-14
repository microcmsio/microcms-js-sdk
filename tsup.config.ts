import { defineConfig } from 'tsup';

export default defineConfig([
  {
    name: 'main',
    entry: { 'microcms-js-sdk': './src/index.ts' },
    format: ['cjs', 'esm'],
    legacyOutput: true,
    target: 'es5',
    sourcemap: true,
    clean: true,
    bundle: true,
    splitting: false,
    dts: false,
    minify: true,
  },
  {
    name: 'iife',
    entry: { 'microcms-js-sdk': './src/index.ts' },
    legacyOutput: true,
    target: 'es5',
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
