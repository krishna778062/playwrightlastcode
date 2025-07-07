import { APIRequestContext, test, expect } from '@playwright/test';
import { AppManagerApiClient } from '../api/clients/appManagerApiClient';

export class EnterpriseSearchHelper {
  /**
   * Waits for a site result to appear in the api response for a given search term
   * @param requestContext - The request context to use
   * @param searchTerm - The search term to use
   * @param siteName - The site name to search for
   */
  static async waitForSiteResultToAppearInApiResponse(
    appManagerApiClient: AppManagerApiClient,
    searchTerm: string,
    siteName: string
  ) {
    await test.step(`Waiting for search results to be visible for search term ${searchTerm}`, async () => {
      await expect(
        async () => {
          const response = await appManagerApiClient.post('/search-ai/v1/enterprise/search', {
            data: { page_size: 10, exact_match: false, search_term: searchTerm },
          });
          const responseBody = await response.json();
          //filter the list items which has object_type as site
          const siteResult = responseBody.data.list_items.filter(
            (eachItem: any) => eachItem.item.object_type === 'site'
          );
          const siteTitle = siteResult.find((eachItem: any) => eachItem.item.title === siteName);
          expect(siteTitle).toBeDefined();
        },
        {
          message: `Site result for search term ${searchTerm} to appear in api response`,
        }
      ).toPass({ timeout: 40_000 });

      //TODO: We should run a deep check to see if the result item is site and then match the title
    });
  }

   /**
   * Waits for a site result to appear in the api response for a given search term
   * @param requestContext - The request context to use
   * @param searchTerm - The search term to use
   * @param siteName - The site name to search for
   */
   static async waitForContentResultToAppearInApiResponse(
    appManagerApiClient: AppManagerApiClient,
    searchTerm: string,
    contentName: string
  ) {
    await test.step(`Waiting for search results to be visible for search term ${searchTerm}`, async () => {
      await expect(
        async () => {
          const response = await appManagerApiClient.post('/search-ai/v1/enterprise/search', {
            data: { page_size: 10, exact_match: false, search_term: searchTerm },
          });
          const responseBody = await response.json();
          //filter the list items which has object_type as site
          const contentResult = responseBody.data.list_items.filter(
            (eachItem: any) => eachItem.item.object_type === 'content'
          );
          const contentTitle = contentResult.find((eachItem: any) => eachItem.item.title === contentName);
          expect(contentTitle).toBeDefined();
        },
        {
          message: `content result for search term ${searchTerm} to appear in api response`,
        }
      ).toPass({ timeout: 40_000 });
    });
  }
}
