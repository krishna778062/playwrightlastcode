import { Locator, Page, test } from '@playwright/test';

import { BasePage } from '@core/ui/pages/basePage';

import { PAGE_ENDPOINTS } from '@/src/core/constants/pageEndpoints';
export interface IFavoritePageActions {
  clickOnPeopleTab: () => Promise<void>;
  searchingFavoriteUser: (fullName: string) => Promise<void>;
}
export interface IFavoritePageAssertions {
  verifyTheUserIsVisible: (fullName: string) => Promise<void>;
}
export class FavoritePage extends BasePage implements IFavoritePageActions, IFavoritePageAssertions {
  readonly favoriteHeading: Locator = this.page.getByRole('heading', { name: 'Favorites' });
  readonly peopleTab: Locator = this.page.getByRole('tab', { name: 'People' });
  readonly searchBar: Locator = this.page.getByRole('textbox', { name: 'Search favorite people…' });
  readonly searchIcon: Locator = this.page.locator('button[aria-label="Search"][type="submit"]');
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
  async searchingFavoriteUser(fullName: string): Promise<void> {
    await test.step('Searching favorite user', async () => {
      await this.clickOnElement(this.searchBar);
      await this.fillInElement(this.searchBar, fullName);
      await this.clickOnElement(this.searchIcon);
    });
  }
  async verifyTheUserIsVisible(fullName: string): Promise<void> {
    await test.step('Verifying the user is visible', async () => {
      await this.verifier.verifyTheElementIsVisible(this.page.getByRole('link', { name: fullName }), {
        assertionMessage: 'User should be visible',
      });
    });
  }
}
