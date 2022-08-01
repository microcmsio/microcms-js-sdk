/**
 * Check object
 *
 * @param {unknown} value
 * @returns {boolean}
 */
export const isObject = (value: unknown): value is Record<string, unknown> => {
  return value !== null && typeof value === 'object';
};

/**
 * Check string
 *
 * @param {unknown} value
 * @returns {boolean}
 */
export const isString = (value: unknown): value is string => {
  return typeof value === 'string';
};
