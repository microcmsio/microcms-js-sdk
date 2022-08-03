import { parseQuery } from '../../src/utils/parseQuery';

describe('parseQuery', () => {
  test('Object type query string returned as string', () => {
    expect(
      parseQuery({
        limit: 100,
        fields: ['id', 'title'],
        orders: 'publishedAt',
      })
    ).toBe('limit=100&fields=id%2Ctitle&orders=publishedAt');
  });
  test('Throws an error if a non-object is specified', () => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    expect(() => parseQuery('')).toThrowError(
      new Error('queries is not object')
    );
  });
});
