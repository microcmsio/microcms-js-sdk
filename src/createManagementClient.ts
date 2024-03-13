import retry from 'async-retry';

import { generateFetchClient } from './lib/fetch';
import { MicroCMSManagementClient, UploadMediaRequest } from './types';
import {
  API_VERSION_1,
  API_VERSION_2,
  BASE_MANAGEMENT_DOMAIN,
  MAX_RETRY_COUNT,
  MIN_TIMEOUT_MS,
} from './utils/constants';
import { isString } from './utils/isCheckValue';
import { parseQuery } from './utils/parseQuery';

interface MakeRequest {
  path: string;
  apiVersion: typeof API_VERSION_1 | typeof API_VERSION_2;
  queries?: Record<string, unknown>;
  requestInit?: RequestInit;
}

export const createManagementClient = ({
  serviceDomain,
  apiKey,
  retry: retryOption,
}: MicroCMSManagementClient) => {
  if (!serviceDomain || !apiKey) {
    throw new Error('parameter is required (check serviceDomain and apiKey)');
  }

  if (!isString(serviceDomain) || !isString(apiKey)) {
    throw new Error('parameter is not string');
  }

  /**
   * Make request
   */
  const makeRequest = async ({
    path,
    apiVersion,
    queries = {},
    requestInit,
  }: MakeRequest) => {
    /**
     * Defined microCMS base URL
     */
    const baseUrl = `https://${serviceDomain}.${BASE_MANAGEMENT_DOMAIN}/api/${apiVersion}`;

    const fetchClient = generateFetchClient(apiKey);
    const queryString = parseQuery(queries);
    const url = `${baseUrl}/${path}${queryString ? `?${queryString}` : ''}`;

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

    return retry(
      async (bail) => {
        let response;
        try {
          response = await fetchClient(url, {
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

          return response.json();
        } catch (error) {
          if (error.data) {
            throw error.data;
          }

          if (error.response?.data) {
            throw error.response.data;
          }

          return Promise.reject(
            new Error(`Network Error.\n  Details: ${error.message ?? ''}`),
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

  const uploadMedia = async (
    ...args: UploadMediaRequest
  ): Promise<{ url: string }> => {
    const [data, name, type] = args;

    const formData = new FormData();

    if (data instanceof Blob) {
      // Node.jsではFile APIはnode:bufferからのみサポートされているため、instance of Fileでは判定せずにnameプロパティが存在するかで判定する
      if ((data as File).name) {
        formData.set('file', data, (data as File).name);
      } else {
        if (!name) {
          throw new Error('name is required when data is a Blob');
        }
        formData.set('file', data, name);
      }
    } else if (data instanceof ReadableStream) {
      if (!name) {
        throw new Error('name is required when data is a ReadableStream');
      }
      if (!type) {
        throw new Error('mime-type is required when data is a ReadableStream');
      }
      const writable = new WritableStream({
        write(chunk) {
          const currentData = formData.get('file');

          if (!currentData) {
            formData.set('file', new Blob([chunk], { type }), name);
          } else if (currentData instanceof Blob) {
            formData.set(
              'file',
              new Blob([currentData, chunk], { type: currentData.type }),
              name,
            );
          }
        },
      });

      await data.pipeTo(writable);
    }

    return makeRequest({
      path: 'media',
      apiVersion: API_VERSION_1,
      requestInit: { method: 'POST', body: formData },
    });
  };

  return {
    uploadMedia,
  };
};
