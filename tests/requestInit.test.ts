import { createClient } from '../src/createClient';
import { resolveHeadersConstructor } from '../src/lib/fetch';

const fetchMock = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve(),
  })
);

const client = createClient({
  serviceDomain: 'serviceDomain',
  apiKey: 'apiKey',
  customFetch: fetchMock as any,
});

const Headers = resolveHeadersConstructor();

beforeEach(() => {
  fetchMock.mockClear();
});

describe('requestInit', () => {
  test('Default request init is passed for fetch in get request.', async () => {
    await client.get({ endpoint: 'object-type' });
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    expect(fetchMock.mock.calls[0][1]).toEqual({
      method: 'GET',
      headers: new Headers({
        'X-MICROCMS-API-KEY': 'apiKey',
      }),
    });
  });

  test('Custom request init added cache parameter is passed for fetch in get request.', async () => {
    await client.get({
      endpoint: 'object-type',
      customRequestInit: {
        cache: 'no-store',
      },
    });
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    expect(fetchMock.mock.calls[0][1]).toEqual({
      method: 'GET',
      headers: new Headers({
        'X-MICROCMS-API-KEY': 'apiKey',
      }),
      cache: 'no-store',
    });
  });

  test('Custom request init added for Next.js parameter is passed for fetch in get request.', async () => {
    await client.get({
      endpoint: 'object-type',
      customRequestInit: {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        next: {
          revalidate: 10,
        },
      },
    });
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    expect(fetchMock.mock.calls[0][1]).toEqual({
      method: 'GET',
      headers: new Headers({
        'X-MICROCMS-API-KEY': 'apiKey',
      }),
      next: {
        revalidate: 10,
      },
    });
  });

  test('Custom request init added method, headers and body parameters is not overwrited for fetch in create request.', async () => {
    await client.create({
      endpoint: 'list-type',
      content: { title: 'title' },
      customRequestInit: {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        method: 'GET',
        headers: {
          'X-MICROCMS-API-KEY': 'OverwrittenApiKey',
        },
        body: { title: 'Overwritten Title' },
      },
    });
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    expect(fetchMock.mock.calls[0][1]).toEqual({
      method: 'POST',
      headers: new Headers({
        'Content-Type': 'application/json',
        'X-MICROCMS-API-KEY': 'apiKey',
      }),
      body: JSON.stringify({ title: 'title' }),
    });
  });

  test('Custom request init added method, headers and body parameters is not overwrited for fetch in update request.', async () => {
    await client.update({
      endpoint: 'list-type',
      content: { title: 'title' },
      customRequestInit: {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        method: 'GET',
        headers: {
          'X-MICROCMS-API-KEY': 'OverwrittenApiKey',
        },
        body: { title: 'Overwritten Title' },
      },
    });
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    expect(fetchMock.mock.calls[0][1]).toEqual({
      method: 'PATCH',
      headers: new Headers({
        'Content-Type': 'application/json',
        'X-MICROCMS-API-KEY': 'apiKey',
      }),
      body: JSON.stringify({ title: 'title' }),
    });
  });

  test('Custom request init added method, headers and body parameters is not overwrited for fetch in delete request.', async () => {
    await client.delete({
      endpoint: 'list-type',
      contentId: 'contentId',
      customRequestInit: {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        method: 'GET',
        headers: {
          'X-MICROCMS-API-KEY': 'OverwrittenApiKey',
        },
      },
    });
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    expect(fetchMock.mock.calls[0][1]).toEqual({
      method: 'DELETE',
      headers: new Headers({
        'X-MICROCMS-API-KEY': 'apiKey',
      }),
    });
  });
});
