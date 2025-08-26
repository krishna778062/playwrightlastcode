import { faker } from '@faker-js/faker';

import { TestPriority } from '@core/constants/testPriority';
import { TestGroupType } from '@core/constants/testType';
import { NewUxHomePage } from '@core/pages/homePage/newUxHomePage';
import { tagTest } from '@core/utils/testDecorator';

import { getAlbumUrl } from '@/src/core/utils/urlUtils';
import { ContentType } from '@/src/modules/content/constants/contentType';
import { ContentFeatureTags, ContentSuiteTags } from '@/src/modules/content/constants/testTags';
import { contentTestFixture as test } from '@/src/modules/content/fixtures/contentFixture';
import { AlbumCreationPage } from '@/src/modules/content/pages/albumCreationPage';
import { ManageSiteContentPage } from '@/src/modules/content/pages/manageSiteContentPage';
import { ManageSitePage } from '@/src/modules/content/pages/manageSitePage';
import { PreviewPage } from '@/src/modules/content/pages/previewPage';
import { SiteDashboardPage } from '@/src/modules/content/pages/siteDashboardPage';
import { CONTENT_TEST_DATA } from '@/src/modules/content/test-data/content.test-data';
import { SITE_TEST_DATA } from '@/src/modules/content/test-data/sites-create.test-data';

test.describe(
  ContentSuiteTags.ALBUM,
  {
    tag: [ContentSuiteTags.ALBUM],
  },
  () => {
    let albumCreationPage: AlbumCreationPage;
    let previewPage: PreviewPage;
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
      // Login as app manager using loginAs fixture
      await loginAs('appManager');

      // Create home page instance
      homePage = new NewUxHomePage(page);
      await homePage.verifyThePageIsLoaded();

      // Initialize preview page
      previewPage = new PreviewPage(page);

      // Initialize other page objects
      siteDashboardPage = new SiteDashboardPage(page);
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
      'Create Album with all the fields populated',
      {
        tag: [TestPriority.P0, TestGroupType.REGRESSION, ContentFeatureTags.ALBUM_CREATION],
      },
      async () => {
        tagTest(test.info(), {
          description: 'Create Album with all the fields populated including video and attachments',
          zephyrTestId: 'CONT-11065',
          storyId: 'CONT-11065',
        });

        const title = `Automated Test Album ${faker.company.name()} - ${faker.commerce.productName()}`;
        const description = `This is an automated test album description ${faker.lorem.paragraph()}`;

        // Navigate to album creation
        albumCreationPage = (await homePage.actions.openCreateContentPageForContentType(
          ContentType.ALBUM
        )) as AlbumCreationPage;

        // Create and publish album with all fields
        const { albumId, siteId } = await albumCreationPage.actions.createAndPublishAlbum({
          title,
          description,
          images: [CONTENT_TEST_DATA.COVER_IMAGES.RATIO_300x300.fileName],
          videoUrl: 'https://youtu.be/4vLyqzOr14g',
          attachments: ['image1.jpg'],
          openAlbum: true,
          topics: ['Test Topic'],
        });

        // Store album id for cleanup
        publishedAlbumId = albumId;
        siteIdToPublishAlbum = siteId;
        manualCleanupNeeded = true; // Set flag for manual cleanup (UI-only test)

        // Handle promotion step
        await previewPage.actions.handlePromotionPageStep();

        // Verify album was published successfully
        await previewPage.assertions.verifyContentPublishedSuccessfully(
          title,
          "Created album successfully - it's published"
        );
      }
    );

    test(
      'Application should allow user to filter albums from the content tab on the site',
      {
        tag: [TestPriority.P0, TestGroupType.REGRESSION, TestGroupType.SMOKE, ContentFeatureTags.ALBUM_FILTERING],
      },
      async ({ appManagerApiClient, siteManagementHelper }) => {
        tagTest(test.info(), {
          description: 'Application should allow user to filter albums from the content tab on the site',
          zephyrTestId: 'CONT-10546',
          storyId: 'CONT-10546',
        });

        const title = `Filter Test Album ${faker.company.name()}`;
        const description = `Filter test album description ${faker.lorem.paragraph()}`;

        const category = await appManagerApiClient.getSiteManagementService().getCategoryId(SITE_TEST_DATA[0].category);
        createdSite = await siteManagementHelper.createPublicSite(undefined, category, {
          access: SITE_TEST_DATA[0].siteType,
        });
        const siteId = createdSite.siteId;

        const createdAlbum = await appManagerApiClient.getContentManagementService().addNewAlbumContent(siteId, {
          title,
          bodyHtml: `<p>${description}</p>`,
          contentType: 'album',
        });
        publishedAlbumId = createdAlbum.albumId;
        siteIdToPublishAlbum = siteId;

        // Construct the site dashboard URL using utility method
        albumURL = getAlbumUrl(siteIdToPublishAlbum, publishedAlbumId);
        console.log(`Constructed site dashboard URL: ${albumURL}`);
        await siteDashboardPage.actions.navigateToMangeSite();

        await manageSitePage.actions.navigateToContentTab();

        // Apply album filters
        await manageSiteContentPage.actions.applyContentFilters({
          contentType: 'Album',
          dateRange: 'Past 24 hours',
          sortBy: 'Published date (newest first)',
        });

        // Verify content is displayed
        await manageSiteContentPage.assertions.verifyContentDisplayedInMyContent();
      }
    );

    test(
      'Album Content Add attach file with all the Mandatory fields by Standard user',
      {
        tag: [TestPriority.P2, TestGroupType.SMOKE, ContentFeatureTags.ALBUM_ATTACHMENTS],
      },
      async ({ page, loginAs }) => {
        tagTest(test.info(), {
          description: 'Album Content Add attach file with all the Mandatory fields by Standard user',
          zephyrTestId: 'CONT-10342',
          storyId: 'CONT-10342',
        });

        // Login as end user
        await loginAs('endUser');

        const endUserHomePage = new NewUxHomePage(page);
        await endUserHomePage.verifyThePageIsLoaded();

        const title = `End User Album ${faker.company.name()}`;
        const description = `End user album description ${faker.lorem.paragraph()}`;

        // Navigate to album creation
        albumCreationPage = (await endUserHomePage.actions.openCreateContentPageForContentType(
          ContentType.ALBUM
        )) as AlbumCreationPage;

        // Create and publish album with video
        const { albumId, siteId } = await albumCreationPage.actions.createAndPublishAlbum({
          title,
          description,
          images: [CONTENT_TEST_DATA.COVER_IMAGES.RATIO_300x300.fileName],
          videoUrl: 'https://youtu.be/4vLyqzOr14g',
        });

        publishedAlbumId = albumId;
        siteIdToPublishAlbum = siteId;

        // Verify success message
        await albumCreationPage.assertions.verifySuccessMessage("Created album successfully - it's published");
      }
    );

    test(
      'Verify standard user is able to view My Content Send history or feedback history',
      {
        tag: [TestPriority.P2, ContentFeatureTags.ALBUM_HISTORY],
      },
      async ({ siteManagementHelper }) => {
        tagTest(test.info(), {
          description: 'Verify standard user is able to view My Content Send history or feedback history',
          zephyrTestId: 'CONT-10338',
          storyId: 'CONT-10338',
        });

        // Create a new site for testing
        const site = await siteManagementHelper.createPublicSite();
        siteIdToPublishAlbum = site.siteId;

        // Navigate to the created site
        await homePage.actions.navigateToSite(site.siteName);

        const title = `History Test Album ${faker.company.name()}`;
        const description = `History test album description ${faker.lorem.paragraph()}`;

        // Create album
        albumCreationPage = (await homePage.actions.openCreateContentPageForContentType(
          ContentType.ALBUM
        )) as AlbumCreationPage;

        const { albumId } = await albumCreationPage.actions.createAndPublishAlbum({
          title,
          description,
          images: [CONTENT_TEST_DATA.COVER_IMAGES.RATIO_300x300.fileName],
        });

        publishedAlbumId = albumId;

        // Handle promotion step
        await previewPage.actions.handlePromotionPageStep();

        // Verify send feedback tab
        await previewPage.actions.openSendFeedbackTab();
        await previewPage.assertions.verifySendHistoryTabPopup();
        await previewPage.actions.closeFeedbackModal();

        // Verify version history
        await previewPage.actions.openVersionHistory();
        await previewPage.assertions.verifyVersionHistoryTabPopup();
      }
    );

    test(
      'Verify that download functionality should work from the Album image preview',
      {
        tag: [TestPriority.P2, ContentFeatureTags.ALBUM_DOWNLOAD],
      },
      async () => {
        tagTest(test.info(), {
          description: 'Verify that download functionality should work from the Album image preview',
          zephyrTestId: 'CONT-10336',
          storyId: 'CONT-10336',
        });

        // Navigate to existing album with images
        await homePage.actions.searchAndNavigateToSite('All Employees');
        await homePage.actions.navigateToContentLink('Company Holidays');

        // Click on image from album and download
        await homePage.actions.clickImageFromAlbum();
        const downloadedFile = await extendedHomePage.actions.downloadImageFromAlbum();

        // Verify file download
        await homePage.assertions.verifyFileDownloaded(downloadedFile, 'image3', 'jpg');
      }
    );

    test(
      'Album View album with video',
      {
        tag: [TestPriority.P0, TestGroupType.REGRESSION, TestGroupType.SMOKE, ContentFeatureTags.ALBUM_VIDEO],
      },
      async () => {
        tagTest(test.info(), {
          description: 'Album View album with video',
          zephyrTestId: 'CONT-10274',
          storyId: 'CONT-10274',
        });

        // Navigate to manage content page
        await homePage.actions.navigateToManageContent();

        // Apply filters for albums
        await homePage.actions.applyContentFilters({
          contentType: 'Album',
        });

        // Select an album
        await homePage.actions.selectAlbum();

        // Verify album with video URL
        await homePage.assertions.verifyAlbumWithVideoUrl();
      }
    );

    test(
      'Application should show count of images and videos added in the album',
      {
        tag: [TestPriority.P2, ContentFeatureTags.ALBUM_COUNT],
      },
      async () => {
        tagTest(test.info(), {
          description: 'Application should show count of images and videos added in the album',
          zephyrTestId: 'CONT-10253',
          storyId: 'CONT-10253',
        });

        // Navigate to Finance site
        await homePage.actions.navigateToSitesTab();
        await homePage.actions.searchAndNavigateToSite('Finance');
        await homePage.actions.navigateToContentLink('2023 United States 2023 Holiday');

        // Get count of images and videos
        const mediaCount = await extendedHomePage.actions.getImageAndVideoCount();

        // Click on image from album
        await homePage.actions.clickImageFromAlbum();

        // Verify count is displayed correctly
        await homePage.assertions.verifyImageAndVideoCount(mediaCount);
      }
    );

    test(
      'Application should allow to edit video URL on Album page',
      {
        tag: [TestPriority.P0, TestGroupType.REGRESSION, TestGroupType.SMOKE, ContentFeatureTags.ALBUM_VIDEO_EDIT],
      },
      async () => {
        tagTest(test.info(), {
          description: 'Application should allow to edit video URL on Album page',
          zephyrTestId: 'CONT-10251',
          storyId: 'CONT-10251',
        });

        // Navigate to Finance site content
        await homePage.actions.searchAndNavigateToSite('Finance');
        await homePage.actions.navigateToContentTab();
        await homePage.actions.clickViewAllForAlbum();
        await homePage.actions.clickAlbumLink();

        // Get initial count
        const initialCount = await extendedHomePage.actions.getAlbumAndVideoCount();

        // Edit album and add video
        await homePage.actions.clickEditButton();
        await homePage.actions.addVideoToAlbum('https://youtu.be/QYHXJ_kRXbw?feature=shared');
        await homePage.actions.waitForVideoUpload();
        await homePage.actions.publishChanges();

        // Verify video was added
        await homePage.assertions.verifyAlbumUpdatedWithVideo();

        // Cleanup - remove video
        await homePage.actions.clickEditButton();
        await homePage.actions.removeVideoFromAlbum();
        await homePage.actions.publishChanges();

        // Verify count is back to original
        const finalCount = await extendedHomePage.actions.getAlbumAndVideoCount();
        await homePage.assertions.verifyCountMatches(initialCount, finalCount);
      }
    );

    test(
      'Application allow to cancel edit of content page',
      {
        tag: [TestPriority.P2, ContentFeatureTags.ALBUM_EDIT_CANCEL],
      },
      async () => {
        tagTest(test.info(), {
          description: 'Application allow to cancel edit of content page',
          zephyrTestId: 'CONT-10250',
          storyId: 'CONT-10250',
        });

        // Navigate to Finance site album
        await homePage.actions.searchAndNavigateToSite('Finance');
        await homePage.actions.navigateToContentTab();
        await homePage.actions.clickViewAllForAlbum();
        await homePage.actions.clickAlbumLink();

        // Start editing
        await homePage.actions.clickEditButton();
        await homePage.actions.changeAlbumName('Modified Album Name');

        // Cancel edit
        await homePage.actions.clickCancelButton();
        await homePage.actions.acceptAlert();

        // Verify changes were not saved
        await homePage.assertions.verifySiteNotCreatedAfterCancel();
      }
    );

    test(
      'Application allow to unpublish content page',
      {
        tag: [TestPriority.P2, ContentFeatureTags.ALBUM_UNPUBLISH],
      },
      async () => {
        tagTest(test.info(), {
          description: 'Application allow to unpublish content page',
          zephyrTestId: 'CONT-10249',
          storyId: 'CONT-10249',
        });

        // Navigate to Finance site and create album
        await homePage.actions.searchAndNavigateToSite('Finance');

        const title = `Unpublish Test Album ${faker.company.name()}`;
        const description = `Unpublish test album description ${faker.lorem.paragraph()}`;

        albumCreationPage = (await homePage.actions.openCreateContentPageForContentType(
          ContentType.ALBUM
        )) as AlbumCreationPage;

        const { albumId, siteId } = await albumCreationPage.actions.createAndPublishAlbum({
          title,
          description,
          images: ['image1.jpg'],
        });

        publishedAlbumId = albumId;
        siteIdToPublishAlbum = siteId;

        // Handle promotion step
        await previewPage.actions.handlePromotionPageStep();

        // Navigate back to site content
        await homePage.actions.navigateToSite('Finance');
        await homePage.actions.navigateToContentTab();
        await homePage.actions.searchContentInMyContent(title);
        await homePage.actions.clickCreatedContentLink();

        // Unpublish the album
        await homePage.actions.clickOptionMenuDropdown();
        await homePage.actions.clickUnpublishButton();

        // Verify unpublish action
        await homePage.assertions.verifyContentUnpublished();
      }
    );

    test(
      'To verify the content name when it is created with a long text',
      {
        tag: [TestPriority.P0, TestGroupType.REGRESSION, TestGroupType.SMOKE, ContentFeatureTags.ALBUM_LONG_TITLE],
      },
      async () => {
        tagTest(test.info(), {
          description: 'To verify the content name when it is created with a long text',
          zephyrTestId: 'CONT-25159',
          storyId: 'CONT-25159',
        });

        const longTitle = `This is a very long album title that should be tested for proper display and handling in the application interface ${faker.lorem.sentence(20)}`;
        const description = `Long title test album description ${faker.lorem.paragraph()}`;

        // Navigate to All Employees site
        await homePage.actions.searchAndNavigateToSite('All Employees');

        albumCreationPage = (await homePage.actions.openCreateContentPageForContentType(
          ContentType.ALBUM
        )) as AlbumCreationPage;

        const { albumId, siteId } = await albumCreationPage.actions.createAndPublishAlbum({
          title: longTitle,
          description,
          images: ['image1.jpg'],
        });

        publishedAlbumId = albumId;
        siteIdToPublishAlbum = siteId;

        // Handle promotion step
        await previewPage.actions.handlePromotionPageStep();

        // Navigate to content tab and verify long title display
        await homePage.actions.searchAndNavigateToSite('All Employees');
        await homePage.actions.navigateToContentTab();

        // Verify long title is displayed correctly
        await homePage.assertions.verifyLongTitleDisplayedCorrectly(longTitle);
      }
    );

    test(
      'Album File attachment',
      {
        tag: [TestPriority.P2, ContentFeatureTags.ALBUM_FILE_ATTACHMENT],
      },
      async () => {
        tagTest(test.info(), {
          description: 'Album File attachment',
          zephyrTestId: 'CONT-10243',
          storyId: 'CONT-10243',
        });

        // Navigate to All Employees site
        await homePage.actions.searchAndNavigateToSite('All Employees');

        albumCreationPage = (await homePage.actions.openCreateContentPageForContentType(
          ContentType.ALBUM
        )) as AlbumCreationPage;

        // Create album with file attachment
        await albumCreationPage.actions.scrollScreen(200);
        await albumCreationPage.actions.clickAddFilesAndAttachments();
        await albumCreationPage.actions.uploadFileAttachment('testData.txt');

        // Verify file attachment functionality
        await albumCreationPage.assertions.verifyFileAttachmentUploadAndDownload();
      }
    );

    test(
      'Album Change cover image',
      {
        tag: [TestPriority.P2, ContentFeatureTags.ALBUM_COVER_IMAGE],
      },
      async () => {
        tagTest(test.info(), {
          description: 'Album Change cover image',
          zephyrTestId: 'CONT-10240',
          storyId: 'CONT-10240',
        });

        // Navigate to All Employees site
        await homePage.actions.searchAndNavigateToSite('All Employees');

        albumCreationPage = (await homePage.actions.openCreateContentPageForContentType(
          ContentType.ALBUM
        )) as AlbumCreationPage;

        // Upload multiple images and change cover
        await albumCreationPage.actions.uploadMultipleImages(['image1.jpg', 'image3.jpg']);
        await albumCreationPage.actions.hoverAndClickMakeCover();

        // Verify cover image change functionality
        await albumCreationPage.assertions.verifyAlbumCoverImageChange();
      }
    );

    test(
      'Album Allow feed post',
      {
        tag: [TestPriority.P2, ContentFeatureTags.ALBUM_FEED_POST],
      },
      async () => {
        tagTest(test.info(), {
          description: 'Album Allow feed post',
          zephyrTestId: 'CONT-10205',
          storyId: 'CONT-10205',
        });

        // Navigate to All Employees site content
        await homePage.actions.searchAndNavigateToSite('All Employees');
        await homePage.actions.navigateToContentTab();
        await homePage.actions.clickViewAllForAlbum();
        await homePage.actions.clickAlbumLink();

        // Verify three dots menu for album actions
        await homePage.assertions.verifyThreeDotsMenuForAlbumActions();

        // Test disabling feed posts
        await homePage.actions.clickEditButton();
        await homePage.assertions.verifyAllowFeedPostOption();
        await homePage.actions.disableAllowFeedPosts();
        await homePage.actions.clickUpdateButton();
        await homePage.assertions.verifyFeedPostNotPresent();

        // Test enabling feed posts
        await homePage.actions.clickEditButton();
        await homePage.assertions.verifyAllowFeedPostOption();
        await homePage.actions.enableAllowFeedPosts();
        await homePage.actions.clickUpdateButton();
        await homePage.assertions.verifyFeedPostPresent();
      }
    );

    test(
      'Album View on album content tab',
      {
        tag: [TestPriority.P2, ContentFeatureTags.ALBUM_CONTENT_TAB],
      },
      async () => {
        tagTest(test.info(), {
          description: 'Album View on album content tab',
          zephyrTestId: 'CONT-10199',
          storyId: 'CONT-10199',
        });

        // Navigate to Finance site content
        await homePage.actions.searchAndNavigateToSite('Finance');
        await homePage.actions.navigateToContentTab();
        await homePage.actions.clickViewAllForAlbum();

        // Verify album with video URL in content tab
        await homePage.assertions.verifyAlbumWithVideoUrlInContentTab();
      }
    );

    test(
      'Verify the functionality when posted album content is unpublish on the application',
      {
        tag: [
          TestPriority.P0,
          TestGroupType.REGRESSION,
          TestGroupType.SMOKE,
          ContentFeatureTags.ALBUM_UNPUBLISH_FUNCTIONALITY,
        ],
      },
      async () => {
        tagTest(test.info(), {
          description: 'Verify the functionality when posted album content is unpublish on the application',
          zephyrTestId: 'CONT-9842',
          storyId: 'CONT-9842',
        });

        // Navigate to Finance site and create album
        await homePage.actions.searchAndNavigateToSite('Finance');

        const title = `Unpublish Functionality Test Album ${faker.company.name()}`;
        const description = `Unpublish functionality test description ${faker.lorem.paragraph()}`;

        albumCreationPage = (await homePage.actions.openCreateContentPageForContentType(
          ContentType.ALBUM
        )) as AlbumCreationPage;

        const { albumId, siteId } = await albumCreationPage.actions.createAndPublishAlbum({
          title,
          description,
          images: [CONTENT_TEST_DATA.COVER_IMAGES.RATIO_300x300.fileName],
          videoUrl: 'https://youtu.be/4vLyqzOr14g',
        });

        publishedAlbumId = albumId;
        siteIdToPublishAlbum = siteId;

        // Handle promotion step
        await previewPage.actions.handlePromotionPageStep();

        // Unpublish the album
        await previewPage.actions.clickOptionMenuDropdown();
        await previewPage.actions.clickUnpublishButton();

        // Verify unpublish functionality
        await previewPage.assertions.verifyAlbumUnpublishFunctionality();
      }
    );

    test(
      'Verify the functionality when posted album content is deleted on the application',
      {
        tag: [TestPriority.P0, TestGroupType.REGRESSION, ContentFeatureTags.ALBUM_DELETE_FUNCTIONALITY],
      },
      async () => {
        tagTest(test.info(), {
          description: 'Verify the functionality when posted album content is deleted on the application',
          zephyrTestId: 'CONT-9838',
          storyId: 'CONT-9838',
        });

        // Navigate to Finance site and create album
        await homePage.actions.searchAndNavigateToSite('Finance');

        const title = `Delete Functionality Test Album ${faker.company.name()}`;
        const description = `Delete functionality test description ${faker.lorem.paragraph()}`;

        albumCreationPage = (await homePage.actions.openCreateContentPageForContentType(
          ContentType.ALBUM
        )) as AlbumCreationPage;

        const { albumId, siteId } = await albumCreationPage.actions.createAndPublishAlbum({
          title,
          description,
          images: [CONTENT_TEST_DATA.COVER_IMAGES.RATIO_300x300.fileName],
          videoUrl: 'https://youtu.be/4vLyqzOr14g',
        });

        publishedAlbumId = albumId;
        siteIdToPublishAlbum = siteId;

        // Handle promotion step
        await previewPage.actions.handlePromotionPageStep();

        // Delete the album
        await previewPage.actions.clickOptionMenuDropdown();
        await previewPage.actions.clickDeleteButton();
        await previewPage.actions.confirmDelete();

        // Clear IDs as album is deleted
        publishedAlbumId = '';
        siteIdToPublishAlbum = '';

        // Verify delete functionality
        await previewPage.assertions.verifyAlbumDeleteFunctionality();
      }
    );

    test(
      'Album View Like Count and Like Icon',
      {
        tag: [TestPriority.P0, TestGroupType.REGRESSION, ContentFeatureTags.ALBUM_LIKE_FUNCTIONALITY],
      },
      async () => {
        tagTest(test.info(), {
          description: 'Album View Like Count and Like Icon',
          zephyrTestId: 'CONT-9834',
          storyId: 'CONT-9834',
        });

        const title = `Like Test Album ${faker.company.name()}`;
        const description = `Like test album description ${faker.lorem.paragraph()}`;

        // Navigate to All Employees site
        await homePage.actions.searchAndNavigateToSite('All Employees');

        albumCreationPage = (await homePage.actions.openCreateContentPageForContentType(
          ContentType.ALBUM
        )) as AlbumCreationPage;

        const { albumId, siteId } = await albumCreationPage.actions.createAndPublishAlbum({
          title,
          description,
          images: ['image1.jpg'],
          attachments: ['image1.jpg'],
        });

        publishedAlbumId = albumId;
        siteIdToPublishAlbum = siteId;

        // Handle promotion step
        await previewPage.actions.handlePromotionPageStep();

        // Navigate to content and test like functionality
        await homePage.actions.searchAndNavigateToSite('All Employees');
        await homePage.actions.refreshPage();
        await homePage.actions.navigateToContentTab();
        await homePage.actions.searchContentInMyContent(title);
        await homePage.actions.clickCreatedContentLink();
        await homePage.actions.clickImageFromAlbum();

        // Verify like functionality
        await homePage.assertions.verifyLikeCountAndIconAppear();
        await homePage.actions.implementAlbumImageLike();
        await homePage.assertions.verifyAlbumImageLikeImplemented();
        await homePage.actions.implementAlbumImageDislike();
        await homePage.assertions.verifyDislikeFunctionality();
      }
    );

    test(
      'Application should allow hashtag topic to the application',
      {
        tag: [TestPriority.P2, ContentFeatureTags.ALBUM_HASHTAG_TOPIC],
      },
      async () => {
        tagTest(test.info(), {
          description: 'Application should allow hashtag topic to the application',
          zephyrTestId: 'CONT-10843',
          storyId: 'CONT-10843',
        });

        const title = `Hashtag Topic Test Album ${faker.company.name()}`;
        const description = `Hashtag topic test album description ${faker.lorem.paragraph()}`;

        // Navigate to All Employees site
        await homePage.actions.searchAndNavigateToSite('All Employees');

        albumCreationPage = (await homePage.actions.openCreateContentPageForContentType(
          ContentType.ALBUM
        )) as AlbumCreationPage;

        const { albumId, siteId } = await albumCreationPage.actions.createAndPublishAlbum({
          title,
          description,
          images: ['image1.jpg'],
          topics: ['Capacity'],
        });

        publishedAlbumId = albumId;
        siteIdToPublishAlbum = siteId;

        // Handle promotion step
        await previewPage.actions.handlePromotionPageStep();

        // Navigate to manage topics
        await homePage.actions.clickAvatarFromProfileMenu();
        await homePage.actions.clickManageLinkFromProfileMenu();
        await homePage.actions.clickTopicsLinkFromMenu();
        await homePage.actions.searchCreatedTopicOnManageTopic('Capacity');

        // Verify topic creation
        await homePage.assertions.verifyApplicationAllowsAddingNewTopics();
      }
    );

    test(
      'Verify that user can move content from public to public when the user is the site owner or site manager or site content manager of both the Source and Destination Site',
      {
        tag: [TestPriority.P1, TestGroupType.SMOKE, TestGroupType.REGRESSION, ContentFeatureTags.ALBUM_MOVE_CONTENT],
      },
      async ({ loginAs }) => {
        tagTest(test.info(), {
          description:
            'Verify that user can move content from public to public when the user is the site owner or site manager or site content manager of both the Source and Destination Site',
          zephyrTestId: 'CONT-2932',
          storyId: 'CONT-2932',
        });

        // Login as custom user with manage all sites permission
        await loginAs('appManager'); // Using appManager as equivalent to CustomUserWithManageAllSites

        const title = `Move Content Test Album ${faker.company.name()}`;
        const description = `Move content test album description ${faker.lorem.paragraph()}`;

        // Navigate to Corporate Communication site
        await homePage.actions.searchAndNavigateToSite('Corporate Communication');

        albumCreationPage = (await homePage.actions.openCreateContentPageForContentType(
          ContentType.ALBUM
        )) as AlbumCreationPage;

        const { albumId, siteId } = await albumCreationPage.actions.createAndPublishAlbum({
          title,
          description,
          images: ['image1.jpg'],
          videoUrl: 'https://youtu.be/4vLyqzOr14g',
        });

        publishedAlbumId = albumId;
        siteIdToPublishAlbum = siteId;

        // Handle promotion step
        await previewPage.actions.handlePromotionPageStep();

        // Navigate to site management and move content
        await homePage.actions.searchAndNavigateToSite('Corporate Communication');
        await homePage.actions.clickManageSiteButton();
        await homePage.actions.navigateToContentTab();
        await homePage.actions.selectSortBy('Published date (newest first)');
        await homePage.actions.applyContentFilters({
          contentType: 'Page',
          status: 'Published',
        });
        await homePage.actions.clickOptionMenuDropdown();
        await homePage.actions.clickMoveButton();
        await homePage.actions.selectDestinationSite('All Employees');
        await homePage.actions.clickMoveConfirmButton();

        // Verify content moved to destination site
        await homePage.actions.searchAndNavigateToSite('All Employees');
        await homePage.actions.navigateToContentTab();
        await homePage.actions.refreshPage();
        await homePage.actions.searchContentOnContentTab(title);

        // Cleanup - delete moved content
        await homePage.actions.clickCreatedContentLink();
        await homePage.actions.clickOptionMenuDropdown();
        await homePage.actions.clickDeleteButton();
        await homePage.actions.confirmDelete();

        // Clear IDs as content is deleted
        publishedAlbumId = '';
        siteIdToPublishAlbum = '';
      }
    );

    test(
      'Verify that user can move content from private to public only when the user is the site owner or site manager or site content manager of both the Source and Destination Site',
      {
        tag: [TestPriority.P2, ContentFeatureTags.ALBUM_MOVE_PRIVATE_TO_PUBLIC],
      },
      async ({ siteManagementHelper, loginAs }) => {
        tagTest(test.info(), {
          description:
            'Verify that user can move content from private to public only when the user is the site owner or site manager or site content manager of both the Source and Destination Site',
          zephyrTestId: 'CONT-2910',
          storyId: 'CONT-2910',
        });

        // Login as custom user with manage all sites permission
        await loginAs('appManager');

        // Create a private site
        const privateSite = await siteManagementHelper.createPrivateSite();
        siteIdToPublishAlbum = privateSite.siteId;

        const title = `Private to Public Move Test Album ${faker.company.name()}`;
        const description = `Bonjour comment vas-tu`;

        // Navigate to the created private site
        await homePage.actions.navigateToSite(privateSite.siteName);

        albumCreationPage = (await homePage.actions.openCreateContentPageForContentType(
          ContentType.ALBUM
        )) as AlbumCreationPage;

        const { albumId } = await albumCreationPage.actions.createAndPublishAlbum({
          title,
          description,
          images: ['image1.jpg'],
          videoUrl: 'https://youtu.be/4vLyqzOr14g',
          language: 'French',
        });

        publishedAlbumId = albumId;

        // Handle promotion step
        await previewPage.actions.handlePromotionPageStep();

        // Move content from private to public site
        await homePage.actions.searchNewlyCreatedSite(privateSite.siteName);
        await homePage.actions.clickManageSiteButton();
        await homePage.actions.navigateToContentTab();
        await homePage.actions.searchContentInMyContent(title);
        await homePage.actions.clickOptionMenuDropdown();
        await homePage.actions.clickMoveButton();
        await homePage.actions.selectDestinationSite('Career Development');
        await homePage.actions.clickMoveConfirmButton();

        // Verify content moved to public site
        await homePage.actions.searchAndNavigateToSite('Career Development');
        await homePage.actions.navigateToContentTab();
        await homePage.actions.searchContentOnContentTab(title);

        // Cleanup - delete moved content
        await homePage.actions.clickCreatedContentLink();
        await homePage.actions.clickOptionMenuDropdown();
        await homePage.actions.clickDeleteButton();
        await homePage.actions.confirmDelete();

        // Clear IDs as content is deleted
        publishedAlbumId = '';
        siteIdToPublishAlbum = '';
      }
    );

    test(
      'Application allow to add images or videos to the album of the private site when Open Album checkbox is checked for the member of the site',
      {
        tag: [
          TestPriority.P1,
          TestGroupType.REGRESSION,
          TestGroupType.SMOKE,
          ContentFeatureTags.ALBUM_OPEN_ALBUM_PRIVATE_SITE,
        ],
      },
      async ({ loginAs }) => {
        tagTest(test.info(), {
          description:
            'Application allow to add images or videos to the album of the private site when Open Album checkbox is checked for the member of the site',
          zephyrTestId: 'CONT-10827',
          storyId: 'CONT-10827',
        });

        const title = `Open Album Private Site Test ${faker.company.name()}`;
        const description = `Open album private site test description ${faker.lorem.paragraph()}`;

        // Navigate to Finance site
        await homePage.actions.searchAndNavigateToSite('Finance');

        albumCreationPage = (await homePage.actions.openCreateContentPageForContentType(
          ContentType.ALBUM
        )) as AlbumCreationPage;

        await homePage.actions.waitForSeconds(5);

        const { albumId, siteId } = await albumCreationPage.actions.createAndPublishAlbum({
          title,
          description,
          images: ['image1.jpg'],
          videoUrl: 'https://youtu.be/4vLyqzOr14g',
          openAlbum: true,
        });

        publishedAlbumId = albumId;
        siteIdToPublishAlbum = siteId;

        // Handle promotion step
        await previewPage.actions.handlePromotionPageStep();

        // Fetch content URL and logout
        const contentUrl = await previewPage.actions.fetchContentTypeDetailsUrl();
        await homePage.actions.clickAvatarFromProfileMenu();
        await homePage.actions.clickLogoutButton();

        // Login as end user and add to album
        await loginAs('endUser');
        await homePage.actions.navigateToCreatedContentDetailPage(contentUrl);
        await homePage.actions.waitForSeconds(10);
        await homePage.actions.clickAddToAlbumButton();
        await homePage.actions.uploadFileToAlbum('image2.jpeg');
        await homePage.actions.clickAddButton();
        await homePage.actions.waitForSeconds(10);

        // Verify images uploaded successfully
        await homePage.assertions.verifyImagesUploadedSuccessfullyInOpenAlbum();

        // Logout and login as admin to check notifications
        await homePage.actions.clickAvatarFromProfileMenu();
        await homePage.actions.clickLogoutButton();
        await loginAs('appManager');
        await homePage.actions.clickBellIcon();
        await homePage.actions.clickViewAllOnNotificationList();

        // Verify notification
        await homePage.assertions.verifyInAppNotification('added 1 image to');

        // Cleanup
        await homePage.actions.navigateToCreatedContentDetailPage(contentUrl);
        await homePage.actions.clickOptionMenuDropdown();
        await homePage.actions.clickDeleteButton();
        await homePage.actions.confirmDelete();

        // Clear IDs as content is deleted
        publishedAlbumId = '';
        siteIdToPublishAlbum = '';
      }
    );

    test(
      'Application allow to delete content page',
      {
        tag: [
          TestPriority.P1,
          TestGroupType.REGRESSION,
          TestGroupType.SMOKE,
          ContentFeatureTags.ALBUM_DELETE_CONTENT_PAGE,
        ],
      },
      async () => {
        tagTest(test.info(), {
          description: 'Application allow to delete content page',
          zephyrTestId: 'CONT-11638',
          storyId: 'CONT-11638',
        });

        const title = `Delete Content Page Test Album ${faker.company.name()}`;
        const description = `Delete content page test description ${faker.lorem.paragraph()}`;

        // Navigate to Finance site
        await homePage.actions.searchAndNavigateToSite('Finance');

        albumCreationPage = (await homePage.actions.openCreateContentPageForContentType(
          ContentType.ALBUM
        )) as AlbumCreationPage;

        const { albumId, siteId } = await albumCreationPage.actions.createAndPublishAlbum({
          title,
          description,
          images: ['image1.jpg'],
        });

        publishedAlbumId = albumId;
        siteIdToPublishAlbum = siteId;

        // Handle promotion step
        await previewPage.actions.handlePromotionPageStep();

        // Fetch content URL
        const contentUrl = await previewPage.actions.fetchContentTypeDetailsUrl();

        // Navigate to site management
        await homePage.actions.navigateToSite('Finance');
        await homePage.actions.clickManageSiteButton();
        await homePage.actions.navigateToContentTab();
        await homePage.actions.navigateToCreatedContentDetailPage(contentUrl);
        await homePage.actions.waitForSeconds(3);

        // Edit album
        await homePage.actions.clickEditButton();
        await homePage.actions.changeAlbumNameOnEditPage(title + ' - Edited');
        await homePage.actions.clickPublishButton();

        // Verify edit functionality
        await homePage.assertions.verifyUserAbleToEditAlbum();

        // Test cancel delete
        await homePage.actions.clickOptionMenuDropdown();
        await homePage.actions.clickDeleteButton();
        await homePage.actions.clickCancelButton();
        await homePage.actions.acceptAlert();

        // Final delete
        await homePage.actions.clickOptionMenuDropdown();
        await homePage.actions.clickDeleteButton();
        await homePage.actions.clickDeleteSpanButton();

        // Clear IDs as content is deleted
        publishedAlbumId = '';
        siteIdToPublishAlbum = '';
      }
    );

    test(
      'Application allow to filter on my content page using Author',
      {
        tag: [
          TestPriority.P1,
          TestGroupType.REGRESSION,
          TestGroupType.SMOKE,
          ContentFeatureTags.ALBUM_FILTER_BY_AUTHOR,
        ],
      },
      async ({ loginAs }) => {
        tagTest(test.info(), {
          description: 'Application allow to filter on my content page using Author - tests multiple status filters',
          zephyrTestId: 'CONT-10822',
          storyId: 'CONT-10822',
        });

        // Login as EndUser1
        await loginAs('endUser');

        // Navigate to manage content page
        await homePage.actions.navigateToManageContentPage();
        await homePage.actions.selectSortByValueOnPageCategory('createdNewest');
        await homePage.actions.applyContentFilters({
          contentType: 'Album',
        });

        // Test different status filters
        const statusFilters = ['Draft', 'Pending', 'Published', 'Unpublished', 'Rejected'];

        for (const status of statusFilters) {
          await homePage.actions.selectStatusFromDropdown(status);
          await homePage.assertions.verifyApplicationShowsAllStatusResults(status);
        }
      }
    );

    test(
      'Verify the functionality for Content >Likes or share on my content checkbox by unchecking it in Email section',
      {
        tag: [
          TestPriority.P1,
          TestGroupType.REGRESSION,
          TestGroupType.SMOKE,
          ContentFeatureTags.ALBUM_EMAIL_NOTIFICATIONS,
        ],
      },
      async ({ loginAs }) => {
        tagTest(test.info(), {
          description:
            'Verify the functionality for Content >Likes or share on my content checkbox by unchecking it in Email section',
          zephyrTestId: 'CONT-18536',
          storyId: 'CONT-18536',
        });

        // Configure notification settings
        await homePage.actions.clickAvatarFromProfileMenu();
        await homePage.actions.clickMySettingsSection();
        await homePage.actions.navigateToNotificationsTab();
        await homePage.actions.checkContentCheckbox();
        await homePage.actions.clickContentCheckboxDropdown();
        await homePage.actions.uncheckLikesOrSharesOnMyContentCheckbox();
        await homePage.actions.clickSaveButtonIfEnabled();
        await homePage.actions.clickAvatarFromProfileMenu();
        await homePage.actions.clickLogoutButton();

        // Login and create album
        await loginAs('appManager');

        const title = `Email Notification Test Album ${faker.company.name()}`;
        const description = `Email notification test description ${faker.lorem.paragraph()}`;

        await homePage.actions.searchAndNavigateToSite('All Employees');

        albumCreationPage = (await homePage.actions.openCreateContentPageForContentType(
          ContentType.ALBUM
        )) as AlbumCreationPage;

        const { albumId, siteId } = await albumCreationPage.actions.createAndPublishAlbum({
          title,
          description,
          images: [CONTENT_TEST_DATA.COVER_IMAGES.RATIO_300x300.fileName],
        });

        publishedAlbumId = albumId;
        siteIdToPublishAlbum = siteId;

        // Handle promotion step
        await previewPage.actions.handlePromotionPageStep();

        // Fetch content URL and logout
        const contentUrl = await previewPage.actions.fetchContentTypeDetailsUrl();
        await homePage.actions.clickAvatarFromProfileMenu();
        await homePage.actions.clickLogoutButton();

        // Login as end user and like content
        await loginAs('endUser');
        await homePage.actions.navigateToCreatedContentDetailPage(contentUrl);
        await homePage.actions.clickContentLikeIcon();
        await homePage.actions.clickAvatarFromProfileMenu();
        await homePage.actions.clickLogoutButton();

        // Login as admin and verify notification
        await loginAs('appManager');
        await homePage.actions.clickBellIcon();
        await homePage.actions.clickViewAllOnNotificationList();
        await homePage.actions.refreshPage();

        // Verify like notification
        await homePage.assertions.verifyLikeNotificationForCreatedContentType('album', 'Standard User1');
      }
    );

    test(
      'Verify when an site owner user is editing the content and site manager and content manager users also edit the same content',
      {
        tag: [
          TestPriority.P1,
          TestGroupType.REGRESSION,
          TestGroupType.SMOKE,
          ContentFeatureTags.ALBUM_CONCURRENT_EDITING,
        ],
      },
      async ({ siteManagementHelper, loginAs }) => {
        tagTest(test.info(), {
          description:
            'Verify when an site owner user is editing the content and site manager and content manager users also edit the same content',
          zephyrTestId: 'CONT-26788',
          storyId: 'CONT-26788',
        });

        // Create a new site and setup users
        const site = await siteManagementHelper.createPublicSite();
        siteIdToPublishAlbum = site.siteId;

        // Navigate to site and setup members (this would require API calls or UI automation)
        await homePage.actions.navigateToSite(site.siteName);
        await homePage.actions.clickManageSiteButton();
        await homePage.actions.clickPeopleLink();
        await homePage.actions.addMember('Application Manager2');
        await homePage.actions.addMember('Standard User1');
        await homePage.actions.clickMembersLink();
        await homePage.actions.clickOptionMenuDropdownForUser('Standard User1');
        await homePage.actions.clickMakeSiteManagerButton();
        await homePage.actions.clickMembersLink();
        await homePage.actions.clickOptionMenuDropdownForUser('Application Manager2');
        await homePage.actions.clickMakeSiteContentManagerButton();
        await homePage.actions.waitForSeconds(5);

        const title = `Concurrent Editing Test Album ${faker.company.name()}`;
        const description = `Concurrent editing test description ${faker.lorem.paragraph()}`;

        // Create album
        await homePage.actions.navigateToCreatedSite(site.siteName);

        albumCreationPage = (await homePage.actions.openCreateContentPageForContentType(
          ContentType.ALBUM
        )) as AlbumCreationPage;

        const { albumId } = await albumCreationPage.actions.createAndPublishAlbum({
          title,
          description,
          images: [CONTENT_TEST_DATA.COVER_IMAGES.RATIO_300x300.fileName],
        });

        publishedAlbumId = albumId;

        // Handle promotion step
        await previewPage.actions.handlePromotionPageStep();

        // Fetch content URL and start editing
        const contentUrl = await previewPage.actions.fetchContentTypeDetailsUrl();
        await homePage.actions.clickEditButton();

        // Open new driver and test concurrent editing
        await homePage.actions.openNewDriver();
        await loginAs('endUser');
        await homePage.actions.navigateToCreatedContentDetailPage(contentUrl);
        await homePage.actions.clickEditButton();

        // Verify error message for concurrent editing
        await homePage.assertions.verifyErrorMessageContentTypeBeingEditedBy('album', 'Application Manager1');

        // Test with another user
        await homePage.actions.clickAvatarFromProfileMenu();
        await homePage.actions.clickLogoutButton();
        await loginAs('appManager'); // Using as Admin1 equivalent
        await homePage.actions.navigateToCreatedContentDetailPage(contentUrl);
        await homePage.actions.clickEditButton();

        // Verify error message
        await homePage.assertions.verifyErrorMessageContentTypeBeingEditedBy('album', 'Application Manager1');
      }
    );

    test(
      'Verify error message when site owner is editing the same content which is being edited by Site Content Manager',
      {
        tag: [
          TestPriority.P1,
          TestGroupType.REGRESSION,
          TestGroupType.SMOKE,
          ContentFeatureTags.ALBUM_SITE_OWNER_EDITING_CONFLICT,
        ],
      },
      async ({ siteManagementHelper, loginAs }) => {
        tagTest(test.info(), {
          description:
            'Verify error message when site owner is editing the same content which is being edited by Site Content Manager',
          zephyrTestId: 'CONT-26784',
          storyId: 'CONT-26784',
        });

        // Create site and setup users
        const site = await siteManagementHelper.createPublicSite();
        siteIdToPublishAlbum = site.siteId;

        // Setup site members
        await homePage.actions.navigateToSite(site.siteName);
        await homePage.actions.clickManageSiteButton();
        await homePage.actions.clickPeopleLink();
        await homePage.actions.addMember('Application Manager2');
        await homePage.actions.addMember('Standard User1');
        await homePage.actions.clickMembersLink();
        await homePage.actions.clickOptionMenuDropdownForUser('Standard User1');
        await homePage.actions.clickMakeSiteManagerButton();
        await homePage.actions.clickMembersLink();
        await homePage.actions.clickOptionMenuDropdownForUser('Application Manager2');
        await homePage.actions.clickMakeSiteContentManagerButton();

        const title = `Site Owner Editing Conflict Test ${faker.company.name()}`;
        const description = `Site owner editing conflict test description ${faker.lorem.paragraph()}`;

        // Create album
        await homePage.actions.navigateToCreatedSite(site.siteName);

        albumCreationPage = (await homePage.actions.openCreateContentPageForContentType(
          ContentType.ALBUM
        )) as AlbumCreationPage;

        const { albumId } = await albumCreationPage.actions.createAndPublishAlbum({
          title,
          description,
          images: [CONTENT_TEST_DATA.COVER_IMAGES.RATIO_300x300.fileName],
        });

        publishedAlbumId = albumId;

        // Handle promotion step
        await previewPage.actions.handlePromotionPageStep();

        // Fetch content URL and logout
        const contentUrl = await previewPage.actions.fetchContentTypeDetailsUrl();
        await homePage.actions.clickAvatarFromProfileMenu();
        await homePage.actions.clickLogoutButton();

        // Login as Admin1 and start editing
        await loginAs('appManager'); // Using as Admin1 equivalent
        await homePage.actions.navigateToCreatedContentDetailPage(contentUrl);
        await homePage.actions.clickEditButton();

        // Open new driver and login as site owner
        await homePage.actions.openNewDriver();
        await loginAs('appManager'); // Site owner
        await homePage.actions.navigateToCreatedContentDetailPage(contentUrl);
        await homePage.actions.clickEditButton();

        // Verify error message
        await homePage.assertions.verifyErrorMessageContentTypeBeingEditedBy('album', 'Application Manager2');
      }
    );

    test(
      'Verify after the content is edited by one user and other users should be able to edit the same content again',
      {
        tag: [
          TestPriority.P1,
          TestGroupType.REGRESSION,
          TestGroupType.SMOKE,
          ContentFeatureTags.ALBUM_SEQUENTIAL_EDITING,
        ],
      },
      async ({ siteManagementHelper, loginAs }) => {
        tagTest(test.info(), {
          description:
            'Verify after the content is edited by one user and other users should be able to edit the same content again',
          zephyrTestId: 'CONT-26786',
          storyId: 'CONT-26786',
        });

        // Create site and setup users
        const site = await siteManagementHelper.createPublicSite();
        siteIdToPublishAlbum = site.siteId;

        // Setup site members
        await homePage.actions.navigateToSite(site.siteName);
        await homePage.actions.clickManageSiteButton();
        await homePage.actions.clickPeopleLink();
        await homePage.actions.addMember('Application Manager2');
        await homePage.actions.addMember('Standard User1');
        await homePage.actions.clickMembersLink();
        await homePage.actions.clickOptionMenuDropdownForUser('Standard User1');
        await homePage.actions.clickMakeSiteManagerButton();
        await homePage.actions.clickMembersLink();
        await homePage.actions.clickOptionMenuDropdownForUser('Application Manager2');
        await homePage.actions.clickMakeSiteContentManagerButton();

        const title = `Sequential Editing Test Album ${faker.company.name()}`;
        const description = `Sequential editing test description ${faker.lorem.paragraph()}`;

        // Create album
        await homePage.actions.navigateToCreatedSite(site.siteName);

        albumCreationPage = (await homePage.actions.openCreateContentPageForContentType(
          ContentType.ALBUM
        )) as AlbumCreationPage;

        const { albumId } = await albumCreationPage.actions.createAndPublishAlbum({
          title,
          description,
          images: [CONTENT_TEST_DATA.COVER_IMAGES.RATIO_300x300.fileName],
        });

        publishedAlbumId = albumId;

        // Handle promotion step
        await previewPage.actions.handlePromotionPageStep();

        // Fetch content URL and start editing
        const contentUrl = await previewPage.actions.fetchContentTypeDetailsUrl();
        await homePage.actions.clickEditButton();
        await homePage.actions.replaceTitleOfContent('Title_Change_For_Editing');
        await homePage.actions.clickCancelButton();
        await homePage.actions.acceptAlert();

        // Open duplicate window and test sequential editing
        await homePage.actions.openDuplicateWindowAndSwitchToTab();
        await homePage.actions.clickAvatarFromProfileMenu();
        await homePage.actions.clickLogoutButton();
        await loginAs('endUser');
        await homePage.actions.navigateToCreatedContentDetailPage(contentUrl);
        await homePage.actions.clickEditButton();

        // Verify no error message is displayed
        await homePage.assertions.verifyErrorMessageNotDisplayedForContentTypeBeingEditedBy(
          'album',
          'Application Manager2'
        );

        // Make changes
        await homePage.actions.replaceTitleOfContent('Title_Change_For_Editing_1');
      }
    );

    test(
      'Verify user should be able to add video using URL for Youtube and should be allowed for Album Cover',
      {
        tag: [
          TestPriority.P1,
          TestGroupType.REGRESSION,
          TestGroupType.SMOKE,
          ContentFeatureTags.ALBUM_YOUTUBE_VIDEO_COVER,
        ],
      },
      async () => {
        tagTest(test.info(), {
          description:
            'Verify user should be able to add video using URL for Youtube and should be allowed for Album Cover',
          zephyrTestId: 'CONT-24407',
          storyId: 'CONT-24407',
        });

        const title = `YouTube Video Cover Test Album ${faker.company.name()}`;
        const description = `YouTube video cover test description ${faker.lorem.paragraph()}`;

        // Navigate to All Employees site
        await homePage.actions.searchAndNavigateToSite('All Employees');

        albumCreationPage = (await homePage.actions.openCreateContentPageForContentType(
          ContentType.ALBUM
        )) as AlbumCreationPage;

        // Add video URL first
        await albumCreationPage.actions.clickEnterVideoUrlButton();
        await albumCreationPage.actions.addYoutubeVideoUrlInPopupCoverSection(
          'https://youtu.be/-2RAq5o5pwc?si=JxHzuerkcqO8VTDf'
        );
        await albumCreationPage.actions.clickAddVideoButton();
        await albumCreationPage.actions.waitForVideoToUpload();

        const { albumId, siteId } = await albumCreationPage.actions.createAndPublishAlbum({
          title,
          description,
          images: [CONTENT_TEST_DATA.COVER_IMAGES.RATIO_300x300.fileName],
        });

        publishedAlbumId = albumId;
        siteIdToPublishAlbum = siteId;

        // Verify success message
        await albumCreationPage.assertions.verifySuccessMessage("Created album successfully - it's published");
      }
    );

    test(
      'Verify non-member user of the Public Site should be able to add images option when open album checkbox is checked',
      {
        tag: [
          TestPriority.P1,
          TestGroupType.REGRESSION,
          TestGroupType.SMOKE,
          ContentFeatureTags.ALBUM_NON_MEMBER_ADD_IMAGES,
        ],
      },
      async ({ loginAs }) => {
        tagTest(test.info(), {
          description:
            'Verify non-member user of the Public Site should be able to add images option when open album checkbox is checked',
          zephyrTestId: 'CONT-24169',
          storyId: 'CONT-24169',
        });

        const title = `Non-member Add Images Test Album ${faker.company.name()}`;
        const description = `Non-member add images test description ${faker.lorem.paragraph()}`;

        // Navigate to All Employees site
        await homePage.actions.searchAndNavigateToSite('All Employees');

        albumCreationPage = (await homePage.actions.openCreateContentPageForContentType(
          ContentType.ALBUM
        )) as AlbumCreationPage;

        const { albumId, siteId } = await albumCreationPage.actions.createAndPublishAlbum({
          title,
          description,
          images: [CONTENT_TEST_DATA.COVER_IMAGES.RATIO_300x300.fileName],
          videoUrl: 'https://youtu.be/4vLyqzOr14g',
          attachments: ['image1.jpg'],
          openAlbum: true,
          topics: ['Test Topic'],
        });

        publishedAlbumId = albumId;
        siteIdToPublishAlbum = siteId;

        // Handle promotion step
        await previewPage.actions.handlePromotionPageStep();

        // Fetch content URL and logout
        const contentUrl = await previewPage.actions.fetchContentTypeDetailsUrl();
        await homePage.actions.clickAvatarFromProfileMenu();
        await homePage.actions.clickLogoutButton();

        // Login as non-member user and add images
        await loginAs('endUser'); // Using as EndUser1 equivalent
        await homePage.actions.navigateToCreatedContentDetailPage(contentUrl);
        await homePage.actions.clickAddToAlbumButton();
        await homePage.actions.uploadFileToAlbum('image2.jpeg');
        await homePage.actions.clickAddButton();
        await homePage.actions.waitForSeconds(3);
        await homePage.actions.refreshPage();

        // Verify images uploaded successfully
        await homePage.assertions.verifyImagesUploadedSuccessfullyInOpenAlbum();
      }
    );

    test(
      'Verify the scenario when user has the album link and the album got deleted or unpublished or site got deactivated',
      {
        tag: [
          TestPriority.P1,
          TestGroupType.REGRESSION,
          TestGroupType.SMOKE,
          ContentFeatureTags.ALBUM_DELETED_LINK_ACCESS,
        ],
      },
      async ({ loginAs }) => {
        tagTest(test.info(), {
          description:
            'Verify the scenario when user has the album link and the album got deleted or unpublished or site got deactivated',
          zephyrTestId: 'CONT-24162',
          storyId: 'CONT-24162',
        });

        const title = `Deleted Link Access Test Album ${faker.company.name()}`;
        const description = `Deleted link access test description ${faker.lorem.paragraph()}`;

        // Navigate to Finance site
        await homePage.actions.searchAndNavigateToSite('Finance');

        albumCreationPage = (await homePage.actions.openCreateContentPageForContentType(
          ContentType.ALBUM
        )) as AlbumCreationPage;

        const { albumId, siteId } = await albumCreationPage.actions.createAndPublishAlbum({
          title,
          description,
          images: ['image1.jpg'],
        });

        publishedAlbumId = albumId;
        siteIdToPublishAlbum = siteId;

        // Handle promotion step
        await previewPage.actions.handlePromotionPageStep();

        // Fetch content URL and delete album
        const contentUrl = await previewPage.actions.fetchContentTypeDetailsUrl();
        await previewPage.actions.clickOptionMenuDropdown();
        await previewPage.actions.clickDeleteButton();
        await previewPage.actions.clickDeleteButton();
        await homePage.actions.waitForSeconds(4);

        // Clear IDs as content is deleted
        publishedAlbumId = '';
        siteIdToPublishAlbum = '';

        // Logout and login as different user
        await homePage.actions.clickAvatarFromProfileMenu();
        await homePage.actions.clickLogoutButton();
        await loginAs('appManager');

        // Try to access deleted album
        await homePage.actions.navigateToCreatedContentDetailPage(contentUrl);

        // Verify error message
        await homePage.assertions.verifyErrorMessage('Album not available');
      }
    );

    test(
      'Verify the scenario where user is creating an Draft album with Save Option',
      {
        tag: [TestPriority.P1, TestGroupType.REGRESSION, TestGroupType.SMOKE, ContentFeatureTags.ALBUM_DRAFT_SAVE],
      },
      async () => {
        tagTest(test.info(), {
          description: 'Verify the scenario where user is creating an Draft album with Save Option',
          zephyrTestId: 'CONT-24161',
          storyId: 'CONT-24161',
        });

        const title = `Draft Save Test Album ${faker.company.name()}`;
        const description = `Draft save test description ${faker.lorem.paragraph()}`;

        // Navigate to Finance site
        await homePage.actions.searchAndNavigateToSite('Finance');

        albumCreationPage = (await homePage.actions.openCreateContentPageForContentType(
          ContentType.ALBUM
        )) as AlbumCreationPage;

        // Create album and save as draft
        await albumCreationPage.actions.fillAlbumDetails({
          title,
          description,
          images: ['image1.jpg'],
        });

        await albumCreationPage.actions.clickSaveButton();

        // Verify draft saved message
        await albumCreationPage.assertions.verifySuccessMessage('Draft saved successfully');

        // Publish the draft
        await albumCreationPage.actions.clickPublishButton();
        await homePage.actions.waitForSeconds(3);

        // Verify publish message
        await albumCreationPage.assertions.verifySuccessMessage("Updated album successfully - it's published");

        // Extract IDs for cleanup
        publishedAlbumId = await albumCreationPage.actions.extractAlbumId();
        siteIdToPublishAlbum = await albumCreationPage.actions.extractSiteId();
      }
    );

    test(
      'Verify error message "Album title is a required field" when user does not enter any title',
      {
        tag: [
          TestPriority.P1,
          TestGroupType.REGRESSION,
          TestGroupType.SMOKE,
          ContentFeatureTags.ALBUM_REQUIRED_TITLE_VALIDATION,
        ],
      },
      async () => {
        tagTest(test.info(), {
          description: 'Verify error message "Album title is a required field" when user does not enter any title',
          zephyrTestId: 'CONT-24159',
          storyId: 'CONT-24159',
        });

        const description = `Required title validation test description ${faker.lorem.paragraph()}`;

        // Navigate to Finance site
        await homePage.actions.searchAndNavigateToSite('Finance');

        albumCreationPage = (await homePage.actions.openCreateContentPageForContentType(
          ContentType.ALBUM
        )) as AlbumCreationPage;

        // Fill album details without title
        await albumCreationPage.actions.fillAlbumDetails({
          title: 'Temporary Title',
          description,
          images: ['image1.jpg'],
        });

        // Clear the title
        await albumCreationPage.actions.clearAlbumTitle();

        // Try to publish
        await albumCreationPage.actions.clickPublishButton();

        // Verify error message
        await albumCreationPage.assertions.verifyAlbumTitleErrorMessage('Album title is a required field');
      }
    );

    test(
      'Create an album with Publish from - Date as future date',
      {
        tag: [
          TestPriority.P1,
          TestGroupType.REGRESSION,
          TestGroupType.SMOKE,
          ContentFeatureTags.ALBUM_FUTURE_PUBLISH_DATE,
        ],
      },
      async () => {
        tagTest(test.info(), {
          description: 'Create an album with Publish from - Date as future date',
          zephyrTestId: 'CONT-22792',
          storyId: 'CONT-22792',
        });

        const title = `Future Publish Date Test Album ${faker.company.name()}`;
        const description = `Future publish date test description ${faker.lorem.paragraph()}`;

        // Navigate to All Employees site
        await homePage.actions.searchAndNavigateToSite('All Employees');

        albumCreationPage = (await homePage.actions.openCreateContentPageForContentType(
          ContentType.ALBUM
        )) as AlbumCreationPage;

        const { albumId, siteId } = await albumCreationPage.actions.createAlbumWithFutureDate({
          title,
          description,
          images: [CONTENT_TEST_DATA.COVER_IMAGES.RATIO_300x300.fileName],
        });

        publishedAlbumId = albumId;
        siteIdToPublishAlbum = siteId;

        // Schedule the album
        await albumCreationPage.actions.clickScheduleButton();

        // Verify schedule toast
        await albumCreationPage.assertions.verifyScheduleToastMessage();
      }
    );

    test(
      'Create a album with Publish until Date as 3 months, 6 months or Choose Date',
      {
        tag: [
          TestPriority.P1,
          TestGroupType.REGRESSION,
          TestGroupType.SMOKE,
          ContentFeatureTags.ALBUM_PUBLISH_UNTIL_DATE,
        ],
      },
      async () => {
        tagTest(test.info(), {
          description: 'Create a album with Publish until Date as 3 months, 6 months or Choose Date',
          zephyrTestId: 'CONT-22793',
          storyId: 'CONT-22793',
        });

        // Test 3 months publish until date
        const title1 = `3 Months Publish Until Test Album ${faker.company.name()}`;
        const description1 = `3 months publish until test description ${faker.lorem.paragraph()}`;

        await homePage.actions.searchAndNavigateToSite('All Employees');

        albumCreationPage = (await homePage.actions.openCreateContentPageForContentType(
          ContentType.ALBUM
        )) as AlbumCreationPage;

        let { albumId, siteId } = await albumCreationPage.actions.createAndPublishAlbum({
          title: title1,
          description: description1,
          images: [CONTENT_TEST_DATA.COVER_IMAGES.RATIO_300x300.fileName],
          publishUntilDate: '3 months (from publish date)',
        });

        publishedAlbumId = albumId;
        siteIdToPublishAlbum = siteId;

        await albumCreationPage.assertions.verifySuccessMessage("Created album successfully - it's published");

        // Test 6 months publish until date
        await homePage.actions.navigateToHomePage();
        const title2 = `6 Months Publish Until Test Album ${faker.company.name()}`;
        const description2 = `6 months publish until test description ${faker.lorem.paragraph()}`;

        await homePage.actions.searchAndNavigateToSite('All Employees');

        albumCreationPage = (await homePage.actions.openCreateContentPageForContentType(
          ContentType.ALBUM
        )) as AlbumCreationPage;

        ({ albumId, siteId } = await albumCreationPage.actions.createAndPublishAlbum({
          title: title2,
          description: description2,
          images: [CONTENT_TEST_DATA.COVER_IMAGES.RATIO_300x300.fileName],
          publishUntilDate: '6 months (from publish date)',
        }));

        // Update for cleanup
        publishedAlbumId = albumId;
        siteIdToPublishAlbum = siteId;

        await albumCreationPage.assertions.verifySuccessMessage("Created album successfully - it's published");

        // Test custom date
        await homePage.actions.navigateToHomePage();
        const title3 = `Custom Date Publish Until Test Album ${faker.company.name()}`;
        const description3 = `Custom date publish until test description ${faker.lorem.paragraph()}`;

        await homePage.actions.searchAndNavigateToSite('All Employees');

        albumCreationPage = (await homePage.actions.openCreateContentPageForContentType(
          ContentType.ALBUM
        )) as AlbumCreationPage;

        ({ albumId, siteId } = await albumCreationPage.actions.createAlbumWithFutureDate({
          title: title3,
          description: description3,
          images: [CONTENT_TEST_DATA.COVER_IMAGES.RATIO_300x300.fileName],
        }));

        // Update for cleanup
        publishedAlbumId = albumId;
        siteIdToPublishAlbum = siteId;

        await albumCreationPage.actions.clickScheduleButton();
        await albumCreationPage.assertions.verifyScheduleToastMessage();
      }
    );
  }
);
