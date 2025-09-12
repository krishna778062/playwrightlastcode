import { expect, Locator, Page, test } from '@playwright/test';

import { BaseComponent } from '@/src/core/components/baseComponent';
export class EditPageComponent extends BaseComponent {
  readonly clickOnCancel: Locator;
  readonly pageHeading: Locator;

  action: any;
  constructor(page: Page) {
    super(page);
    this.clickOnCancel = page.getByRole('button', { name: 'Cancel' });
    this.pageHeading = page.getByRole('heading', { name: 'Page' });
  }

  async clickOnCancelButton(options?: { stepInfo?: string }): Promise<void> {
    await test.step(options?.stepInfo || 'Clicking on cancel button', async () => {
      await this.clickOnCancel.click();
    });
  }
}
