import { BaseComponent } from '@/src/core/components/baseComponent';
import { SiteResultItemComponent } from './siteResultItemComponent';
import { Page, Locator } from '@playwright/test';

export class SearchResultListComponent extends BaseComponent {
  readonly searchResultListContainer: Locator;
  readonly searchResultListItems: Locator;
  readonly siteResultItems: Locator;

  constructor(page: Page, rootLocator?: Locator) {
    super(page, rootLocator);
    this.searchResultListContainer = this.page.locator("div[class*='ResultListWithSidebar_container']");
    this.searchResultListItems = this.searchResultListContainer.locator('li');
    this.siteResultItems = this.searchResultListItems.filter({
      has: this.page.getByTestId('i-sites'),
    });
  }

  /**
   * Verify that the search result list is displayed
   * @returns true if the search result list is displayed, false otherwise
   */
  async isSearchResultListDisplayed() {
    return await this.verifier.verifyTheElementIsVisible(this.searchResultListContainer, { timeout: 50000 });
  }

  /**
   * Get the search result items
   * @returns the search result items
   */
  async getSearchResultItems() {
    await this.waitUntilSearchResultListIsDisplayed();
    const resultListItems = await this.searchResultListItems.all();
    return resultListItems;
  }

  /**
   * Wait until the search result list is displayed
   */
  async waitUntilSearchResultListIsDisplayed() {
    await this.verifier.waitUntilElementIsVisible(this.searchResultListItems.first(), {
      timeout: 50000,
      stepInfo: 'Waiting until atleast 1 search result list item is displayed',
    });
  }

  /**
   * Get the site result items
   * @returns the site result items
   */
  async getSiteResultItems() {
    await this.waitUntilSearchResultListIsDisplayed();
    const siteResultItems = await this.siteResultItems.all();
    return siteResultItems;
  }

  /**
   * Get the site result item exactly matching the search term
   * @param searchTerm - the search term
   * @returns the site result item
   */
  async getSiteResultItemExactlyMatchingTheSearchTerm(searchTerm: string) {
    await this.waitUntilSearchResultListIsDisplayed();
    const siteResultToLocate = this.siteResultItems.filter({
      has: this.page.locator('h2', { hasText: searchTerm }),
    });
    await this.verifier.verifyTheElementIsVisible(siteResultToLocate, { timeout: 40_000 });
    return new SiteResultItemComponent(this.page, siteResultToLocate);
  }
}
