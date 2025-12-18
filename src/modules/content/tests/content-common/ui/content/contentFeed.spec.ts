import { ContentTestSuite } from '@content/constants/testSuite';
import { contentTestFixture as test, users } from '@content/fixtures/contentFixture';
import { TestPriority } from '@core/constants/testPriority';
import { TestGroupType } from '@core/constants/testType';
import { tagTest } from '@core/utils/testDecorator';

import { SITE_TYPES } from '@/src/modules/content/constants/siteTypes';
import { NotificationComponent } from '@/src/modules/content/ui';
import { CreateFeedPostComponent } from '@/src/modules/content/ui/components/createFeedPostComponent';
import { ContentPreviewPage } from '@/src/modules/content/ui/pages/contentPreviewPage';

test.describe(
  '@ContentFeed',
  {
    tag: [ContentTestSuite.FEED_STANDARD_USER],
  },
  () => {
    test.beforeEach(async ({ standardUserFixture }) => {
      await standardUserFixture.homePage.verifyThePageIsLoaded();
    });

    test.afterEach(async ({}) => {
      // Cleanup if needed
    });

    test(
      'verify that user is notified if someone comments directly on content that you authored',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, '@CONT-18541'],
      },
      async ({ standardUserFixture, appManagerFixture, appManagerApiFixture }) => {
        tagTest(test.info(), {
          description: 'verify that user is notified if someone comments directly on content that you authored',
          zephyrTestId: 'CONT-18541',
          storyId: 'CONT-18541',
        });
        // Get list of sites for standard user
        const getListOfSitesResponse = await standardUserFixture.siteManagementHelper.getListOfSites({
          size: 1000,
        });

        // Get a site where standard user is owner/manager
        const siteInfo =
          await standardUserFixture.siteManagementHelper.getSiteWithManageSiteOption(getListOfSitesResponse);

        // Verify site has page categories
        try {
          await standardUserFixture.contentManagementHelper.contentManagementService.getPageCategoryID(siteInfo.siteId);
        } catch (error) {
          throw new Error(`Site ${siteInfo.siteName} does not have page categories: ${error}`);
        }

        const selectedSite = { siteId: siteInfo.siteId, siteName: siteInfo.siteName };

        const pageInfo = await standardUserFixture.contentManagementHelper.getContentId({
          accessType: SITE_TYPES.PUBLIC,
        });

        // App manager comments on the content created by standard user
        const appManagerContentPreviewPage = new ContentPreviewPage(
          appManagerFixture.page,
          selectedSite.siteId,
          pageInfo.contentId,
          'page'
        );
        await appManagerContentPreviewPage.loadPage();
        await appManagerContentPreviewPage.verifyThePageIsLoaded();
        await appManagerContentPreviewPage.assertions.verifyCommentOptionIsVisible();
        await appManagerContentPreviewPage.actions.clickShareThoughtsButton();

        const testComment = 'Test comment from automation';
        const createFeedPostComponent = new CreateFeedPostComponent(appManagerFixture.page);
        const commentResponse = await createFeedPostComponent.actions.createAndPost({ text: testComment });

        // Verify comment is visible
        await appManagerContentPreviewPage.assertions.waitForPostToBeVisible(commentResponse.postText);
        await standardUserFixture.navigationHelper.clickOnBellIcon({
          stepInfo: 'Standard User clicking on bell icon to view notifications',
        });
        const notificationComponent = new NotificationComponent(standardUserFixture.page);
        const activityNotificationPage = await notificationComponent.actions.clickOnViewAllNotifications();
        const appManagerInfo = await appManagerApiFixture.identityManagementHelper.getUserInfoByEmail(
          users.appManager.email
        );
        const notificationMessage = `${appManagerInfo.fullName} commented on your page "${pageInfo.pageName}"`;
        await activityNotificationPage.assertions.verifyNotificationExists(notificationMessage);

        // TODO: Verify that standardUser receives notification about the comment
      }
    );
  }
);
