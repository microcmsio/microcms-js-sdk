# microCMS JavaScript SDK

It helps you to use microCMS from JavaScript and Node.js applications.

<a href="https://discord.com/invite/K3DPqw4EJ2" target="_blank"><img src="https://img.shields.io/badge/Discord-%235865F2.svg?style=for-the-badge&logo=discord&logoColor=white" alt="Discord"></a>

## Getting Started

### Install

Install npm package.

> [!IMPORTANT]
> v3.0.0 or later requires Node.js **v18 or higher**.

```bash
$ npm install microcms-js-sdk

or

$ yarn add microcms-js-sdk
```

CDN support.

```html
<script src="https://unpkg.com/microcms-js-sdk@latest/dist/umd/microcms-js-sdk.js"></script>

or

<script src="https://unpkg.com/microcms-js-sdk@2.7.0/dist/umd/microcms-js-sdk.js"></script>
```

### How to use

First, create a client.

```javascript
const { createClient } = require('microcms-js-sdk'); // CommonJS
import { createClient } from 'microcms-js-sdk'; //ES6

// Initialize Client SDK.
const client = createClient({
  serviceDomain: 'YOUR_DOMAIN', // YOUR_DOMAIN is the XXXX part of XXXX.microcms.io
  apiKey: 'YOUR_API_KEY',
  // retry: true // Retry attempts up to a maximum of two times.
});
```

When using with a browser.

```html
<script>
  const { createClient } = microcms;

  // Initialize Client SDK.
  const client = createClient({
    serviceDomain: 'YOUR_DOMAIN', // YOUR_DOMAIN is the XXXX part of XXXX.microcms.io
    apiKey: 'YOUR_API_KEY',
    // retry: true // Retry attempts up to a maximum of two times.
  });
</script>
```

After, How to use `get` it below.

```javascript
client
  .get({
    endpoint: 'endpoint',
    queries: { limit: 20, filters: 'createdAt[greater_than]2021' },
  })
  .then((res) => console.log(res))
  .catch((err) => console.error(err));

client
  .get({
    endpoint: 'endpoint',
    contentId: 'contentId',
    queries: { fields: 'title,publishedAt' },
  })
  .then((res) => console.log(res))
  .catch((err) => console.error(err));
```

And, Api corresponding to each content are also available. example.

```javascript
// Get list API data
client
  .getList({
    endpoint: 'endpoint',
  })
  .then((res) => console.log(res))
  .catch((err) => console.error(err));

// Get list API detail data
client
  .getListDetail({
    endpoint: 'endpoint',
    contentId: 'contentId',
  })
  .then((res) => console.log(res))
  .catch((err) => console.error(err));

// Get object API data
client
  .getObject({
    endpoint: 'endpoint',
  })
  .then((res) => console.log(res))
  .catch((err) => console.error(err));
```

#### Get all content ids

This function can be used to retrieve all content IDs only.  
Since `filters` and `draftKey` can also be specified, it is possible to retrieve only the content IDs for a specific category, or to include content from a specific draft. \
The `alternateField` property can also be used to address cases where the value of a field other than content ID is used in a URL, etc.

```javascript
client
  .getAllContentIds({
    endpoint: 'endpoint',
  })
  .then((res) => console.log(res))
  .catch((err) => console.error(err));

// Get all content ids with filters
client
  .getAllContentIds({
    endpoint: 'endpoint',
    filters: 'category[equals]uN28Folyn',
  })
  .then((res) => console.log(res))
  .catch((err) => console.error(err));

// Get all content ids with draftKey
client
  .getAllContentIds({
    endpoint: 'endpoint',
    draftKey: 'draftKey',
  })
  .then((res) => console.log(res))
  .catch((err) => console.error(err));

// Get all content ids with alternateField
client
  .getAllContentIds({
    endpoint: 'endpoint',
    alternateField: 'url',
  })
  .then((res) => console.log(res))
  .catch((err) => console.error(err));
```

#### Get all contents

This function can be used to retrieve all content data.

```javascript
client
  .getAllContents({
    endpoint: 'endpoint',
  })
  .then((res) => console.log(res))
  .catch((err) => console.error(err));

// with queries
client
  .getAllContents({
    endpoint: 'endpoint',
    queries: { filters: 'createdAt[greater_than]2021', orders: '-createdAt' },
  })
  .then((res) => console.log(res))
  .catch((err) => console.error(err));
```

#### CREATE API

The following is how to use the write system when making a request to the write system API.

```javascript
// Create content
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

// Create content with specified ID
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
// Create draft content
client
  .create({
    endpoint: 'endpoint',
    content: {
      title: 'title',
      body: 'body',
    },
    // Available with microCMS paid plans
    // https://microcms.io/pricing
    isDraft: true,
  })
  .then((res) => console.log(res.id))
  .catch((err) => console.error(err));

// Create draft content with specified ID
client
  .create({
    endpoint: 'endpoint',
    contentId: 'contentId',
    content: {
      title: 'title',
      body: 'body',
    },
    // Available with microCMS paid plans
    // https://microcms.io/pricing
    isDraft: true,
  })
  .then((res) => console.log(res.id))
  .catch((err) => console.error(err));
```

### UPDATE API

```javascript
// Update content
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

// Update object form content
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

### DELETE API

```javascript
// Delete content
client
  .delete({
    endpoint: 'endpoint',
    contentId: 'contentId',
  })
  .catch((err) => console.error(err));
```

### TypeScript

If you are using TypeScript, use `getList`, `getListDetail`, `getObject`. This internally contains a common type of content.

```typescript
// Type definition
type Content = {
  text: string,
}

/**
 * // getList response type
 * {
 *  contents: Content[]; // This is array type of Content
 *  totalCount: number;
 *  limit: number;
 *  offset: number;
 * }
 */
client.getList<Content>({ //other })

/**
 * // getListDetail response type
 * {
 *  id: string;
 *  createdAt: string;
 *  updatedAt: string;
 *  publishedAt?: string;
 *  revisedAt?: string;
 *  text: string; // This is Content type.
 * }
 */
client.getListDetail<Content>({ //other })

/**
 * // getObject response type
 * {
 *  createdAt: string;
 *  updatedAt: string;
 *  publishedAt?: string;
 *  revisedAt?: string;
 *  text: string; // This is Content type.
 * }
 */
client.getObject<Content>({ //other })
```

The type of `getAllContentIds` is as follows.

```typescript
/**
 * // getAllContentIds response type
 * string[] // This is array type of string
 */
client.getAllContentIds({ //other })
```

Write functions can also be performed type-safely.

```typescript
type Content = {
  title: string;
  body?: string;
};

client.create<Content>({
  endpoint: 'endpoint',
  // Since `content` will be of type `Content`, no required fields will be missed.
  content: {
    title: 'title',
    body: 'body',
  },
});

client.update<Content>({
  endpoint: 'endpoint',
  // The `content` will be of type `Partial<Content>`, so you can enter only the items needed for the update.
  content: {
    body: 'body',
  },
});
```

## CustomRequestInit

### Next.js App Router

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

### AbortController: abort() method

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

Clients can be created for the Management API.

### How to use

First, create a client.

```javascript
import { createManagementClient } from 'microcms-js-sdk'; //ES6

// Initialize Client SDK.
const client = createManagementClient({
  serviceDomain: 'YOUR_DOMAIN', // YOUR_DOMAIN is the XXXX part of XXXX.microcms.io
  apiKey: 'YOUR_API_KEY',
});
```

### UploadMedia API

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

### Type Definition

#### UploadMedia

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

# LICENSE

Apache-2.0
