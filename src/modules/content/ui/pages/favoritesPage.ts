import { Locator, Page, test } from '@playwright/test';

import { PAGE_ENDPOINTS } from '@core/constants/pageEndpoints';

import { BasePage } from '@/src/core/ui/pages/basePage';

export interface IFavoritesPageActions {
  clickOnPeopleButton: () => Promise<void>;
}

export interface IFavoritesPageAssertions {
  verifyPeopleNamesAreDisplayed: (peopleNames: string[]) => Promise<void>;
}

export class FavoritesPage extends BasePage implements IFavoritesPageActions, IFavoritesPageAssertions {
  //COMPONENTS

  //LOCATORS
  readonly peopleButton: Locator;
  constructor(page: Page) {
    super(page, PAGE_ENDPOINTS.FEATURED_SITES_PAGE);
    this.peopleButton = page.getByRole('tab', { name: 'People' });
  }

  async verifyThePageIsLoaded(): Promise<void> {
    await test.step('Verify Favorites page is loaded', async () => {
      // TODO: Implement page load verification
    });
  }

  get actions(): IFavoritesPageActions {
    return this;
  }

  get assertions(): IFavoritesPageAssertions {
    return this;
  }
  async clickOnPeopleButton(): Promise<void> {
    await test.step('Clicking on people button', async () => {
      await this.clickOnElement(this.peopleButton);
    });
  }
  getPeopleNamesLocators(peopleNames: string[]): Locator[] {
    return peopleNames.map(name => this.page.getByText(name, { exact: false }));
  }

  async verifyPeopleNamesAreDisplayed(peopleNames: string[]): Promise<void> {
    await test.step('Verify people names are displayed', async () => {
      for (let index = 0; index < peopleNames.length; index++) {
        const name = peopleNames[index];
        await this.verifier.verifyTheElementIsVisible(this.getPeopleNamesLocators(peopleNames)[index], {
          assertionMessage: `People name ${name} should be displayed`,
        });
      }
    });
  }
}
