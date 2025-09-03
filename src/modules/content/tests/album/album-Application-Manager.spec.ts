import { TestPriority } from '@core/constants/testPriority';
import { TestGroupType } from '@core/constants/testType';
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
  ContentTestSuite.ALBUM_AM,
  {
    tag: [ContentTestSuite.ALBUM_AM],
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
      async ({ appManagerHomePage, appManagersPage }) => {
        tagTest(test.info(), {
          description:
            'Verify admin is able to create and publish a new album with all fields populated from home page',
          zephyrTestId: 'CONT-11065',
          storyId: 'CONT-11065',
        });

        // Navigate to album creation page
        albumCreationPage = (await appManagerHomePage.actions.openCreateContentPageForContentType(
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
