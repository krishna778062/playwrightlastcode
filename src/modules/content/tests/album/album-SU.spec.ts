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

    test(
      'Album Content Add attach file with all the Mandatory fields by Standard user',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, TestGroupType.REGRESSION, ContentSuiteTags.ALBUM_CREATION],
      },
      async ({ loginAs }) => {
        tagTest(test.info(), {
          description: 'Album Content Add attach file with all the Mandatory fields by Standard user',
          zephyrTestId: 'CONT-10342',
          storyId: 'CONT-10342',
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

        // Create and publish the album
        const { albumId, siteId, peopleId, peopleName } =
          await albumCreationPage.actions.createAndSubmitAlbum(albumCreationOptions);

        // Store IDs for cleanup
        publishedAlbumId = albumId;
        siteIdToPublishAlbum = siteId;
        manualCleanupNeeded = true;

        // Verify content was published successfully
        await contentPreviewPage.assertions.verifyContentPublishedSuccessfully(
          albumCreationOptions.title,
          'Submitted album for approval'
        );

        await contentPreviewPage.assertions.verifyContentIsInPendingStatus();

        await LoginHelper.logoutByNavigatingToLogoutPage(homePage.page);
        await loginAs('appManager');

        const notificationComponent = await homePage.actions.clickOnBellIcon();
        const notificationMessage = peopleName + ' submitted a album for approval "' + albumCreationOptions.title + '"';
        await notificationComponent.actions.clickOnNotification(notificationMessage);
        await contentPreviewPage.actions.clickOnApproveAndPublishButton();
        await contentPreviewPage.assertions.verifyContentPublishedSuccessfully(
          albumCreationOptions.title,
          'Album approved and published'
        );

        await LoginHelper.logoutByNavigatingToLogoutPage(homePage.page);
        await loginAs('endUser');
        await homePage.actions.clickOnBellIcon();
        const approvedNotificationMessage = 'Application Manager1 approved "' + albumCreationOptions.title + '"';
        await notificationComponent.actions.clickOnNotification(approvedNotificationMessage);
        await contentPreviewPage.assertions.verifyContentIsInPublishedStatus();
      }
    );
  }
);
