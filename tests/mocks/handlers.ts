import { RestRequest, rest } from 'msw';

import { API_VERSION_1, BASE_DOMAIN } from '../../src/utils/constants';

const baseUrl = `https://serviceDomain.${BASE_DOMAIN}/api/${API_VERSION_1}`;

const hasValidApiKey = (req: RestRequest) => {
  return req.headers.get('X-MICROCMS-API-KEY') === 'apiKey';
};

export const handlers = [
  rest.get('http://example.com', (req, res, ctx) => {
    if (!hasValidApiKey(req)) return res(ctx.status(401));
    return res(ctx.status(200));
  }),
  rest.get(`${baseUrl}/list-type`, (req, res, ctx) => {
    if (!hasValidApiKey(req)) return res(ctx.status(401));

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
      }),
    );
  }),
  rest.post(`${baseUrl}/list-type`, (req, res, ctx) => {
    if (!hasValidApiKey(req)) return res(ctx.status(401));
    return res(ctx.json({ id: 'foo' }));
  }),
  rest.put(`${baseUrl}/list-type`, (req, res, ctx) => {
    if (!hasValidApiKey(req)) return res(ctx.status(401));
    return res(
      ctx.status(400),
      ctx.json({ massage: 'contentId is necessary.' }),
    );
  }),
  rest.patch(`${baseUrl}/list-type`, (req, res, ctx) => {
    if (!hasValidApiKey(req)) return res(ctx.status(401));
    return res(
      ctx.status(400),
      ctx.json({ massage: 'Content is not exists.' }),
    );
  }),
  rest.delete(`${baseUrl}/list-type`, (req, res, ctx) => {
    if (!hasValidApiKey(req)) return res(ctx.status(401));
    return res(
      ctx.status(400),
      ctx.json({ massage: 'Content is not exists.' }),
    );
  }),

  rest.get(`${baseUrl}/list-type/foo`, (req, res, ctx) => {
    if (!hasValidApiKey(req)) return res(ctx.status(401));
    return res(
      ctx.json({
        id: 'foo',
        title: 'Hello, microCMS!',
        createdAt: '2022-10-28T04:04:29.625Z',
        updatedAt: '2022-10-28T04:04:29.625Z',
        publishedAt: '2022-10-28T04:04:29.625Z',
        revisedAt: '2022-10-28T04:04:29.625Z',
      }),
    );
  }),
  rest.post(`${baseUrl}/list-type/foo`, (req, res, ctx) => {
    if (!hasValidApiKey(req)) return res(ctx.status(401));
    return res(ctx.status(404), ctx.json({}));
  }),
  rest.put(`${baseUrl}/list-type/foo`, (req, res, ctx) => {
    if (!hasValidApiKey(req)) return res(ctx.status(401));
    return res(ctx.status(201), ctx.json({ id: 'foo' }));
  }),
  rest.patch(`${baseUrl}/list-type/foo`, (req, res, ctx) => {
    if (!hasValidApiKey(req)) return res(ctx.status(401));
    return res(ctx.status(200), ctx.json({ id: 'foo' }));
  }),
  rest.delete(`${baseUrl}/list-type/foo`, (req, res, ctx) => {
    if (!hasValidApiKey(req)) return res(ctx.status(401));
    return res(ctx.status(202), ctx.json({}));
  }),

  rest.get(`${baseUrl}/object-type`, (req, res, ctx) => {
    if (!hasValidApiKey(req)) return res(ctx.status(401));
    return res(
      ctx.json({
        id: 'foo',
        title: 'Hello, microCMS!',
        createdAt: '2022-10-28T04:04:29.625Z',
        updatedAt: '2022-10-28T04:04:29.625Z',
        publishedAt: '2022-10-28T04:04:29.625Z',
        revisedAt: '2022-10-28T04:04:29.625Z',
      }),
    );
  }),
  rest.post(`${baseUrl}/object-type`, (req, res, ctx) => {
    if (!hasValidApiKey(req)) return res(ctx.status(401));
    return res(
      ctx.status(400),
      ctx.json({
        message: 'POST is forbidden.',
      }),
    );
  }),
  rest.put(`${baseUrl}/object-type`, (req, res, ctx) => {
    if (!hasValidApiKey(req)) return res(ctx.status(401));
    return res(
      ctx.status(400),
      ctx.json({
        message: 'PUT is forbidden.',
      }),
    );
  }),
  rest.patch(`${baseUrl}/object-type`, (req, res, ctx) => {
    if (!hasValidApiKey(req)) return res(ctx.status(401));
    return res(ctx.status(200), ctx.json({ id: 'foo' }));
  }),
  rest.delete(`${baseUrl}/object-type`, (req, res, ctx) => {
    if (!hasValidApiKey(req)) return res(ctx.status(401));
    return res(
      ctx.status(400),
      ctx.json({
        message: 'DELETE is forbidden.',
      }),
    );
  }),
];

export { baseUrl as testBaseUrl };
