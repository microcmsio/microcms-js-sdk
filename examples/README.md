# 型付きクライアントの利用例

読み取り・書き込み・型抽出の補完や戻り値を、VS Codeなどのエディタで確認できます。生成済みのスキーマを同梱しているため、typegenの実行やAPIキーは不要です。

## エディタで試す

SDKのリポジトリのルートで実行します。

```sh
npm ci
npm run build
code examples
```

このディレクトリの`tsconfig.json`は、SDK自身の`package.json`が指定するビルド済みの公開型定義を参照します。別のSDKをインストールする必要はありません。ビルドとコマンドでの型チェックには、リポジトリの開発用TypeScript7系を使用します。利用者向けのTypeScript6.0以降への対応もCIで検査しています。

まず[READMEのTypeScript節](../README.md#typescript)を読み、各ファイルのクエリや入力値を変更して試してください。クライアントにはダミーのAPIキーを設定しています。取得・書き込み関数は実行せず、エディタで型を確認します。

## 型を試すファイル

確認用のコードは`usage/`にまとめています。設定は`tsconfig.json`、生成済みの型は`generated/`に置いています。

| ファイル                                             | 確認すること                                       |
| ---------------------------------------------------- | -------------------------------------------------- |
| [usage/read.ts](usage/read.ts)                       | 読み取りの戻り値と、`depth`・`fields`に応じた型    |
| [usage/write.ts](usage/write.ts)                     | `create`・`update`の入力の補完と書き込み型         |
| [usage/type-extraction.ts](usage/type-extraction.ts) | `InferMicroCMSContent`で取り出した型をpropsに使う  |
| [usage/errors.ts](usage/errors.ts)                   | `@ts-expect-error`を外し、不正な指定のエラーを確認 |
| [usage/scratch.ts](usage/scratch.ts)                 | エンドポイントやクエリを自由に変えて試す           |
| [usage/shared/queries.ts](usage/shared/queries.ts)   | `fields`の補完と、取得処理・型抽出で共用するクエリ |

`fieldsWithCompletion`は選べるフィールドパスの補完を試す変数です。`queries`は読み取り例と型抽出例で共用し、`as const`で選んだ`fields`と`depth`を保持しています。

## 生成済みのスキーマ

[generated/microcms-types.ts](generated/microcms-types.ts)は、microcms-typegenで生成したサンプル用サービスの型です。4つのエンドポイントの型と、サービス全体を表す`ExampleServiceSchema`を含みます。

| エンドポイント | API形式          | 例で確認すること                              |
| -------------- | ---------------- | --------------------------------------------- |
| `banner`       | オブジェクト形式 | `getObject`、IDの有無、`update`               |
| `blogs`        | リスト形式       | `categories`への参照、`create`・`update`      |
| `categories`   | リスト形式       | 参照先の`name`                                |
| `all_fields`   | リスト形式       | 多様なフィールドの読み書き、`fields`・`depth` |

型生成の設定方法は[typegenのREADME](https://github.com/microcmsio/microcms-ts-typegen#設定ファイル)、入力スキーマと生成結果は[typegenのサンプル](https://github.com/microcmsio/microcms-ts-typegen/tree/main/examples)を参照してください。

## コマンドで型チェックする

SDKのリポジトリのルートで実行します。

```sh
npm run typecheck:examples
```

TypeScriptコンパイラが型の整合性を検査します。JavaScriptの出力やAPIリクエストの実行は行いません。CIと`npm run test:types`でも利用例を検査します。
