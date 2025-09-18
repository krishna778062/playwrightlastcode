import { TestPriority } from '@core/constants/testPriority';
import { TestGroupType } from '@core/constants/testType';
import { SiteManagementHelper } from '@core/helpers/siteManagementHelper';
import { tagTest } from '@core/utils/testDecorator';

import { ContentFeatureTags, ContentSuiteTags } from '@/src/modules/content/constants/testTags';
import { contentTestFixture as test } from '@/src/modules/content/fixtures/contentFixture';
import { FeaturedSitePage } from '@/src/modules/content/pages/featuredSitePage';
import { ManageSiteContentPage } from '@/src/modules/content/pages/manageSiteContentPage';

test.describe(
  ContentSuiteTags.MANAGE_SITE,
  {
    tag: [ContentSuiteTags.MANAGE_SITE],
  },
  () => {
    let manageSitePage: ManageSiteContentPage;
    let siteManagementHelper: SiteManagementHelper;
    let featuredSitePage: FeaturedSitePage;
    test.beforeEach(async ({ appManagerApiClient, appManagerHomePage }) => {
      await appManagerHomePage.verifyThePageIsLoaded();
      manageSitePage = new ManageSiteContentPage(appManagerHomePage.page);
      featuredSitePage = new FeaturedSitePage(appManagerHomePage.page);
      siteManagementHelper = new SiteManagementHelper(appManagerApiClient);
    });

    test.afterEach(async ({ page }) => {
      await page.close();
    });

    test.only(
      'To verify the UI of Manage site content - End User',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, ContentFeatureTags.MANAGE_SITE],
      },
      async ({}) => {
        tagTest(test.info(), {
          description: 'To verify the UI of Manage site content - End User',
          customTags: [ContentFeatureTags.MANAGE_SITE],
          zephyrTestId: 'CONT-23740',
          storyId: 'CONT-23740',
        });
        await manageSitePage.actions.navigateToSitesButton();
        const siteId = await siteManagementHelper.getSiteWithCoverImage();
        await featuredSitePage.assertions.verifySiteDashboardLoadedWithSiteID(siteId);
      }
    );
  }
);
