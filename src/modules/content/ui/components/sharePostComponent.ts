import { Locator, Page } from '@playwright/test';

import { BaseComponent } from '@/src/core/ui/components/baseComponent';

export class SharePostComponent extends BaseComponent {
  readonly sharePostButton: Locator;

  constructor(readonly page: Page) {
    super(page);

    this.sharePostButton = page.getByRole('button', { name: 'Share' });
  }
  async clickingOnSharePostButton(): Promise<void> {
    await this.clickOnElement(this.sharePostButton);
  }
}
