import test, { Locator, Page } from '@playwright/test';

import { BaseComponent } from '@/src/core/components/baseComponent';

export class ChatNavigationComponent extends BaseComponent {
  readonly mainChatIcon: Locator;
  readonly seeAllMessagesButton: Locator;
  readonly createNewButton: Locator;
  readonly createNewMessageButton: Locator;
  readonly createNewGroupButton: Locator;
  constructor(page: Page) {
    super(page);
    this.mainChatIcon = page.getByRole('button', { name: 'Messaging' });
    this.seeAllMessagesButton = page.getByRole('link', { name: 'See all messages' });
    this.createNewButton = page.getByTestId('newMessageButton');
    this.createNewMessageButton = page.getByTestId('dropdown-create-message');
    this.createNewGroupButton = page.getByTestId('dropdown-create-group');
  }

  async clickOnTheChatButton(options?: { stepInfo?: string }): Promise<void> {
    await this.clickOnElement(this.mainChatIcon, { stepInfo: 'Clicking on chat button' });
  }
  async clickOnTheSeeAllMessagesButton(options?: { stepInfo?: string }): Promise<void> {
    await this.clickOnElement(this.seeAllMessagesButton, { stepInfo: 'Clicking on the see all messages button' });
  }

  async clickOnTheCreateNewButton(options?: { stepInfo?: string }): Promise<void> {
    await this.createNewButton.waitFor({ state: 'visible' });
    await this.clickOnElement(this.createNewButton, { stepInfo: 'Clicking on the create new button' });
  }

  async verifyTheCreateNewMessageButton(options?: { stepInfo?: string }): Promise<void> {
    await test.step(options?.stepInfo ?? 'verifying the create new message button', async () => {
      await this.verifier.verifyTheElementIsVisible(this.createNewMessageButton);
    });
  }

  async verifyTheCreateNewGroupButton(options?: { stepInfo?: string }): Promise<void> {
    await test.step(options?.stepInfo ?? 'verifying the create new group button', async () => {
      await this.verifier.verifyTheElementIsVisible(this.createNewGroupButton);
    });
  }
}
