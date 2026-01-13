import { ContentTestSuite } from '@content/constants/testSuite';
import { contentTestFixture as test } from '@content/fixtures/contentFixture';
import { TestPriority } from '@core/constants/testPriority';
import { TestGroupType } from '@core/constants/testType';
import { tagTest } from '@core/utils/testDecorator';

import { SITE_TEST_DATA as SITE_TOAST_MESSAGES } from '@/src/modules/content/test-data/site.test-data';

test.describe(
  '@featured-sites',
  {
    tag: [ContentTestSuite.FEATURED_SITES],
  },
  () => {
    let createdSite: any;
    let featureSites: { siteId: string; name: string }[] = [];

    test.afterEach(async ({ appManagerFixture }) => {
      if (featureSites.length > 0) {
        for (const site of featureSites) {
          try {
            await appManagerFixture.siteManagementHelper.makeSiteUnFeatured(site.siteId);
            console.log(`Successfully unfeatured site: ${site.name}`);
          } catch (error) {
            console.warn(`Failed to unfeature site ${site.name}:`, error);
          }
        }
        featureSites = []; // Clear the array after cleanup
      }
    });

    test(
      'verify user can navigate to featured sites page from side nav bar and add site to featured CONT-20911',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, '@CONT-20911'],
      },
      async ({ appManagerFixture }) => {
        tagTest(test.info(), {
          description: 'Test featured sites navigation from home dashboard to site dashboard',
          zephyrTestId: 'CONT-20911',
          storyId: 'CONT-20911',
        });

        createdSite = await appManagerFixture.siteManagementHelper.getUnFeaturedSites(1);
        const siteName = createdSite[0].name;
        const siteId = createdSite[0].siteId;

        console.log(`Created site: ${siteName} with ID: ${siteId}`);

        await appManagerFixture.homePage.verifyThePageIsLoaded();
        const featuredSitePage = await appManagerFixture.navigationHelper.clickOnFeaturedSitesTab();
        await featuredSitePage.clickOnAddUpdateFeaturedSiteButton();

        // Step 1: Search and add the created site to featured
        await featuredSitePage.addSiteToFeatured(siteName);
        featureSites.push({ siteId: siteId, name: siteName });
        await featuredSitePage.clickDoneButton();

        // Step 2.1: Verify success toast message appears
        await featuredSitePage.verifyToastMessage(SITE_TOAST_MESSAGES.TOAST_MESSAGES.ADDED_FEATURED_SITE);

        // Step 3: Verify sites are visible in featured dropdown
        await featuredSitePage.verifyFeaturedSitesVisible([siteName]);

        // Step 4: Reload the page after adding site to featured
        await featuredSitePage.loadPage();

        // Step 5: Verify sites are visible in featured dropdown
        await featuredSitePage.verifyFeaturedSitesVisible(siteName);

        // Step 6: Click on the featured site and verify navigation to site dashboard
        await featuredSitePage.navigateToSiteDashboard(siteName);

        // Step 7: Verify user is navigated to the site dashboard
        await featuredSitePage.verifySiteDashboardLoaded(siteName);
      }
    );

    test(
      'shuffling sites from feature modal list CONT-27919',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, '@CONT-27919'],
      },
      async ({ appManagerFixture }) => {
        tagTest(test.info(), {
          description: 'Shuffling sites from feature modal list',
          zephyrTestId: 'CONT-27919',
          storyId: 'CONT-27919',
          isKnownFailure: true,
          bugTicket: 'CONT-43409',
        });
        await appManagerFixture.homePage.verifyThePageIsLoaded();
        const featuredSitePage = await appManagerFixture.navigationHelper.clickOnFeaturedSitesTab();

        const unFeaturedSites: { siteId: string; name: string }[] =
          await appManagerFixture.siteManagementHelper.getUnFeaturedSites();
        await featuredSitePage.clickOnAddUpdateFeaturedSiteButton();

        for (const site of unFeaturedSites) {
          await featuredSitePage.addSiteToFeatured(site.name);
          featureSites.push(site); // Add the entire site object to the array
          await featuredSitePage.verifyToastMessage(SITE_TOAST_MESSAGES.TOAST_MESSAGES.ADDED_FEATURED_SITE);
          await featuredSitePage.verifyFeaturedSitesVisibleInModal(site.name);
          await featuredSitePage.page.waitForTimeout(5000);
        }
        await featuredSitePage.verifyFeaturedSitesIndex(unFeaturedSites);

        await featuredSitePage.shuffleSites();
        // Reorder sites to match expected UI order: [second added, first added]
        const reorderedSites = [unFeaturedSites[1], unFeaturedSites[0]].filter(Boolean);
        // After shuffling, verify the new order
        await featuredSitePage.verifyFeaturedSitesIndex(reorderedSites);
      }
    );
  }
);
