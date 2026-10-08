import { File } from 'node:buffer';
import { createManagementClient } from '../src/createManagementClient';
import { testBaseManagementUrlOfVersion1 } from './mocks/handlers';

const client = createManagementClient({
  serviceDomain: 'serviceDomain',
  apiKey: 'apiKey',
});
const result = { url: 'https://example.com/uploaded.png' };

describe('uploadMedia', () => {
  let fetchMock: jest.SpyInstance<
    ReturnType<typeof fetch>,
    Parameters<typeof fetch>
  >;

  beforeEach(() => {
    // Inspect FormData directly to avoid MSW's multipart parsing limitation.
    fetchMock = jest
      .spyOn(globalThis, 'fetch')
      .mockImplementation(async () => new Response(JSON.stringify(result)));
  });
  afterEach(() => jest.restoreAllMocks());

  const sentFile = (call = 0): Blob & { name: string } => {
    const [url, options] = fetchMock.mock.calls[call];
    expect(url).toBe(`${testBaseManagementUrlOfVersion1}/media`);
    expect(options?.method).toBe('POST');
    expect(new Headers(options?.headers).get('X-MICROCMS-API-KEY')).toBe(
      'apiKey',
    );
    expect(new Headers(options?.headers).has('Content-Type')).toBe(false);
    expect(options?.body).toBeInstanceOf(FormData);
    const form = options?.body as FormData;
    expect([...form.keys()]).toEqual(['file']);
    const file = form.get('file');
    expect(file).toBeInstanceOf(Blob);
    return file as Blob & { name: string };
  };

  test('uploads a Blob with an explicit file name and intact bytes', async () => {
    await expect(
      client.uploadMedia({
        data: new Blob(['hello'], { type: 'image/png' }),
        name: 'image.png',
      }),
    ).resolves.toEqual(result);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const file = sentFile();
    expect(file.name).toBe('image.png');
    expect(file.type).toBe('image/png');
    expect(await file.text()).toBe('hello');
  });

  test('uses the embedded name of a File on every supported Node.js version', async () => {
    const file = new File(['data'], 'original.png', { type: 'image/png' });
    // Node's File implements Blob but lacks DOM File's webkitRelativePath.
    await client.uploadMedia({
      data: file as unknown as Blob,
      name: 'ignored.png',
    });
    const sent = sentFile();
    expect(sent.name).toBe('original.png');
    expect(sent.type).toBe('image/png');
    expect(await sent.text()).toBe('data');
  });

  test('joins all ReadableStream chunks and preserves the type and file name', async () => {
    const data = new ReadableStream<Uint8Array>({
      start(controller) {
        controller.enqueue(new TextEncoder().encode('first'));
        controller.enqueue(new TextEncoder().encode('second'));
        controller.close();
      },
    });
    await client.uploadMedia({ data, name: 'stream.png', type: 'image/png' });
    const file = sentFile();
    expect(file.name).toBe('stream.png');
    expect(file.type).toBe('image/png');
    expect(await file.text()).toBe('firstsecond');
  });

  test('forwards an empty stream without adding bytes', async () => {
    await client.uploadMedia({
      data: new ReadableStream({
        start(controller) {
          controller.close();
        },
      }),
      name: 'empty.png',
      type: 'image/png',
    });
    expect(sentFile().size).toBe(0);
  });

  test('requires a name for unnamed Blobs', async () => {
    await expect(
      // @ts-expect-error Missing Blob names must also fail at runtime.
      client.uploadMedia({ data: new Blob(['data']) }),
    ).rejects.toThrow('name is required when data is a Blob');
    expect(fetchMock).not.toHaveBeenCalled();
  });

  test('requires name and type for ReadableStreams', async () => {
    const data = new ReadableStream();
    await expect(
      // @ts-expect-error Missing stream names must also fail at runtime.
      client.uploadMedia({ data }),
    ).rejects.toThrow('name is required when data is a ReadableStream');
    await expect(
      // @ts-expect-error Missing stream types must also fail at runtime.
      client.uploadMedia({ data, name: 'stream.png' }),
    ).rejects.toThrow('type is required when data is a ReadableStream');
    expect(fetchMock).not.toHaveBeenCalled();
  });

  test.each([
    [
      'string',
      'https://example.com/source.png',
      undefined,
      undefined,
      'redirected.png',
    ],
    [
      'URL',
      new URL('https://example.com/source.png'),
      'custom.png',
      { Authorization: 'Bearer TEST_ONLY' },
      'custom.png',
    ],
  ])(
    'downloads a %s source before uploading it',
    async (_label, data, name, customRequestHeaders, expectedName) => {
      const download = new Response(
        new Blob(['downloaded'], { type: 'image/png' }),
      );
      // fetch's response.url reflects redirects; the fallback file name uses it.
      Object.defineProperty(download, 'url', {
        value: 'https://example.com/redirected.png',
      });
      fetchMock.mockResolvedValueOnce(download);
      await expect(
        client.uploadMedia({ data, name, customRequestHeaders }),
      ).resolves.toEqual(result);
      expect(fetchMock).toHaveBeenCalledTimes(2);
      expect(fetchMock.mock.calls[0]).toEqual([
        'https://example.com/source.png',
        customRequestHeaders ? { headers: customRequestHeaders } : undefined,
      ]);
      const file = sentFile(1);
      expect(file.name).toBe(expectedName);
      expect(file.type).toBe('image/png');
      expect(await file.text()).toBe('downloaded');
      expect(
        new Headers(fetchMock.mock.calls[1][1]?.headers).has('Authorization'),
      ).toBe(false);
    },
  );

  test('rejects invalid source URLs without fetching or uploading', async () => {
    await expect(
      client.uploadMedia({ data: 'not a URL' }),
    ).rejects.toMatchObject({ name: 'TypeError' });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  test('propagates a source download failure and does not send an upload', async () => {
    const original = new TypeError('download failed');
    fetchMock.mockRejectedValueOnce(original);
    await expect(
      client.uploadMedia({ data: new URL('https://example.com/source.png') }),
    ).rejects.toBe(original);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  test('propagates stream failures without sending an upload', async () => {
    const original = new Error('stream failed');
    const data = new ReadableStream({
      start(controller) {
        controller.error(original);
      },
    });
    await expect(
      client.uploadMedia({ data, name: 'stream.png', type: 'image/png' }),
    ).rejects.toBe(original);
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
