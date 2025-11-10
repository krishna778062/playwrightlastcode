import { Locator, Page, test } from '@playwright/test';

import { BaseComponent } from '@core/ui/components/baseComponent';

export class ManageTopicsComponent extends BaseComponent {
  readonly manageTopicsHeading: Locator;
  readonly clickOnAddTopicDropdown: Locator;
  readonly clickOnAddTopicOption: Locator;
  readonly clickOnEditTopicOption: Locator;
  readonly clickOnDeleteTopicOption: Locator;
  readonly clickOnFollowTopicOption: Locator;
  readonly clickOnUnfollowTopicOption: Locator;
  readonly ellipses: Locator;
  readonly deleteTopicHeading: Locator;
  readonly cancelButton: Locator;
  readonly deleteConfirmButton: Locator;
  readonly listOfTopic: Locator;
  constructor(readonly page: Page) {
    super(page);
    this.manageTopicsHeading = page.getByRole('heading', { name: 'Manage topics' });
    this.clickOnAddTopicDropdown = page.getByRole('button', { name: 'Add topic' });
    this.clickOnAddTopicOption = page.getByRole('tablist').getByRole('button', { name: 'Add topic' });
    this.clickOnEditTopicOption = page.getByRole('button', { name: 'Edit' });
    this.clickOnDeleteTopicOption = page.getByRole('button', { name: 'Delete' });
    this.clickOnFollowTopicOption = page.getByRole('button', { name: 'Follow' });
    this.clickOnUnfollowTopicOption = page.getByRole('button', { name: 'Unfollow' });
    this.ellipses = page.locator('[aria-label="Category option"]').first();
    this.deleteTopicHeading = page.getByRole('heading', { name: 'Delete topic', level: 2 });
    this.cancelButton = page.getByRole('button', { name: 'Cancel' });
    this.deleteConfirmButton = page.getByRole('button', { name: /delete/i }).filter({ hasText: /delete/i });
    this.listOfTopic = page.locator('td.Table-cell div a');
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
  async clickOnDeleteTopic(): Promise<void> {
    await test.step('Clicking on delete topic from option menu', async () => {
      await this.hoverOverElementInJavaScript(this.ellipses);
      await this.clickOnElement(this.clickOnDeleteTopicOption);
    });
  }
  async verifyDeleteTopicPopupIsVisible(): Promise<void> {
    await test.step('Verify delete topic popup is visible', async () => {
      await this.verifier.verifyTheElementIsVisible(this.deleteTopicHeading, {
        assertionMessage: 'Delete topic popup should be visible',
      });
    });
  }

  async clickCancelButton(): Promise<void> {
    await test.step('Clicking on Cancel button in delete topic popup', async () => {
      await this.clickOnElement(this.cancelButton);
    });
  }

  async clickDeleteConfirmButton(): Promise<void> {
    await test.step('Clicking on Delete confirm button in delete topic popup', async () => {
      await this.clickOnElement(this.deleteConfirmButton);
    });
  }

  async getTopicNameFromList(): Promise<string> {
    return await test.step('Get topic name from list', async () => {
      const topicName = await this.listOfTopic.first().textContent();
      if (!topicName) {
        throw new Error('Topic name not found');
      }
      return topicName.trim();
    });
  }

  async clickOnFollowTopic(): Promise<void> {
    await test.step('Clicking on follow topic from option menu', async () => {
      await this.hoverOverElementInJavaScript(this.ellipses);
      await this.clickOnElement(this.clickOnFollowTopicOption);
    });
  }

  async clickOnUnfollowTopic(): Promise<void> {
    await test.step('Clicking on unfollow topic from option menu', async () => {
      await this.hoverOverElementInJavaScript(this.ellipses);
      await this.clickOnElement(this.clickOnUnfollowTopicOption);
    });
  }

  async verifyFollowOptionIsVisible(): Promise<void> {
    await test.step('Verify follow option is visible in dropdown', async () => {
      await this.verifier.verifyTheElementIsVisible(this.clickOnFollowTopicOption, {
        assertionMessage: 'Follow option should be visible in topic options dropdown',
      });
    });
  }

  async verifyUnfollowOptionIsVisible(): Promise<void> {
    await test.step('Verify unfollow option is visible in dropdown', async () => {
      await this.verifier.verifyTheElementIsVisible(this.clickOnUnfollowTopicOption, {
        assertionMessage: 'Unfollow option should be visible in topic options dropdown',
      });
    });
  }
}
