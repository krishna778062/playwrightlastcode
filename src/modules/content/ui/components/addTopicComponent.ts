import { Locator, Page, test } from '@playwright/test';

import { API_ENDPOINTS } from '@core/constants/apiEndpoints';
import { BaseComponent } from '@core/ui/components/baseComponent';

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

  async clickOnAddButton(): Promise<string> {
    return await test.step('Clicking on add button and wait for API response', async () => {
      const topicResponse = await this.performActionAndWaitForResponse(
        () => this.clickOnElement(this.addButton, { force: true, delay: 5_000 }),
        response =>
          response.url().includes(API_ENDPOINTS.content.createTopic) &&
          response.request().method() === 'POST' &&
          response.status() === 200,
        {
          timeout: 20_000,
        }
      );
      const topicResponseJson = await topicResponse.json();
      return topicResponseJson.result.topic_id;
    });
  }

  async clickOnAddButtonForDuplicateTopic(): Promise<void> {
    await this.clickOnElement(this.addButton);
  }
}
