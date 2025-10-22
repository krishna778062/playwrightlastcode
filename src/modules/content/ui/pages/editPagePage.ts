import { Locator, Page, test } from '@playwright/test';

import { PAGE_ENDPOINTS } from '@/src/core/constants/pageEndpoints';
import { BasePage } from '@/src/core/ui/pages/basePage';

export interface IEditPageActions {
  clickOnCancel: () => Promise<void>;
}

export class EditPagePage extends BasePage {
  // Locators (moved from EditPageComponent)
  readonly cancelButton: Locator;
  readonly pageHeading: Locator;

  constructor(page: Page, siteId?: string, pageId?: string) {
    super(page, PAGE_ENDPOINTS.getEditPage(siteId!, pageId!));
    this.cancelButton = page.getByRole('button', { name: 'Cancel' });
    this.pageHeading = page.getByRole('heading', { name: 'Page' });
  }

  get actions(): IEditPageActions {
    return this;
  }

  async verifyThePageIsLoaded(): Promise<void> {
    await test.step('Verify edit page page is visible', async () => {
      await this.verifier.verifyTheElementIsVisible(this.pageHeading, {
        assertionMessage: 'Edit page page should be visible',
      });
    });
  }

  async clickOnCancel(): Promise<void> {
    await test.step('Clicking on cancel button', async () => {
      await this.clickOnElement(this.cancelButton);
    });
  }
}
