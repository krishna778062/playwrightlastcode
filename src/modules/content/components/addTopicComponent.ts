import { Locator, Page, test } from '@playwright/test';

import { BaseComponent } from '@core/components/baseComponent';

export class AddTopicComponent extends BaseComponent {
  readonly topicName: Locator;
  readonly addButton: Locator;

  constructor(readonly page: Page) {
    super(page);
    this.topicName = this.page.locator('[aria-label="Topic name"]');
    this.addButton = this.page.getByRole('button', { name: 'Add', exact: true });
  }

  async fillTopicName(topicName: string): Promise<void> {
    await test.step('Filling topic name', async () => {
      await this.fillInElement(this.topicName, topicName);
      await this.page.waitForTimeout(1000);
      console.log('my topic name got filled');
    });
  }

  async clickOnAddButton(): Promise<void> {
    await test.step('Clicking on add button', async () => {
      await this.clickOnElement(this.addButton, { force: true });
      await this.page.waitForTimeout(3000);
      console.log('my add button got clicked');
    });
  }
}
