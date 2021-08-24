/**
 * microCMS createClient params
 */
export interface MicroCMSClient {
  serviceDomain: string;
  apiKey: string;
  globalDraftKey?: string;
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
  fields?: string;
  q?: string;
  depth?: depthNumber;
  ids?: string;
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
  publishedAt: string;
  revisedAt: string;
}

/**
 * MicroCMSDate & MicroCMSContentID (This is list format common types)
 */
export type MicroCMSBaseContent = MicroCMSContentId & MicroCMSDate;

/**
 * microCMS image
 */
export interface MicroCMSImage {
  url: string;
  width?: number;
  height?: number;
}

export interface MakeRequest {
  endpoint: string;
  contentId?: string;
  queries?: MicroCMSQueries;
  useGlobalDraftKey?: boolean;
}

export interface GetRequest {
  endpoint: string;
  contentId?: string;
  queries?: MicroCMSQueries;
  useGlobalDraftKey?: boolean;
}
