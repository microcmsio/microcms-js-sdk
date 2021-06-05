import { parseQuery } from '../src/utils/parseQuery';

describe('parseQuery.ts', () => {
  const queryMock = {
    limit: 20,
    offset: 20,
  };
  test('parseQuery is return querystring', () => {
    expect(parseQuery(queryMock)).toBe('limit=20&offset=20');
  });
});
