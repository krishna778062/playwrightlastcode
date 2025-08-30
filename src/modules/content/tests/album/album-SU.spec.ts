import { faker } from '@faker-js/faker';

import { TestPriority } from '@core/constants/testPriority';
import { TestGroupType } from '@core/constants/testType';
import { NewUxHomePage } from '@core/pages/homePage/newUxHomePage';
import { TestDataGenerator } from '@core/utils/testDataGenerator';
import { tagTest } from '@core/utils/testDecorator';

import { LoginHelper } from '@/src/core/helpers/loginHelper';
import { ContentType } from '@/src/modules/content/constants/contentType';
import { ContentTestSuite } from '@/src/modules/content/constants/testSuite';
import { ContentFeatureTags, ContentSuiteTags } from '@/src/modules/content/constants/testTags';
import { contentTestFixture as test } from '@/src/modules/content/fixtures/contentFixture';
import { AlbumCreationPage } from '@/src/modules/content/pages/albumCreationPage';
import { ContentPreviewPage } from '@/src/modules/content/pages/contentPreviewPage';
import { CONTENT_TEST_DATA } from '@/src/modules/content/test-data/content.test-data';

test.describe(
  ContentTestSuite.ALBUM_SU,
  {
    tag: [ContentTestSuite.ALBUM_SU],
  },
  () => {
    let albumCreationPage: AlbumCreationPage;
    let contentPreviewPage: ContentPreviewPage;
    let publishedAlbumId: string;
    let siteIdToPublishAlbum: string;
    let manualCleanupNeeded = false;
    let homePage: NewUxHomePage;

    test.beforeEach('Setting up the test environment for album creation', async ({ loginAs, page }) => {
      await loginAs('endUser');
      // Create home page instance and verify it's loaded
      homePage = new NewUxHomePage(page);
      await homePage.verifyThePageIsLoaded();

      // Initialize preview page
      contentPreviewPage = new ContentPreviewPage(
        homePage.page,
        siteIdToPublishAlbum,
        publishedAlbumId,
        ContentType.ALBUM
      );

      // Reset cleanup flag for each test
      manualCleanupNeeded = false;
    });

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
        actionMethod: 'clickOnApproveAndPublishButton',
        actionSuccessMessage: 'Album approved and published',
        finalNotificationMessage: 'Application Manager1 approved',
        finalVerification: 'verifyContentIsInPublishedStatus',
      },
      {
        action: 'Reject',
        displayName: 'Rejected by Application Manager',
        zephyrTestId: 'CONT-39209',
        storyId: 'CONT-39209',
        description:
          'Album Content Add attach file with all the Mandatory fields by Standard user and rejected by Application Manager',
        actionMethod: 'clickOnRejectButton',
        actionSuccessMessage: 'Album rejected',
        finalNotificationMessage: 'Application Manager1 rejected',
        finalVerification: 'verifyContentIsRejected',
      },
    ] as const;

    for (const testData of ALBUM_APPROVAL_TEST_DATA) {
      test(
        `Album Content Add attach file with all the Mandatory fields by Standard user and ${testData.displayName}`,
        {
          tag: [TestPriority.P0, TestGroupType.SMOKE, TestGroupType.REGRESSION, ContentSuiteTags.ALBUM_CREATION],
        },
        async ({ loginAs }) => {
          tagTest(test.info(), {
            description: testData.description,
            zephyrTestId: testData.zephyrTestId,
            storyId: testData.storyId,
          });

          // Navigate to album creation
          albumCreationPage = (await homePage.actions.openCreateContentPageForContentType(
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
          await contentPreviewPage.assertions.verifyContentPublishedSuccessfully(
            albumCreationOptions.title,
            'Submitted album for approval'
          );

          await contentPreviewPage.assertions.verifyContentStatus('Pending');

          // Switch to App Manager
          await LoginHelper.logoutByNavigatingToLogoutPage(homePage.page);
          await loginAs('appManager');

          // Handle notification and perform action (approve/reject)
          const notificationComponent = await homePage.actions.clickOnBellIcon();
          const notificationMessage =
            peopleName + ' submitted a album for approval "' + albumCreationOptions.title + '"';
          await notificationComponent.actions.clickOnNotification(notificationMessage);

          // Perform approve or reject action
          await contentPreviewPage.actions.clickOnApproveOrRejectButton(testData.action);
          if (testData.action === 'Reject') {
            await contentPreviewPage.actions.enterRejectReason('Test reason');
          }
          await contentPreviewPage.assertions.verifyContentPublishedSuccessfully(
            albumCreationOptions.title,
            testData.actionSuccessMessage
          );

          // Switch back to Standard User to verify final notification
          await LoginHelper.logoutByNavigatingToLogoutPage(homePage.page);
          await loginAs('endUser');
          await homePage.actions.clickOnBellIcon();
          const finalNotificationMessage = testData.finalNotificationMessage + ' "' + albumCreationOptions.title + '"';
          await notificationComponent.actions.clickOnNotification(finalNotificationMessage);

          if (testData.action === 'Approve & publish') {
            await contentPreviewPage.assertions.verifyContentIsInPublishedStatus();
          } else {
            await contentPreviewPage.assertions.verifyContentStatus('Rejected');
            await contentPreviewPage.assertions.verifyContentHasSubmitForApprovalButton();
          }
        }
      );
    }
  }
);
