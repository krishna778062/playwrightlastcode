import { TestPriority } from '@core/constants/testPriority';
import { TestGroupType } from '@core/constants/testType';
import { TestDataGenerator } from '@core/utils/testDataGenerator';
import { tagTest } from '@core/utils/testDecorator';

import { ContentType } from '@/src/modules/content/constants/contentType';
import { PageContentType } from '@/src/modules/content/constants/pageContentType';
import { ContentTestSuite } from '@/src/modules/content/constants/testSuite';
import { ContentSuiteTags } from '@/src/modules/content/constants/testTags';
import { contentTestFixture as test } from '@/src/modules/content/fixtures/contentFixture';
import { ContentPreviewPage } from '@/src/modules/content/pages/contentPreviewPage';
import { PageCreationPage } from '@/src/modules/content/pages/pageCreationPage';
import { CONTENT_TEST_DATA } from '@/src/modules/content/test-data/content.test-data';

// Test data for approve/reject scenarios
const PAGE_APPROVAL_TEST_DATA = [
  {
    action: 'Approve & publish',
    zephyrTestId: 'CONT-1378',
    storyId: 'CONT-1378',
    description:
      'Page Content Add attach file with all the Mandatory fields by Standard user and approved by Application Manager',
    actionSuccessMessage: 'Page approved and published',
    finalNotificationMessage: 'Application Manager1 approved',
  },
  {
    action: 'Reject',
    zephyrTestId: 'CONT-20053',
    storyId: 'CONT-20053',
    description:
      'Page Content Add attach file with all the Mandatory fields by Standard user and rejected by Application Manager',
    actionSuccessMessage: 'Page rejected',
    finalNotificationMessage: 'Application Manager1 rejected',
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

    test.afterEach(async ({ appManagerApiClient }) => {
      // Only cleanup manually if needed (for UI-only tests)
      if (manualCleanupNeeded && publishedPageId && siteIdToPublishPage) {
        await appManagerApiClient.getContentManagementService().deleteContent(siteIdToPublishPage, publishedPageId);
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
        async ({ standardUserHomePage, appManagerHomePage }) => {
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
          pageCreationPage = (await standardUserHomePage.actions.openCreateContentPageForContentType(
            ContentType.PAGE
          )) as PageCreationPage;

          // Generate page data using TestDataGenerator
          const pageCreationOptions = TestDataGenerator.generatePage(
            PageContentType.NEWS,
            CONTENT_TEST_DATA.COVER_IMAGES.RATIO_300x300.fileName,
            'uncategorized'
          );

          // Create and submit the page
          const { pageId, siteId, peopleId, peopleName } =
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

          // Handle notification and perform action (approve/reject)
          const notificationComponentAppManager = await appManagerHomePage.actions.clickOnBellIcon({
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

          const notificationMessageStandardUser = await standardUserHomePage.actions.clickOnBellIcon({
            stepInfo: 'Standard user clicking on bell icon to view notifications',
          });
          const finalNotificationMessage = testData.finalNotificationMessage + ' "' + pageCreationOptions.title + '"';
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
