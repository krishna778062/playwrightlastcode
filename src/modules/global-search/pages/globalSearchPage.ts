import { expect, Page } from '@playwright/test';
import { BasePage } from '@/src/core/pages/basePage';
import { TIMEOUTS } from '../../../core/constants/timeouts';
import { GlobalSearchComponent } from '../components/globalSearchComponent';

export class GlobalSearchPage extends BasePage {
  private globalSearchComponent: GlobalSearchComponent;

  constructor(page: Page) {
    super(page);
    this.globalSearchComponent = new GlobalSearchComponent(page);
  }

  getGlobalSearchComponent(): GlobalSearchComponent {
    return this.globalSearchComponent;
  }

  async verifyThePageIsLoaded(): Promise<void> {
    await expect(this.globalSearchComponent.searchInput, 'Expecting search bar should be visible').toBeVisible({
      timeout: TIMEOUTS.MEDIUM,
    });
  }
}
