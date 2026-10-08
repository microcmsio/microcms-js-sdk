import { http, HttpResponse } from 'msw';
import { createClient } from '../src/createClient';
import { server } from './mocks/server';
import { testBaseUrl } from './mocks/handlers';

const client = createClient({
  serviceDomain: 'serviceDomain',
  apiKey: 'apiKey',
});

describe('read methods', () => {
  test('getList forwards queries and returns the full response', async () => {
    const response = {
      contents: [{ title: 'Selected' }],
      totalCount: 1,
      offset: 0,
      limit: 1,
    };
    server.use(
      http.get(`${testBaseUrl}/blogs`, ({ request }) => {
        expect(request.headers.get('X-MICROCMS-API-KEY')).toBe('apiKey');
        const params = new URL(request.url).searchParams;
        expect(params.get('fields')).toBe('title');
        expect(params.get('depth')).toBe('0');
        expect(params.get('limit')).toBe('1');
        expect(request.cache).toBe('no-store');
        return HttpResponse.json(response);
      }),
    );
    await expect(
      client.getList<{ title: string }>({
        endpoint: 'blogs',
        queries: { fields: ['title'], depth: 0, limit: 1 },
        customRequestInit: { cache: 'no-store' },
      }),
    ).resolves.toEqual(response);
  });

  test('getListDetail uses the content ID and preserves the selected content', async () => {
    const response = { title: 'Detail' };
    server.use(
      http.get(`${testBaseUrl}/blogs/post-id`, ({ request }) => {
        expect(new URL(request.url).searchParams.get('fields')).toBe('title');
        return HttpResponse.json(response);
      }),
    );
    await expect(
      client.getListDetail({
        endpoint: 'blogs',
        contentId: 'post-id',
        queries: { fields: 'title' },
      }),
    ).resolves.toEqual(response);
  });

  test('getObject uses the endpoint URL and preserves the object response', async () => {
    const response = {
      title: 'Settings',
      createdAt: '2026-01-01T00:00:00Z',
      updatedAt: '2026-01-01T00:00:00Z',
    };
    server.use(
      http.get(`${testBaseUrl}/settings`, () => HttpResponse.json(response)),
    );
    await expect(client.getObject({ endpoint: 'settings' })).resolves.toEqual(
      response,
    );
  });

  test('read methods provide default queries and validate missing endpoints', async () => {
    await expect(
      client.getList({ endpoint: 'list-type' }),
    ).resolves.toHaveProperty('contents');
    await expect(
      client.getListDetail({ endpoint: 'list-type', contentId: 'foo' }),
    ).resolves.toHaveProperty('id', 'foo');
    await expect(
      client.getObject({ endpoint: 'object-type' }),
    ).resolves.toHaveProperty('title');
    await expect(client.getList({ endpoint: '' })).rejects.toThrow(
      'endpoint is required',
    );
    await expect(
      client.getListDetail({ endpoint: '', contentId: 'foo' }),
    ).rejects.toThrow('endpoint is required');
    await expect(client.getObject({ endpoint: '' })).rejects.toThrow(
      'endpoint is required',
    );
    await expect(client.get({ endpoint: '' })).rejects.toThrow(
      'endpoint is required',
    );
  });

  test('all-content helpers skip page requests when the API is empty', async () => {
    const calls: string[] = [];
    server.use(
      http.get(`${testBaseUrl}/empty`, ({ request }) => {
        const url = new URL(request.url);
        calls.push(url.search);
        expect(url.searchParams.get('limit')).toBe('0');
        return HttpResponse.json({
          contents: [],
          totalCount: 0,
          limit: 0,
          offset: 0,
        });
      }),
    );
    await expect(client.getAllContents({ endpoint: 'empty' })).resolves.toEqual(
      [],
    );
    await expect(
      client.getAllContentIds({ endpoint: 'empty' }),
    ).resolves.toEqual([]);
    expect(calls).toHaveLength(2);
  });
});
