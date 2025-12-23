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
    const {
      apiClient,
      searchTerm,
      objectType,
      valueToFind,
      fieldToCheck = objectType === 'feed' ? 'excerpt' : 'title',
    } = params;

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

          // For feeds, try multiple possible field names
          // For sites, use includes() to match how validateSiteInSearchResults works
          let resultItem;
          if (objectType === 'feed') {
            resultItem = result.find(
              (eachItem: any) =>
                eachItem.item.excerpt?.includes(valueToSearch) ||
                eachItem.item.text?.includes(valueToSearch) ||
                eachItem.item.title?.includes(valueToSearch) ||
                eachItem.item.textHtml?.includes(valueToSearch) ||
                eachItem.item.textJson?.includes(valueToSearch)
            );
          } else if (objectType === 'site') {
            resultItem = result.find((eachItem: any) => eachItem.item[fieldToCheck]?.includes(valueToSearch));
          } else {
            resultItem = result.find((eachItem: any) => eachItem.item[fieldToCheck] === valueToSearch);
          }

          console.log('Found result item:', resultItem);
          expect(resultItem).toBeDefined();
        },
        {
          message: `${objectType} result for search term ${searchTerm} to appear in api response`,
        }
      ).toPass({ intervals: [20000, 40000, 70000], timeout: 80_000 });

      //TODO: We should run a deep check to see if the result item is site and then match the title
    });
  }

  /**
   * Waits for a result to disappear from the API response for a given search term.
   * This is useful for verifying that deactivated/deleted items are no longer searchable.
   * @param params - Search parameters with descriptive names.
   * @param params.apiClient - The API client to use.
   * @param params.searchTerm - The search term to use.
   * @param params.objectType - The object type to search for (e.g., 'content', 'feed', 'file', 'site').
   * @param params.valueToFind - The value to find in the specified field (defaults to searchTerm if not provided).
   * @param params.fieldToCheck - The field in the result item to check for the value (defaults to 'title').
   */
  static async waitForResultToDisappearInApiResponse(params: {
    apiClient: HttpClient;
    searchTerm: string;
    objectType: string;
    valueToFind?: string;
    fieldToCheck?: string;
  }) {
    const {
      apiClient,
      searchTerm,
      objectType,
      valueToFind,
      fieldToCheck = objectType === 'feed' ? 'excerpt' : 'title',
    } = params;

    await test.step(`Waiting for search results to disappear for search term ${searchTerm}`, async () => {
      await expect(
        async () => {
          const response = await apiClient.post(API_ENDPOINTS.search.enterprise, {
            data: { page_size: 10, exact_match: true, search_term: searchTerm },
          });
          const responseBody = await response.json();
          console.log('responseBody', responseBody);

          // Safety check: ensure response structure is valid
          // If list_items is empty, undefined, or null, item has disappeared (success case)
          if (!responseBody?.data?.list_items || responseBody.data.list_items.length === 0) {
            console.log('list_items is empty or missing - item has disappeared from search results');
            return; // Success - item is no longer in results
          }

          // Filter the list items which have the correct object_type
          // If list_items is empty array, filter returns empty array, which is correct behavior
          const result = (responseBody.data.list_items || []).filter(
            (eachItem: any) => eachItem?.item?.object_type === objectType
          );
          // Find the specific item by checking the specified field for the value
          const valueToSearch = valueToFind || searchTerm;

          // For feeds, try multiple possible field names
          // For sites, use includes() to match how validateSiteInSearchResults works
          let resultItem;
          if (objectType === 'feed') {
            resultItem = result.find(
              (eachItem: any) =>
                eachItem.item.excerpt?.includes(valueToSearch) ||
                eachItem.item.text?.includes(valueToSearch) ||
                eachItem.item.title?.includes(valueToSearch) ||
                eachItem.item.textHtml?.includes(valueToSearch) ||
                eachItem.item.textJson?.includes(valueToSearch)
            );
          } else if (objectType === 'site') {
            resultItem = result.find((eachItem: any) => eachItem.item[fieldToCheck]?.includes(valueToSearch));
          } else {
            resultItem = result.find((eachItem: any) => eachItem.item[fieldToCheck] === valueToSearch);
          }

          console.log('Checking if result item is absent:', resultItem);
          expect(resultItem).toBeUndefined();
        },
        {
          message: `${objectType} result for search term ${searchTerm} to disappear from api response`,
        }
      ).toPass({ intervals: [20000, 30000, 40000, 50000], timeout: 60_000 });
    });
  }
}
