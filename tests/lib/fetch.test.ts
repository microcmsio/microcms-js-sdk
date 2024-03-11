import { generateFetchClient } from '../../src/lib/fetch';

const fetchMock = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve(),
  }),
);

describe('generateFetchClient', () => {
  beforeEach(() => {
    fetchMock.mockClear();
    global.fetch = fetchMock as any;
  });

  test('should correctly set the X-MICROCMS-API-KEY header if not already present', async () => {
    const apiKey = 'testApiKey';
    const testUrl = 'http://test.com';
    const fetchClient = generateFetchClient(apiKey);

    await fetchClient(testUrl, {});

    expect(fetch).toHaveBeenCalledWith(
      testUrl,
      expect.objectContaining({ headers: expect.anything() }),
    );
    const calledWithHeaders = new Headers(
      (fetch as jest.Mock).mock.calls[0][1].headers,
    );
    expect(calledWithHeaders.get('X-MICROCMS-API-KEY')).toBe(apiKey);
  });

  test('should not overwrite the X-MICROCMS-API-KEY header if already present', async () => {
    const apiKey = 'testApiKey';
    const existingApiKey = 'existingApiKey';
    const testUrl = 'http://test.com';
    const fetchClient = generateFetchClient(apiKey);
    const headers = new Headers({ 'X-MICROCMS-API-KEY': existingApiKey });

    await fetchClient(testUrl, { headers });

    expect(fetch).toHaveBeenCalledWith(
      testUrl,
      expect.objectContaining({ headers: expect.anything() }),
    );
    const calledWithHeaders = new Headers(
      (fetch as jest.Mock).mock.calls[0][1].headers,
    );
    expect(calledWithHeaders.get('X-MICROCMS-API-KEY')).toBe(existingApiKey);
  });
});
