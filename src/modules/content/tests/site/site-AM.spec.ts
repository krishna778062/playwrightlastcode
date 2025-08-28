import { expect } from '@playwright/test';

import { PAGE_ENDPOINTS } from '@core/constants/pageEndpoints';
import { TestPriority } from '@core/constants/testPriority';
import { TestGroupType } from '@core/constants/testType';
import { TestDataGenerator } from '@core/utils/testDataGenerator';
import { tagTest } from '@core/utils/testDecorator';

import { ContentType } from '@/src/modules/content/constants/contentType';
import { ContentTestSuite } from '@/src/modules/content/constants/testSuite';
import { ContentSuiteTags } from '@/src/modules/content/constants/testTags';
import { contentTestFixture as test } from '@/src/modules/content/fixtures/contentFixture';
import { SiteCreationPage as ContentSiteCreationPage } from '@/src/modules/content/pages/siteCreationPage';
import { CONTENT_TEST_DATA } from '@/src/modules/content/test-data/content.test-data';

test.describe(
  ContentTestSuite.SITE + ' - AM Tests',
  {
    tag: [ContentTestSuite.SITE],
  },
  () => {
    let siteCreationPage: ContentSiteCreationPage;
    let createdSiteId: string;
    let createdSiteName: string;
    let manualCleanupNeeded = false;

    test.beforeEach('Setting up the test environment for site creation', async ({ appManagerHomePage }) => {
      // Create home page instance and verify it's loaded
      await appManagerHomePage.verifyThePageIsLoaded();

      // Reset cleanup flag for each test
      manualCleanupNeeded = false;
    });

    test.afterEach(async ({ siteManagementHelper, appManagerApiClient }) => {
      // Only cleanup manually if needed (for UI-only tests)
      if (manualCleanupNeeded && createdSiteId) {
        await appManagerApiClient.getSiteManagementService().deactivateSite(createdSiteId);
        console.log('Manual cleanup completed for site:', createdSiteId);
      } else {
        console.log('No site was created, hence skipping the deletion');
      }
    });

    test(
      'Verify admin can create a public site with cover image',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, ContentSuiteTags.SITE_CREATION],
      },
      async ({ appManagerHomePage, appManagersPage }) => {
        tagTest(test.info(), {
          description: 'Verify admin can create a public site with cover image',
          zephyrTestId: 'CONT-SITE-001',
          storyId: 'CONT-SITE-001',
        });

        // Navigate to site creation page
        siteCreationPage = await appManagerHomePage.actions.openSiteCreationFormForNonAbac();

        // Generate site data using TestDataGenerator
        const siteCreationOptions = TestDataGenerator.generateSite('public');

        // Create and publish the site
        const { siteDashboard, siteId } = await siteCreationPage.actions.addSite(siteCreationOptions);
        // Store IDs for cleanup
        createdSiteId = siteId;
        createdSiteName = siteCreationOptions.title;
        manualCleanupNeeded = true;
        // Verify we're on the correct site dashboard page
        await siteDashboard.assertions.verifyDashboardUrl(createdSiteId);

        await siteDashboard.assertions.verifySiteName(siteCreationOptions.title, 'Created site successfully');

        console.log(`Created site: ${siteCreationOptions.title} with ID: ${createdSiteId}`);
      }
    );
  }
);
