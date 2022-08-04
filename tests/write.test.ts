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
      rest.post(`${testBaseUrl}/list-type`, async (req, res, ctx) => {
        const statusParams = req.url.searchParams.get('status');
        const body = await req.json();
        postApiMockFn(statusParams, body);
        return res(ctx.json({ id: 'foo' }));
      }),
      rest.put(`${testBaseUrl}/list-type/foo`, async (req, res, ctx) => {
        const statusParams = req.url.searchParams.get('status');
        const body = await req.json();
        putApiMockFn(statusParams, body);
        return res(ctx.status(201), ctx.json({ id: 'foo' }));
      })
    );
  });
  afterEach(() => {
    postApiMockFn.mockClear();
    putApiMockFn.mockClear();
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
    // Confirm that body is specified.
    expect(postApiMockFn).toHaveBeenCalledWith(null, {
      title: 'title',
      body: 'body',
    });
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
    // Confirm that status=draft is specified in the query string and that body is specified.
    expect(postApiMockFn).toHaveBeenCalledWith('draft', {
      title: 'title',
      body: 'body',
    });
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
    // Confirm that body is specified.
    expect(putApiMockFn).toHaveBeenCalledWith(null, {
      title: 'title',
      body: 'body',
    });
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
    // Confirm that status=draft is specified in the query string and that body is specified.
    expect(putApiMockFn).toHaveBeenCalledWith('draft', {
      title: 'title',
      body: 'body',
    });
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
  const patchListApiMockFn = jest.fn();
  const patchObjectApiMockFn = jest.fn();

  beforeEach(() => {
    server.use(
      rest.patch(`${testBaseUrl}/list-type/foo`, async (req, res, ctx) => {
        const body = await req.json();
        patchListApiMockFn(body);
        return res(ctx.status(200), ctx.json({ id: 'foo' }));
      }),
      rest.patch(`${testBaseUrl}/object-type`, async (req, res, ctx) => {
        const body = await req.json();
        patchObjectApiMockFn(body);
        return res(ctx.status(200), ctx.json({ id: 'foo' }));
      })
    );
  });
  afterEach(() => {
    patchListApiMockFn.mockClear();
    patchObjectApiMockFn.mockClear();
  });

  test('List format content can be updated', async () => {
    const data = await client.update<ContentType>({
      endpoint: 'list-type',
      contentId: 'foo',
      content: {
        title: 'title',
      },
    });
    expect(data).toEqual({ id: 'foo' });
    // Confirm PUT api was called
    expect(patchListApiMockFn).toHaveBeenCalledTimes(1);
    // Confirm that body is specified.
    expect(patchListApiMockFn).toHaveBeenCalledWith({
      title: 'title',
    });
  });
  test('Object type content can be updated', async () => {
    const data = await client.update<ContentType>({
      endpoint: 'object-type',
      content: {
        title: 'title',
      },
    });
    expect(data).toEqual({ id: 'foo' });
    // Confirm PUT api was called
    expect(patchObjectApiMockFn).toHaveBeenCalledTimes(1);
    // Confirm that body is specified.
    expect(patchObjectApiMockFn).toHaveBeenCalledWith({
      title: 'title',
    });
  });

  test('Returns an error message if `endpoint` is not specified', () => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    expect(client.update({})).rejects.toThrow(
      new Error('endpoint is required')
    );
  });
});

describe('delete', () => {
  test.todo('List format content can be deleted');

  test.todo('Returns an error message if `endpoint` is not specified');
  test.todo('Returns an error message if `contentId` is not specified');
});
