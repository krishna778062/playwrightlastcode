import { Locator, Page, test } from '@playwright/test';

import { BasePage } from '@core/ui/pages/basePage';

import { PAGE_ENDPOINTS } from '@/src/core/constants/pageEndpoints';
import { BaseActionUtil } from '@/src/core/utils/baseActionUtil';
export interface IProfileScreenPageActions {
  clickOnManageTopics: () => Promise<void>;
  clickOnFavoriteOption: () => Promise<void>;
}

export interface IProfileScreenPageAssertions {
  verifyingUserNameOnProfileScreenPage: () => Promise<void>;
}

export class ProfileScreenPage extends BasePage implements IProfileScreenPageActions, IProfileScreenPageAssertions {
  private baseActionUtil: BaseActionUtil;
  readonly copyProfileLinkOption: Locator = this.page.getByRole('button', { name: 'Copy profile link' });
  readonly ellipsesButton: Locator = this.page.getByRole('button', { name: 'Show more' });
  readonly favoriteOption: Locator = this.page.getByRole('menuitem', { name: 'Favorite' });
  readonly unfavoriteOption: Locator = this.page.getByRole('menuitem', { name: 'Unfavorite' });

  readonly manageTopicsLink: Locator = this.page
    .getByRole('link', { name: 'Manage Topics' })
    .or(this.page.locator('a', { hasText: 'Manage Topics' }));

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
      await this.verifier.verifyTheElementIsVisible(this.copyProfileLinkOption, {
        assertionMessage: 'Profile screen page should be visible',
      });
    });
  }
  async clickOnFavoriteOption(): Promise<void> {
    await test.step('Clicking on favorite option', async () => {
      // Check if favoriteOption locator is found
      const favoriteCount = await this.favoriteOption.count();

      if (favoriteCount > 0) {
        // If favoriteOption is found, click on it
        await this.clickOnElement(this.favoriteOption);
      } else {
        // If unfavoriteOption is found, click on it, then click ellipsesButton, then click favoriteOption
        const unfavoriteCount = await this.unfavoriteOption.count();
        if (unfavoriteCount > 0) {
          await this.clickOnElement(this.unfavoriteOption);
          await this.clickOnElement(this.ellipsesButton);
          await this.clickOnElement(this.favoriteOption);
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
}
