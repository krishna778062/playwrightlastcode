import { APIRequestContext } from '@playwright/test';

import { BaseApiClient } from '@/src/core/api/clients/baseApiClient';
import { IExternalSearchManagementServices } from '@/src/core/api/interfaces/IExternalSearchManagementOperations';
import { API_ENDPOINTS } from '@/src/core/constants/apiEndpoints';
import { ExternalSearch, ExternalSearchPayload, ExternalSearchResponse } from '@/src/core/types/externalSearch.type';

export class ExternalSearchManagementService extends BaseApiClient implements IExternalSearchManagementServices {
  constructor(context: APIRequestContext, baseUrl?: string) {
    super(context, baseUrl);
  }

  /**
   * Updates the external search configuration with the provided providers array
   * @param providers - Array of external search providers to configure
   * @returns The updated external search configuration response
   * @throws Error if the configuration update fails
   */
  async updateExternalSearchConfig(providers: ExternalSearch[]): Promise<ExternalSearchResponse> {
    const payload: ExternalSearchPayload = {
      enterpriseSearchList: providers,
    };

    const response = await this.post(API_ENDPOINTS.externalSearch.config, {
      data: payload,
    });
    const result = await response.json();

    // Validate response and handle errors
    if (result.status === 200 && result.message === 'SUCCESS') {
      return result;
    } else {
      throw new Error(`Failed to configure external search: ${result.message}`);
    }
  }
}
