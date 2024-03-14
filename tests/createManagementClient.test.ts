import { http, HttpResponse } from 'msw';
import { createManagementClient } from '../src/createManagementClient';
import { testBaseManagementUrlOfVersion1 } from './mocks/handlers';
import { server } from './mocks/server';

// mswの不具合で、FormDataのテストが終わらないため、テストをスキップ
// https://github.com/mswjs/msw/issues/2078
describe.skip('createManagementClient', () => {
  test('Functions is generated to request the API', () => {
    const client = createManagementClient({
      serviceDomain: 'serviceDomain',
      apiKey: 'apiKey',
    });

    expect(typeof client.uploadMedia === 'function').toBe(true);
  });

  test('Throws an error if `serviceDomain` or `apiKey` is missing', () => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    expect(() => createManagementClient({ serviceDomain: 'foo' })).toThrow(
      new Error('parameter is required (check serviceDomain and apiKey)'),
    );
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    expect(() => createManagementClient({ apiKey: 'foo' })).toThrow(
      new Error('parameter is required (check serviceDomain and apiKey)'),
    );
  });
  test('Throws an error if `serviceDomain` or `apiKey` is missing', () => {
    expect(() =>
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error
      createManagementClient({ serviceDomain: 10, apiKey: 'foo' }),
    ).toThrow(new Error('parameter is not string'));
    expect(() =>
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error
      createManagementClient({ serviceDomain: 'foo', apiKey: 10 }),
    ).toThrow(new Error('parameter is not string'));
  });

  describe('Throws an error when response.ok is false', () => {
    test('If there is a message', () => {
      server.use(
        http.post(`${testBaseManagementUrlOfVersion1}/media`, async () => {
          return HttpResponse.json(
            { message: 'X-MICROCMS-KEY header is invalid.' },
            { status: 401 },
          );
        }),
      );
      const client = createManagementClient({
        serviceDomain: 'serviceDomain',
        apiKey: 'apiKey',
      });

      expect(
        client.uploadMedia({
          data: new Blob([], { type: 'image/png' }),
          name: 'image.png',
        }),
      ).rejects.toThrow(
        new Error(
          'fetch API response status: 401\n  message is `X-MICROCMS-KEY header is invalid.`',
        ),
      );
    });
    test('If there is no message', () => {
      server.use(
        http.post(`${testBaseManagementUrlOfVersion1}/media`, async () => {
          return new HttpResponse(null, { status: 500 });
        }),
      );
      const client = createManagementClient({
        serviceDomain: 'serviceDomain',
        apiKey: 'apiKey',
      });

      expect(
        client.uploadMedia({
          data: new Blob([], { type: 'image/png' }),
          name: 'image.png',
        }),
      ).rejects.toThrow(new Error('fetch API response status: 500'));
    });
  });

  test('Throws an error in the event of a network error.', () => {
    server.use(
      http.post(`${testBaseManagementUrlOfVersion1}/media`, async () => {
        return HttpResponse.error();
      }),
    );
    const client = createManagementClient({
      serviceDomain: 'serviceDomain',
      apiKey: 'apiKey',
    });

    expect(
      client.uploadMedia({
        data: new Blob([], { type: 'image/png' }),
        name: 'image.png',
      }),
    ).rejects.toThrow(new Error('Network Error.\n  Details: Failed to fetch'));
  });
});
