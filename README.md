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
 *  publishedAt: string;
 *  revisedAt: string;
 *  text: string; // This is Content type.
 * } 
 */
client.getListDetail<Content>({ //other })

/**
 * // getObject response type
 * {
 *  createdAt: string;
 *  updatedAt: string;
 *  publishedAt: string;
 *  revisedAt: string;
 *  text: string; // This is Content type.
 * } 
 */
client.getObject<Content>({ //other })
```

# LICENSE

Apache-2.0
