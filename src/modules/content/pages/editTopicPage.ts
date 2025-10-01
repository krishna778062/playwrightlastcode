import { Locator, Page, Response, test } from '@playwright/test';

import { BasePage } from '@core/pages/basePage';

import { PAGE_ENDPOINTS } from '@/src/core/constants/pageEndpoints';

export interface IEditTopicPageActions {
  editTopicName: (topicName: string) => Promise<void>;
  clickOnUpdateButton: () => Promise<void>;
}

export interface IEditTopicPageAssertions {}
export class EditTopicModal extends BasePage {
  readonly editTopicHeading = this.page.getByRole('heading', { name: 'Edit topic' });
  readonly topicName = this.page.getByRole('textbox', { name: 'Topic name' });
  readonly updateButton = this.page.getByRole('button', { name: 'Update' });
  constructor(page: Page) {
    super(page);
  }

  get actions(): IEditTopicPageActions {
    return this;
  }

  get assertions(): IEditTopicPageAssertions {
    return this;
  }

  async verifyThePageIsLoaded(): Promise<void> {
    await test.step('Verify edit topic page is visible', async () => {
      await this.verifier.verifyTheElementIsVisible(this.editTopicHeading, {
        assertionMessage: 'Edit topic page should be visible',
      });
    });
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
