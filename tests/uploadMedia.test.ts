import { http, HttpResponse } from 'msw';
import { createManagementClient } from '../src/createManagementClient';
import { testBaseManagementUrlOfVersion1 } from './mocks/handlers';
import { server } from './mocks/server';
import { File } from 'buffer';

const client = createManagementClient({
  serviceDomain: 'serviceDomain',
  apiKey: 'apiKey',
});

// mswの不具合で、FormDataのテストが終わらないため、テストをスキップ
// https://github.com/mswjs/msw/issues/2078
describe.skip('uploadMedia', () => {
  const uploadMediaApiMockFn = jest.fn();

  beforeEach(() => {
    server.use(
      http.post(
        `${testBaseManagementUrlOfVersion1}/media`,
        async ({ request }) => {
          const data = await request.formData();
          const file = data.get('file');

          uploadMediaApiMockFn(file);

          return HttpResponse.json(
            { url: 'https://images.microcms-assets.io/image.png' },
            { status: 201 },
          );
        },
      ),
    );
  });

  afterEach(() => {
    uploadMediaApiMockFn.mockClear();
  });

  test('If the data received is a Blob', async () => {
    await client.uploadMedia({
      data: new Blob([], { type: 'image/png' }),
      name: 'image.png',
    });

    expect(uploadMediaApiMockFn).toHaveBeenCalledTimes(1);
    expect(uploadMediaApiMockFn.mock.calls[0][0].name).toBe('image.png');
    expect(uploadMediaApiMockFn.mock.calls[0][0].type).toBe('image/png');
  });

  test('If the data received is a File', async () => {
    await client.uploadMedia({
      // Node.jsのFileにはwebkitRelativePathプロパティが存在しないためanyで回避
      data: new File([], 'image.png', { type: 'image/png' }) as any,
    });

    expect(uploadMediaApiMockFn).toHaveBeenCalledTimes(1);
    expect(uploadMediaApiMockFn.mock.calls[0][0].name).toBe('image.png');
    expect(uploadMediaApiMockFn.mock.calls[0][0].type).toBe('image/png');
  });

  test('If the data received is a ReadableStream', async () => {
    await client.uploadMedia({
      data: new ReadableStream({
        start(controller) {
          controller.enqueue(new Uint8Array([]));
          controller.close();
        },
      }),
      name: 'image.png',
      type: 'image/png',
    });

    expect(uploadMediaApiMockFn).toHaveBeenCalledTimes(1);
    expect(uploadMediaApiMockFn.mock.calls[0][0].name).toBe('image.png');
    expect(uploadMediaApiMockFn.mock.calls[0][0].type).toBe('image/png');
  });

  test('If the data received is a URL or string', async () => {
    server.use(
      http.get('https://example.com/image.png', async () => {
        return HttpResponse.arrayBuffer(
          await new Blob([], { type: 'image/png' }).arrayBuffer(),
          { headers: { 'Content-Type': 'image/png' } },
        );
      }),
    );

    await client.uploadMedia({
      data: 'https://example.com/image.png',
    });

    expect(uploadMediaApiMockFn).toHaveBeenCalledTimes(1);
    expect(uploadMediaApiMockFn.mock.calls[0][0].name).toBe('image.png');
    expect(uploadMediaApiMockFn.mock.calls[0][0].type).toBe('image/png');
  });
});
