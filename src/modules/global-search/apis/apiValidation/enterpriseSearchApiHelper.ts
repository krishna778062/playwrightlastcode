import { expect, test } from '@playwright/test';

import { EnterpriseSearchHelper } from '@/src/modules/global-search/apis/helpers/enterpriseSearchHelper';
import { SEARCH_RESULT_ITEM } from '@/src/modules/global-search/constants/siteTypes';
import { SearchApiFixture } from '@/src/modules/global-search/tests/fixtures/searchTestFixture';

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
      // Safety check: handle empty, undefined, or null list_items
      const listOfItems = searchResponse.data?.list_items || [];
      let siteFound = false;

      // If list_items is empty, forEach won't execute and siteFound remains false (correct behavior)
      listOfItems.forEach((item: any) => {
        if (item.item?.title?.includes(siteName) && item.item.object_type === objectType) {
          siteFound = true;
        }
      });

      expect(siteFound, `Site "${siteName}" should NOT be found in the search response`).toBe(false);
    });
  }

  /**
   * Searches and validates a site for multiple users in parallel
   * @param users - Array of user fixtures with their types
   * @param site - The site to search for (siteName and siteId)
   * @param expectedAccessType - The expected access type (e.g., "public", "private")
   */
  async searchAndValidateSiteForUsers(
    users: Array<{ fixture: SearchApiFixture; userType: string }>,
    site: { siteName: string; siteId: string },
    expectedAccessType: string
  ): Promise<void> {
    await test.step(`Search and validate site "${site.siteName}" for ${users.length} user(s)`, async () => {
      // Perform searches for all users in parallel
      const searchPromises = users.map(({ fixture }) =>
        fixture.enterpriseSearchService.search(site.siteName, {
          pageSize: 10,
          exactMatch: false,
          callerContext: 'global_search',
        })
      );

      const searchResponses = await Promise.all(searchPromises);

      // Validate all responses in parallel
      const validationPromises = searchResponses.map(response =>
        this.validateSearchResponseBasic(response).then(() =>
          this.validateSiteInSearchResults(
            response,
            site.siteName,
            SEARCH_RESULT_ITEM.CATEGORY,
            expectedAccessType,
            'site'
          )
        )
      );

      await Promise.all(validationPromises);
    });
  }

  /**
   * Deactivates a site and validates that multiple users cannot search for it
   * @param adminFixture - Admin user fixture to deactivate the site
   * @param users - Array of user fixtures to search after deactivation
   * @param site - The site to deactivate and search for (siteName and siteId)
   */
  async deactivateSiteAndValidateNotSearchableForUsers(
    adminFixture: SearchApiFixture,
    users: Array<{ fixture: SearchApiFixture; userType: string }>,
    site: { siteName: string; siteId: string }
  ): Promise<void> {
    await test.step(`Deactivate site "${site.siteName}" and validate it's not searchable for ${users.length} user(s)`, async () => {
      // Deactivate the site using admin user
      await adminFixture.siteManagementHelper.siteManagementService.deactivateSite(site.siteId);
      console.log(`Deactivated site: ${site.siteName} with ID: ${site.siteId}`);

      // Wait for the site to disappear from search index (polling similar to creation)
      await EnterpriseSearchHelper.waitForResultToDisappearInApiResponse({
        apiClient: adminFixture.siteManagementHelper.siteManagementService.httpClient,
        searchTerm: site.siteName,
        objectType: 'site',
      });

      // Perform searches for all users in parallel
      const searchPromises = users.map(({ fixture }) =>
        fixture.enterpriseSearchService.search(site.siteName, {
          pageSize: 10,
          exactMatch: false,
          callerContext: 'global_search',
        })
      );

      const searchResponses = await Promise.all(searchPromises);

      // Validate all responses in parallel - site should NOT be found
      const validationPromises = searchResponses.map(response =>
        this.validateSearchResponseBasic(response).then(() =>
          this.validateSiteNotInSearchResults(response, site.siteName, 'site')
        )
      );

      await Promise.all(validationPromises);
    });
  }
}
