import { expect, Page } from '@playwright/test';
import { BasePage } from '@/src/core/pages/basePage';
import { TIMEOUTS } from '../../../core/constants/timeouts';
import { GlobalSearchActionHelper } from '../helpers/globalSearchActionHelper';
import { GlobalSearchAssertionHelper } from '../helpers/globalSearchAssertionHelper';
import { SearchResultListComponent } from '../components/searchResultListComponent';

export class GlobalSearchResultPage extends BasePage<GlobalSearchActionHelper, GlobalSearchAssertionHelper> {
  readonly searchResultListComponent: SearchResultListComponent;
  //actions
  readonly globalSearchActionHelper: GlobalSearchActionHelper;

  //assertions
  readonly globalSearchAssertionHelper: GlobalSearchAssertionHelper;

  constructor(page: Page) {
    super(page);
    this.searchResultListComponent = new SearchResultListComponent(page);
    this.globalSearchActionHelper = new GlobalSearchActionHelper(this);
    this.globalSearchAssertionHelper = new GlobalSearchAssertionHelper(this);
  }

  get actions(): GlobalSearchActionHelper {
    return this.globalSearchActionHelper;
  }

  get assertions(): GlobalSearchAssertionHelper {
    return this.globalSearchAssertionHelper;
  }

  public getSearchResultListComponent(): SearchResultListComponent {
    return this.searchResultListComponent;
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
}
