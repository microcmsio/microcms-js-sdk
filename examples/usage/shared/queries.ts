import type { ExampleServiceSchema } from '../../generated/microcms-types';

// all_fieldsで指定できるfieldsの補完を確認します。ref.nameは参照先のフィールドです。
export const fieldsWithCompletion = [
  'id',
  'text',
  'ref.name',
] as const satisfies readonly ExampleServiceSchema['all_fields']['fieldPaths'][];

// 同じクエリを取得処理と型抽出で共用します。as constで値をリテラル型として保持します。
export const queries = { depth: 2, fields: fieldsWithCompletion } as const;
