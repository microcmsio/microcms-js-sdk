/**
 * microCMS API SDK
 * https://github.com/microcmsio/microcms-js-sdk
 */
import fetch, { RequestInit } from 'node-fetch';
import { parseQuery } from './utils/parseQuery';
import { isString } from './utils/isCheckValue';
import {
  MicroCMSClient,
  MakeRequest,
  GetRequest,
  GetListRequest,
  GetListDetailRequest,
  GetObjectRequest,
  WriteApiRequestResult,
  CreateRequest,
  MicroCMSListResponse,
  MicroCMSListContent,
  MicroCMSObjectContent,
  UpdateRequest,
} from './types';
import { API_VERSION, BASE_DOMAIN } from './utils/constants';

/**
 * Initialize SDK Client
 */
export const createClient = ({ serviceDomain, apiKey }: MicroCMSClient) => {
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
  const makeRequest = async <T>({
    endpoint,
    contentId,
    queries = {},
    method,
    customHeaders,
    customBody,
  }: MakeRequest): Promise<T> => {
    const queryString = parseQuery(queries);

    const baseHeaders: RequestInit = {
      headers: { ...customHeaders, 'X-MICROCMS-API-KEY': apiKey },
      body: customBody,
      method,
    };

    const url = `${baseUrl}/${endpoint}${contentId ? `/${contentId}` : ''}${
      queryString ? `?${queryString}` : ''
    }`;

    try {
      const response = await fetch(url, baseHeaders);

      if (!response.ok) {
        throw new Error(`fetch API response status: ${response.status}`);
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
        new Error(`serviceDomain or endpoint may be wrong.\n Details: ${error}`)
      );
    }
  };

  /**
   * Get list and object API data for microCMS
   */
  const get = async <T = any>({
    endpoint,
    contentId,
    queries = {},
  }: GetRequest): Promise<T> => {
    if (!endpoint) {
      return Promise.reject(new Error('endpoint is required'));
    }
    return await makeRequest<T>({ endpoint, contentId, queries });
  };

  /**
   * Get list API data for microCMS
   */
  const getList = async <T = any>({
    endpoint,
    queries = {},
  }: GetListRequest): Promise<MicroCMSListResponse<T>> => {
    if (!endpoint) {
      return Promise.reject(new Error('endpoint is required'));
    }
    return await makeRequest<MicroCMSListResponse<T>>({ endpoint, queries });
  };

  /**
   * Get list API detail data for microCMS
   */
  const getListDetail = async <T = any>({
    endpoint,
    contentId,
    queries = {},
  }: GetListDetailRequest): Promise<T & MicroCMSListContent> => {
    if (!endpoint) {
      return Promise.reject(new Error('endpoint is required'));
    }
    return await makeRequest<T & MicroCMSListContent>({
      endpoint,
      contentId,
      queries,
    });
  };

  /**
   * Get object API data for microCMS
   */
  const getObject = async <T = any>({
    endpoint,
    queries = {},
  }: GetObjectRequest): Promise<T & MicroCMSObjectContent> => {
    if (!endpoint) {
      return Promise.reject(new Error('endpoint is required'));
    }
    return await makeRequest<T & MicroCMSObjectContent>({
      endpoint,
      queries,
    });
  };

  /**
   * Create new content in the microCMS list API data
   */
  const create = async <T extends Record<string | number, any>>({
    endpoint,
    contentId,
    content,
    isDraft = false,
  }: CreateRequest<T>): Promise<WriteApiRequestResult> => {
    if (!endpoint) {
      return Promise.reject(new Error('endpoint is required'));
    }

    const queries: MakeRequest['queries'] = isDraft ? { status: 'draft' } : {};
    const method: MakeRequest['method'] = contentId ? 'PUT' : 'POST';
    const customHeaders: MakeRequest['customHeaders'] = {
      'Content-Type': 'application/json',
    };
    const customBody: MakeRequest['customBody'] = JSON.stringify(content);

    return makeRequest({
      endpoint,
      contentId,
      queries,
      method,
      customHeaders,
      customBody,
    });
  };

  /**
   * Update content in ther microCMS list and object API data
   */
  const update = async <T extends Record<string | number, any>>({
    endpoint,
    contentId,
    content,
  }: UpdateRequest<T>): Promise<WriteApiRequestResult> => {
    if (!endpoint) {
      return Promise.reject(new Error('endpoint is required'));
    }

    const method: MakeRequest['method'] = 'PATCH';
    const customHeaders: MakeRequest['customHeaders'] = {
      'Content-Type': 'application/json',
    };
    const customBody: MakeRequest['customBody'] = JSON.stringify(content);

    return makeRequest({
      endpoint,
      contentId,
      method,
      customHeaders,
      customBody,
    });
  };

  /**
   * Delete content in ther microCMS list and object API data
   */
  const _delete = async () => {
    return;
  };

  return {
    get,
    getList,
    getListDetail,
    getObject,
    create,
    update,
    delete: _delete,
  };
};
