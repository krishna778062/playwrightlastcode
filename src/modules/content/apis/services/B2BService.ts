import { APIRequestContext } from '@playwright/test';

import { HttpClient } from '@/src/core/api/clients/httpClient';
import { API_ENDPOINTS } from '@/src/core/constants/apiEndpoints';
import { B2BContentListRequest, B2BContentListResponse } from '@/src/modules/content/apis/types/b2bContentListResponse';

export class B2BService {
  private httpClient: HttpClient;
  private tenantId: string;

  constructor(context: APIRequestContext, tenantId: string, b2bBaseUrl: string) {
    this.httpClient = new HttpClient(context, b2bBaseUrl);
    this.tenantId = tenantId;
  }

  /**
   * Gets the B2B content list
   * @param payload - The B2B content list request payload
   * @returns The B2B content list response
   */
  async getContentList(payload: B2BContentListRequest): Promise<B2BContentListResponse> {
    const response = await this.httpClient.post(API_ENDPOINTS.content.b2bContentList, {
      data: payload,
      headers: {
        'Content-Type': 'application/json',
        'x-smtip-tid': this.tenantId,
      },
    });
    return this.httpClient.parseResponse<B2BContentListResponse>(response);
  }
}
