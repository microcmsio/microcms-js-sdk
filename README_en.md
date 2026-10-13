# microCMS JavaScript SDK

[日本語版 README](README.md)

It helps you to use microCMS from JavaScript and Node.js applications.

<a href="https://discord.com/invite/K3DPqw4EJ2" target="_blank"><img src="https://img.shields.io/badge/Discord-%235865F2.svg?style=for-the-badge&logo=discord&logoColor=white" alt="Discord"></a>

## Maintenance Policy

The current maintenance level of this SDK is `Active`.

For details, see the [SDK maintenance policy](https://document.microcms.io/en/manual/limitations#h36932e94f2).

## Requirements

- Node.js 18+ (22+ recommended; not required when using the SDK in a browser)
- TypeScript 6.0+ (when using types)

## Tutorial

To try a basic integration first, follow the official [JavaScript tutorial](https://document.microcms.io/en/tutorial/javascript/javascript-top). It covers getting started in a browser and with Node.js.

## Setup

### Installation

#### Node.js

```bash
$ npm install microcms-js-sdk

or

$ yarn add microcms-js-sdk
```

#### Browser (self-hosting)

Download and unzip `microcms-js-sdk-x.y.z.tgz` from the [releases page](https://github.com/microcmsio/microcms-js-sdk/releases). Then, host it on any server of your choice and use it. The target file is `./dist/umd/microcms-js-sdk.js`.

```html
<script src="./microcms-js-sdk.js"></script>
```

#### Browser (CDN)

Please load and use the URL provided by an external provider.

```html
<script src="https://cdn.jsdelivr.net/npm/microcms-js-sdk@3.1.1/dist/umd/microcms-js-sdk.min.js"></script>
```

or

```html
<script src="https://cdn.jsdelivr.net/npm/microcms-js-sdk/dist/umd/microcms-js-sdk.min.js"></script>
```

> [!WARNING]
> The hosting service (cdn.jsdelivr.net) is not related to microCMS. For production use, we recommend self-hosting on your own server.

## Contents API

### Import

#### Node.js

```javascript
const { createClient } = require('microcms-js-sdk'); // CommonJS
```

or

```javascript
import { createClient } from 'microcms-js-sdk'; //ES6
```

#### Browser

```html
<script>
  const { createClient } = microcms;
</script>
```

### Create client object

```javascript
// Create a client object.
const client = createClient({
  serviceDomain: 'YOUR_DOMAIN', // YOUR_DOMAIN is the XXXX part of XXXX.microcms.io.
  apiKey: 'YOUR_API_KEY',
  // retry: true // Retry up to a maximum of two times.
});
```

For type annotations and inference, see [TypeScript](#typescript).

### API methods

The table below shows whether each microCMS JavaScript SDK method can be used with a list format API or an object format API.

| Method           | List format | Object format |
| ---------------- | ----------- | ------------- |
| getList          | ✅          |               |
| getListDetail    | ✅          |               |
| getObject        |             | ✅            |
| getAllContentIds | ✅          |               |
| getAllContents   | ✅          |               |
| create           | ✅          |               |
| update           | ✅          | ✅            |
| delete           | ✅          |               |

> [!NOTE]
> The generic `get` method is deprecated. Use `getList`, `getListDetail`, or `getObject` instead. Even with a schema registered on the client, `get` does not infer its return type.

### Get content list

The `getList` method is used to retrieve a list of content from a specified endpoint.

```javascript
client
  .getList({
    endpoint: 'endpoint',
  })
  .then((res) => console.log(res))
  .catch((err) => console.error(err));
```

#### Get content list with parameters

The `queries` property can be used to specify parameters for retrieving content that matches specific criteria. For more details on each available property, refer to the [microCMS Documentation](https://document.microcms.io/content-api/get-list-contents#h929d25d495).

```javascript
client
  .getList({
    endpoint: 'endpoint',
    queries: {
      draftKey: 'abcd',
      limit: 100,
      offset: 1,
      orders: 'createdAt',
      q: 'Hello',
      fields: 'id,title',
      ids: 'foo',
      filters: 'publishedAt[greater_than]2021-01-01T03:00:00.000Z',
      depth: 1,
    },
  })
  .then((res) => console.log(res))
  .catch((err) => console.error(err));
```

### Get single content

The `getListDetail` method is used to retrieve a single content specified by its ID.

```javascript
client
  .getListDetail({
    endpoint: 'endpoint',
    contentId: 'contentId',
  })
  .then((res) => console.log(res))
  .catch((err) => console.error(err));
```

#### Get single content with parameters

The `queries` property can be used to specify parameters for retrieving a single content that matches specific criteria. For more details on each available property, refer to the [microCMS Documentation](https://document.microcms.io/content-api/get-content#h929d25d495).

```javascript
client
  .getListDetail({
    endpoint: 'endpoint',
    contentId: 'contentId',
    queries: {
      draftKey: 'abcd',
      fields: 'id,title',
      depth: 1,
    },
  })
  .then((res) => console.log(res))
  .catch((err) => console.error(err));
```

### Get object format content

The `getObject` method retrieves object format content from the specified endpoint.

```javascript
client
  .getObject({
    endpoint: 'endpoint',
  })
  .then((res) => console.log(res))
  .catch((err) => console.error(err));
```

### Get all contentIds

The `getAllContentIds` method retrieves all content IDs from the specified endpoint.

```javascript
client
  .getAllContentIds({
    endpoint: 'endpoint',
  })
  .then((res) => console.log(res))
  .catch((err) => console.error(err));
```

#### Get all contentIds with filters

Use the `filters` property to retrieve all content IDs that match the specified conditions.

```javascript
client
  .getAllContentIds({
    endpoint: 'endpoint',
    filters: 'category[equals]uN28Folyn',
  })
  .then((res) => console.log(res))
  .catch((err) => console.error(err));
```

#### Get all contentIds with draftKey

Use the `draftKey` property to retrieve the IDs of draft content.

```javascript
client
  .getAllContentIds({
    endpoint: 'endpoint',
    draftKey: 'draftKey',
  })
  .then((res) => console.log(res))
  .catch((err) => console.error(err));
```

#### Get all values of a field other than the content ID

Specify a field ID in the `alternateField` property to retrieve all values of a field other than the content ID. If a retrieved value is not a string, the SDK throws an error at runtime.

```javascript
client
  .getAllContentIds({
    endpoint: 'endpoint',
    alternateField: 'url',
  })
  .then((res) => console.log(res))
  .catch((err) => console.error(err));
```

### Get all contents

The `getAllContents` method is used to retrieve all content data.

```javascript
client
  .getAllContents({
    endpoint: 'endpoint',
  })
  .then((res) => console.log(res))
  .catch((err) => console.error(err));
```

#### Get all contents with parameters

The `queries` property can be used to specify parameters for retrieving all content that matches specific criteria. For more details on each available property, refer to the [microCMS Documentation](https://document.microcms.io/content-api/get-list-contents#h929d25d495).

```javascript
client
  .getAllContents({
    endpoint: 'endpoint',
    queries: {
      filters: 'createdAt[greater_than]2021-01-01T03:00:00.000Z',
      orders: '-createdAt',
    },
  })
  .then((res) => console.log(res))
  .catch((err) => console.error(err));
```

### Create content

The `create` method is used to register content.

```javascript
client
  .create({
    endpoint: 'endpoint',
    content: {
      title: 'Title',
      body: 'Body',
    },
  })
  .then((res) => console.log(res.id))
  .catch((err) => console.error(err));
```

#### Create content with specified ID

By specifying the `contentId` property, it is possible to register content with a specified ID.

```javascript
client
  .create({
    endpoint: 'endpoint',
    contentId: 'contentId',
    content: {
      title: 'Title',
      body: 'Body',
    },
  })
  .then((res) => console.log(res.id))
  .catch((err) => console.error(err));
```

#### Create draft content

By specifying the `isDraft` property, it is possible to register the content as a draft.

```javascript
client
  .create({
    endpoint: 'endpoint',
    content: {
      title: 'Title',
      body: 'Body',
    },
    isDraft: true,
  })
  .then((res) => console.log(res.id))
  .catch((err) => console.error(err));
```

#### Create draft content with specified ID

By specifying the `contentId` and `isDraft` properties, it is possible to register the content as a draft with a specified ID.

```javascript
client
  .create({
    endpoint: 'endpoint',
    contentId: 'contentId',
    content: {
      title: 'Title',
      body: 'Body',
    },
    isDraft: true,
  })
  .then((res) => console.log(res.id))
  .catch((err) => console.error(err));
```

#### Create closed content

By specifying the `isClosed` property, the content can be registered as archived.

> **Note:** `isDraft` and `isClosed` are mutually exclusive. Do not pass both as `true`; the SDK rejects that combination at runtime with an error. When using `isClosed: true`, omit `isDraft` or set it to `false` (the default).

```javascript
client
  .create({
    endpoint: 'endpoint',
    content: {
      title: 'Title',
      body: 'Body',
    },
    isClosed: true,
  })
  .then((res) => console.log(res.id))
  .catch((err) => console.error(err));
```

#### Create closed content with specified ID

By specifying the `contentId` and `isClosed` properties, the content can be registered as archived with a specified ID. The same rule applies as above: `isDraft` and `isClosed` cannot both be `true`.

```javascript
client
  .create({
    endpoint: 'endpoint',
    contentId: 'contentId',
    content: {
      title: 'Title',
      body: 'Body',
    },
    isClosed: true,
  })
  .then((res) => console.log(res.id))
  .catch((err) => console.error(err));
```

### Update content

The `update` method updates the specified content.

```javascript
client
  .update({
    endpoint: 'endpoint',
    contentId: 'contentId',
    content: {
      title: 'Title',
    },
  })
  .then((res) => console.log(res.id))
  .catch((err) => console.error(err));
```

#### Update content as draft

By specifying the `isDraft` property, it is possible to update the content as a draft.

```javascript
client
  .update({
    endpoint: 'endpoint',
    contentId: 'contentId',
    content: {
      title: 'Title',
    },
    isDraft: true,
  })
  .then((res) => console.log(res.id))
  .catch((err) => console.error(err));
```

#### Update object format content

To update object format content, specify only the endpoint and omit the `contentId` property.

```javascript
client
  .update({
    endpoint: 'endpoint',
    content: {
      title: 'Title',
    },
  })
  .then((res) => console.log(res.id))
  .catch((err) => console.error(err));
```

### Delete content

The `delete` method is used to delete a single content specified by its ID.

```javascript
client
  .delete({
    endpoint: 'endpoint',
    contentId: 'contentId',
  })
  .catch((err) => console.error(err));
```

### CustomRequestInit

#### Next.js App Router

You can specify fetch cache options used by the Next.js App Router.

See the official Next.js documentation for the available options.

[Functions: fetch \| Next\.js](https://nextjs.org/docs/app/api-reference/functions/fetch)

```ts
const response = await client.getList({
  customRequestInit: {
    next: {
      revalidate: 60,
    },
  },
  endpoint: 'endpoint',
});
```

#### AbortController: abort() method

You can abort fetch requests.

```ts
const controller = new AbortController();
const timeoutId = setTimeout(() => {
  controller.abort();
}, 1000);

try {
  const response = await client.getObject({
    customRequestInit: {
      signal: controller.signal,
    },
    endpoint: 'config',
  });
} finally {
  clearTimeout(timeoutId);
}
```

### TypeScript

To try completion and inference in your editor, see the [typed client examples](examples/README.md).

For the Contents API, you can register a service schema when creating the client or specify a type for each method call. You can also extract a content type for a particular read query.

#### Register a schema when creating the client

Pass a service schema type generated by [microcms-typegen](https://github.com/microcmsio/microcms-ts-typegen#readme) to enable the following checks and inference at TypeScript compile time.

- **Input type checking**: Checks registered endpoints and API formats, as well as statically known combinations of `fields` paths and `depth`. Query property names, basic value types, and the `depth` range (0–3) are also checked.
- **Return type inference**: Infers the return types of `getList`, `getListDetail`, `getObject`, and `getAllContents` based on the endpoint, `depth`, and `fields`.

The following example uses `services.main` in the type generator configuration. The schema type name depends on the service name.

```ts
import { createClient } from 'microcms-js-sdk';
import type { MainServiceSchema } from './microcms-types';

const client = createClient<MainServiceSchema>({
  serviceDomain: 'YOUR_DOMAIN',
  apiKey: 'YOUR_API_KEY',
});

const response = await client.getList({
  endpoint: 'blogs',
  queries: { depth: 2, fields: ['title', 'category.name'] },
});
```

##### Not covered by type checking or inference

The following checks and inference are not currently supported. We will consider supporting them in the future.

| Item | Checks or inference not supported |
| --- | --- |
| `filters` | Validity of field names, operators, and values |
| `orders` | Validity of field names and sort order expressions |
| `alternateField` | Whether the specified field exists and the type of its values |
| `richEditorFormat: 'object'` | Automatic return type inference. An explicit method type argument is required; omitting it causes a type error |

#### Specify a type for each method call

You can continue to create a client without a schema type and pass type arguments to read methods. Explicit method type arguments also work with a typed client. For that call, the specified type takes precedence over schema inference for `depth` and `fields`. You are responsible for ensuring that the specified type matches the actual response.

```ts
import { createClient } from 'microcms-js-sdk';

type Content = { title: string };
const client = createClient({
  serviceDomain: 'YOUR_DOMAIN',
  apiKey: 'YOUR_API_KEY',
});

const list = await client.getList<Content>({ endpoint: 'blogs' });
const detail = await client.getListDetail<Content>({
  endpoint: 'blogs',
  contentId: 'blog-id',
});
const object = await client.getObject<Content>({ endpoint: 'settings' });
```

#### Extract a content type for a query

Use `InferMicroCMSContent` when you need the type of a single content item for the same query used to fetch it, such as for component props.

```ts
import { createClient, type InferMicroCMSContent } from 'microcms-js-sdk';
import type { MainServiceSchema } from './microcms-types';

const client = createClient<MainServiceSchema>({
  serviceDomain: 'YOUR_DOMAIN',
  apiKey: 'YOUR_API_KEY',
});
const queries = { depth: 2, fields: ['title', 'category.name'] } as const;
const response = await client.getList({ endpoint: 'blogs', queries });

type BlogCardProps = {
  blog: InferMicroCMSContent<MainServiceSchema, 'blogs', typeof queries>;
};
```

When storing the query in a variable as shown above, use `as const` to preserve the literal values of `depth` and `fields`. With only `const queries = { ... }`, `depth` widens to `number` and `fields` to `string[]`. You do not need `as const` when writing the query directly in the method call.

Declaring a type with invalid `fields` using only `InferMicroCMSContent` does not immediately produce a type error; the result is `unknown`. Passing the same query to a typed client produces a type error at the call site for statically detectable mistakes.

#### Infer write input types from a schema

With a generated `MainServiceSchema`, field names and value types for `create` and `update` are inferred from `endpoint`. Use content IDs for references and URL strings for images and files. `create` and `delete` support list format APIs; `update` supports both list format and object format APIs. The endpoint passed to `delete` is also type-checked.

```ts
import { createClient } from 'microcms-js-sdk';
import type { MainServiceSchema } from './microcms-types';

const client = createClient<MainServiceSchema>({
  serviceDomain: 'YOUR_DOMAIN',
  apiKey: 'YOUR_API_KEY',
});

await client.create({
  endpoint: 'blogs',
  content: { title: 'Title', category: 'category-id' },
});
await client.update({
  endpoint: 'blogs',
  contentId: 'blog-id',
  content: { title: 'Updated title' },
});
await client.delete({ endpoint: 'blogs', contentId: 'blog-id' });
```

You can extract the generated input types as `MainServiceSchema['blogs']['create']` or `MainServiceSchema['blogs']['update']`.

#### Specify a write type for each method call

The existing `create<Content>` and `update<Content>` forms remain available. When explicitly specified on a typed client, the supplied type takes precedence over the generated write type for that call. `create<Content>` checks `content` against `Content`, while `update<Content>` checks it against `Partial<Content>`. You are responsible for ensuring that the specified type matches the API schema.

```ts
type TitleOnly = { title: string };

await client.update<TitleOnly>({
  endpoint: 'blogs',
  contentId: 'blog-id',
  content: { title: 'Updated title' },
});
```

### Tips

#### Use separate API keys for reading and writing

```javascript
const readClient = createClient({
  serviceDomain: 'serviceDomain',
  apiKey: 'readApiKey',
});
const writeClient = createClient({
  serviceDomain: 'serviceDomain',
  apiKey: 'writeApiKey',
});
```

## Management API

### Import

#### Node.js

```javascript
const { createManagementClient } = require('microcms-js-sdk'); // CommonJS
```

or

```javascript
import { createManagementClient } from 'microcms-js-sdk'; //ES6
```

#### Browser

```html
<script>
  const { createManagementClient } = microcms;
</script>
```

### Create client object

```javascript
const client = createManagementClient({
  serviceDomain: 'YOUR_DOMAIN', // YOUR_DOMAIN is the XXXX part of XXXX.microcms.io.
  apiKey: 'YOUR_API_KEY',
});
```

### Upload media

You can upload images and files to the media library.

#### Node.js

```javascript
// Blob
import { readFileSync } from 'fs';

const file = readFileSync('path/to/file');
client
  .uploadMedia({
    data: new Blob([file], { type: 'image/png' }),
    name: 'image.png',
  })
  .then((res) => console.log(res))
  .catch((err) => console.error(err));

// or ReadableStream
import { createReadStream } from 'fs';
import { Stream } from 'stream';

const file = createReadStream('path/to/file');
client
  .uploadMedia({
    data: Stream.Readable.toWeb(file),
    name: 'image.png',
    type: 'image/png',
  })
  .then((res) => console.log(res))
  .catch((err) => console.error(err));

// or URL
client
  .uploadMedia({
    data: 'https://example.com/image.png',
    // name: 'image.png', ← Optional
  })
  .then((res) => console.log(res))
  .catch((err) => console.error(err));
```

#### Browser

```javascript
// File
const file = document.querySelector('input[type="file"]').files[0];
client
  .uploadMedia({
    data: file,
  })
  .then((res) => console.log(res))
  .catch((err) => console.error(err));

// or URL
client
  .uploadMedia({
    data: 'https://example.com/image.png',
    // name: 'image.png', ← Optional
  })
  .then((res) => console.log(res))
  .catch((err) => console.error(err));
```

### TypeScript

#### Media upload arguments

The Management API's `uploadMedia` method accepts data in the following formats.

```ts
type UploadMediaRequest =
  | { data: File }
  | { data: Blob; name: string }
  | { data: ReadableStream; name: string; type: `image/${string}` }
  | {
      data: URL | string;
      name?: string | null | undefined;
      customRequestHeaders?: HeadersInit;
    };
function uploadMedia(params: UploadMediaRequest): Promise<{ url: string }>;
```

## Error handling

For both the Contents API and the Management API, request errors created by the SDK can be handled as standard `Error` objects. `console.error(error)` logs the error message and stack trace. For HTTP errors, the output also includes the HTTP status and the error message returned by the API.

Both clients use the same `isMicroCMSRequestError` guard to identify request errors created by the SDK. After narrowing the error, you can access `status`, `url`, and `originalError`. The following example uses the Contents API. The same guard also identifies errors created by the SDK when `uploadMedia` sends a request to microCMS.

```typescript
import { createClient, isMicroCMSRequestError } from 'microcms-js-sdk';

const client = createClient({
  serviceDomain: 'serviceDomain',
  apiKey: 'apiKey',
});

try {
  await client.getList({ endpoint: 'blog' });
} catch (error) {
  // Log the error message and stack trace.
  console.error(error);

  if (isMicroCMSRequestError(error)) {
    // Access additional request details when needed.
    console.log(error.status);
    console.log(error.url);
    console.log(error.originalError);
  }
}
```

| Property        | HTTP error       | Network error                  |
| --------------- | ---------------- | ------------------------------ |
| `status`        | HTTP status code | `undefined`                    |
| `url`           | Request URL      | Request URL                    |
| `originalError` | `undefined`      | Original value thrown by `fetch` |

Errors during `uploadMedia` argument validation or fetching an upload source URL occur before the request to microCMS, so they may not be identified by `isMicroCMSRequestError`.

If `url` contains a `draftKey`, its value is masked as `***`. Request headers, request bodies, and the `Response` object are not added to the error.

The contents of `originalError` depend on the runtime environment, such as Node.js, browsers, or Edge Runtime, and are not guaranteed by this SDK.

The additional properties are non-enumerable, so they do not affect the existing `message`, `toString()`, `Object.keys()`, or `JSON.stringify()` results.

## Development

See the [development guide](DEVELOPMENT.md) for the SDK development environment, tests, fixtures, and CI.

## License

Apache-2.0
