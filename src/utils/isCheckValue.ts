/**
 * Check object
 *
 * @param {object} value
 * @return {boolean}
 */
export const isObject = <T>(value: T): boolean => {
  return value !== null && typeof value === 'object';
};

/**
 * Check string
 *
 * @param {string} value
 * @return {boolean}
 */
export const isString = (value: string): boolean => {
  return value !== null && typeof value == 'string';
};
