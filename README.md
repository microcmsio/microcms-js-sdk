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
  globalDraftKey: "YOUR_GLOBAL_DRAFT_KEY", // If need 
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
  globalDraftKey: "YOUR_GLOBAL_DRAFT_KEY", // If need 
});
</script>
```

After, How to use it below.

```javascript
client
  .get({
    endpoint: 'endpoint',
    queries: { limit: 20, filters: 'createdAt[greater_than]2021' },
    useGlobalDraftKey: false, // This is an option if your have set the globalDraftKey. Default value true.
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

If you are using TypeScript, specify the response type.

```typescript
client.get<ResponseType>({endpoint: 'endpoint'})
```

# LICENSE

Apache-2.0
