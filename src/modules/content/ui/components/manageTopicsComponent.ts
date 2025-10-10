import { Locator, Page, test } from '@playwright/test';

import { BaseComponent } from '@core/ui/components/baseComponent';

export class ManageTopicsComponent extends BaseComponent {
  readonly manageTopicsHeading: Locator;
  readonly clickOnAddTopicDropdown: Locator;
  readonly clickOnAddTopicOption: Locator;
  readonly clickOnEditTopicOption: Locator;
  readonly ellipses: Locator;
  constructor(readonly page: Page) {
    super(page);
    this.manageTopicsHeading = page.getByRole('heading', { name: 'Manage topics' });
    this.clickOnAddTopicDropdown = page.getByRole('button', { name: 'Add topic' });
    this.clickOnAddTopicOption = page.getByRole('tablist').getByRole('button', { name: 'Add topic' });
    this.clickOnEditTopicOption = page.getByRole('button', { name: 'Edit' });
    this.ellipses = page.locator('[aria-label="Category option"]').first();
  }
  async clickOnAddTopic(): Promise<void> {
    await test.step('Clicking on add topic', async () => {
      await this.clickOnElement(this.clickOnAddTopicDropdown);
      await this.clickOnElement(this.clickOnAddTopicOption);
    });
  }
  async clickOnEditTopic(): Promise<void> {
    await test.step('Clicking on edit topic', async () => {
      await this.hoverOverElementInJavaScript(this.ellipses);
      await this.clickOnElement(this.clickOnEditTopicOption);
    });
  }
}
