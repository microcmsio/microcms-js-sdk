/**
 * microCMS createClient params
 */
export interface MicroCMSClient {
  serviceDomain: string;
  apiKey: string;
}

type depthNumber = 1 | 2 | 3;

/**
 * microCMS queries
 * https://document.microcms.io/content-api/get-list-contents#h9ce528688c
 * https://document.microcms.io/content-api/get-content#h9ce528688c
 */
export interface MicroCMSQueries {
  draftKey?: string;
  limit?: number;
  offset?: number;
  orders?: string;
  fields?: string | string[];
  q?: string;
  depth?: depthNumber;
  ids?: string | string[];
  filters?: string;
}

/**
 * microCMS contentId
 * https://document.microcms.io/manual/content-id-setting
 */
export interface MicroCMSContentId {
  id: string;
}

/**
 * microCMS content common date
 */
export interface MicroCMSDate {
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
  revisedAt?: string;
}

/**
 * microCMS image
 */
export interface MicroCMSImage {
  url: string;
  width?: number;
  height?: number;
}

/**
 * microCMS list api Response
 */
export interface MicroCMSListResponse<T> {
  contents: (T & MicroCMSListContent)[];
  totalCount: number;
  limit: number;
  offset: number;
}

/**
 * microCMS list content common types
 */
export type MicroCMSListContent = MicroCMSContentId & MicroCMSDate;

/**
 * microCMS object content common types
 */
export type MicroCMSObjectContent = MicroCMSDate;

export interface MakeRequest {
  endpoint: string;
  contentId?: string;
  queries?: MicroCMSQueries;
}

export interface GetRequest {
  endpoint: string;
  contentId?: string;
  queries?: MicroCMSQueries;
}

export interface GetListDetailRequest {
  endpoint: string;
  contentId: string;
  queries?: MicroCMSQueries;
}

export interface GetListRequest {
  endpoint: string;
  queries?: MicroCMSQueries;
}

export interface GetObjectRequest {
  endpoint: string;
  queries?: MicroCMSQueries;
}
