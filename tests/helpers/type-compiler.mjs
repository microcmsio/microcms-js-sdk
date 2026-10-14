import { createRequire } from 'node:module';
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';

const require = createRequire(import.meta.url);

// CI can select the minimum supported compiler without adding it to local dependencies.
export function compilerBinary() {
  const selected = process.env.MICROCMS_TYPESCRIPT_BINARY;
  if (selected) return resolve(selected);
  const manifestPath = require.resolve('typescript/package.json');
  const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
  return resolve(dirname(manifestPath), manifest.bin.tsc);
}

export function checkTypes(files, options = []) {
  const result = spawnSync(
    process.execPath,
    [
      compilerBinary(),
      '--ignoreConfig',
      '--pretty',
      'false',
      '--noEmit',
      '--strict',
      '--target',
      'ES2022',
      '--module',
      'ESNext',
      '--moduleResolution',
      'Bundler',
      ...options,
      ...files,
    ],
    { encoding: 'utf8', timeout: 60000 },
  );
  if (result.status !== 0)
    throw new Error(
      [result.stdout, result.stderr, result.error?.message]
        .filter(Boolean)
        .join('\n'),
    );
}
