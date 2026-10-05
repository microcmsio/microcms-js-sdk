import test from 'node:test';
import { fileURLToPath } from 'node:url';
import { checkTypes } from './helpers/type-compiler.mjs';

test('generated multi-level and cyclic references preserve SDK depth boundaries', () => {
  checkTypes(
    [
      fileURLToPath(
        new URL('./fixtures/typegen/generated/tree-usage.ts', import.meta.url),
      ),
    ],
    ['--exactOptionalPropertyTypes'],
  );
});
