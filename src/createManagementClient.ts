import { generateFetchClient } from './lib/fetch';
import { MicroCMSManagementClient, UploadMediaRequest } from './types';
import {
  API_VERSION_1,
  API_VERSION_2,
  BASE_MANAGEMENT_DOMAIN,
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

    let response: Response;
    try {
      response = await fetchClient(url, {
        ...requestInit,
        method: requestInit?.method ?? 'GET',
      });
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
  };

  const uploadMedia = async ({
    data,
    name,
    type,
    customRequestHeaders,
  }: UploadMediaRequest): Promise<{ url: string }> => {
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
        throw new Error('type is required when data is a ReadableStream');
      }

      const chunks = [];
      const reader = data.getReader();

      let chunk;
      while (!(chunk = await reader.read()).done) {
        chunks.push(chunk.value);
      }

      formData.set('file', new Blob(chunks, { type }), name);
    } else if (typeof data === 'string' || data instanceof URL) {
      const url = data instanceof URL ? data : new URL(data);
      const response = await fetch(
        url.toString(),
        customRequestHeaders ? { headers: customRequestHeaders } : undefined,
      );
      const blob = await response.blob();
      const nameFromURL = new URL(response.url).pathname.split('/').pop();
      formData.set('file', blob, name ?? nameFromURL);
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
