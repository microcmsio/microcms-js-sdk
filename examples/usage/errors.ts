import { client } from './shared/client';

// 下のエラー抑制コメントを1行ずつ外して、不正な指定の型エラーを確認します。
export async function inspectErrors() {
  // @ts-expect-error 存在しないエンドポイント
  await client.getList({ endpoint: 'missing' });

  // @ts-expect-error IDの全件取得でも存在しないエンドポイントは指定できない
  await client.getAllContentIds({ endpoint: 'missing' });

  // @ts-expect-error オブジェクト形式ではIDの全件取得はできない
  await client.getAllContentIds({ endpoint: 'banner' });

  // @ts-expect-error 汎用のgetでも存在しないエンドポイントは指定できない
  await client.get({ endpoint: 'missing' });

  // @ts-expect-error 汎用のgetでもオブジェクト形式にcontentIdは指定できない
  await client.get({ endpoint: 'banner', contentId: 'content-id' });

  // @ts-expect-error 存在しないfields
  await client.getList({
    endpoint: 'all_fields',
    queries: { fields: ['missing'] },
  });

  const banner = await client.getObject({ endpoint: 'banner' });
  // @ts-expect-error オブジェクト形式にはidがない
  banner.id;

  const invalidUpdate = {
    endpoint: 'blogs',
    contentId: 'content-id',
    content: { missing: 'value' },
  } as const;
  // @ts-expect-error スキーマにない書き込みフィールド
  await client.update(invalidUpdate);

  // @ts-expect-error リスト形式の更新にはcontentIdが必要
  await client.update({ endpoint: 'blogs', content: { title: 'タイトル' } });

  // @ts-expect-error オブジェクト形式の更新にcontentIdは指定できない
  await client.update({
    endpoint: 'banner',
    contentId: 'content-id',
    content: { url: 'https://example.com' },
  });

  const invalidReference = {
    endpoint: 'blogs',
    content: { category: { id: 'category-id' } },
  } as const;
  // @ts-expect-error 参照の書き込みはオブジェクトではなくID文字列
  await client.create(invalidReference);

  // @ts-expect-error オブジェクト形式にはcreateできない
  await client.create({ endpoint: 'banner', content: {} });
}
