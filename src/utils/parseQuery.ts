/**
 * Parse query.
 *
 * @param {object} queries
 * @return {string} queryString
 */
import qs from 'qs';
import { isObject } from './isCheckValue';
import { QueriesType } from '../types';

export const parseQuery = (queries: QueriesType): string => {
  if (!isObject<QueriesType>(queries)) {
    throw new Error('queries is not object');
  }
  const queryString = qs.stringify(queries);

  return queryString;
};
