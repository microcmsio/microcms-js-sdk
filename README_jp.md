# microCMS JavaScript SDK

[English README](README.md)

JavaScriptやNode.jsのアプリケーションからmicroCMSのAPIと簡単に通信できます。

<a href="https://discord.com/invite/K3DPqw4EJ2" target="_blank"><img src="https://img.shields.io/badge/Discord-%235865F2.svg?style=for-the-badge&logo=discord&logoColor=white" alt="Discord"></a>

## チュートリアル

公式ドキュメントの [チュートリアル](https://document.microcms.io/tutorial/javascript/javascript-top)をご覧ください。

## はじめに

### インストール

#### Node.js

```bash
$ npm install microcms-js-sdk

または

$ yarn add microcms-js-sdk
```

> [!IMPORTANT]
> v3.0.0以上を使用する場合は、Node.jsのv18以上が必要です。

#### ブラウザ（セルフホスティング）

[リリースページ](https://github.com/microcmsio/microcms-js-sdk/releases)から`microcms-js-sdk-x.y.z.tgz`をダウンロードして解凍してください。その後、お好みのサーバーにアップロードして使用してください。対象ファイルは `./dist/umd/microcms-js-sdk.js` です。

```html
<script src="./microcms-js-sdk.js"></script>
```

#### ブラウザ（CDN）

外部プロバイダーが提供するURLを読み込んでご利用ください。

```html
<script src="https://cdn.jsdelivr.net/npm/microcms-js-sdk@3.1.1/dist/umd/microcms-js-sdk.min.js"></script>
```

または

```html
<script src="https://cdn.jsdelivr.net/npm/microcms-js-sdk/dist/umd/microcms-js-sdk.min.js"></script>
```

> [!WARNING]
> ホスティングサービス（cdn.jsdelivr.net）はmicroCMSとは関係ありません。本番環境でのご利用には、お客様のサーバーでのセルフホスティングをお勧めします。

## コンテンツAPI

### インポート

#### Node.js

```javascript
const { createClient } = require('microcms-js-sdk'); // CommonJS
```

または

```javascript
import { createClient } from 'microcms-js-sdk'; //ES6
```

#### ブラウザ

```html
<script>
  const { createClient } = microcms;
</script>
```

### クライアントオブジェクトの作成

```javascript
// クライアントオブジェクトを作成します。
const client = createClient({
  serviceDomain: 'YOUR_DOMAIN', // YOUR_DOMAINはXXXX.microcms.ioのXXXXの部分です。
  apiKey: 'YOUR_API_KEY',
  // retry: true // 最大2回まで再試行します。
});
```

### APIメソッド

以下の表は、microCMS JavaScript SDKの各メソッドがリスト形式のAPIまたはオブジェクト形式のAPI、どちらで使用できるかを示しています。

| メソッド            | リスト形式 | オブジェクト形式 |
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
> - 「リスト形式」の✔️は、APIの型がリスト形式に設定されている場合に使用できるメソッドを示します。
> - 「オブジェクト形式」の✔️は、APIの型がオブジェクト形式に設定されている場合に使用できるメソッドを示します。

### コンテンツ一覧の取得

`getList`メソッドは、指定されたエンドポイントからコンテンツ一覧を取得するために使用します。

```javascript
client
  .getList({
    endpoint: 'endpoint',
  })
  .then((res) => console.log(res))
  .catch((err) => console.error(err));
```

#### queriesプロパティを使用したコンテンツ一覧の取得

`queries`プロパティを使用して、特定の条件に一致するコンテンツ一覧を取得できます。利用可能な各プロパティの詳細については、[microCMSのドキュメント](https://document.microcms.io/content-api/get-list-contents#h929d25d495)を参照してください。

```javascript
client
  .getList({
    endpoint: 'endpoint',
    queries: {
      draftKey: 'abcd',
      limit: 100,
      offset: 1,
      orders: 'createdAt',
      q: 'こんにちは',
      fields: 'id,title',
      ids: 'foo',
      filters: 'publishedAt[greater_than]2021-01-01T03:00:00.000Z',
      depth: 1,
    }
  })
  .then((res) => console.log(res))
  .catch((err) => console.error(err));
```

### 単一コンテンツの取得

`getListDetail`メソッドは、指定されたエンドポイントから、IDで指定された単一コンテンツを取得するために使用します。

```javascript
client
  .getListDetail({
    endpoint: 'endpoint',
    contentId: 'contentId',
  })
  .then((res) => console.log(res))
  .catch((err) => console.error(err));
```

#### queriesプロパティを使用した単一コンテンツの取得

`queries`プロパティを使用して、特定の条件に一致する単一コンテンツを取得できます。利用可能な各プロパティの詳細については、[microCMSのドキュメント](https://document.microcms.io/content-api/get-content#h929d25d495)を参照してください。

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

### オブジェクト形式のコンテンツの取得

`getObject`メソッドは、指定されたエンドポイントからオブジェクト形式のコンテンツを取得するために使用します。

```javascript
client
  .getObject({
    endpoint: 'endpoint',
  })
  .then((res) => console.log(res))
  .catch((err) => console.error(err));
```

### コンテンツIDの全件取得

`getAllContentIds`メソッドは、指定されたエンドポイントからコンテンツIDのみを全件取得するために使用します。

```javascript
client
  .getAllContentIds({
    endpoint: 'endpoint',
  })
  .then((res) => console.log(res))
  .catch((err) => console.error(err));
```

#### filtersプロパティを使用したコンテンツIDの全件取得

`filters`プロパティを使用することで、条件に一致するコンテンツIDを全件取得できます。

```javascript
client
  .getAllContentIds({
    endpoint: 'endpoint',
    filters: 'category[equals]uN28Folyn',
  })
  .then((res) => console.log(res))
  .catch((err) => console.error(err));
```

#### 下書き中のコンテンツのIDを全件取得

`draftKey`プロパティを使用することで、下書き中のコンテンツのIDを全件取得できます。

```javascript
client
  .getAllContentIds({
    endpoint: 'endpoint',
    draftKey: 'draftKey',
  })
  .then((res) => console.log(res))
  .catch((err) => console.error(err));
```

#### コンテンツID以外のフィールドの値を全件取得

`alternateField`プロパティにフィールドIDを指定することで、コンテンツID以外のフィールドの値を全件取得できます。

```javascript
client
  .getAllContentIds({
    endpoint: 'endpoint',
    alternateField: 'url',
  })
  .then((res) => console.log(res))
  .catch((err) => console.error(err));
```

### コンテンツの全件取得

`getAllContents`メソッドは、指定されたエンドポイントから、コンテンツを全件取得するために使用します。

```javascript
client
  .getAllContents({
    endpoint: 'endpoint',
  })
  .then((res) => console.log(res))
  .catch((err) => console.error(err));
```

#### queriesプロパティを使用したコンテンツの全件取得

`queries`プロパティを使用して、特定の条件に一致するすべてのコンテンツを取得できます。利用可能な各プロパティの詳細については、[microCMSのドキュメント](https://document.microcms.io/content-api/get-list-contents#h929d25d495)を参照してください。

```javascript
client
  .getAllContents({
    endpoint: 'endpoint',
    queries: { filters: 'createdAt[greater_than]2021-01-01T03:00:00.000Z', orders: '-createdAt' },
  })
  .then((res) => console.log(res))
  .catch((err) => console.error(err));
```

### コンテンツの登録

`create`メソッドは指定されたエンドポイントにコンテンツを登録するために使用します。

```javascript
client
  .create({
    endpoint: 'endpoint',
    content: {
      title: 'タイトル',
      body: '本文',
    },
  })
  .then((res) => console.log(res.id))
  .catch((err) => console.error(err));
```

#### IDを指定してコンテンツを登録

`contentId`プロパティを使用することで、指定されたIDでコンテンツを登録できます。

```javascript
client
  .create({
    endpoint: 'endpoint',
    contentId: 'contentId',
    content: {
      title: 'タイトル',
      body: '本文',
    },
  })
  .then((res) => console.log(res.id))
  .catch((err) => console.error(err));
```

#### 下書き中のステータスでコンテンツを登録

`isDraft`プロパティを使用することで、下書き中のステータスでコンテンツを登録できます。

```javascript
client
  .create({
    endpoint: 'endpoint',
    content: {
      title: 'タイトル',
      body: '本文',
    },
    // 有料プランから利用可能
    // https://microcms.io/pricing
    isDraft: true,
  })
  .then((res) => console.log(res.id))
  .catch((err) => console.error(err));
```

#### 指定されたIDかつ下書き中のステータスでコンテンツを登録

`contentId`プロパティと`isDraft`プロパティを使用することで、指定されたIDかつ下書き中のステータスでコンテンツを登録できます。

```javascript
client
  .create({
    endpoint: 'endpoint',
    contentId: 'contentId',
    content: {
      title: 'タイトル',
      body: '本文',
    },
    // 有料プランから利用可能
    // https://microcms.io/pricing
    isDraft: true,
  })
  .then((res) => console.log(res.id))
  .catch((err) => console.error(err));
```

### コンテンツの編集

`update`メソッドは特定のコンテンツを編集するために使用します。

```javascript
client
  .update({
    endpoint: 'endpoint',
    contentId: 'contentId',
    content: {
      title: 'タイトル',
    },
  })
  .then((res) => console.log(res.id))
  .catch((err) => console.error(err));
```

#### オブジェクト形式のコンテンツの編集

APIの型がオブジェクト形式のコンテンツを編集する場合は、`contentId`プロパティを使用せずに、エンドポイントのみを指定します。

```javascript
client
  .update({
    endpoint: 'endpoint',
    content: {
      title: 'タイトル',
    },
  })
  .then((res) => console.log(res.id))
  .catch((err) => console.error(err));
```

### コンテンツの削除

`delete`メソッドは指定されたエンドポイントから特定のコンテンツを削除するために使用します。

```javascript
client
  .delete({
    endpoint: 'endpoint',
    contentId: 'contentId',
  })
  .catch((err) => console.error(err));
```

### TypeScript

`getList`メソッド、`getListDetail`メソッド、`getObject`メソッドはデフォルトのレスポンスの型を定義しています。

#### getListメソッドのレスポンスの型

```typescript
type Content = {
  text: string,
};
/**
 * {
 *  contents: Content[]; // 設定したスキーマの型を格納する配列
 *  totalCount: number;
 *  limit: number;
 *  offset: number;
 * }
 */
client.getList<Content>({ /* その他のプロパティ */ })
```

#### getListDetailメソッドのレスポンスの型

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
 *  text: string; // 設定したスキーマの型
 * }
 */
client.getListDetail<Content>({ /* その他のプロパティ */ })
```

#### getObjectメソッドのレスポンスの型

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
 *  text: string; // 設定したスキーマの型
 * }
 */
client.getObject<Content>({ /* その他のプロパティ */ })
```

#### getAllContentIdsメソッドのレスポンスの型

```typescript
/**
 * string[]
 */
client.getAllContentIds({ /* その他のプロパティ */ })
```

#### 型安全なコンテンツの登録

`content`の型は`Content`であるため、型安全なコンテンツの登録が可能です。

```typescript
type Content = {
  title: string;
  body?: string;
};

client.create<Content>({
  endpoint: 'endpoint',
  content: {
    title: 'タイトル',
    body: '本文',
  },
});
```

#### 型安全なコンテンツの編集

`content`は`Partial<Content>`型であるため、編集したいプロパティだけを渡せます。

```typescript
type Content = {
  title: string;
  body?: string;
};

client.update<Content>({
  endpoint: 'endpoint',
  content: {
    body: '本文',
  },
});
```

### CustomRequestInit

#### Next.js App Router

Next.jsのApp Routerで利用されるfetchのcacheオプションを指定できます。

指定可能なオプションは、Next.jsの公式ドキュメントを参照してください。

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

#### AbortController: abortメソッド

fetchリクエストを中断できます。

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

## マネジメントAPI

### インポート

#### Node.js

```javascript
const { createManagementClient } = require('microcms-js-sdk'); // CommonJS
```

または

```javascript
import { createManagementClient } from 'microcms-js-sdk'; //ES6
```

#### ブラウザ

```html
<script>
  const { createManagementClient } = microcms;
</script>
```

### クライアントオブジェクトの作成

```javascript
const client = createManagementClient({
  serviceDomain: 'YOUR_DOMAIN', // YOUR_DOMAINはXXXX.microcms.ioのXXXXの部分です。
  apiKey: 'YOUR_API_KEY',
});
```

### メディアのアップロード

メディアに画像やファイルをアップロードできます。

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
    // name: 'image.png', ← 任意
  })
  .then((res) => console.log(res))
  .catch((err) => console.error(err));
```

#### ブラウザ

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
    // name: 'image.png', ← 任意
  })
  .then((res) => console.log(res))
  .catch((err) => console.error(err));
```

### TypeScript

#### uploadMediaメソッドのパラメータの型

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

## ヒント

### 読み取り用と書き込み用で別々のAPIキーを使用する

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

## ライセンス

Apache-2.0
