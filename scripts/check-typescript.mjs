import { createRequire } from 'node:module';
import { spawnSync } from 'node:child_process';
import { compilerBinary } from '../tests/helpers/type-compiler.mjs';

const require = createRequire(import.meta.url);
const binary = compilerBinary();
const run = (args) => {
  const result = spawnSync(process.execPath, args, { stdio: 'inherit' });
  if (result.error) throw result.error;
  if (result.status !== 0) process.exit(result.status ?? 1);
};

run([binary, '--version']);
for (const config of [
  'tsconfig.schema-types.json',
  'tsconfig.schema-dist.json',
  'examples/tsconfig.json',
]) {
  run([binary, '--noEmit', '--project', config]);
}
run([
  require.resolve('jest/bin/jest'),
  '--runInBand',
  '--testRegex',
  'typedSchema.matrix.ts',
  '--coverage=false',
]);
run([
  '--test',
  'tests/generatedSchema.integration.mjs',
  'tests/generatedRelations.integration.mjs',
]);
