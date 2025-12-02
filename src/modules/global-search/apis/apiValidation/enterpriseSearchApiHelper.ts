import { expect, test } from '@playwright/test';

/**
 * Helper class for validating enterprise search API responses
 * Provides methods to validate search response structure and content
 */
export class EnterpriseSearchApiHelper {
  /**
   * Validates the basic enterprise search response structure (success, data)
   * @param searchResponse - The search response to validate
   */
  async validateSearchResponseBasic(searchResponse: any): Promise<void> {
    await test.step('Validate search response basic fields', async () => {
      expect(searchResponse.success, 'Success should be true').toBe(true);
      expect(searchResponse.data, 'Data should be present').toBeDefined();
      expect(searchResponse.data.list_items, 'list_items should be present').toBeDefined();
      expect(Array.isArray(searchResponse.data.list_items), 'list_items should be an array').toBe(true);
    });
  }

  /**
   * Validates that a site is found in the search results with expected properties
   * @param searchResponse - The search response to validate
   * @param siteName - The expected site name to search for
   * @param expectedCategory - The expected site category name (e.g., "Uncategorized")
   * @param expectedAccessType - The expected access type (e.g., "public")
   * @param expectedObjectType - The expected object type (e.g., "site")
   */
  async validateSiteInSearchResults(
    searchResponse: any,
    siteName: string,
    expectedCategory: string,
    expectedAccessType: string,
    expectedObjectType: string
  ): Promise<void> {
    await test.step(`Validate site "${siteName}" is found in search results`, async () => {
      const listOfItems = searchResponse.data.list_items;
      let siteFound = false;

      listOfItems.forEach((item: any) => {
        if (item.item?.title?.includes(siteName) && item.item.object_type === expectedObjectType) {
          if (item.item.site_category?.name) {
            expect(item.item.site_category.name, `Site category should contain "${expectedCategory}"`).toContain(
              expectedCategory
            );
          }
          if (item.item.access_type) {
            expect(item.item.access_type, `Site access type should contain "${expectedAccessType}"`).toContain(
              expectedAccessType
            );
          }
          expect(item.item.object_type, `Site object type should be "${expectedObjectType}"`).toBe(expectedObjectType);
          siteFound = true;
        }
      });

      expect(siteFound, `Site "${siteName}" should be found in the search response`).toBe(true);
    });
  }

  /**
   * Validates that a site is NOT found in the search results
   * @param searchResponse - The search response to validate
   * @param siteName - The site name that should NOT be found
   * @param objectType - The expected object type (e.g., "site")
   */
  async validateSiteNotInSearchResults(
    searchResponse: any,
    siteName: string,
    objectType: string = 'site'
  ): Promise<void> {
    await test.step(`Validate site "${siteName}" is NOT found in search results`, async () => {
      const listOfItems = searchResponse.data.list_items;
      let siteFound = false;

      listOfItems.forEach((item: any) => {
        if (item.item?.title?.includes(siteName) && item.item.object_type === objectType) {
          siteFound = true;
        }
      });

      expect(siteFound, `Site "${siteName}" should NOT be found in the search response`).toBe(false);
    });
  }
}
