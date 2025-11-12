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
  readonly favoriteTextLocator: Locator = this.page.getByTestId('desktop-layout').getByText('Favorite');

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
      // Use "Show more" button as it's reliably present on profile pages
      await this.verifier.verifyTheElementIsVisible(this.ellipsesButton, {
        assertionMessage: 'Profile screen page should be visible',
        timeout: 10000,
      });
    });
  }
  async clickOnFavoriteOption(): Promise<void> {
    await test.step('Clicking on favorite option', async () => {
      // Step 1: Click on "Show more" button (three dots)
      await this.verifier.verifyTheElementIsVisible(this.ellipsesButton, {
        assertionMessage: 'Show more button should be visible',
        timeout: 10000,
      });
      await this.clickOnElement(this.ellipsesButton);

      // Step 2: Click on "Favorite" using the specific locator
      await this.verifier.verifyTheElementIsVisible(this.favoriteTextLocator, {
        assertionMessage: 'Favorite option should be visible after clicking Show more',
        timeout: 10000,
      });
      await this.clickOnElement(this.favoriteTextLocator);
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
