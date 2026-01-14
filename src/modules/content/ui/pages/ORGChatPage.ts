import { Locator, Page, test } from '@playwright/test';

import { PAGE_ENDPOINTS } from '@core/constants/pageEndpoints';

import { BasePage } from '@/src/core/ui/pages/basePage';

export class ORGChartPage extends BasePage {
  //COMPONENTS

  //LOCATORS
  readonly searchBarInput: Locator;
  readonly viewProfileButton: Locator;
  readonly viewProfileButtonForPerson: (name: string) => Locator;

  constructor(page: Page) {
    super(page, PAGE_ENDPOINTS.FEATURED_SITES_PAGE);
    this.searchBarInput = page.getByRole('combobox', { name: 'Search for a person…' });
    this.viewProfileButton = page.locator('.button-focus.Button');
    this.viewProfileButtonForPerson = (name: string) => this.page.locator(`[aria-label="View profile of ${name}"]`);
  }

  async verifyThePageIsLoaded(): Promise<void> {
    await this.verifier.verifyTheElementIsVisible(this.searchBarInput, {
      assertionMessage: 'Search bar input should be visible',
    });
  }
  searchListOptions(name: string): Locator {
    return this.page.locator('#term-list a').filter({ hasText: name });
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

  async clickOnViewProfileButtonInOGRChart(name: string): Promise<void> {
    await test.step(`Clicking on view profile button for ${name}`, async () => {
      await this.clickOnElement(this.viewProfileButtonForPerson(name));
    });
  }
}
