/**
 * External Search Configuration Types
 */

export interface ExternalSearch {
  id: string;
  url: string;
  provider: string;
  isEnabled: boolean;
}

export interface ExternalSearchResponse {
  status: number;
  message: string;
  result?: any;
  responseTimeStamp?: number;
}

export interface ExternalSearchPayload {
  enterpriseSearchList: ExternalSearch[];
}
