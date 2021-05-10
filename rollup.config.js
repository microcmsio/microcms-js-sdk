import typescript from 'rollup-plugin-typescript2';
import pkg from './package.json';
import { terser } from 'rollup-plugin-terser';
import pluginNodeResolve from '@rollup/plugin-node-resolve';

export default {
  input: './src/index.ts',
  plugins: [
    typescript({
      rootDir: 'src',
      declaration: true,
    }),
  ],
  output: [
    {
      file: `./dist/cjs/${pkg.name}.js`,
      sourcemap: 'inline',
      format: 'cjs',
      plugins: [terser()],
    },
    {
      file: `./dist/esm/${pkg.name}.js`,
      sourcemap: 'inline',
      format: 'esm',
      plugins: [terser()],
    },
    {
      file: `./dist/umd/${pkg.name}.js`,
      sourcemap: 'inline',
      format: 'umd',
      name: 'microcms',
      globals: { 'node-fetch': 'fetch', 'query-string': 'qs' },
      plugins: [
        terser(),
        pluginNodeResolve({
          borwser: true,
        }),
      ],
    },
  ],
  external: ['node-fetch', 'query-string'],
};
