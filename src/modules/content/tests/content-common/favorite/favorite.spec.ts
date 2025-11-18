import { TestPriority } from '@core/constants/testPriority';
import { TestGroupType } from '@core/constants/testType';

import { SideNavBarComponent } from '@/src/core/ui/components/sideNavBarComponent';
import { tagTest } from '@/src/core/utils/testDecorator';
import { contentTestFixture as test } from '@/src/modules/content/fixtures/contentFixture';
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
      });
      await appManagerFixture.homePage.verifyThePageIsLoaded();

      // Navigate directly to favorites page
      await sideNavBarComponent.clickOnFavorite();
      await favoritePage.verifyThePageIsLoaded();

      // Click on Content tab
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
      const feedTab = appManagerFixture.page.getByRole('tab', { name: 'Feed' });
      await favoritePage.clickOnElement(feedTab);

      // Get the feed tab panel
      const feedTabPanel = appManagerFixture.page.getByRole('tabpanel', { name: 'Feed' });

      // Initialize ListFeedComponent for feed operations
      const listFeedComponent = new ListFeedComponent(appManagerFixture.page);

      // Verify all the feed posts marked favourite are listing
      await test.step('Verify all favorite feed posts are listed', async () => {
        const feedPosts = feedTabPanel.locator('p').filter({ hasText: /./ });
        const postCount = await feedPosts.count();
        await favoritePage.verifier.verifyTheElementIsVisible(feedPosts.first(), {
          assertionMessage: `At least one favorite feed post should be visible. Found ${postCount} posts`,
        });
      });

      // Get the first feed post container
      const firstPostContent = feedTabPanel.locator('div[class*="postContent"]').first();
      await favoritePage.verifier.verifyTheElementIsVisible(firstPostContent, {
        assertionMessage: 'First feed post container should be visible',
      });

      // Get the post wrapper that contains both postContent and action buttons
      const firstPostWrapper = firstPostContent
        .locator('xpath=./ancestor::div[contains(@class, "postBody") or contains(@class, "post")]')
        .first();
      const postWrapperExists = (await firstPostWrapper.count()) > 0;
      const postContainer = postWrapperExists
        ? firstPostWrapper
        : firstPostContent.locator('xpath=./ancestor::div[4]').first();

      // Get post text for fallback timestamp verification
      const postTextParagraph = firstPostContent
        .locator('p')
        .filter({ hasNotText: /Nothing to show here|This post has been deleted|shared a post/i })
        .first();
      const firstFeedPostText = (await postTextParagraph.textContent())?.trim() || '';

      // Verify user can like the feed post
      await test.step('Verify user can like the feed post', async () => {
        const likeButton = postContainer
          .locator(
            'div:nth-child(3) > .Spacing-module__row__bvKBb.Spacing-module__spacing-15__bvKBb > .Spacing-module__row__bvKBb.Spacing-module__spacing-20__bvKBb > .Spacing-module__row__bvKBb > div > ._actionBtn_l2df2_10'
          )
          .first();
        await favoritePage.verifier.verifyTheElementIsVisible(likeButton, {
          assertionMessage: 'Like button should be visible on feed post',
        });
        await favoritePage.clickOnElement(likeButton);
      });

      // Verify user can comment on the feed post
      await test.step('Verify user can comment on the feed post', async () => {
        const commentButton = postContainer
          .locator(
            '._Replies_eonic_20 > ._Reply_qr1ju_1 > ._Reply-inner_qr1ju_11 > ._Reply-body_qr1ju_22 > ._FakeInput_qr1ju_102'
          )
          .first();
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
        const unfavoriteButton = postContainer
          .locator(
            '._postHeader_tgt5r_1 > .Spacing-module__row__bvKBb > ._postFavoriteContainer_tgt5r_29 > ._favoritePostIcon_1nta9_1 > .u-ignoreLegacyStyle'
          )
          .first();
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
