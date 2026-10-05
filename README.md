# microCMS JavaScript SDK

[English README](README_en.md)

JavaScriptやNode.jsのアプリケーションからmicroCMSのAPIと簡単に通信できます。

<a href="https://discord.com/invite/K3DPqw4EJ2" target="_blank"><img src="https://img.shields.io/badge/Discord-%235865F2.svg?style=for-the-badge&logo=discord&logoColor=white" alt="Discord"></a>

## 保守方針

このSDKの現在の保守レベルは`Active`です。

詳細は[SDKの保守方針](https://document.microcms.io/manual/limitations#h8e929adf81)をご覧ください。

## 動作環境

- Node.js 18+（22+を推奨、ブラウザから利用する場合は不要）
- TypeScript6.0+（型を利用する場合）

## チュートリアル

まず簡単な組み込みを試したい場合は、公式の[JavaScriptチュートリアル](https://document.microcms.io/tutorial/javascript/javascript-top)を参照してください。ブラウザとNode.jsでの基本的な利用手順を確認できます。

## セットアップ

### インストール

#### Node.js

```bash
$ npm install microcms-js-sdk

または

$ yarn add microcms-js-sdk
```

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

TypeScriptでの型指定と推論は[TypeScript](#typescript)を参照してください。

### APIメソッド

以下の表は、microCMS JavaScript SDKの各メソッドがリスト形式のAPIまたはオブジェクト形式のAPI、どちらで使用できるかを示しています。

| メソッド         | リスト形式 | オブジェクト形式 |
| ---------------- | ---------- | ---------------- |
| getList          | ✅         |                  |
| getListDetail    | ✅         |                  |
| getObject        |            | ✅               |
| getAllContentIds | ✅         |                  |
| getAllContents   | ✅         |                  |
| create           | ✅         |                  |
| update           | ✅         | ✅               |
| delete           | ✅         |                  |

> [!NOTE]
> 汎用の取得メソッド`get`は非推奨です。`getList`・`getListDetail`・`getObject`を使用してください。スキーマを指定したクライアントでも、`get`の戻り値型は自動推論されません。

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
    },
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
    },
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

`alternateField`プロパティにフィールドIDを指定することで、コンテンツID以外のフィールドの値を全件取得できます。取得した値が文字列でない場合は、実行時にエラーになります。

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
    queries: {
      filters: 'createdAt[greater_than]2021-01-01T03:00:00.000Z',
      orders: '-createdAt',
    },
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
    isDraft: true,
  })
  .then((res) => console.log(res.id))
  .catch((err) => console.error(err));
```

#### 公開終了のステータスでコンテンツを登録

`isClosed`プロパティを使用することで、公開終了のステータスでコンテンツを登録できます。

> **注:** `isDraft` と `isClosed` は同時に `true` にできません。両方を `true` で渡すと、SDK はランタイムでエラーとして拒否します。`isClosed: true` を使う場合は、`isDraft` を省略、または `false` を設定してください。

```javascript
client
  .create({
    endpoint: 'endpoint',
    content: {
      title: 'タイトル',
      body: '本文',
    },
    isClosed: true,
  })
  .then((res) => console.log(res.id))
  .catch((err) => console.error(err));
```

#### 指定されたIDかつ公開終了のステータスでコンテンツを登録

`contentId`プロパティと`isClosed`プロパティを使用することで、指定されたIDかつ公開終了のステータスでコンテンツを登録できます。上記と同様、`isDraft` と `isClosed` を同時に `true` にすることはできません。

```javascript
client
  .create({
    endpoint: 'endpoint',
    contentId: 'contentId',
    content: {
      title: 'タイトル',
      body: '本文',
    },
    isClosed: true,
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

#### コンテンツの下書き更新

`isDraft` プロパティを指定することで、コンテンツを下書き状態で更新することができます。

```javascript
client
  .update({
    endpoint: 'endpoint',
    contentId: 'contentId',
    content: {
      title: 'タイトル',
    },
    isDraft: true,
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

補完や推論をエディタで試す場合は、[型付きクライアントの利用例](examples/README.md)を参照してください。

コンテンツAPIの型は、サービス全体のスキーマをクライアント生成時に指定する方法と、メソッドごとに型を指定する方法があります。取得クエリに対応したコンテンツ型だけを取り出すこともできます。

#### クライアント生成時にスキーマを指定する

[microcms-typegen](https://github.com/microcmsio/microcms-ts-typegen#readme)で作成したサービスのスキーマ型を渡すと、TypeScriptのコンパイル時に次の型検査・推論が利用できます。

- **入力の型検査**：登録済みのエンドポイントとAPI形式、静的に確定する`fields`のフィールドパスと`depth`の組み合わせを検査します。クエリの項目名、値の基本型、`depth`の範囲（0〜3）も検査します。
- **戻り値型の推論**：エンドポイントと`depth`・`fields`に応じて、`getList`、`getListDetail`、`getObject`、`getAllContents`の戻り値型を推論します。

以下は型生成器の設定が`services.main`の場合の例です。スキーマ型の名前はサービス名に応じて変わります。

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

##### 型検査・推論の対象外

以下の項目は型検査・推論には未対応です。今後対応を検討します。

| 項目 | 検査・推論しない内容 |
| --- | --- |
| `filters` | フィールド名・演算子・値の正しさ |
| `orders` | フィールド名・並び順指定の正しさ |
| `alternateField` | 指定先フィールドの存在と値の型 |
| `richEditorFormat: 'object'` | 戻り値型の自動推論。利用時はメソッドの型引数が必要（省略すると型エラー） |

#### メソッドごとに型を指定する

従来どおり、スキーマ型を渡さずにクライアントを作成し、読み取りメソッドの型引数を指定できます。型付きクライアントでも明示的なメソッド型引数を使用できます。この呼び出しではスキーマによる`depth`・`fields`の型推論より指定した型を優先します。指定した型と実際のレスポンスが一致するかは利用側で確認してください。

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

#### クエリに応じたコンテンツ型を取り出す

コンポーネントのpropsなどで、取得時と同じクエリに対応したコンテンツ1件の型が必要な場合は`InferMicroCMSContent`を使います。

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

このようにクエリを変数に分ける場合は、`as const`で`depth`と`fields`の具体的な値を保持します。`const queries = { ... }`だけでは`depth`は`number`、`fields`は`string[]`に広がります。メソッドへクエリを直接書く場合は`as const`は不要です。

`InferMicroCMSContent`だけで不正な`fields`の型を宣言しても、その場では型エラーにならず、結果は`unknown`です。同じクエリを型付きクライアントへ渡すと、静的に分かる誤記は呼び出し箇所で型エラーになります。

#### スキーマから書き込みデータの型を推論する

型生成器で作成した`MainServiceSchema`を指定すると、`create`・`update`の`endpoint`からフィールド名と値の型を推論します。参照はコンテンツID、画像とファイルはURL文字列を指定します。`create`・`delete`はリスト形式API、`update`はリスト形式・オブジェクト形式APIで利用できます。`delete`もエンドポイントを型検査します。

```ts
import { createClient } from 'microcms-js-sdk';
import type { MainServiceSchema } from './microcms-types';

const client = createClient<MainServiceSchema>({
  serviceDomain: 'YOUR_DOMAIN',
  apiKey: 'YOUR_API_KEY',
});

await client.create({
  endpoint: 'blogs',
  content: { title: 'タイトル', category: 'category-id' },
});
await client.update({
  endpoint: 'blogs',
  contentId: 'blog-id',
  content: { title: '更新したタイトル' },
});
await client.delete({ endpoint: 'blogs', contentId: 'blog-id' });
```

生成された入力型は`MainServiceSchema['blogs']['create']`や`MainServiceSchema['blogs']['update']`として取り出せます。

#### メソッドごとに書き込み型を指定する

従来の`create<Content>`・`update<Content>`も利用できます。型付きクライアントで明示すると、その呼び出しでは生成スキーマの書き込み型より指定した型を優先します。`create<Content>`は`Content`、`update<Content>`は`Partial<Content>`として`content`を検査します。指定した型とAPIスキーマの一致は利用側で確認してください。

```ts
type TitleOnly = { title: string };

await client.update<TitleOnly>({
  endpoint: 'blogs',
  contentId: 'blog-id',
  content: { title: '更新したタイトル' },
});
```

### ヒント

#### 読み取り用と書き込み用で別々のAPIキーを使用する

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

#### メディアアップロードの引数

マネジメントAPIの`uploadMedia`は、次の形式のデータを受け取ります。

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

## エラーハンドリング

コンテンツAPIとマネジメントAPIのどちらでも、SDKが生成したリクエストエラーは通常の`Error`として扱えます。`console.error(error)`でエラーメッセージとスタックトレースを出力でき、HTTPエラーの場合はHTTPステータスとAPIから返されたエラーメッセージも含まれます。

SDKが生成したリクエストエラーは、両クライアントで共通の`isMicroCMSRequestError`を使って判定できます。判定後は`status`、`url`、`originalError`を個別に参照できます。以下はコンテンツAPIの例です。マネジメントAPIの`uploadMedia`でも、microCMSへのリクエストでSDKが生成したエラーは同様に判定できます。

```typescript
import { createClient, isMicroCMSRequestError } from 'microcms-js-sdk';

const client = createClient({
  serviceDomain: 'serviceDomain',
  apiKey: 'apiKey',
});

try {
  await client.getList({ endpoint: 'blog' });
} catch (error) {
  // エラーメッセージとスタックトレースを出力します
  console.error(error);

  if (isMicroCMSRequestError(error)) {
    // 必要に応じてリクエストに関する追加情報を参照できます
    console.log(error.status);
    console.log(error.url);
    console.log(error.originalError);
  }
}
```

| プロパティ      | HTTPエラー           | ネットワークエラー    |
| --------------- | -------------------- | --------------------- |
| `status`        | HTTPステータスコード | `undefined`           |
| `url`           | リクエスト先URL      | リクエスト先URL       |
| `originalError` | `undefined`          | `fetch`が投げた元の値 |

`uploadMedia`の引数検証やアップロード元URLの取得で起きたエラーは、microCMSへのリクエスト前に発生するため、`isMicroCMSRequestError`で判定できない場合があります。

`url`に`draftKey`が含まれる場合、その値は`***`にマスクされます。リクエストヘッダー、リクエストボディ、`Response`オブジェクトはエラーへ追加されません。

`originalError`の内容はNode.js、ブラウザ、Edge Runtimeなどの実行環境によって異なり、SDKとして形式を保証しません。

追加されるプロパティは非列挙です。そのため、既存の`message`、`toString()`、`Object.keys()`、`JSON.stringify()`の結果には影響しません。

## 開発者向け情報

SDKの開発環境・テスト・fixture・CIについては、[開発ガイド](DEVELOPMENT.md)を参照してください。

## ライセンス

Apache-2.0
