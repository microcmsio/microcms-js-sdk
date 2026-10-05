# 開発ガイド

microcms-js-sdk自体の開発・検証手順です。利用者向けのAPI仕様は[README](README.md)、補完や推論をエディタで試す方法は[利用例](examples/README.md)を参照してください。

## 開発環境

`.node-version`で指定されたNode.jsを使用し、リポジトリのルートで依存関係をインストールします。

```sh
npm ci
```

以下のコマンドもリポジトリのルートで実行します。

## 開発用コマンド

| コマンド                     | 内容                                                                |
| ---------------------------- | ------------------------------------------------------------------- |
| `npm run build`              | JavaScriptと公開型定義を`dist/`へ生成                               |
| `npm run format`             | ソース・テスト・利用例の整形を確認                                  |
| `npm run lint`               | ソース・テスト・利用例のlint                                        |
| `npm run typecheck`          | SDK内部の実装と単体テストを型検査                                   |
| `npm test`                   | 実行時の単体テスト                                                  |
| `npm run test:coverage`      | 単体テストとカバレッジ計測                                          |
| `npm run typecheck:schema`   | ソースの公開APIによる型検査                                         |
| `npm run typecheck:dist`     | ビルド済みの公開型定義による型検査                                  |
| `npm run typecheck:examples` | ビルド済みの公開型定義で利用例を型検査                              |
| `npm run test:types`         | 開発用TypeScriptで公開API・利用例・回帰テスト・生成型との連携を検査 |
| `npm run test:performance`   | 生成済みスキーマを使った型検査の性能測定                            |

`format:fix`・`lint:fix`はファイルを変更して修正するコマンドです。`typecheck:dist`・`typecheck:examples`・`test:types`・`test:performance`はビルド後に実行してください。

## テスト

### 責務

| 対象                                                                                | 確認すること                                                                                                                             |
| ----------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| `tests/*.test.ts`                                                                   | 通信、リトライ、クエリ変換、読み取り・書き込みなどの実行時の処理                                                                         |
| `tests/typedSchema.typecheck.ts`                                                    | 手書きのスキーマを使い、読み取り・書き込みの推論、不正な指定、省略可能なクエリ、従来genericsとの互換性を網羅                             |
| `tests/typedSchema.matrix.ts`                                                       | 呼び出し方とメソッドを組み合わせ、ソースから抽出した公開型・配布型と`exactOptionalPropertyTypes`の両設定で正常系の型と異常系の検出を検査 |
| `tests/generatedSchema.integration.mjs`・`tests/generatedRelations.integration.mjs` | 生成済みスキーマをSDKに渡し、保存済みレスポンス・書き込み入力・多段と循環参照の推論を確認                                                |
| `examples/`                                                                         | 利用者向けの読み書き・型抽出・型エラーの例を公開型定義で検査                                                                             |

型テストはTypeScriptコンパイラによる検査のみです。記述されたクライアント呼び出しを実行したり、実サービスへリクエストを送ったりしません。

### 実行方法

```sh
npm run format
npm run lint
npm run typecheck
npm test
npm run typecheck:schema
npm run build
npm run typecheck:dist
npm run test:types
```

`typecheck:schema`はパッケージのインポート先を`src/index.ts`に、`typecheck:dist`はパッケージのルートに設定し、同じ型テストを実行します。配布型の検査では`package.json`の`types`からビルド済みの`dist/microcms-js-sdk.d.ts`を解決します。ソースの公開APIとビルド後の公開型定義を、それぞれSDK側で確認できます。

`typecheck:dist`はビルド後に実行してください。CIとリリース処理でも、ビルド後の必須チェックにしています。

### 回帰テストの追加方針

不具合を直すときは、再現する異常系と近い正常系をセットで残します。複数メソッドに共通する制約は`tests/typedSchema.matrix.ts`のケースに追加し、呼び出し経路ごとの差をまとめて検査してください。正常系は戻り値の型の一致まで検証します。異常系は型エラーの位置が対象の呼び出し内にあることを確認し、テストの準備コードの誤りで成功しないようにしています。

マトリクスの例はコンパイラに渡す文字列です。SDKのコンパイル設定でソースから公開型を抽出し、一時ディレクトリに型定義と利用例を書き出して`tsc`へ渡します。一時ファイルは検査後に削除します。利用者側の`exactOptionalPropertyTypes`はSDK内部の実装のコンパイル設定と区別して検査します。`test:types`はビルド後に実行し、CIとリリース処理の必須チェックにしています。

### TypeScriptの対応確認

開発用のTypeScriptは`^7.0.2`で7系に揃えています。`npm ci`ではlockfileに記録したバージョンを使用し、通常の`tsc`・型定義の生成・型検査・`npm run test:types`はいずれもこのコンパイラを使用します。`test:types`では静的な型テスト、利用例、223ケース×公開型2種類×`exactOptionalPropertyTypes`2設定、生成型との連携を検査します。

利用者向けの対応範囲はTypeScript6.0以降で、開発用コンパイラのバージョンとは別です。CIとリリース処理ではTypeScript6.0.2を別の一時ディレクトリへインストールし、同じ公開型のテストを実行します。ローカルの依存関係には6系を含めません。

`test:types`・`test:performance`で使うコンパイラを切り替える場合は、`MICROCMS_TYPESCRIPT_BINARY`にCLIの絶対パスを指定します。この指定は`npx tsc`やエディタが使うTypeScriptのバージョンには影響しません。SDK内部の型定義の生成と`typecheck`は常に開発用の7系を使用します。

型テストはCompiler APIに依存せず、CLIで型定義の生成と利用例の検査を行います。lintにはTypeScriptコンパイラに依存しないOxlintを使用し、既存のESLint・TypeScriptの主要なルールに対応する検査を設定しています。TypeScriptの構文検査は`typecheck`・`test:types`で行い、整形にはPrettierを使用します。

JavaScriptはtsupで生成し、従来と同じES5ターゲット・CommonJS・ES modules・ブラウザ向け形式を維持します。型定義は`tsconfig.declarations.json`で`dist/types/`へ生成し、`scripts/finish-declarations.mjs`で既存の公開エントリーポイントから再エクスポートします。JestのTypeScript変換には`@swc/jest`を使用し、型検査は`typecheck`・`test:types`で行います。`tsconfig.tests.json`で単体テストも型検査し、テスト用依存の型定義のみ`skipLibCheck`の対象にします。SDK本体と配布型定義の生成では型定義の検査を省略しません。

## 生成型との連携とfixture

`test:types`は、選択したコンパイラで`examples/`と生成型の連携テストも実行します。連携テストは生成済みの型を読み、typegenや隣接リポジトリを必要としません。保存済みJSONを推論された戻り値型へ直接代入し、選択されたフィールドの集合と抽出型の一致も検査します。不正なメタデータ・値・選択肢・未選択フィールドを含むレスポンスが型エラーになることも検査します。ローカルでは7系、CIでは6系でも同じ検査を実行します。

[`tests/fixtures/typegen/`](tests/fixtures/typegen/)は確認用の[typegenサービス](https://typegen.microcms.io/)から取得したスキーマ、33ケースの読み取りレスポンス、新規作成入力、作成・更新・削除の実行記録です。`tests/fixtures/typegen/generated/extensions.ts`は手書きの拡張データ型、同じ`generated/`内の他のファイルは拡張データと循環参照を検証する生成型と利用例です。通常のテストは実サービスへアクセスせず、取得・書き込みを実行しません。公開用に、保存済みデータのURLとメールアドレスは`example.com`のダミーへ置き換えています。

`all_fields`の`typegen-fixture-filled`・`typegen-fixture-empty`で値ありと空値を確認しました。繰り返しは5種類すべてを含み、数値の0、真偽値のfalse、null、空配列も保存しています。更新・削除は別の専用IDで実行し、検証後に削除済みです。オブジェクト形式の更新は型検査のみです。これらは取得時の記録で、現在のAPI動作を保証するライブテストではありません。

型生成の正しさと、スキーマから生成結果への一致はtypegen側で検査します。typegenの出力形式を変更した場合は、このリポジトリの生成済み型を更新し、`npm run test:types`を実行してください。データを更新する場合も入力とレスポンスの対応・取得元・取得日時を維持し、URLとメールアドレスをダミー化してください。認証情報は保存しないでください。

## 型チェックの性能確認

```sh
npm run build
npm run test:performance
```

保存済みの4API、50API・各100フィールド、多段・循環参照の10APIの生成済み型で、`depth: 0`〜`3`、`fields`、型抽出、書き込みを測定します。選択したTypeScriptコンパイラで3回実行し、`tsc --extendedDiagnostics`の結果をJSONで出力します。生成済み型は`tests/fixtures/typegen/performance/`に保存し、typegenの実行やAPI通信は不要です。メモリはコンパイラの報告値で、プロセス全体の最大使用量ではありません。CIの固定時間による合否判定には使いません。

## CIとリリース処理

[テストCI](.github/workflows/ci.yml)は`main`へのpushとpull requestで実行します。静的検査では`.node-version`のNode.jsを使用し、ビルドとテストはNode.js18・20・22・24系で実行します。`test:types`を通して、開発用のTypeScript7で利用例と生成型との連携も検査します。別ジョブでTypeScript6.0.2による同じ互換性検査を実行します。

[リリース処理](.github/workflows/release.yml)は`v`で始まるタグへのpushで実行します。lint・実装の型検査・単体テスト・ビルド・公開型定義と利用者側の型検査が成功した後に、npmへ公開します。リリースタグはレビューと公開の準備が完了してから作成してください。

通常の開発用コマンドとテストCIはnpmへの公開を行いません。
