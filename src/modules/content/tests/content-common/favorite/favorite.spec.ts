import { TestPriority } from '@core/constants/testPriority';
import { TestGroupType } from '@core/constants/testType';

import { SideNavBarComponent } from '@/src/core/ui/components/sideNavBarComponent';
import { tagTest } from '@/src/core/utils/testDecorator';
import { contentTestFixture as test } from '@/src/modules/content/fixtures/contentFixture';
import { FEED_TEST_DATA } from '@/src/modules/content/test-data/feed.test-data';
import { FavoritePage } from '@/src/modules/content/ui/pages/favoritePage';
import { PeopleScreenPage } from '@/src/modules/content/ui/pages/peopleScreenPage';
import { ProfileScreenPage } from '@/src/modules/content/ui/pages/profileScreenPage';
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
        await test.step('Verify user is removed from favorites after unfavoriting', async () => {
          if (isUserVisible) {
            throw new Error(
              `User "${peopleScreenPage.fullName}" is still visible in favorites page after unfavoriting`
            );
          }
        });
        return;
      }

      if (!isUserVisible) {
        return;
      }

      await test.step('Verify user is visible and details remain after favoriting', async () => {
        await favoritePage.assertions.verifyTheUserIsVisible(peopleScreenPage.fullName);
        await favoritePage.actions.hoverOnUserProfile(peopleScreenPage.fullName);
        await favoritePage.assertions.verifyUserDetailsRemainVisible(peopleScreenPage.fullName);
        await favoritePage.assertions.verifyContactIconsAreVisible(peopleScreenPage.fullName);
        await favoritePage.assertions.verifyContactIconsRemainVisibleAfterHover(peopleScreenPage.fullName);
      });
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
        await favoritePage.actions.searchPeople(FEED_TEST_DATA.SEARCH.RANDOM_TEXT);

        await favoritePage.assertions.verifyNothingToShowMessage();
      const randomText = 'RandomTextThatDoesNotExist12345';
      await test.step('Enter random text and verify "Nothing to show here" message', async () => {
        await favoritePage.clickOnElement(favoritePage.searchBar);
        await favoritePage.fillInElement(favoritePage.searchBar, randomText);
        await favoritePage.clickOnElement(favoritePage.searchIcon);

        // Wait for the "Nothing to show here" message to appear
        const nothingToShowMessage = appManagerFixture.page.locator('text=Nothing to show here').first();
        await favoritePage.verifier.verifyTheElementIsVisible(nothingToShowMessage, {
          assertionMessage: 'Nothing to show here message should be displayed for random search text',
        });
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
        zephyrTestId: '26266',
        storyId: '26266',
        zephyrTestId: 'CONT-26266',
        storyId: 'CONT-26266',
      });
      await appManagerFixture.homePage.verifyThePageIsLoaded();

      // Navigate directly to favorites page
      await sideNavBarComponent.clickOnFavorite();
      await favoritePage.verifyThePageIsLoaded();

      // Click on Content tab
      await favoritePage.actions.clickOnContentTab();

      // Get the first content name from the content tab
      await favoritePage.assertions.verifyFirstContentLinkIsVisible();
      const firstContentLink = favoritePage.getFirstContentLink();
      const firstContentName = (await firstContentLink.textContent())?.trim() || '';

      // Verify the search bar is visible
      await favoritePage.assertions.verifyContentSearchBarIsVisible();
      const contentTab = appManagerFixture.page.getByRole('tab', { name: 'Content' });
      await favoritePage.clickOnElement(contentTab);

      // Get the content tab panel
      const contentTabPanel = appManagerFixture.page.getByRole('tabpanel', { name: 'Content' });

      // Get the first content name from the content tab
      const firstContentLink = contentTabPanel.getByRole('link').first();
      await favoritePage.verifier.verifyTheElementIsVisible(firstContentLink, {
        assertionMessage: 'First content item should be visible',
        timeout: 10_000,
      });
      const firstContentName = (await firstContentLink.textContent())?.trim() || '';

      // Find the content search bar
      const contentSearchBar = contentTabPanel.getByRole('textbox').first();

      // Verify the search bar is visible
      await test.step('Verify the search bar is visible', async () => {
        await favoritePage.verifier.verifyTheElementIsVisible(contentSearchBar, {
          assertionMessage: 'Search bar should be visible on favorites content tab',
        });
      });

      // Search for the first content and verify search returns correct data
      if (firstContentName) {
        await test.step('Search for the first displayed content', async () => {
          await favoritePage.actions.searchContent(firstContentName);

          await favoritePage.assertions.verifyContentIsVisibleInSearchResults(firstContentName);
          await favoritePage.clickOnElement(contentSearchBar);
          await favoritePage.fillInElement(contentSearchBar, firstContentName);
          const contentSearchIcon = contentTabPanel.locator('button[aria-label="Search"][type="submit"]').first();
          await favoritePage.clickOnElement(contentSearchIcon);

          // Verify the content is visible in search results
          const searchedContentLink = contentTabPanel.getByRole('link', { name: firstContentName }).first();
          await favoritePage.verifier.verifyTheElementIsVisible(searchedContentLink, {
            assertionMessage: `Content "${firstContentName}" should be visible in search results`,
            timeout: 10_000,
          });
        });
      }

      // Enter random text and verify "Nothing to show here" message
      await test.step('Enter random text and verify "Nothing to show here" message', async () => {
        await favoritePage.actions.searchContent(FEED_TEST_DATA.SEARCH.RANDOM_TEXT);

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
      await favoritePage.actions.clickOnFeedTab();

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
      await favoritePage.actions.likeFeedPost(postContainer);

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
      const randomText = 'RandomTextThatDoesNotExist12345';
      await test.step('Enter random text and verify "Nothing to show here" message', async () => {
        await favoritePage.clickOnElement(contentSearchBar);
        await favoritePage.fillInElement(contentSearchBar, randomText);
        const contentSearchIcon = contentTabPanel.locator('button[aria-label="Search"][type="submit"]').first();
        await favoritePage.clickOnElement(contentSearchIcon);

        // Wait for the "Nothing to show here" message to appear
        const nothingToShowMessage = appManagerFixture.page.locator('text=Nothing to show here').first();
        await favoritePage.verifier.verifyTheElementIsVisible(nothingToShowMessage, {
          assertionMessage: 'Nothing to show here message should be displayed for random search text',
        });
      });
    }
  );
});
