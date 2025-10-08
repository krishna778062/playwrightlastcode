import { Locator, Page, test } from '@playwright/test';

import { BaseComponent } from '@core/components/baseComponent';

export class EditTopicComponent extends BaseComponent {
  readonly topicName: Locator;
  readonly updateButton: Locator;

  constructor(readonly page: Page) {
    super(page);
    this.topicName = this.page.getByRole('textbox', { name: 'Topic name' });
    this.updateButton = this.page.getByRole('button', { name: 'Update' });
  }

  async editTopicName(topicName: string): Promise<void> {
    await test.step('Editing topic name', async () => {
      await this.fillInElement(this.topicName, topicName);
    });
  }

  async clickOnUpdateButton(): Promise<void> {
    await test.step('Clicking on update button', async () => {
      await this.clickOnElement(this.updateButton);
    });
  }
}
