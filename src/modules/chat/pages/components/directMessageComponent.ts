import { expect, Locator, Page, test } from '@playwright/test';
import { BaseComponent } from './baseComponent';
import { TIMEOUTS } from '@core/constants/timeouts';
import { GroupChatWindowComponent } from './groupChatWindowComponent';

export class DirectMessageComponent extends BaseComponent {
  readonly directMessageContainer: Locator;
  readonly focusedChatComponentContainer: Locator;
  readonly directMessageItem: Locator;
  constructor(page: Page) {
    super(page);
    this.directMessageContainer = this.page.getByTestId('chat.dm-text');
    this.directMessageItem = this.directMessageContainer.locator(
      "[data-testid*='direct-message-item']"
    );
    this.focusedChatComponentContainer = this.page.locator(
      "[data-variant='chat'][class*='styles_root_']"
    );
  }

  async expandDirectMessageSection(): Promise<void> {}

  async collapseDirectMessageSection(): Promise<void> {}

  async waitUntilUserIsPresentInDirectMessageSection(
    userName: string,
    options?: {
      stepInfo?: string;
    }
  ): Promise<Locator> {
    let directMessageItemFromUser: Locator;
    await test.step(
      options?.stepInfo ?? `Verifying user ${userName} is present in direct message section`,
      async () => {
        directMessageItemFromUser = this.directMessageItem.filter({ hasText: userName });
        await expect(
          directMessageItemFromUser,
          `expecting direct message item from user ${userName} to be visible`
        ).toBeVisible({ timeout: TIMEOUTS.MEDIUM });
      }
    );
    return directMessageItemFromUser!;
  }

  async fetchNumberOfNewMessageNotificationsAppearingForDMFromUser(
    userName: string,
    options?: {
      stepInfo?: string;
    }
  ): Promise<number> {
    let numberOfNewMessageNotifications: number;
    await test.step(
      options?.stepInfo ??
        `Fetching number of new message notifications appearing for DM from user ${userName}`,
      async () => {
        const directMessageItemFromUser = this.directMessageItem.filter({ hasText: userName });
        const numberOfNewMessageNotificationsText = await directMessageItemFromUser
          .getByLabel('Stamp')
          .textContent();
        numberOfNewMessageNotifications = Number(numberOfNewMessageNotificationsText) ?? 0;
      }
    );
    return numberOfNewMessageNotifications!;
  }

  async openDirectMessageWithUser(
    userName: string,
    options?: {
      stepInfo?: string;
    }
  ): Promise<GroupChatWindowComponent> {
    await test.step(
      options?.stepInfo ?? `Opening direct message with user ${userName}`,
      async () => {
        const directMessageItemFromUser =
          await this.waitUntilUserIsPresentInDirectMessageSection(userName);
        await directMessageItemFromUser.click();
      }
    );
    return new GroupChatWindowComponent(this.page, this.focusedChatComponentContainer);
  }
}
