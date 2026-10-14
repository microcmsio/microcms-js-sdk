import { createClient } from 'microcms-js-sdk';
import type { ExampleServiceSchema } from '../../generated/microcms-types';

// エディタで型を確認するためのダミー設定です。取得・書き込み関数は実行しません。
export const client = createClient<ExampleServiceSchema>({
  serviceDomain: 'typegen',
  apiKey: 'TYPE_CHECK_ONLY',
});
