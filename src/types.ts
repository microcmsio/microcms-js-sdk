export type Fetch = typeof fetch;

/**
 * microCMS createClient params
 */
export interface MicroCMSClient {
  serviceDomain: string;
  apiKey: string;
  retry?: boolean;
}

type depthNumber = 0 | 1 | 2 | 3;

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
  richEditorFormat?: 'html' | 'object';
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
  queries?: MicroCMSQueries & Record<string, any>;
  requestInit?: RequestInit;
}

export type CustomRequestInit = Omit<
  RequestInit,
  'method' | 'headers' | 'body'
>;

export interface GetRequest {
  endpoint: string;
  contentId?: string;
  queries?: MicroCMSQueries;
  customRequestInit?: CustomRequestInit;
}

export interface GetListDetailRequest {
  endpoint: string;
  contentId: string;
  queries?: MicroCMSQueries;
  customRequestInit?: CustomRequestInit;
}

export interface GetListRequest {
  endpoint: string;
  queries?: MicroCMSQueries;
  customRequestInit?: CustomRequestInit;
}

export interface GetObjectRequest {
  endpoint: string;
  queries?: MicroCMSQueries;
  customRequestInit?: CustomRequestInit;
}

export interface GetAllContentIdsRequest {
  endpoint: string;
  /**
   * @type {string} alternateField
   * @example 'url'
   * If you are using a URL other than the content ID, for example, you can specify that value in the `alternateField` field.
   */
  alternateField?: string;
  draftKey?: string;
  filters?: string;
  orders?: string;
  customRequestInit?: CustomRequestInit;
}

export interface GetAllContentRequest {
  endpoint: string;
  queries?: Omit<MicroCMSQueries, 'limit' | 'offset' | 'ids'>;
  customRequestInit?: CustomRequestInit;
}

export interface WriteApiRequestResult {
  id: string;
}

export interface CreateRequest<T> {
  endpoint: string;
  contentId?: string;
  content: T;
  isDraft?: boolean;
  customRequestInit?: CustomRequestInit;
}

export interface UpdateRequest<T> {
  endpoint: string;
  contentId?: string;
  content: Partial<T>;
  customRequestInit?: CustomRequestInit;
}

export interface DeleteRequest {
  endpoint: string;
  contentId: string;
  customRequestInit?: CustomRequestInit;
}
