import { Locator, Page, test } from '@playwright/test';

import { PAGE_ENDPOINTS } from '@core/constants/pageEndpoints';

import { BasePage } from '@/src/core/ui/pages/basePage';

export interface IFavoritesPageActions {
  clickOnPeopleButton: () => Promise<void>;
  clickOnContentButton: () => Promise<void>;
}

export interface IFavoritesPageAssertions {
  verifyPeopleNamesAreDisplayed: (peopleNames: string[]) => Promise<void>;
  verifyContentNamesAreDisplayed: (contentNames: string[]) => Promise<void>;
}

export class FavoritesPage extends BasePage implements IFavoritesPageActions, IFavoritesPageAssertions {
  //COMPONENTS

  //LOCATORS
  readonly peopleButton: Locator;
  readonly contentButton: Locator;
  readonly getPeopleNamesLocators: (name: string) => Locator;
  readonly getContentNamesLocators: (name: string) => Locator;

  constructor(page: Page) {
    super(page, PAGE_ENDPOINTS.FEATURED_SITES_PAGE);
    this.peopleButton = page.getByRole('tab', { name: 'People' });
    this.contentButton = page.getByRole('tab', { name: 'Content' });
    this.getPeopleNamesLocators = (name: string) => page.getByText(name, { exact: false });
    this.getContentNamesLocators = (name: string) => page.getByRole('link', { name: name, exact: true });
  }

  get actions(): IFavoritesPageActions {
    return this;
  }

  get assertions(): IFavoritesPageAssertions {
    return this;
  }

  async verifyThePageIsLoaded(): Promise<void> {
    await this.verifier.verifyTheElementIsVisible(this.peopleButton, {
      assertionMessage: 'People button should be visible',
    });
  }

  async clickOnPeopleButton(): Promise<void> {
    await test.step('Clicking on people button', async () => {
      await this.clickOnElement(this.peopleButton);
    });
  }

  async clickOnContentButton(): Promise<void> {
    await test.step('Clicking on content button', async () => {
      await this.clickOnElement(this.contentButton);
    });
  }
  getPeopleNamesLocators(peopleNames: string[]): Locator[] {
    return peopleNames.map(name => this.page.getByText(name, { exact: false }));
  }
  getContentNamesLocators(contentNames: string[]): Locator[] {
    return contentNames.map(name => this.page.getByRole('link', { name: name, exact: true }));
  }

  async verifyContentNamesAreDisplayed(contentNames: string[]): Promise<void> {
    await test.step('Verify content names are displayed', async () => {
      for (let index = 0; index < contentNames.length; index++) {
        const name = contentNames[index];
        await this.verifier.verifyTheElementIsVisible(this.getContentNamesLocators(contentNames)[index], {
        await this.verifier.verifyTheElementIsVisible(this.getContentNamesLocators(name), {
          assertionMessage: `Content name ${name} should be displayed`,
        });
      }
    });
  }

  async verifyPeopleNamesAreDisplayed(peopleNames: string[]): Promise<void> {
    await test.step('Verify people names are displayed', async () => {
      for (let index = 0; index < peopleNames.length; index++) {
        const name = peopleNames[index];
        await this.verifier.verifyTheElementIsVisible(this.getPeopleNamesLocators(peopleNames)[index], {
        await this.verifier.verifyTheElementIsVisible(this.getPeopleNamesLocators(name), {
          assertionMessage: `People name ${name} should be displayed`,
        });
      }
    });
  }
}
