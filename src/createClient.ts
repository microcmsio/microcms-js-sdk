/**
 * microCMS API SDK
 * https://github.com/microcmsio/microcms-js-sdk
 */
import { partialPromiseAll, sleep } from '@/utils/promise';
import retry from 'async-retry';
import { generateFetchClient } from './lib/fetch';
import {
  CreateRequest,
  DeleteRequest,
  GetAllContentIdsRequest,
  GetAllContentRequest,
  GetListDetailRequest,
  GetListRequest,
  GetObjectRequest,
  GetRequest,
  MakeRequest,
  MicroCMSClient,
  MicroCMSListContent,
  MicroCMSListResponse,
  MicroCMSObjectContent,
  MicroCMSQueries,
  UpdateRequest,
  WriteApiRequestResult,
} from './types';
import {
  API_VERSION,
  BASE_DOMAIN,
  MAX_RETRY_COUNT,
  MIN_TIMEOUT_MS,
} from './utils/constants';
import { isString } from './utils/isCheckValue';
import { parseQuery } from './utils/parseQuery';

/**
 * Initialize SDK Client
 */
export const createClient = ({
  serviceDomain,
  apiKey,
  customFetch,
  retry: retryOption,
}: MicroCMSClient) => {
  if (!serviceDomain || !apiKey) {
    throw new Error('parameter is required (check serviceDomain and apiKey)');
  }

  if (!isString(serviceDomain) || !isString(apiKey)) {
    throw new Error('parameter is not string');
  }

  /**
   * Defined microCMS base URL
   */
  const baseUrl = `https://${serviceDomain}.${BASE_DOMAIN}/api/${API_VERSION}`;

  /**
   * Make request
   */
  const makeRequest = async <T=MicroCMSListResponse<any>>({
    endpoint,
    contentId,
    queries = {},
    requestInit,
  }: MakeRequest): Promise<T> => {
    const fetchClient = generateFetchClient(apiKey, customFetch);
    const queryString = parseQuery(queries);
    const url = `${baseUrl}/${endpoint}${contentId ? `/${contentId}` : ''}${
      queryString ? `?${queryString}` : ''
    }`;

    const getMessageFromResponse = async (response: Response) => {
      // Enclose `response.json()` in a try since it may throw an error
      // Only return the `message` if there is a `message`
      try {
        const { message } = await response.json();
        return message ?? null;
      } catch (_) {
        return null;
      }
    };

    return await retry(
      async (bail) => {
        try {
          const response = await fetchClient(url, {
            ...requestInit,
            method: requestInit?.method ?? 'GET',
          });

          // If a status code in the 400 range other than 429 is returned, do not retry.
          if (
            response.status !== 429 &&
            response.status >= 400 &&
            response.status < 500
          ) {
            const message = await getMessageFromResponse(response);

            return bail(
              new Error(
                `fetch API response status: ${response.status}${
                  message ? `\n  message is \`${message}\`` : ''
                }`,
              ),
            );
          }

          // If the response fails with any other status code, retry until the set number of attempts is reached.
          if (!response.ok) {
            const message = await getMessageFromResponse(response);

            return Promise.reject(
              new Error(
                `fetch API response status: ${response.status}${
                  message ? `\n  message is \`${message}\`` : ''
                }`,
              ),
            );
          }

          if (requestInit?.method === 'DELETE') return;

          return response.json();
        } catch (error) {
          if (error.data) {
            throw error.data;
          }

          if (error.response?.data) {
            throw error.response.data;
          }

          return Promise.reject(
            new Error(`Network Error.\n  Details: ${error}`),
          );
        }
      },
      {
        retries: retryOption ? MAX_RETRY_COUNT : 0,
        onRetry: (err, num) => {
          console.log(err);
          console.log(`Waiting for retry (${num}/${MAX_RETRY_COUNT})`);
        },
        minTimeout: MIN_TIMEOUT_MS,
      },
    );
  };

  /**
   * Get list and object API data for microCMS
   */
  const get = async <T = any>({
    endpoint,
    contentId,
    queries = {},
    customRequestInit,
  }: GetRequest): Promise<T> => {
    if (!endpoint) {
      return Promise.reject(new Error('endpoint is required'));
    }
    return await makeRequest({
      endpoint,
      contentId,
      queries,
      requestInit: customRequestInit,
    });
  };

  /**
   * Get list API data for microCMS
   */
  const getList = async <T = any>({
    endpoint,
    queries = {},
    customRequestInit,
  }: GetListRequest): Promise<MicroCMSListResponse<T>> => {
    if (!endpoint) {
      return Promise.reject(new Error('endpoint is required'));
    }
    return await makeRequest({
      endpoint,
      queries,
      requestInit: customRequestInit,
    });
  };

  /**
   * Get list API detail data for microCMS
   */
  const getListDetail = async <T = any>({
    endpoint,
    contentId,
    queries = {},
    customRequestInit,
  }: GetListDetailRequest): Promise<T & MicroCMSListContent> => {
    if (!endpoint) {
      return Promise.reject(new Error('endpoint is required'));
    }
    return await makeRequest({
      endpoint,
      contentId,
      queries,
      requestInit: customRequestInit,
    });
  };

  /**
   * Get object API data for microCMS
   */
  const getObject = async <T = any>({
    endpoint,
    queries = {},
    customRequestInit,
  }: GetObjectRequest): Promise<T & MicroCMSObjectContent> => {
    if (!endpoint) {
      return Promise.reject(new Error('endpoint is required'));
    }
    return await makeRequest({
      endpoint,
      queries,
      requestInit: customRequestInit,
    });
  };

  const getAllContentIds = async ({
    endpoint,
    alternateField,
    draftKey,
    filters,
    orders,
    customRequestInit,
  }: GetAllContentIdsRequest): Promise<string[]> => {
    const limit = 100;
    const defaultQueries: MicroCMSQueries = {
      draftKey,
      filters,
      orders,
      limit,
      fields: alternateField ?? 'id',
      depth: 0,
    };

    const { totalCount } = await makeRequest({
      endpoint,
      queries: { ...defaultQueries, limit: 0 },
      requestInit: customRequestInit,
    });

    let contentIds: string[] = [];
    let offset = 0;

    const sleep = (ms: number) =>
      new Promise((resolve) => setTimeout(resolve, ms));
    const isStringArray = (arr: unknown[]): arr is string[] =>
      arr.every((item) => typeof item === 'string');

    while (contentIds.length < totalCount) {
      const { contents } = (await makeRequest({
        endpoint,
        queries: { ...defaultQueries, offset },
        requestInit: customRequestInit,
      })) as MicroCMSListResponse<Record<string, unknown>>;

      const ids = contents.map((content) => content[alternateField ?? 'id']);

      if (!isStringArray(ids)) {
        throw new Error(
          'The value of the field specified by `alternateField` is not a string.',
        );
      }

      contentIds = [...contentIds, ...ids];

      offset += limit;
      if (contentIds.length < totalCount) {
        await sleep(1000); // sleep for 1 second before the next request
      }
    }

    return contentIds;
  };

  /**
   * Get all content API data for microCMS
   */
  const getAllContents = async <T = any>({
    endpoint,
    queries = {},
    customRequestInit,
    limit=100,
    interval=1000
  }: GetAllContentRequest): Promise<(T & MicroCMSListContent)[]> => {

    // info: https://document.microcms.io/manual/limitations#h9e37a059c1
    const limitPerSecond = 60;

    const { totalCount } = await makeRequest<MicroCMSListResponse<T>>({
      endpoint,
      queries: { ...queries, limit: 0 },
      requestInit: customRequestInit,
    });
    const countPerPacket = limit * limitPerSecond;
    const packetCount = Math.ceil(totalCount / countPerPacket);
    const requestingList = Array.from({ length: packetCount }, (_, i) => {
      const baseOffset = i * countPerPacket;
      return Array.from({ length: limitPerSecond }, async (_, j) => {
        const offset = baseOffset + j * limit;
        const { contents } = await makeRequest<MicroCMSListResponse<T>>({
          endpoint,
          queries: { ...queries, limit, offset },
          requestInit: customRequestInit,
        });
        return contents;
      })
    });

    const promises = await ((lastRequestDatetime=0) => requestingList.map(async (requesting, i) => {
      // do not wait for the first run
      if (i !== 0) {
        const shouldWaitTime = lastRequestDatetime + interval - Date.now();
        if (shouldWaitTime > 0) {
          await sleep(shouldWaitTime);
        }
      }
      const response = await Promise.all(requesting);
      lastRequestDatetime = Date.now();
      return response.flat();
    }))();

    const contents = (await partialPromiseAll(promises)).flat();
    return contents;
  };

  /**
   * Create new content in the microCMS list API data
   */
  const create = async <T extends Record<string | number, any>>({
    endpoint,
    contentId,
    content,
    isDraft = false,
    customRequestInit,
  }: CreateRequest<T>): Promise<WriteApiRequestResult> => {
    if (!endpoint) {
      return Promise.reject(new Error('endpoint is required'));
    }

    const queries: MakeRequest['queries'] = isDraft ? { status: 'draft' } : {};
    const requestInit: MakeRequest['requestInit'] = {
      ...customRequestInit,
      method: contentId ? 'PUT' : 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(content),
    };

    return makeRequest({
      endpoint,
      contentId,
      queries,
      requestInit,
    });
  };

  /**
   * Update content in their microCMS list and object API data
   */
  const update = async <T extends Record<string | number, any>>({
    endpoint,
    contentId,
    content,
    customRequestInit,
  }: UpdateRequest<T>): Promise<WriteApiRequestResult> => {
    if (!endpoint) {
      return Promise.reject(new Error('endpoint is required'));
    }

    const requestInit: MakeRequest['requestInit'] = {
      ...customRequestInit,
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(content),
    };

    return makeRequest({
      endpoint,
      contentId,
      requestInit,
    });
  };

  /**
   * Delete content in their microCMS list and object API data
   */
  const _delete = async ({
    endpoint,
    contentId,
    customRequestInit,
  }: DeleteRequest): Promise<void> => {
    if (!endpoint) {
      return Promise.reject(new Error('endpoint is required'));
    }

    if (!contentId) {
      return Promise.reject(new Error('contentId is required'));
    }

    const requestInit: MakeRequest['requestInit'] = {
      ...customRequestInit,
      method: 'DELETE',
      headers: {},
      body: undefined,
    };

    await makeRequest({ endpoint, contentId, requestInit });
  };

  return {
    get,
    getList,
    getListDetail,
    getObject,
    getAllContentIds,
    getAllContents,
    create,
    update,
    delete: _delete,
  };
};
