import { rest } from 'msw';
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
      rest.get(`${testBaseUrl}/getAllContentIds-list-type`, (_, res, ctx) => {
        return res.once(
          ctx.status(200),
          ctx.json({
            totalCount: 100,
          }),
        );
      }),
      rest.get(`${testBaseUrl}/getAllContentIds-list-type`, (_, res, ctx) => {
        return res.once(
          ctx.status(200),
          ctx.json({
            contents: Array(100)
              .fill(null)
              .map((_, index) => ({ id: `id${index}` })),
          }),
        );
      }),
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
      rest.get(`${testBaseUrl}/getAllContentIds-list-type`, (_, res, ctx) => {
        return res.once(
          ctx.status(200),
          ctx.json({
            totalCount: 250,
          }),
        );
      }),
      rest.get(`${testBaseUrl}/getAllContentIds-list-type`, (_, res, ctx) => {
        return res.once(
          ctx.status(200),
          ctx.json({
            contents: Array(100)
              .fill(null)
              .map((_, index) => ({ id: `id${index}` })),
          }),
        );
      }),
      rest.get(`${testBaseUrl}/getAllContentIds-list-type`, (_, res, ctx) => {
        return res.once(
          ctx.status(200),
          ctx.json({
            contents: Array(100)
              .fill(null)
              .map((_, index) => ({ id: `id${index + 100}` })),
          }),
        );
      }),
      rest.get(`${testBaseUrl}/getAllContentIds-list-type`, (_, res, ctx) => {
        return res.once(
          ctx.status(200),
          ctx.json({
            contents: Array(50)
              .fill(null)
              .map((_, index) => ({ id: `id${index + 200}` })),
          }),
        );
      }),
    );

    const result = await client.getAllContentIds({
      endpoint: 'getAllContentIds-list-type',
    });

    expect(result).toHaveLength(250);
    expect(result).toContain('id0');
    expect(result).toContain('id249');
  });

  test('should fetch all content ids with target field', async () => {
    server.use(
      rest.get(`${testBaseUrl}/getAllContentIds-list-type`, (_, res, ctx) => {
        return res.once(
          ctx.status(200),
          ctx.json({
            totalCount: 100,
          }),
        );
      }),
      rest.get(`${testBaseUrl}/getAllContentIds-list-type`, (_, res, ctx) => {
        return res.once(
          ctx.status(200),
          ctx.json({
            contents: Array(100)
              .fill(null)
              .map((_, index) => ({ url: `id${index}` })),
          }),
        );
      }),
    );

    const result = await client.getAllContentIds({
      endpoint: 'getAllContentIds-list-type',
      target: 'url',
    });

    expect(result).toHaveLength(100);
    expect(result).toContain('id0');
    expect(result).toContain('id99');
  });

  test('should throw error when target field is not string', async () => {
    server.use(
      rest.get(`${testBaseUrl}/getAllContentIds-list-type`, (_, res, ctx) => {
        return res.once(
          ctx.status(200),
          ctx.json({
            totalCount: 100,
          }),
        );
      }),
      rest.get(`${testBaseUrl}/getAllContentIds-list-type`, (_, res, ctx) => {
        return res.once(
          ctx.status(200),
          ctx.json({
            contents: Array(100)
              .fill(null)
              .map(() => ({ image: { url: 'url', width: 100, height: 100 } })),
          }),
        );
      }),
    );

    await expect(
      client.getAllContentIds({
        endpoint: 'getAllContentIds-list-type',
        target: 'image',
      }),
    ).rejects.toThrowError(
      'The value of the field specified by `target` is not a string.',
    );
  });
});
