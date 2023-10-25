/**
 * wait for milliseconds
 * 
 * @param ms - milliseconds
 * @returns {Promise<void>}
 */
export const sleep = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));
  
/**
 * run promises in parallel
 * 
 * @param promises - array of promises
 * @returns {T[]}
 */
export const partialPromiseAll = async <T>(promises: Promise<T>[]) => {
  const results = promises.reduce(async (acc: Promise<T[]>, promise: Promise<T>) => {
    const result = await promise;
    return [...(await acc), result];
  }, Promise.resolve([]));
  return results;
};