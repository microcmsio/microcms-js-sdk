import { createClient, type InferMicroCMSContent } from 'microcms-js-sdk';

type Assert<Value extends true> = Value;
type Equal<Left, Right> =
  (<Value>() => Value extends Left ? 1 : 2) extends <
    Value,
  >() => Value extends Right ? 1 : 2
    ? true
    : false;

type Blog<Depth extends number = 1> = {
  title: string;
  relation: Depth extends 2 ? { title: string } : { id: string };
};
type Setting = { headline: string };
type Schema = {
  blog: { kind: 'list'; content: Blog };
  setting: { kind: 'object'; content: Setting };
};

const options = { serviceDomain: 'example', apiKey: 'key' };
const legacy = createClient(options);
legacy.getList({ endpoint: 'any-endpoint' });
legacy.getList<Blog>({ endpoint: 'blog' });
legacy.getAllContentIds({ endpoint: 'any-endpoint' });
type DerivedLegacyClient = ReturnType<typeof createClient>;
declare const derivedLegacy: DerivedLegacyClient;
derivedLegacy.getList<Blog>({ endpoint: 'any-endpoint' });

const typed = createClient<Schema>(options);
const contentIds = typed.getAllContentIds({
  endpoint: 'blog',
  alternateField: 'title',
  filters: 'title[contains]example',
  orders: '-createdAt',
  draftKey: 'draft-key',
  customRequestInit: { cache: 'no-store' },
});
type _ContentIds = Assert<Equal<Awaited<typeof contentIds>, string[]>>;
// @ts-expect-error unknown endpoints cannot be passed to getAllContentIds
typed.getAllContentIds({ endpoint: 'missing' });
// @ts-expect-error object endpoints cannot be passed to getAllContentIds
typed.getAllContentIds({ endpoint: 'setting' });
const list = typed.getList({ endpoint: 'blog', queries: { depth: 1 } });
type _ListTitle = Assert<
  Equal<Awaited<typeof list>['contents'][number]['title'], string>
>;
const detail = typed.getListDetail({ endpoint: 'blog', contentId: 'id' });
type _DetailTitle = Assert<Equal<Awaited<typeof detail>['title'], string>>;
const object = typed.getObject({ endpoint: 'setting' });
type _ObjectHeadline = Assert<
  Equal<Awaited<typeof object>['headline'], string>
>;
const all = typed.getAllContents({ endpoint: 'blog' });
type _AllTitle = Assert<Equal<Awaited<typeof all>[number]['title'], string>>;

// Every read method checks the endpoint kind, including explicit generic calls.
typed.get({ endpoint: 'blog' });
typed.get({ endpoint: 'blog', contentId: 'id' });
typed.get({ endpoint: 'setting' });
const raw = typed.get<{ headline: string }>({ endpoint: 'setting' });
type _RawGet = Assert<Equal<Awaited<typeof raw>, { headline: string }>>;
legacy.get({ endpoint: 'any-endpoint', contentId: 'id' });
// @ts-expect-error unknown endpoints cannot be passed to get
typed.get({ endpoint: 'missing' });
// @ts-expect-error object endpoints cannot have a content ID
typed.get({ endpoint: 'setting', contentId: 'id' });
// @ts-expect-error explicit raw response types do not bypass endpoint checks
typed.get<Setting>({ endpoint: 'missing' });
// @ts-expect-error explicit raw response types do not bypass object ID checks
typed.get<Setting>({ endpoint: 'setting', contentId: 'id' });
// @ts-expect-error detail reads require a content ID
typed.getListDetail({ endpoint: 'blog' });
// @ts-expect-error object endpoints cannot be passed to detail reads
typed.getListDetail({ endpoint: 'setting', contentId: 'id' });
// @ts-expect-error unknown endpoints cannot be passed to detail reads
typed.getListDetail({ endpoint: 'missing', contentId: 'id' });
// @ts-expect-error unknown endpoints cannot be passed to object reads
typed.getObject({ endpoint: 'missing' });
// @ts-expect-error object endpoints cannot be passed to getAllContents
typed.getAllContents({ endpoint: 'setting' });
// @ts-expect-error unknown endpoints cannot be passed to getAllContents
typed.getAllContents({ endpoint: 'missing' });
// @ts-expect-error explicit generics do not bypass list endpoint kinds
typed.getList<Blog>({ endpoint: 'setting' });
// @ts-expect-error explicit generics do not bypass detail endpoint kinds
typed.getListDetail<Blog>({ endpoint: 'setting', contentId: 'id' });
// @ts-expect-error explicit generics do not bypass object endpoint kinds
typed.getObject<Setting>({ endpoint: 'blog' });
// @ts-expect-error explicit generics do not bypass all-content endpoint kinds
typed.getAllContents<Blog>({ endpoint: 'setting' });

// Existing per-method generics still override the response type.
const deep = typed.getList<Blog<2>>({
  endpoint: 'blog',
  queries: { depth: 2 },
});
type _DeepRelation = Assert<
  Equal<Awaited<typeof deep>['contents'][number]['relation'], { title: string }>
>;
typed.getObject<Setting>({ endpoint: 'setting' });
typed.getList<any>({ endpoint: 'blog' });
typed.getList<never>({ endpoint: 'blog' });

// @ts-expect-error object endpoints cannot be passed to getList
typed.getList({ endpoint: 'setting' });
// @ts-expect-error list endpoints cannot be passed to getObject
typed.getObject({ endpoint: 'blog' });
// @ts-expect-error unknown endpoints are rejected on a typed client
typed.getList({ endpoint: 'missing' });

// Response-shaping queries must not silently return the standard shape.
const projected = typed.getList({
  endpoint: 'blog',
  queries: { fields: ['title'] },
});
type _Projected = Assert<
  Equal<Awaited<typeof projected>['contents'][number], unknown>
>;
const shallow = typed.getList({ endpoint: 'blog', queries: { depth: 0 } });
type _Shallow = Assert<
  Equal<Awaited<typeof shallow>['contents'][number], unknown>
>;
const projectedObject = typed.getObject({
  endpoint: 'setting',
  queries: { fields: 'headline' },
});
type _ProjectedObject = Assert<Equal<Awaited<typeof projectedObject>, unknown>>;

// Unsupported response formats require an explicit legacy method type argument.
// @ts-expect-error object rich editor format cannot be inferred
typed.getList({ endpoint: 'blog', queries: { richEditorFormat: 'object' } });
typed.getList<Blog>({
  endpoint: 'blog',
  queries: { richEditorFormat: 'object' },
});

type CategoryAt<Level extends 0 | 1 | 2 | 3> = Level extends 0
  ? { id: string }
  : Level extends 1
    ? { id: string; name: string }
    : { id: string; name: string; parent: { id: string; name: string } };

type ArticleAt<Level extends 0 | 1 | 2 | 3> = {
  id: string;
  createdAt: string;
  title?: string | null;
  category?: CategoryAt<Level> | null;
  related: CategoryAt<Level>[];
};

type ShapeSchema = {
  articles: {
    kind: 'list';
    content: ArticleAt<1>;
    depths: {
      0: ArticleAt<0>;
      1: ArticleAt<1>;
      2: ArticleAt<2>;
      3: ArticleAt<3>;
    };
    fieldPaths:
      | 'id'
      | 'createdAt'
      | 'title'
      | 'category'
      | 'category.id'
      | 'category.name'
      | 'category.parent.name'
      | 'related'
      | 'related.id'
      | 'related.name'
      | 'related.parent.name';
  };
  settings: {
    kind: 'object';
    content: { createdAt: string; siteName?: string | null };
    depths: {
      0: { createdAt: string; siteName?: string | null };
      1: { createdAt: string; siteName?: string | null };
      2: { createdAt: string; siteName?: string | null };
      3: { createdAt: string; siteName?: string | null };
    };
    fieldPaths: 'createdAt' | 'siteName';
  };
};

const shaped = createClient<ShapeSchema>(options);
const depthZero = shaped.getList({
  endpoint: 'articles',
  queries: { depth: 0 },
});
type _DepthZero = Assert<
  Equal<
    NonNullable<Awaited<typeof depthZero>['contents'][number]['category']>,
    { id: string }
  >
>;
const depthTwo = shaped.getList({
  endpoint: 'articles',
  queries: { depth: 2 },
});
type _DepthTwo = Assert<
  Equal<
    NonNullable<
      Awaited<typeof depthTwo>['contents'][number]['category']
    >['parent']['name'],
    string
  >
>;

const selectedString = shaped.getList({
  endpoint: 'articles',
  queries: { depth: 2, fields: 'title,category.name' },
});
type SelectedString = Awaited<typeof selectedString>['contents'][number];
type _SelectedKeys = Assert<Equal<keyof SelectedString, 'title' | 'category'>>;
type _SelectedTitle = Assert<
  Equal<SelectedString['title'], string | null | undefined>
>;
type _SelectedCategoryName = Assert<
  Equal<NonNullable<SelectedString['category']>['name'], string>
>;
type _SelectedCategoryKeys = Assert<
  Equal<keyof NonNullable<SelectedString['category']>, 'name'>
>;
type _ContentForQueries = Assert<
  Equal<
    InferMicroCMSContent<
      ShapeSchema,
      'articles',
      { depth: 2; fields: 'title,category.name' }
    >,
    SelectedString
  >
>;
const cardQueries = {
  depth: 2,
  fields: ['title', 'category.name'],
} as const;
type CardContent = InferMicroCMSContent<
  ShapeSchema,
  'articles',
  typeof cardQueries
>;
type _CardContentKeys = Assert<Equal<keyof CardContent, 'title' | 'category'>>;
type _CardCategoryKeys = Assert<
  Equal<keyof NonNullable<CardContent['category']>, 'name'>
>;
type _ContentForDefault = Assert<
  Equal<InferMicroCMSContent<ShapeSchema, 'articles'>, ArticleAt<1>>
>;
type _ContentForDepthZero = Assert<
  Equal<
    InferMicroCMSContent<ShapeSchema, 'articles', { depth: 0 }>,
    ArticleAt<0>
  >
>;
type _ContentForOptionalFields = Assert<
  Equal<
    InferMicroCMSContent<ShapeSchema, 'articles', { fields?: 'title' }>,
    unknown
  >
>;
type _ContentForObjectEditor = Assert<
  Equal<
    InferMicroCMSContent<
      ShapeSchema,
      'articles',
      { richEditorFormat: 'object' }
    >,
    unknown
  >
>;

const selectedSiblings = shaped.getList({
  endpoint: 'articles',
  queries: { fields: 'category.id,category.name' },
});
type SelectedSiblings = Awaited<typeof selectedSiblings>['contents'][number];
type _SelectedSiblingsKeys = Assert<
  Equal<keyof NonNullable<SelectedSiblings['category']>, 'id' | 'name'>
>;

const selectedArray = shaped.getList({
  endpoint: 'articles',
  queries: { fields: ['id', 'related.name'] },
});
type SelectedArray = Awaited<typeof selectedArray>['contents'][number];
type _SelectedArrayKeys = Assert<Equal<keyof SelectedArray, 'id' | 'related'>>;
type _SelectedRelatedKeys = Assert<
  Equal<keyof SelectedArray['related'][number], 'name'>
>;

const selectedDetail = shaped.getListDetail({
  endpoint: 'articles',
  contentId: 'id',
  queries: { fields: 'title' },
});
type _SelectedDetailKeys = Assert<
  Equal<keyof Awaited<typeof selectedDetail>, 'title'>
>;
const selectedObject = shaped.getObject({
  endpoint: 'settings',
  queries: { fields: 'siteName' },
});
type _SelectedObjectKeys = Assert<
  Equal<keyof Awaited<typeof selectedObject>, 'siteName'>
>;
type _ObjectContentFor = Assert<
  Equal<
    InferMicroCMSContent<ShapeSchema, 'settings', { fields: 'siteName' }>,
    Awaited<typeof selectedObject>
  >
>;
const selectedAll = shaped.getAllContents({
  endpoint: 'articles',
  queries: { fields: 'title' },
});
type _SelectedAllKeys = Assert<
  Equal<keyof Awaited<typeof selectedAll>[number], 'title'>
>;

declare let dynamicFields: string;
const dynamicResult = shaped.getList({
  endpoint: 'articles',
  queries: { fields: dynamicFields },
});
type _DynamicResult = Assert<
  Equal<Awaited<typeof dynamicResult>['contents'][number], unknown>
>;
declare let unionField: 'title' | 'id';
const unionResult = shaped.getList({
  endpoint: 'articles',
  queries: { fields: unionField },
});
type _UnionResult = Assert<
  Equal<Awaited<typeof unionResult>['contents'][number], unknown>
>;
const unionArrayResult = shaped.getList({
  endpoint: 'articles',
  queries: { fields: [unionField, 'category.name'] },
});
type _UnionArrayResult = Assert<
  Equal<Awaited<typeof unionArrayResult>['contents'][number], unknown>
>;

shaped.getList({
  endpoint: 'articles',
  // @ts-expect-error category.name is unavailable at depth 0
  queries: { depth: 0, fields: 'category.name' },
});

type _SelectedCategoryNullable = Assert<
  Equal<SelectedString['category'], { name: string } | null | undefined>
>;
// @ts-expect-error unknown field path is rejected at the call site
shaped.getList({ endpoint: 'articles', queries: { fields: 'doesNotExist' } });
// @ts-expect-error comma-separated fields reject one invalid path
shaped.getList({ endpoint: 'articles', queries: { fields: 'title,missing' } });
// @ts-expect-error array fields reject one invalid path
shaped.getList({
  endpoint: 'articles',
  queries: { fields: ['title', 'missing'] },
});
shaped.getListDetail({
  endpoint: 'articles',
  contentId: 'id',
  // @ts-expect-error detail reads reject invalid fields too
  queries: { fields: 'missing' },
});
// @ts-expect-error object reads reject invalid fields too
shaped.getObject({ endpoint: 'settings', queries: { fields: 'missing' } });
// @ts-expect-error getAllContents rejects invalid fields too
shaped.getAllContents({ endpoint: 'articles', queries: { fields: 'missing' } });
declare let maybeInvalidField: 'title' | 'missing';
shaped.getList({
  endpoint: 'articles',
  // @ts-expect-error a union with an invalid option is rejected
  queries: { fields: maybeInvalidField },
});
type CrossSchema = ShapeSchema & {
  other: { kind: 'list'; content: { missing: string }; fieldPaths: 'missing' };
};
const cross = createClient<CrossSchema>(options);
// @ts-expect-error a field from another endpoint is invalid for articles
cross.getList({ endpoint: 'articles', queries: { fields: 'missing' } });

// Generated write shapes apply to create and update without method type arguments.
type WriteSchema = {
  blogs: {
    kind: 'list';
    content: Blog;
    create: { title?: string; category?: string; coverImage?: string };
    update: {
      title?: string;
      category?: string | Record<string, never>;
      views?: number | null;
    };
  };
  settings: {
    kind: 'object';
    content: Setting;
    update: { headline?: string };
  };
};
const writable = createClient<WriteSchema>(options);
writable.create({
  endpoint: 'blogs',
  content: { title: 'Hello', category: 'category-id' },
});
writable.create({
  endpoint: 'blogs',
  contentId: 'custom-id',
  content: { coverImage: 'https://example.com/image.png' },
});
writable.update({
  endpoint: 'blogs',
  contentId: 'id',
  content: { category: {} },
});
writable.update({
  endpoint: 'blogs',
  contentId: 'id',
  content: { views: null },
});
writable.update({ endpoint: 'settings', content: { headline: 'Site' } });
// @ts-expect-error list updates require a content ID
writable.update({ endpoint: 'blogs', content: { title: 'Missing ID' } });
// @ts-expect-error object updates do not accept a content ID
writable.update({
  endpoint: 'settings',
  contentId: 'id',
  content: { headline: 'Site' },
});
writable.delete({ endpoint: 'blogs', contentId: 'id' });
// @ts-expect-error deleting list contents requires a content ID
writable.delete({ endpoint: 'blogs' });
// @ts-expect-error updating unknown endpoints is rejected
writable.update({ endpoint: 'missing', contentId: 'id', content: {} });
// @ts-expect-error object APIs cannot be deleted
writable.delete({ endpoint: 'settings', contentId: 'id' });
// @ts-expect-error unknown endpoints cannot be deleted
writable.delete({ endpoint: 'missing', contentId: 'id' });
// @ts-expect-error object APIs cannot be created
writable.create({ endpoint: 'settings', content: { headline: 'Site' } });
// @ts-expect-error unknown endpoints are rejected for writes
writable.create({ endpoint: 'missing', content: { title: 'Hello' } });
// @ts-expect-error write shape rejects unknown fields
writable.create({ endpoint: 'blogs', content: { typo: 'Hello' } });
const rejectedWrite0 = {
  endpoint: 'blogs',
  content: { category: { id: 'category-id' } },
} as const;
// @ts-expect-error write shape rejects incorrect field values
writable.create(rejectedWrite0);
const rejectedWrite1 = {
  endpoint: 'blogs',
  contentId: 'id',
  content: { typo: 'Hello' },
} as const;
// @ts-expect-error update shape rejects unknown fields
writable.update(rejectedWrite1);
const rejectedWrite2 = {
  endpoint: 'blogs',
  contentId: 'id',
  content: { views: '1' },
} as const;
// @ts-expect-error update shape rejects incorrect field values
writable.update(rejectedWrite2);
// @ts-expect-error object update uses its own endpoint shape
writable.update({ endpoint: 'settings', content: { title: 'Wrong endpoint' } });

// Explicit method generics remain available on typed and legacy clients.
writable.create<{ title: string }>({
  endpoint: 'blogs',
  content: { title: 'Hello' },
});
// @ts-expect-error explicit create generics do not bypass endpoint kinds
writable.create<{ headline: string }>({ endpoint: 'settings', content: {} });
// @ts-expect-error explicit create generics do not bypass unknown endpoints
writable.create<{ title: string }>({ endpoint: 'missing', content: {} });
const unknownUpdateEndpoint = {
  endpoint: 'missing',
  contentId: 'id',
  content: {},
} as const;
// @ts-expect-error explicit update generics do not bypass unknown endpoints
writable.update<{ title: string }>(unknownUpdateEndpoint);
writable.update<{ title: string }>({
  endpoint: 'blogs',
  contentId: 'id',
  content: { title: 'Hello' },
});
writable.update<{ headline: string }>({
  endpoint: 'settings',
  content: { headline: 'Site' },
});
const rejectedWrite3 = {
  endpoint: 'blogs',
  content: { title: 'Missing ID' },
} as const;
// @ts-expect-error explicit generics also require IDs for list updates
writable.update<{ title: string }>(rejectedWrite3);
const rejectedWrite4 = {
  endpoint: 'settings',
  contentId: 'id',
  content: { headline: 'Site' },
} as const;
// @ts-expect-error explicit generics also reject IDs for object updates
writable.update<{ headline: string }>(rejectedWrite4);
legacy.create<{ title: string }>({
  endpoint: 'other',
  content: { title: 'Hello' },
});
legacy.update<{ title: string }>({
  endpoint: 'other',
  content: { title: 'Hello' },
});
legacy.delete({ endpoint: 'other', contentId: 'id' });
typed.create({ endpoint: 'blog', content: { arbitrary: true } });
typed.update({ endpoint: 'setting', content: { arbitrary: true } });

// Optional depth can be omitted at runtime, so include the default depth 1.
declare const optionalDepth: { depth?: 2 };
const optionalDepthList = shaped.getList({
  endpoint: 'articles',
  queries: optionalDepth,
});
const optionalDepthDetail = shaped.getListDetail({
  endpoint: 'articles',
  contentId: 'id',
  queries: optionalDepth,
});
const optionalDepthAll = shaped.getAllContents({
  endpoint: 'articles',
  queries: optionalDepth,
});
type _OptionalDepthList = Assert<
  Equal<
    NonNullable<
      Awaited<typeof optionalDepthList>['contents'][number]['category']
    >,
    CategoryAt<1> | CategoryAt<2>
  >
>;
type _OptionalDepthDetail = Assert<
  Equal<
    NonNullable<Awaited<typeof optionalDepthDetail>['category']>,
    CategoryAt<1> | CategoryAt<2>
  >
>;
type _OptionalDepthAll = Assert<
  Equal<
    NonNullable<Awaited<typeof optionalDepthAll>[number]['category']>,
    CategoryAt<1> | CategoryAt<2>
  >
>;
type _OptionalDepthExtraction = Assert<
  Equal<
    InferMicroCMSContent<ShapeSchema, 'articles', typeof optionalDepth>,
    Awaited<typeof optionalDepthDetail>
  >
>;
// @ts-expect-error parent is not guaranteed when depth is omitted
optionalDepthDetail.then((content) => content.category?.parent.name);

declare const optionalRequest: { endpoint: 'articles'; queries?: { depth: 2 } };
const optionalRequestResult = shaped.getList(optionalRequest);
type _OptionalRequest = Assert<
  Equal<
    NonNullable<
      Awaited<typeof optionalRequestResult>['contents'][number]['category']
    >,
    CategoryAt<1> | CategoryAt<2>
  >
>;

declare const optionalFields: { fields?: 'title' };
const optionalFieldsList = shaped.getList({
  endpoint: 'articles',
  queries: optionalFields,
});
const optionalFieldsDetail = shaped.getListDetail({
  endpoint: 'articles',
  contentId: 'id',
  queries: optionalFields,
});
const optionalFieldsAll = shaped.getAllContents({
  endpoint: 'articles',
  queries: optionalFields,
});
const optionalFieldsObject = shaped.getObject({
  endpoint: 'settings',
  queries: {} as { fields?: 'siteName' },
});
type _OptionalFieldsList = Assert<
  Equal<Awaited<typeof optionalFieldsList>['contents'][number], unknown>
>;
type _OptionalFieldsDetail = Assert<
  Equal<Awaited<typeof optionalFieldsDetail>, unknown>
>;
type _OptionalFieldsAll = Assert<
  Equal<Awaited<typeof optionalFieldsAll>[number], unknown>
>;
type _OptionalFieldsObject = Assert<
  Equal<Awaited<typeof optionalFieldsObject>, unknown>
>;

declare const broadQueries: import('microcms-js-sdk').MicroCMSQueries;
const broadList = shaped.getList({
  endpoint: 'articles',
  queries: broadQueries,
});
const broadDetail = shaped.getListDetail({
  endpoint: 'articles',
  contentId: 'id',
  queries: broadQueries,
});
const broadObject = shaped.getObject({
  endpoint: 'settings',
  queries: broadQueries,
});
declare const broadAllQueries: Omit<
  import('microcms-js-sdk').MicroCMSQueries,
  'limit' | 'offset' | 'ids'
>;
const broadAll = shaped.getAllContents({
  endpoint: 'articles',
  queries: broadAllQueries,
});
type _BroadList = Assert<
  Equal<Awaited<typeof broadList>['contents'][number], unknown>
>;
type _BroadDetail = Assert<Equal<Awaited<typeof broadDetail>, unknown>>;
type _BroadObject = Assert<Equal<Awaited<typeof broadObject>, unknown>>;
type _BroadAll = Assert<Equal<Awaited<typeof broadAll>[number], unknown>>;

// A valid optional depth still must not allow fields unavailable at default depth.
declare const optionalDeepSelection: {
  depth?: 2;
  fields: 'category.parent.name';
};
// @ts-expect-error depth 1 cannot expose category.parent.name
shaped.getList({ endpoint: 'articles', queries: optionalDeepSelection });
shaped.getListDetail({
  endpoint: 'articles',
  contentId: 'id',
  // @ts-expect-error detail uses the same default-depth field validation
  queries: optionalDeepSelection,
});
// @ts-expect-error getAllContents uses the same default-depth field validation
shaped.getAllContents({ endpoint: 'articles', queries: optionalDeepSelection });
declare const invalidOptionalFields: { fields?: 'missing' };
// @ts-expect-error optional fields do not bypass schema validation
shaped.getList({ endpoint: 'articles', queries: invalidOptionalFields });
// @ts-expect-error broad query types cannot bypass endpoint kinds
shaped.getList({ endpoint: 'settings', queries: broadQueries });
// @ts-expect-error getAllContents does not accept pagination parameters
shaped.getAllContents({ endpoint: 'articles', queries: broadQueries });
shaped.getList({
  endpoint: 'articles',
  // @ts-expect-error variable queries do not accept misspelled query keys
  queries: {} as { depth?: 2; limti?: number },
});

// Optional depth applies equally to an object endpoint with references.
type ReferencedObjectSchema = {
  profile: Omit<ShapeSchema['articles'], 'kind'> & { kind: 'object' };
};
const referencedObject = createClient<ReferencedObjectSchema>(
  options,
).getObject({ endpoint: 'profile', queries: optionalDepth });
type _OptionalObjectDepth = Assert<
  Equal<
    NonNullable<Awaited<typeof referencedObject>['category']>,
    CategoryAt<1> | CategoryAt<2>
  >
>;

// Multiple selected fields share a single array element type, including callbacks.
const selectedRelated = shaped.getList({
  endpoint: 'articles',
  queries: { fields: ['related.id', 'related.name'] },
});
type _SelectedRelatedShape = Assert<
  Equal<
    Awaited<typeof selectedRelated>['contents'][number],
    {
      related: { id: string; name: string }[];
    }
  >
>;
selectedRelated.then((response) => {
  const related = response.contents[0].related;
  related.map((item) => [item.id, item.name]);
  related.filter((item) => item.id && item.name);
  related.forEach((item) => {
    const name: string = item.name;
    // @ts-expect-error unselected properties remain unavailable in callbacks
    item.parent;
    void name;
  });
});
const selectedRelatedDetail = shaped.getListDetail({
  endpoint: 'articles',
  contentId: 'id',
  queries: { fields: 'related.name,related.id' },
});
const selectedRelatedAll = shaped.getAllContents({
  endpoint: 'articles',
  queries: { fields: ['related.name', 'related.id'] },
});
selectedRelatedDetail.then((content) =>
  content.related.map((item) => item.id + item.name),
);
selectedRelatedAll.then((contents) =>
  contents[0].related.map((item) => item.id + item.name),
);
type SelectedRelatedContent = InferMicroCMSContent<
  ShapeSchema,
  'articles',
  { fields: readonly ['related.id', 'related.name'] }
>;
declare const selectedRelatedContent: SelectedRelatedContent;
selectedRelatedContent.related.map((item) => item.id + item.name);
type _RelatedExtraction = Assert<
  Equal<SelectedRelatedContent, Awaited<typeof selectedRelatedDetail>>
>;
const selectedNestedRelated = shaped.getList({
  endpoint: 'articles',
  queries: { depth: 2, fields: ['related.id', 'related.parent.name'] },
});
type _NestedRelatedShape = Assert<
  Equal<
    Awaited<typeof selectedNestedRelated>['contents'][number]['related'],
    {
      id: string;
      parent: { name: string };
    }[]
  >
>;
const selectedWholeRelated = shaped.getList({
  endpoint: 'articles',
  queries: { fields: ['related', 'related.name'] },
});
type _WholeRelatedShape = Assert<
  Equal<
    Awaited<typeof selectedWholeRelated>['contents'][number]['related'],
    CategoryAt<1>[]
  >
>;

// Explicit any is a legacy content type, not a schema endpoint type argument.
const explicitAnyList = typed.getList<any>({ endpoint: 'blog' });
const explicitAnyDetail = typed.getListDetail<any>({
  endpoint: 'blog',
  contentId: 'id',
});
const explicitAnyObject = typed.getObject<any>({ endpoint: 'setting' });
const explicitAnyAll = typed.getAllContents<any>({ endpoint: 'blog' });
type _ExplicitAnyList = Assert<
  Equal<Awaited<typeof explicitAnyList>['contents'][number], any>
>;
type _ExplicitAnyDetail = Assert<Equal<Awaited<typeof explicitAnyDetail>, any>>;
type _ExplicitAnyObject = Assert<Equal<Awaited<typeof explicitAnyObject>, any>>;
type _ExplicitAnyAll = Assert<
  Equal<Awaited<typeof explicitAnyAll>[number], any>
>;
explicitAnyList.then((response) => response.contents[0].arbitrary);
explicitAnyDetail.then((content) => content.arbitrary);
explicitAnyObject.then((content) => content.arbitrary);
explicitAnyAll.then((contents) => contents[0].arbitrary);
// @ts-expect-error explicit any does not bypass known list endpoints
typed.getList<any>({ endpoint: 'missing' });
// @ts-expect-error explicit any does not bypass list endpoint kinds
typed.getList<any>({ endpoint: 'setting' });
// @ts-expect-error explicit any does not bypass known detail endpoints
typed.getListDetail<any>({ endpoint: 'missing', contentId: 'id' });
// @ts-expect-error explicit any does not bypass detail endpoint kinds
typed.getListDetail<any>({ endpoint: 'setting', contentId: 'id' });
// @ts-expect-error explicit any still requires a detail content ID
typed.getListDetail<any>({ endpoint: 'blog' });
// @ts-expect-error explicit any does not bypass known object endpoints
typed.getObject<any>({ endpoint: 'missing' });
// @ts-expect-error explicit any does not bypass object endpoint kinds
typed.getObject<any>({ endpoint: 'blog' });
// @ts-expect-error explicit any does not bypass known all-content endpoints
typed.getAllContents<any>({ endpoint: 'missing' });
// @ts-expect-error explicit any does not bypass all-content endpoint kinds
typed.getAllContents<any>({ endpoint: 'setting' });
writable.create<any>({ endpoint: 'blogs', content: { arbitrary: true } });
writable.update<any>({
  endpoint: 'blogs',
  contentId: 'id',
  content: { arbitrary: true },
});
writable.update<any>({ endpoint: 'settings', content: { arbitrary: true } });
// @ts-expect-error explicit any does not bypass create endpoints
writable.create<any>({ endpoint: 'missing', content: {} });
// @ts-expect-error explicit any does not bypass create endpoint kinds
writable.create<any>({ endpoint: 'settings', content: {} });
// @ts-expect-error explicit any does not bypass update endpoints
writable.update<any>({ endpoint: 'missing', contentId: 'id', content: {} });
// @ts-expect-error explicit any still requires a list content ID
writable.update<any>({ endpoint: 'blogs', content: {} });
// @ts-expect-error explicit any still rejects an object content ID
writable.update<any>({ endpoint: 'settings', contentId: 'id', content: {} });

// An omitted depth in one union branch uses depth 1, without losing other branches.
// eslint-disable-next-line @typescript-eslint/ban-types -- Match the empty branch inferred for conditional queries.
type OmittedQueries = {};
declare const omittedDepthUnion: { depth: 0 } | OmittedQueries;
const depthUnionList = shaped.getList({
  endpoint: 'articles',
  queries: omittedDepthUnion,
});
const depthUnionDetail = shaped.getListDetail({
  endpoint: 'articles',
  contentId: 'id',
  queries: omittedDepthUnion,
});
const depthUnionAll = shaped.getAllContents({
  endpoint: 'articles',
  queries: omittedDepthUnion,
});
const depthUnionObject = createClient<ReferencedObjectSchema>(
  options,
).getObject({ endpoint: 'profile', queries: omittedDepthUnion });
type _DepthUnionList = Assert<
  Equal<
    Awaited<typeof depthUnionList>['contents'][number],
    ArticleAt<0> | ArticleAt<1>
  >
>;
type _DepthUnionDetail = Assert<
  Equal<Awaited<typeof depthUnionDetail>, ArticleAt<0> | ArticleAt<1>>
>;
type _DepthUnionAll = Assert<
  Equal<Awaited<typeof depthUnionAll>[number], ArticleAt<0> | ArticleAt<1>>
>;
type _DepthUnionObject = Assert<
  Equal<Awaited<typeof depthUnionObject>, ArticleAt<0> | ArticleAt<1>>
>;
type _DepthUnionExtraction = Assert<
  Equal<
    InferMicroCMSContent<ShapeSchema, 'articles', typeof omittedDepthUnion>,
    Awaited<typeof depthUnionDetail>
  >
>;
// @ts-expect-error name is not guaranteed when the depth 0 branch is used
depthUnionDetail.then((content) => content.category?.name);
declare const omittedFieldsUnion: { fields: 'title' } | OmittedQueries;
const fieldsUnionList = shaped.getList({
  endpoint: 'articles',
  queries: omittedFieldsUnion,
});
type _FieldsUnionList = Assert<
  Equal<
    Awaited<typeof fieldsUnionList>['contents'][number],
    Pick<ArticleAt<1>, 'title'> | ArticleAt<1>
  >
>;
declare const invalidUnionFields: { fields: 'missing' } | OmittedQueries;
// @ts-expect-error every union branch must have valid fields
shaped.getList({ endpoint: 'articles', queries: invalidUnionFields });
declare const invalidUnionDepth:
  { depth: 0; fields: 'category.name' } | OmittedQueries;
// @ts-expect-error each branch validates fields against its own depth
shaped.getList({ endpoint: 'articles', queries: invalidUnionDepth });
declare const invalidUnionKeys: { depth: 0; limti: number } | OmittedQueries;
// @ts-expect-error unknown query keys cannot hide in a union branch
shaped.getList({ endpoint: 'articles', queries: invalidUnionKeys });
declare const invalidUnionRichEditor:
  { richEditorFormat: 'object' } | OmittedQueries;
// @ts-expect-error an unsupported rich editor branch requires explicit content types
shaped.getList({ endpoint: 'articles', queries: invalidUnionRichEditor });

// Whole request unions preserve omitted queries and endpoint correlations.
declare const wholeListRequest:
  { endpoint: 'articles'; queries: { depth: 2 } } | { endpoint: 'articles' };
declare const wholeDetailRequest:
  | { endpoint: 'articles'; contentId: string; queries: { depth: 2 } }
  | { endpoint: 'articles'; contentId: string };
declare const wholeObjectRequest:
  { endpoint: 'profile'; queries: { depth: 2 } } | { endpoint: 'profile' };
const wholeList = shaped.getList(wholeListRequest);
const wholeDetail = shaped.getListDetail(wholeDetailRequest);
const wholeAll = shaped.getAllContents(wholeListRequest);
const wholeObject =
  createClient<ReferencedObjectSchema>(options).getObject(wholeObjectRequest);
type _WholeList = Assert<
  Equal<
    Awaited<typeof wholeList>['contents'][number],
    ArticleAt<1> | ArticleAt<2>
  >
>;
type _WholeDetail = Assert<
  Equal<Awaited<typeof wholeDetail>, ArticleAt<1> | ArticleAt<2>>
>;
type _WholeAll = Assert<
  Equal<Awaited<typeof wholeAll>[number], ArticleAt<1> | ArticleAt<2>>
>;
type _WholeObject = Assert<
  Equal<Awaited<typeof wholeObject>, ArticleAt<1> | ArticleAt<2>>
>;
// @ts-expect-error depth 1 does not guarantee a parent
wholeDetail.then((content) => content.category?.parent.name);
declare const wholeFieldsRequest:
  | { endpoint: 'articles'; queries: { fields: 'title' } }
  | { endpoint: 'articles' };
const wholeFields = shaped.getList(wholeFieldsRequest);
type _WholeFields = Assert<
  Equal<
    Awaited<typeof wholeFields>['contents'][number],
    Pick<ArticleAt<1>, 'title'> | ArticleAt<1>
  >
>;
declare const invalidWholeRequest:
  | { endpoint: 'articles'; queries: { depth: 0; fields: 'category.name' } }
  | { endpoint: 'articles' };
// @ts-expect-error an invalid request branch cannot hide behind omitted queries
shaped.getList(invalidWholeRequest);

type CorrelatedReadSchema = ShapeSchema & {
  other: {
    kind: 'list';
    content: { id: string; missing: string };
    fieldPaths: 'id' | 'missing';
  };
};
const correlatedReader = createClient<CorrelatedReadSchema>(options);
declare const readEndpoint: 'articles' | 'other';
correlatedReader.getList({
  endpoint: readEndpoint,
  // @ts-expect-error title is unavailable on the other endpoint
  queries: { fields: 'title' },
});
// @ts-expect-error arrays must validate paths for every possible endpoint too
correlatedReader.getList({
  endpoint: readEndpoint,
  queries: { fields: ['title'] },
});
const sharedRead = correlatedReader.getList({
  endpoint: readEndpoint,
  queries: { fields: ['id'] },
});
sharedRead.then((response) => {
  const id: string = response.contents[0].id;
  void id;
});
declare const correlatedReadRequest:
  | { endpoint: 'articles'; queries: { fields: 'title' } }
  | { endpoint: 'other'; queries: { fields: 'missing' } };
const correlatedRead = correlatedReader.getList(correlatedReadRequest);
type _CorrelatedRead = Assert<
  Equal<
    Awaited<typeof correlatedRead>['contents'][number],
    { title?: string | null } | { missing: string }
  >
>;
declare const invalidCorrelatedReadRequest:
  | { endpoint: 'articles'; queries: { fields: 'missing' } }
  | { endpoint: 'other'; queries: { fields: 'missing' } };
// @ts-expect-error validate each branch against its own endpoint
correlatedReader.getList(invalidCorrelatedReadRequest);

type EndpointWriteSchema = {
  blogs: WriteSchema['blogs'] & {
    create: WriteSchema['blogs']['create'] & { publishedAt?: string };
    update: WriteSchema['blogs']['update'] & { publishedAt?: string };
  };
  categories: {
    kind: 'list';
    content: { name: string };
    create: { name?: string; publishedAt?: string };
    update: { name?: string; publishedAt?: string };
  };
  settings: WriteSchema['settings'];
};
const endpointWriter = createClient<EndpointWriteSchema>(options);
declare const writeEndpoint: 'blogs' | 'categories';
// @ts-expect-error title is not accepted by categories
endpointWriter.create({ endpoint: writeEndpoint, content: { title: 'Blog' } });
// @ts-expect-error category is not accepted by categories
endpointWriter.update({
  endpoint: writeEndpoint,
  contentId: 'id',
  content: { category: 'id' },
});
// @ts-expect-error sharing a metadata field does not make title safe for both endpoints
endpointWriter.create({
  endpoint: writeEndpoint,
  content: { publishedAt: 'date', title: 'Blog' },
});
endpointWriter.create({
  endpoint: writeEndpoint,
  content: { publishedAt: 'date' },
});
endpointWriter.update({
  endpoint: writeEndpoint,
  contentId: 'id',
  content: { publishedAt: 'date' },
});
if (writeEndpoint === 'blogs') {
  endpointWriter.create({
    endpoint: writeEndpoint,
    content: { title: 'Blog' },
  });
} else {
  endpointWriter.create({
    endpoint: writeEndpoint,
    content: { name: 'Category' },
  });
}
declare const correlatedCreateRequest:
  | { endpoint: 'blogs'; content: { title: string } }
  | { endpoint: 'categories'; content: { name: string } };
declare const correlatedUpdateRequest:
  | { endpoint: 'blogs'; contentId: string; content: { title: string } }
  | { endpoint: 'settings'; content: { headline: string } };
endpointWriter.create(correlatedCreateRequest);
endpointWriter.update(correlatedUpdateRequest);
declare const invalidCorrelatedCreateRequest:
  | { endpoint: 'blogs'; content: { name: string } }
  | { endpoint: 'categories'; content: { name: string } };
// @ts-expect-error a valid category branch cannot hide an invalid blog branch
endpointWriter.create(invalidCorrelatedCreateRequest);
declare const invalidCorrelatedUpdateRequest:
  | { endpoint: 'blogs'; contentId: string; content: { title: string } }
  | { endpoint: 'settings'; contentId: string; content: { headline: string } };
// @ts-expect-error the object branch cannot have a content ID
endpointWriter.update(invalidCorrelatedUpdateRequest);
const contentWithUnknownField = { publishedAt: 'date', typo: 'Unknown' };
// @ts-expect-error variable content also must have fields belonging to its endpoint
endpointWriter.create({
  endpoint: 'categories',
  content: contentWithUnknownField,
});
type VariantWriteSchema = {
  variants: {
    kind: 'list';
    content: object;
    create: { kind: 'text'; text: string } | { kind: 'count'; count: number };
    update: { kind: 'text'; text: string } | { kind: 'count'; count: number };
  };
};
const variantWriter = createClient<VariantWriteSchema>(options);
variantWriter.create({
  endpoint: 'variants',
  content: { kind: 'text', text: 'Hello' },
});
variantWriter.create({
  endpoint: 'variants',
  content: { kind: 'count', count: 1 },
});
const rejectedWrite5 = {
  endpoint: 'variants',
  content: { kind: 'text', count: 1 },
} as const;
// @ts-expect-error keys from different write variants cannot be mixed
variantWriter.create(rejectedWrite5);

// An explicit content type wins even when it structurally matches a request.
type RequestShapedListContent = { endpoint: 'blog'; queries?: { depth: 0 } };
type RequestShapedObjectContent = {
  endpoint: 'setting';
  queries?: { depth: 0 };
};
const explicitRequestList = typed.getList<RequestShapedListContent>({
  endpoint: 'blog',
});
const explicitRequestDetail = typed.getListDetail<RequestShapedListContent>({
  endpoint: 'blog',
  contentId: 'id',
});
const explicitRequestAll = typed.getAllContents<RequestShapedListContent>({
  endpoint: 'blog',
});
const explicitRequestObject = typed.getObject<RequestShapedObjectContent>({
  endpoint: 'setting',
});
type _ExplicitRequestList = Assert<
  Equal<
    Awaited<typeof explicitRequestList>['contents'][number],
    RequestShapedListContent & import('microcms-js-sdk').MicroCMSListContent
  >
>;
type _ExplicitRequestDetail = Assert<
  Equal<
    Awaited<typeof explicitRequestDetail>,
    RequestShapedListContent & import('microcms-js-sdk').MicroCMSListContent
  >
>;
type _ExplicitRequestAll = Assert<
  Equal<
    Awaited<typeof explicitRequestAll>[number],
    RequestShapedListContent & import('microcms-js-sdk').MicroCMSListContent
  >
>;
type _ExplicitRequestObject = Assert<
  Equal<
    Awaited<typeof explicitRequestObject>,
    RequestShapedObjectContent & import('microcms-js-sdk').MicroCMSObjectContent
  >
>;
explicitRequestList.then((response) => response.contents[0].endpoint);
explicitRequestDetail.then((content) => content.endpoint);
explicitRequestAll.then((contents) => contents[0].endpoint);
explicitRequestObject.then((content) => content.endpoint);
type RequestShapedWriteContent = {
  endpoint: 'blogs';
  content: { title: string };
};
writable.create<RequestShapedWriteContent>({
  endpoint: 'blogs',
  content: { endpoint: 'blogs', content: { title: 'Explicit' } },
});
writable.update<RequestShapedWriteContent>({
  endpoint: 'blogs',
  contentId: 'id',
  content: { endpoint: 'blogs', content: { title: 'Explicit' } },
});

// Variable-length fields cannot guarantee their optional rest selections.
const variadicFields: readonly ['title', ...'id'[]] = ['title'];
const variadicList = shaped.getList({
  endpoint: 'articles',
  queries: { fields: variadicFields },
});
const variadicDetail = shaped.getListDetail({
  endpoint: 'articles',
  contentId: 'id',
  queries: { fields: variadicFields },
});
const variadicAll = shaped.getAllContents({
  endpoint: 'articles',
  queries: { fields: variadicFields },
});
const variadicObjectFields: readonly ['siteName', ...'createdAt'[]] = [
  'siteName',
];
const variadicObject = shaped.getObject({
  endpoint: 'settings',
  queries: { fields: variadicObjectFields },
});
type _VariadicList = Assert<
  Equal<Awaited<typeof variadicList>['contents'][number], unknown>
>;
type _VariadicDetail = Assert<Equal<Awaited<typeof variadicDetail>, unknown>>;
type _VariadicAll = Assert<Equal<Awaited<typeof variadicAll>[number], unknown>>;
type _VariadicObject = Assert<Equal<Awaited<typeof variadicObject>, unknown>>;
type _VariadicExtracted = Assert<
  Equal<
    InferMicroCMSContent<
      ShapeSchema,
      'articles',
      { fields: typeof variadicFields }
    >,
    unknown
  >
>;
// @ts-expect-error an omitted rest field is not guaranteed in the response
variadicList.then((response) => response.contents[0].id);
const fixedFields = ['title', 'id'] as const;
const fixedSelection = shaped.getList({
  endpoint: 'articles',
  queries: { fields: fixedFields },
});
type _FixedSelection = Assert<
  Equal<
    Awaited<typeof fixedSelection>['contents'][number],
    Pick<ArticleAt<1>, 'title' | 'id'>
  >
>;
declare const invalidVariadicFields: readonly ['title', ...'missing'[]];
// @ts-expect-error known invalid rest fields must still be rejected
shaped.getList({
  endpoint: 'articles',
  queries: { fields: invalidVariadicFields },
});

// All-content queries reject excluded keys through every inference overload.
const allLimitQueries = { depth: 1, limit: 1 } as const;
const allOffsetQueries = { fields: 'title', offset: 10 } as const;
const allIdsQueries = { fields: ['id'], ids: ['id'] } as const;
// @ts-expect-error getAllContents manages limit itself
shaped.getAllContents({ endpoint: 'articles', queries: allLimitQueries });
// @ts-expect-error getAllContents manages offset itself
shaped.getAllContents({ endpoint: 'articles', queries: allOffsetQueries });
// @ts-expect-error getAllContents does not accept ids
shaped.getAllContents({ endpoint: 'articles', queries: allIdsQueries });
const excludedArrayQueries = { depth: 1, fields: ['id'], limit: 1 } as const;
// @ts-expect-error array selections cannot bypass excluded query keys
shaped.getAllContents({ endpoint: 'articles', queries: excludedArrayQueries });
const excludedStringQueries = { depth: 1, fields: 'id', ids: 'id' } as const;
// @ts-expect-error string selections cannot bypass excluded query keys
shaped.getAllContents({ endpoint: 'articles', queries: excludedStringQueries });
declare const excludedOptionalQueries: { depth?: 2; limit: number };
shaped.getAllContents({
  endpoint: 'articles',
  // @ts-expect-error optional queries cannot bypass excluded keys
  queries: excludedOptionalQueries,
});
declare const excludedUnionRequest:
  | { endpoint: 'articles'; queries: { depth: 1; offset: number } }
  | { endpoint: 'articles' };
// @ts-expect-error whole request unions cannot bypass excluded keys
shaped.getAllContents(excludedUnionRequest);
shaped.getAllContents<ArticleAt<1>>({
  endpoint: 'articles',
  // @ts-expect-error explicit content types still respect supported query keys
  queries: allLimitQueries,
});
const supportedAllQueries = {
  depth: 1,
  fields: ['id'],
  filters: 'title[contains]example',
  orders: '-createdAt',
  q: 'example',
} as const;
const supportedAll = shaped.getAllContents({
  endpoint: 'articles',
  queries: supportedAllQueries,
});
type _SupportedAll = Assert<
  Equal<Awaited<typeof supportedAll>[number], { id: string }>
>;

// Shared const queries can include readonly IDs as well as readonly fields.
const readonlyIdQueries = {
  depth: 1,
  fields: ['id', 'title'],
  ids: ['first', 'second'],
} as const;
const readonlyIdList = shaped.getList({
  endpoint: 'articles',
  queries: readonlyIdQueries,
});
type _ReadonlyIdSelection = Assert<
  Equal<
    Awaited<typeof readonlyIdList>['contents'][number],
    Pick<ArticleAt<1>, 'title' | 'id'>
  >
>;
shaped.getList({
  endpoint: 'articles',
  queries: { ids: ['first', 'second'] as const },
});
shaped.getList({
  endpoint: 'articles',
  queries: { fields: 'id', ids: ['first', 'second'] as const },
});
shaped.getList({ endpoint: 'articles', queries: { ids: 'first,second' } });
const mutableIds: string[] = ['first'];
shaped.getList({ endpoint: 'articles', queries: { ids: mutableIds } });
shaped.getList<ArticleAt<1>>({
  endpoint: 'articles',
  queries: readonlyIdQueries,
});
shaped.get({ endpoint: 'articles', queries: readonlyIdQueries });
const optionalReadonlyIdQueries: {
  depth?: 1;
  fields: readonly ['id'];
  ids: readonly string[];
} = { fields: ['id'], ids: ['first'] };
const optionalReadonlyIdList = shaped.getList({
  endpoint: 'articles',
  queries: optionalReadonlyIdQueries,
});
type _OptionalReadonlyIdSelection = Assert<
  Equal<
    Awaited<typeof optionalReadonlyIdList>['contents'][number],
    { id: string }
  >
>;
const invalidReadonlyIds = { fields: ['id'], ids: [123] } as const;
// @ts-expect-error readonly IDs still must be strings
shaped.getList({ endpoint: 'articles', queries: invalidReadonlyIds });

// Recursive write validation preserves nested variant boundaries.
type NestedWriteSchema = {
  blocks: {
    kind: 'list';
    content: object;
    create: {
      custom?: { fieldId: 'alpha'; text?: string };
      repeat?: (
        | { fieldId: 'alpha'; text?: string }
        | { fieldId: 'beta'; count?: number }
      )[];
      extension?: {
        title?: string;
        data?: { place: { name: string }; labels: string[] };
      };
      freeData?: Record<string, unknown>;
    };
    update: {
      custom?: { fieldId: 'alpha'; text?: string } | Record<string, never>;
      repeat?: (
        | { fieldId: 'alpha'; text?: string }
        | { fieldId: 'beta'; count?: number }
      )[];
      extension?: {
        title?: string;
        data?: { place: { name: string }; labels: string[] };
      };
      freeData?: Record<string, unknown>;
    };
  };
};
const nestedWriter = createClient<NestedWriteSchema>(options);
nestedWriter.create({
  endpoint: 'blocks',
  content: {
    custom: { fieldId: 'alpha', text: 'ok' },
    repeat: [
      { fieldId: 'alpha', text: 'ok' },
      { fieldId: 'beta', count: 1 },
    ],
    extension: {
      title: 'ok',
      data: { place: { name: 'ok' }, labels: ['one'] },
    },
    freeData: { arbitrary: { fields: [1, true, null] } },
  },
});
nestedWriter.update({
  endpoint: 'blocks',
  contentId: 'id',
  content: { custom: {}, repeat: [] },
});
// @ts-expect-error nested custom fields reject unknown keys
nestedWriter.create({
  endpoint: 'blocks',
  content: { custom: { fieldId: 'alpha', text: 'ok', typo: 'bad' } },
});
// @ts-expect-error nested update fields reject unknown keys
nestedWriter.update({
  endpoint: 'blocks',
  contentId: 'id',
  content: { custom: { fieldId: 'alpha', text: 'ok', typo: 'bad' } },
});
// @ts-expect-error repeat items cannot mix keys from different variants
nestedWriter.create({
  endpoint: 'blocks',
  content: { repeat: [{ fieldId: 'alpha', text: 'ok', count: 1 }] },
});
// @ts-expect-error every item must match its own update variant
nestedWriter.update({
  endpoint: 'blocks',
  contentId: 'id',
  content: {
    repeat: [
      { fieldId: 'beta', count: 1 },
      { fieldId: 'alpha', text: 'ok', count: 1 },
    ],
  },
});
// @ts-expect-error configured extension data validates deeper object keys
nestedWriter.create({
  endpoint: 'blocks',
  content: {
    extension: { data: { place: { name: 'ok', typo: 'bad' }, labels: [] } },
  },
});
const badNestedContent = {
  custom: { fieldId: 'alpha', text: 'ok', typo: 'bad' },
} as const;
// @ts-expect-error variables do not bypass nested checks
nestedWriter.create({ endpoint: 'blocks', content: badNestedContent });
declare const mixedNestedVariants:
  | { fieldId: 'alpha'; text: string }
  | { fieldId: 'alpha'; text: string; count: number };
// @ts-expect-error one valid nested union branch cannot hide an invalid branch
nestedWriter.create({
  endpoint: 'blocks',
  content: { custom: mixedNestedVariants },
});
type RecursiveData = { name: string; children: RecursiveData[] };
type RecursiveWriteSchema = {
  tree: {
    kind: 'list';
    content: object;
    create: { data?: RecursiveData };
    update: { data?: RecursiveData };
  };
};
const recursiveWriter = createClient<RecursiveWriteSchema>(options);
declare const recursiveData: RecursiveData;
recursiveWriter.create({ endpoint: 'tree', content: { data: recursiveData } });
recursiveWriter.create({
  endpoint: 'tree',
  content: {
    data: { name: 'parent', children: [{ name: 'child', children: [] }] },
  },
});
// @ts-expect-error recursive schemas still reject unknown keys in nested literals
recursiveWriter.create({
  endpoint: 'tree',
  content: {
    data: {
      name: 'parent',
      children: [{ name: 'child', children: [], typo: 'bad' }],
    },
  },
});
// Explicit content types can deliberately provide their own nested shape.
nestedWriter.create<{
  custom: { fieldId: string; text: string; extra: string };
}>({
  endpoint: 'blocks',
  content: { custom: { fieldId: 'alpha', text: 'ok', extra: 'explicit' } },
});

// All inferred reads share one validation path, including overlapping query unions.
declare const overlappingQueryKeys: { depth: 1 } | { depth: 1; limti: number };
// @ts-expect-error invalid keys cannot escape through a plain getList overload
shaped.getList({ endpoint: 'articles', queries: overlappingQueryKeys });
shaped.getListDetail({
  endpoint: 'articles',
  contentId: 'id',
  // @ts-expect-error detail reads validate every query branch
  queries: overlappingQueryKeys,
});
// @ts-expect-error object reads validate every query branch
shaped.getObject({ endpoint: 'settings', queries: overlappingQueryKeys });
// @ts-expect-error all-content reads validate every query branch
shaped.getAllContents({ endpoint: 'articles', queries: overlappingQueryKeys });
declare const overlappingFieldsKeys:
  { fields: 'id' } | { fields: 'id'; limti: number };
// @ts-expect-error string fields cannot bypass unknown query keys
shaped.getList({ endpoint: 'articles', queries: overlappingFieldsKeys });
declare const overlappingArrayKeys:
  { fields: readonly ['id'] } | { fields: readonly ['id']; limti: number };
// @ts-expect-error array fields cannot bypass unknown query keys
shaped.getList({ endpoint: 'articles', queries: overlappingArrayKeys });
declare const overlappingRequestKeys:
  | { endpoint: 'articles'; queries: { depth: 1 } }
  | { endpoint: 'articles'; queries: { depth: 1; limti: number } };
// @ts-expect-error whole request unions also validate every query key
shaped.getList(overlappingRequestKeys);
const singleTypoQueries = { depth: 1, limti: 1 } as const;
// @ts-expect-error a variable with statically known incorrect keys is rejected too
shaped.getList({ endpoint: 'articles', queries: singleTypoQueries });
const literalWithInit = shaped.getList({
  endpoint: 'articles',
  queries: { fields: ['id'] },
  customRequestInit: { cache: 'no-store' },
});
type _LiteralWithInit = Assert<
  Equal<Awaited<typeof literalWithInit>['contents'][number], { id: string }>
>;

// Extension tuples retain the allowed keys at each position.
type TupleWriteSchema = {
  tuple: {
    kind: 'list';
    content: object;
    create: { data: [{ name: string }, { name: string; label?: string }] };
  };
};
const tupleWriter = createClient<TupleWriteSchema>(options);
tupleWriter.create({
  endpoint: 'tuple',
  content: { data: [{ name: 'first' }, { name: 'second', label: 'ok' }] },
});
// @ts-expect-error the first tuple element cannot borrow a key from the second
tupleWriter.create({
  endpoint: 'tuple',
  content: { data: [{ name: 'first', label: 'bad' }, { name: 'second' }] },
});
