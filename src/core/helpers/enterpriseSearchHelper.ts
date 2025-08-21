import { expect, test } from '@playwright/test';

import { AppManagerApiClient } from '../api/clients/appManagerApiClient';

export class EnterpriseSearchHelper {
  /**
   * Waits for a result to appear in the API response for a given search term.
   * @param appManagerApiClient - The API client to use.
   * @param searchTerm - The search term to use.
   * @param valueToFind - The value to find in the specified field.
   * @param objectType - The object type to search for (e.g., 'content', 'feed').
   * @param fieldToCheck - The field in the result item to check for the value (defaults to 'title').
   */
  static async waitForResultToAppearInApiResponse(
    appManagerApiClient: AppManagerApiClient,
    searchTerm: string,
    valueToFind: string,
    objectType: string,
    fieldToCheck = 'title'
  ) {
    await test.step(`Waiting for search results to be visible for search term ${searchTerm}`, async () => {
      await expect(
        async () => {
          const response = await appManagerApiClient.post('/search-ai/v1/enterprise/search', {
            data: { page_size: 10, exact_match: true, search_term: searchTerm },
          });
          const responseBody = await response.json();
          // Filter the list items which have the correct object_type
          const result = responseBody.data.list_items.filter(
            (eachItem: any) => eachItem.item.object_type === objectType
          );
          // Find the specific item by checking the specified field for the value
          const resultItem = result.find((eachItem: any) => eachItem.item[fieldToCheck] === valueToFind);
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
