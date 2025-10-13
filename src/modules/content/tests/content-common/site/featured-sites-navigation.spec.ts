import { ContentTestSuite } from '@content/constants/testSuite';
import { contentTestFixture as test } from '@content/fixtures/contentFixture';
import { SITE_TEST_DATA } from '@content/test-data/sites-create.test-data';
import { TestPriority } from '@core/constants/testPriority';
import { TestGroupType } from '@core/constants/testType';
import { tagTest } from '@core/utils/testDecorator';

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
      'verify user can navigate to featured sites page from side nav bar and add site to featured',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE],
      },
      async ({ appManagerFixture }) => {
        tagTest(test.info(), {
          description: 'Test featured sites navigation from home dashboard to site dashboard',
          zephyrTestId: 'CONT-20911',
          storyId: 'CONT-20911',
        });

        createdSite = await appManagerFixture.siteManagementHelper.createPublicSite({
          overrides: { access: SITE_TEST_DATA[0].siteType },
        });
        console.log(`Created site: ${createdSite.siteName} with ID: ${createdSite.siteId}`);

        await appManagerFixture.homePage.verifyThePageIsLoaded();
        const featuredSitePage = await appManagerFixture.navigationHelper.clickOnFeaturedSitesTab();
        await featuredSitePage.actions.clickOnAddUpdateFeaturedSiteButton();

        // Step 1: Search and add the created site to featured
        await featuredSitePage.actions.addSiteToFeatured(createdSite.siteName);
        featureSites.push({ siteId: createdSite.siteId, name: createdSite.siteName });
        await featuredSitePage.actions.clickDoneButton();

        // Step 2.1: Verify success toast message appears
        await featuredSitePage.assertions.verifyToastMessage('Added featured site');

        // Step 3: Verify sites are visible in featured dropdown
        await featuredSitePage.assertions.verifyFeaturedSitesVisible([createdSite.siteName]);

        // Step 4: Reload the page after adding site to featured
        await featuredSitePage.loadPage();

        // Step 5: Verify sites are visible in featured dropdown
        await featuredSitePage.assertions.verifyFeaturedSitesVisible([createdSite.siteName]);

        // Step 6: Click on the featured site and verify navigation to site dashboard
        await featuredSitePage.actions.navigateToSiteDashboard(createdSite.siteName);

        // Step 7: Verify user is navigated to the site dashboard
        await featuredSitePage.assertions.verifySiteDashboardLoaded(createdSite.siteName);
      }
    );

    test(
      'shuffling sites from feature modal list',
      {
        tag: [TestPriority.P1, TestGroupType.REGRESSION, '@CONT-27919'],
      },
      async ({ appManagerFixture }) => {
        tagTest(test.info(), {
          description: 'Shuffling sites from feature modal list',
          zephyrTestId: 'CONT-27919',
          storyId: 'CONT-27919',
        });
        await appManagerFixture.homePage.verifyThePageIsLoaded();
        const featuredSitePage = await appManagerFixture.navigationHelper.clickOnFeaturedSitesTab();
        await featuredSitePage.actions.clickOnAddUpdateFeaturedSiteButton();

        const unFeaturedSites: { siteId: string; name: string }[] =
          await appManagerFixture.siteManagementHelper.getUnFeaturedSites();
        for (const site of unFeaturedSites) {
          await featuredSitePage.actions.addSiteToFeatured(site.name);
          featureSites.push(site); // Add the entire site object to the array
          await featuredSitePage.assertions.verifyToastMessage('Added featured site');
          await featuredSitePage.assertions.verifyFeaturedSitesVisibleInModal(site.name);
        }
        await featuredSitePage.assertions.verifyFeaturedSitesIndex(unFeaturedSites);

        await featuredSitePage.actions.shuffleSites();
        // Reorder sites to match expected UI order: [second added, first added]
        const reorderedSites = [unFeaturedSites[1], unFeaturedSites[0]].filter(Boolean);
        // After shuffling, verify the new order
        await featuredSitePage.assertions.verifyFeaturedSitesIndex(reorderedSites);
      }
    );
  }
);
