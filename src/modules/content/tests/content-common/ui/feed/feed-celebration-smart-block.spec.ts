import { TestPriority } from '@core/constants/testPriority';
import { TestGroupType } from '@core/constants/testType';
import { tagTest } from '@core/utils/testDecorator';

import { ContentTestSuite } from '@/src/modules/content/constants/testSuite';
import { contentTestFixture as test, users } from '@/src/modules/content/fixtures/contentFixture';
import { CONTENT_TEST_DATA } from '@/src/modules/content/test-data/content.test-data';
import { DEFAULT_PUBLIC_SITE_NAME } from '@/src/modules/content/test-data/sites-create.test-data';
import { FeedPage } from '@/src/modules/content/ui/pages/feedPage';
import { ProfileScreenPage } from '@/src/modules/content/ui/pages/profileScreenPage';
import { SiteDashboardPage } from '@/src/modules/content/ui/pages/sitePages';

test.describe(
  'celebration Smart Feed Block Tests',
  {
    tag: [ContentTestSuite.FEED_STANDARD_USER, ContentTestSuite.FEED],
  },
  () => {
    test(
      'verify user displayed in Celebration smart feed block on Home and Site Feed CONT-19570',
      {
        tag: [TestPriority.P1, TestGroupType.REGRESSION, '@CONT-19570'],
      },
      async ({ standardUserFixture, appManagerApiFixture }) => {
        tagTest(test.info(), {
          description: 'Verify Celebration Smart Feed Block on Home and Site Feed',
          zephyrTestId: 'CONT-19570',
          storyId: 'CONT-19570',
          isKnownFailure: true,
          bugTicket: 'CONT-44795',
        });

        // ==================== Login as App Manager and Update DOB ====================
        const standardUserHomePage = standardUserFixture.homePage;
        const standardUserNavigationHelper = standardUserFixture.navigationHelper;

        await standardUserHomePage.verifyThePageIsLoaded();

        const standardUserInfo = await appManagerApiFixture.identityManagementHelper.getUserInfoByEmail(
          users.endUser.email
        );
        const standardUserId = standardUserInfo.userId;
        const standardUserName = standardUserInfo.fullName;

        // Set birth month and day (using current month and a day)
        const birthMonth = CONTENT_TEST_DATA.DATES.MONTH;
        const birthDay = CONTENT_TEST_DATA.DATES.UPCOMING_DAY;

        await standardUserNavigationHelper.topNavBarComponent.openViewProfile({
          stepInfo: 'Opening app manager view profile from profile icon',
        });

        const standardUserProfileScreenPage = new ProfileScreenPage(standardUserFixture.page, standardUserId);

        await standardUserProfileScreenPage.clickEditAbout();

        await standardUserProfileScreenPage.updateDateOfBirth(birthMonth, birthDay);

        await standardUserProfileScreenPage.saveProfileChanges();

        // ==================== Verify Celebration Block as App Manager ====================
        await standardUserNavigationHelper.clickOnHomeIconButton();
        await standardUserNavigationHelper.clickOnGlobalFeed();
        const feedPage = new FeedPage(standardUserFixture.page);
        // await feedPage.verifyThePageIsLoaded();

        await feedPage.reloadPage();
        await feedPage.verifyThePageIsLoaded();

        await feedPage.verifyUserDisplayedInCelebrationBlock(standardUserName);

        const siteId = await standardUserFixture.siteManagementHelper.getSiteIdWithName(DEFAULT_PUBLIC_SITE_NAME);

        const siteDashboardPage = new SiteDashboardPage(standardUserFixture.page, siteId);
        await siteDashboardPage.loadPage();
        await siteDashboardPage.verifyThePageIsLoaded();

        await siteDashboardPage.clickOnFeedLink();

        const siteFeedPage = new FeedPage(standardUserFixture.page);
        await siteFeedPage.verifyThePageIsLoaded();

        await siteFeedPage.reloadPage();
        await siteFeedPage.verifyThePageIsLoaded();

        await siteFeedPage.verifyUserDisplayedInCelebrationBlock(standardUserName);
      }
    );
  }
);
