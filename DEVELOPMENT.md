# 開発ガイド

利用者向けのAPI仕様は[README](README.md)、補完・推論をエディタで試す方法は[examples](examples/README.md)を参照してください。

## 開発・検証コマンド

`.node-version`のNode.jsを使用し、リポジトリのルートで実行します。

```sh
npm ci
npm run build
```

| コマンド                             | 確認すること                                                      |
| ------------------------------------ | ----------------------------------------------------------------- |
| `npm run format` / `npm run lint`    | Prettier・Oxlintによる検査。自動修正はそれぞれ`:fix`              |
| `npm run typecheck`                  | SDKの実装・単体テストの型検査                                     |
| `npm test` / `npm run test:coverage` | Jestによる実行時テスト／カバレッジ下限の検査                      |
| `npm run typecheck:schema`           | ソースの公開APIによる型検査                                       |
| `npm run typecheck:dist`             | ビルド済みの公開型定義による型検査                                |
| `npm run typecheck:examples`         | ビルド済みの公開型定義で利用例を検査                              |
| `npm run test:types`                 | 公開API・配布型・利用例・回帰テスト・生成型との連携をまとめて検査 |
| `npm run test:performance`           | 保存済み生成型による推論・型抽出の性能測定                        |

`typecheck:dist`・`typecheck:examples`・`test:types`・`test:performance`はビルド後に実行します。JavaScriptはtsupでES5・CommonJS・ES modules・ブラウザ向け形式へ、公開型定義は`tsconfig.declarations.json`と`scripts/finish-declarations.mjs`で`dist/`へ生成します。

開発用TypeScriptは7系、利用者向けの対応範囲は6.0以降です。CIでは6.0.2でも`test:types`を実行します。検証用コンパイラの切り替えには`MICROCMS_TYPESCRIPT_BINARY`へ`tsc`の絶対パスを指定します（ビルド・`typecheck`・エディタのコンパイラは変わりません）。

## 検証パターンと対応するテスト

### 実行時の処理

通信は[MSWのハンドラー](tests/mocks/handlers.ts)またはテスト内の`fetch`モックを使用し、実サービスへリクエストしません。

| パターン                                                                                           | 対応するテスト                                                                                                                                                       |
| -------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| クライアントの設定検査、認証ヘッダー、HTTP／ネットワークエラー、JSON解析エラー、リトライ           | [createClient.test.ts](tests/createClient.test.ts)、[fetch.test.ts](tests/lib/fetch.test.ts)、[error.test.ts](tests/lib/error.test.ts)                               |
| `get`・リスト・詳細・オブジェクト取得のURL・クエリ・戻り値、必須引数                               | [get.test.ts](tests/get.test.ts)、[readMethods.test.ts](tests/readMethods.test.ts)                                                                                   |
| 全件・全ID取得、空結果、ページング途中の件数減少、`alternateField`の文字列検査                     | [getAllContents.test.ts](tests/getAllContents.test.ts)、[getAllContentIds.test.ts](tests/getAllContentIds.test.ts)、[readMethods.test.ts](tests/readMethods.test.ts) |
| 作成・更新・削除、IDの有無、リスト／オブジェクト更新、公開状態                                     | [write.test.ts](tests/write.test.ts)、[createClient.test.ts](tests/createClient.test.ts)                                                                             |
| `requestInit`の反映、クエリの配列・省略・0・特殊文字、値の判定                                     | [requestInit.test.ts](tests/requestInit.test.ts)、[parseQuery.test.ts](tests/utils/parseQuery.test.ts)、[isCheckValue.test.ts](tests/utils/isCheckValue.test.ts)     |
| マネジメントAPIの設定・エラー、Blob／File／ストリーム／URLからのアップロード、名前・MIME・バイト列 | [createManagementClient.test.ts](tests/createManagementClient.test.ts)、[uploadMedia.test.ts](tests/uploadMedia.test.ts)                                             |

### 公開型・推論・入力制約

以下はTypeScriptによる検査です。クライアント呼び出しは実行しません。正常系は戻り値型の一致、異常系は対象の呼び出しで型エラーになることを確認します。

| パターン                                                                                                       | 使用データ                               | 対応するテスト                                                                                                   |
| -------------------------------------------------------------------------------------------------------------- | ---------------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| エンドポイントとAPI形式、`contentId`の要否、従来genericsとの互換性                                             | テスト内の手書きスキーマ                 | [typedSchema.typecheck.ts](tests/typedSchema.typecheck.ts)、[typedSchema.matrix.ts](tests/typedSchema.matrix.ts) |
| `fields`の文字列・配列・`as const`・動的値、`depth: 0`〜`3`・省略・union、変数経由の入力、全件取得の禁止クエリ | 同上                                     | 同上                                                                                                             |
| `InferMicroCMSContent`、共通メタデータ、書き込みの未知キー・型・ネスト・unionの制約                            | 同上                                     | 同上                                                                                                             |
| `fields`・`depth`による戻り値と実レスポンスの一致、選択キーの集合、抽出型との一致、不正なレスポンスの拒否      | 下表の実APIデータと生成型                | [generatedSchema.integration.mjs](tests/generatedSchema.integration.mjs)                                         |
| 多段・循環参照の深さと選択、3層ネスト内の参照・拡張データ、選択・型抽出・書き込み                              | 下表の`tree`・`matrix`生成型と利用コード | [generatedRelations.integration.mjs](tests/generatedRelations.integration.mjs)                                   |
| 利用者向けの読み取り・書き込み・型抽出・型エラーの例                                                           | [examples](examples/README.md)           | `typecheck:examples`（`test:types`にも含む）                                                                     |

`typedSchema.matrix.ts`は同じケースをソースから抽出した公開型／ビルド済み配布型と、`exactOptionalPropertyTypes`の有効／無効で検査します。`test:types`は上記すべてを選択したコンパイラで実行します。

### 生成型・保存データとの対応

下表のfixtureは`tests/fixtures/typegen/`内です。生成型は保存済みで、SDKのテストにはtypegenや隣接リポジトリは不要です。

| データ                                                                                                                                                                                                              | 用途・対応する検証                                                                                                                                                           |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [schemas.json](tests/fixtures/typegen/schemas.json)、[examplesの生成型](examples/generated/microcms-types.ts)                                                                                                       | リスト／オブジェクトのAPI形式とフィールド定義。`generatedSchema.integration.mjs`で推論・選択キーを検査                                                                       |
| [responses.json](tests/fixtures/typegen/responses.json)                                                                                                                                                             | 通常取得・`fields`・`depth`別の実レスポンス、各フィールドの値あり・空値、5種類の繰り返し要素。同テストで推論型へ代入し、メタデータ・値・選択肢・未選択フィールドの改変を拒否 |
| [writes.json](tests/fixtures/typegen/writes.json)、[lifecycle.json](tests/fixtures/typegen/lifecycle.json)                                                                                                          | 作成・更新入力と、作成・更新・削除のリクエスト・結果。同テストで書き込み型と戻り値型を検査（操作は再実行しない）                                                             |
| [generated/with-extensions.ts](tests/fixtures/typegen/generated/with-extensions.ts)、[extensions.ts](tests/fixtures/typegen/generated/extensions.ts)                                                                | ユーザー定義の拡張`data`型。同テストで実レスポンスとの一致・不正なread/writeの拒否                                                                                           |
| [generated/tree.ts](tests/fixtures/typegen/generated/tree.ts)、[tree-usage.ts](tests/fixtures/typegen/generated/tree-usage.ts)                                                                                      | 多段・循環参照、`depth: 0`〜`3`の境界、参照の`fields`と型抽出。`generatedRelations.integration.mjs`で検査                                                                    |
| [generated/matrix.ts](tests/fixtures/typegen/generated/matrix.ts)、[matrix-usage.ts](tests/fixtures/typegen/generated/matrix-usage.ts)、[matrix-extension.ts](tests/fixtures/typegen/generated/matrix-extension.ts) | 3層の繰り返し内の単一・複数参照・拡張データ、リスト／オブジェクト、`depth: 0`〜`3`、`fields`・型抽出、実APIの書き込み入力と不正入力。同テストで検査                          |

### 検証方針

`filters`・`orders`・`alternateField`のスキーマ検査と、旧リッチエディタのobject形式の自動推論は[公開仕様の対象外](README.md)です。型生成と実レスポンスの空値の一致はtypegen側で検査し、拡張フィールドUI独自のクリア値はユーザー定義の`data`型に委ねます。

## typegenとの分担・データ更新

SDKはメソッドの推論・入力制約・型抽出と通信処理、typegenはスキーマ取得と生成型の正しさを検査します。型生成・実APIデータの検証範囲は、typegenリポジトリの`DEVELOPMENT.md`を参照してください。

typegenの出力形式を変更した場合は、上表と利用例の生成型も更新し、`npm run build`・`npm run test:types`を実行します。保存データは入力・クエリ・レスポンスの対応を保ち、URL・メールアドレスをダミー化します。認証情報は保存しません。各リポジトリのCIは単独で動きます。

不具合修正では再現する異常系と近い正常系を残し、メソッド共通の制約は`typedSchema.matrix.ts`に追加します。共通処理は`tests/helpers/`にあります。

性能測定には[performance](tests/fixtures/typegen/performance/)の4API・50API／各100フィールド・循環参照10APIを使い、`depth`・`fields`・型抽出・書き込みを`tsc --extendedDiagnostics`で3回測定します。固定時間での合否判定には使いません。

## カバレッジ・CI・リリース

- [カバレッジ設定](jest.config.js)：Jestの`babel`プロバイダーでファイルごとに文・行98%、分岐90%、関数100%。型のみのファイル・再エクスポートは対象外で、公開型はコンパイルで検査します。レポートは`coverage/`のHTML・LCOV・JSONです。
- [CI](.github/workflows/ci.yml)：インストール・ビルド・静的検査は`.node-version`、実行時テストとカバレッジはNode.js18・20・22・24系。TypeScript7系と6.0.2で公開型・利用例・生成型との連携を検査し、カバレッジレポートを14日間保存します。
- [リリース](.github/workflows/release.yml)：`v*`タグで起動し、`precheck`のLint・型・実行時テスト・カバレッジ・TypeScript6互換性の検査成功後にnpmへ公開します。公開ジョブだけにOIDC権限を付与します。タグはレビューと公開準備の完了後に作成してください。通常の開発コマンド・テストCIでは公開しません。
