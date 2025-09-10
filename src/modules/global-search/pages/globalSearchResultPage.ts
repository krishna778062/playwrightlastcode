import { Locator, Page } from '@playwright/test';
import { test } from '@playwright/test';

import { ExternalSearchListComponent } from '../components/externalSearchListComponent';

import { ContentType } from '@/src/core/constants/contentTypes';
import { TIMEOUTS } from '@/src/core/constants/timeouts';
import { BasePage } from '@/src/core/pages/basePage';
import { AppsAndLinkContainerComponent } from '@/src/modules/global-search/components/appsAndLinkListComponent';
import { ContentListComponent } from '@/src/modules/global-search/components/contentListComponent';
import { FeedListComponent } from '@/src/modules/global-search/components/feedListComponent';
import { IntranetFileListComponent } from '@/src/modules/global-search/components/intranetFileListComponent';
import { ResultListingComponent } from '@/src/modules/global-search/components/resultsListComponent';
import { SidebarFilterComponent } from '@/src/modules/global-search/components/sidebarFilterComponent';
import { SiteListComponent } from '@/src/modules/global-search/components/siteListComponent';
import { TileListComponent } from '@/src/modules/global-search/components/tileListComponent';
import { IContentSearch } from '@/src/modules/global-search/types/content-search.type';
import { IFeedSearch } from '@/src/modules/global-search/types/feed-search.type';
import { IFileSearch } from '@/src/modules/global-search/types/file-search.type';

export class GlobalSearchResultPage extends BasePage {
  readonly resultListingComponent: ResultListingComponent;
  readonly siteListingComponent: SiteListComponent;
  readonly searchResultListContainer: Locator;
  readonly searchResultListItems: Locator;
  readonly siteResultItems: Locator;
  readonly pageResultItems: Locator;
  readonly eventResultItems: Locator;
  readonly albumResultItems: Locator;
  readonly feedResultItems: Locator;
  readonly tileResultItems: Locator;
  readonly tileButton: Locator;
  readonly appResultContainer: Locator;
  readonly externalSearchResultItems: Locator;

  constructor(page: Page) {
    super(page);
    this.resultListingComponent = new ResultListingComponent(page);
    this.siteListingComponent = new SiteListComponent(page);
    this.searchResultListContainer = this.page.locator("div[class*='ResultListWithSidebar_container']");
    this.searchResultListItems = this.searchResultListContainer.locator('li');
    this.siteResultItems = this.searchResultListItems.filter({
      has: this.page.getByTestId('i-sites'),
    });
    this.pageResultItems = this.searchResultListItems.filter({
      has: this.page.getByTestId('i-page'),
    });
    this.albumResultItems = this.searchResultListItems.filter({
      has: this.page.getByTestId('i-albums'),
    });
    this.feedResultItems = this.searchResultListItems.filter({
      has: this.page.getByTestId('i-feedMobile'),
    });
    this.tileResultItems = this.searchResultListItems.filter({
      has: this.page.getByTestId('i-tile'),
    });
    this.tileButton = this.page.getByRole('button', { name: 'Tiles' });

    this.eventResultItems = this.searchResultListItems.filter({
      has: this.page.getByTestId('i-calendar'),
    });

    this.appResultContainer = this.page.locator("div[class*='AppItemList_appListTopWrapper']");

    this.externalSearchResultItems = this.page.locator("div[class*='externalSearchBox']");
  }

  /**
   * Creates a sidebar filter component for the specified filter type
   * @param options - Filter options with text and optional icon type
   * @returns SidebarFilterComponent - The filter component instance
   */
  getSidebarFilter(options: { filterText: string; iconType?: string; siteName?: string }): SidebarFilterComponent {
    return new SidebarFilterComponent(this.page, options);
  }

  private getTestIdForFileType(fileType: string): string {
    switch (fileType) {
      case 'pdf':
        return 'i-adobeAcrobat';
      case 'docx':
        return 'i-microsoftWord';
      case 'pptx':
        return 'i-microsoftPowerPoint';
      case 'csv':
        return 'i-file';
      case 'xlsx':
        return 'i-microsoftExcel';
      case 'mp4':
        return 'i-video';
      default:
        return 'i-files';
    }
  }

  /**
   * Verifies all data points for a content search result item (Page, Album, Event).
   * @param resultItemType - The content type to verify.
   * @param data - The content search data to verify.
   */
  async verifyContentResultItemDataPoints(resultItemType: ContentType, data: IContentSearch) {
    await test.step(`Verifying all data points for a content result item of type "${resultItemType}"`, async () => {
      let resultLocator;
      if (resultItemType === ContentType.Album) {
        resultLocator = await this.getAlbumResultItemExactlyMatchingTheSearchTerm(data.name);
      } else if (resultItemType === ContentType.Event) {
        resultLocator = await this.getEventResultItemExactlyMatchingTheSearchTerm(data.name);
      } else {
        resultLocator = await this.getPageResultItemExactlyMatchingTheSearchTerm(data.name);
      }
      const contentResultItem = new ContentListComponent(resultLocator.page, resultLocator.rootLocator);
      await contentResultItem.verifyContentResultItem(data);
    });
  }

  /**
   * Verifies all data points for a feed search result item.
   * @param data - The feed search data to verify.
   */
  async verifyFeedResultItemDataPoints(data: IFeedSearch) {
    await test.step(`Verifying all data points for a feed result item`, async () => {
      const resultLocator = await this.getFeedResultItemExactlyMatchingTheSearchTerm(data.name);
      const feedResultItem = new FeedListComponent(resultLocator.page, resultLocator.rootLocator);
      await feedResultItem.verifyFeedResultItem(data);
    });
  }

  /**
   * Verifies all data points for a file search result item.
   * @param data - The file search data to verify.
   */
  async verifyFileResultItemDataPoints(data: IFileSearch) {
    await test.step(`Verifying all data points for a file result item for filename ${data.name} and item type ${data.type}`, async () => {
      const resultLocator = await this.getFileResultItemExactlyMatchingTheSearchTerm(data.name, data.type);
      const fileResultItem = new IntranetFileListComponent(resultLocator.page, resultLocator.rootLocator);
      await fileResultItem.verifyIntranetFileResultItem(data);
    });
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

  public getIntranetFileListComponent(): IntranetFileListComponent {
    return new IntranetFileListComponent(this.page);
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
   * Verify that the app result list is displayed
   * @returns true if the app result list is displayed, false otherwise
   */
  async isAppResultDisplayed() {
    return await this.verifier.verifyTheElementIsVisible(this.appResultContainer, { timeout: 50000 });
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
      await exactMatchCheckbox.waitFor({ state: 'visible', timeout: 50_000 });
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
   * @param apiClient - the API client
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

  /**
   * Get the page result item exactly matching the search term
   * @param searchTerm - the search term
   * @returns the content result item
   */
  async getPageResultItemExactlyMatchingTheSearchTerm(searchTerm: string) {
    return await test.step(`Getting page result item matching the search term "${searchTerm}"`, async () => {
      await this.waitUntilSearchResultListIsDisplayed();
      const contentResultToLocate = this.pageResultItems.filter({
        has: this.page.locator('h2', { hasText: searchTerm }),
      });
      await this.handleExactMatchCheckboxRetry(async () => {
        await this.verifier.verifyTheElementIsVisible(contentResultToLocate, { timeout: 40_000 });
      });
      return new ResultListingComponent(this.page, contentResultToLocate);
    });
  }

  /**
   * Get the feed result item exactly matching the search term
   * @param searchTerm - the search term
   * @returns the content result item
   */
  async getFeedResultItemExactlyMatchingTheSearchTerm(searchTerm: string) {
    return await test.step(`Getting feed result item matching the search term "${searchTerm}"`, async () => {
      await this.waitUntilSearchResultListIsDisplayed();
      const contentResultToLocate = this.feedResultItems.filter({
        has: this.page.locator('span', { hasText: searchTerm }),
      });
      await this.handleExactMatchCheckboxRetry(async () => {
        await this.verifier.verifyTheElementIsVisible(contentResultToLocate, { timeout: 40_000 });
      });
      return new ResultListingComponent(this.page, contentResultToLocate);
    });
  }

  /**
   * Get the event result item exactly matching the search term
   * @param searchTerm - the search term
   * @returns the content result item
   */
  async getEventResultItemExactlyMatchingTheSearchTerm(searchTerm: string) {
    return await test.step(`Getting event result item matching the search term "${searchTerm}"`, async () => {
      await this.waitUntilSearchResultListIsDisplayed();
      const contentResultToLocate = this.eventResultItems.filter({
        has: this.page.locator('h2', { hasText: searchTerm }),
      });
      await this.handleExactMatchCheckboxRetry(async () => {
        await this.verifier.verifyTheElementIsVisible(contentResultToLocate, { timeout: 50_000 });
      });
      return new ResultListingComponent(this.page, contentResultToLocate);
    });
  }

  /**
   * Get the album result item exactly matching the search term
   * @param searchTerm - the search term
   * @returns the content result item
   */
  async getAlbumResultItemExactlyMatchingTheSearchTerm(searchTerm: string) {
    return await test.step(`Getting event result item matching the search term "${searchTerm}"`, async () => {
      await this.waitUntilSearchResultListIsDisplayed();
      const contentResultToLocate = this.albumResultItems.filter({
        has: this.page.locator('h2', { hasText: searchTerm }),
      });
      await this.handleExactMatchCheckboxRetry(async () => {
        await this.verifier.verifyTheElementIsVisible(contentResultToLocate, { timeout: 60_000 });
      });
      return new ResultListingComponent(this.page, contentResultToLocate);
    });
  }

  /**
   * Get the file result item exactly matching the search term
   * @param searchTerm - the search term
   * @returns the content result item
   */
  async getFileResultItemExactlyMatchingTheSearchTerm(searchTerm: string, fileType: string) {
    return await test.step(`Getting file result item matching the search term "${searchTerm}"`, async () => {
      await this.waitUntilSearchResultListIsDisplayed();
      const testId = this.getTestIdForFileType(fileType);
      const fileResultItems = this.searchResultListItems.filter({
        has: this.page.getByTestId(testId),
      });
      const contentResultToLocate = fileResultItems.filter({
        has: this.page.locator('h2', { hasText: searchTerm }),
      });
      await this.handleExactMatchCheckboxRetry(async () => {
        await this.verifier.verifyTheElementIsVisible(contentResultToLocate, { timeout: 60_000 });
      });
      return new ResultListingComponent(this.page, contentResultToLocate);
    });
  }

  async getTileResultItemExactlyMatchingTheSearchTerm(searchTerm: string) {
    await this.waitUntilSearchResultListIsDisplayed();

    const tileResultToLocate = this.tileResultItems.filter({
      hasText: searchTerm,
    });

    await this.handleExactMatchCheckboxRetry(async () => {
      await this.verifier.verifyTheElementIsVisible(tileResultToLocate, { timeout: 40_000 });
    });

    return new TileListComponent(this.page, tileResultToLocate, searchTerm);
  }

  /**
   * Get the app result item exactly matching the search term
   * @param searchTerm - the search term
   * @returns the app result item
   */
  async getAppResultItemExactlyMatchingTheSearchTerm(searchTerm: string) {
    await this.isAppResultDisplayed();
    const appResultToLocate = this.appResultContainer.locator('a').filter({
      has: this.page.locator('h3', { hasText: searchTerm }),
    });
    return new AppsAndLinkContainerComponent(this.page, appResultToLocate);
  }

  /**
   * Verifies external search results are displayed
   */
  async verifyExternalSearchLinksAreDisplayed(): Promise<ExternalSearchListComponent> {
    return await test.step('Verifying external search results are displayed', async () => {
      await this.verifier.verifyTheElementIsVisible(this.externalSearchResultItems, { timeout: 10000 });
      return new ExternalSearchListComponent(this.page, this.externalSearchResultItems);
    });
  }

  /**
   * Verifies and clicks on a sidebar filter with complete verification workflow
   * @param options - Filter options with text and optional icon type
   */
  async verifyAndClickSidebarFilter(options: { filterText: string; iconType?: string }): Promise<void> {
    return await this.getSidebarFilter(options).verifyAndClickFilter();
  }

  /**
   * Verifies and clicks on site subfilter with site selection
   * @param siteName - The name of the site to select
   */
  async verifyAndClickSiteSubFilter(options: { filterText: string; siteName: string }): Promise<number> {
    return await this.getSidebarFilter(options).verifyAndClickSiteSubFilter();
  }

  /**
   * Verifies site subfilter with count tracking and reset functionality
   * @param options - Options including filter text and site name
   */
  async verifySiteSubFilterWithCountTracking(options: {
    filterText: string;
    siteName: string;
    originalCount: number;
    expectedCountAfterFilter: number;
  }): Promise<void> {
    const siteSubFilter = this.getSidebarFilter(options);
    await siteSubFilter.verifySiteSubFilterWithCountTracking({
      expectedCountAfterFilter: options.expectedCountAfterFilter,
      originalCount: options.originalCount,
    });
  }
}
