import { rest } from 'msw';

import { API_VERSION, BASE_DOMAIN } from '../../src/utils/constants';

const baseUrl = `https://serviceDomain.${BASE_DOMAIN}/api/${API_VERSION}`;

export const handlers = [
  rest.get(`${baseUrl}/list-type`, (_, res, ctx) => {
    return res(
      ctx.json({
        contents: [
          {
            id: 'foo',
            title: 'Hello, microCMS!',
            createdAt: '2022-10-28T04:04:29.625Z',
            updatedAt: '2022-10-28T04:04:29.625Z',
            publishedAt: '2022-10-28T04:04:29.625Z',
            revisedAt: '2022-10-28T04:04:29.625Z',
          },
        ],
        totalCount: 1,
        limit: 10,
        offset: 0,
      })
    );
  }),
  rest.get(`${baseUrl}/list-type/foo`, (_, res, ctx) => {
    return res(
      ctx.json({
        id: 'foo',
        title: 'Hello, microCMS!',
        createdAt: '2022-10-28T04:04:29.625Z',
        updatedAt: '2022-10-28T04:04:29.625Z',
        publishedAt: '2022-10-28T04:04:29.625Z',
        revisedAt: '2022-10-28T04:04:29.625Z',
      })
    );
  }),
  rest.get(`${baseUrl}/object-type`, (_, res, ctx) => {
    return res(
      ctx.json({
        id: 'foo',
        title: 'Hello, microCMS!',
        createdAt: '2022-10-28T04:04:29.625Z',
        updatedAt: '2022-10-28T04:04:29.625Z',
        publishedAt: '2022-10-28T04:04:29.625Z',
        revisedAt: '2022-10-28T04:04:29.625Z',
      })
    );
  }),
];

export { baseUrl as testBaseUrl };
