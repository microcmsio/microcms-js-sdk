import { rest } from 'msw';

import { createClient } from '../src/createClient';

import { testBaseUrl } from './mocks/handlers';
import { server } from './mocks/server';

const client = createClient({
  serviceDomain: 'serviceDomain',
  apiKey: 'apiKey',
});

interface ContentType {
  title: string;
  body?: string;
}

describe('create', () => {
  const postApiMockFn = jest.fn();
  const putApiMockFn = jest.fn();

  beforeEach(() => {
    server.use(
      rest.post(`${testBaseUrl}/list-type`, (req, res, ctx) => {
        const statusParams = req.url.searchParams.get('status');
        postApiMockFn(statusParams);
        return res(ctx.json({ id: 'foo' }));
      }),
      rest.put(`${testBaseUrl}/list-type/foo`, (req, res, ctx) => {
        const statusParams = req.url.searchParams.get('status');
        putApiMockFn(statusParams);
        return res(ctx.status(201), ctx.json({ id: 'foo' }));
      })
    );
  });

  test('Content can be posted without specifying an id', async () => {
    const data = await client.create<ContentType>({
      endpoint: 'list-type',
      content: {
        title: 'title',
        body: 'body',
      },
    });
    expect(data).toEqual({ id: 'foo' });
    // Confirm POST api was called
    expect(postApiMockFn).toHaveBeenCalledTimes(1);
  });
  test('Draft content can be posted by specifying an id', async () => {
    const data = await client.create<ContentType>({
      endpoint: 'list-type',
      content: {
        title: 'title',
        body: 'body',
      },
      isDraft: true,
    });
    expect(data).toEqual({ id: 'foo' });
    // Confirm POST api was called
    expect(postApiMockFn).toHaveBeenCalledTimes(1);
    // Confirm that status=draft is specified for the query string
    expect(postApiMockFn).toHaveBeenCalledWith('draft');
  });
  test('Content can be posted by specifying an id', async () => {
    const data = await client.create<ContentType>({
      endpoint: 'list-type',
      contentId: 'foo',
      content: {
        title: 'title',
        body: 'body',
      },
    });
    expect(data).toEqual({ id: 'foo' });
    // Confirm PUT api was called
    expect(putApiMockFn).toHaveBeenCalledTimes(1);
  });
  test('Draft content can be posted by specifying an id', async () => {
    const data = await client.create<ContentType>({
      endpoint: 'list-type',
      contentId: 'foo',
      content: {
        title: 'title',
        body: 'body',
      },
      isDraft: true,
    });
    expect(data).toEqual({ id: 'foo' });
    // Confirm PUT api was called
    expect(putApiMockFn).toHaveBeenCalledTimes(1);
    // Confirm that status=draft is specified for the query string
    expect(putApiMockFn).toHaveBeenCalledWith('draft');
  });

  test('Returns an error message if `endpoint` is not specified', () => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    expect(client.create({})).rejects.toThrow(
      new Error('endpoint is required')
    );
  });
});
describe('update', () => {
  test.todo('List format content can be updated');
  test.todo('Object type content can be updated');

  test.todo('Returns an error message if `endpoint` is not specified');
});
describe('delete', () => {
  test.todo('List format content can be deleted');

  test.todo('Returns an error message if `endpoint` is not specified');
  test.todo('Returns an error message if `contentId` is not specified');
});
