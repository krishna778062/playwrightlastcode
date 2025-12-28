import { TestPriority } from '@core/constants/testPriority';
import { TestGroupType } from '@core/constants/testType';
import { tagTest } from '@core/utils/testDecorator';

import { ContentTestSuite } from '@/src/modules/content/constants/testSuite';
import { contentTestFixture as test } from '@/src/modules/content/fixtures/contentFixture';
import { FeedPage } from '@/src/modules/content/ui/pages/feedPage';
import { ProfileScreenPage } from '@/src/modules/content/ui/pages/profileScreenPage';
import { SiteDashboardPage } from '@/src/modules/content/ui/pages/sitePages';

/**
 * Query: Why does it say standard user? but we are using app manager fixture?
 */
test.describe(
  'celebration Smart Feed Block Tests',
  {
    tag: [ContentTestSuite.FEED_STANDARD_USER],
  },
  () => {
    /**
     * The save profile flow is not working, it stuck if hiring date is not selected
     */
    test.fixme(
      'verify user displayed in Celebration smart feed block on Home and Site Feed CONT-19570',
      {
        tag: [TestPriority.P1, TestGroupType.REGRESSION, '@CONT-19570'],
      },
      async ({ appManagerFixture }) => {
        tagTest(test.info(), {
          description: 'Verify Celebration Smart Feed Block on Home and Site Feed',
          zephyrTestId: 'CONT-19570',
          storyId: 'CONT-19570',
        });

        // ==================== Login as App Manager and Update DOB ====================
        const appManagerHomePage = appManagerFixture.homePage;
        const appManagerNavigationHelper = appManagerFixture.navigationHelper;

        await appManagerHomePage.verifyThePageIsLoaded();

        const appManagerUserId = await appManagerFixture.page.evaluate(() => {
          return (window as any).Simpplr?.CurrentUser?.uid;
        });

        if (!appManagerUserId) {
          throw new Error('Could not get app manager user ID from Simpplr.CurrentUser.uid');
        }

        // Get app manager user name for verification
        const appManagerUserName = await appManagerHomePage.getCurrentLoggedInUserName();

        // Set birth month and day (using current month and a day)
        const today = new Date();
        const birthMonth = today.getMonth() + 1;
        const birthDay = today.getDate() + 1;

        await appManagerNavigationHelper.topNavBarComponent.openViewProfile({
          stepInfo: 'Opening app manager view profile from profile icon',
        });

        const appManagerProfileScreenPage = new ProfileScreenPage(appManagerFixture.page, appManagerUserId);

        await appManagerProfileScreenPage.clickEditAbout();

        await appManagerProfileScreenPage.updateDateOfBirth(birthMonth, birthDay);

        await appManagerProfileScreenPage.saveProfileChanges();

        // ==================== Verify Celebration Block as App Manager ====================
        await appManagerNavigationHelper.clickOnGlobalFeed();
        const feedPage = new FeedPage(appManagerFixture.page);
        // await feedPage.verifyThePageIsLoaded();

        await feedPage.reloadPage();
        await feedPage.verifyThePageIsLoaded();

        await feedPage.verifyUserDisplayedInCelebrationBlock(appManagerUserName);

        const siteId = await appManagerFixture.siteManagementHelper.getSiteIdWithName('All Employees');

        const siteDashboardPage = new SiteDashboardPage(appManagerFixture.page, siteId);
        await siteDashboardPage.loadPage();
        await siteDashboardPage.verifyThePageIsLoaded();

        await siteDashboardPage.clickOnFeedLink();

        const siteFeedPage = new FeedPage(appManagerFixture.page);
        await siteFeedPage.verifyThePageIsLoaded();

        await siteFeedPage.reloadPage();
        await siteFeedPage.verifyThePageIsLoaded();

        await siteFeedPage.verifyUserDisplayedInCelebrationBlock(appManagerUserName);
      }
    );
  }
);
