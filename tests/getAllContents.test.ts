import { http, HttpResponse } from 'msw';
import { createClient } from '../src/createClient';
import { testBaseUrl } from './mocks/handlers';
import { server } from './mocks/server';

const client = createClient({
  serviceDomain: 'serviceDomain',
  apiKey: 'apiKey',
});

describe('getAllContents', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  test('should fetch all contents', async () => {
    server.use(
      http.get(`${testBaseUrl}/getAllContents-list-type`, () => {
          return HttpResponse.json({
              totalCount: 100,
          }, { status: 200 });
      }, { once: true }),
      http.get(`${testBaseUrl}/getAllContents-list-type`, () => {
          return HttpResponse.json({
              contents: Array(100)
                  .fill(null)
                  .map((_, index) => ({ id: `id${index}` })),
          }, { status: 200 });
      }, { once: true }),
    );

    const result = await client.getAllContents({
      endpoint: 'getAllContents-list-type',
    });

    expect(result).toHaveLength(100);
    expect(result).toContainEqual({ id: 'id0' });
    expect(result).toContainEqual({ id: 'id99' });
  });

  test('should handle pagination and fetch more than limit', async () => {
    server.use(
      http.get(`${testBaseUrl}/getAllContents-list-type`, () => {
          return HttpResponse.json({
              totalCount: 250,
          }, { status: 200 });
      }, { once: true }),
      http.get(`${testBaseUrl}/getAllContents-list-type`, () => {
          return HttpResponse.json({
              contents: Array(100)
                  .fill(null)
                  .map((_, index) => ({ id: `id${index}` })),
          }, { status: 200 });
      }, { once: true }),
      http.get(`${testBaseUrl}/getAllContents-list-type`, () => {
          return HttpResponse.json({
              contents: Array(100)
                  .fill(null)
                  .map((_, index) => ({ id: `id${index + 100}` })),
          }, { status: 200 });
      }, { once: true }),
      http.get(`${testBaseUrl}/getAllContents-list-type`, () => {
          return HttpResponse.json({
              contents: Array(50)
                  .fill(null)
                  .map((_, index) => ({ id: `id${index + 200}` })),
          }, { status: 200 });
      }, { once: true }),
    );

    const result = await client.getAllContents({
      endpoint: 'getAllContents-list-type',
    });

    expect(result).toHaveLength(250);
    expect(result).toContainEqual({ id: 'id0' });
    expect(result).toContainEqual({ id: 'id249' });
  });
});
