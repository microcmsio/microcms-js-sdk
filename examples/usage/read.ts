import { client } from './shared/client';
import { queries } from './shared/queries';

// 戻り値の型はエンドポイントとクエリから自動で推論されます。
export async function inspectRead() {
  // responseとfirstにホバーして、fieldsで選んだ項目を確認します。
  const response = await client.getList({ endpoint: 'all_fields', queries });
  const first = response.contents.at(0);

  // blogs.categoryもcategoriesへの参照です。depthで参照先の展開を確認します。
  const blogs = await client.getList({
    endpoint: 'blogs',
    queries: { depth: 2 },
  });
  const blog = blogs.contents.at(0);

  // オブジェクト形式APIの戻り値にidは含まれません。
  const banner = await client.getObject({ endpoint: 'banner' });

  // リスト形式APIのコンテンツIDを全件取得する型はstring[]です。
  const ids = await client.getAllContentIds({ endpoint: 'blogs' });

  return { first, blog, banner, ids };
}
