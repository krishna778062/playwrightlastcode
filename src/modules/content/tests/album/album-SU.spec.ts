import { faker } from '@faker-js/faker';

import { TestPriority } from '@core/constants/testPriority';
import { TestGroupType } from '@core/constants/testType';
import { NewUxHomePage } from '@core/pages/homePage/newUxHomePage';
import { TestDataGenerator } from '@core/utils/testDataGenerator';
import { tagTest } from '@core/utils/testDecorator';

import { ContentType } from '@/src/modules/content/constants/contentType';
import { ContentFeatureTags, ContentSuiteTags } from '@/src/modules/content/constants/testTags';
import { contentTestFixture as test } from '@/src/modules/content/fixtures/contentFixture';
import { AlbumCreationPage } from '@/src/modules/content/pages/albumCreationPage';
import { ContentPreviewPage } from '@/src/modules/content/pages/contentPreviewPage';
import { ManageSiteContentPage } from '@/src/modules/content/pages/manageSiteContentPage';
import { ManageSitePage } from '@/src/modules/content/pages/manageSitePage';
import { SiteDashboardPage } from '@/src/modules/content/pages/siteDashboardPage';
import { CONTENT_TEST_DATA } from '@/src/modules/content/test-data/content.test-data';

test.describe(
  ContentSuiteTags.ALBUM_CREATION + ' - SU Tests',
  {
    tag: [ContentSuiteTags.ALBUM_CREATION],
  },
  () => {
    let albumCreationPage: AlbumCreationPage;
    let contentPreviewPage: ContentPreviewPage;
    let publishedAlbumId: string;
    let siteIdToPublishAlbum: string;
    let homePage: NewUxHomePage;
    let siteDashboardPage: SiteDashboardPage;
    let manageSitePage: ManageSitePage;
    let manageSiteContentPage: ManageSiteContentPage;
    let manualCleanupNeeded = false;
    let albumURL: string;
    let createdSite: any;

    test.beforeEach(async ({ page, loginAs }) => {
      // Login as end user using loginAs fixture
      await loginAs('endUser');

      // Create home page instance
      homePage = new NewUxHomePage(page);
      await homePage.verifyThePageIsLoaded();

      // Initialize preview page
      contentPreviewPage = new ContentPreviewPage(page);

      // Initialize other page objects
      siteDashboardPage = new SiteDashboardPage(page, siteIdToPublishAlbum);
      manageSitePage = new ManageSitePage(page);
      manageSiteContentPage = new ManageSiteContentPage(page);

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
        tag: [TestPriority.P0, TestGroupType.SMOKE, TestGroupType.REGRESSION],
      },
      async ({ page, loginAs }) => {
        tagTest(test.info(), {
          description: 'Album Content Add attach file with all the Mandatory fields by Standard user',
          zephyrTestId: 'CONT-10342',
          storyId: 'CONT-10342',
        });

        const title = `End User Album ${faker.company.name()}`;
        const description = `End user album description ${faker.lorem.paragraph()}`;

        // Navigate to album creation
        albumCreationPage = (await homePage.actions.openCreateContentPageForContentType(
          ContentType.ALBUM
        )) as AlbumCreationPage;

        // Generate album data using TestDataGenerator
        const albumCreationOptions = TestDataGenerator.generateAlbum(
          CONTENT_TEST_DATA.COVER_IMAGES.RATIO_300x300.fileName,
          'test-attachment.pdf',
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
          title,
          "Created album successfully - it's published"
        );

        console.log(`Created album: ${title} with ID: ${albumId} in site: ${siteId}`);
      }
    );
  }
);
