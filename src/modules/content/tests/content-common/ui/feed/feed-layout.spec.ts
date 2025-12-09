import { TestPriority } from '@core/constants/testPriority';
import { TestGroupType } from '@core/constants/testType';
import { tagTest } from '@core/utils/testDecorator';

import { NewHomePage } from '@/src/core/ui/pages/newHomePage';
import { ContentTestSuite } from '@/src/modules/content/constants/testSuite';
import { contentTestFixture as test } from '@/src/modules/content/fixtures/contentFixture';
import { ChangeLayoutComponent } from '@/src/modules/content/ui/components/changeLayoutComponent';
import { FeedPage } from '@/src/modules/content/ui/pages/feedPage';
import { SiteDashboardPage } from '@/src/modules/content/ui/pages/sitePages';

test.describe(
  'feed Layout Tests',
  {
    tag: [ContentTestSuite.FEED_LAYOUT],
  },
  () => {
    let homePage: NewHomePage;
    let siteDashboardPage: SiteDashboardPage;
    let changeLayoutComponent: ChangeLayoutComponent;

    test.beforeEach('Setup test environment', async ({ appManagerFixture }) => {
      // Initialize page objects
      homePage = new NewHomePage(appManagerFixture.page);
      siteDashboardPage = new SiteDashboardPage(appManagerFixture.page, '');
      changeLayoutComponent = new ChangeLayoutComponent(appManagerFixture.page);

      // Login as Admin and navigate to Home-Global Feed
      await homePage.loadPage();
      await homePage.verifyThePageIsLoaded();
    });

    test(
      'smart Feed blocks not visible on Home Dashboard when "Include feed on dashboard" is unchecked',
      {
        tag: [TestPriority.P1, TestGroupType.REGRESSION, '@CONT-22570'],
      },
      async ({ appManagerFixture }) => {
        tagTest(test.info(), {
          description: 'Smart Feed blocks not visible on Home Dashboard when "Include feed on dashboard" is unchecked',
          zephyrTestId: 'CONT-22570',
          storyId: 'CONT-22570',
        });

        const applicationManagerHomePage = appManagerFixture.homePage;

        await applicationManagerHomePage.actions.clickOnManageDashboardCarousel();
        await applicationManagerHomePage.actions.clickOnChangeLayout();
        await applicationManagerHomePage.actions.clickExcludeFeed();
        await appManagerFixture.navigationHelper.clickOnGlobalFeed();
        const feedPage = new FeedPage(appManagerFixture.page);
        await feedPage.assertions.verifySmartFeedBlocksAreNotVisible();
      }
    );
  }
);
