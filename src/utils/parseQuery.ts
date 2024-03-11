/**
 * Parse query.
 *
 * @param {object} queries
 * @return {string} queryString
 */
import { MicroCMSQueries } from '../types';
import { isObject } from './isCheckValue';

export const parseQuery = (queries: MicroCMSQueries): string => {
  if (!isObject(queries)) {
    throw new Error('queries is not object');
  }
  const queryString = new URLSearchParams(
    Object.entries(queries).reduce(
      (acc, [key, value]) => {
        acc[key] = String(value);
        return acc;
      },
      {} as Record<string, string>,
    ),
  ).toString();

  return queryString;
};
