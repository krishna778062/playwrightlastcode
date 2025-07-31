import { Locator, Page, test } from '@playwright/test';

import { BaseComponent } from '@/src/core/components/baseComponent';

export class SideNavBarComponent extends BaseComponent {
  readonly createSection: Locator;

  constructor(page: Page) {
    super(page);
    this.createSection = page.getByRole('button', { name: 'Create' });
  }

  /**
   * Clicks on the Create button in the side navigation
   * @param options - The options for the step
   */
  async clickOnCreateButton(options?: { stepInfo?: string }): Promise<void> {
    await test.step(options?.stepInfo || `Clicking Create button in side navigation`, async () => {
      await this.clickOnElement(this.createSection);
    });
  }
}
