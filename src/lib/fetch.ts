import crossFetch, { Headers as CrossFetchHeaders } from 'cross-fetch';
import { Fetch } from 'src/types';

export const resolveFetch = (customFetch?: Fetch): Fetch => {
  let _fetch: Fetch;
  if (customFetch) {
    _fetch = customFetch;
  } else if (typeof fetch === 'undefined') {
    _fetch = (crossFetch as unknown) as Fetch;
  } else {
    _fetch = fetch;
  }
  return (...args) => _fetch(...args);
};

export const resolveHeadersConstructor = () => {
  if (typeof Headers === 'undefined') {
    return CrossFetchHeaders;
  }

  return Headers;
};

export const generateFetchClient = (
  apiKey: string,
  customFetch?: Fetch
): Fetch => {
  const fetch = resolveFetch(customFetch);
  const HeadersConstructor = resolveHeadersConstructor();

  return async (req, init) => {
    const headers = new HeadersConstructor(init?.headers);

    if (!headers.has('X-MICROCMS-API-KEY')) {
      headers.set('X-MICROCMS-API-KEY', apiKey);
    }

    return fetch(req, { ...init, headers });
  };
};
