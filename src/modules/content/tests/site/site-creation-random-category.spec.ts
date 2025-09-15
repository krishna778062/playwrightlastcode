import { TestPriority } from '@core/constants/testPriority';
import { TestGroupType } from '@core/constants/testType';
import { TestDataGenerator } from '@core/utils/testDataGenerator';
import { tagTest } from '@core/utils/testDecorator';

import { contentTestFixture as test } from '@/src/modules/content/fixtures/contentFixture';
import { SiteCreationPage } from '@/src/modules/content/pages/siteCreationPage';
import { SiteDashboardPage } from '@/src/modules/content/pages/sitePages/siteDashboardPage';
import { SitesListPage } from '@/src/modules/content/pages/sitesListPage';

test.describe('Site Creation', { tag: ['@content', '@site-creation'] }, () => {
  let sitesListPage: SitesListPage;
  let siteCreationPage: SiteCreationPage;
  let siteDashboardPage: SiteDashboardPage;
  let createdSiteName: string;
  let createdCategoryName: string;

  test.beforeEach(async () => {
    // Generate test data using framework pattern
    const siteData = TestDataGenerator.generateSite('public');
    createdSiteName = siteData.name;
    createdCategoryName = TestDataGenerator.generateCategoryName();
  });

  test(
    'Verify admin is able to create a new site with random category via UI',
    {
      tag: [TestPriority.P1, TestGroupType.SMOKE, '@random-category'],
    },
    async ({ appManagerHomePage, siteManagementHelper }) => {
      tagTest(test.info(), {
        zephyrTestId: 'CONT-20912',
        storyId: 'CONT-20912',
        description: 'Verify admin is able to create a new site with random category via UI',
        customTags: ['@random-category'],
      });

      // Step 1: Navigate to Sites section from homepage
      await appManagerHomePage.getSideNavBarComponent().clickOnSites({
        stepInfo: 'Navigate to Sites section from homepage',
      });

      // Step 2: Initialize sites list page and verify it's loaded
      sitesListPage = new SitesListPage(appManagerHomePage.page);
      await sitesListPage.verifyThePageIsLoaded();

      // Step 3: Click Add Site button to open site creation page
      siteCreationPage = await sitesListPage.actions.clickAddSiteButton();

      // Step 4: Create site with random category using UI
      await siteCreationPage.actions.createSiteWithRandomCategory(createdSiteName, createdCategoryName);

      // Step 5: Wait for navigation to site dashboard and initialize SiteDashboardPage
      await appManagerHomePage.page.waitForTimeout(3000);
      // Note: We need to extract site ID from URL or response to properly initialize SiteDashboardPage
      // For now, we'll use a placeholder approach - this should be improved to get actual site ID
      const currentUrl = appManagerHomePage.page.url();
      const siteIdMatch = currentUrl.match(/\/sites\/([^\/]+)/);
      const siteId = siteIdMatch ? siteIdMatch[1] : 'placeholder';

      siteDashboardPage = new SiteDashboardPage(appManagerHomePage.page, siteId, siteManagementHelper);

      // Step 6: Verify category was created successfully (click on category link in header)
      await siteDashboardPage.assertions.verifyCategoryCreatedSuccessfully(createdCategoryName);

      // Step 7: Verify site was created successfully (should be on site dashboard)
      await siteDashboardPage.assertions.verifySiteCreatedSuccessfully(createdSiteName);
    }
  );
});
