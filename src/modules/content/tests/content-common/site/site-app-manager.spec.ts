import { ContentTestSuite } from '@content/constants/testSuite';
import { ContentSuiteTags } from '@content/constants/testTags';
import { contentTestFixture as test } from '@content/fixtures/contentFixture';
import { SiteCreationPage as ContentSiteCreationPage, SiteCreationPage } from '@content/ui/pages/siteCreationPage';
import { TestPriority } from '@core/constants/testPriority';
import { TestGroupType } from '@core/constants/testType';
import { TestDataGenerator } from '@core/utils/testDataGenerator';
import { tagTest } from '@core/utils/testDecorator';

/**
 * This test suite is used to test the site creation functionality with different access types.
 * We will test that App Manager is able to create sites with public, private, and unlisted access types.
 * The test is data-driven to avoid code duplication between different site types.
 */

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

test.describe(
  'site Creation by Application Manager',
  { tag: [ContentTestSuite.SITE_APP_MANAGER, ContentSuiteTags.SITE_CREATION] },
  () => {
    let siteCreationPage: ContentSiteCreationPage;
    let createdSiteId: string;
    let createdSiteName: string;
    let manualCleanupNeeded = false;

    test.beforeEach('Setting up the test environment for site creation', async ({ appManagerFixture }) => {
      // Create home page instance and verify it's loaded
      await appManagerFixture.homePage.verifyThePageIsLoaded();

      // Reset cleanup flag for each test
      manualCleanupNeeded = false;
    });

    test.afterEach('Site Clean up', async ({ appManagerFixture }) => {
      // Only cleanup manually if needed (for UI-only tests)
      if (manualCleanupNeeded && createdSiteId) {
        await appManagerFixture.siteManagementHelper.siteManagementService.deactivateSite(createdSiteId);
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
        async ({ appManagerFixture }) => {
          tagTest(test.info(), {
            description: siteData.description,
            zephyrTestId: siteData.zephyrTestId,
            storyId: siteData.storyId,
          });

          siteCreationPage = (await appManagerFixture.navigationHelper.openSiteCreationForm(false)) as SiteCreationPage;

          // STEP 2: Generate site data using TestDataGenerator
          const siteCreationOptions = TestDataGenerator.generateSite(siteData.siteType);

          console.log(`INFO: Creating ${siteData.displayName} with options:`, siteCreationOptions);

          // STEP 3: Create and publish the site
          const { siteDashboard, siteId } = await siteCreationPage.actions.addSite(
            siteCreationOptions,
            appManagerFixture.siteManagementHelper
          );

          // Store IDs for cleanup
          createdSiteId = siteId;
          createdSiteName = siteCreationOptions.title || siteCreationOptions.name;
          manualCleanupNeeded = true;

          console.log(`INFO: ${siteData.displayName} created - Site ID: ${siteId}`);

          // STEP 4: Verify we're on the correct site dashboard page
          await siteDashboard.assertions.verifyDashboardUrl(createdSiteId);

          // STEP 5: Verify site name is displayed correctly
          await siteDashboard.verifySiteNameIs(siteCreationOptions.title || siteCreationOptions.name);
        }
      );
    }
  }
);
