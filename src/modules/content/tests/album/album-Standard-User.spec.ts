import { ContentType } from '@content/constants/contentType';
import { ContentTestSuite } from '@content/constants/testSuite';
import { ContentSuiteTags } from '@content/constants/testTags';
import { contentTestFixture as test, users } from '@content/fixtures/contentFixture';
import { AlbumCreationPage } from '@content/pages/albumCreationPage';
import { ContentPreviewPage } from '@content/pages/contentPreviewPage';
import { CONTENT_TEST_DATA } from '@content/test-data/content.test-data';
import { TestPriority } from '@core/constants/testPriority';
import { TestGroupType } from '@core/constants/testType';
import { TestDataGenerator } from '@core/utils/testDataGenerator';
import { tagTest } from '@core/utils/testDecorator';

import { IdentityManagementHelper } from '@/src/core/helpers/identityManagementHelper';

// Test data for approve/reject scenarios
const ALBUM_APPROVAL_TEST_DATA = [
  {
    action: 'Approve & publish',
    displayName: 'Approved by Application Manager',
    zephyrTestId: 'CONT-39208',
    storyId: 'CONT-39208',
    description:
      'Album Content Add attach file with all the Mandatory fields by Standard user and approved by Application Manager',
    actionSuccessMessage: 'Album approved and published',
    notificationMessage: ' approved',
  },
  {
    action: 'Reject',
    displayName: 'Rejected by Application Manager',
    zephyrTestId: 'CONT-39209',
    storyId: 'CONT-39209',
    description:
      'Album Content Add attach file with all the Mandatory fields by Standard user and rejected by Application Manager',
    actionSuccessMessage: 'Album rejected',
    notificationMessage: ' rejected',
  },
] as const;

test.describe(
  `Album Creation by Standard user  and Approval/Rejection by Application Manager`,
  {
    tag: [ContentTestSuite.ALBUM_STANDARD_USER, ContentSuiteTags.ALBUM_CREATION],
  },
  () => {
    let albumCreationPage: AlbumCreationPage;
    let contentPreviewPageStandardUser: ContentPreviewPage;
    let contentPreviewPageAppManager: ContentPreviewPage;
    let publishedAlbumId: string;
    let siteIdToPublishAlbum: string;
    let manualCleanupNeeded = false;

    test.beforeEach(
      'Setting up the test environment for album creation',
      async ({ standardUserHomePage, standardUserPage }) => {
        // Create home page instance and verify it's loaded
        await standardUserHomePage.verifyThePageIsLoaded();

        // Initialize preview page
        contentPreviewPageStandardUser = new ContentPreviewPage(
          standardUserPage,
          siteIdToPublishAlbum,
          publishedAlbumId,
          ContentType.ALBUM
        );

        // Reset cleanup flag for each test
        manualCleanupNeeded = false;
      }
    );

    test.afterEach(async ({ appManagerApiClient }) => {
      // Only cleanup manually if needed (for UI-only tests)
      if (manualCleanupNeeded && publishedAlbumId && siteIdToPublishAlbum) {
        await appManagerApiClient.getContentManagementService().deleteContent(siteIdToPublishAlbum, publishedAlbumId);
        console.log('Manual cleanup completed for album:', publishedAlbumId);
      } else {
        console.log('No album was published, hence skipping the deletion');
      }
    });

    for (const testData of ALBUM_APPROVAL_TEST_DATA) {
      test(
        `Album Content Add attach file with all the Mandatory fields by Standard user and ${testData.displayName}`,
        {
          tag: [TestPriority.P0, TestGroupType.SMOKE, TestGroupType.REGRESSION, ContentSuiteTags.ALBUM_CREATION],
        },
        async ({ standardUserHomePage, appManagerHomePage, siteManagementHelper, appManagerApiClient }) => {
          tagTest(test.info(), {
            description: testData.description,
            zephyrTestId: testData.zephyrTestId,
            storyId: testData.storyId,
          });

          // Initialize preview page
          contentPreviewPageAppManager = new ContentPreviewPage(
            appManagerHomePage.page,
            siteIdToPublishAlbum,
            publishedAlbumId,
            ContentType.ALBUM
          );

          // Navigate to album creation by standard user
          albumCreationPage = (await standardUserHomePage.actions.openCreateContentPageForContentType(
            ContentType.ALBUM
          )) as AlbumCreationPage;

          // Generate album data using TestDataGenerator
          const albumCreationOptions = TestDataGenerator.generateAlbum(
            CONTENT_TEST_DATA.COVER_IMAGES.RATIO_300x300.fileName,
            'sample.docx',
            'https://youtu.be/4vLyqzOr14g',
            true
          );

          // Create and submit the album
          const { albumId, siteId, peopleName } =
            await albumCreationPage.actions.createAndSubmitAlbum(albumCreationOptions);

          // Store IDs for cleanup
          publishedAlbumId = albumId;
          siteIdToPublishAlbum = siteId;
          manualCleanupNeeded = true;

          // Verify content was submitted successfully
          await contentPreviewPageStandardUser.assertions.verifyContentPublishedSuccessfully(
            albumCreationOptions.title,
            'Submitted album for approval'
          );

          await contentPreviewPageStandardUser.assertions.verifyContentStatus('Pending');

          await appManagerHomePage.page.reload();
          // Handle notification and perform action (approve/reject)
          const notificationComponentAppManager = await appManagerHomePage.actions.clickOnBellIcon({
            stepInfo: 'Application Manager clicking on bell icon to view notifications',
          });
          const notificationMessage =
            peopleName + ' submitted a album for approval "' + albumCreationOptions.title + '"';
          await notificationComponentAppManager.actions.clickOnNotification(notificationMessage);

          // Perform approve or reject action
          await contentPreviewPageAppManager.actions.clickOnApproveOrRejectButton(testData.action);
          if (testData.action === 'Reject') {
            await contentPreviewPageAppManager.actions.enterRejectReason('Test reason');
          }
          await contentPreviewPageAppManager.assertions.verifyContentPublishedSuccessfully(
            albumCreationOptions.title,
            testData.actionSuccessMessage
          );

          await standardUserHomePage.page.reload();
          const notificationMessageStandardUser = await standardUserHomePage.actions.clickOnBellIcon({
            stepInfo: 'Standard user clicking on bell icon to view notifications',
          });
          const identityManagementHelper = new IdentityManagementHelper(appManagerApiClient);
          const appManagerInfo = await identityManagementHelper.getUserInfoByEmail(users.appManager.email);
          const finalNotificationMessage =
            appManagerInfo.fullName + testData.notificationMessage + ' "' + albumCreationOptions.title + '"';
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
