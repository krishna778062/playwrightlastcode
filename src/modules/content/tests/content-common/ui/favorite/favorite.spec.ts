import { TestPriority } from '@core/constants/testPriority';
import { TestGroupType } from '@core/constants/testType';
import { FileUtil } from '@core/utils/fileUtil';

import { SideNavBarComponent } from '@/src/core/ui/components/sideNavBarComponent';
import { NewHomePage } from '@/src/core/ui/pages/newHomePage';
import { tagTest } from '@/src/core/utils/testDecorator';
import {
  FilesPreviewDeleteModal,
  FilesPreviewShowMoreActionsOption,
} from '@/src/modules/content/constants/filesPreviewEnums';
import { SitePageTab } from '@/src/modules/content/constants/sitePageEnums';
import { ContentTestSuite } from '@/src/modules/content/constants/testSuite';
import { contentTestFixture as test } from '@/src/modules/content/fixtures/contentFixture';
import { FEED_TEST_DATA } from '@/src/modules/content/test-data/feed.test-data';
import { FILE_TEST_DATA } from '@/src/modules/content/test-data/file.test-data';
import { MANAGE_SITE_TEST_DATA } from '@/src/modules/content/test-data/manage-site-test-data';
import { DEFAULT_PUBLIC_SITE_NAME } from '@/src/modules/content/test-data/sites-create.test-data';
import { TestFileHelper } from '@/src/modules/content/tests/utils/testFileHelper';
import { ContentPreviewPage, ManageSitePage, ManageSitesComponent } from '@/src/modules/content/ui';
import { FilesPreviewMenuActionButton } from '@/src/modules/content/ui/components/filesPreviewModalComponent';
import { SiteManager } from '@/src/modules/content/ui/managers/siteManager';
import { FavoritePage } from '@/src/modules/content/ui/pages/favoritePage';
import { FavoritesPage } from '@/src/modules/content/ui/pages/favoritesPage';
import { PeopleScreenPage } from '@/src/modules/content/ui/pages/peopleScreenPage';
import { ProfileScreenPage } from '@/src/modules/content/ui/pages/profileScreenPage';
import { SiteFilesPage } from '@/src/modules/content/ui/pages/sitePages/siteFilesPage';
import { SITE_TYPES } from '@/src/modules/global-search/constants/siteTypes';

test.describe(
  'favorite',
  {
    tag: [ContentTestSuite.FAVORITE],
  },
  () => {
    let sideNavBarComponent: SideNavBarComponent;
    let peopleScreenPage: PeopleScreenPage;
    let profileScreenPage: ProfileScreenPage;
    let favoritePage: FavoritePage;
    test.beforeEach('Setup for favorite test', async ({ appManagerFixture }) => {
      sideNavBarComponent = new SideNavBarComponent(appManagerFixture.page);
      peopleScreenPage = new PeopleScreenPage(appManagerFixture.page);
      favoritePage = new FavoritePage(appManagerFixture.page);
    });

    test.afterEach(async ({}) => {});

    test(
      'should navigate to favorite page and interact with user profile CONT-27834',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, '@CONT-27834'],
      },
      async ({ appManagerFixture }) => {
        tagTest(test.info(), {
          description:
            'To verify that no user details are removed from the favourite people tab when hovering the mouse over the user profile.',
          zephyrTestId: 'CONT-27834',
          storyId: 'CONT-27834',
        });
        await appManagerFixture.homePage.verifyThePageIsLoaded();
        await appManagerFixture.homePage.clickOnPeople();
        await peopleScreenPage.disableLimitResultToggle();
        const { fullName, peopleId } = await peopleScreenPage.gettingUserName(
          appManagerFixture.identityManagementHelper
        );
        await peopleScreenPage.searchingAndOpeningUserProfile(fullName);
        await peopleScreenPage.openingUserProfile(fullName);

        // Create ProfileScreenPage with the correct peopleId after getting user info
        profileScreenPage = new ProfileScreenPage(appManagerFixture.page, peopleId);
        await profileScreenPage.verifyThePageIsLoaded();
        const wasAlreadyFavorited = await profileScreenPage.clickOnFavoriteOption();

        // Navigate to favorites page
        await sideNavBarComponent.clickOnFavorite();
        await favoritePage.clickOnPeopleTab();
        await favoritePage.searchingFavoriteUser(fullName);

        const userProfileLink = favoritePage.getUserProfileLink(fullName);
        const isUserVisible = await userProfileLink.isVisible().catch(() => false);

        // Handle two scenarios based on initial favorite status:
        // 1. If user was already favorited: we unfavorited them, so verify they're removed from favorites
        // 2. If user was not favorited: we favorited them, so verify they appear and test hover functionality
        if (wasAlreadyFavorited) {
          await test.step('Verify user is removed from favorites after unfavoriting', async () => {
            if (isUserVisible) {
              throw new Error(`User "${fullName}" is still visible in favorites page after unfavoriting`);
            }
          });
          return;
        }

        if (!isUserVisible) {
          return;
        }

        await test.step('Verify user is visible and details remain after favoriting', async () => {
          await favoritePage.verifyTheUserIsVisible(fullName);

          // Hover on user profile and verify details remain visible
          await favoritePage.hoverOnUserProfile(fullName);
          await favoritePage.verifyUserDetailsRemainVisible(fullName);

          // Verify contact icons are visible
          await favoritePage.verifyContactIconsAreVisible(fullName);

          // Verify contact icons remain visible after hover
          await favoritePage.verifyContactIconsRemainVisibleAfterHover(fullName);
        });
      }
    );

    test(
      'should verify favorite people search functionality CONT-26448',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, '@CONT-26448'],
      },
      async ({ appManagerFixture }) => {
        tagTest(test.info(), {
          description: 'To verify the favourite people search functionality',
          zephyrTestId: 'CONT-26448',
          storyId: 'CONT-26448',
        });
        await appManagerFixture.homePage.verifyThePageIsLoaded();

        // Navigate directly to favorites page
        await sideNavBarComponent.clickOnFavorite();
        await favoritePage.verifyThePageIsLoaded();

        // Click on People tab
        await favoritePage.clickOnPeopleTab();

        // Get the first user displayed on the favorites people tab
        const firstUserName = await favoritePage.getFirstDisplayedUserName();

        // Verify the search bar is visible
        await favoritePage.verifyPeopleSearchBarIsVisible();

        // Search for the first user and verify search returns correct data
        await test.step('Search for the first displayed user', async () => {
          await favoritePage.searchingFavoriteUser(firstUserName);
          await favoritePage.verifyTheUserIsVisible(firstUserName);
        });

        // Enter random text and verify "Nothing to show here" message
        await test.step('Enter random text and verify "Nothing to show here" message', async () => {
          await favoritePage.searchPeople(FEED_TEST_DATA.SEARCH.RANDOM_TEXT);

          await favoritePage.verifyNothingToShowMessage();
        });
      }
    );

    test(
      'should verify favorite content search functionality CONT-26266',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, '@CONT-26266'],
      },
      async ({ appManagerFixture }) => {
        tagTest(test.info(), {
          description: 'To verify the favourite content search functionality',
          zephyrTestId: 'CONT-26266',
          storyId: 'CONT-26266',
        });
        await appManagerFixture.homePage.verifyThePageIsLoaded();

        // Navigate directly to favorites page
        await sideNavBarComponent.clickOnFavorite();
        await favoritePage.verifyThePageIsLoaded();

        // Click on Content tab
        await favoritePage.clickOnContentTab();

        // Get the first content name from the content tab
        await favoritePage.verifyFirstContentLinkIsVisible();
        const firstContentLink = favoritePage.getFirstContentLink();
        const firstContentName = (await firstContentLink.textContent())?.trim() || '';

        // Verify the search bar is visible
        await favoritePage.verifyContentSearchBarIsVisible();

        // Search for the first content and verify search returns correct data
        if (firstContentName) {
          await test.step('Search for the first displayed content', async () => {
            await favoritePage.searchContent(firstContentName);
            await favoritePage.verifyContentIsVisibleInSearchResults(firstContentName);
          });
        }

        // Enter random text and verify "Nothing to show here" message
        await test.step('Enter random text and verify "Nothing to show here" message', async () => {
          await favoritePage.searchContent(FEED_TEST_DATA.SEARCH.RANDOM_TEXT);

          await favoritePage.verifyNothingToShowMessage();
        });
      }
    );

    test(
      'should verify the UI of favourite feed post CONT-26466',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, '@CONT-26466'],
      },
      async ({ appManagerFixture }) => {
        tagTest(test.info(), {
          description: 'To verify the UI of favourite feed post',
          zephyrTestId: 'CONT-26466',
          storyId: 'CONT-26466',
        });
        await appManagerFixture.homePage.verifyThePageIsLoaded();

        // Navigate directly to favorites page
        await sideNavBarComponent.clickOnFavorite();
        await favoritePage.verifyThePageIsLoaded();

        // Click on Feed tab
        await favoritePage.clickOnFeedTab();

        // Verify all the feed posts marked favourite are listing
        await favoritePage.verifyAllFavoriteFeedPostsAreListed();

        // Get the first feed post container
        const firstPostContent = favoritePage.getFirstFeedPostContent();
        await favoritePage.verifier.verifyTheElementIsVisible(firstPostContent, {
          assertionMessage: 'First feed post container should be visible',
        });

        // Get the post container that contains both postContent and action buttons
        const postContainer = favoritePage.getPostContainer(firstPostContent);

        // Get post text for fallback timestamp verification
        const postTextParagraph = favoritePage.getPostTextParagraph(firstPostContent);
        const firstFeedPostText = (await postTextParagraph.textContent())?.trim() || '';

        await favoritePage.likeFeedPost(postContainer);
        const testComment = 'Test comment from automation';
        await favoritePage.commentOnFeedPost(postContainer, testComment);
        // Verify user can unfavorite the feed post
        await favoritePage.unfavoriteFeedPost(postContainer);
        await favoritePage.verifyShareButtonIsVisible(postContainer);
        await favoritePage.verifyUserNameAndFeedCreatedDate(postContainer, firstFeedPostText);
      }
    );

    //TODO: Why video is not visible?
    test.fixme(
      'should verify the listing options of videos in favourites page CONT-26283',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, '@CONT-26283'],
      },
      async ({ appManagerFixture }) => {
        tagTest(test.info(), {
          description: 'To verify the listing options of videos in favourites page',
          zephyrTestId: 'CONT-26283',
          storyId: 'CONT-26283',
        });

        // Get video file path - test will fail if file doesn't exist
        const videoFilePath = FILE_TEST_DATA.VIDEOS.TEST_VIDEO.getPath(__dirname);
        if (!FileUtil.fileExists(videoFilePath)) {
          throw new Error(
            `Required test video file not found at: ${videoFilePath}. Please add the test video file to test-data/static-files/video/`
          );
        }

        const testSiteName = DEFAULT_PUBLIC_SITE_NAME;

        const testVideoDetails = {
          filePath: videoFilePath,
          fileName: FILE_TEST_DATA.VIDEOS.TEST_VIDEO.fileName,
          fileSystemCleanupRequired: false,
        };
        let siteFilesPage: SiteFilesPage;

        await test.step('Setup: Navigate to site and upload video file', async () => {
          await appManagerFixture.homePage.verifyThePageIsLoaded();
          // Get site ID for DEFAULT_PUBLIC_SITE_NAME site
          const siteId = await appManagerFixture.siteManagementHelper.getSiteIdWithName(testSiteName);
          const siteManager = new SiteManager(appManagerFixture.page, siteId);
          await siteManager.loadSite();
          siteFilesPage = (await siteManager.goToTab(SitePageTab.FilesTab)) as SiteFilesPage;
          await siteFilesPage.verifyThePageIsLoaded();

          // Click on Site videos tab for video uploads
          await siteFilesPage.clickSiteVideosTab();

          try {
            // Upload video file
            await siteFilesPage.uploadFileViaSelectFromComputer(testVideoDetails.filePath);

            // Navigate to Site videos tab to find the uploaded video
            await siteFilesPage.clickSiteVideosTab();
            await siteFilesPage.verifyFileIsPresentInTheSiteFilesList(testVideoDetails.fileName);
          } catch (error) {
            console.error('Error setting up video file:', error);
            throw error;
          }
        });

        await test.step('Open video, verify options, then like and favorite it', async () => {
          // Navigate to Site videos tab and open the video
          await siteFilesPage.clickSiteVideosTab();
          await siteFilesPage.clickToOpenFileInFilesPreview(testVideoDetails.fileName);
          await siteFilesPage.filesPreviewModalComponent.verifyFileNameTitle(testVideoDetails.fileName);

          const modalContainer = siteFilesPage.filesPreviewModalComponent.filesPreviewModalContainer;

          // Verify like, unfavorite, and delete options are visible
          const likeButton = modalContainer.getByRole('button', { name: /^Like|Unlike$/i }).first();
          const favoriteButton = modalContainer.getByRole('button', { name: /^Favorite|Unfavorite$/i }).first();
          const showMoreButton = modalContainer.getByRole('button', { name: 'Show more' });

          await siteFilesPage.filesPreviewModalComponent.verifier.verifyTheElementIsVisible(likeButton, {
            assertionMessage: 'Like button should be visible',
          });
          await siteFilesPage.filesPreviewModalComponent.verifier.verifyTheElementIsVisible(favoriteButton, {
            assertionMessage: 'Favorite button should be visible',
          });
          await siteFilesPage.filesPreviewModalComponent.verifier.verifyTheElementIsVisible(showMoreButton, {
            assertionMessage: 'Show more button (for delete) should be visible',
          });

          // Click like button
          await siteFilesPage.filesPreviewModalComponent.clickOnElement(likeButton);

          // Click favorite button
          await siteFilesPage.filesPreviewModalComponent.clickOnElement(favoriteButton);

          // Wait for favorite button to change to "Unfavorite" to confirm action completed
          await appManagerFixture.page
            .waitForFunction(() => {
              const button = document.querySelector(
                'button[aria-label*="Favorite" i], button[aria-label*="Unfavorite" i]'
              );
              if (!button) return false;
              const text = (button.textContent || '').toLowerCase();
              const ariaLabel = (button.getAttribute('aria-label') || '').toLowerCase();
              return text.includes('unfavorite') || ariaLabel.includes('unfavorite');
            })
            .catch(() => {
              // If waitForFunction fails, continue - verification will catch if favorite didn't work
            });

          // Close the preview modal
          const closeButton = modalContainer.getByRole('button', { name: 'Close' }).first();
          await siteFilesPage.filesPreviewModalComponent.verifier.verifyTheElementIsVisible(closeButton, {
            assertionMessage: 'Close button should be visible',
          });
          await siteFilesPage.filesPreviewModalComponent.clickOnElement(closeButton);
        });

        await test.step('Verify video appears in favorites Files tab', async () => {
          // Navigate to favorites and verify video is visible in Files tab
          await sideNavBarComponent.clickOnFavorite();
          await favoritePage.verifyThePageIsLoaded();
          await favoritePage.clickOnElement(favoritePage.filesTab);
          await favoritePage.verifyVideoIsVisibleInFilesTab(testVideoDetails.fileName);
        });

        await test.step('Click on unfavorite star icon in favorites Files tab', async () => {
          await favoritePage.clickUnfavoriteButtonForFileInFilesTab(testVideoDetails.fileName);
        });

        await test.step('Verify video is removed from favorites page', async () => {
          await favoritePage.verifyVideoIsNotVisibleInFilesTab(testVideoDetails.fileName);
        });

        await test.step('Navigate back to site files, favorite the video again, then delete it', async () => {
          // Navigate back to site files
          const siteId = await appManagerFixture.siteManagementHelper.getSiteIdWithName(testSiteName);
          const siteManager = new SiteManager(appManagerFixture.page, siteId);
          await siteManager.loadSite();
          siteFilesPage = (await siteManager.goToTab(SitePageTab.FilesTab)) as SiteFilesPage;
          await siteFilesPage.verifyThePageIsLoaded();
          await siteFilesPage.clickSiteVideosTab();

          // Favorite the video again for delete test
          await siteFilesPage.clickToOpenFileInFilesPreview(testVideoDetails.fileName);
          await siteFilesPage.filesPreviewModalComponent.verifyFileNameTitle(testVideoDetails.fileName);

          const modalContainer = siteFilesPage.filesPreviewModalComponent.filesPreviewModalContainer;
          const favoriteButton = modalContainer.getByRole('button', { name: /^Favorite|Unfavorite$/i }).first();
          await siteFilesPage.filesPreviewModalComponent.verifier.verifyTheElementIsVisible(favoriteButton, {
            assertionMessage: 'Favorite button should be visible',
          });
          await siteFilesPage.filesPreviewModalComponent.clickOnElement(favoriteButton);

          // Delete the video
          await siteFilesPage.filesPreviewModalComponent.clickOnPreviewMenuActionButton(
            FilesPreviewMenuActionButton.SHOW_MORE_ACTIONS
          );
          await siteFilesPage.filesPreviewModalComponent.clickOnShowMoreActionsOption(
            FilesPreviewShowMoreActionsOption.Delete
          );
          await siteFilesPage.filesPreviewModalComponent.confirmDeleteOrCancelFromDeleteFileModal(
            FilesPreviewDeleteModal.Delete
          );
          await siteFilesPage.filesPreviewModalComponent.verifyToastMessageIsVisibleWithText(
            MANAGE_SITE_TEST_DATA.TOAST_MESSAGES.DELETED_FILE_SUCCESSFULLY
          );
        });
      }
    );

    test(
      'to verify the favourite and unfavourite content functionality CONT-26268',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, '@CONT-26268'],
      },
      async ({ appManagerFixture }) => {
        tagTest(test.info(), {
          description: 'To verify the favourite and unfavourite content functionality',
          zephyrTestId: 'CONT-26268',
          storyId: 'CONT-26268',
        });
        const siteInfo = await appManagerFixture.siteManagementHelper.getSiteByAccessType(SITE_TYPES.PUBLIC);

        // Create page, album, and event content in parallel since they are independent API calls
        const [pageInfo, albumInfo, eventInfo] = await Promise.all([
          appManagerFixture.contentManagementHelper.createPage({
            siteId: siteInfo.siteId,
            contentInfo: { contentType: 'page', contentSubType: 'news' },
          }),
          appManagerFixture.contentManagementHelper.createAlbum({
            siteId: siteInfo.siteId,
            imageName: 'beach.jpg',
          }),
          appManagerFixture.contentManagementHelper.createEvent({
            siteId: siteInfo.siteId,
            contentInfo: { contentType: 'event' },
          }),
        ]);

        // Favorite page
        const contentPreviewPage = new ContentPreviewPage(
          appManagerFixture.page,
          siteInfo.siteId,
          pageInfo.contentId,
          'page'
        );
        await contentPreviewPage.loadPage();
        await contentPreviewPage.clickOnFavouriteContentButton();

        // Favorite album
        const contentPreviewPageAlbum = new ContentPreviewPage(
          appManagerFixture.page,
          siteInfo.siteId,
          albumInfo.contentId,
          'album'
        );
        await contentPreviewPageAlbum.loadPage();
        await contentPreviewPageAlbum.clickOnFavouriteContentButton();

        // Favorite event
        const contentPreviewPageEvent = new ContentPreviewPage(
          appManagerFixture.page,
          siteInfo.siteId,
          eventInfo.contentId,
          'event'
        );
        await contentPreviewPageEvent.loadPage();
        await contentPreviewPageEvent.clickOnFavouriteContentButton();

        // Navigate to favorites and verify all content is visible
        const manageSitesComponent = new ManageSitesComponent(appManagerFixture.page);
        await manageSitesComponent.clickOnTheFavouriteTabsAction();
        const favoritesPage = new FavoritesPage(appManagerFixture.page);
        await favoritesPage.clickOnContentButton();
        await Promise.all([
          favoritesPage.verifyContentIsVisibleInSearchResults(pageInfo.pageName),
          favoritesPage.verifyContentIsVisibleInSearchResults(albumInfo.albumName),
          favoritesPage.verifyContentIsVisibleInSearchResults(eventInfo.eventName),
        ]);

        // Unfavorite page and verify it can be favorited again
        await favoritesPage.unfavoriteContentByName(pageInfo.pageName);
        const contentPreviewPageForUnfavorite = new ContentPreviewPage(
          appManagerFixture.page,
          siteInfo.siteId,
          pageInfo.contentId,
          'page'
        );
        await contentPreviewPageForUnfavorite.loadPage();
        await contentPreviewPageForUnfavorite.verifyUserCanMarkAsFavoriteContent();

        // Navigate back to favorites page
        await manageSitesComponent.clickOnTheFavouriteTabsAction();
        await favoritesPage.clickOnContentButton();

        // Unfavorite album and verify it can be favorited again
        await favoritesPage.unfavoriteContentByName(albumInfo.albumName);
        const contentPreviewPageAlbumForUnfavorite = new ContentPreviewPage(
          appManagerFixture.page,
          siteInfo.siteId,
          albumInfo.contentId,
          'album'
        );
        await contentPreviewPageAlbumForUnfavorite.loadPage();
        await contentPreviewPageAlbumForUnfavorite.verifyUserCanMarkAsFavoriteContent();

        // Navigate back to favorites page
        await manageSitesComponent.clickOnTheFavouriteTabsAction();
        await favoritesPage.clickOnContentButton();

        // Unfavorite event and verify it can be favorited again
        await favoritesPage.unfavoriteContentByName(eventInfo.eventName);
        const contentPreviewPageEventForUnfavorite = new ContentPreviewPage(
          appManagerFixture.page,
          siteInfo.siteId,
          eventInfo.contentId,
          'event'
        );
        await contentPreviewPageEventForUnfavorite.loadPage();
        await contentPreviewPageEventForUnfavorite.verifyUserCanMarkAsFavoriteContent();
      }
    );
    test(
      'to verify the favourite and unfavourite files functionality CONT-26467',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, '@CONT-26467'],
      },
      async ({ appManagerFixture }) => {
        tagTest(test.info(), {
          description: 'To verify the favourite and unfavourite files functionality',
          zephyrTestId: 'CONT-26467',
          storyId: 'CONT-26467',
        });
        const getListOfSitesResponse = await appManagerFixture.siteManagementHelper.getListOfSites();
        console.log('getListOfSitesResponse', getListOfSitesResponse);
        const siteId = getListOfSitesResponse.result.listOfItems[0].siteId;
        console.log('siteId', siteId);
        const imageFileName = FEED_TEST_DATA.ATTACHMENTS.IMAGE;
        const imagePath = TestFileHelper.getTestDataFilePath(imageFileName, __dirname);
        const fileSize = FileUtil.getFileSize(imagePath);
        const getSignedUploadUrlResponse =
          await appManagerFixture.contentManagementHelper.imageUploaderService.getSignedUploadUrl({
            file_name: imageFileName,
            mime_type: 'image/jpeg',
            size: fileSize,
            uploadContext: 'site-files',
            type: 'content',
            siteId: siteId,
          });
        await appManagerFixture.contentManagementHelper.imageUploaderService.uploadFileToSignedUrl(
          getSignedUploadUrlResponse.uploadUrl,
          imagePath,
          imageFileName
        );
        const fileDetails = await appManagerFixture.contentManagementHelper.imageUploaderService.uploadIntranetFile(
          siteId,
          imageFileName,
          imagePath,
          'image/jpeg'
        );
        console.log('fileDetails', fileDetails);
        const siteManager = new SiteManager(appManagerFixture.page, siteId);
        await siteManager.loadSite();
        const manageSitePage = new ManageSitePage(appManagerFixture.page);
        await manageSitePage.clickOnSiteTab(SitePageTab.FilesTab);
        await manageSitePage.verifyFileIsPresentInTheSiteFilesList(fileDetails.fileInfo.title);
        await manageSitePage.clickOnFileOption(fileDetails.fileInfo.title);
        await manageSitePage.clickOnFileFavoriteButton();
        const homePage = new NewHomePage(appManagerFixture.page);
        await homePage.loadPage();
        const manageSitesComponent = new ManageSitesComponent(appManagerFixture.page);
        await manageSitesComponent.clickOnTheFavouriteTabsAction();
        const favoritesPage = new FavoritesPage(appManagerFixture.page);
        await favoritesPage.clickOnFileTab();
        await favoritesPage.verifyFileIsVisibleInFilesTab(fileDetails.fileInfo.title);
        await favoritesPage.unfavoriteFileByName(fileDetails.fileInfo.title);
        const siteManagerAfterUnfavorite = new SiteManager(appManagerFixture.page, siteId);
        await siteManagerAfterUnfavorite.loadSite();
        const manageSitePageAfterUnfavorite = new ManageSitePage(appManagerFixture.page);
        await manageSitePageAfterUnfavorite.clickOnSiteTab(SitePageTab.FilesTab);
        await manageSitePageAfterUnfavorite.verifyFileIsPresentInTheSiteFilesList(fileDetails.fileInfo.title);
        await manageSitePageAfterUnfavorite.clickOnFileOption(fileDetails.fileInfo.title);
        await manageSitePageAfterUnfavorite.verifyFavoriteIsNotClicked();
      }
    );
  }
);
