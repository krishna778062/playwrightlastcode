import { ContentTestSuite } from '@content/constants/testSuite';
import { contentTestFixture as test } from '@content/fixtures/contentFixture';
import { TestPriority } from '@core/constants/testPriority';
import { TestGroupType } from '@core/constants/testType';
import { tagTest } from '@core/utils/testDecorator';

import { ManageSitesComponent } from '@/src/modules/content/ui/components/manageSitesComponent';
import { ManageSiteSetUpPage } from '@/src/modules/content/ui/pages/manageSiteSetUpPage';
import { SiteDashboardPage } from '@/src/modules/content/ui/pages/sitePages/siteDashboardPage';
import { SITE_TYPES } from '@/src/modules/global-search/constants/siteTypes';
test.describe(
  '@Subscriptions - Verify Add subscription button',
  {
    tag: [ContentTestSuite.SITE_APP_MANAGER],
  },
  () => {
    test.beforeEach(async ({ appManagerFixture }) => {
      await appManagerFixture.homePage.verifyThePageIsLoaded();
    });

    test(
      'verify Add subscription button',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, '@CONT-23093'],
      },
      async ({ appManagerFixture }) => {
        tagTest(test.info(), {
          description: 'Verify Add subscription button',
          zephyrTestId: 'CONT-23093',
          storyId: 'CONT-23093',
        });
        const getListOfSitesResponse = await appManagerFixture.siteManagementHelper.getListOfSites({
          filter: SITE_TYPES.PUBLIC,
        });
        const activeSites = getListOfSitesResponse.result.listOfItems.filter((site: any) => site.isActive === true);

        // Find a site where user has canEdit=true and isOwner=true
        let selectedSite: { siteId: string; name: string } | null = null;
        for (const site of activeSites) {
          try {
            const siteDetails = await appManagerFixture.siteManagementHelper.siteManagementService.getSiteDetails(
              site.siteId
            );
            console.log(
              `Checking site ${site.siteId} (${site.name}) - canEdit: ${siteDetails.result?.canEdit}, isOwner: ${siteDetails.result?.isOwner}`
            );

            if (siteDetails.result?.canEdit === true && siteDetails.result?.isOwner === true) {
              selectedSite = { siteId: site.siteId, name: site.name };
              console.log(`✓ Found site where user can edit and is owner: ${site.siteId} (${site.name})`);
              break;
            }
          } catch (error) {
            console.log(`Error checking site ${site.siteId}: ${error}`);
            continue;
          }
        }

        if (!selectedSite) {
          throw new Error('No sites found with canEdit=true and isOwner=true');
        }

        // Navigate to the site dashboard page
        const siteDashboardPage = new SiteDashboardPage(appManagerFixture.page, selectedSite.siteId);
        await siteDashboardPage.loadPage();
        const manageSitesComponent = new ManageSitesComponent(appManagerFixture.page);
        await manageSitesComponent.clickOnTheManageSiteButtonAction();
        const manageSiteSetUpPage = new ManageSiteSetUpPage(appManagerFixture.page, selectedSite.siteId);
        await manageSiteSetUpPage.actions.clickOnSubscriptionButton();
        await manageSiteSetUpPage.assertions.verifyAddSubscriptionPageIsLoaded();
      }
    );
  }
);
