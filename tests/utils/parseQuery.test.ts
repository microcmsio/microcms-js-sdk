import { parseQuery } from '../../src/utils/parseQuery';

describe('parseQuery', () => {
  test('Object type query string returned as string', () => {
    expect(
      parseQuery({
        limit: 100,
        fields: ['id', 'title'],
        orders: 'publishedAt',
      }),
    ).toBe('limit=100&fields=id%2Ctitle&orders=publishedAt');
  });

  test('Throws an error if a non-object is specified', () => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    expect(() => parseQuery('')).toThrowError(
      new Error('queries is not object'),
    );
  });

  test('Undefined values are removed from the query string', () => {
    expect(
      parseQuery({
        limit: 100,
        fields: undefined,
        orders: 'publishedAt',
      }),
    ).toBe('limit=100&orders=publishedAt');
  });

  test('Multiple undefined values are removed from the query string', () => {
    expect(
      parseQuery({
        limit: undefined,
        fields: undefined,
        orders: 'publishedAt',
      }),
    ).toBe('orders=publishedAt');
  });

  test('All undefined values results in an empty query string', () => {
    expect(
      parseQuery({
        limit: undefined,
        fields: undefined,
        orders: undefined,
      }),
    ).toBe('');
  });
});
