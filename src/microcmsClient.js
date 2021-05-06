/**
 * microCMS API SDK
 * https://github.com/wantainc/microcms-js-sdk
 */
import fetch from 'node-fetch';
import { parseQuery } from './utils/parseQuery';
import { isString } from './utils/isCheckValue';
import { errorResponse } from './utils/errorResponse';

const BASE_DOMAIN = 'microcms.io';
const API_VERSION = 'v1';

/**
 * Initialize SDK Client
 */
const Client = ({ serviceDomain, apiKey, globalDraftKey }) => {
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
  const makeRequest = async ({ endpoint, contentId, queries }) => {
    const queryString = parseQuery(queries);

    const baseHeaders = {
      headers: { 'X-API-KEY': apiKey },
    };

    if (globalDraftKey) {
      Object.assign(baseHeaders.headers, { 'X-GLOBAL-DRAFT-KEY': globalDraftKey });
    }

    const url = `${baseUrl}/${endpoint}${contentId ? `/${contentId}` : ''}${queryString ? `?${queryString}` : ''}`;

    try {
      const response = await fetch(url, baseHeaders);
      return response.json();
    } catch (error) {
      return errorResponse(error);
    }
  };

  /**
   * Get API data for microCMS
   */
  const get = async ({ endpoint, contentId, queries = {} }) => {
    if (!endpoint) {
      return Promise.reject(new Error('endpoint is required'));
    }
    return await makeRequest({ endpoint, contentId, queries });
  };

  return {
    get,
  };
};

export default Client;
