import { Page, test } from '@playwright/test';

import { PAGE_ENDPOINTS } from '@core/constants/pageEndpoints';

import { BasePage } from '@/src/core/ui/pages/basePage';

export interface IEditContentPageActions {
  changePublishDateToPastDate: () => Promise<void>;
}

export interface IEditContentPageAssertions {}

export class EditContentPage extends BasePage implements IEditContentPageActions, IEditContentPageAssertions {
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

  get actions(): IEditContentPageActions {
    return this;
  }

  get assertions(): IEditContentPageAssertions {
    return this;
  }

  async changePublishDateToPastDate(): Promise<void> {
    await test.step('Change publish date to past date', async () => {});
  }
}
