import { Locator, Page, test } from '@playwright/test';

import { PAGE_ENDPOINTS } from '@core/constants/pageEndpoints';

import { BasePage } from '@/src/core/ui/pages/basePage';

export interface IORGChartPageActions {
  typeInSearchBarInput: (name: string) => Promise<void>;
  clickOnViewProfileButton: () => Promise<void>;
}

export interface IORGChartPageAssertions {}

export class ORGChartPage extends BasePage implements IORGChartPageActions, IORGChartPageAssertions {
  //COMPONENTS

  //LOCATORS
  readonly searchBarInput: Locator;
  readonly viewProfileButton: Locator;

  constructor(page: Page) {
    super(page, PAGE_ENDPOINTS.FEATURED_SITES_PAGE);
    this.searchBarInput = page.getByRole('combobox', { name: 'Search for a person…' });
    this.viewProfileButton = page.locator('.button-focus.Button');
  }

  async verifyThePageIsLoaded(): Promise<void> {
    await this.verifier.verifyTheElementIsVisible(this.searchBarInput, {
      assertionMessage: 'Search bar input should be visible',
    });
  }

  get actions(): IORGChartPageActions {
    return this;
  }

  get assertions(): IORGChartPageAssertions {
    return this;
  }

  searchListOptions(name: string): Locator {
    return this.page.locator('a').filter({ hasText: name });
  }

  async typeInSearchBarInput(name: string): Promise<void> {
    await test.step('Typing in search bar input', async () => {
      await this.fillInElement(this.searchBarInput, name);
      await this.clickOnElement(this.searchListOptions(name));
    });
  }
  async clickOnViewProfileButton(): Promise<void> {
    await test.step('Clicking on view profile button', async () => {
      await this.clickOnElement(this.viewProfileButton);
    });
  }
}
