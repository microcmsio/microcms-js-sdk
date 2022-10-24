import { rest } from 'msw';
import { createClient } from '../src/createClient';
import { testBaseUrl } from './mocks/handlers';
import { server } from './mocks/server';

const client = createClient({
  serviceDomain: 'serviceDomain',
  apiKey: 'apiKey',
});

describe('get', () => {
  test('List format contents can be retrieved', async () => {
    const data = await client.get({ endpoint: 'list-type' });
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
  });
  test('The contents of the details of the list format can be retrieved', async () => {
    const data = await client.get({ endpoint: 'list-type', contentId: 'foo' });
    expect(data).toEqual({
      id: 'foo',
      title: 'Hello, microCMS!',
      createdAt: '2022-10-28T04:04:29.625Z',
      updatedAt: '2022-10-28T04:04:29.625Z',
      publishedAt: '2022-10-28T04:04:29.625Z',
      revisedAt: '2022-10-28T04:04:29.625Z',
    });
  });
  test('Object type contents can be retrieved.', async () => {
    const data = await client.get({ endpoint: 'object-type' });
    expect(data).toEqual({
      id: 'foo',
      title: 'Hello, microCMS!',
      createdAt: '2022-10-28T04:04:29.625Z',
      updatedAt: '2022-10-28T04:04:29.625Z',
      publishedAt: '2022-10-28T04:04:29.625Z',
      revisedAt: '2022-10-28T04:04:29.625Z',
    });
  });

  test('Returns an error message if `endpoint` is not specified', () => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    expect(client.get({})).rejects.toThrow(new Error('endpoint is required'));
  });
  test('Return error message in case of server error', () => {
    // Create temporary server error
    server.use(
      rest.get(`${testBaseUrl}/list-type`, (_, res, ctx) => {
        return res.once(
          ctx.status(500),
          ctx.json({ message: 'Internal Server Error' })
        );
      })
    );

    expect(client.get({ endpoint: 'list-type' })).rejects.toThrow(
      new Error(
        'serviceDomain or endpoint may be wrong.\n Details: Error: fetch API response status: 500'
      )
    );
  });
});
