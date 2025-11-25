import { ContentTestSuite } from '@content/constants/testSuite';
import { contentTestFixture as test } from '@content/fixtures/contentFixture';
import { TestPriority } from '@core/constants/testPriority';
import { TestGroupType } from '@core/constants/testType';
import { tagTest } from '@core/utils/testDecorator';

import { TestDataGenerator } from '@/src/core/utils/testDataGenerator';
import { SiteApiHelper } from '@/src/modules/content/apis/apiValidation/siteApiHelper';
import { SITE_ACCESS_TYPES, SITE_TYPES } from '@/src/modules/content/constants/siteTypes';

test.describe(
  '@SiteAPI',
  {
    tag: [ContentTestSuite.API],
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

    // Test data for data-driven testing
    const siteCreationTestData = [
      {
        accessType: SITE_TYPES.PUBLIC,
        accessTypeName: 'Public',
        description: 'Validation App manager should be able to create Public Site using API',
        zephyrTestId: 'CONT-42056',
        storyId: 'CONT-42056',
      },
      {
        accessType: SITE_TYPES.UNLISTED,
        accessTypeName: 'Unlisted',
        description: 'Validation App manager should be able to create Unlisted Site using API',
        zephyrTestId: 'CONT-42057',
        storyId: 'CONT-42057',
      },
      {
        accessType: SITE_TYPES.PRIVATE,
        accessTypeName: 'Private',
        description: 'Validation App manager should be able to create Private Site using API',
        zephyrTestId: 'CONT-42058',
        storyId: 'CONT-42058',
      },
    ];

    // Data-driven test for different site access types
    for (const testData of siteCreationTestData) {
      test(
        `Validation App manager should be able to create ${testData.accessTypeName} Site using API`,
        {
          tag: [TestPriority.P0, TestGroupType.SMOKE, `@${testData.zephyrTestId}`, ContentTestSuite.SITE_APP_MANAGER],
        },
        async ({ appManagerApiFixture }) => {
          tagTest(test.info(), {
            description: testData.description,
            zephyrTestId: testData.zephyrTestId,
            storyId: testData.storyId,
          });

          const siteData = TestDataGenerator.generateSite(testData.accessType);

          // Create a site using API (category will be resolved automatically if not provided)
          const createdSite = await appManagerApiFixture.siteManagementHelper.createSiteWithCompleteResponse({
            siteName: siteData.siteName,
            accessType: testData.accessType,
            waitForSearchIndex: false,
          });

          // Validate the site response
          const siteApiHelper = new SiteApiHelper();
          const expectedAccessType =
            testData.accessType === SITE_TYPES.PUBLIC
              ? SITE_ACCESS_TYPES.PUBLIC
              : testData.accessType === SITE_TYPES.PRIVATE
                ? SITE_ACCESS_TYPES.PRIVATE
                : SITE_ACCESS_TYPES.UNLISTED;

          await siteApiHelper.validateSiteResponse(createdSite, expectedAccessType, siteData.siteName);

          // Get site details to validate the full response
          const siteDetailsResponse =
            await appManagerApiFixture.siteManagementHelper.siteManagementService.getSiteDetails(
              createdSite.result.siteId
            );

          await siteApiHelper.validateSiteResponse(siteDetailsResponse, expectedAccessType, siteData.siteName);
        }
      );
    }
  }
);
