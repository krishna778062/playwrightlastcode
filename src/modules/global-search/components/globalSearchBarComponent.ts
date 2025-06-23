import { TIMEOUTS } from '@core/constants/timeouts';
import { BaseComponent } from '@/src/core/components/baseComponent';
import { expect, Locator, Page, test } from '@playwright/test';
import { GlobalSearchPage } from '../pages/globalSearchPage';

export class GlobalSearchBarComponent extends BaseComponent {
  readonly searchInput: Locator;
  readonly searchButton: Locator;

  constructor(page: Page, rootLocator?: Locator) {
    super(page, rootLocator);
    this.searchInput = this.page.getByPlaceholder('Search', { exact: false });
    this.searchButton = this.page.locator('button[aria-label="Search"]');
  }

  async inputTermInSearchBar(term: string, options?: { stepInfo?: string }) {
    await test.step(options?.stepInfo || `Searching for "${term}" in global search`, async () => {
      await this.typeInElement(this.searchInput, term);
    });
  }

  async clickSearchButton(options?: { stepInfo?: string }): Promise<GlobalSearchPage> {
    return await test.step(options?.stepInfo || `Clicking on Search button`, async () => {
      const searchPage = await this.performActionAndWaitForPageNavigation(
        () => this.clickOnElement(this.searchButton),
        /search/
      );
      const globalSearchPage = new GlobalSearchPage(searchPage);
      await globalSearchPage.verifyThePageIsLoaded();
      return globalSearchPage;
    });
  }
}
