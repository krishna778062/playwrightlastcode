import { Locator, Page, test } from '@playwright/test';

import { BasePage } from '@core/ui/pages/basePage';

import { PAGE_ENDPOINTS } from '@/src/core/constants/pageEndpoints';
export interface IProfileScreenPageActions {
  clickOnFavoriteOption: () => Promise<void>;
}
export interface IProfileScreenPageAssertions {}
export class ProfileScreenPage extends BasePage implements IProfileScreenPageActions, IProfileScreenPageAssertions {
  readonly copyProfileLinkOption: Locator = this.page.getByRole('button', { name: 'Copy profile link' });
  readonly ellipsesButton: Locator = this.page.getByRole('button', { name: 'Show more' });
  readonly favoriteOption: Locator = this.page.getByRole('menuitem', { name: 'Favorite' });
  readonly unfavoriteOption: Locator = this.page.getByRole('menuitem', { name: 'Unfavorite' });
  constructor(page: Page, peopleId: string) {
    super(page, PAGE_ENDPOINTS.getProfileScreenPage(peopleId));
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
}
