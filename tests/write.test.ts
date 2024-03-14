import { http, HttpResponse } from 'msw';

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
      http.post(`${testBaseUrl}/list-type`, async ({ request }) => {
        const url = new URL(request.url);
        const statusParams = url.searchParams.get('status');
        const body = await request.json();
        postApiMockFn(statusParams, body);
        return HttpResponse.json({ id: 'foo' });
      }),
      http.put(`${testBaseUrl}/list-type/foo`, async ({ request }) => {
        const url = new URL(request.url);
        const statusParams = url.searchParams.get('status');
        const body = await request.json();
        putApiMockFn(statusParams, body);
        return HttpResponse.json({ id: 'foo' }, { status: 201 });
      }),
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
      new Error('endpoint is required'),
    );
  });
});

describe('update', () => {
  const patchListApiMockFn = jest.fn();
  const patchObjectApiMockFn = jest.fn();

  beforeEach(() => {
    server.use(
      http.patch(`${testBaseUrl}/list-type/foo`, async ({ request }) => {
        const body = await request.json();
        patchListApiMockFn(body);
        return HttpResponse.json({ id: 'foo' }, { status: 200 });
      }),
      http.patch(`${testBaseUrl}/object-type`, async ({ request }) => {
        const body = await request.json();
        patchObjectApiMockFn(body);
        return HttpResponse.json({ id: 'foo' }, { status: 200 });
      }),
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
      new Error('endpoint is required'),
    );
  });
});

describe('delete', () => {
  const deleteApiMockFn = jest.fn();

  beforeEach(() => {
    server.use(
      http.delete(`${testBaseUrl}/list-type/foo`, () => {
        deleteApiMockFn();
        return new HttpResponse(null, { status: 202 });
      }),
    );
  });
  afterEach(() => {
    deleteApiMockFn.mockClear();
  });

  test('List format content can be deleted', async () => {
    await client.delete({ endpoint: 'list-type', contentId: 'foo' });
    expect(deleteApiMockFn).toHaveBeenCalledTimes(1);
  });

  test('Returns an error message if `endpoint` is not specified', () => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    expect(client.delete({})).rejects.toThrow(
      new Error('endpoint is required'),
    );
  });
  test('Returns an error message if `contentId` is not specified', () => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    expect(client.delete({ endpoint: 'list-type' })).rejects.toThrow(
      new Error('contentId is required'),
    );
  });
});
