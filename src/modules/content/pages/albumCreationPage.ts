import { Page } from '@playwright/test';

import { BasePage } from '@/src/core/pages/basePage';

export class AlbumCreationPage extends BasePage {
  verifyThePageIsLoaded(): Promise<void> {
    throw new Error('Method not implemented.');
  }
  constructor(page: Page) {
    super(page);
  }

  get actions() {
    return undefined;
  }

  get assertions() {
    return undefined;
  }
}
