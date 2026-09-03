import {
  createMicroCMSRequestError,
  isMicroCMSRequestError,
} from '../../src/lib/error';

describe('createMicroCMSRequestError', () => {
  test('adds structured error details without changing the default Error behavior', () => {
    const error = createMicroCMSRequestError(
      new Error('fetch API response status: 404'),
      {
        status: 404,
        url: 'https://example.microcms.io/api/v1/blog/abc',
      },
    );

    expect(error).toBeInstanceOf(Error);
    expect(error.constructor).toBe(Error);
    expect(error.name).toBe('Error');
    expect(error.message).toBe('fetch API response status: 404');
    expect(error.toString()).toBe('Error: fetch API response status: 404');
    expect(error.status).toBe(404);
    expect(error.url).toBe('https://example.microcms.io/api/v1/blog/abc');
    expect(error.originalError).toBeUndefined();
  });

  test('adds the error details as non-enumerable properties', () => {
    const error = createMicroCMSRequestError(new Error('Network Error.'), {
      url: 'https://example.microcms.io/api/v1/blog',
      originalError: new TypeError('fetch failed'),
    });

    expect(Object.keys(error)).toEqual([]);
    expect(JSON.stringify(error)).toBe('{}');
    expect(Object.getOwnPropertyDescriptor(error, 'status')?.enumerable).toBe(
      false,
    );
    expect(Object.getOwnPropertyDescriptor(error, 'url')?.enumerable).toBe(
      false,
    );
    expect(
      Object.getOwnPropertyDescriptor(error, 'originalError')?.enumerable,
    ).toBe(false);
  });

  test('masks all draftKey values while preserving the other query parameters', () => {
    const error = createMicroCMSRequestError(
      new Error('fetch API response status: 404'),
      {
        status: 404,
        url: 'https://example.microcms.io/api/v1/blog/abc?draftKey=secret&fields=id&draftKey=another',
      },
    );

    expect(error.url).toBe(
      'https://example.microcms.io/api/v1/blog/abc?draftKey=***&fields=id&draftKey=***',
    );
  });

  test('keeps the original network error without modification', () => {
    const originalError = new TypeError('fetch failed') as TypeError & {
      cause: unknown;
    };
    originalError.cause = { code: 'ENOTFOUND' };
    const error = createMicroCMSRequestError(new Error('Network Error.'), {
      url: 'https://example.microcms.io/api/v1/blog',
      originalError,
    });

    expect(error.status).toBeUndefined();
    expect(error.originalError).toBe(originalError);
    expect((error.originalError as typeof originalError).cause).toEqual({
      code: 'ENOTFOUND',
    });
  });
});

describe('isMicroCMSRequestError', () => {
  test('returns true for an error created by createMicroCMSRequestError', () => {
    const error = createMicroCMSRequestError(new Error('Network Error.'), {
      url: 'https://example.microcms.io/api/v1/blog',
    });

    expect(isMicroCMSRequestError(error)).toBe(true);
  });

  test('returns false for a standard Error', () => {
    expect(isMicroCMSRequestError(new Error('standard error'))).toBe(false);
  });

  test('returns false for a non-Error value with similar properties', () => {
    expect(
      isMicroCMSRequestError({
        status: 404,
        url: 'https://example.microcms.io/api/v1/blog',
        originalError: undefined,
      }),
    ).toBe(false);
  });
});
