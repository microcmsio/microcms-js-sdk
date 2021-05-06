/**
 * Parse query.
 *
 * @param {object} queries
 * @return {string} queryString
 */
import qs from 'query-string';
import { isObject } from './isCheckValue';

export const parseQuery = (queries) => {
  if (!isObject(queries)) {
    throw new Error('queries is not object');
  }
  const queryString = qs.stringify(queries);

  return queryString;
};
