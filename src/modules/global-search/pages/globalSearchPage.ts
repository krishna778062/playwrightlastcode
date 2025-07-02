import { expect, Page } from '@playwright/test';
import { BasePage } from '@/src/core/pages/basePage';
import { TIMEOUTS } from '../../../core/constants/timeouts';
import { GlobalSearchComponent } from '../components/globalSearchComponent';
import { GlobalSearchActionHelper } from '../helpers/globalSearchActionHelper';
import { GlobalSearchAssertionHelper } from '../helpers/globalSearchAssertionHelper';

export class GlobalSearchPage extends BasePage<GlobalSearchActionHelper, GlobalSearchAssertionHelper> {
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

  async verifyThePageIsLoaded(): Promise<void> {
    await expect(this.globalSearchComponent.searchInput, 'Expecting search bar should be visible').toBeVisible({
      timeout: TIMEOUTS.MEDIUM,
    });
  }
}
