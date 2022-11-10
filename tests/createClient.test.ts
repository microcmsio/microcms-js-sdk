import { rest } from 'msw';
import { createClient } from '../src/createClient';
import { testBaseUrl } from './mocks/handlers';
import { server } from './mocks/server';

describe('createClient', () => {
  test('Functions is generated to request the API', () => {
    const client = createClient({
      serviceDomain: 'serviceDomain',
      apiKey: 'apiKey',
      customFetch: () => Promise.resolve(new Response()),
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
    expect(() => createClient({ serviceDomain: 'foo' })).toThrowError(
      new Error('parameter is required (check serviceDomain and apiKey)')
    );
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    expect(() => createClient({ apiKey: 'foo' })).toThrowError(
      new Error('parameter is required (check serviceDomain and apiKey)')
    );
  });
  test('Throws an error if `serviceDomain` or `apiKey` is missing', () => {
    expect(() =>
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error
      createClient({ serviceDomain: 10, apiKey: 'foo' })
    ).toThrowError(new Error('parameter is not string'));
    expect(() =>
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error
      createClient({ serviceDomain: 'foo', apiKey: 10 })
    ).toThrowError(new Error('parameter is not string'));
  });

  describe('Throws an error when response.ok is false', () => {
    test('If there is a message', () => {
      server.use(
        rest.get(`${testBaseUrl}/list-type`, async (_, res, ctx) => {
          return res(
            ctx.status(401),
            ctx.json({ message: 'X-MICROCMS-KEY header is invalid.' })
          );
        })
      );
      const client = createClient({
        serviceDomain: 'serviceDomain',
        apiKey: 'apiKey',
      });

      expect(client.get({ endpoint: 'list-type' })).rejects.toThrowError(
        new Error(
          'fetch API response status: 401\n  message is `X-MICROCMS-KEY header is invalid.`'
        )
      );
    });
    test('If there is no message', () => {
      server.use(
        rest.get(`${testBaseUrl}/list-type`, async (_, res, ctx) => {
          return res(ctx.status(404));
        })
      );
      const client = createClient({
        serviceDomain: 'serviceDomain',
        apiKey: 'apiKey',
      });

      expect(client.get({ endpoint: 'list-type' })).rejects.toThrowError(
        new Error('fetch API response status: 404')
      );
    });
  });

  test('Throws an error in the event of a network error.', () => {
    server.use(
      rest.get(`${testBaseUrl}/list-type`, async (_, res) => {
        return res.networkError('Failed to fetch');
      })
    );
    const client = createClient({
      serviceDomain: 'serviceDomain',
      apiKey: 'apiKey',
    });

    expect(client.get({ endpoint: 'list-type' })).rejects.toThrowError(
      new Error(
        'Network Error.\n  Details: FetchError: request to https://servicedomain.microcms.io/api/v1/list-type failed, reason: Failed to fetch'
      )
    );
  });
});
