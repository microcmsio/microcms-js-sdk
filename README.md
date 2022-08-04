# microCMS JavaScript SDK

It helps you to use microCMS from JavaScript and Node.js applications.

## Getting Started

### Install

Install npm package.

```bash
$ npm install microcms-js-sdk

or

$ yarn add microcms-js-sdk
```

CDN support.

```
<script src="https://unpkg.com/microcms-js-sdk@latest/dist/umd/microcms-js-sdk.js"></script>
```

### How to use

First, create a client.

```javascript
const { createClient } = require("microcms-js-sdk"); // CommonJS
import { createClient } from 'microcms-js-sdk'; //ES6

// Initialize Client SDK.
const client = createClient({
  serviceDomain: "YOUR_DOMAIN", // YOUR_DOMAIN is the XXXX part of XXXX.microcms.io
  apiKey: "YOUR_API_KEY",
});
```

When using with a browser.

```html
<script>
const { createClient } = microcms;

// Initialize Client SDK.
const client = createClient({
  serviceDomain: "YOUR_DOMAIN", // YOUR_DOMAIN is the XXXX part of XXXX.microcms.io
  apiKey: "YOUR_API_KEY",
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
  .catch((err) => console.log(err));

client
  .get({
    endpoint: 'endpoint',
    contentId: 'contentId',
    queries: { fields: 'title,publishedAt' },
  })
  .then((res) => console.log(res))
  .catch((err) => console.log(err));
```

And, Api corresponding to each content are also available. example.

```javascript
// Get list API data
client
  .getList({
    endpoint: 'endpoint',
  })
  .then((res) => console.log(res))
  .catch((err) => console.log(err));

// Get list API detail data
client
  .getListDetail({
    endpoint: 'endpoint',
    contentId: 'contentId',
  })
  .then((res) => console.log(res))
  .catch((err) => console.log(err));

// Get object API data
client
  .getObject({
    endpoint: 'endpoint',
  })
  .then((res) => console.log(res))
  .catch((err) => console.log(err));
```

#### WRITE API

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
  .catch((err) => console.log(err));

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
  .catch((err) => console.log(err));
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
  .catch((err) => console.log(err));

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
  .catch((err) => console.log(err));

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
  .catch((err) => console.log(err));

// Update object form content
client
  .update({
    endpoint: 'endpoint',
    content: {
      title: 'title',
    },
  })
  .then((res) => console.log(res.id))
  .catch((err) => console.log(err));

// Delete content
client
  .delete({
    endpoint: 'endpoint',
    contentId: 'contentId',
  })
  .catch((err) => console.log(err));
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
 *  contents: Content; // This is Content type
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

Write functions can also be performed type-safely.

```typescript
type Content = {
  title: string
  body?: string
}

client.create<Content>({
  endpoint: 'endpoint',
  // Since `content` will be of type `Content`, no required fields will be missed.
  content: {
    title: 'title',
    body: 'body',
  },
})

client.update<Content>({
  endpoint: 'endpoint',
  // The `content` will be of type `Partial<Content>`, so you can enter only the items needed for the update.
  content: {
    body: 'body',
  },
})
```

## Tips

### Separate API keys for read and write

```javascript
const readClient = createClient({
  serviceDomain: 'serviceDomain',
  apiKey: 'readApiKey',
})
const writeClient = createClient({
  serviceDomain: 'serviceDomain',
  apiKey: 'writeApiKey',
})
```

# LICENSE

Apache-2.0
