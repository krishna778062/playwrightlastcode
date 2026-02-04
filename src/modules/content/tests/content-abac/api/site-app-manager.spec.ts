import { ContentTestSuite } from '@content/constants/testSuite';
import { contentTestFixture as test } from '@content/fixtures/contentFixture';
import { TestPriority } from '@core/constants/testPriority';
import { TestGroupType } from '@core/constants/testType';
import { TestDataGenerator } from '@core/utils/testDataGenerator';
import { tagTest } from '@core/utils/testDecorator';

import { SiteApiHelper } from '@/src/modules/content/apis/apiValidation/siteApiHelper';
import { SITE_TYPES } from '@/src/modules/content/constants/siteTypes';

test.describe(
  '@SiteAPI - ABAC',
  {
    tag: [ContentTestSuite.API, ContentTestSuite.SITE],
  },
  () => {
    test.afterEach(async ({ appManagerApiFixture }) => {
      // Cleanup if needed
      try {
        await appManagerApiFixture.siteManagementHelper.cleanup();
      } catch (error) {
        console.warn('Site cleanup failed:', error);
      }
    });

    test(
      'Validation App manager should be able to get user sites access using API CONT-43982 A',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, '@CONT-43982', ContentTestSuite.SITE_APP_MANAGER],
      },
      async ({ appManagerApiFixture }) => {
        tagTest(test.info(), {
          description: 'Validation App manager should be able to get user sites access using API',
          zephyrTestId: 'CONT-43982',
          storyId: 'CONT-43982',
        });

        // Get list of sites from API
        const sitesList = await appManagerApiFixture.siteManagementHelper.getListOfSites({ size: 10 });
        const availableSites = sitesList.result.listOfItems;
        let siteIds: string[] = [];

        // Get site IDs from the list (take first 2) or create new sites if needed
        if (availableSites.length >= 2) {
          siteIds = availableSites.slice(0, 2).map((site: any) => site.siteId);
        } else {
          // Get category for site creation
          const category = await appManagerApiFixture.abacSiteManagementHelper.getCategoryId('Uncategorized');

          // Create sites if we don't have enough
          const site1 = await appManagerApiFixture.abacSiteManagementHelper.createSite('public', {
            siteName: TestDataGenerator.generateSite(SITE_TYPES.PUBLIC).name,
            category: category,
            targetAudience: [],
          });
          const site2 = await appManagerApiFixture.abacSiteManagementHelper.createSite('public', {
            siteName: TestDataGenerator.generateSite(SITE_TYPES.PUBLIC).name,
            category: category,
            targetAudience: [],
          });
          siteIds = [site1.siteId, site2.siteId];
        }

        // Call the user sites access API
        const userSitesAccessResponse =
          await appManagerApiFixture.siteManagementHelper.siteManagementService.getUserSitesAccess(siteIds);

        // Validate the response structure using SiteApiHelper
        const siteApiHelper = new SiteApiHelper();
        await siteApiHelper.validateUserSitesAccessResponse(userSitesAccessResponse, siteIds);
      }
    );
  }
);
