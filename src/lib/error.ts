import { MicroCMSRequestError } from '../types';

interface CreateMicroCMSRequestErrorOptions {
  status?: number;
  url: string;
  originalError?: unknown;
}

const maskDraftKey = (url: string): string => {
  return url.replace(/([?&]draftKey=)[^&#]*/g, '$1***');
};

export const createMicroCMSRequestError = (
  error: Error,
  { status, url, originalError }: CreateMicroCMSRequestErrorOptions,
): MicroCMSRequestError => {
  // Errorとしての実行時の同一性と既存のログ出力を維持するため、独自クラスは生成せず、
  // 既存のErrorに追加情報を付与する。独自のErrorクラスは将来のメジャーリリースで再検討できる。
  // 設計背景: https://github.com/microcmsio/microcms-js-sdk/pull/109
  const microCMSRequestError = error as MicroCMSRequestError;

  Object.defineProperties(microCMSRequestError, {
    status: {
      value: status,
      enumerable: false,
      configurable: true,
      writable: true,
    },
    url: {
      value: maskDraftKey(url),
      enumerable: false,
      configurable: true,
      writable: true,
    },
    originalError: {
      value: originalError,
      enumerable: false,
      configurable: true,
      writable: true,
    },
  });

  return microCMSRequestError;
};

export const isMicroCMSRequestError = (
  error: unknown,
): error is MicroCMSRequestError => {
  if (!(error instanceof Error)) return false;

  return (
    Object.prototype.hasOwnProperty.call(error, 'status') &&
    (typeof (error as MicroCMSRequestError).status === 'number' ||
      typeof (error as MicroCMSRequestError).status === 'undefined') &&
    Object.prototype.hasOwnProperty.call(error, 'url') &&
    typeof (error as MicroCMSRequestError).url === 'string' &&
    Object.prototype.hasOwnProperty.call(error, 'originalError')
  );
};
