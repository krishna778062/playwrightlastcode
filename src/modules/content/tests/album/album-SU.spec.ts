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
import { ManageSiteContentPage } from '@/src/modules/content/pages/manageSiteContentPage';
import { ManageSitePage } from '@/src/modules/content/pages/manageSitePage';
import { SiteDashboardPage } from '@/src/modules/content/pages/siteDashboardPage';
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
    let homePage: NewUxHomePage;
    let standardUserHomePage: NewUxHomePage;
    let siteDashboardPage: SiteDashboardPage;
    let manageSitePage: ManageSitePage;
    let manageSiteContentPage: ManageSiteContentPage;
    let manualCleanupNeeded = false;
    let albumURL: string;
    let createdSite: any;

    test.beforeEach(
      'Setting up the test environment for album creation',
      async ({ standardUserHomePage, standardUserPage }) => {
        // Create home page instance and verify it's loaded
        await standardUserHomePage.verifyThePageIsLoaded();

        // Initialize preview page
        contentPreviewPage = new ContentPreviewPage(standardUserPage);

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

    test(
      'Album Content Add attach file with all the Mandatory fields by Standard user',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, TestGroupType.REGRESSION, ContentSuiteTags.ALBUM_CREATION],
      },
      async ({ standardUserHomePage }) => {
        tagTest(test.info(), {
          description: 'Album Content Add attach file with all the Mandatory fields by Standard user',
          zephyrTestId: 'CONT-10342',
          storyId: 'CONT-10342',
        });

        const title = `End User Album ${faker.company.name()}`;
        const description = `End user album description ${faker.lorem.paragraph()}`;

        // Navigate to album creation
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
