import { generateFetchClient } from '../../src/lib/fetch';

describe('generateFetchClient', () => {
  test('If custom fetch is specified, custom fetch is used', async () => {
    const customFetch = jest.fn();
    const client = generateFetchClient('apiKey', customFetch);
    await client('http://example.com');
    expect(customFetch).toHaveBeenCalled();
  });
});
