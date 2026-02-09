# microCMS JavaScript SDK

[日本語版 README](README_jp.md)

It helps you to use microCMS from JavaScript and Node.js applications.

<a href="https://discord.com/invite/K3DPqw4EJ2" target="_blank"><img src="https://img.shields.io/badge/Discord-%235865F2.svg?style=for-the-badge&logo=discord&logoColor=white" alt="Discord"></a>

## Tutorial

See the [official tutorial](https://document.microcms.io/tutorial/javascript/javascript-top).

## Getting started

### Installation

#### Node.js

```bash
$ npm install microcms-js-sdk

or

$ yarn add microcms-js-sdk
```

> [!IMPORTANT]
> v3.0.0 or later requires Node.js **v18 or higher**.

#### Browser（Self-hosting）

Download and unzip `microcms-js-sdk-x.y.z.tgz` from the [releases page](https://github.com/microcmsio/microcms-js-sdk/releases). Then, host it on any server of your choice and use it. The target file is `./dist/umd/microcms-js-sdk.js`.

```html
<script src="./microcms-js-sdk.js"></script>
```

#### Browser（CDN）

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

#### Usage with a browser

```html
<script>
  const { createClient } = microcms;
</script>
```

### Create client object

```javascript
// Initialize Client SDK.
const client = createClient({
  serviceDomain: 'YOUR_DOMAIN', // YOUR_DOMAIN is the XXXX part of XXXX.microcms.io
  apiKey: 'YOUR_API_KEY',
  // retry: true // Retry attempts up to a maximum of two times.
});
```

### API methods

The table below shows each API method of microCMS JavaScript SDK and indicates which API format (List Format or Object Format) they can be used with using ✔️.

| Method            | List Format | Object Format |
|-------------------|-------------|---------------|
| getList           | ✔️          |               |
| getListDetail     | ✔️          |               |
| getObject         |            | ✔️             |
| getAllContentIds  | ✔️          |               |
| getAllContents    | ✔️          |               |
| create            | ✔️          |               |
| update            | ✔️          | ✔️             |
| delete            | ✔️          |               |

> [!NOTE]
> - ✔️ in "List Format" indicates the method can be used when the API type is set to List Format.
> - ✔️ in "Object Format" indicates the method can be used when the API type is set to Object Format.

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
    }
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
    }
  })
  .then((res) => console.log(res))
  .catch((err) => console.error(err));

```

### Get object format content

The `getObject` method is used to retrieve a single object format content

```javascript
client
  .getObject({
    endpoint: 'endpoint',
  })
  .then((res) => console.log(res))
  .catch((err) => console.error(err));
```

### Get all contentIds

The `getAllContentIds` method is used to retrieve all content IDs only.  

```javascript
client
  .getAllContentIds({
    endpoint: 'endpoint',
  })
  .then((res) => console.log(res))
  .catch((err) => console.error(err));
```

#### Get all contentIds with filters

It is possible to retrieve only the content IDs for a specific category by specifying the `filters`.

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

It is possible to include content from a specific draft by specifying the `draftKey`.

```javascript
client
  .getAllContentIds({
    endpoint: 'endpoint',
    draftKey: 'draftKey',
  })
  .then((res) => console.log(res))
  .catch((err) => console.error(err));
```

#### Get all contentIds with alternateField

The `alternateField` property can be used to address cases where the value of a field other than content ID is used in a URL, etc.

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
    queries: { filters: 'createdAt[greater_than]2021-01-01T03:00:00.000Z', orders: '-createdAt' },
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
      title: 'title',
      body: 'body',
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
      title: 'title',
      body: 'body',
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
      title: 'title',
      body: 'body',
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
      title: 'title',
      body: 'body',
    },
    isDraft: true,
  })
  .then((res) => console.log(res.id))
  .catch((err) => console.error(err));
```

### Update content

The `update` method is used to update a single content specified by its ID.

```javascript
client
  .update({
    endpoint: 'endpoint',
    contentId: 'contentId',
    content: {
      title: 'title',
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
      title: 'title',
    },
    isDraft: true,
  })
  .then((res) => console.log(res.id))
  .catch((err) => console.error(err));
```

#### Update object format content

When updating object content, use the `update` method without specifying a `contentId` property.

```javascript
client
  .update({
    endpoint: 'endpoint',
    content: {
      title: 'title',
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

### TypeScript

If you are using TypeScript, use `getList`, `getListDetail`, `getObject`. This internally contains a common type of content.

#### Response type for getList method

```typescript
type Content = {
  text: string,
};
/**
 * {
 *  contents: Content[]; // This is array type of Content
 *  totalCount: number;
 *  limit: number;
 *  offset: number;
 * }
 */
client.getList<Content>({ /* other */ })
```

#### Response type for getListDetail method

```typescript
type Content = {
  text: string,
};
/**
 * {
 *  id: string;
 *  createdAt: string;
 *  updatedAt: string;
 *  publishedAt?: string;
 *  revisedAt?: string;
 *  text: string; // This is Content type.
 * }
 */
client.getListDetail<Content>({ /* other */ })
```

#### Response type for getObject method

```typescript
type Content = {
  text: string,
};
/**
 * {
 *  createdAt: string;
 *  updatedAt: string;
 *  publishedAt?: string;
 *  revisedAt?: string;
 *  text: string; // This is Content type.
 * }
 */

client.getObject<Content>({ /* other */ })
```

#### Response type for getAllContentIds method

```typescript
/**
 * string[] // This is array type of string
 */
client.getAllContentIds({ /* other */ })
```

#### Create method with type safety

Since `content` will be of type `Content`, no required fields will be missed.

```typescript
type Content = {
  title: string;
  body?: string;
};

client.create<Content>({
  endpoint: 'endpoint',
  content: {
    title: 'title',
    body: 'body',
  },
});
```

#### Update method with type safety

 The `content` will be of type `Partial<Content>`, so you can enter only the items needed for the update.

```typescript
type Content = {
  title: string;
  body?: string;
};

client.update<Content>({
  endpoint: 'endpoint',
  content: {
    body: 'body',
  },
});
```

### CustomRequestInit

#### Next.js App Router

You can now use the fetch option of the Next.js App Router as CustomRequestInit.
Please refer to the official Next.js documentation as the available options depend on the Next.js Type file.

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
const response = await client.getObject({
  customRequestInit: {
    signal: controller.signal,
  },
  endpoint: 'config',
});

setTimeout(() => {
  controller.abort();
}, 1000);
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

#### Usage with a browser

```html
<script>
  const { createManagementClient } = microcms;
</script>
```

### Create client object

```javascript
const client = createManagementClient({
  serviceDomain: 'YOUR_DOMAIN', // YOUR_DOMAIN is the XXXX part of XXXX.microcms.io
  apiKey: 'YOUR_API_KEY',
});
```

### Upload media

Media files can be uploaded using the 'POST /api/v1/media' endpoint of the Management API.

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

#### Parameter type for uploadMedia method

```typescript
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

## Tips

### Separate API keys for read and write

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

## LICENSE

Apache-2.0
