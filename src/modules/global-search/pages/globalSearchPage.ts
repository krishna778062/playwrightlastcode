import { expect, Locator, Page } from '@playwright/test';
import { BasePage } from '@/src/core/pages/basePage';
import { TIMEOUTS } from '../../../core/constants/timeouts';
import { GlobalSearchBarComponent } from '../components/globalSearchBarComponent';
import { SearchResultsComponent } from '../components/searchResultsComponent';

export class GlobalSearchPage extends BasePage {
  private globalSearchComponent: GlobalSearchBarComponent;
  private searchResultsComponent: SearchResultsComponent;

  constructor(page: Page) {
    super(page);
    this.globalSearchComponent = new GlobalSearchBarComponent(page);
    this.searchResultsComponent = new SearchResultsComponent(page);
  }

  getGlobalSearchComponent(): GlobalSearchBarComponent {
    return this.globalSearchComponent;
  }

  getSearchResultsComponent(): SearchResultsComponent {
    return this.searchResultsComponent;
  }

  async verifyThePageIsLoaded(): Promise<void> {
    await expect(this.globalSearchComponent.searchInput, 'Expecting search bar should be visible').toBeVisible({
      timeout: TIMEOUTS.MEDIUM,
    });
  }

  async verifyResultIsDisplayed(term: string, options?: { stepInfo?: string }): Promise<void> {
    await this.getSearchResultsComponent().verifyResultIsDisplayed(term, options);
  }
}
