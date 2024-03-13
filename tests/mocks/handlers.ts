import { DefaultBodyType, http, HttpResponse, StrictRequest } from 'msw';

import { API_VERSION_1, BASE_DOMAIN } from '../../src/utils/constants';

const baseUrl = `https://serviceDomain.${BASE_DOMAIN}/api/${API_VERSION_1}`;

const hasValidApiKey = (req: StrictRequest<DefaultBodyType>) => {
  return req.headers.get('X-MICROCMS-API-KEY') === 'apiKey';
};

export const handlers = [
  http.get('http://example.com', ({ request }) => {
    if (!hasValidApiKey(request))
      return new HttpResponse(null, { status: 401 });
    return new HttpResponse(null, { status: 200 });
  }),
  http.get(`${baseUrl}/list-type`, ({ request }) => {
    if (!hasValidApiKey(request))
      return new HttpResponse(null, { status: 401 });

    return HttpResponse.json({
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
    });
  }),
  http.post(`${baseUrl}/list-type`, ({ request }) => {
    if (!hasValidApiKey(request))
      return new HttpResponse(null, { status: 401 });
    return HttpResponse.json({ id: 'foo' });
  }),
  http.put(`${baseUrl}/list-type`, ({ request }) => {
    if (!hasValidApiKey(request))
      return new HttpResponse(null, { status: 401 });
    return HttpResponse.json(
      { massage: 'contentId is necessary.' },
      { status: 400 },
    );
  }),
  http.patch(`${baseUrl}/list-type`, ({ request }) => {
    if (!hasValidApiKey(request))
      return new HttpResponse(null, { status: 401 });
    return HttpResponse.json(
      { massage: 'Content is not exists.' },
      { status: 400 },
    );
  }),
  http.delete(`${baseUrl}/list-type`, ({ request }) => {
    if (!hasValidApiKey(request))
      return new HttpResponse(null, { status: 401 });
    return HttpResponse.json(
      { massage: 'Content is not exists.' },
      { status: 400 },
    );
  }),

  http.get(`${baseUrl}/list-type/foo`, ({ request }) => {
    if (!hasValidApiKey(request))
      return new HttpResponse(null, { status: 401 });
    return HttpResponse.json({
      id: 'foo',
      title: 'Hello, microCMS!',
      createdAt: '2022-10-28T04:04:29.625Z',
      updatedAt: '2022-10-28T04:04:29.625Z',
      publishedAt: '2022-10-28T04:04:29.625Z',
      revisedAt: '2022-10-28T04:04:29.625Z',
    });
  }),
  http.post(`${baseUrl}/list-type/foo`, ({ request }) => {
    if (!hasValidApiKey(request))
      return new HttpResponse(null, { status: 401 });
    return HttpResponse.json({}, { status: 404 });
  }),
  http.put(`${baseUrl}/list-type/foo`, ({ request }) => {
    if (!hasValidApiKey(request))
      return new HttpResponse(null, { status: 401 });
    return HttpResponse.json({ id: 'foo' }, { status: 201 });
  }),
  http.patch(`${baseUrl}/list-type/foo`, ({ request }) => {
    if (!hasValidApiKey(request))
      return new HttpResponse(null, { status: 401 });
    return HttpResponse.json({ id: 'foo' }, { status: 200 });
  }),
  http.delete(`${baseUrl}/list-type/foo`, ({ request }) => {
    if (!hasValidApiKey(request))
      return new HttpResponse(null, { status: 401 });
    return HttpResponse.json({}, { status: 202 });
  }),

  http.get(`${baseUrl}/object-type`, ({ request }) => {
    if (!hasValidApiKey(request))
      return new HttpResponse(null, { status: 401 });
    return HttpResponse.json({
      id: 'foo',
      title: 'Hello, microCMS!',
      createdAt: '2022-10-28T04:04:29.625Z',
      updatedAt: '2022-10-28T04:04:29.625Z',
      publishedAt: '2022-10-28T04:04:29.625Z',
      revisedAt: '2022-10-28T04:04:29.625Z',
    });
  }),
  http.post(`${baseUrl}/object-type`, ({ request }) => {
    if (!hasValidApiKey(request))
      return new HttpResponse(null, { status: 401 });
    return HttpResponse.json(
      {
        message: 'POST is forbidden.',
      },
      { status: 400 },
    );
  }),
  http.put(`${baseUrl}/object-type`, ({ request }) => {
    if (!hasValidApiKey(request))
      return new HttpResponse(null, { status: 401 });
    return HttpResponse.json(
      {
        message: 'PUT is forbidden.',
      },
      { status: 400 },
    );
  }),
  http.patch(`${baseUrl}/object-type`, ({ request }) => {
    if (!hasValidApiKey(request))
      return new HttpResponse(null, { status: 401 });
    return HttpResponse.json({ id: 'foo' }, { status: 200 });
  }),
  http.delete(`${baseUrl}/object-type`, ({ request }) => {
    if (!hasValidApiKey(request))
      return new HttpResponse(null, { status: 401 });
    return HttpResponse.json(
      {
        message: 'DELETE is forbidden.',
      },
      { status: 400 },
    );
  }),
];

export { baseUrl as testBaseUrl };
