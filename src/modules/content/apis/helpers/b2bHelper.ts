import { APIRequestContext } from '@playwright/test';

import { log } from '@core/utils/logger';

import { B2BService } from '@/src/modules/content/apis/services/B2BService';
import { B2BContentListRequest, B2BContentListResponse } from '@/src/modules/content/apis/types/b2bContentListResponse';

export class B2BHelper {
  public b2bService: B2BService;

  constructor(
    readonly apiRequestContext: APIRequestContext,
    readonly tenantId: string,
    readonly b2bBaseUrl: string
  ) {
    this.b2bService = new B2BService(apiRequestContext, tenantId, b2bBaseUrl);
  }

  /**
   * Gets the B2B content list
   * @param payload - The B2B content list request payload
   * @returns The B2B content list response
   */
  async getContentList(payload: B2BContentListRequest): Promise<B2BContentListResponse> {
    log.info(`Getting B2B content list with payload: ${JSON.stringify(payload)}`);
    return await this.b2bService.getContentList(payload);
  }

  /**
   * Gets content list by content IDs
   * @param contentIds - Array of content IDs to fetch
   * @param options - Optional parameters for content filtering
   * @returns The B2B content list response
   */
  async getContentListByIds(
    contentIds: string[],
    options?: {
      content_type?: string;
      requestedLanguages?: string[];
      size?: number;
    }
  ): Promise<B2BContentListResponse> {
    const payload: B2BContentListRequest = {
      contentIds,
      content_type: options?.content_type || 'all',
      requestedLanguages: options?.requestedLanguages || ['en'],
      size: options?.size,
    };
    return await this.getContentList(payload);
  }
}
