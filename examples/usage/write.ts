import type { ExampleServiceSchema } from '../generated/microcms-types';
import { client } from './shared/client';

type CreateBlog = ExampleServiceSchema['blogs']['create'];
type UpdateBlog = ExampleServiceSchema['blogs']['update'];

// content内の補完を確認するための例です。実行せず、エディタ上で型を確認します。
export async function inspectWrite() {
  const createContent: CreateBlog = {
    title: 'サンプル',
    category: 'category-id',
  };
  const updateContent: UpdateBlog = { title: '更新後のタイトル' };

  await client.create({ endpoint: 'blogs', content: createContent });
  await client.update({
    endpoint: 'blogs',
    contentId: 'content-id',
    content: updateContent,
  });

  // オブジェクト形式APIの更新にはcontentIdが不要です。
  await client.update({
    endpoint: 'banner',
    content: { url: 'https://example.com' },
  });

  // all_fieldsでは参照がID文字列、画像がURL文字列で補完されます。
  await client.update({
    endpoint: 'all_fields',
    contentId: 'content-id',
    content: {
      text: 'サンプル',
      ref: 'category-id',
      image: 'https://example.com/assets/image.png',
    },
  });
}
