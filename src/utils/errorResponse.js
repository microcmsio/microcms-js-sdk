/**
 * Format error response
 *
 * @param {Error} error
 * @return {Error}
 */
export const errorResponse = (error) => {
  if (error.data) {
    throw error.data;
  }

  if (error.response && error.response.data) {
    throw error.response.data;
  }

  throw error;
};
