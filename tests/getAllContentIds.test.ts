import { http, HttpResponse } from 'msw';
import { createClient } from '../src/createClient';
import { testBaseUrl } from './mocks/handlers';
import { server } from './mocks/server';

const client = createClient({
  serviceDomain: 'serviceDomain',
  apiKey: 'apiKey',
});

describe('getAllContentIds', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  test('should fetch all content ids', async () => {
    server.use(
      http.get(
        `${testBaseUrl}/getAllContentIds-list-type`,
        () => {
          return HttpResponse.json(
            {
              totalCount: 100,
            },
            { status: 200 },
          );
        },
        { once: true },
      ),
      http.get(
        `${testBaseUrl}/getAllContentIds-list-type`,
        () => {
          return HttpResponse.json(
            {
              contents: Array(100)
                .fill(null)
                .map((_, index) => ({ id: `id${index}` })),
            },
            { status: 200 },
          );
        },
        { once: true },
      ),
    );

    const result = await client.getAllContentIds({
      endpoint: 'getAllContentIds-list-type',
    });

    expect(result).toHaveLength(100);
    expect(result).toContain('id0');
    expect(result).toContain('id99');
  });

  test('should handle pagination and fetch more than limit', async () => {
    server.use(
      http.get(
        `${testBaseUrl}/getAllContentIds-list-type`,
        () => {
          return HttpResponse.json(
            {
              totalCount: 250,
            },
            { status: 200 },
          );
        },
        { once: true },
      ),
      http.get(
        `${testBaseUrl}/getAllContentIds-list-type`,
        () => {
          return HttpResponse.json(
            {
              contents: Array(100)
                .fill(null)
                .map((_, index) => ({ id: `id${index}` })),
            },
            { status: 200 },
          );
        },
        { once: true },
      ),
      http.get(
        `${testBaseUrl}/getAllContentIds-list-type`,
        () => {
          return HttpResponse.json(
            {
              contents: Array(100)
                .fill(null)
                .map((_, index) => ({ id: `id${index + 100}` })),
            },
            { status: 200 },
          );
        },
        { once: true },
      ),
      http.get(
        `${testBaseUrl}/getAllContentIds-list-type`,
        () => {
          return HttpResponse.json(
            {
              contents: Array(50)
                .fill(null)
                .map((_, index) => ({ id: `id${index + 200}` })),
            },
            { status: 200 },
          );
        },
        { once: true },
      ),
    );

    const result = await client.getAllContentIds({
      endpoint: 'getAllContentIds-list-type',
    });

    expect(result).toHaveLength(250);
    expect(result).toContain('id0');
    expect(result).toContain('id249');
  });

  test('should fetch all content ids with alternateField field', async () => {
    server.use(
      http.get(
        `${testBaseUrl}/getAllContentIds-list-type`,
        () => {
          return HttpResponse.json(
            {
              totalCount: 100,
            },
            { status: 200 },
          );
        },
        { once: true },
      ),
      http.get(
        `${testBaseUrl}/getAllContentIds-list-type`,
        () => {
          return HttpResponse.json(
            {
              contents: Array(100)
                .fill(null)
                .map((_, index) => ({ url: `id${index}` })),
            },
            { status: 200 },
          );
        },
        { once: true },
      ),
    );

    const result = await client.getAllContentIds({
      endpoint: 'getAllContentIds-list-type',
      alternateField: 'url',
    });

    expect(result).toHaveLength(100);
    expect(result).toContain('id0');
    expect(result).toContain('id99');
  });

  test('should throw error when alternateField field is not string', async () => {
    server.use(
      http.get(
        `${testBaseUrl}/getAllContentIds-list-type`,
        () => {
          return HttpResponse.json(
            {
              totalCount: 100,
            },
            { status: 200 },
          );
        },
        { once: true },
      ),
      http.get(
        `${testBaseUrl}/getAllContentIds-list-type`,
        () => {
          return HttpResponse.json(
            {
              contents: Array(100)
                .fill(null)
                .map(() => ({
                  image: { url: 'url', width: 100, height: 100 },
                })),
            },
            { status: 200 },
          );
        },
        { once: true },
      ),
    );

    await expect(
      client.getAllContentIds({
        endpoint: 'getAllContentIds-list-type',
        alternateField: 'image',
      }),
    ).rejects.toThrowError(
      'The value of the field specified by `alternateField` is not a string.',
    );
  });
});
