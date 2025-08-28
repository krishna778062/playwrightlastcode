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
    this.mainChatIcon = page.locator("[aria-label='Messaging']");
    this.seeAllMessagesButton = page.locator("a:has-text('See all messages')");
    this.createNewButton = page.locator("[data-testid='newMessageButton']");
    this.createNewMessageButton = page.locator("[data-testid='dropdown-create-message']");
    this.createNewGroupButton = page.locator("[data-testid='dropdown-create-group']");
  }

  async clickOnTheChatButton(options?: { stepInfo?: string }): Promise<void> {
    await test.step(options?.stepInfo ?? 'Clicking on the chat button', async () => {
      await this.mainChatIcon.click();
    });
  }
  async clickOnTheSeeAllMessagesButton(options?: { stepInfo?: string }): Promise<void> {
    await test.step(options?.stepInfo ?? 'Clicking on the see all messages button', async () => {
      await this.seeAllMessagesButton.click();
      await this.page.waitForTimeout(6000);
    });
  }

  async clickOnTheCreateNewButton(options?: { stepInfo?: string }): Promise<void> {
    await test.step(options?.stepInfo ?? 'Clicking on the create new button', async () => {
      await this.createNewButton.click();
      await this.page.waitForTimeout(6000);
    });
  }

  async verifyTheCreateNewMessageButton(options?: { stepInfo?: string }): Promise<void> {
    await test.step(options?.stepInfo ?? 'verifying the create new message button', async () => {
      await this.createNewMessageButton.isVisible();
    });
  }

  async verifyTheCreateNewGroupButton(options?: { stepInfo?: string }): Promise<void> {
    await test.step(options?.stepInfo ?? 'verifying the create new group button', async () => {
      await this.createNewGroupButton.isVisible();
    });
  }
}
