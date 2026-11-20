import { http, HttpResponse } from 'msw';

import { createClient } from '../src/createClient';
import { API_VERSION_1, BASE_DOMAIN } from '../src/utils/constants';
import { parseQuery } from '../src/utils/parseQuery';
import type { MicroCMSQueries } from '../src/types';
import { server } from './mocks/server';

/**
 * Placeholder only. This file must not contain a real credential.
 * The assertion compares the outgoing header with the value passed to createClient.
 */
const PLACEHOLDER_API_KEY = 'placeholder-api-key';
const SERVICE_DOMAIN = 'serviceDomain';

const serviceOrigin = new URL(`https://${SERVICE_DOMAIN}.${BASE_DOMAIN}`)
  .origin;
const pathPrefix = `/api/${API_VERSION_1}/`;

const applicationQueries: MicroCMSQueries = {
  fields: 'title',
  depth: 1,
};

type Client = ReturnType<typeof createClient>;

type CapturedRequest = {
  method: string;
  url: string;
  apiKey: string | null;
};

type Payload = {
  name: string;
  method: string;
  endpoint: string;
  contentId?: string;
  expectedQueries: MicroCMSQueries;
  call: (client: Client) => Promise<unknown>;
};

const captured: CapturedRequest[] = [];

const client = createClient({
  serviceDomain: SERVICE_DOMAIN,
  apiKey: PLACEHOLDER_API_KEY,
});

const contentIdPayloads: ReadonlyArray<readonly [string, string]> = [
  ['a question mark and ampersand', 'article?depth=3&fields=body,email'],
  ['dot segments', '../inquiries/private-id'],
  ['percent-encoded dot segments', '%2e%2e/inquiries/private-id'],
  ['backslashes', '..\\inquiries\\private-id'],
  ['an extra slash', 'other-endpoint/private-id'],
  ['a fragment', 'article#'],
];

const endpointPayloads: ReadonlyArray<readonly [string, string]> = [
  ['a question mark and ampersand', 'articles?depth=3&fields=body,email'],
  ['dot segments', '../inquiries'],
  ['percent-encoded dot segments', '%2e%2e/%2e%2e/inquiries'],
  ['backslashes', '..\\inquiries'],
];

function summarize(request: CapturedRequest) {
  try {
    const url = new URL(request.url);
    return {
      method: request.method,
      dispatchedPath: url.pathname + url.search,
      sentClientApiKey: request.apiKey === PLACEHOLDER_API_KEY,
    };
  } catch {
    return {
      method: request.method,
      dispatchedPath: request.url,
      sentClientApiKey: request.apiKey === PLACEHOLDER_API_KEY,
    };
  }
}

/**
 * A request is contained when every caller-supplied path value is one segment
 * and the query string is only the one the method built from its queries.
 * Refusal is contained only when no request was issued first.
 */
function isContained(request: CapturedRequest, payload: Payload): boolean {
  if (request.method !== payload.method) {
    return false;
  }
  if (request.apiKey !== PLACEHOLDER_API_KEY) {
    return false;
  }

  let url: URL;
  try {
    url = new URL(request.url);
  } catch {
    return false;
  }

  if (url.origin !== serviceOrigin) {
    return false;
  }
  if (!url.pathname.startsWith(pathPrefix)) {
    return false;
  }

  const expected =
    payload.contentId === undefined
      ? [payload.endpoint]
      : [payload.endpoint, payload.contentId];

  let segments: string[];
  try {
    segments = url.pathname
      .slice(pathPrefix.length)
      .split('/')
      .map((segment) => decodeURIComponent(segment));
  } catch {
    return false;
  }

  if (segments.length !== expected.length) {
    return false;
  }
  for (let index = 0; index < expected.length; index += 1) {
    if (segments[index] !== expected[index]) {
      return false;
    }
  }

  const dispatchedQuery = url.search.startsWith('?')
    ? url.search.slice(1)
    : url.search;
  return dispatchedQuery === parseQuery(payload.expectedQueries);
}

async function expectPayloadsContained(payloads: Payload[]) {
  const violations: unknown[] = [];

  for (const payload of payloads) {
    captured.length = 0;
    let thrown: unknown;
    try {
      await payload.call(client);
    } catch (error) {
      thrown = error;
    }

    const escaped = captured.filter(
      (request) => !isContained(request, payload),
    );
    const refused = captured.length === 0 && thrown !== undefined;
    const contained = captured.length > 0 && escaped.length === 0;
    if (!refused && !contained) {
      violations.push({
        payload: payload.name,
        thrown: thrown instanceof Error ? thrown.name : thrown,
        requests: captured.map(summarize),
      });
    }
  }

  expect(violations).toEqual([]);
}

function contentIdCases(
  operation: string,
  method: string,
  call: (
    client: Client,
    endpoint: string,
    contentId: string,
  ) => Promise<unknown>,
  expectedQueries: MicroCMSQueries,
): Payload[] {
  return contentIdPayloads.map(([label, contentId]) => ({
    name: `${operation} content id containing ${label}`,
    method,
    endpoint: 'articles',
    contentId,
    expectedQueries,
    call: (api) => call(api, 'articles', contentId),
  }));
}

function endpointCases(
  operation: string,
  method: string,
  contentId: string | undefined,
  call: (
    client: Client,
    endpoint: string,
    contentId: string | undefined,
  ) => Promise<unknown>,
  expectedQueries: MicroCMSQueries,
): Payload[] {
  return endpointPayloads.map(([label, endpoint]) => ({
    name: `${operation} endpoint containing ${label}`,
    method,
    endpoint,
    contentId,
    expectedQueries,
    call: (api) => call(api, endpoint, contentId),
  }));
}

beforeEach(() => {
  captured.length = 0;
  server.use(
    http.all('*', ({ request }) => {
      captured.push({
        method: request.method,
        url: request.url,
        apiKey: request.headers.get('X-MICROCMS-API-KEY'),
      });
      return HttpResponse.json({
        id: 'content-id',
        contents: [],
        totalCount: 0,
        limit: 0,
        offset: 0,
      });
    }),
  );
});

describe('content identifiers stay inside one path segment', () => {
  const read = async (
    api: Client,
    endpoint: string,
    contentId: string | undefined,
  ) =>
    api.get({
      endpoint,
      contentId,
      queries: applicationQueries,
    });

  test('get keeps a normal content id on that content', async () => {
    await expectPayloadsContained([
      {
        name: 'get normal content id',
        method: 'GET',
        endpoint: 'articles',
        contentId: 'article-1',
        expectedQueries: applicationQueries,
        call: (api) => read(api, 'articles', 'article-1'),
      },
    ]);
  });

  test('get does not let the content id or endpoint change the request target', async () => {
    await expectPayloadsContained([
      ...contentIdCases('get', 'GET', read, applicationQueries),
      ...endpointCases('get', 'GET', 'private-id', read, applicationQueries),
    ]);
  });

  test('getList does not let the endpoint change the request target', async () => {
    await expectPayloadsContained(
      endpointCases(
        'getList',
        'GET',
        undefined,
        (api, endpoint) =>
          api.getList({ endpoint, queries: applicationQueries }),
        applicationQueries,
      ),
    );
  });

  test('getListDetail does not let the content id or endpoint change the request target', async () => {
    const call = (
      api: Client,
      endpoint: string,
      contentId: string | undefined,
    ) =>
      api.getListDetail({
        endpoint,
        contentId: contentId ?? 'private-id',
        queries: applicationQueries,
      });

    await expectPayloadsContained([
      ...contentIdCases('getListDetail', 'GET', call, applicationQueries),
      ...endpointCases(
        'getListDetail',
        'GET',
        'private-id',
        call,
        applicationQueries,
      ),
    ]);
  });

  test('getObject does not let the endpoint change the request target', async () => {
    await expectPayloadsContained(
      endpointCases(
        'getObject',
        'GET',
        undefined,
        (api, endpoint) =>
          api.getObject({ endpoint, queries: applicationQueries }),
        applicationQueries,
      ),
    );
  });

  test('getAllContentIds does not let the endpoint change the request target', async () => {
    const expectedQueries: MicroCMSQueries = {
      limit: 0,
      fields: 'id',
      depth: 0,
    };
    await expectPayloadsContained([
      {
        name: 'getAllContentIds normal endpoint',
        method: 'GET',
        endpoint: 'articles',
        expectedQueries,
        call: (api) => api.getAllContentIds({ endpoint: 'articles' }),
      },
      ...endpointCases(
        'getAllContentIds',
        'GET',
        undefined,
        (api, endpoint) => api.getAllContentIds({ endpoint }),
        expectedQueries,
      ),
    ]);
  });

  test('getAllContents does not let the endpoint change the request target', async () => {
    const expectedQueries: MicroCMSQueries = {
      ...applicationQueries,
      limit: 0,
    };
    await expectPayloadsContained([
      {
        name: 'getAllContents normal endpoint',
        method: 'GET',
        endpoint: 'articles',
        expectedQueries,
        call: (api) =>
          api.getAllContents({
            endpoint: 'articles',
            queries: applicationQueries,
          }),
      },
      ...endpointCases(
        'getAllContents',
        'GET',
        undefined,
        (api, endpoint) =>
          api.getAllContents({ endpoint, queries: applicationQueries }),
        expectedQueries,
      ),
    ]);
  });

  test('create does not let the content id or endpoint change the write target', async () => {
    const withId = async (
      api: Client,
      endpoint: string,
      contentId: string | undefined,
    ) =>
      api.create({
        endpoint,
        contentId,
        content: { title: 'title' },
      });

    await expectPayloadsContained([
      ...contentIdCases('create', 'PUT', withId, {}),
      ...endpointCases('create', 'PUT', 'private-id', withId, {}),
      ...endpointCases(
        'create',
        'POST',
        undefined,
        (api, endpoint) =>
          api.create({ endpoint, content: { title: 'title' } }),
        {},
      ),
    ]);
  });

  test('update does not let the content id or endpoint change the write target', async () => {
    const withId = async (
      api: Client,
      endpoint: string,
      contentId: string | undefined,
    ) =>
      api.update({
        endpoint,
        contentId,
        content: { title: 'title' },
      });

    await expectPayloadsContained([
      ...contentIdCases('update', 'PATCH', withId, {}),
      ...endpointCases('update', 'PATCH', 'private-id', withId, {}),
      ...endpointCases(
        'update',
        'PATCH',
        undefined,
        (api, endpoint) =>
          api.update({ endpoint, content: { title: 'title' } }),
        {},
      ),
    ]);
  });

  test('delete does not let the content id or endpoint change the delete target', async () => {
    const call = (
      api: Client,
      endpoint: string,
      contentId: string | undefined,
    ) =>
      api.delete({
        endpoint,
        contentId: contentId ?? 'private-id',
      });

    await expectPayloadsContained([
      {
        name: 'delete normal content id',
        method: 'DELETE',
        endpoint: 'articles',
        contentId: 'article-1',
        expectedQueries: {},
        call: (api) => call(api, 'articles', 'article-1'),
      },
      ...contentIdCases('delete', 'DELETE', call, {}),
      ...endpointCases('delete', 'DELETE', 'private-id', call, {}),
    ]);
  });
});
