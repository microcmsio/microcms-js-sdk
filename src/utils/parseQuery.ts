/**
 * Parse query.
 *
 * @param {object} queries
 * @return {string} queryString
 */
import qs from 'qs';
import { isObject } from './isCheckValue';
import { MicroCMSQueries } from '../types';

export const parseQuery = (queries: MicroCMSQueries): string => {
  if (!isObject(queries)) {
    throw new Error('queries is not object');
  }
  const queryString = qs.stringify(queries, { arrayFormat: 'comma' });

  return queryString;
};
