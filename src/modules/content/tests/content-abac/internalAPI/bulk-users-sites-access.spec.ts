import { ContentTestSuite } from '@content/constants/testSuite';
import { contentTestFixture as test } from '@content/fixtures/contentFixture';
import { TestPriority } from '@core/constants/testPriority';
import { TestGroupType } from '@core/constants/testType';
import { TestDataGenerator } from '@core/utils/testDataGenerator';
import { tagTest } from '@core/utils/testDecorator';

import { SiteApiHelper } from '@/src/modules/content/apis/apiValidation/siteApiHelper';
import { SITE_TYPES } from '@/src/modules/content/constants/siteTypes';

test.describe(
  '@InternalAPI - Bulk Users Sites Access - ABAC',
  {
    tag: [ContentTestSuite.API, ContentTestSuite.SITE],
  },
  () => {
    test.afterEach(async ({ appManagerApiFixture }) => {
      // Cleanup if needed
      try {
        await appManagerApiFixture.abacSiteManagementHelper.cleanup();
      } catch (error) {
        console.warn('Site cleanup failed:', error);
      }
    });

    test(
      'Validation App manager should be able to get bulk users sites access using API CONT-43982 B',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, '@CONT-43982B', ContentTestSuite.SITE_APP_MANAGER],
      },
      async ({ appManagerApiFixture }) => {
        tagTest(test.info(), {
          description: 'Validation App manager should be able to get bulk users sites access using API',
          zephyrTestId: 'CONT-43982B',
          storyId: 'CONT-43982B',
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

          const site3 = await appManagerApiFixture.abacSiteManagementHelper.createSite('public', {
            siteName: TestDataGenerator.generateSite(SITE_TYPES.PUBLIC).name,
            category: category,
            targetAudience: [],
          });
          siteIds = [site1.siteId, site2.siteId, site3.siteId];
        }

        // Get list of people/users from v2/identity/people API
        const peopleListResponse =
          await appManagerApiFixture.siteManagementHelper.siteManagementService.getListOfPeopleV2({
            size: 16,
            sortBy: ['user_name', 'asc'],
            includePendingActivation: true,
            includeTotal: true,
            q: '',
            limitToSegment: true,
          });

        const availablePeople = peopleListResponse.result?.listOfItems || [];
        let userIds: string[] = [];

        // Get user IDs from the list (take first 2) or use available ones
        if (availablePeople.length >= 2) {
          userIds = availablePeople.slice(0, 2).map((person: any) => person.id || person.peopleId);
        } else {
          throw new Error('Not enough users found in the people list. Need at least 2 users.');
        }

        // Call the bulk users sites access API
        // cURL equivalent:
        // curl --location 'https://abac-api.test.simpplr.xyz/v1/content/internal/sites/bulkUsersSitesAccess' \
        //   --header 'accept: application/json, text/plain, */*' \
        //   --header 'accept-language: en-US,en;q=0.9' \
        //   --header 'content-type: application/json' \
        //   --header 'origin: https://abac.test.simpplr.xyz' \
        //   --header 'priority: u=1, i' \
        //   --header 'referer: https://abac.test.simpplr.xyz/' \
        //   --header 'sec-ch-ua: "Not(A:Brand";v="8", "Chromium";v="144", "Google Chrome";v="144"' \
        //   --header 'sec-ch-ua-mobile: ?0' \
        //   --header 'sec-ch-ua-platform: "macOS"' \
        //   --header 'sec-fetch-dest: empty' \
        //   --header 'sec-fetch-mode: cors' \
        //   --header 'sec-fetch-site: same-site' \
        //   --header 'user-agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36' \
        //   --header 'x-smtip-csrfid: <CSRF_TOKEN>' \
        //   --header 'Cookie: <COOKIE_STRING>' \
        //   --data '{"siteIds": ["<SITE_ID_1>", "<SITE_ID_2>", "<SITE_ID_3>"], "userIds": ["<USER_ID_1>", "<USER_ID_2>"]}'
        const bulkUsersSitesAccessResponse =
          await appManagerApiFixture.siteManagementHelper.siteManagementService.getBulkUsersSitesAccess(
            siteIds,
            userIds
          );

        // Validate the response structure using SiteApiHelper
        const siteApiHelper = new SiteApiHelper();
        await siteApiHelper.validateBulkUsersSitesAccessResponse(bulkUsersSitesAccessResponse, siteIds, userIds);
      }
    );
  }
);
