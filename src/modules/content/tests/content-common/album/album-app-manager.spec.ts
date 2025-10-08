import { ContentType } from '@content/constants/contentType';
import { ContentTestSuite } from '@content/constants/testSuite';
import { ContentSuiteTags } from '@content/constants/testTags';
import { contentTestFixture as test } from '@content/fixtures/contentFixture';
import { CONTENT_TEST_DATA } from '@content/test-data/content.test-data';
import { AlbumCreationPage } from '@content/ui/pages/albumCreationPage';
import { ContentPreviewPage } from '@content/ui/pages/contentPreviewPage';
import { TestPriority } from '@core/constants/testPriority';
import { TestGroupType } from '@core/constants/testType';
import { TestDataGenerator } from '@core/utils/testDataGenerator';
import { tagTest } from '@core/utils/testDecorator';

test.describe(
  `Album Creation by Application Manager`,
  {
    tag: [ContentTestSuite.ALBUM_APP_MANAGER, ContentSuiteTags.ALBUM_CREATION],
  },
  () => {
    let albumCreationPage: AlbumCreationPage;
    let contentPreviewPage: ContentPreviewPage;
    let siteIdToPublishAlbum: string;
    let publishedAlbumId: string;
    let manualCleanupNeeded = false;

    test.beforeEach(
      'Setting up the test environment for album creation',
      async ({ appManagerHomePage, appManagersPage }) => {
        // Create home page instance and verify it's loaded
        await appManagerHomePage.verifyThePageIsLoaded();

        // Initialize preview page
        contentPreviewPage = new ContentPreviewPage(
          appManagersPage,
          siteIdToPublishAlbum,
          publishedAlbumId,
          ContentType.ALBUM
        );

        // Reset cleanup flag for each test
        manualCleanupNeeded = false;
      }
    );

    test.afterEach(async ({ contentManagementHelper }) => {
      // Only cleanup manually if needed (for UI-only tests)
      if (manualCleanupNeeded && publishedAlbumId && siteIdToPublishAlbum) {
        await contentManagementHelper.deleteContent(siteIdToPublishAlbum, publishedAlbumId);
        console.log('Manual cleanup completed for album:', publishedAlbumId);
      } else {
        console.log('No album was published, hence skipping the deletion');
      }
    });

    test(
      'Create Album with all the fields populated from home page',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, TestGroupType.REGRESSION, ContentSuiteTags.ALBUM_CREATION],
      },
      async ({ appManagerHomePage, appManagerUINavigationHelper }) => {
        tagTest(test.info(), {
          description:
            'Verify admin is able to create and publish a new album with all fields populated from home page',
          zephyrTestId: 'CONT-11065',
          storyId: 'CONT-11065',
        });

        // Navigate to album creation page
        await appManagerHomePage.verifyThePageIsLoaded();
        albumCreationPage = (await appManagerUINavigationHelper.openCreateContentPageForContentType(
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
        const { albumId, siteId } = await albumCreationPage.actions.createAndPublishAlbum(albumCreationOptions);

        // Store IDs for cleanup
        publishedAlbumId = albumId;
        siteIdToPublishAlbum = siteId;
        manualCleanupNeeded = true;

        // Handle promotion step
        await contentPreviewPage.actions.handlePromotionPageStep();

        // Verify content was published successfully
        await contentPreviewPage.assertions.verifyContentPublishedSuccessfully(
          albumCreationOptions.title,
          "Created album successfully - it's published"
        );
      }
    );
  }
);
