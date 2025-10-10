import { expect, test } from '@playwright/test';

import { HttpClient } from '../../../../core/api/clients/httpClient';
import { API_ENDPOINTS } from '../../../../core/constants/apiEndpoints';

export class EnterpriseSearchHelper {
  /**
   * Waits for a result to appear in the API response for a given search term.
   * @param params - Search parameters with descriptive names.
   * @param params.apiClient - The API client to use.
   * @param params.searchTerm - The search term to use.
   * @param params.objectType - The object type to search for (e.g., 'content', 'feed', 'file').
   * @param params.valueToFind - The value to find in the specified field (defaults to searchTerm if not provided).
   * @param params.fieldToCheck - The field in the result item to check for the value (defaults to 'title').
   */
  static async waitForResultToAppearInApiResponse(params: {
    apiClient: HttpClient;
    searchTerm: string;
    objectType: string;
    valueToFind?: string;
    fieldToCheck?: string;
  }) {
    const { apiClient, searchTerm, objectType, valueToFind, fieldToCheck = 'title' } = params;

    await test.step(`Waiting for search results to be visible for search term ${searchTerm}`, async () => {
      await expect(
        async () => {
          const response = await apiClient.post(API_ENDPOINTS.search.enterprise, {
            data: { page_size: 10, exact_match: true, search_term: searchTerm },
          });
          const responseBody = await response.json();
          console.log('responseBody', responseBody);
          // Filter the list items which have the correct object_type
          const result = responseBody.data.list_items.filter(
            (eachItem: any) => eachItem.item.object_type === objectType
          );
          // Find the specific item by checking the specified field for the value
          const valueToSearch = valueToFind || searchTerm;
          const resultItem = result.find((eachItem: any) => eachItem.item[fieldToCheck] === valueToSearch);
          expect(resultItem).toBeDefined();
        },
        {
          message: `${objectType} result for search term ${searchTerm} to appear in api response`,
        }
      ).toPass({ intervals: [20000, 30000, 40000, 50000], timeout: 60_000 });

      //TODO: We should run a deep check to see if the result item is site and then match the title
    });
  }
}
