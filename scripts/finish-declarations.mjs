import { writeFileSync } from 'node:fs';

// Preserve the package's existing declaration entry points.
writeFileSync('dist/microcms-js-sdk.d.ts', "export * from './types/index';\n");
writeFileSync(
  'dist/microcms-js-sdk.d.mts',
  "export * from './types/index.js';\n",
);
