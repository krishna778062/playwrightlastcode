import { expect, Locator, Page } from '@playwright/test';
import { BasePage } from '@/src/core/pages/basePage';
import { TIMEOUTS } from '../../../core/constants/timeouts';
import { ResultListingComponent } from '../components/resultsListComponent';
import { SiteListComponent } from '../components/siteListComponent';
import { TileListComponent } from '../components/tileListComponent';

export class GlobalSearchResultPage extends BasePage<any, any> {
  readonly resultListingComponent: ResultListingComponent;
  readonly siteListingComponent: SiteListComponent;
  readonly searchResultListContainer: Locator;
  readonly searchResultListItems: Locator;
  readonly siteResultItems: Locator;
  readonly tileButton: Locator;

  constructor(page: Page) {
    super(page);
    this.resultListingComponent = new ResultListingComponent(page);
    this.siteListingComponent = new SiteListComponent(page);
    this.searchResultListContainer = this.page.locator("div[class*='ResultListWithSidebar_container']");
    this.searchResultListItems = this.searchResultListContainer.locator('li');
    this.siteResultItems = this.searchResultListItems.filter({
      has: this.page.getByTestId('i-sites'),
    });
    this.tileButton = this.page.getByRole('button', { name: 'Tiles' });
  }

  get actions(): any {
    return undefined;
  }

  get assertions(): any {
    return undefined;
  }

  public getResultListingComponent(): ResultListingComponent {
    return this.resultListingComponent;
  }

  public getSiteListingComponent(): SiteListComponent {
    return this.siteListingComponent;
  }

  /**
   * Verifies the search result page is loaded
   */
  async verifyThePageIsLoaded(): Promise<void> {
    await this.verifier.waitUntilPageHasNavigatedTo(/search/, {
      stepInfo: 'Verifying the search result page is loaded',
      timeout: TIMEOUTS.MEDIUM,
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
   * Wait until the search result list is displayed
   */
  async waitUntilSearchResultListIsDisplayed() {
    await this.verifier.waitUntilElementIsVisible(this.searchResultListItems.first(), {
      timeout: 50000,
      stepInfo: 'Waiting until atleast 1 search result list item is displayed',
    });
  }

  /**
   * Private helper method to handle checkbox retry logic
   * @param verificationFn - Function that performs the verification
   */
  private async handleExactMatchCheckboxRetry(verificationFn: () => Promise<void>) {
    try {
      await verificationFn();
    } catch (error) {
      // If the verification fails, check if the "Search for an exact match" checkbox is visible and click it
      const exactMatchCheckbox = this.page.getByRole('checkbox', { name: 'Search for an exact match' });
      await exactMatchCheckbox.waitFor({ state: 'visible', timeout: 5000 });
      await exactMatchCheckbox.click();
      // Retry the verification after clicking the checkbox
      await verificationFn();
    }
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

    await this.handleExactMatchCheckboxRetry(async () => {
      await this.verifier.verifyTheElementIsVisible(siteResultToLocate, {
        timeout: 40_000,
        assertionMessage: `Verifying the site result item exactly matching the search term: ${searchTerm}`,
      });
    });

    return new SiteListComponent(this.page, siteResultToLocate);
  }

  async getTileResultItemExactlyMatchingTheSearchTerm(searchTerm: string) {
    await this.waitUntilSearchResultListIsDisplayed();

    const tileResultToLocate = this.searchResultListItems
      .filter({
        has: this.page.getByTestId('i-tile'),
      })
      .filter({
        hasText: searchTerm,
      });

    await this.handleExactMatchCheckboxRetry(async () => {
      await this.verifier.verifyTheElementIsVisible(tileResultToLocate, { timeout: 40_000 });
    });

    return new TileListComponent(this.page, tileResultToLocate, searchTerm);
  }
}
