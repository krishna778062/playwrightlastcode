import { expect, Locator, Page } from '@playwright/test';

import { BasePage } from '@core/ui/pages/basePage';

export class QuickTaskPage extends BasePage {
  // Page elements
  readonly quickTaskContainer: Locator;

  constructor(page: Page, pageUrl: string = '/quick-task') {
    super(page, pageUrl);
    this.quickTaskContainer = page.locator('[data-testid="quick-task-container"]');
  }

  /**
   * Verify the page is loaded
   */
  async verifyThePageIsLoaded(): Promise<void> {
    await expect(this.quickTaskContainer, 'quick task page to load').toBeVisible({ timeout: 15000 });
  }
}
