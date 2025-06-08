import { Page } from '@playwright/test';
import { PageActions } from '@/src/core/utils/pageActions';

export class BaseComponent {
  readonly page: Page;
  readonly pageActions: PageActions;
  constructor(page: Page) {
    this.page = page;
    this.pageActions = new PageActions(page);
  }
}
