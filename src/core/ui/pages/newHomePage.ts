import { expect, Page } from '@playwright/test';

import { PAGE_ENDPOINTS } from '@core/constants/pageEndpoints';
import { BasePage } from '@core/ui/pages/basePage';

export class NewHomePage extends BasePage {
  constructor(page: Page) {
    super(page, PAGE_ENDPOINTS.HOME_PAGE);
  }

  async verifyThePageIsLoaded(): Promise<void> {
    await expect(this.page.locator('h1')).toHaveText('Home');
  }
}
