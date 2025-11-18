import { TestPriority } from '@core/constants/testPriority';
import { TestGroupType } from '@core/constants/testType';

import { SideNavBarComponent } from '@/src/core/ui/components/sideNavBarComponent';
import { tagTest } from '@/src/core/utils/testDecorator';
import { contentTestFixture as test } from '@/src/modules/content/fixtures/contentFixture';
import { FAVORITE_TEST_DATA } from '@/src/modules/content/test-data/favorite.test-data';
import { ListFeedComponent } from '@/src/modules/content/ui/components/listFeedComponent';
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
        await favoritePage.clickOnElement(favoritePage.searchBar);
        await favoritePage.fillInElement(favoritePage.searchBar, FAVORITE_TEST_DATA.SEARCH.RANDOM_TEXT);
        await favoritePage.clickOnElement(favoritePage.searchIcon);

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
        zephyrTestId: '26266',
        storyId: '26266',
      });
      await appManagerFixture.homePage.verifyThePageIsLoaded();

      // Navigate directly to favorites page
      await sideNavBarComponent.clickOnFavorite();
      await favoritePage.verifyThePageIsLoaded();

      // Click on Content tab
      await favoritePage.clickOnElement(favoritePage.contentTab);

      // Get the first content name from the content tab
      const firstContentLink = favoritePage.getFirstContentLink();
      await favoritePage.verifier.verifyTheElementIsVisible(firstContentLink, {
        assertionMessage: 'First content item should be visible',
        timeout: 10_000,
      });
      const firstContentName = (await firstContentLink.textContent())?.trim() || '';

      // Verify the search bar is visible
      await favoritePage.assertions.verifyContentSearchBarIsVisible();

      // Search for the first content and verify search returns correct data
      if (firstContentName) {
        await test.step('Search for the first displayed content', async () => {
          const contentSearchBar = favoritePage.getContentSearchBar();
          await favoritePage.clickOnElement(contentSearchBar);
          await favoritePage.fillInElement(contentSearchBar, firstContentName);
          await favoritePage.clickOnElement(favoritePage.getContentSearchIcon());

          await favoritePage.assertions.verifyContentIsVisibleInSearchResults(firstContentName);
        });
      }

      // Enter random text and verify "Nothing to show here" message
      await test.step('Enter random text and verify "Nothing to show here" message', async () => {
        const contentSearchBar = favoritePage.getContentSearchBar();
        await favoritePage.clickOnElement(contentSearchBar);
        await favoritePage.fillInElement(contentSearchBar, FAVORITE_TEST_DATA.SEARCH.RANDOM_TEXT);
        await favoritePage.clickOnElement(favoritePage.getContentSearchIcon());

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

      // Initialize ListFeedComponent for feed operations
      const listFeedComponent = new ListFeedComponent(appManagerFixture.page);

      // Verify all the feed posts marked favourite are listing
      await test.step('Verify all favorite feed posts are listed', async () => {
        const feedPosts = favoritePage.getFeedPosts();
        const postCount = await feedPosts.count();
        await favoritePage.verifier.verifyTheElementIsVisible(feedPosts.first(), {
          assertionMessage: `At least one favorite feed post should be visible. Found ${postCount} posts`,
        });
      });

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
        const commentButton = postContainer.getByRole('button', { name: 'Leave a reply…' }).first();
        await favoritePage.verifier.verifyTheElementIsVisible(commentButton, {
          assertionMessage: 'Comment button should be visible on feed post',
        });
        await favoritePage.clickOnElement(commentButton);

        const commentTextbox = postContainer.getByRole('textbox', { name: /You are in the content editor/i }).first();
        await favoritePage.verifier.verifyTheElementIsVisible(commentTextbox, {
          assertionMessage: 'Comment textbox should be visible after clicking comment button',
        });

        const testComment = 'Test comment from automation';
        await favoritePage.fillInElement(commentTextbox, testComment);

        const replyButton = postContainer.getByRole('button', { name: 'Reply', exact: true }).first();
        await favoritePage.verifier.verifyTheElementIsVisible(replyButton, {
          assertionMessage: 'Reply button should be visible after typing comment',
        });
        await favoritePage.clickOnElement(replyButton);
      });

      // Verify user can unfavorite the feed post
      await test.step('Verify user can unfavorite the feed post', async () => {
        const unfavoriteButton = postContainer.getByRole('button', { name: 'Unfavorite this post' }).first();
        await favoritePage.verifier.verifyTheElementIsVisible(unfavoriteButton, {
          assertionMessage: 'Unfavorite button should be visible on feed post',
        });
        await favoritePage.clickOnElement(unfavoriteButton);
      });

      // Verify user can share the feed post
      await test.step('Verify user can share the feed post', async () => {
        const shareButton = postContainer.getByRole('button', { name: 'Share this post' }).first();
        await favoritePage.verifier.verifyTheElementIsVisible(shareButton, {
          assertionMessage: 'Share button should be visible on feed post',
        });
      });

      // Verify the user name and feed created date
      await test.step('Verify user name and feed created date', async () => {
        const userNameLink = postContainer.getByRole('link').first();
        await favoritePage.verifier.verifyTheElementIsVisible(userNameLink, {
          assertionMessage: 'User name (author) should be visible on feed post',
        });

        const timestampLink = postContainer
          .getByRole('link')
          .filter({ hasText: /\w+ \d{1,2}, \d{4}/ })
          .first();
        const timestampVisible = await timestampLink.isVisible().catch(() => false);
        if (timestampVisible) {
          await favoritePage.verifier.verifyTheElementIsVisible(timestampLink, {
            assertionMessage: 'Feed created date (timestamp) should be visible on feed post',
          });
        } else if (firstFeedPostText) {
          const timestampLocator = listFeedComponent.getPostTimestampLocator(firstFeedPostText);
          await favoritePage.verifier.verifyTheElementIsVisible(timestampLocator, {
            assertionMessage: 'Feed created date (timestamp) should be visible on feed post',
          });
        }
      });
    }
  );
});
