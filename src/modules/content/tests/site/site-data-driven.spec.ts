import { TestPriority } from '@core/constants/testPriority';
import { TestGroupType } from '@core/constants/testType';
import { TestDataGenerator } from '@core/utils/testDataGenerator';
import { tagTest } from '@core/utils/testDecorator';

import { ContentTestSuite } from '@/src/modules/content/constants/testSuite';
import { ContentSuiteTags } from '@/src/modules/content/constants/testTags';
import { contentTestFixture as test } from '@/src/modules/content/fixtures/contentFixture';
import { SiteCreationPage as ContentSiteCreationPage } from '@/src/modules/content/pages/siteCreationPage';

/**
 * This test suite is used to test the site creation functionality with different access types.
 * We will test that App Manager is able to create sites with public, private, and unlisted access types.
 * The test is data-driven to avoid code duplication between different site types.
 */

test.describe('Site Creation Test Suite (Data Driven)', { tag: [ContentTestSuite.SITE_AM] }, () => {
  let siteCreationPage: ContentSiteCreationPage;
  let createdSiteId: string;
  let createdSiteName: string;
  let manualCleanupNeeded = false;

  const SITE_TEST_DATA = [
    {
      siteType: 'public',
      displayName: 'Public Site',
      zephyrTestId: 'CONT-10603',
      storyId: 'CONT-10603',
      description: 'Verify admin can create a public site',
    },
    {
      siteType: 'private',
      displayName: 'Private Site',
      zephyrTestId: 'CONT-10604',
      storyId: 'CONT-10604',
      description: 'Verify admin can create a private site',
    },
    {
      siteType: 'unlisted',
      displayName: 'Unlisted Site',
      zephyrTestId: 'CONT-10605',
      storyId: 'CONT-10605',
      description: 'Verify admin can create an unlisted site',
    },
  ] as const;

  test.beforeEach('Setting up the test environment for site creation', async ({ appManagerHomePage }) => {
    // Create home page instance and verify it's loaded
    await appManagerHomePage.verifyThePageIsLoaded();

    // Reset cleanup flag for each test
    manualCleanupNeeded = false;
  });

  test.afterEach('Site Clean up', async ({ appManagerApiClient }) => {
    // Only cleanup manually if needed (for UI-only tests)
    if (manualCleanupNeeded && createdSiteId) {
      await appManagerApiClient.getSiteManagementService().deactivateSite(createdSiteId);
      console.log('Manual cleanup completed for site:', createdSiteId);
    } else {
      console.log('No site was created, hence skipping the deletion');
    }

    // Reset variables for next test
    manualCleanupNeeded = false;
    createdSiteId = '';
    createdSiteName = '';
  });

  for (const siteData of SITE_TEST_DATA) {
    test(
      `Verify admin can create a ${siteData.displayName.toLowerCase()}`,
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, TestGroupType.REGRESSION, ContentSuiteTags.SITE_CREATION],
      },
      async ({ appManagerHomePage, appManagersPage }) => {
        tagTest(test.info(), {
          description: siteData.description,
          zephyrTestId: siteData.zephyrTestId,
          storyId: siteData.storyId,
        });

        // STEP 1: Navigate to site creation page
        siteCreationPage = await appManagerHomePage.actions.openSiteCreationFormForNonAbac();

        // STEP 2: Generate site data using TestDataGenerator
        const siteCreationOptions = TestDataGenerator.generateSite(siteData.siteType);

        console.log(`INFO: Creating ${siteData.displayName} with options:`, siteCreationOptions);

        // STEP 3: Create and publish the site
        const { siteDashboard, siteId } = await siteCreationPage.actions.addSite(siteCreationOptions);

        // Store IDs for cleanup
        createdSiteId = siteId;
        createdSiteName = siteCreationOptions.title || siteCreationOptions.name;
        manualCleanupNeeded = true;

        console.log(`INFO: ${siteData.displayName} created - Site ID: ${siteId}`);

        // STEP 4: Verify we're on the correct site dashboard page
        await siteDashboard.assertions.verifyDashboardUrl(createdSiteId);

        // STEP 5: Verify site name and creation success
        await siteDashboard.assertions.verifySiteName(
          siteCreationOptions.title || siteCreationOptions.name,
          'Created site successfully'
        );
      }
    );
  }
});
