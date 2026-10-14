import type { InferMicroCMSContent } from 'microcms-js-sdk';
import type { ExampleServiceSchema } from '../generated/microcms-types';
import { queries } from './shared/queries';

// コンポーネントのpropsなど、取得処理とは別の場所でコンテンツ型を使う例です。
export type SelectedContent = InferMicroCMSContent<
  ExampleServiceSchema,
  'all_fields',
  typeof queries
>;
export type ContentProps = { content: SelectedContent };

export function contentCard({ content }: ContentProps) {
  return {
    id: content.id,
    text: content.text ?? '',
    category: content.ref?.name ?? '',
  };
}

// オブジェクト形式APIはidを持ちません。
export type BannerContent = InferMicroCMSContent<
  ExampleServiceSchema,
  'banner'
>;
export type BannerProps = { content: BannerContent };

export function bannerCard({ content }: BannerProps) {
  return { imageUrl: content.image?.url, url: content.url ?? '' };
}
