import { Page, test } from '@playwright/test';

import { PAGE_ENDPOINTS } from '@core/constants/pageEndpoints';

import { BasePage } from '@/src/core/ui/pages/basePage';

export class EditContentPage extends BasePage {
  //COMPONENTS

  //LOCATORS

  constructor(page: Page, siteId?: string, contentId?: string) {
    super(page, PAGE_ENDPOINTS.getEditPage(siteId || '', contentId || ''));
  }

  async verifyThePageIsLoaded(): Promise<void> {
    await test.step('Verify Edit Content page is loaded', async () => {
      // TODO: Implement page load verification
    });
  }
  async changePublishDateToPastDate(): Promise<void> {
    await test.step('Change publish date to past date', async () => {});
  }
}
