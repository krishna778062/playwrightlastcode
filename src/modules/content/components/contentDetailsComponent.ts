import { Locator, Page, test } from '@playwright/test';

import { BaseComponent } from '@core/components/baseComponent';

export class ContentDetailsComponent extends BaseComponent {
  readonly checkCommentOption: Locator;

  constructor(readonly page: Page) {
    super(page);
    this.checkCommentOption = page.getByRole('button', { name: 'Post on this content' });
  }
}
