import test from 'node:test';
import assert from 'node:assert/strict';
import { buildVerification } from './helpers/fixture-verification.mjs';

let verification;
const verified = () => (verification ??= buildVerification());

test('captured response cases match SDK inference, exact fields and extracted content types', async () => {
  // buildVerification compiles every saved response as a fresh literal and checks
  // exact content keys and equality with InferMicroCMSContent in the same batch.
  await verified();
});

test('response validation rejects broken field types, metadata, enums and selections', async () => {
  await buildVerification({
    responseMutations: [
      {
        id: 'blogs-default',
        name: 'missing required id',
        change: (r) => {
          delete r.contents[0].id;
        },
      },
      {
        id: 'banner-default',
        name: 'object metadata has no id',
        change: (r) => {
          r.id = 'unexpected';
        },
      },
      {
        id: 'blogs-title',
        name: 'title must be a string',
        change: (r) => {
          r.contents[0].title = 123;
        },
      },
      {
        id: 'blogs-title',
        name: 'unselected content id',
        change: (r) => {
          r.contents[0].id = 'not-selected';
        },
      },
      {
        id: 'blogs-reference-name',
        name: 'unselected reference id',
        change: (r) => {
          r.contents[0].category.id = 'not-selected';
        },
      },
      {
        id: 'all-fields-default',
        name: 'boolean cannot be a string',
        change: (r) => {
          r.contents.find((c) => c.id === 'typegen-fixture-filled').boolean =
            'true';
        },
      },
      {
        id: 'all-fields-default',
        name: 'invalid select option',
        change: (r) => {
          r.contents.find((c) => c.id === 'typegen-fixture-filled').select = [
            'invalid',
          ];
        },
      },
      {
        id: 'all-fields-default',
        name: 'invalid custom field discriminator',
        change: (r) => {
          r.contents.find(
            (c) => c.id === 'typegen-fixture-filled',
          ).repeat[0].fieldId = 'invalid';
        },
      },
    ],
  });
});

test('fixtures include populated and empty values rather than only empty result pages', async () => {
  const v = await verified();
  const list = v.responseFixture.cases.find(
    (c) => c.id === 'all-fields-default',
  ).response.contents;
  const filled = list.find((c) => c.id === 'typegen-fixture-filled');
  const empty = list.find((c) => c.id === 'typegen-fixture-empty');
  assert.ok(
    filled && empty,
    'Capture populated and empty test contents before running offline tests',
  );
  assert.equal(filled.num, 0);
  assert.equal(empty.boolean, false);
  assert.equal(empty.ref, null);
  assert.deepEqual(empty.multi_ref, []);
  assert.deepEqual(empty.images, []);
  assert.deepEqual(empty.select, []);
  assert.equal(filled.repeat.length, 5);
  assert.ok(filled.file.url && typeof filled.file.fileSize === 'number');
  assert.deepEqual(filled.extend, {
    place: { name: 'Fixture place', address: 'Test address' },
    labels: ['one', 'two'],
  });
});

test('configured extension data matches real reads and validates write data', async () => {
  await buildVerification({
    extensionTypes: true,
    responseMutations: [
      {
        id: 'all-fields-default',
        name: 'configured extension name must be a string',
        change: (response) => {
          response.contents.find(
            (c) => c.id === 'typegen-fixture-filled',
          ).extend.place.name = 123;
        },
      },
    ],
  });
});

// Compile recorded inputs and saved results. The runtime and live API are not executed.
test('captured write inputs and responses agree with generated types through the SDK', async () => {
  await verified();
});
