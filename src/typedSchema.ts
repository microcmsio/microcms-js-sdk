import type {
  CreateRequest,
  DeleteRequest,
  GetAllContentIdsRequest,
  GetAllContentRequest,
  GetListDetailRequest,
  GetListRequest,
  GetObjectRequest,
  GetRequest,
  MicroCMSListContent,
  MicroCMSListResponse,
  MicroCMSObjectContent,
  MicroCMSQueries,
  UpdateRequest,
  WriteApiRequestResult,
} from './types';

type Depth = 0 | 1 | 2 | 3;

/** One endpoint in a generated, type-only service schema. */
export type MicroCMSSchemaEntry = {
  kind: 'list' | 'object';
  content: object;
  depths?: { [Level in Depth]: object };
  fieldPaths?: string;
  create?: object;
  update?: object;
};

type EndpointsOfKind<
  Schema,
  Kind extends MicroCMSSchemaEntry['kind'],
> = Extract<
  {
    [Endpoint in keyof Schema]: Schema[Endpoint] extends {
      kind: Kind;
      content: object;
    }
      ? Endpoint
      : never;
  }[keyof Schema],
  string
>;

// Queries are serialized without mutating arrays, so const tuples are valid inputs.
type AllowReadonlyArrays<Queries> = {
  [Key in keyof Queries]: Queries[Key] extends infer Value
    ? Value extends string[]
      ? readonly string[]
      : Value
    : never;
};

type RequestQueries<Request> = Request extends { queries?: infer Queries }
  ? AllowReadonlyArrays<NonNullable<Queries>>
  : AllowReadonlyArrays<MicroCMSQueries>;

// Reject pagination and ID selection even when queries come from a variable.
type TypedAllContentRequest = Omit<GetAllContentRequest, 'queries'> & {
  queries?: NonNullable<GetAllContentRequest['queries']> & {
    limit?: never;
    offset?: never;
    ids?: never;
  };
};

type BaseQueries<Request> = Omit<
  RequestQueries<Request>,
  'fields' | 'depth' | 'richEditorFormat'
> & { richEditorFormat?: 'html' };

// Keep explicit any on the legacy content overload, rather than inferring an endpoint.
type NonAny<Value> = unknown extends Value ? never : Value;

type RequestBase<Request, Endpoint extends string> = Omit<
  Request,
  'endpoint' | 'queries'
> & { endpoint: NonAny<Endpoint> };

type RequiredDepth<Level> = [Level] extends [undefined]
  ? unknown
  : { depth: Level };

type PlainRequest<
  Request,
  Endpoint extends string,
  Level extends Depth | undefined,
> = RequestBase<Request, Endpoint> & {
  queries?: BaseQueries<Request> & { depth?: Level; fields?: never };
} & ([Level] extends [undefined]
    ? unknown
    : { queries: BaseQueries<Request> & { depth: Level; fields?: never } });

type StringFieldsRequest<
  Request,
  Endpoint extends string,
  Fields extends string,
  Level extends Depth | undefined,
> = RequestBase<Request, Endpoint> & {
  queries: BaseQueries<Request> & {
    fields: Fields;
    depth?: Level;
  } & RequiredDepth<Level>;
};

type ArrayFieldsRequest<
  Request,
  Endpoint extends string,
  Fields extends readonly string[],
  Level extends Depth | undefined,
> = RequestBase<Request, Endpoint> & {
  queries: BaseQueries<Request> & {
    fields: readonly [...Fields];
    depth?: Level;
  } & RequiredDepth<Level>;
};

type AnyFieldsRequest<Request, Endpoint extends string> = RequestBase<
  Request,
  Endpoint
> & {
  queries?: Omit<RequestQueries<Request>, 'fields'> & {
    fields?: string | readonly string[];
  };
};

type ContentAtDepth<Entry, Level extends Depth> = Level extends Depth
  ? Entry extends { depths: infer Contents }
    ? Level extends keyof Contents
      ? Contents[Level]
      : unknown
    : Level extends 1
      ? Entry extends { content: infer Content }
        ? Content
        : unknown
      : unknown
  : unknown;

type AllowedFields<Entry> = Entry extends { fieldPaths: infer Paths }
  ? Extract<Paths, string>
  : never;

type SplitFields<Value extends string> =
  Value extends `${infer Head},${infer Tail}`
    ? Head | SplitFields<Tail>
    : Value;

type IsUnion<Value, Original = Value> = Value extends Original
  ? [Original] extends [Value]
    ? false
    : true
  : never;

type TupleHasUnion<Fields extends readonly string[]> = Fields extends readonly [
  infer Head,
  ...infer Tail,
]
  ? [Head] extends [string]
    ? [Tail] extends [readonly string[]]
      ? IsUnion<Head> extends true
        ? true
        : TupleHasUnion<Tail>
      : false
    : false
  : false;

type StableFields<Fields> =
  IsUnion<Fields> extends true
    ? false
    : Fields extends readonly string[]
      ? number extends Fields['length']
        ? false
        : TupleHasUnion<Fields> extends true
          ? false
          : true
      : true;

type LiteralFields<Fields> = Fields extends string
  ? string extends Fields
    ? never
    : SplitFields<Fields>
  : Fields extends readonly [string, ...string[]]
    ? string extends Fields[number]
      ? never
      : Fields[number]
    : never;

type Unwrap<Value> = Value extends readonly (infer Item)[]
  ? NonNullable<Item>
  : NonNullable<Value>;

type PathExists<Content, Path extends string> = Content extends object
  ? Path extends `${infer Key}.${infer Rest}`
    ? Key extends keyof Content
      ? PathExists<Unwrap<Content[Key]>, Rest>
      : false
    : Path extends keyof Content
      ? true
      : false
  : false;

type AllPathsExist<Content, Paths extends string> = false extends (
  Paths extends string ? PathExists<Content, Paths> : never
)
  ? false
  : true;

type ProjectNested<Value, Path extends string> = Value extends null | undefined
  ? Value
  : Value extends readonly (infer Item)[]
    ? ProjectPaths<Item, Path>[]
    : Value extends object
      ? ProjectPaths<Value, Path>
      : unknown;

type RootPaths<Paths extends string> = Paths extends `${infer Key}.${string}`
  ? Key
  : Paths;

type NestedPaths<
  Paths extends string,
  Key extends PropertyKey,
> = Paths extends `${Key & string}.${infer Rest}` ? Rest : never;

// Group paths by property before projecting array elements, so array methods
// receive one element shape containing every selected child field.
type ProjectPaths<Content, Paths extends string> = Content extends object
  ? {
      [
        Key in keyof Content as Key extends RootPaths<Paths> ? Key : never
      ]: Key extends Paths
        ? Content[Key]
        : ProjectNested<Content[Key], NestedPaths<Paths, Key>>;
    }
  : never;

type KnownFields<Fields> = Fields extends string
  ? string extends Fields
    ? never
    : SplitFields<Fields>
  : Fields extends readonly string[]
    ? string extends Fields[number]
      ? never
      : Fields[number]
    : never;

type FieldsAreValid<
  Entry,
  Level extends Depth | undefined,
  Fields,
> = Entry extends { fieldPaths: string }
  ? [KnownFields<Fields>] extends [never]
    ? true
    : [Exclude<KnownFields<Fields>, AllowedFields<Entry>>] extends [never]
      ? AllPathsExist<
          ContentAtDepth<Entry, Level extends Depth ? Level : 1>,
          KnownFields<Fields>
        >
      : false
  : true;

type EnsureValidFields<Entry, Level extends Depth | undefined, Fields> =
  false extends FieldsAreValid<Entry, Level, Fields> ? never : unknown;

type ProjectFields<Content, Entry, Fields> = [Fields] extends [undefined]
  ? Content
  : StableFields<Fields> extends true
    ? [LiteralFields<Fields>] extends [never]
      ? unknown
      : [Exclude<LiteralFields<Fields>, AllowedFields<Entry>>] extends [never]
        ? AllPathsExist<Content, LiteralFields<Fields>> extends true
          ? ProjectPaths<Content, LiteralFields<Fields>>
          : unknown
        : unknown
    : unknown;

type EntryAt<Schema, Endpoint> = Endpoint extends keyof Schema
  ? Schema[Endpoint]
  : never;

type WriteContent<Entry, Operation extends 'create' | 'update'> =
  Entry extends Record<Operation, infer Content>
    ? Content
    : Record<string, any>;

type NoInferWrite<T> = [T][T extends any ? 0 : never];

type ExplicitWriteRequest<T, Request> =
  IsUnspecified<T> extends true
    ? never
    : T extends Record<string | number, any>
      ? Request
      : never;

type UpdateRequestForKind<
  Content,
  Endpoint extends string,
  Kind extends MicroCMSSchemaEntry['kind'],
> = Omit<UpdateRequest<Content>, 'endpoint' | 'contentId'> & {
  endpoint: NonAny<Endpoint>;
} & (Kind extends 'list' ? { contentId: string } : { contentId?: never });

type CreateRequestForSchema<Schema> = {
  [Endpoint in EndpointsOfKind<Schema, 'list'>]: Omit<
    CreateRequest<WriteContent<Schema[Endpoint & keyof Schema], 'create'>>,
    'endpoint'
  > & { endpoint: Endpoint };
}[EndpointsOfKind<Schema, 'list'>];
type UpdateRequestForSchema<Schema> = {
  [Endpoint in EndpointsOfKind<Schema, 'list' | 'object'>]: Schema[Endpoint &
    keyof Schema] extends { kind: infer Kind }
    ? Kind extends 'list' | 'object'
      ? UpdateRequestForKind<
          WriteContent<Schema[Endpoint & keyof Schema], 'update'>,
          Endpoint,
          Kind
        >
      : never
    : never;
}[EndpointsOfKind<Schema, 'list' | 'object'>];

// Validate every possible target, retaining endpoint/content pairs in request unions.
// Track exact pairs to validate recursive user-defined data without expanding forever.
type SeenWritePair<Allowed, Content, Seen> = true extends (
  Seen extends [infer PreviousAllowed, infer PreviousContent]
    ? (<Value>() => Value extends [Allowed, Content] ? 1 : 2) extends <
        Value,
      >() => Value extends [PreviousAllowed, PreviousContent] ? 1 : 2
      ? true
      : false
    : never
)
  ? true
  : false;

// Array unions can contain synthesized optional undefined keys from other variants.
type PresentWriteKeys<Content> = {
  [Key in keyof Content]-?: Record<never, never> extends Pick<Content, Key>
    ? [Content[Key]] extends [undefined]
      ? never
      : Key
    : Key;
}[keyof Content];

type WriteArrayIsValid<
  Allowed extends readonly unknown[],
  Content extends readonly unknown[],
  Seen,
> = false extends {
  [Key in keyof Content]: Key extends `${infer Index extends number}`
    ? WriteContentIsValid<Allowed[Index], Content[Key], Seen>
    : Key extends number
      ? WriteContentIsValid<Allowed[Key], Content[Key], Seen>
      : never;
}[number]
  ? false
  : true;

type WriteVariantIsValid<Allowed, Content, Seen> =
  IsAny<Allowed> extends true
    ? true
    : Allowed extends unknown
      ? [Content] extends [Allowed]
        ? SeenWritePair<Allowed, Content, Seen> extends true
          ? true
          : Allowed extends readonly unknown[]
            ? Content extends readonly unknown[]
              ? WriteArrayIsValid<Allowed, Content, Seen | [Allowed, Content]>
              : false
            : Allowed extends object
              ? Content extends object
                ? Exclude<
                    PresentWriteKeys<Content>,
                    keyof Allowed
                  > extends never
                  ? false extends {
                      [
                        Key in PresentWriteKeys<Content>
                      ]-?: Key extends keyof Allowed
                        ? WriteContentIsValid<
                            Allowed[Key],
                            Content[Key],
                            Seen | [Allowed, Content]
                          >
                        : false;
                    }[PresentWriteKeys<Content>]
                    ? false
                    : true
                  : false
                : false
              : true
        : false
      : never;
type WriteContentIsValid<
  Allowed,
  Content,
  Seen = never,
> = Content extends unknown
  ? true extends WriteVariantIsValid<Allowed, Content, Seen>
    ? true
    : false
  : never;
type WriteRequestIsValid<
  Schema,
  Request,
  Operation extends 'create' | 'update',
> = Request extends { endpoint: infer Endpoint; content: infer Content }
  ? Exclude<
      keyof Request,
      keyof (Operation extends 'create'
        ? CreateRequest<unknown>
        : UpdateRequest<unknown>)
    > extends never
    ? Endpoint extends keyof Schema
      ? WriteContentIsValid<
          Operation extends 'update'
            ? Partial<WriteContent<Schema[Endpoint], Operation>>
            : WriteContent<Schema[Endpoint], Operation>,
          Content
        >
      : false
    : false
  : false;
type EnsureWriteRequest<
  Schema,
  Request,
  Operation extends 'create' | 'update',
> =
  false extends WriteRequestIsValid<Schema, Request, Operation>
    ? never
    : unknown;

type TypedGetRequest<Schema> = Omit<
  GetRequest,
  'endpoint' | 'contentId' | 'queries'
> & { queries?: RequestQueries<GetRequest> } & (
    | { endpoint: EndpointsOfKind<Schema, 'list'>; contentId?: string }
    | { endpoint: EndpointsOfKind<Schema, 'object'>; contentId?: never }
  );

type QueryValue<Queries, Key extends PropertyKey> = Queries extends unknown
  ? Key extends keyof Queries
    ? Queries[Key]
    : undefined
  : never;

type IsAny<Value> = 0 extends 1 & Value ? true : false;

type ContentForQueries<Schema, Endpoint extends keyof Schema, Queries> = [
  QueryValue<Queries, 'richEditorFormat'>,
] extends ['html' | undefined]
  ? [QueryValue<Queries, 'depth'>] extends [Depth | undefined]
    ? ReadShape<
        EntryAt<Schema, Endpoint>,
        QueryValue<Queries, 'depth'> & (Depth | undefined),
        QueryValue<Queries, 'fields'>
      >
    : unknown
  : unknown;

// Retain the actual variable type, including omission of queries, depth and fields.
type QueriesForRequest<Request> =
  QueryValue<Request, 'queries'> extends infer Queries
    ? Queries extends object
      ? Queries
      : object
    : never;
type OptionalQueryProperty<
  Queries,
  Key extends PropertyKey,
> = Key extends keyof Queries
  ? undefined extends Queries[Key]
    ? true
    : false
  : false;
type HasVariableQueries<Request> =
  true extends IsUnion<Request>
    ? true
    : 'queries' extends keyof Request
      ? undefined extends QueryValue<Request, 'queries'>
        ? true
        : true extends IsUnion<NonNullable<QueryValue<Request, 'queries'>>>
          ? true
          : true extends OptionalQueryProperty<
                NonNullable<QueryValue<Request, 'queries'>>,
                'depth' | 'fields'
              >
            ? true
            : false
      : false;
type VariableQueryIsValid<Entry, Queries> = Queries extends object
  ? [QueryValue<Queries, 'richEditorFormat'>] extends ['object']
    ? false
    : [
          EnsureValidFields<
            Entry,
            QueryValue<Queries, 'depth'> & (Depth | undefined),
            QueryValue<Queries, 'fields'>
          >,
        ] extends [never]
      ? false
      : true
  : true;
type VariableRequest<Request, Endpoint extends string> = AnyFieldsRequest<
  Request,
  Endpoint
>;
type KeysOfUnion<Value> = Value extends unknown ? keyof Value : never;

// Validate each request branch with its own endpoint before combining results.
type VariableRequestIsValid<Schema, Request, BaseRequest> = Request extends {
  endpoint: infer Endpoint;
}
  ? Exclude<
      keyof Request,
      keyof VariableRequest<BaseRequest, string>
    > extends never
    ? Exclude<
        KeysOfUnion<NonNullable<QueryValue<Request, 'queries'>>>,
        keyof RequestQueries<BaseRequest>
      > extends never
      ? false extends VariableQueryIsValid<
          EntryAt<Schema, Endpoint>,
          QueriesForRequest<Request>
        >
        ? false
        : true
      : false
    : false
  : false;
// Capture query keys separately so literal fields keep their existing inference.
// Each candidate must satisfy the same key check, including overlapping unions.
type CheckQueryKeys<Keys extends PropertyKey, Base> = {
  [Key in Keys]?: Key extends keyof RequestQueries<Base> ? unknown : never;
};
type EnsureVariableRequest<Schema, Request, BaseRequest> =
  HasVariableQueries<Request> extends true
    ? false extends VariableRequestIsValid<Schema, Request, BaseRequest>
      ? never
      : unknown
    : never;
type VariableContent<Schema, Request> = Request extends unknown
  ? ExpandForHover<
      QueriesForRequest<Request> extends infer Queries
        ? Queries extends object
          ? ContentForQueries<
              Schema,
              Extract<QueryValue<Request, 'endpoint'>, keyof Schema>,
              Queries
            >
          : never
        : never
    >
  : never;

// Materialize nested generated content so editors show the selected fields on hover.
type ExpandForHover<Value> = Value extends readonly unknown[]
  ? { [Key in keyof Value]: ExpandForHover<Value[Key]> }
  : Value extends Record<string, unknown>
    ? { [Key in keyof Value]: ExpandForHover<Value[Key]> }
    : Value;

/** Infer one content item from a generated endpoint schema and static queries. */
export type InferMicroCMSContent<
  Schema extends { [Endpoint in keyof Schema]: MicroCMSSchemaEntry },
  Endpoint extends keyof Schema,
  Queries extends object = object,
> =
  IsAny<Queries> extends true
    ? unknown
    : Queries extends unknown
      ? ExpandForHover<ContentForQueries<Schema, Endpoint, Queries>>
      : never;

type ReadShape<
  Entry,
  Level extends Depth | undefined,
  Fields,
> = Entry extends unknown
  ? ProjectFields<
      ContentAtDepth<Entry, Level extends Depth ? Level : 1>,
      Entry,
      Fields
    >
  : never;

type RawListResponse<Content> = ExpandForHover<{
  contents: Content[];
  totalCount: number;
  limit: number;
  offset: number;
}>;

declare const unspecifiedContent: unique symbol;
type UnspecifiedContent = typeof unspecifiedContent;
type IsUnspecified<T> =
  IsAny<T> extends true
    ? false
    : [T] extends [UnspecifiedContent]
      ? [UnspecifiedContent] extends [T]
        ? true
        : false
      : false;
type ExplicitRequest<T, Request> =
  IsUnspecified<T> extends true ? never : Request;

type ListResponseOrUnknown<T> =
  IsUnspecified<T> extends true
    ? RawListResponse<unknown>
    : MicroCMSListResponse<T>;

type ListContentOrUnknown<T> =
  IsUnspecified<T> extends true ? unknown : T & MicroCMSListContent;

type ObjectContentOrUnknown<T> =
  IsUnspecified<T> extends true ? unknown : T & MicroCMSObjectContent;

type AllContentsOrUnknown<T> =
  IsUnspecified<T> extends true ? unknown[] : (T & MicroCMSListContent)[];

/**
 * Read methods infer depth and literal fields from the registered schema.
 * Known invalid fields fail at the call site; dynamic fields return unknown.
 * Endpoint kinds and content IDs are checked; explicit method types remain available.
 */
export type TypedMicroCMSClient<Schema, LegacyClient> = Omit<
  LegacyClient,
  | 'get'
  | 'getList'
  | 'getListDetail'
  | 'getObject'
  | 'getAllContentIds'
  | 'getAllContents'
  | 'create'
  | 'update'
  | 'delete'
> & {
  get: <T = any>(request: TypedGetRequest<Schema>) => Promise<T>;
  getAllContentIds: <Endpoint extends EndpointsOfKind<Schema, 'list'>>(
    request: Omit<GetAllContentIdsRequest, 'endpoint'> & {
      endpoint: NonAny<Endpoint>;
    },
  ) => Promise<string[]>;
  getList: {
    <T = UnspecifiedContent>(
      request: ExplicitRequest<
        T,
        AnyFieldsRequest<GetListRequest, EndpointsOfKind<Schema, 'list'>>
      >,
    ): Promise<ListResponseOrUnknown<T>>;
    <
      Request extends VariableRequest<
        GetListRequest,
        EndpointsOfKind<Schema, 'list'>
      >,
    >(
      request: NonAny<Request> &
        EnsureVariableRequest<Schema, Request, GetListRequest>,
    ): Promise<RawListResponse<VariableContent<Schema, Request>>>;
    <
      Endpoint extends EndpointsOfKind<Schema, 'list'>,
      Level extends Depth | undefined = undefined,
      Keys extends PropertyKey = never,
    >(
      request: PlainRequest<GetListRequest, Endpoint, Level> & {
        queries?: CheckQueryKeys<Keys, GetListRequest>;
      },
    ): Promise<
      RawListResponse<ReadShape<EntryAt<Schema, Endpoint>, Level, undefined>>
    >;
    <
      Endpoint extends EndpointsOfKind<Schema, 'list'>,
      Fields extends string,
      Level extends Depth | undefined = undefined,
      Keys extends PropertyKey = never,
    >(
      request: StringFieldsRequest<GetListRequest, Endpoint, Fields, Level> &
        EnsureValidFields<EntryAt<Schema, Endpoint>, Level, Fields> & {
          queries?: CheckQueryKeys<Keys, GetListRequest>;
        },
    ): Promise<
      RawListResponse<ReadShape<EntryAt<Schema, Endpoint>, Level, Fields>>
    >;
    <
      Endpoint extends EndpointsOfKind<Schema, 'list'>,
      Fields extends readonly string[],
      Level extends Depth | undefined = undefined,
      Keys extends PropertyKey = never,
    >(
      request: ArrayFieldsRequest<GetListRequest, Endpoint, Fields, Level> &
        EnsureValidFields<EntryAt<Schema, Endpoint>, Level, Fields> & {
          queries?: CheckQueryKeys<Keys, GetListRequest>;
        },
    ): Promise<
      RawListResponse<ReadShape<EntryAt<Schema, Endpoint>, Level, Fields>>
    >;
  };
  getListDetail: {
    <T = UnspecifiedContent>(
      request: ExplicitRequest<
        T,
        AnyFieldsRequest<GetListDetailRequest, EndpointsOfKind<Schema, 'list'>>
      >,
    ): Promise<ListContentOrUnknown<T>>;
    <
      Request extends VariableRequest<
        GetListDetailRequest,
        EndpointsOfKind<Schema, 'list'>
      >,
    >(
      request: NonAny<Request> &
        EnsureVariableRequest<Schema, Request, GetListDetailRequest>,
    ): Promise<VariableContent<Schema, Request>>;
    <
      Endpoint extends EndpointsOfKind<Schema, 'list'>,
      Level extends Depth | undefined = undefined,
      Keys extends PropertyKey = never,
    >(
      request: PlainRequest<GetListDetailRequest, Endpoint, Level> & {
        queries?: CheckQueryKeys<Keys, GetListDetailRequest>;
      },
    ): Promise<
      ExpandForHover<ReadShape<EntryAt<Schema, Endpoint>, Level, undefined>>
    >;
    <
      Endpoint extends EndpointsOfKind<Schema, 'list'>,
      Fields extends string,
      Level extends Depth | undefined = undefined,
      Keys extends PropertyKey = never,
    >(
      request: StringFieldsRequest<
        GetListDetailRequest,
        Endpoint,
        Fields,
        Level
      > &
        EnsureValidFields<EntryAt<Schema, Endpoint>, Level, Fields> & {
          queries?: CheckQueryKeys<Keys, GetListDetailRequest>;
        },
    ): Promise<
      ExpandForHover<ReadShape<EntryAt<Schema, Endpoint>, Level, Fields>>
    >;
    <
      Endpoint extends EndpointsOfKind<Schema, 'list'>,
      Fields extends readonly string[],
      Level extends Depth | undefined = undefined,
      Keys extends PropertyKey = never,
    >(
      request: ArrayFieldsRequest<
        GetListDetailRequest,
        Endpoint,
        Fields,
        Level
      > &
        EnsureValidFields<EntryAt<Schema, Endpoint>, Level, Fields> & {
          queries?: CheckQueryKeys<Keys, GetListDetailRequest>;
        },
    ): Promise<
      ExpandForHover<ReadShape<EntryAt<Schema, Endpoint>, Level, Fields>>
    >;
  };
  getObject: {
    <T = UnspecifiedContent>(
      request: ExplicitRequest<
        T,
        AnyFieldsRequest<GetObjectRequest, EndpointsOfKind<Schema, 'object'>>
      >,
    ): Promise<ObjectContentOrUnknown<T>>;
    <
      Request extends VariableRequest<
        GetObjectRequest,
        EndpointsOfKind<Schema, 'object'>
      >,
    >(
      request: NonAny<Request> &
        EnsureVariableRequest<Schema, Request, GetObjectRequest>,
    ): Promise<VariableContent<Schema, Request>>;
    <
      Endpoint extends EndpointsOfKind<Schema, 'object'>,
      Level extends Depth | undefined = undefined,
      Keys extends PropertyKey = never,
    >(
      request: PlainRequest<GetObjectRequest, Endpoint, Level> & {
        queries?: CheckQueryKeys<Keys, GetObjectRequest>;
      },
    ): Promise<
      ExpandForHover<ReadShape<EntryAt<Schema, Endpoint>, Level, undefined>>
    >;
    <
      Endpoint extends EndpointsOfKind<Schema, 'object'>,
      Fields extends string,
      Level extends Depth | undefined = undefined,
      Keys extends PropertyKey = never,
    >(
      request: StringFieldsRequest<GetObjectRequest, Endpoint, Fields, Level> &
        EnsureValidFields<EntryAt<Schema, Endpoint>, Level, Fields> & {
          queries?: CheckQueryKeys<Keys, GetObjectRequest>;
        },
    ): Promise<
      ExpandForHover<ReadShape<EntryAt<Schema, Endpoint>, Level, Fields>>
    >;
    <
      Endpoint extends EndpointsOfKind<Schema, 'object'>,
      Fields extends readonly string[],
      Level extends Depth | undefined = undefined,
      Keys extends PropertyKey = never,
    >(
      request: ArrayFieldsRequest<GetObjectRequest, Endpoint, Fields, Level> &
        EnsureValidFields<EntryAt<Schema, Endpoint>, Level, Fields> & {
          queries?: CheckQueryKeys<Keys, GetObjectRequest>;
        },
    ): Promise<
      ExpandForHover<ReadShape<EntryAt<Schema, Endpoint>, Level, Fields>>
    >;
  };
  getAllContents: {
    <T = UnspecifiedContent>(
      request: ExplicitRequest<
        T,
        AnyFieldsRequest<
          TypedAllContentRequest,
          EndpointsOfKind<Schema, 'list'>
        >
      >,
    ): Promise<AllContentsOrUnknown<T>>;
    <
      Request extends VariableRequest<
        TypedAllContentRequest,
        EndpointsOfKind<Schema, 'list'>
      >,
    >(
      request: NonAny<Request> &
        EnsureVariableRequest<Schema, Request, TypedAllContentRequest>,
    ): Promise<VariableContent<Schema, Request>[]>;
    <
      Endpoint extends EndpointsOfKind<Schema, 'list'>,
      Level extends Depth | undefined = undefined,
      Keys extends PropertyKey = never,
    >(
      request: PlainRequest<TypedAllContentRequest, Endpoint, Level> & {
        queries?: CheckQueryKeys<Keys, TypedAllContentRequest>;
      },
    ): Promise<
      ExpandForHover<ReadShape<EntryAt<Schema, Endpoint>, Level, undefined>>[]
    >;
    <
      Endpoint extends EndpointsOfKind<Schema, 'list'>,
      Fields extends string,
      Level extends Depth | undefined = undefined,
      Keys extends PropertyKey = never,
    >(
      request: StringFieldsRequest<
        TypedAllContentRequest,
        Endpoint,
        Fields,
        Level
      > &
        EnsureValidFields<EntryAt<Schema, Endpoint>, Level, Fields> & {
          queries?: CheckQueryKeys<Keys, TypedAllContentRequest>;
        },
    ): Promise<
      ExpandForHover<ReadShape<EntryAt<Schema, Endpoint>, Level, Fields>>[]
    >;
    <
      Endpoint extends EndpointsOfKind<Schema, 'list'>,
      Fields extends readonly string[],
      Level extends Depth | undefined = undefined,
      Keys extends PropertyKey = never,
    >(
      request: ArrayFieldsRequest<
        TypedAllContentRequest,
        Endpoint,
        Fields,
        Level
      > &
        EnsureValidFields<EntryAt<Schema, Endpoint>, Level, Fields> & {
          queries?: CheckQueryKeys<Keys, TypedAllContentRequest>;
        },
    ): Promise<
      ExpandForHover<ReadShape<EntryAt<Schema, Endpoint>, Level, Fields>>[]
    >;
  };
  create: {
    <T = UnspecifiedContent>(
      request: ExplicitWriteRequest<
        T,
        CreateRequest<NoInferWrite<T>> & {
          endpoint: EndpointsOfKind<Schema, 'list'>;
        }
      >,
    ): Promise<WriteApiRequestResult>;
    <Request extends CreateRequestForSchema<Schema>>(
      request: NonAny<Request> & EnsureWriteRequest<Schema, Request, 'create'>,
    ): Promise<WriteApiRequestResult>;
  };
  update: {
    <T = UnspecifiedContent>(
      request: ExplicitWriteRequest<
        T,
        UpdateRequestForKind<
          NoInferWrite<T>,
          EndpointsOfKind<Schema, 'list'>,
          'list'
        >
      >,
    ): Promise<WriteApiRequestResult>;
    <T = UnspecifiedContent>(
      request: ExplicitWriteRequest<
        T,
        UpdateRequestForKind<
          NoInferWrite<T>,
          EndpointsOfKind<Schema, 'object'>,
          'object'
        >
      >,
    ): Promise<WriteApiRequestResult>;
    <Request extends UpdateRequestForSchema<Schema>>(
      request: NonAny<Request> & EnsureWriteRequest<Schema, Request, 'update'>,
    ): Promise<WriteApiRequestResult>;
  };
  delete: <Endpoint extends EndpointsOfKind<Schema, 'list'>>(
    request: Omit<DeleteRequest, 'endpoint'> & { endpoint: NonAny<Endpoint> },
  ) => Promise<void>;
};
