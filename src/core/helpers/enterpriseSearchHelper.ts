import { test, expect } from '@playwright/test';
import { AppManagerApiClient } from '../api/clients/appManagerApiClient';

export class EnterpriseSearchHelper {
  /**
   * Waits for a site result to appear in the api response for a given search term
   * @param requestContext - The request context to use
   * @param searchTerm - The search term to use
   * @param title - The title to search for
   * @param objectType - The object type to search for
   */
  static async waitForResultToAppearInApiResponse(
    appManagerApiClient: AppManagerApiClient,
    searchTerm: string,
    title: string,
    objectType: string
  ) {
    await test.step(`Waiting for search results to be visible for search term ${searchTerm}`, async () => {
      await expect(
        async () => {
          const response = await appManagerApiClient.post('/search-ai/v1/enterprise/search', {
            data: { page_size: 10, exact_match: true, search_term: searchTerm },
          });
          const responseBody = await response.json();
          //filter the list items which has object_type as site
          const result = responseBody.data.list_items.filter(
            (eachItem: any) => eachItem.item.object_type === objectType
          );
          const resultTitle = result.find((eachItem: any) => eachItem.item.title === title);
          expect(resultTitle).toBeDefined();
        },
        {
          message: `${objectType} result for search term ${searchTerm} to appear in api response`,
        }
      ).toPass({ intervals: [20000, 30000, 40000,50000], timeout: 60_000 });

      //TODO: We should run a deep check to see if the result item is site and then match the title
    });
  }

}
