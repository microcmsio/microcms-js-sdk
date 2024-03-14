import { http, HttpResponse } from 'msw';
import { createClient } from '../src/createClient';
import { testBaseUrl } from './mocks/handlers';
import { server } from './mocks/server';

describe('createClient', () => {
  test('Functions is generated to request the API', () => {
    const client = createClient({
      serviceDomain: 'serviceDomain',
      apiKey: 'apiKey',
      retry: false,
    });

    expect(typeof client.get === 'function').toBe(true);
    expect(typeof client.getList === 'function').toBe(true);
    expect(typeof client.getListDetail === 'function').toBe(true);
    expect(typeof client.getObject === 'function').toBe(true);
    expect(typeof client.create === 'function').toBe(true);
    expect(typeof client.update === 'function').toBe(true);
    expect(typeof client.delete === 'function').toBe(true);
  });

  test('Throws an error if `serviceDomain` or `apiKey` is missing', () => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    expect(() => createClient({ serviceDomain: 'foo' })).toThrow(
      new Error('parameter is required (check serviceDomain and apiKey)'),
    );
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    expect(() => createClient({ apiKey: 'foo' })).toThrow(
      new Error('parameter is required (check serviceDomain and apiKey)'),
    );
  });
  test('Throws an error if `serviceDomain` or `apiKey` is missing', () => {
    expect(() =>
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error
      createClient({ serviceDomain: 10, apiKey: 'foo' }),
    ).toThrow(new Error('parameter is not string'));
    expect(() =>
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error
      createClient({ serviceDomain: 'foo', apiKey: 10 }),
    ).toThrow(new Error('parameter is not string'));
  });

  describe('Throws an error when response.ok is false', () => {
    test('If there is a message', () => {
      server.use(
        http.get(`${testBaseUrl}/list-type`, async () => {
          return HttpResponse.json(
            { message: 'X-MICROCMS-KEY header is invalid.' },
            { status: 401 },
          );
        }),
      );
      const client = createClient({
        serviceDomain: 'serviceDomain',
        apiKey: 'apiKey',
      });

      expect(client.get({ endpoint: 'list-type' })).rejects.toThrow(
        new Error(
          'fetch API response status: 401\n  message is `X-MICROCMS-KEY header is invalid.`',
        ),
      );
    });
    test('If there is no message', () => {
      server.use(
        http.get(`${testBaseUrl}/list-type`, async () => {
          return new HttpResponse(null, { status: 404 });
        }),
      );
      const client = createClient({
        serviceDomain: 'serviceDomain',
        apiKey: 'apiKey',
      });

      expect(client.get({ endpoint: 'list-type' })).rejects.toThrow(
        new Error('fetch API response status: 404'),
      );
    });
  });

  test('Throws an error in the event of a network error.', () => {
    server.use(
      http.get(`${testBaseUrl}/list-type`, async () => {
        return HttpResponse.error();
      }),
    );
    const client = createClient({
      serviceDomain: 'serviceDomain',
      apiKey: 'apiKey',
    });

    expect(client.get({ endpoint: 'list-type' })).rejects.toThrow(
      new Error('Network Error.\n  Details: Failed to fetch'),
    );
  });

  describe('Retry option is true', () => {
    const retryableClient = createClient({
      serviceDomain: 'serviceDomain',
      apiKey: 'apiKey',
      retry: true,
    });

    test('Returns an error message if three times failed', async () => {
      let apiCallCount = 0;

      server.use(
        http.get(`${testBaseUrl}/500`, async () => {
          apiCallCount++;
          return new HttpResponse(null, {
            status: 500,
          });
        }),
      );

      await expect(retryableClient.get({ endpoint: '500' })).rejects.toThrow(
        new Error('fetch API response status: 500'),
      );
      expect(apiCallCount).toBe(3);
    }, 30000);

    test('Returns an error message if 4xx error(excluding 429)', async () => {
      let apiCallCount = 0;

      server.use(
        http.get(`${testBaseUrl}/400`, async () => {
          apiCallCount++;
          return new HttpResponse(null, { status: 400 });
        }),
      );

      await expect(retryableClient.get({ endpoint: '400' })).rejects.toThrow(
        new Error('fetch API response status: 400'),
      );
      expect(apiCallCount).toBe(1);
    });

    test('List format contents can be retrieved if failed twice and succeeded once', async () => {
      let failedRequestCount = 0;
      server.use(
        http.get(`${testBaseUrl}/two-times-fail`, () => {
          if (failedRequestCount < 2) {
            failedRequestCount++;
            return new HttpResponse(null, { status: 500 });
          } else {
            return HttpResponse.json(
              {
                contents: [
                  {
                    id: 'foo',
                    title: 'Hello, microCMS!',
                    createdAt: '2022-10-28T04:04:29.625Z',
                    updatedAt: '2022-10-28T04:04:29.625Z',
                    publishedAt: '2022-10-28T04:04:29.625Z',
                    revisedAt: '2022-10-28T04:04:29.625Z',
                  },
                ],
                totalCount: 1,
                limit: 10,
                offset: 0,
              },
              { status: 200 },
            );
          }
        }),
      );

      const data = await retryableClient.get({ endpoint: 'two-times-fail' });
      expect(data).toEqual({
        contents: [
          {
            id: 'foo',
            title: 'Hello, microCMS!',
            createdAt: '2022-10-28T04:04:29.625Z',
            updatedAt: '2022-10-28T04:04:29.625Z',
            publishedAt: '2022-10-28T04:04:29.625Z',
            revisedAt: '2022-10-28T04:04:29.625Z',
          },
        ],
        totalCount: 1,
        limit: 10,
        offset: 0,
      });
    }, 30000);

    test('List format contents can be retrieved if succeeded once and failed twice', async () => {
      let apiCallCount = 0;
      server.use(
        http.get(`${testBaseUrl}/only-first-time-success`, () => {
          apiCallCount++;
          if (apiCallCount === 1) {
            return HttpResponse.json(
              {
                contents: [
                  {
                    id: 'foo',
                    title: 'Hello, microCMS!',
                    createdAt: '2022-10-28T04:04:29.625Z',
                    updatedAt: '2022-10-28T04:04:29.625Z',
                    publishedAt: '2022-10-28T04:04:29.625Z',
                    revisedAt: '2022-10-28T04:04:29.625Z',
                  },
                ],
                totalCount: 1,
                limit: 10,
                offset: 0,
              },
              { status: 200 },
            );
          } else {
            return new HttpResponse(null, { status: 500 });
          }
        }),
      );

      const data = await retryableClient.get({
        endpoint: 'only-first-time-success',
      });
      expect(data).toEqual({
        contents: [
          {
            id: 'foo',
            title: 'Hello, microCMS!',
            createdAt: '2022-10-28T04:04:29.625Z',
            updatedAt: '2022-10-28T04:04:29.625Z',
            publishedAt: '2022-10-28T04:04:29.625Z',
            revisedAt: '2022-10-28T04:04:29.625Z',
          },
        ],
        totalCount: 1,
        limit: 10,
        offset: 0,
      });
      expect(apiCallCount).toBe(1);
    }, 30000);
  });
});
