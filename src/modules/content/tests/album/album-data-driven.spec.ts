import { TestPriority } from '@core/constants/testPriority';
import { TestGroupType } from '@core/constants/testType';
import { TestDataGenerator } from '@core/utils/testDataGenerator';
import { tagTest } from '@core/utils/testDecorator';

import { ContentType } from '@/src/modules/content/constants/contentType';
import { ContentSuiteTags } from '@/src/modules/content/constants/testTags';
import { contentTestFixture as test } from '@/src/modules/content/fixtures/contentFixture';
import { AlbumCreationPage } from '@/src/modules/content/pages/albumCreationPage';
import { ContentPreviewPage } from '@/src/modules/content/pages/contentPreviewPage';
import { CONTENT_TEST_DATA } from '@/src/modules/content/test-data/content.test-data';

/**
 * This test suite is used to test the album creation functionality with different user roles.
 * We will test that both App Manager and Standard User are able to create albums with the same steps.
 * The test is data-driven to avoid code duplication between user roles.
 */

test.describe('Album Creation Test Suite (Data Driven)', { tag: [ContentSuiteTags.ALBUM_CREATION] }, () => {
  let albumCreationPage: AlbumCreationPage;
  let contentPreviewPage: ContentPreviewPage;
  let publishedAlbumId: string;
  let siteIdToPublishAlbum: string;
  let manualCleanupNeeded = false;

  const ALBUM_TEST_DATA = [
    {
      userRole: 'App Manager',
      userType: 'appManager' as const,
      homePageFixture: 'appManagerHomePage' as const,
      pageFixture: 'appManagersPage' as const,
      cleanupService: 'contentManagementHelper' as const,
      zephyrTestId: 'CONT-11065',
      storyId: 'CONT-11065',
      description: 'Verify admin is able to create and publish a new album with all fields populated from home page',
    },
    {
      userRole: 'Standard User',
      userType: 'endUser' as const,
      homePageFixture: 'standardUserHomePage' as const,
      pageFixture: 'standardUserPage' as const,
      cleanupService: 'appManagerApiClient' as const,
      zephyrTestId: 'CONT-10342',
      storyId: 'CONT-10342',
      description: 'Album Content Add attach file with all the Mandatory fields by Standard user',
    },
  ] as const;

  test.afterEach('Album Clean up', async ({ contentManagementHelper }) => {
    // Only cleanup manually if needed (for UI-only tests)
    if (manualCleanupNeeded && publishedAlbumId && siteIdToPublishAlbum) {
      await contentManagementHelper.deleteContent(siteIdToPublishAlbum, publishedAlbumId);
      console.log('Manual cleanup completed for album:', publishedAlbumId);
    } else {
      console.log('No album was published, hence skipping the deletion');
    }

    // Reset variables for next test
    manualCleanupNeeded = false;
    publishedAlbumId = '';
    siteIdToPublishAlbum = '';
  });

  for (const albumData of ALBUM_TEST_DATA) {
    test(
      `Create Album with all the fields populated by ${albumData.userRole}`,
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, TestGroupType.REGRESSION, ContentSuiteTags.ALBUM_CREATION],
      },
      async ({ appManagerHomePage, appManagersPage, standardUserHomePage, standardUserPage }) => {
        tagTest(test.info(), {
          description: albumData.description,
          zephyrTestId: albumData.zephyrTestId,
          storyId: albumData.storyId,
        });

        // Select the appropriate home page and page based on user role
        const homePage = albumData.userType === 'appManager' ? appManagerHomePage : standardUserHomePage;
        const page = albumData.userType === 'appManager' ? appManagersPage : standardUserPage;

        // Verify the page is loaded
        await homePage.verifyThePageIsLoaded();

        // Initialize content preview page
        contentPreviewPage = new ContentPreviewPage(page);

        // STEP 1: Navigate to album creation page
        albumCreationPage = (await homePage.actions.openCreateContentPageForContentType(
          ContentType.ALBUM
        )) as AlbumCreationPage;

        // STEP 2: Generate album data using TestDataGenerator
        const albumCreationOptions = TestDataGenerator.generateAlbum(
          CONTENT_TEST_DATA.COVER_IMAGES.RATIO_300x300.fileName,
          'sample.docx',
          'https://youtu.be/4vLyqzOr14g',
          true
        );

        // STEP 3: Create and publish the album
        const { albumId, siteId } = await albumCreationPage.actions.createAndPublishAlbum(albumCreationOptions);

        // Store IDs for cleanup
        publishedAlbumId = albumId;
        siteIdToPublishAlbum = siteId;
        manualCleanupNeeded = true;

        console.log(`INFO: Album created by ${albumData.userRole} - Album ID: ${albumId}, Site ID: ${siteId}`);

        // STEP 4: Handle promotion step
        await contentPreviewPage.actions.handlePromotionPageStep();

        // STEP 5: Verify content was published successfully
        await contentPreviewPage.assertions.verifyContentPublishedSuccessfully(
          albumCreationOptions.title,
          "Created album successfully - it's published"
        );
      }
    );
  }
});
