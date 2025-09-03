import { faker } from '@faker-js/faker';

import { TestPriority } from '@core/constants/testPriority';
import { TestGroupType } from '@core/constants/testType';
import { NewUxHomePage } from '@core/pages/homePage/newUxHomePage';
import { TestDataGenerator } from '@core/utils/testDataGenerator';
import { tagTest } from '@core/utils/testDecorator';

import { ContentType } from '@/src/modules/content/constants/contentType';
import { ContentTestSuite } from '@/src/modules/content/constants/testSuite';
import { ContentFeatureTags, ContentSuiteTags } from '@/src/modules/content/constants/testTags';
import { contentTestFixture as test } from '@/src/modules/content/fixtures/contentFixture';
import { AlbumCreationPage } from '@/src/modules/content/pages/albumCreationPage';
import { ContentPreviewPage } from '@/src/modules/content/pages/contentPreviewPage';
import { CONTENT_TEST_DATA } from '@/src/modules/content/test-data/content.test-data';

test.describe(
  ContentTestSuite.ALBUM_STANDARD_USER,
  {
    tag: [ContentTestSuite.ALBUM_STANDARD_USER],
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
        finalNotificationMessage: 'Application Manager1 approved',
      },
      {
        action: 'Reject',
        displayName: 'Rejected by Application Manager',
        zephyrTestId: 'CONT-39209',
        storyId: 'CONT-39209',
        description:
          'Album Content Add attach file with all the Mandatory fields by Standard user and rejected by Application Manager',
        actionSuccessMessage: 'Album rejected',
        finalNotificationMessage: 'Application Manager1 rejected',
      },
    ] as const;

    for (const testData of ALBUM_APPROVAL_TEST_DATA) {
      test(
        `Album Content Add attach file with all the Mandatory fields by Standard user and ${testData.displayName}`,
        {
          tag: [TestPriority.P0, TestGroupType.SMOKE, TestGroupType.REGRESSION, ContentSuiteTags.ALBUM_CREATION],
        },
        async ({ standardUserHomePage, appManagerHomePage }) => {
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
          const { albumId, siteId, peopleId, peopleName } =
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

          const notificationMessageStandardUser = await standardUserHomePage.actions.clickOnBellIcon({
            stepInfo: 'Standard user clicking on bell icon to view notifications',
          });
          const finalNotificationMessage = testData.finalNotificationMessage + ' "' + albumCreationOptions.title + '"';
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
