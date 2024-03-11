import { Fetch } from 'src/types';

export const generateFetchClient = (apiKey: string): Fetch => {
  return async (req, init) => {
    const headers = new Headers(init?.headers);

    if (!headers.has('X-MICROCMS-API-KEY')) {
      headers.set('X-MICROCMS-API-KEY', apiKey);
    }

    return fetch(req, { ...init, headers });
  };
};
