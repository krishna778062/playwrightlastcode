import { Locator, Page, test } from '@playwright/test';

import { BasePage } from '@core/ui/pages/basePage';

import { PAGE_ENDPOINTS } from '@/src/core/constants/pageEndpoints';
import { BaseActionUtil } from '@/src/core/utils/baseActionUtil';
export interface IProfileScreenPageActions {
  clickOnManageTopics: () => Promise<void>;
  clickOnFavoriteOption: () => Promise<boolean>; // Returns true if user was already favorited, false otherwise
  clickUnfollowButton: () => Promise<boolean>; // Returns true if user was being followed, false otherwise
}

export interface IProfileScreenPageAssertions {
  verifyingUserNameOnProfileScreenPage: () => Promise<void>;
}

export class ProfileScreenPage extends BasePage implements IProfileScreenPageActions, IProfileScreenPageAssertions {
  private baseActionUtil: BaseActionUtil;
  readonly copyProfileLinkOption: Locator = this.page.getByRole('button', { name: 'Copy profile link' });
  readonly ellipsesButton: Locator = this.page.getByRole('button', { name: 'Show more' });
  readonly favoriteOption: Locator = this.page.getByRole('menuitem', { name: 'Favorite' }).nth(1);
  readonly unfavoriteOption: Locator = this.page.getByRole('menuitem', { name: 'Unfavorite' }).nth(1);
  readonly favoriteTextLocator: Locator = this.page.getByTestId('desktop-layout').getByText('Favorite');

  readonly manageTopicsLink: Locator = this.page
    .getByRole('link', { name: 'Manage Topics' })
    .or(this.page.locator('a', { hasText: 'Manage Topics' }));
  readonly followButton: Locator = this.page.getByRole('button', { name: 'Follow', exact: true });
  readonly followingButton: Locator = this.page.getByRole('button', { name: 'Following', exact: true });

  constructor(page: Page, peopleId: string) {
    super(page, PAGE_ENDPOINTS.getProfileScreenPage(peopleId));
    this.baseActionUtil = new BaseActionUtil(page);
  }

  get actions(): IProfileScreenPageActions {
    return this;
  }

  get assertions(): IProfileScreenPageAssertions {
    return this;
  }

  async verifyThePageIsLoaded(): Promise<void> {
    await test.step('Verify profile screen page is visible', async () => {
      // Use "Show more" button as it's reliably present on profile pages
      await this.verifier.verifyTheElementIsVisible(this.ellipsesButton, {
        assertionMessage: 'Profile screen page should be visible',
      });
    });
  }
  async clickOnFavoriteOption(): Promise<boolean> {
    return await test.step('Clicking on favorite option', async () => {
      // Step 1: Click on "Show more" button (three dots) to open the menu
      await this.verifier.verifyTheElementIsVisible(this.ellipsesButton, {
        assertionMessage: 'Show more button should be visible',
      });
      await this.clickOnElement(this.ellipsesButton);

      // Step 2: Check if favoriteOption is visible (menu is open and Favorite option is available)
      const favoriteCount = await this.favoriteOption.count();

      if (favoriteCount > 0) {
        // If favoriteOption is found, click on it directly (user is NOT favorited)
        await this.clickOnElement(this.favoriteOption);
        // Wait for menu to close (indicates action completed)
        await this.favoriteOption.waitFor({ state: 'hidden' }).catch(() => {});
        return false; // User was not favorited, we just favorited them
      } else {
        // Check if unfavoriteOption is visible (user is already favorited)
        const unfavoriteCount = await this.unfavoriteOption.count();

        if (unfavoriteCount > 0) {
          // User is already favorited - unfavorite them
          await this.clickOnElement(this.unfavoriteOption);
          // Wait for menu to close (indicates action completed)
          await this.unfavoriteOption.waitFor({ state: 'hidden' }).catch(() => {});
          return true; // User was already favorited, we just unfavorited them
        } else {
          throw new Error('Neither favoriteOption nor unfavoriteOption locator found');
        }
      }
    });
  }

  async verifyingUserNameOnProfileScreenPage(): Promise<void> {
    await test.step('Verifying user name on profile screen page', async () => {
      const loggedInUserName = await this.baseActionUtil.getCurrentLoggedInUserName();
      await this.verifier.verifyTheElementIsVisible(this.page.getByRole('heading', { name: loggedInUserName }), {
        assertionMessage: `User name "${loggedInUserName}" should be visible on profile screen page`,
      });
    });
  }

  async clickOnManageTopics(): Promise<void> {
    await test.step('Clicking on Manage Topics from profile page', async () => {
      await this.clickOnElement(this.manageTopicsLink);
    });
  }

  async clickUnfollowButton(): Promise<boolean> {
    return await test.step('Clicking on unfollow button', async () => {
      // Check if Following button is visible (user is being followed)
      const isFollowing = await this.verifier.isTheElementVisible(this.followingButton);

      if (isFollowing) {
        // User is being followed - click Following button to unfollow
        await this.clickOnElement(this.followingButton);
        // Wait a bit for the state to change
        await this.page.waitForTimeout(1000);
        return true; // User was being followed, we just unfollowed them
      } else {
        // Check if Follow button is visible (user is not being followed)
        const isFollowVisible = await this.verifier.isTheElementVisible(this.followButton);
        if (isFollowVisible) {
          return false; // User was not being followed
        } else {
          throw new Error('Neither Following nor Follow button found on profile page');
        }
      }
    });
  }
}
