import { faker } from '@faker-js/faker';

import { TestPriority } from '@core/constants/testPriority';
import { TestGroupType } from '@core/constants/testType';
import { NewUxHomePage } from '@core/pages/homePage/newUxHomePage';
import { TestDataGenerator } from '@core/utils/testDataGenerator';
import { tagTest } from '@core/utils/testDecorator';

import { getAlbumUrl } from '@/src/core/utils/urlUtils';
import { ContentType } from '@/src/modules/content/constants/contentType';
import { ContentFeatureTags, ContentSuiteTags } from '@/src/modules/content/constants/testTags';
import { contentTestFixture as test } from '@/src/modules/content/fixtures/contentFixture';
import { AlbumCreationPage } from '@/src/modules/content/pages/albumCreationPage';
import { ContentPreviewPage } from '@/src/modules/content/pages/contentPreviewPage';
import { ManageSiteContentPage } from '@/src/modules/content/pages/manageSiteContentPage';
import { ManageSitePage } from '@/src/modules/content/pages/manageSitePage';
import { SiteDashboardPage } from '@/src/modules/content/pages/siteDashboardPage';
import { CONTENT_TEST_DATA } from '@/src/modules/content/test-data/content.test-data';
import { SITE_TEST_DATA } from '@/src/modules/content/test-data/sites-create.test-data';

test.describe(
  ContentSuiteTags.ALBUM + ' - End User Tests',
  {
    tag: [ContentSuiteTags.ALBUM],
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
        tag: [TestPriority.P2, TestGroupType.SMOKE, ContentFeatureTags.ALBUM_ATTACHMENTS],
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

        // First login as app manager to create the album
        await loginAs('appManager');
        const appManagerHomePage = new NewUxHomePage(homePage.page);
        await appManagerHomePage.verifyThePageIsLoaded();

        const title = `Non-member Add Images Test Album ${faker.company.name()}`;
        const description = `Non-member add images test description ${faker.lorem.paragraph()}`;

        // Navigate to All Employees site
        await appManagerHomePage.actions.searchAndNavigateToSite('All Employees');

        albumCreationPage = (await appManagerHomePage.actions.openCreateContentPageForContentType(
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
        await contentPreviewPage.actions.handlePromotionPageStep();

        // Fetch content URL and logout
        const contentUrl = await contentPreviewPage.actions.fetchContentTypeDetailsUrl();
        await appManagerHomePage.actions.clickAvatarFromProfileMenu();
        await appManagerHomePage.actions.clickLogoutButton();

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

        // Login and create album as app manager
        await loginAs('appManager');
        const appManagerHomePage = new NewUxHomePage(homePage.page);

        const title = `Email Notification Test Album ${faker.company.name()}`;
        const description = `Email notification test description ${faker.lorem.paragraph()}`;

        await appManagerHomePage.actions.searchAndNavigateToSite('All Employees');

        albumCreationPage = (await appManagerHomePage.actions.openCreateContentPageForContentType(
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
        await contentPreviewPage.actions.handlePromotionPageStep();

        // Fetch content URL and logout
        const contentUrl = await contentPreviewPage.actions.fetchContentTypeDetailsUrl();
        await appManagerHomePage.actions.clickAvatarFromProfileMenu();
        await appManagerHomePage.actions.clickLogoutButton();

        // Login as end user and like content
        await loginAs('endUser');
        await homePage.actions.navigateToCreatedContentDetailPage(contentUrl);
        await homePage.actions.clickContentLikeIcon();
        await homePage.actions.clickAvatarFromProfileMenu();
        await homePage.actions.clickLogoutButton();

        // Login as admin and verify notification
        await loginAs('appManager');
        await appManagerHomePage.actions.clickBellIcon();
        await appManagerHomePage.actions.clickViewAllOnNotificationList();
        await appManagerHomePage.actions.refreshPage();

        // Verify like notification
        await appManagerHomePage.assertions.verifyLikeNotificationForCreatedContentType('album', 'Standard User1');
      }
    );
  }
);
