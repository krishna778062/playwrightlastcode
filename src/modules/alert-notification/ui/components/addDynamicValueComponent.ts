import { Page } from '@playwright/test';

export class AddDynamicValueComponent {
  constructor(readonly page: Page) {
    this.page = page;
  }
}
