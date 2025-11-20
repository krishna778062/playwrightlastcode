import { Locator, Page, test } from '@playwright/test';

import { BasePage } from '@core/ui/pages/basePage';

import { PAGE_ENDPOINTS } from '@/src/core/constants/pageEndpoints';
import { ContactIconType } from '@/src/modules/content/constants';
import { ListFeedComponent } from '@/src/modules/content/ui/components/listFeedComponent';
export interface IFavoritePageActions {
  clickOnPeopleTab: () => Promise<void>;
  clickOnContentTab: () => Promise<void>;
  clickOnFeedTab: () => Promise<void>;
  searchingFavoriteUser: (fullName: string) => Promise<void>;
  searchContent: (searchText: string) => Promise<void>;
  hoverOnUserProfile: (fullName: string) => Promise<void>;
  getFirstDisplayedUserName: () => Promise<string>;
  commentOnFeedPost: (postContainer: Locator, commentText: string) => Promise<void>;
  unfavoriteFeedPost: (postContainer: Locator) => Promise<void>;
  likeFeedPost: (postContainer: Locator) => Promise<void>;
  searchPeople: (searchText: string) => Promise<void>;
}

export interface IFavoritePageAssertions {
  verifyTheUserIsVisible: (fullName: string) => Promise<void>;
  verifyUserDetailsRemainVisible: (fullName: string) => Promise<void>;
  verifyContactIconsAreVisible: (fullName: string) => Promise<void>;
  verifyContactIconsRemainVisibleAfterHover: (fullName: string) => Promise<void>;
  verifyNothingToShowMessage: () => Promise<void>;
  verifyPeopleSearchBarIsVisible: () => Promise<void>;
  verifyContentSearchBarIsVisible: () => Promise<void>;
  verifyFirstContentLinkIsVisible: () => Promise<void>;
  verifyContentIsVisibleInSearchResults: (contentName: string) => Promise<void>;
  verifyAllFavoriteFeedPostsAreListed: () => Promise<void>;
  verifyShareButtonIsVisible: (postContainer: Locator) => Promise<void>;
  verifyUserNameAndFeedCreatedDate: (postContainer: Locator, firstFeedPostText?: string) => Promise<void>;
}
export class FavoritePage extends BasePage implements IFavoritePageActions, IFavoritePageAssertions {
  readonly favoriteHeading: Locator = this.page.getByRole('heading', { name: 'Favorites' });
  readonly peopleTab: Locator = this.page.getByRole('tab', { name: 'People' });
  readonly contentTab: Locator = this.page.getByRole('tab', { name: 'Content' });
  readonly feedTab: Locator = this.page.getByRole('tab', { name: 'Feed' });
  readonly searchBar: Locator = this.page.getByRole('textbox', { name: 'Search favorite people…' });
  readonly searchIcon: Locator = this.page.locator('button[aria-label="Search"][type="submit"]');
  readonly nothingToShowMessage: Locator = this.page.locator('text=Nothing to show here').first();

  // Content tab locators
  readonly getContentTabPanel = (): Locator => this.page.getByRole('tabpanel', { name: 'Content' });
  // Feed tab locators
  readonly getFeedTabPanel = (): Locator => this.page.getByRole('tabpanel', { name: 'Feed' });
  readonly getFeedPosts = (): Locator => this.getFeedTabPanel().locator('p').filter({ hasText: /./ });
  readonly getFirstFeedPostContent = (): Locator => this.getFeedTabPanel().locator('div[class*="postContent"]').first();
  readonly getPostContainer = (postContentLocator: Locator): Locator => {
    // Find the parent container that contains both postContent and action buttons
    // Navigate up the DOM tree to find the common parent
    return postContentLocator.locator('..').locator('..').locator('..').locator('..').first();
  };
  readonly getPostTextParagraph = (postContentLocator: Locator): Locator =>
    postContentLocator
      .locator('p')
      .filter({ hasNotText: /Nothing to show here|This post has been deleted|shared a post/i })
      .first();

  // Reusable locators for feed post actions
  readonly getLikeButton = (postContainer: Locator): Locator =>
    postContainer.getByRole('button', { name: 'React to this post' }).first();
  readonly getCommentButton = (postContainer: Locator): Locator =>
    postContainer.getByRole('button', { name: 'Leave a reply…' }).first();
  readonly getCommentTextbox = (postContainer: Locator): Locator =>
    postContainer.getByRole('textbox', { name: /You are in the content editor/i }).first();
  readonly getReplyButton = (postContainer: Locator): Locator =>
    postContainer.getByRole('button', { name: 'Reply', exact: true }).first();
  readonly getUnfavoriteButton = (postContainer: Locator): Locator =>
    postContainer.getByRole('button', { name: 'Unfavorite this post' }).first();
  readonly getShareButton = (postContainer: Locator): Locator =>
    postContainer.getByRole('button', { name: 'Share this post' }).first();

  readonly getContentSearchBar = (): Locator => this.getContentTabPanel().getByRole('textbox').first();
  readonly getContentSearchIcon = (): Locator =>
    this.getContentTabPanel().locator('button[aria-label="Search"][type="submit"]').first();
  readonly getFirstContentLink = (): Locator => this.getContentTabPanel().getByRole('link').first();
  readonly getContentLinkByName = (contentName: string): Locator =>
    this.getContentTabPanel().getByRole('link', { name: contentName }).first();

  // User profile locators
  readonly getUserProfileLink = (fullName: string): Locator => this.page.getByRole('link', { name: fullName });
  readonly getUserProfileCard = (fullName: string): Locator =>
    this.page.locator(`[data-testid*="user-card"], [class*="user-card"]`).filter({ hasText: fullName }).first();
  readonly firstUserCard: Locator = this.page
    .getByRole('tabpanel', { name: 'People' })
    .getByRole('list')
    .getByRole('listitem')
    .first();

  // User details locators
  readonly getDivisionLocator = (fullName: string): Locator =>
    this.getUserProfileCard(fullName)
      .locator('text=/division/i')
      .or(this.getUserProfileCard(fullName).getByText(/division/i));
  readonly getLocationLocator = (fullName: string): Locator =>
    this.getUserProfileCard(fullName)
      .locator('text=/location/i')
      .or(this.getUserProfileCard(fullName).getByText(/location/i));
  readonly getJobTitleLocator = (fullName: string): Locator =>
    this.getUserProfileCard(fullName)
      .locator('text=/job title|title/i')
      .or(this.getUserProfileCard(fullName).getByText(/job title|title/i));
  readonly getDepartmentLocator = (fullName: string): Locator =>
    this.getUserProfileCard(fullName)
      .locator('text=/department/i')
      .or(this.getUserProfileCard(fullName).getByText(/department/i));

  // Contact icons locators
  readonly getContactIcon = (fullName: string, iconType: ContactIconType): Locator => {
    const userCard = this.getUserProfileCard(fullName);
    const iconName = iconType.toLowerCase();

    // Special case for email - includes mailto link selector
    if (iconType === ContactIconType.EMAIL) {
      return userCard
        .locator(
          `[aria-label*="${iconName}" i], [title*="${iconName}" i], svg[class*="${iconName}"], a[href^="mailto:"]`
        )
        .first();
    }

    // Generic case for all other icons
    return userCard
      .locator(`[aria-label*="${iconName}" i], [title*="${iconName}" i], svg[class*="${iconName}"]`)
      .first();
  };

  constructor(page: Page) {
    super(page, PAGE_ENDPOINTS.FAVORITE_PAGE);
  }
  get actions(): IFavoritePageActions {
    return this;
  }
  get assertions(): IFavoritePageAssertions {
    return this;
  }
  async verifyThePageIsLoaded(): Promise<void> {
    await test.step('Verify profile screen page is visible', async () => {
      await this.verifier.verifyTheElementIsVisible(this.favoriteHeading, {
        assertionMessage: 'Profile screen page should be visible',
      });
    });
  }
  async clickOnPeopleTab(): Promise<void> {
    await test.step('Clicking on people tab', async () => {
      await this.clickOnElement(this.peopleTab);
    });
  }

  async clickOnContentTab(): Promise<void> {
    await test.step('Clicking on content tab', async () => {
      await this.clickOnElement(this.contentTab);
    });
  }

  async clickOnFeedTab(): Promise<void> {
    await test.step('Clicking on feed tab', async () => {
      await this.clickOnElement(this.feedTab);
    });
  }

  async searchPeople(searchText: string): Promise<void> {
    await test.step(`Searching people with text: ${searchText}`, async () => {
      await this.clickOnElement(this.searchBar);
      await this.fillInElement(this.searchBar, searchText);
      await this.clickOnElement(this.searchIcon);
    });
  }

  async searchContent(searchText: string): Promise<void> {
    await test.step(`Searching content with text: ${searchText}`, async () => {
      const contentSearchBar = this.getContentSearchBar();
      await this.clickOnElement(contentSearchBar);
      await this.fillInElement(contentSearchBar, searchText);
      await this.clickOnElement(this.getContentSearchIcon());
    });
  }

  async commentOnFeedPost(postContainer: Locator, commentText: string): Promise<void> {
    await test.step(`Comment on feed post with text: ${commentText}`, async () => {
      const commentButton = this.getCommentButton(postContainer);
      await this.verifier.verifyTheElementIsVisible(commentButton, {
        assertionMessage: 'Comment button should be visible on feed post',
      });
      await this.clickOnElement(commentButton);

      const commentTextbox = this.getCommentTextbox(postContainer);
      await this.verifier.verifyTheElementIsVisible(commentTextbox, {
        assertionMessage: 'Comment textbox should be visible after clicking comment button',
      });

      await this.fillInElement(commentTextbox, commentText);

      const replyButton = this.getReplyButton(postContainer);
      await this.verifier.verifyTheElementIsVisible(replyButton, {
        assertionMessage: 'Reply button should be visible after typing comment',
      });
      await this.clickOnElement(replyButton);
    });
  }

  async unfavoriteFeedPost(postContainer: Locator): Promise<void> {
    await test.step('Unfavorite the feed post', async () => {
      const unfavoriteButton = this.getUnfavoriteButton(postContainer);
      await this.verifier.verifyTheElementIsVisible(unfavoriteButton, {
        assertionMessage: 'Unfavorite button should be visible on feed post',
      });
      await this.clickOnElement(unfavoriteButton);
    });
  }

  async likeFeedPost(postContainer: Locator): Promise<void> {
    await test.step('Like the feed post', async () => {
      const likeButton = this.getLikeButton(postContainer);
      await this.verifier.verifyTheElementIsVisible(likeButton, {
        assertionMessage: 'Like button should be visible on feed post',
      });
      await this.clickOnElement(likeButton);
    });
  }

  async searchingFavoriteUser(fullName: string): Promise<void> {
    await test.step('Searching favorite user', async () => {
      await this.clickOnElement(this.searchBar);
      await this.fillInElement(this.searchBar, fullName);
      await this.clickOnElement(this.searchIcon);
    });
  }
  async verifyTheUserIsVisible(fullName: string): Promise<void> {
    await test.step('Verifying the user is visible', async () => {
      await this.verifier.verifyTheElementIsVisible(this.getUserProfileLink(fullName), {
        assertionMessage: 'User should be visible',
      });
    });
  }

  async getFirstDisplayedUserName(): Promise<string> {
    return await test.step('Getting first displayed user name from favorites people tab', async () => {
      // Wait for at least one user listitem to be visible
      await this.verifier.verifyTheElementIsVisible(this.firstUserCard, {
        assertionMessage: 'At least one user should be visible on favorites people tab',
        timeout: 10000,
      });

      // Get the user name from the link inside the first listitem
      const userLink = this.firstUserCard.getByRole('link').first();
      const linkCount = await userLink.count();

      if (linkCount > 0) {
        // Get the text content of the link
        const userName = await userLink.textContent();
        if (userName && userName.trim() !== '') {
          return userName.trim();
        }

        // Fallback: try innerText if textContent doesn't work
        const innerText = await userLink.innerText();
        if (innerText && innerText.trim() !== '') {
          return innerText.trim();
        }
      }

      throw new Error('First user name is empty or not found on favorites people tab');
    });
  }

  async hoverOnUserProfile(fullName: string): Promise<void> {
    await test.step(`Hovering on user profile: ${fullName}`, async () => {
      const userProfileLink = this.getUserProfileLink(fullName);
      await this.verifier.verifyTheElementIsVisible(userProfileLink, {
        assertionMessage: `User profile link for ${fullName} should be visible before hover`,
      });
      await userProfileLink.hover();
    });
  }

  async verifyUserDetailsRemainVisible(fullName: string): Promise<void> {
    await test.step(`Verifying user details remain visible for: ${fullName}`, async () => {
      // Verify details are visible before hover
      const divisionBefore = this.getDivisionLocator(fullName);
      const locationBefore = this.getLocationLocator(fullName);
      const jobTitleBefore = this.getJobTitleLocator(fullName);
      const departmentBefore = this.getDepartmentLocator(fullName);

      // Check if elements exist and are visible (some may not be present for all users)
      const divisionCount = await divisionBefore.count();
      const locationCount = await locationBefore.count();
      const jobTitleCount = await jobTitleBefore.count();
      const departmentCount = await departmentBefore.count();

      // Store visibility state before hover
      const divisionVisibleBefore = divisionCount > 0 ? await divisionBefore.isVisible().catch(() => false) : false;
      const locationVisibleBefore = locationCount > 0 ? await locationBefore.isVisible().catch(() => false) : false;
      const jobTitleVisibleBefore = jobTitleCount > 0 ? await jobTitleBefore.isVisible().catch(() => false) : false;
      const departmentVisibleBefore =
        departmentCount > 0 ? await departmentBefore.isVisible().catch(() => false) : false;

      // Hover on the user profile
      await this.hoverOnUserProfile(fullName);

      // Verify details remain visible after hover
      if (divisionVisibleBefore) {
        await this.verifier.verifyTheElementIsVisible(divisionBefore, {
          assertionMessage: `Division should remain visible after hover for ${fullName}`,
        });
      }

      if (locationVisibleBefore) {
        await this.verifier.verifyTheElementIsVisible(locationBefore, {
          assertionMessage: `Location should remain visible after hover for ${fullName}`,
        });
      }

      if (jobTitleVisibleBefore) {
        await this.verifier.verifyTheElementIsVisible(jobTitleBefore, {
          assertionMessage: `Job title should remain visible after hover for ${fullName}`,
        });
      }

      if (departmentVisibleBefore) {
        await this.verifier.verifyTheElementIsVisible(departmentBefore, {
          assertionMessage: `Department should remain visible after hover for ${fullName}`,
        });
      }
    });
  }

  async verifyContactIconsAreVisible(fullName: string): Promise<void> {
    await test.step(`Verifying contact icons are visible for: ${fullName}`, async () => {
      const contactIcons = [
        { name: 'Phone', iconType: ContactIconType.PHONE },
        { name: 'Mobile', iconType: ContactIconType.MOBILE },
        { name: 'Email', iconType: ContactIconType.EMAIL },
        { name: 'Zoom', iconType: ContactIconType.ZOOM },
        { name: 'Slack', iconType: ContactIconType.SLACK },
        { name: 'Skype', iconType: ContactIconType.SKYPE },
        { name: 'MS Teams', iconType: ContactIconType.MS_TEAMS },
      ];

      for (const icon of contactIcons) {
        const locator = this.getContactIcon(fullName, icon.iconType);
        const count = await locator.count();
        if (count > 0) {
          const isVisible = await locator.isVisible().catch(() => false);
          if (isVisible) {
            await this.verifier.verifyTheElementIsVisible(locator, {
              assertionMessage: `${icon.name} icon should be visible for ${fullName}`,
            });
          }
        }
      }
    });
  }

  async verifyContactIconsRemainVisibleAfterHover(fullName: string): Promise<void> {
    await test.step(`Verifying contact icons remain visible after hover for: ${fullName}`, async () => {
      const contactIcons = [
        { name: 'Phone', iconType: ContactIconType.PHONE },
        { name: 'Mobile', iconType: ContactIconType.MOBILE },
        { name: 'Email', iconType: ContactIconType.EMAIL },
        { name: 'Zoom', iconType: ContactIconType.ZOOM },
        { name: 'Slack', iconType: ContactIconType.SLACK },
        { name: 'Skype', iconType: ContactIconType.SKYPE },
        { name: 'MS Teams', iconType: ContactIconType.MS_TEAMS },
      ];

      // Check which icons are visible before hover
      const visibleIconsBefore: Array<{ name: string; locator: Locator }> = [];
      for (const icon of contactIcons) {
        const locator = this.getContactIcon(fullName, icon.iconType);
        const count = await locator.count();
        if (count > 0) {
          const isVisible = await locator.isVisible().catch(() => false);
          if (isVisible) {
            visibleIconsBefore.push({ name: icon.name, locator });
          }
        }
      }

      // Hover on the user profile
      await this.hoverOnUserProfile(fullName);

      // Verify all previously visible icons remain visible after hover
      for (const icon of visibleIconsBefore) {
        await this.verifier.verifyTheElementIsVisible(icon.locator, {
          assertionMessage: `${icon.name} icon should remain visible after hover for ${fullName}`,
        });
      }
    });
  }

  async verifyNothingToShowMessage(): Promise<void> {
    await test.step('Verifying "Nothing to show here" message is displayed', async () => {
      await this.verifier.verifyTheElementIsVisible(this.nothingToShowMessage, {
        assertionMessage: 'Nothing to show here message should be displayed for random search text',
      });
    });
  }

  async verifyPeopleSearchBarIsVisible(): Promise<void> {
    await test.step('Verify the search bar is visible', async () => {
      await this.verifier.verifyTheElementIsVisible(this.searchBar, {
        assertionMessage: 'Search bar should be visible on favorites people tab',
      });
    });
  }

  async verifyContentSearchBarIsVisible(): Promise<void> {
    await test.step('Verify the search bar is visible', async () => {
      await this.verifier.verifyTheElementIsVisible(this.getContentSearchBar(), {
        assertionMessage: 'Search bar should be visible on favorites content tab',
      });
    });
  }

  async verifyFirstContentLinkIsVisible(): Promise<void> {
    await test.step('Verify first content item is visible', async () => {
      await this.verifier.verifyTheElementIsVisible(this.getFirstContentLink(), {
        assertionMessage: 'First content item should be visible',
        timeout: 10_000,
      });
    });
  }

  async verifyContentIsVisibleInSearchResults(contentName: string): Promise<void> {
    await test.step(`Verify content "${contentName}" is visible in search results`, async () => {
      await this.verifier.verifyTheElementIsVisible(this.getContentLinkByName(contentName), {
        assertionMessage: `Content "${contentName}" should be visible in search results`,
        timeout: 10_000,
      });
    });
  }

  async verifyAllFavoriteFeedPostsAreListed(): Promise<void> {
    await test.step('Verify all favorite feed posts are listed', async () => {
      const feedPosts = this.getFeedPosts();
      const postCount = await feedPosts.count();

      if (postCount === 0) {
        throw new Error('No favorite feed posts found. Expected at least one post to be visible.');
      }

      for (let i = 0; i < postCount; i++) {
        await this.verifier.verifyTheElementIsVisible(feedPosts.nth(i), {
          assertionMessage: `Favorite feed post at index ${i} should be visible. Total posts found: ${postCount}`,
        });
      }
    });
  }

  async verifyShareButtonIsVisible(postContainer: Locator): Promise<void> {
    await test.step('Verify share button is visible on feed post', async () => {
      const shareButton = this.getShareButton(postContainer);
      await this.verifier.verifyTheElementIsVisible(shareButton, {
        assertionMessage: 'Share button should be visible on feed post',
      });
    });
  }

  async verifyUserNameAndFeedCreatedDate(postContainer: Locator, firstFeedPostText?: string): Promise<void> {
    await test.step('Verify user name and feed created date', async () => {
      const userNameLink = postContainer.getByRole('link').first();
      await this.verifier.verifyTheElementIsVisible(userNameLink, {
        assertionMessage: 'User name (author) should be visible on feed post',
      });

      const timestampLink = postContainer
        .getByRole('link')
        .filter({ hasText: /\w+ \d{1,2}, \d{4}/ })
        .first();
      const timestampVisible = await timestampLink.isVisible().catch(() => false);
      if (timestampVisible) {
        await this.verifier.verifyTheElementIsVisible(timestampLink, {
          assertionMessage: 'Feed created date (timestamp) should be visible on feed post',
        });
      } else if (firstFeedPostText) {
        const listFeedComponent = new ListFeedComponent(this.page);
        const timestampLocator = listFeedComponent.getPostTimestampLocator(firstFeedPostText);
        await this.verifier.verifyTheElementIsVisible(timestampLocator, {
          assertionMessage: 'Feed created date (timestamp) should be visible on feed post',
        });
      }
    });
  }
}
