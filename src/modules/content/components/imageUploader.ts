import { Page } from '@playwright/test';

import { BaseComponent } from '@core/components/baseComponent';

export class ImageUploaderComponent extends BaseComponent {
  constructor(page: Page) {
    super(page);
  }
}
