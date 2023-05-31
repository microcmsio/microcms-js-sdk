import typescript from 'rollup-plugin-typescript2';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import terser from '@rollup/plugin-terser';
import pkg from './package.json';

export default [
  // commonjs
  {
    input: './src/index.ts',
    output: [
      {
        file: `./dist/cjs/${pkg.name}.js`,
        sourcemap: 'inline',
        format: 'cjs',
      },
    ],
    plugins: [
      terser(),
      typescript({
        rootDir: 'src',
        declaration: true,
      }),
    ],
  },
  // esm
  {
    input: './src/index.ts',
    output: [
      {
        file: `./dist/esm/${pkg.name}.js`,
        sourcemap: 'inline',
        format: 'esm',
      },
    ],
    plugins: [
      terser(),
      typescript({
        rootDir: 'src',
        declaration: true,
      }),
    ],
  },
  // umd
  {
    input: './src/index.ts',
    output: [
      {
        file: `./dist/umd/${pkg.name}.js`,
        format: 'umd',
        name: 'microcms',
      },
    ],
    plugins: [
      terser(),
      nodeResolve({
        browser: true,
        preferBuiltins: false,
      }),
      commonjs(),
      json(),
      typescript(),
    ],
  },
];
