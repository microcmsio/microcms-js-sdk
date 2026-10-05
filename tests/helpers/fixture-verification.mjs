import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { checkTypes } from './type-compiler.mjs';

const root = fileURLToPath(new URL('../../', import.meta.url));
const fixtures = new URL('../fixtures/typegen/', import.meta.url);
const load = async (name) =>
  JSON.parse(await readFile(new URL(name, fixtures), 'utf8'));

export async function buildVerification({
  extensionTypes = false,
  responseMutations = [],
} = {}) {
  const schemaFixture = await load('schemas.json');
  const responseFixture = await load('responses.json');
  const writeFixture = await load('writes.json');
  const lifecycleFixture = await load('lifecycle.json');
  const generated = await readFile(
    extensionTypes
      ? new URL(
          '../fixtures/typegen/generated/with-extensions.ts',
          import.meta.url,
        )
      : new URL('../../examples/generated/microcms-types.ts', import.meta.url),
    'utf8',
  );
  const directory = await mkdtemp(join(tmpdir(), 'microcms-fixture-types-'));
  try {
    await writeFile(join(directory, 'generated.ts'), generated);
    if (extensionTypes)
      await writeFile(
        join(directory, 'extensions.ts'),
        await readFile(new URL('generated/extensions.ts', fixtures), 'utf8'),
      );
    const sdk = join(root, 'dist/microcms-js-sdk');
    let source = `import { createClient, type InferMicroCMSContent } from ${JSON.stringify(sdk)};\nimport type { ExampleServiceSchema, Blogs } from './generated';\nconst client = createClient<ExampleServiceSchema>({ serviceDomain: 'fixture', apiKey: 'TYPE_ONLY' });\ntype Assert<T extends true> = T;\ntype Equal<A, B> = (<T>() => T extends A ? 1 : 2) extends (<T>() => T extends B ? 1 : 2) ? true : false;\n`;
    for (const [index, entry] of responseFixture.cases.entries()) {
      source += `const query_${index} = ${JSON.stringify(entry.queries)} as const;\nconst response_${index} = client.${entry.method}({ endpoint: ${JSON.stringify(entry.endpoint)}, queries: query_${index}${entry.contentId ? `, contentId: ${JSON.stringify(entry.contentId)}` : ''} });\n`;
      source += `const captured_${index}: Awaited<typeof response_${index}> = ${JSON.stringify(entry.response)};\n`;
      const content =
        entry.method === 'getList'
          ? `Awaited<typeof response_${index}>['contents'][number]`
          : `Awaited<typeof response_${index}>`;
      source += `type Extracted_${index} = Assert<Equal<${content}, InferMicroCMSContent<ExampleServiceSchema, ${JSON.stringify(entry.endpoint)}, typeof query_${index}>>>;\n`;
      const fields = entry.queries.fields;
      const kind = schemaFixture.listing.apis.find(
        (api) => api.endpoint === entry.endpoint,
      ).type;
      const keys = fields
        ? [
            ...new Set(
              (Array.isArray(fields) ? fields : fields.split(',')).map(
                (path) => path.split('.')[0],
              ),
            ),
          ]
        : [
            ...(kind === 'list' ? ['id'] : []),
            'createdAt',
            'updatedAt',
            'publishedAt',
            'revisedAt',
            ...schemaFixture.schemas[entry.endpoint].apiFields.map(
              (field) => field.fieldId,
            ),
          ];
      // A matching JSON assignment alone could pass with an unknown/any result.
      // Verify the exact selected field set as well as the extracted content type.
      source += `type Keys_${index} = Assert<Equal<keyof ${content}, ${keys.map((key) => JSON.stringify(key)).join(' | ')}>>;\n`;
      if (entry.id === 'all-fields-multi-reference-fields')
        source += `
// Selected reference fields must also be available inside array callbacks.
response_${index}.then(response => response.contents[0].multi_ref.map(item => {
  const id: string = item.id;
  const name: string | null | undefined = item.name;
  return { id, name };
}));
`;
    }
    for (const [index, entry] of writeFixture.cases.entries()) {
      source += `const create_${index} = client.create({ endpoint: 'all_fields', content: ${JSON.stringify(entry.content)} });\n`;
      source += `const update_${index} = client.update({ endpoint: 'all_fields', contentId: ${JSON.stringify(entry.id)}, content: ${JSON.stringify(entry.content)} });\n`;
    }
    for (const [index, entry] of lifecycleFixture.events.entries()) {
      source += `const lifecycle_${index} = client.${entry.method}(${JSON.stringify(entry.request)});\n`;
      if (entry.method === 'delete')
        source += `type Deleted_${index} = Assert<Equal<Awaited<typeof lifecycle_${index}>, void>>;\n`;
      else if (!entry.sdkRejected)
        source += `const lifecycleResult_${index}: Awaited<typeof lifecycle_${index}> = ${JSON.stringify(entry.sdkResult)};\n`;
    }
    if (extensionTypes)
      source += `
// @ts-expect-error configured extension data is checked in writes
client.create({ endpoint: 'all_fields', content: { extend: { data: { place: { name: 123, address: 'address' }, labels: [] } } } });
// @ts-expect-error configured extension data also rejects unknown nested keys
client.update({ endpoint: 'all_fields', contentId: 'id', content: { extend: { data: { place: { name: 'place', address: 'address', typo: 'bad' }, labels: [] } } } });
`;
    source += `
// Representative checks using the actual generated schema.
const allContents = client.getAllContents({ endpoint: 'blogs', queries: { fields: ['id', 'title'] as const } });
type AllContents = Assert<Equal<Awaited<typeof allContents>[number], InferMicroCMSContent<ExampleServiceSchema, 'blogs', { fields: readonly ['id', 'title'] }>>>;
const legacy = createClient({ serviceDomain: 'fixture', apiKey: 'TYPE_ONLY' });
legacy.getList<Blogs>({ endpoint: 'blogs' });
client.update({ endpoint: 'banner', content: { url: 'https://example.com' } });
// @ts-expect-error generated field paths do not include a nonexistent field
client.getList({ endpoint: 'blogs', queries: { fields: ['missing'] } });
// @ts-expect-error generated depth 0 references only expose id
client.getList({ endpoint: 'blogs', queries: { depth: 0, fields: ['category.name'] } });
// @ts-expect-error generated object metadata has no id
client.getObject({ endpoint: 'banner', queries: { fields: ['id'] } });
// @ts-expect-error reads return image objects, writes require URL strings
client.create({ endpoint: 'all_fields', content: { image: { url: 'invalid' } } });
// @ts-expect-error reference writes require IDs
client.create({ endpoint: 'all_fields', content: { ref: { id: 'invalid' } } });
// @ts-expect-error select only allows schema values
client.create({ endpoint: 'all_fields', content: { select: ['invalid'] } });
// @ts-expect-error unknown custom field discriminator
client.create({ endpoint: 'all_fields', content: { custom: { fieldId: 'missing' } } });
// @ts-expect-error nested generated custom fields reject unknown keys
client.create({ endpoint: 'all_fields', content: { custom: { fieldId: 'Alpha', hoge: 'ok', typo: 'bad' } } });
// @ts-expect-error repeat items cannot borrow fields from another custom field
client.update({ endpoint: 'all_fields', contentId: 'id', content: { repeat: [{ fieldId: 'Alpha', hoge: 'ok', aa: 'wrong' }] } });
declare const overlappingQueries: { depth: 1 } | { depth: 1; limti: number };
// @ts-expect-error every query candidate must use known parameter names
client.getList({ endpoint: 'blogs', queries: overlappingQueries });
// @ts-expect-error create does not accept null for booleans
client.create({ endpoint: 'all_fields', content: { boolean: null } });
`;
    await writeFile(join(directory, 'usage.ts'), source);
    checkTypes([join(directory, 'usage.ts')], ['--exactOptionalPropertyTypes']);
    // Check malformed responses with the same compiler as the valid fixtures.
    // Every mutation is assigned directly as a fresh literal, so extra selected
    // fields and invalid nested values are checked without type assertions.
    if (responseMutations.length) {
      for (const [index, mutation] of responseMutations.entries()) {
        const responseIndex = responseFixture.cases.findIndex(
          (entry) => entry.id === mutation.id,
        );
        if (responseIndex < 0)
          throw new Error(`Unknown response fixture: ${mutation.id}`);
        const value = structuredClone(
          responseFixture.cases[responseIndex].response,
        );
        mutation.change(value);
        source += `\n// @ts-expect-error malformed response: ${mutation.name}\nconst invalid_${index}: Awaited<typeof response_${responseIndex}> = ${JSON.stringify(value)};\n`;
      }
      await writeFile(join(directory, 'usage.ts'), source);
      checkTypes(
        [join(directory, 'usage.ts')],
        ['--exactOptionalPropertyTypes'],
      );
    }
    return { schemaFixture, responseFixture, writeFixture, lifecycleFixture };
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
}
