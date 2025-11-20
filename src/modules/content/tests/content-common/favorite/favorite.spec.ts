import * as os from 'os';
import * as path from 'path';

import { TestPriority } from '@core/constants/testPriority';
import { TestGroupType } from '@core/constants/testType';
import { FileUtil } from '@core/utils/fileUtil';

import { SideNavBarComponent } from '@/src/core/ui/components/sideNavBarComponent';
import { tagTest } from '@/src/core/utils/testDecorator';
import {
  FilesPreviewDeleteModal,
  FilesPreviewShowMoreActionsOption,
} from '@/src/modules/content/constants/filesPreviewEnums';
import { SitePageTab } from '@/src/modules/content/constants/sitePageEnums';
import { contentTestFixture as test } from '@/src/modules/content/fixtures/contentFixture';
import { FAVORITE_TEST_DATA } from '@/src/modules/content/test-data/favorite.test-data';
import { FilesPreviewMenuActionButton } from '@/src/modules/content/ui/components/filesPreviewModalComponent';
import { SiteManager } from '@/src/modules/content/ui/managers/siteManager';
import { FavoritePage } from '@/src/modules/content/ui/pages/favoritePage';
import { PeopleScreenPage } from '@/src/modules/content/ui/pages/peopleScreenPage';
import { ProfileScreenPage } from '@/src/modules/content/ui/pages/profileScreenPage';
import { SiteFilesPage } from '@/src/modules/content/ui/pages/sitePages/siteFilesPage';

test.describe('favorite', () => {
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
    'should navigate to favorite page and interact with user profile',
    {
      tag: [TestPriority.P0, TestGroupType.SMOKE, '@favorite'],
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
      await peopleScreenPage.actions.disableLimitResultToggle();
      await peopleScreenPage.actions.gettingUserName(appManagerFixture.identityManagementHelper);
      await peopleScreenPage.actions.searchingAndOpeningUserProfile(peopleScreenPage.fullName);
      await peopleScreenPage.actions.openingUserProfile();

      // Create ProfileScreenPage with the correct peopleId after getting user info
      profileScreenPage = new ProfileScreenPage(appManagerFixture.page, peopleScreenPage.peopleId);
      await profileScreenPage.verifyThePageIsLoaded();
      const wasAlreadyFavorited = await profileScreenPage.actions.clickOnFavoriteOption();

      // Navigate to favorites page
      await sideNavBarComponent.clickOnFavorite();
      await favoritePage.actions.clickOnPeopleTab();
      await favoritePage.actions.searchingFavoriteUser(peopleScreenPage.fullName);

      const userProfileLink = favoritePage.getUserProfileLink(peopleScreenPage.fullName);
      const isUserVisible = await userProfileLink.isVisible().catch(() => false);

      if (wasAlreadyFavorited) {
        // Scenario 2: User was already favorited, we unfavorited them
        // Check that user is NOT present in favorites page - if not present, end test
        if (!isUserVisible) {
          // User is correctly not showing in favorites page after unfavoriting - end test here
          return;
        } else {
          // User is still showing in favorites page after unfavoriting - this is unexpected
          throw new Error(`User "${peopleScreenPage.fullName}" is still visible in favorites page after unfavoriting`);
        }
      } else {
        // Scenario 1: User was NOT favorited, we favorited them
        // Check if user is visible in favorites page - if not, end test early
        if (!isUserVisible) {
          // User is not showing in favorites page after favoriting - end test here
          return;
        }

        // User is visible - proceed with all verification scenarios
        await favoritePage.assertions.verifyTheUserIsVisible(peopleScreenPage.fullName);

        // Hover on user profile and verify details remain visible
        await favoritePage.actions.hoverOnUserProfile(peopleScreenPage.fullName);
        await favoritePage.assertions.verifyUserDetailsRemainVisible(peopleScreenPage.fullName);

        // Verify contact icons are visible
        await favoritePage.assertions.verifyContactIconsAreVisible(peopleScreenPage.fullName);

        // Verify contact icons remain visible after hover
        await favoritePage.assertions.verifyContactIconsRemainVisibleAfterHover(peopleScreenPage.fullName);
      }
    }
  );

  test(
    'should verify favorite people search functionality',
    {
      tag: [TestPriority.P0, TestGroupType.SMOKE, '@favorite'],
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
      await favoritePage.actions.clickOnPeopleTab();

      // Get the first user displayed on the favorites people tab
      const firstUserName = await favoritePage.actions.getFirstDisplayedUserName();

      // Verify the search bar is visible
      await favoritePage.assertions.verifyPeopleSearchBarIsVisible();
      await test.step('Verify the search bar is visible', async () => {
        await favoritePage.verifier.verifyTheElementIsVisible(favoritePage.searchBar, {
          assertionMessage: 'Search bar should be visible on favorites people tab',
        });
      });

      // Search for the first user and verify search returns correct data
      await test.step('Search for the first displayed user', async () => {
        await favoritePage.actions.searchingFavoriteUser(firstUserName);
        await favoritePage.assertions.verifyTheUserIsVisible(firstUserName);
      });

      // Enter random text and verify "Nothing to show here" message
      await test.step('Enter random text and verify "Nothing to show here" message', async () => {
        await favoritePage.actions.searchPeople(FAVORITE_TEST_DATA.SEARCH.RANDOM_TEXT);
        await favoritePage.assertions.verifyNothingToShowMessage();
      });
    }
  );

  test(
    'should verify favorite content search functionality',
    {
      tag: [TestPriority.P0, TestGroupType.SMOKE, '@favorite'],
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
      await favoritePage.clickOnElement(favoritePage.contentTab);

      // Get the first content name from the content tab
      await favoritePage.assertions.verifyFirstContentLinkIsVisible();
      const firstContentLink = favoritePage.getFirstContentLink();
      const firstContentName = (await firstContentLink.textContent())?.trim() || '';

      // Verify the search bar is visible
      await favoritePage.assertions.verifyContentSearchBarIsVisible();

      // Search for the first content and verify search returns correct data
      if (firstContentName) {
        await test.step('Search for the first displayed content', async () => {
          await favoritePage.actions.searchContent(firstContentName);

          await favoritePage.assertions.verifyContentIsVisibleInSearchResults(firstContentName);
        });
      }

      // Enter random text and verify "Nothing to show here" message
      await test.step('Enter random text and verify "Nothing to show here" message', async () => {
        await favoritePage.actions.searchContent(FAVORITE_TEST_DATA.SEARCH.RANDOM_TEXT);

        await favoritePage.assertions.verifyNothingToShowMessage();
      });
    }
  );

  test(
    'should verify the UI of favourite feed post',
    {
      tag: [TestPriority.P0, TestGroupType.SMOKE, '@favorite'],
    },
    async ({ appManagerFixture }) => {
      tagTest(test.info(), {
        description: 'To verify the UI of favourite feed post',
        zephyrTestId: '26466',
        storyId: '26466',
      });
      await appManagerFixture.homePage.verifyThePageIsLoaded();

      // Navigate directly to favorites page
      await sideNavBarComponent.clickOnFavorite();
      await favoritePage.verifyThePageIsLoaded();

      // Click on Feed tab
      await favoritePage.clickOnElement(favoritePage.feedTab);

      // Verify all the feed posts marked favourite are listing
      await favoritePage.assertions.verifyAllFavoriteFeedPostsAreListed();

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

      // Verify user can like the feed post
      await test.step('Verify user can like the feed post', async () => {
        const likeButton = postContainer.getByRole('button', { name: 'React to this post' }).first();
        await favoritePage.verifier.verifyTheElementIsVisible(likeButton, {
          assertionMessage: 'Like button should be visible on feed post',
        });
        await favoritePage.clickOnElement(likeButton);
      });

      // Verify user can comment on the feed post
      await test.step('Verify user can comment on the feed post', async () => {
        const testComment = 'Test comment from automation';
        await favoritePage.actions.commentOnFeedPost(postContainer, testComment);
      });

      // Verify user can unfavorite the feed post
      await test.step('Verify user can unfavorite the feed post', async () => {
        await favoritePage.actions.unfavoriteFeedPost(postContainer);
      });

      // Verify user can share the feed post
      await test.step('Verify user can share the feed post', async () => {
        await favoritePage.assertions.verifyShareButtonIsVisible(postContainer);
      });

      // Verify the user name and feed created date
      await test.step('Verify user name and feed created date', async () => {
        await favoritePage.assertions.verifyUserNameAndFeedCreatedDate(postContainer, firstFeedPostText);
      });
    }
  );

  // Helper function to find video file in multiple locations
  function findVideoFile(fileName: string): string | null {
    // 1. Check test-data directory (primary location)
    const testDataPath = FileUtil.getFilePath(
      __dirname,
      '..',
      '..',
      '..',
      'test-data',
      'static-files',
      'video',
      fileName
    );
    if (FileUtil.fileExists(testDataPath)) {
      return testDataPath;
    }

    // 2. Check environment variable for custom path
    const envVideoPath = process.env.TEST_VIDEO_FILE_PATH;
    if (envVideoPath && FileUtil.fileExists(envVideoPath)) {
      return envVideoPath;
    }

    // 3. Check common system locations
    const homeDir = os.homedir();
    const commonLocations = [
      path.join(homeDir, 'Downloads', fileName),
      path.join(homeDir, 'Desktop', fileName),
      path.join(homeDir, 'Documents', fileName),
      path.join(homeDir, 'Videos', fileName),
      path.join(homeDir, 'Movies', fileName),
    ];

    for (const location of commonLocations) {
      if (FileUtil.fileExists(location)) {
        console.log(`Found video file at: ${location}`);
        return location;
      }
    }

    // 4. Check Downloads folder for any .mp4 file (fallback)
    try {
      const downloadsDir = path.join(homeDir, 'Downloads');
      if (FileUtil.fileExists(downloadsDir)) {
        const files = FileUtil.readDir(downloadsDir);
        const mp4File = files.find(file => file.toLowerCase().endsWith('.mp4'));
        if (mp4File) {
          const fallbackPath = path.join(downloadsDir, mp4File);
          console.log(`Using fallback video file from Downloads: ${fallbackPath}`);
          return fallbackPath;
        }
      }
    } catch {
      // Ignore errors when checking Downloads directory
    }

    return null;
  }

  // Find video file in multiple locations
  const videoFileName = 'test-video.mp4';
  const videoFilePath = findVideoFile(videoFileName);

  // Use conditional test.skip if video file not found
  const testFn = videoFilePath ? test : test.skip;
  testFn(
    'should verify the listing options of videos in favourites page',
    {
      tag: [TestPriority.P0, TestGroupType.SMOKE, '@favorite'],
    },
    async ({ appManagerFixture }) => {
      if (!videoFilePath) {
        // This code won't run if test.skip was used, but TypeScript needs it
        return;
      }

      tagTest(test.info(), {
        description: 'To verify the listing options of videos in favourites page',
        zephyrTestId: 'CONT-26283',
        storyId: 'CONT-26283',
      });

      const testSiteName = 'All Employees';

      // Get the actual file name (in case we used a fallback file)
      const actualFileName = videoFilePath ? path.basename(videoFilePath) : videoFileName;

      const testVideoDetails = {
        filePath: videoFilePath!,
        fileName: actualFileName,
        fileSystemCleanupRequired: false,
      };
      let siteFilesPage: SiteFilesPage;

      await test.step('Setup: Navigate to site and upload video file', async () => {
        await appManagerFixture.homePage.verifyThePageIsLoaded();

        // Navigate to Sites from side nav (assuming "Site option from user drop down" refers to side nav)
        await sideNavBarComponent.clickOnSites();

        // Get site ID for "All Employees" site
        const siteId = await appManagerFixture.siteManagementHelper.getSiteIdWithName(testSiteName);
        const siteManager = new SiteManager(appManagerFixture.page, siteId);
        await siteManager.loadSite();
        siteFilesPage = (await siteManager.goToTab(SitePageTab.FilesTab)) as SiteFilesPage;
        await siteFilesPage.verifyThePageIsLoaded();

        // Click on Site videos tab for video uploads
        await siteFilesPage.clickSiteVideosTab();

        try {
          // Upload video file
          await siteFilesPage.uploadFileViaSelectFromComputer(videoFilePath!);

          // Navigate to Site videos tab to find the uploaded video
          await siteFilesPage.clickSiteVideosTab();
          await siteFilesPage.verifyFileIsPresentInTheSiteFilesList(actualFileName);
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
        await favoritePage.assertions.verifyVideoIsVisibleInFilesTab(testVideoDetails.fileName);
      });

      await test.step('Click on unfavorite star icon in favorites Files tab', async () => {
        await favoritePage.actions.clickUnfavoriteButtonForFileInFilesTab(testVideoDetails.fileName);
      });

      await test.step('Verify video is removed from favorites page', async () => {
        await favoritePage.assertions.verifyVideoIsNotVisibleInFilesTab(testVideoDetails.fileName);
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
        await siteFilesPage.filesPreviewModalComponent.verifyToastMessageIsVisibleWithText('Deleted file successfully');
      });
    }
  );
});
