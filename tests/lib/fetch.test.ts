import { generateFetchClient } from '../../src/lib/fetch';
import crossFetch from 'cross-fetch';

describe('generateFetchClient', () => {
  test('If no options is specified, cross-fetch is used', () => {
    const client = generateFetchClient('apiKey');
    expect(typeof client === typeof crossFetch).toBe(true);
  });

  test('If custom fetch is specified, custom fetch is used', () => {
    const customFetch = () => Promise.resolve(new Response());
    const client = generateFetchClient('apiKey', customFetch);
    expect(typeof client === typeof customFetch).toBe(true);
  });
});
