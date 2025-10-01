import { Locator, Page, Response, test } from '@playwright/test';

import { BasePage } from '@core/pages/basePage';

import { PAGE_ENDPOINTS } from '@/src/core/constants/pageEndpoints';

export interface IAddTopicPageActions {
  fillTopicName: (topicName: string) => Promise<void>;
  clickOnAddButton: () => Promise<void>;
}

export interface IAddTopicPageAssertions {}
export class AddTopicModal extends BasePage {
  readonly addTopicHeading = this.page.getByRole('heading', { name: 'Add topic' });
  readonly topicName = this.page.locator('[aria-label="Topic name"]');
  readonly addButton = this.page.getByRole('button', { name: 'Add', exact: true });
  constructor(page: Page) {
    super(page);
  }

  get actions(): IAddTopicPageActions {
    return this;
  }

  get assertions(): IAddTopicPageAssertions {
    return this;
  }

  async verifyThePageIsLoaded(): Promise<void> {
    await test.step('Verify add topic page is visible', async () => {
      await this.verifier.verifyTheElementIsVisible(this.addTopicHeading, {
        assertionMessage: 'Add topics page should be visible',
      });
    });
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
