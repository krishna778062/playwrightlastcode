import { TestPriority } from '@core/constants/testPriority';
import { TestGroupType } from '@core/constants/testType';
import { TestDataGenerator } from '@core/utils/testDataGenerator';
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
    let homeFeedPostId: string = '';
    let homeFeedPostText: string = '';

    test.beforeEach('Setup test environment', async ({ appManagerFixture }) => {
      // Initialize page objects
      homePage = new NewHomePage(appManagerFixture.page);
      siteDashboardPage = new SiteDashboardPage(appManagerFixture.page, '');
      changeLayoutComponent = new ChangeLayoutComponent(appManagerFixture.page);

      // Login as Admin and navigate to Home-Global Feed
      await homePage.loadPage();
      await homePage.verifyThePageIsLoaded();
    });

    test.afterEach('Cleanup created feed posts', async ({ appManagerFixture }) => {
      if (homeFeedPostId) {
        try {
          await appManagerFixture.feedManagementHelper.deleteFeed(homeFeedPostId);
          console.log('Cleaned up feed post:', homeFeedPostId);
        } catch (error) {
          console.warn('Failed to cleanup feed post:', error);
        }
        homeFeedPostId = '';
        homeFeedPostText = '';
      }
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

    test(
      'verify End User able to change the layout of Home Dashboard to include/exclude feed',
      {
        tag: [TestPriority.P1, TestGroupType.REGRESSION, '@CONT-19607'],
      },
      async ({ appManagerFixture, standardUserFixture }) => {
        tagTest(test.info(), {
          description: 'Verify End User able to change the layout of Home Dashboard to include/exclude feed',
          zephyrTestId: 'CONT-19607',
          storyId: 'CONT-19607',
        });

        // Admin Setup Phase: Create feed post and set User as Home Control
        await test.step('Admin: Create feed post on home dashboard', async () => {
          const homeFeedTestData = TestDataGenerator.generateFeed({
            scope: 'public',
            siteId: undefined,
            waitForSearchIndex: false,
          });
          const homeFeedResponse = await appManagerFixture.feedManagementHelper.createFeed(homeFeedTestData);
          homeFeedPostId = homeFeedResponse.result.feedId;
          homeFeedPostText = homeFeedTestData.text;
        });

        await test.step('Admin: Set User as Home Control via API', async () => {
          await appManagerFixture.feedManagementHelper.configureAppGovernance({
            isHomeAppManagerControlled: false,
          });
        });

        // End User Verification Phase
        await test.step('End User: Navigate to Home tab', async () => {
          await standardUserFixture.homePage.loadPage();
          await standardUserFixture.homePage.verifyThePageIsLoaded();
        });

        await test.step('End User: Include Feed in Dashboard', async () => {
          const standardUserHomePage = standardUserFixture.homePage;
          await standardUserHomePage.actions.clickOnManageDashboardCarousel();
          await standardUserHomePage.actions.clickOnChangeLayout();
          await standardUserHomePage.actions.clickIncludeFeed();
        });

        await test.step('End User: Verify feed post is visible on home dashboard', async () => {
          const feedPage = new FeedPage(standardUserFixture.page);
          await feedPage.assertions.waitForPostToBeVisible(homeFeedPostText);
        });

        await test.step('End User: Refresh page and verify feed post is still visible', async () => {
          await standardUserFixture.page.reload();
          await standardUserFixture.homePage.verifyThePageIsLoaded();
          const feedPage = new FeedPage(standardUserFixture.page);
          await feedPage.assertions.waitForPostToBeVisible(homeFeedPostText);
        });

        await test.step('End User: Exclude Feed from Dashboard', async () => {
          const standardUserHomePage = standardUserFixture.homePage;
          await standardUserHomePage.actions.clickOnManageDashboardCarousel();
          await standardUserHomePage.actions.clickOnChangeLayout();
          await standardUserHomePage.actions.clickExcludeFeed();
        });

        await test.step('End User: Verify feed post is not visible on home dashboard', async () => {
          const feedPage = new FeedPage(standardUserFixture.page);
          await feedPage.assertions.verifyPostIsNotVisible(homeFeedPostText);
        });

        await test.step('End User: Refresh page and verify feed post is still not visible', async () => {
          await standardUserFixture.page.reload();
          await standardUserFixture.homePage.verifyThePageIsLoaded();
          const feedPage = new FeedPage(standardUserFixture.page);
          await feedPage.assertions.verifyPostIsNotVisible(homeFeedPostText);
        });
      }
    );
  }
);
