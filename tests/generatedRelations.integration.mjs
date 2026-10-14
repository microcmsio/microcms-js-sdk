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

test('captured three-level repeaters preserve SDK inference, selections and nested writes', () => {
  checkTypes(
    [
      fileURLToPath(
        new URL(
          './fixtures/typegen/generated/matrix-usage.ts',
          import.meta.url,
        ),
      ),
    ],
    ['--exactOptionalPropertyTypes'],
  );
});

// Required rules originate in typegen; this test checks SDK consumption only.
test('generated required rules preserve SDK write constraints and read inference', () => {
  checkTypes(
    [
      fileURLToPath(
        new URL(
          './fixtures/typegen/generated/required-usage.ts',
          import.meta.url,
        ),
      ),
    ],
    ['--exactOptionalPropertyTypes'],
  );
});

test('required union repeaters preserve SDK constraints for list and object APIs', () => {
  const file = fileURLToPath(
    new URL(
      './fixtures/typegen/generated/required-combinations-usage.ts',
      import.meta.url,
    ),
  );
  for (const options of [[], ['--exactOptionalPropertyTypes']])
    checkTypes([file], options);
});

test('trusted read references preserve nonempty arrays through fields and extraction', () => {
  const file = fileURLToPath(
    new URL(
      './fixtures/typegen/generated/read-references-usage.ts',
      import.meta.url,
    ),
  );
  for (const options of [[], ['--exactOptionalPropertyTypes']])
    checkTypes([file], options);
});
