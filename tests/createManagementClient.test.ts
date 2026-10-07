import { createManagementClient } from '../src/createManagementClient';
import { isMicroCMSRequestError } from '../src/lib/error';
import { testBaseManagementUrlOfVersion1 } from './mocks/handlers';

const client = () =>
  createManagementClient({ serviceDomain: 'serviceDomain', apiKey: 'apiKey' });
const upload = {
  data: new Blob(['test'], { type: 'image/png' }),
  name: 'image.png',
};

describe('createManagementClient', () => {
  afterEach(() => jest.restoreAllMocks());

  test('exposes the upload method', () => {
    expect(typeof client().uploadMedia).toBe('function');
  });

  test('requires serviceDomain and apiKey', () => {
    // @ts-expect-error Missing API key must also fail at runtime.
    expect(() => createManagementClient({ serviceDomain: 'foo' })).toThrow(
      'parameter is required',
    );
    // @ts-expect-error Missing service domain must also fail at runtime.
    expect(() => createManagementClient({ apiKey: 'foo' })).toThrow(
      'parameter is required',
    );
  });

  test('rejects non-string credentials', () => {
    expect(() =>
      // @ts-expect-error Reject invalid JavaScript callers at runtime.
      createManagementClient({ serviceDomain: 10, apiKey: 'foo' }),
    ).toThrow('parameter is not string');
    expect(() =>
      // @ts-expect-error Reject invalid JavaScript callers at runtime.
      createManagementClient({ serviceDomain: 'foo', apiKey: 10 }),
    ).toThrow('parameter is not string');
  });

  test.each([
    [
      401,
      JSON.stringify({ message: 'Invalid API key' }),
      'fetch API response status: 401\n  message is `Invalid API key`',
    ],
    [403, JSON.stringify({ message: null }), 'fetch API response status: 403'],
    [429, JSON.stringify({}), 'fetch API response status: 429'],
    [500, 'not json', 'fetch API response status: 500'],
  ])(
    'returns structured HTTP %s errors without retrying',
    async (status, body, message) => {
      const fetchMock = jest
        .spyOn(globalThis, 'fetch')
        .mockResolvedValue(new Response(body, { status }));
      const error = await client()
        .uploadMedia(upload)
        .catch((error: unknown) => error);
      expect(isMicroCMSRequestError(error)).toBe(true);
      if (!isMicroCMSRequestError(error)) throw error;
      expect(error.message).toBe(message);
      expect(error.status).toBe(status);
      expect(error.url).toBe(`${testBaseManagementUrlOfVersion1}/media`);
      expect(error.originalError).toBeUndefined();
      expect(fetchMock).toHaveBeenCalledTimes(1);
    },
  );

  test('keeps the original network error', async () => {
    const original = new TypeError('fetch failed');
    const fetchMock = jest
      .spyOn(globalThis, 'fetch')
      .mockRejectedValue(original);
    const error = await client()
      .uploadMedia(upload)
      .catch((error: unknown) => error);
    expect(isMicroCMSRequestError(error)).toBe(true);
    if (!isMicroCMSRequestError(error)) throw error;
    expect(error.message).toBe('Network Error.\n  Details: fetch failed');
    expect(error.status).toBeUndefined();
    expect(error.originalError).toBe(original);
    expect(error.url).toBe(`${testBaseManagementUrlOfVersion1}/media`);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  test.each([
    [{ data: { message: 'transport data' } }, { message: 'transport data' }],
    [
      { response: { data: { message: 'response data' } } },
      { message: 'response data' },
    ],
  ])(
    'preserves existing transport error data: %j',
    async (original, expected) => {
      jest.spyOn(globalThis, 'fetch').mockRejectedValue(original);
      await expect(client().uploadMedia(upload)).rejects.toEqual(expected);
    },
  );

  test('handles network errors without a message', async () => {
    const original = {};
    jest.spyOn(globalThis, 'fetch').mockRejectedValue(original);
    const error = await client()
      .uploadMedia(upload)
      .catch((error: unknown) => error);
    expect(isMicroCMSRequestError(error)).toBe(true);
    if (!isMicroCMSRequestError(error)) throw error;
    expect(error.message).toBe('Network Error.\n  Details: ');
    expect(error.originalError).toBe(original);
  });

  test('surfaces malformed successful JSON without converting it to a network error', async () => {
    jest
      .spyOn(globalThis, 'fetch')
      .mockResolvedValue(new Response('invalid json'));
    const error = await client()
      .uploadMedia(upload)
      .catch((error: unknown) => error);
    expect(error).toMatchObject({ name: 'SyntaxError' });
    expect(isMicroCMSRequestError(error)).toBe(false);
  });
});
