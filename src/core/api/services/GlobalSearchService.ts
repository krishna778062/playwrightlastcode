import { APIRequestContext } from '@playwright/test';
import { BaseApiClient } from '../clients/baseApiClient';
import { API_ENDPOINTS } from '@core/constants/apiEndpoints';

export class GlobalSearchService extends BaseApiClient {
  constructor(context: APIRequestContext, baseUrl?: string) {
    super(context, baseUrl);
  }

  /**
   * Performs a global search using the /search-ai/v1/enterprise/search endpoint.
   * @param searchTerm - The term to search for.
   * @param pageSize - Number of results to return (default 16).
   * @returns The list_items array from the search response.
   */
  async searchForTerm(searchTerm: string, pageSize: number = 16): Promise<any[]> {
    const data = {
      page_size: pageSize,
      search_term: searchTerm,
    };

    const response = await this.post(API_ENDPOINTS.globalsearch.url, { data });

    const responseText = await response.text();

    if (!response.ok()) {
      throw new Error(`Global search API failed: ${response.status()} - ${responseText}`);
    }

    const json = JSON.parse(responseText);
    return json.data?.list_items || [];
  }
}
