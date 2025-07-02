import { expect, Page } from '@playwright/test';
import { BasePage } from '@/src/core/pages/basePage';
import { TIMEOUTS } from '../../../core/constants/timeouts';
import { GlobalSearchComponent } from '../components/globalSearchComponent';
import { GlobalSearchActionHelper } from '../helpers/globalSearchActionHelper';
import { GlobalSearchAssertionHelper } from '../helpers/globalSearchAssertionHelper';

export class GlobalSearchResultPage extends BasePage<GlobalSearchActionHelper, GlobalSearchAssertionHelper> {
  readonly globalSearchComponent: GlobalSearchComponent;
  //actions
  readonly globalSearchActionHelper: GlobalSearchActionHelper;

  //assertions
  readonly globalSearchAssertionHelper: GlobalSearchAssertionHelper;

  constructor(page: Page) {
    super(page);
    this.globalSearchComponent = new GlobalSearchComponent(page);
    this.globalSearchActionHelper = new GlobalSearchActionHelper(this);
    this.globalSearchAssertionHelper = new GlobalSearchAssertionHelper(this);
  }

  get actions(): GlobalSearchActionHelper {
    return this.globalSearchActionHelper;
  }

  get assertions(): GlobalSearchAssertionHelper {
    return this.globalSearchAssertionHelper;
  }

  public getGlobalSearchComponent(): GlobalSearchComponent {
    return this.globalSearchComponent;
  }

  /**
   * Verifies the search result page is loaded
   */
  async verifyThePageIsLoaded(): Promise<void> {
    await this.verifier.waitUntilPageHasNavigatedTo(/search/, {
      stepInfo: 'Verifying the search result page is loaded',
      timeout: TIMEOUTS.MEDIUM,
    });
    await expect(this.globalSearchComponent.searchInput, 'Expecting search bar should be visible').toBeVisible({
      timeout: TIMEOUTS.MEDIUM,
    });
  }
}
