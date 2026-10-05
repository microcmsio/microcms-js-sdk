import { basename, dirname, relative, resolve } from 'path';
import {
  mkdtempSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  rmSync,
  writeFileSync,
} from 'fs';
import { tmpdir } from 'os';
import { spawnSync } from 'child_process';

// Compile consumer examples independently: a rejected call must fail at that call,
// and every accepted call must retain its exact promised result type.
const prelude = `
import { createClient, type InferMicroCMSContent, type MicroCMSListContent, type MicroCMSObjectContent } from 'microcms-js-sdk';
type Assert<T extends true> = T;
type Equal<A, B> = (<T>() => T extends A ? 1 : 2) extends (<T>() => T extends B ? 1 : 2) ? true : false;
type Depth = 0 | 1 | 2 | 3;
type Previous = { 0: 0; 1: 0; 2: 1; 3: 2 };
type Read<L extends Depth = 1> = MicroCMSListContent & {
  title?: string | null;
  category: (L extends 0 ? { id: string } : Read<Previous[L]>) | null;
  related: (L extends 0 ? { id: string } : Read<Previous[L]>)[];
};
type ObjectRead<L extends Depth = 1> = Omit<Read<L>, 'id'>;
type Alpha = { fieldId: 'alpha'; text?: string };
type Beta = { fieldId: 'beta'; count?: number };
type Data = { name: string; children: Data[] };
type Write = {
  title?: string;
  custom?: Alpha;
  repeat?: (Alpha | Beta)[];
  data?: Data;
  dictionary?: Record<string, { name: string }>;
  free?: unknown;
  tuple?: [{ name: string }, { name: string; label?: string }];
};
type Schema = {
  blogs: { kind: 'list'; content: Read; depths: { [L in Depth]: Read<L> }; fieldPaths: 'id' | 'title' | 'category' | 'category.id' | 'category.title' | 'related' | 'related.id' | 'related.title'; create: Write; update: Omit<Write, 'custom'> & { custom?: Alpha | Record<string, never> } };
  other: { kind: 'list'; content: { id: string; slug: string }; fieldPaths: 'id' | 'slug'; create: { slug?: string }; update: { slug?: string } };
  settings: { kind: 'object'; content: ObjectRead; depths: { [L in Depth]: ObjectRead<L> }; fieldPaths: 'title' | 'category' | 'category.id' | 'category.title' | 'related' | 'related.id' | 'related.title'; update: Write };
};
const client = createClient<Schema>({ serviceDomain: 'fixture', apiKey: 'TYPE_ONLY' });
`;

type Case = { name: string; source: string; reject: boolean };
const cases: Case[] = [];
const add = (name: string, setup: string, call: string, expected?: string) => {
  cases.push({
    name,
    reject: expected === undefined,
    source: `${prelude}\n${setup}\nconst result = ${call};\n${expected === undefined ? '' : `type Actual = ${name.startsWith('getList/') ? "Awaited<typeof result>['contents'][number]" : name.startsWith('getAllContents/') ? 'Awaited<typeof result>[number]' : 'Awaited<typeof result>'};\ntype Check = Assert<Equal<Actual, ${expected}>>;`}`,
  });
};

for (const method of [
  'getList',
  'getListDetail',
  'getObject',
  'getAllContents',
]) {
  const endpoint = method === 'getObject' ? 'settings' : 'blogs';
  const base = `endpoint: '${endpoint}'${method === 'getListDetail' ? ", contentId: 'id'" : ''}`;
  const content = method === 'getObject' ? 'ObjectRead' : 'Read';
  const call = (query?: string) =>
    `client.${method}({ ${base}${query === undefined ? '' : `, queries: ${query}`} })`;
  const accepted = [
    ['default', '', undefined, content],
    ['empty', '', '{}', content],
    ...[0, 1, 2, 3].map((depth) => [
      `depth-${depth}`,
      '',
      `{ depth: ${depth} }`,
      `${content}<${depth}>`,
    ]),
    ['string', '', "{ fields: 'title' }", '{ title?: string | null }'],
    ['inline-array', '', "{ fields: ['title'] }", '{ title?: string | null }'],
    [
      'const-variable',
      "const q = { fields: ['title'] } as const;",
      'q',
      '{ title?: string | null }',
    ],
    [
      'dynamic-string',
      'declare const fields: string;',
      '{ fields }',
      'unknown',
    ],
    [
      'dynamic-array',
      'declare const fields: string[];',
      '{ fields }',
      'unknown',
    ],
    [
      'variadic',
      "declare const fields: readonly ['title', ...'category'[]];",
      '{ fields }',
      'unknown',
    ],
    [
      'optional-depth',
      'declare const q: { depth?: 2 };',
      'q',
      `${content}<1> | ${content}<2>`,
    ],
    [
      'optional-fields',
      "declare const q: { fields?: 'title' };",
      'q',
      'unknown',
    ],
    [
      'query-union',
      'declare const q: {} | { depth: 2 };',
      'q',
      `${content}<1> | ${content}<2>`,
    ],
    [
      'overlapping-valid-union',
      'declare const q: { depth: 1 } | { depth: 1; orders: string };',
      'q',
      content,
    ],
    [
      'reference',
      '',
      "{ depth: 0, fields: ['category.id'] }",
      '{ category: { id: string } | null }',
    ],
    [
      'multi-reference',
      '',
      "{ fields: ['related.id', 'related.title'] }",
      '{ related: { id: string; title?: string | null }[] }',
    ],
  ];
  for (const [name, setup, query, expected] of accepted) {
    add(`${method}/${name}`, setup!, call(query), expected);
  }
  add(
    `${method}/bad-branch-without-query`,
    `declare const request: { ${base}; queries: { fields: 'missing' } } | { ${base} };`,
    `client.${method}(request)`,
  );
  add(
    `${method}/request-union`,
    `declare const request: { ${base}; queries: { depth: 2 } } | { ${base} };`,
    `client.${method}(request)`,
    `${content}<1> | ${content}<2>`,
  );
  for (const fields of [
    '',
    "fields: 'title',",
    "fields: readonly ['title'],",
  ]) {
    for (const form of ['variable', 'query-union', 'request-union']) {
      const q = `{ ${fields} depth: 1; limti: number }`;
      const setup =
        form === 'variable'
          ? `declare const q: ${q};`
          : form === 'query-union'
            ? `declare const q: { ${fields} depth: 1 } | ${q};`
            : `declare const request: { ${base}; queries: { ${fields} depth: 1 } } | { ${base}; queries: ${q} };`;
      add(
        `${method}/reject-typo-${fields || 'plain'}-${form}`,
        setup,
        form === 'request-union' ? `client.${method}(request)` : call('q'),
      );
    }
  }
  add(`${method}/invalid-inline-field`, '', call("{ fields: ['missing'] }"));
  add(`${method}/invalid-comma-field`, '', call("{ fields: 'title,missing' }"));
  add(
    `${method}/invalid-depth-path`,
    '',
    call("{ depth: 0, fields: 'category.title' }"),
  );
  add(`${method}/invalid-depth`, '', call('{ depth: 4 }'));
  add(
    `${method}/unsupported-rich-editor-format`,
    '',
    call("{ richEditorFormat: 'object' }"),
  );
  add(
    `${method}/legacy-rich-editor-format`,
    '',
    `client.${method}<{ explicit: number }>({ ${base}, queries: { richEditorFormat: 'object' } })`,
    `{ explicit: number } & ${method === 'getObject' ? 'MicroCMSObjectContent' : 'MicroCMSListContent'}`,
  );
  add(
    `${method}/invalid-field-union`,
    "declare const fields: 'title' | 'missing';",
    call('{ fields }'),
  );
  add(
    `${method}/invalid-optional-field`,
    "declare const q: { fields?: 'missing' };",
    call('q'),
  );
  add(
    `${method}/invalid-endpoint`,
    '',
    `client.${method}({ ${base.replace(endpoint, 'missing')} })`,
  );
  add(
    `${method}/wrong-kind`,
    '',
    `client.${method}({ ${base.replace(endpoint, endpoint === 'blogs' ? 'settings' : 'blogs')} })`,
  );
  add(
    `${method}/legacy-override`,
    '',
    `client.${method}<{ explicit: number }>({ ${base}, queries: { fields: 'anything' } })`,
    `{ explicit: number } & ${method === 'getObject' ? 'MicroCMSObjectContent' : 'MicroCMSListContent'}`,
  );
}
for (const key of ['limit', 'offset', 'ids']) {
  const value = key === 'ids' ? "'one'" : '1';
  add(
    `getAllContents/excluded-${key}`,
    `const q = { fields: 'title', ${key}: ${value} } as const;`,
    "client.getAllContents({ endpoint: 'blogs', queries: q })",
  );
}
add(
  'getListDetail/id-required',
  '',
  "client.getListDetail({ endpoint: 'blogs' })",
);
add(
  'getObject/id-forbidden',
  '',
  "client.getObject({ endpoint: 'settings', contentId: 'id' })",
);
add(
  'getList/endpoint-correlation',
  "declare const request: { endpoint: 'blogs'; queries: { fields: 'title' } } | { endpoint: 'other'; queries: { fields: 'slug' } };",
  'client.getList(request)',
  '{ title?: string | null } | { slug: string }',
);
add(
  'getList/endpoint-union-shared-field',
  "declare const endpoint: 'blogs' | 'other';",
  "client.getList({ endpoint, queries: { fields: ['id'] } })",
  "Pick<Read, 'id'> | Pick<Schema['other']['content'], 'id'>",
);
add(
  'getList/endpoint-union-invalid-field',
  "declare const endpoint: 'blogs' | 'other';",
  "client.getList({ endpoint, queries: { fields: 'title' } })",
);

for (const method of ['create', 'update']) {
  const base = `endpoint: 'blogs'${method === 'update' ? ", contentId: 'id'" : ''}`;
  const call = (content: string) =>
    `client.${method}({ ${base}, content: ${content} })`;
  for (const [name, content] of [
    ['empty', '{}'],
    ['custom', "{ custom: { fieldId: 'alpha', text: 'ok' } }"],
    [
      'heterogeneous-array',
      "{ repeat: [{ fieldId: 'alpha', text: 'ok' }, { fieldId: 'beta', count: 1 }] }",
    ],
    [
      'recursive',
      "{ data: { name: 'one', children: [{ name: 'two', children: [] }] } }",
    ],
    ['dictionary', "{ dictionary: { userKey: { name: 'ok' } } }"],
    ['unknown', '{ free: { arbitrary: [1, true, null] } }'],
    ['tuple', "{ tuple: [{ name: 'one' }, { name: 'two', label: 'ok' }] }"],
  ])
    add(`${method}/${name}`, '', call(content), '{ id: string }');
  add(
    `${method}/typed-recursive-variable`,
    'declare const data: Data;',
    call('{ data }'),
    '{ id: string }',
  );
  for (const [name, content] of [
    [
      'custom-extra',
      "{ custom: { fieldId: 'alpha', text: 'ok', typo: true } }",
    ],
    [
      'mixed-discriminator',
      "{ repeat: [{ fieldId: 'alpha', text: 'ok', count: 1 }] }",
    ],
    [
      'second-item',
      "{ repeat: [{ fieldId: 'alpha', text: 'ok' }, { fieldId: 'beta', count: 1, text: 'bad' }] }",
    ],
    [
      'recursive-extra',
      "{ data: { name: 'one', children: [{ name: 'two', children: [], typo: true }] } }",
    ],
    [
      'dictionary-extra',
      "{ dictionary: { userKey: { name: 'ok', typo: true } } }",
    ],
    [
      'tuple-extra',
      "{ tuple: [{ name: 'one', label: 'bad' }, { name: 'two' }] }",
    ],
  ]) {
    add(`${method}/reject-${name}-inline`, '', call(content));
    add(
      `${method}/reject-${name}-variable`,
      `const content = ${content.replace(/fieldId: 'alpha'/g, "fieldId: 'alpha' as const").replace(/fieldId: 'beta'/g, "fieldId: 'beta' as const")};`,
      call('content'),
    );
  }
  add(
    `${method}/reject-optional-extra`,
    "declare const custom: { fieldId: 'alpha'; text?: string; typo?: boolean };",
    call('{ custom }'),
  );
  add(
    `${method}/reject-overlapping-content`,
    'declare const content: { custom: Alpha } | { custom: Alpha & { typo: boolean } };',
    call('content'),
  );
  add(
    `${method}/explicit-content-override`,
    '',
    `client.${method}<{ custom: { extra: boolean } }>({ ${base}, content: { custom: { extra: true } } })`,
    '{ id: string }',
  );
}
add(
  'update/list-id-required',
  '',
  "client.update({ endpoint: 'blogs', content: {} })",
);
add(
  'update/object-id-forbidden',
  '',
  "client.update({ endpoint: 'settings', contentId: 'id', content: {} })",
);
add(
  'update/custom-reset',
  '',
  "client.update({ endpoint: 'blogs', contentId: 'id', content: { custom: {} } })",
  '{ id: string }',
);
add(
  'getList/readonly-ids',
  "const q = { fields: ['id', 'title'], ids: ['one', 'two'] } as const;",
  "client.getList({ endpoint: 'blogs', queries: q })",
  '{ id: string; title?: string | null }',
);
add(
  'update/object',
  '',
  "client.update({ endpoint: 'settings', content: { title: 'ok' } })",
  '{ id: string }',
);
add(
  'create/object-forbidden',
  '',
  "client.create({ endpoint: 'settings', content: {} })",
);
add(
  'delete/object-forbidden',
  '',
  "client.delete({ endpoint: 'settings', contentId: 'id' })",
);
add(
  'getAllContentIds/object-forbidden',
  '',
  "client.getAllContentIds({ endpoint: 'settings' })",
);
add(
  'getAllContentIds/missing-endpoint',
  '',
  "client.getAllContentIds({ endpoint: 'missing' })",
);

// Extract source declarations using the SDK's own compiler settings, then check
// those declarations using each consumer setting. Runtime implementation options
// are separate from consumers' exactOptionalPropertyTypes setting.
let sourceDeclarations: Map<string, string>;
const declarations = () => {
  if (sourceDeclarations) return sourceDeclarations;
  const root = resolve(__dirname, '..');
  const directory = mkdtempSync(
    resolve(tmpdir(), 'microcms-sdk-declarations-'),
  );
  try {
    // Source declarations always use the development compiler. Consumer checks
    // below may select TypeScript 6 in CI independently of this build step.
    const result = spawnSync(
      process.execPath,
      [
        resolve(
          dirname(require.resolve('typescript/package.json')),
          JSON.parse(
            readFileSync(require.resolve('typescript/package.json'), 'utf8'),
          ).bin.tsc,
        ),
        '--project',
        resolve(root, 'tsconfig.declarations.json'),
        '--outDir',
        directory,
        '--pretty',
        'false',
      ],
      { cwd: root, encoding: 'utf8', timeout: 60000 },
    );
    if (result.error || result.status !== 0)
      throw new Error(
        `Source declaration extraction failed: ${result.error?.message ?? ''}\n${result.stdout}\n${result.stderr}`,
      );
    sourceDeclarations = new Map();
    const collect = (folder: string) => {
      for (const entry of readdirSync(folder, { withFileTypes: true })) {
        const file = resolve(folder, entry.name);
        if (entry.isDirectory()) collect(file);
        else if (entry.name.endsWith('.d.ts'))
          sourceDeclarations.set(
            resolve(root, 'src', relative(directory, file)),
            readFileSync(file, 'utf8'),
          );
      }
    };
    collect(directory);
    if (sourceDeclarations.size === 0)
      throw new Error('Source declaration extraction emitted no declarations');
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
  return sourceDeclarations;
};

for (const entry of ['source', 'dist']) {
  for (const exactOptionalPropertyTypes of [false, true]) {
    describe(`${entry}, exactOptionalPropertyTypes=${exactOptionalPropertyTypes}`, () => {
      let diagnostics: readonly {
        code: number;
        start?: number;
        messageText: string;
        file?: { fileName: string };
      }[];
      const files = new Map(
        cases.map((c, i) => [resolve(__dirname, `.matrix-${i}.ts`), c.source]),
      );
      beforeAll(() => {
        const manifestPath = require.resolve('typescript/package.json');
        const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
        const directory = mkdtempSync(
          resolve(tmpdir(), 'microcms-sdk-matrix-'),
        );
        try {
          for (const [file, source] of Array.from(files))
            writeFileSync(resolve(directory, basename(file)), source);
          if (entry === 'source') {
            for (const [file, source] of Array.from(declarations())) {
              const output = resolve(
                directory,
                'source',
                relative(resolve(__dirname, '..'), file),
              );
              mkdirSync(dirname(output), { recursive: true });
              writeFileSync(output, source);
            }
          }
          writeFileSync(
            resolve(directory, 'tsconfig.json'),
            JSON.stringify({
              compilerOptions: {
                strict: true,
                exactOptionalPropertyTypes,
                noEmit: true,
                esModuleInterop: true,
                useUnknownInCatchVariables: false,
                target: 'ES2022',
                module: 'ESNext',
                moduleResolution: 'Bundler',
                types: [],
                paths: {
                  'microcms-js-sdk': [
                    entry === 'source'
                      ? './source/src/index.d.ts'
                      : resolve(__dirname, '..'),
                  ],
                  'src/*': ['./source/src/*'],
                },
              },
              files: Array.from(files.keys(), (file) => `./${basename(file)}`),
            }),
          );
          const result = spawnSync(
            process.execPath,
            [
              process.env.MICROCMS_TYPESCRIPT_BINARY ??
                resolve(dirname(manifestPath), manifest.bin.tsc),
              '--pretty',
              'false',
              '--project',
              resolve(directory, 'tsconfig.json'),
            ],
            {
              cwd: directory,
              encoding: 'utf8',
              timeout: 60000,
              maxBuffer: 16 * 1024 * 1024,
            },
          );
          if (result.error || ![0, 1, 2].includes(result.status ?? -1))
            throw new Error(
              `Compiler failed (status=${result.status}, signal=${result.signal}): ${result.error?.message ?? ''}\n${result.stdout}\n${result.stderr}`,
            );
          const output = result.stdout + result.stderr;
          const parsed: typeof diagnostics = Array.from(
            output.matchAll(/^(.+?)\((\d+),(\d+)\): error TS(\d+): (.*)$/gm),
            (match) => {
              const file = resolve(__dirname, basename(match[1]));
              const source = files.get(file);
              const line = Number(match[2]);
              const start =
                source === undefined
                  ? undefined
                  : source
                      .split('\n')
                      .slice(0, line - 1)
                      .reduce((offset, value) => offset + value.length + 1, 0) +
                    Number(match[3]) -
                    1;
              return {
                file: { fileName: file },
                start,
                code: Number(match[4]),
                messageText: match[5],
              };
            },
          );
          const external = parsed.filter(
            (d) => !d.file || !files.has(d.file.fileName),
          );
          expect(external).toEqual([]);
          if (result.status !== 0 && parsed.length === 0)
            throw new Error(output);
          // Any global compiler error must fail the suite rather than being treated
          // as a successful rejection of an invalid consumer call.
          expect(output.match(/^error TS\d+:/gm) ?? []).toEqual([]);
          diagnostics = parsed;
        } finally {
          rmSync(directory, { recursive: true, force: true });
        }
      }, 30000);
      test.each(
        cases.map(
          (c, i) => [c.name, c, resolve(__dirname, `.matrix-${i}.ts`)] as const,
        ),
      )('%s', (_name, c, file) => {
        const errors = diagnostics.filter((d) => d.file?.fileName === file);
        if (c.reject) {
          expect(errors.length).toBeGreaterThan(0);
          expect(
            errors.every((d) => [2322, 2345, 2353, 2769].includes(d.code)),
          ).toBe(true);
          // Setup mistakes must not make a rejected call appear to pass its test.
          const start = c.source.indexOf('const result = ');
          const end = c.source.indexOf(';', start) + 1;
          expect(
            errors.every(
              (d) => d.start !== undefined && d.start >= start && d.start < end,
            ),
          ).toBe(true);
        } else {
          expect(errors.map((d) => d.messageText)).toEqual([]);
        }
      });
    });
  }
}
