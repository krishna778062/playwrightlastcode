import { Locator, Page } from '@playwright/test';

import { BaseComponent } from '@/src/core/ui/components/baseComponent';

export class AddTileComponent extends BaseComponent {
  readonly addContentTileOption: Locator;

  constructor(readonly page: Page) {
    super(page);
    this.addContentTileOption = page.getByRole('button', { name: 'Add pages, events & albums' });
  }

  async clickingOnAddContentTileOption(): Promise<void> {
    await this.clickOnElement(this.addContentTileOption);
  }
}
