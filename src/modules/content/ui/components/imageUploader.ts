import { Page } from '@playwright/test';

import { BaseComponent } from '@/src/core/ui/components/baseComponent';

export class ImageUploaderComponent extends BaseComponent {
  constructor(page: Page) {
    super(page);
  }
}
