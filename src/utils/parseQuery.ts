/**
 * Parse query.
 *
 * @param {object} queries
 * @return {string} queryString
 */
import qs from 'query-string';
import { isObject } from './isCheckValue';
import { QueriesType } from '../types';

export const parseQuery = (queries: QueriesType): string => {
  if (!isObject(queries)) {
    throw new Error('queries is not object');
  }
  const queryString = qs.stringify(queries);

  return queryString;
};
