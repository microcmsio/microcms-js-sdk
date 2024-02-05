import { Fetch } from 'src/types';

export const resolveFetch = (customFetch?: Fetch): Fetch => {
  let _fetch: Fetch;
  if (customFetch) {
    _fetch = customFetch;
  } else {
    _fetch = fetch;
  }
  return (...args) => _fetch(...args);
};

export const generateFetchClient = (
  apiKey: string,
  customFetch?: Fetch,
): Fetch => {
  const fetch = resolveFetch(customFetch);

  return async (req, init) => {
    const headers = new Headers(init?.headers);

    if (!headers.has('X-MICROCMS-API-KEY')) {
      headers.set('X-MICROCMS-API-KEY', apiKey);
    }

    return fetch(req, { ...init, headers });
  };
};
