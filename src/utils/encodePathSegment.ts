/**
 * Encode a value so that it occupies exactly one URL path segment.
 *
 * @param {string} segment
 * @return {string} encoded segment
 */
export const encodePathSegment = (segment: string): string => {
  const value = String(segment);
  // `.` and `..` survive percent-encoding and are resolved as dot segments by the URL parser.
  if (value === '' || value === '.' || value === '..') {
    throw new Error(`invalid path segment: ${JSON.stringify(value)}`);
  }
  return encodeURIComponent(value);
};
