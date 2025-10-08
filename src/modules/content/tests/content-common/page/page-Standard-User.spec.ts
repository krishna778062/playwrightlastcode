import { ContentType } from '@content/constants/contentType';
import { PageContentType } from '@content/constants/pageContentType';
import { ContentTestSuite } from '@content/constants/testSuite';
import { ContentSuiteTags } from '@content/constants/testTags';
import { contentTestFixture as test, users } from '@content/fixtures/contentFixture';
import { CONTENT_TEST_DATA } from '@content/test-data/content.test-data';
import { ContentPreviewPage } from '@content/ui/pages/contentPreviewPage';
import { PageCreationPage } from '@content/ui/pages/pageCreationPage';
import { TestPriority } from '@core/constants/testPriority';
import { TestGroupType } from '@core/constants/testType';
import { TestDataGenerator } from '@core/utils/testDataGenerator';
import { tagTest } from '@core/utils/testDecorator';

import { getContentConfigFromCache } from '../../../config/contentConfig';

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
  `Page Creation by Standard user  and Approval/Rejection by Application Manager`,
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

    test.beforeEach(
      'Setting up the test environment for page creation',
      async ({ standardUserHomePage, standardUserPage }) => {
        // Create home page instance and verify it's loaded
        await standardUserHomePage.verifyThePageIsLoaded();

        // Initialize preview page
        contentPreviewPageStandardUser = new ContentPreviewPage(
          standardUserPage,
          siteIdToPublishPage,
          publishedPageId,
          ContentType.PAGE
        );

        // Reset cleanup flag for each test
        manualCleanupNeeded = false;
      }
    );

    test.afterEach(async ({ contentManagementHelper }) => {
      // Only cleanup manually if needed (for UI-only tests)
      if (manualCleanupNeeded && publishedPageId && siteIdToPublishPage) {
        await contentManagementHelper.deleteContent(siteIdToPublishPage, publishedPageId);
        console.log('Manual cleanup completed for page:', publishedPageId);
      } else {
        console.log('No page was published, hence skipping the deletion');
      }
    });

    for (const testData of PAGE_APPROVAL_TEST_DATA) {
      test(
        `${testData.description}`,
        {
          tag: [TestPriority.P0, TestGroupType.SMOKE, TestGroupType.REGRESSION, ContentSuiteTags.PAGE_CREATION],
        },
        async ({
          standardUserHomePage,
          appManagerHomePage,
          appManagerApiContext,
          standardUserUINavigationHelper,
          appManagerUINavigationHelper,
        }) => {
          tagTest(test.info(), {
            description: testData.description,
            zephyrTestId: testData.zephyrTestId,
            storyId: testData.storyId,
          });

          // Initialize preview page for app manager
          contentPreviewPageAppManager = new ContentPreviewPage(
            appManagerHomePage.page,
            siteIdToPublishPage,
            publishedPageId,
            ContentType.PAGE
          );

          // Navigate to page creation by standard user
          pageCreationPage = (await standardUserUINavigationHelper.openCreateContentPageForContentType(
            ContentType.PAGE
          )) as PageCreationPage;

          // Generate page data using TestDataGenerator
          const pageCreationOptions = TestDataGenerator.generatePage(
            PageContentType.NEWS,
            CONTENT_TEST_DATA.COVER_IMAGES.RATIO_300x300.fileName,
            'uncategorized'
          );

          // Create and submit the page
          const { pageId, siteId, peopleName } =
            await pageCreationPage.actions.createAndSubmitPage(pageCreationOptions);

          // Store IDs for cleanup
          publishedPageId = pageId;
          siteIdToPublishPage = siteId;
          manualCleanupNeeded = true;

          // Verify content was submitted successfully
          await contentPreviewPageStandardUser.assertions.verifyContentPublishedSuccessfully(
            pageCreationOptions.title,
            'Submitted page for approval'
          );

          await contentPreviewPageStandardUser.assertions.verifyContentStatus('Pending');

          await appManagerHomePage.page.reload();
          // Handle notification and perform action (approve/reject)
          const notificationComponentAppManager = await appManagerUINavigationHelper.clickOnBellIcon({
            stepInfo: 'Application Manager clicking on bell icon to view notifications',
          });
          const notificationMessage = peopleName + ' submitted a page for approval "' + pageCreationOptions.title + '"';
          await notificationComponentAppManager.actions.clickOnNotification(notificationMessage);

          // Perform approve or reject action
          await contentPreviewPageAppManager.actions.clickOnApproveOrRejectButton(testData.action);
          if (testData.action === 'Reject') {
            await contentPreviewPageAppManager.actions.enterRejectReason('Test reason');
          }
          await contentPreviewPageAppManager.assertions.verifyContentPublishedSuccessfully(
            pageCreationOptions.title,
            testData.actionSuccessMessage
          );
          await standardUserHomePage.page.reload();

          const notificationMessageStandardUser = await standardUserUINavigationHelper.clickOnBellIcon({
            stepInfo: 'Standard user clicking on bell icon to view notifications',
          });
          const identityManagementHelper = new IdentityManagementHelper(
            appManagerApiContext,
            getContentConfigFromCache().tenant.apiBaseUrl
          );
          const appManagerInfo = await identityManagementHelper.getUserInfoByEmail(users.appManager.email);
          const finalNotificationMessage =
            appManagerInfo.fullName + testData.notificationMessage + ' "' + pageCreationOptions.title + '"';
          await notificationMessageStandardUser.actions.clickOnNotification(finalNotificationMessage);

          if (testData.action === 'Approve & publish') {
            await contentPreviewPageStandardUser.assertions.verifyContentIsInPublishedStatus();
          } else {
            await contentPreviewPageStandardUser.assertions.verifyContentStatus('Rejected');
            await contentPreviewPageStandardUser.assertions.verifyContentHasSubmitForApprovalButton();
          }
        }
      );
    }
  }
);
