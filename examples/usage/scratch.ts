import { client } from './shared/client';

// エンドポイントやqueriesを自由に変更して補完を試す場所です。
export async function scratch() {
  const response = await client.getList({ endpoint: 'all_fields' });
  return response.contents.at(0);
}
