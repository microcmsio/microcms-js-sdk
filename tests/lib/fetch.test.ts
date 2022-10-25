import { generateFetchClient } from '../../src/lib/fetch';

describe('generateFetchClient', () => {
  test('If no options is specified, cross-fetch is used', async () => {
    const client = generateFetchClient('apiKey');
    const response = await client('http://example.com');
    expect(response.status).toBe(200);
  });

  test('If custom fetch is specified, custom fetch is used', async () => {
    const customFetch = jest.fn();
    const client = generateFetchClient('apiKey', customFetch);
    await client('http://example.com');
    expect(customFetch).toHaveBeenCalled();
  });
});
