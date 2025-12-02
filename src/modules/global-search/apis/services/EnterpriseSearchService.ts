import { APIRequestContext, test } from '@playwright/test';

import { HttpClient } from '@/src/core/api/clients/httpClient';
import { API_ENDPOINTS } from '@/src/core/constants/apiEndpoints';

/**
 * Service for enterprise search API operations
 * Handles all API calls related to enterprise search functionality
 */
export class EnterpriseSearchService {
  public httpClient: HttpClient;

  constructor(
    readonly context: APIRequestContext,
    readonly baseUrl: string
  ) {
    this.httpClient = new HttpClient(context, baseUrl);
  }

  /**
   * Performs an enterprise search with the given search term and filters
   * @param searchTerm - The search term to query
   * @param options - Optional search parameters
   * @returns The search response
   */
  /**
   * Performs an enterprise search with the given search term and filters
   * @param searchTerm - The search term to query
   * @param options - Optional search parameters
   * @returns The search response
   */
  async search(
    searchTerm: string,
    options?: {
      pageSize?: number;
      exactMatch?: boolean;
      objectType?: string;
      filters?: Record<string, any>;
      callerContext?: string;
    }
  ): Promise<any> {
    return await test.step(`Performing enterprise search for term: "${searchTerm}"`, async () => {
      const payload: any = {
        search_term: searchTerm,
        page_size: options?.pageSize || 10,
        exact_match: options?.exactMatch !== undefined ? options.exactMatch : true,
        caller_context: options?.callerContext || 'global_search',
      };

      if (options?.objectType) {
        payload.object_type = options.objectType;
      }

      if (options?.filters) {
        Object.assign(payload, options.filters);
      }

      const response = await this.httpClient.post(API_ENDPOINTS.search.enterprise, {
        data: payload,
      });

      return await response.json();
    });
  }
}
