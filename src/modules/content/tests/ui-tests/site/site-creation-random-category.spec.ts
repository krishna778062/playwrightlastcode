import { TestPriority } from '@core/constants/testPriority';
import { TestGroupType } from '@core/constants/testType';
import { tagTest } from '@core/utils/testDecorator';

import { contentTestFixture as test } from '@/src/modules/content/fixtures/contentFixture';
import { SiteCreationPage } from '@/src/modules/content/pages/siteCreationPage';
import { SitesListPage } from '@/src/modules/content/pages/sitesListPage';

test.describe('Site Creation', { tag: ['@content', '@site-creation'] }, () => {
  let sitesListPage: SitesListPage;
  let siteCreationPage: SiteCreationPage;
  let createdSiteName: string;
  let createdCategoryName: string;

  test.beforeEach(async () => {
    // Generate test data using framework pattern
    const timestamp = Date.now();
    const randomSuffix = Math.random().toString(36).substring(2, 8);
    createdSiteName = `TestSite${randomSuffix}${timestamp}`.substring(0, 50);
    createdCategoryName = `Category${randomSuffix}${timestamp}`.substring(0, 30);
  });

  test.afterEach('Site Clean up', async ({ siteManagementHelper: _siteManagementHelper }) => {
    if (createdSiteName) {
      try {
        // For now, we'll rely on the siteManagementHelper cleanup
        console.log('API cleanup handled by siteManagementHelper for site:', createdSiteName.substring(0, 30) + '...');
      } catch {
        console.log('API cleanup failed for site:', createdSiteName.substring(0, 30) + '...');
      }
      createdSiteName = '';
    } else {
      console.log('No site was created, hence skipping the deletion');
    }
  });

  test(
    'Verify admin is able to create a new site with random category via UI',
    {
      tag: [TestPriority.P1, TestGroupType.SMOKE, '@random-category'],
    },
    async ({ appManagerHomePage }) => {
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
      console.log(`INFO: Creating site "${createdSiteName}" with category "${createdCategoryName}"`);
      await siteCreationPage.actions.createSiteWithRandomCategory(createdSiteName, createdCategoryName);

      // Step 5: Verify category was created successfully (click on category link in header)
      await siteCreationPage.assertions.verifyCategoryCreatedSuccessfully(createdCategoryName);

      // Step 6: Verify site was created successfully (should be on site dashboard)
      await siteCreationPage.assertions.verifySiteCreatedSuccessfully(createdSiteName);

      // Step 7: Site creation completed successfully
      console.log(`INFO: Site "${createdSiteName}" created successfully with category "${createdCategoryName}"`);
    }
  );
});
