import { ContentType } from '@content/constants/contentType';
import { PageContentType } from '@content/constants/pageContentType';
import { ContentTestSuite } from '@content/constants/testSuite';
import { ContentSuiteTags } from '@content/constants/testTags';
import { contentTestFixture as test, users } from '@content/fixtures/contentFixture';
import { ContentPreviewPage } from '@content/ui/pages/contentPreviewPage';
import { PageCreationPage } from '@content/ui/pages/pageCreationPage';
import { TestPriority } from '@core/constants/testPriority';
import { TestGroupType } from '@core/constants/testType';
import { TestDataGenerator } from '@core/utils/testDataGenerator';
import { tagTest } from '@core/utils/testDecorator';

import { getContentConfigFromCache } from '@/src/modules/content/config/contentConfig';
import { FILE_TEST_DATA } from '@/src/modules/content/test-data/file.test-data';
import { SITE_TYPES } from '@/src/modules/global-search/constants/siteTypes';
import { IdentityManagementHelper } from '@/src/modules/platforms/apis/helpers/identityManagementHelper';

// Test data for approve/reject scenarios
const PAGE_APPROVAL_TEST_DATA = [
  {
    action: 'Approve & publish',
    zephyrTestId: 'CONT-1378',
    storyId: 'CONT-1378',
    description:
      'Page Content Add attach file with all the Mandatory fields by Standard user and approved by Application Manager',
    actionSuccessMessage: 'Page approved and published',
    notificationMessage: ' approved',
  },
  {
    action: 'Reject',
    zephyrTestId: 'CONT-20053',
    storyId: 'CONT-20053',
    description:
      'Page Content Add attach file with all the Mandatory fields by Standard user and rejected by Application Manager',
    actionSuccessMessage: 'Page rejected',
    notificationMessage: ' rejected',
  },
] as const;

test.describe(
  `page Creation by Standard user  and Approval/Rejection by Application Manager`,
  {
    tag: [ContentTestSuite.PAGE_STANDARD_USER],
  },
  () => {
    let pageCreationPage: PageCreationPage;
    let contentPreviewPageStandardUser: ContentPreviewPage;
    let contentPreviewPageAppManager: ContentPreviewPage;
    let publishedPageId: string;
    let siteIdToPublishPage: string;
    let manualCleanupNeeded = false;

    test.beforeEach('Setting up the test environment for page creation', async ({ standardUserFixture }) => {
      // Create home page instance and verify it's loaded
      await standardUserFixture.homePage.verifyThePageIsLoaded();

      // Initialize preview page
      contentPreviewPageStandardUser = new ContentPreviewPage(
        standardUserFixture.page,
        siteIdToPublishPage,
        publishedPageId,
        ContentType.PAGE
      );

      // Reset cleanup flag for each test
      manualCleanupNeeded = false;
    });

    test.afterEach(async ({ appManagerApiFixture }) => {
      // Only cleanup manually if needed (for UI-only tests)
      if (manualCleanupNeeded && publishedPageId && siteIdToPublishPage) {
        await appManagerApiFixture.contentManagementHelper.deleteContent(siteIdToPublishPage, publishedPageId);
        console.log('Manual cleanup completed for page:', publishedPageId);
      } else {
        console.log('No page was published, hence skipping the deletion');
      }
    });

    for (const testData of PAGE_APPROVAL_TEST_DATA) {
      test(
        `${testData.description} ${testData.zephyrTestId}`,
        {
          tag: [
            TestPriority.P0,
            TestGroupType.SMOKE,
            TestGroupType.REGRESSION,
            ContentSuiteTags.PAGE_CREATION,
            `@${testData.storyId}`,
          ],
        },
        async ({ standardUserFixture, appManagerFixture, appManagerApiFixture }) => {
          tagTest(test.info(), {
            description: testData.description,
            zephyrTestId: testData.zephyrTestId,
            storyId: testData.storyId,
          });

          // Initialize preview page for app manager
          contentPreviewPageAppManager = new ContentPreviewPage(
            appManagerFixture.page,
            siteIdToPublishPage,
            publishedPageId,
            ContentType.PAGE
          );

          const endUserInfo = await appManagerApiFixture.identityManagementHelper.getUserInfoByEmail(
            users.endUser.email
          );
          const site = await appManagerFixture.siteManagementHelper.getSiteInUserIsNotMemberOrOwner(
            [endUserInfo.userId],
            SITE_TYPES.PUBLIC
          );

          // Navigate to page creation by standard user
          pageCreationPage = (await standardUserFixture.navigationHelper.openCreateContentPageForContentType(
            ContentType.PAGE,
            { siteName: site.siteName }
          )) as PageCreationPage;

          // Generate page data using TestDataGenerator
          const imagePath = FILE_TEST_DATA.IMAGES.RATIO_TEXT.getPath(__dirname);
          const pageCreationOptions = TestDataGenerator.generatePage(PageContentType.NEWS, imagePath, 'uncategorized');

          // Create and submit the page
          const { pageId, siteId, peopleName } = await pageCreationPage.createAndSubmitPage(pageCreationOptions);

          // Store IDs for cleanup
          publishedPageId = pageId;
          siteIdToPublishPage = siteId;
          manualCleanupNeeded = true;

          // Verify content was submitted successfully
          await contentPreviewPageStandardUser.verifyContentPublishedSuccessfully(
            pageCreationOptions.title,
            'Submitted page for approval'
          );

          await contentPreviewPageStandardUser.verifyContentStatus('Pending');

          await appManagerFixture.page.reload();
          // Handle notification and perform action (approve/reject)
          const notificationComponentAppManager = await appManagerFixture.navigationHelper.clickOnBellIcon({
            stepInfo: 'Application Manager clicking on bell icon to view notifications',
          });
          const notificationMessage = peopleName + ' submitted a page for approval "' + pageCreationOptions.title + '"';
          await notificationComponentAppManager.clickOnNotification(notificationMessage);

          // Perform approve or reject action
          await contentPreviewPageAppManager.clickOnApproveOrRejectButton(testData.action);
          if (testData.action === 'Reject') {
            await contentPreviewPageAppManager.enterRejectReason('Test reason');
          }
          await contentPreviewPageAppManager.verifyContentPublishedSuccessfully(
            pageCreationOptions.title,
            testData.actionSuccessMessage
          );
          const identityManagementHelper = new IdentityManagementHelper(
            appManagerApiFixture.apiContext,
            getContentConfigFromCache().tenant.apiBaseUrl
          );
          const appManagerInfo = await identityManagementHelper.getUserInfoByEmail(users.appManager.email);
          const finalNotificationMessage =
            appManagerInfo.fullName + testData.notificationMessage + ' "' + pageCreationOptions.title + '"';
          const notificationMessageStandardUser = await standardUserFixture.navigationHelper.clickOnBellIcon({
            stepInfo: 'Standard user clicking on bell icon to view notifications',
          });
          await notificationMessageStandardUser.clickOnNotification(finalNotificationMessage);

          if (testData.action === 'Approve & publish') {
            await contentPreviewPageStandardUser.verifyContentIsInPublishedStatus();
          } else {
            await contentPreviewPageStandardUser.verifyContentStatus('Rejected');
            await contentPreviewPageStandardUser.verifyContentHasSubmitForApprovalButton();
          }
        }
      );
    }
  }
);
