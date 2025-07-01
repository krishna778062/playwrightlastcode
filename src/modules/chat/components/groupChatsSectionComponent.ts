import { TIMEOUTS } from '@core/constants/timeouts';
import { BaseComponent } from '@/src/core/components/baseComponent';
import { expect, Locator, Page, test } from '@playwright/test';

export class GroupChatsSectionComponent extends BaseComponent {
  readonly groupChatsSectionContainer: Locator;
  readonly groupChatsExpandCollapseButton: Locator;
  readonly focusedGroupChatHeader: Locator;
  constructor(page: Page) {
    super(page);
    this.groupChatsSectionContainer = this.page.getByTestId('chat.groups-text');
    this.groupChatsExpandCollapseButton = this.page.getByRole('button', { name: 'Groups' });
    this.focusedGroupChatHeader = this.page.locator('[class*="Group_headingWrapper"]');
  }

  /**
   * Expands the group chats section
   */
  async expandGroupChatsSection(): Promise<void> {
    await test.step(`Expanding group chats section`, async () => {
      await this.verifier.verifyTheElementIsVisible(this.groupChatsExpandCollapseButton);
      //check if the group chats section is expanded
      if ((await this.groupChatsExpandCollapseButton.getAttribute('aria-expanded')) === 'false') {
        await this.clickOnElement(this.groupChatsExpandCollapseButton);
      } else {
        console.log('Group chats section is already expanded');
      }
    });
  }

  /**
   * Collapses the group chats section
   */
  async collapseGroupChatsSection(): Promise<void> {
    await test.step(`Collapse group chats section if it is expanded`, async () => {
      await this.verifier.verifyTheElementIsVisible(this.groupChatsExpandCollapseButton);
      //check if the group chats section is expanded
      if ((await this.groupChatsExpandCollapseButton.getAttribute('aria-expanded')) === 'true') {
        await this.clickOnElement(this.groupChatsExpandCollapseButton);
      } else {
        console.log('Group chats section is already expanded');
      }
    });
  }

  /**
   * Opens a group chat
   * @param groupChatName - The name of the group chat to open, should be exact match
   * @param options - The options for the open group chat
   * @param options.stepInfo - The step info for the open group chat
   */
  async openGroupChat(
    groupChatName: string,
    options?: {
      stepInfo?: string;
    }
  ): Promise<void> {
    await test.step(options?.stepInfo ?? `Opening group chat ${groupChatName}`, async () => {
      const groupChatLocator = this.page.locator(`[data-testid*=${groupChatName}]`).filter({ hasText: groupChatName });
      const isGroupChatVisible = await this.verifier.isTheElementVisible(groupChatLocator, {
        assertionMessage: `expecting group with name ${groupChatName} to be visible`,
        timeout: 20_000,
      });
      //refresh the page if the group chat is not visible
      if (!isGroupChatVisible) {
        await this.page.reload();
        await this.verifier.verifyTheElementIsVisible(groupChatLocator);
      }
      //click on the group chat
      await this.clickOnElement(groupChatLocator);
      //verify the group chat is opened
      await this.verifyGroupChatHasOpened(groupChatName);
    });
  }

  async navigateToGroupChatByConversationId(conversationId: string): Promise<void> {
    await test.step(`Navigating to group chat: ${conversationId}`, async () => {
      await this.page.goto(`/chat/conversations/${conversationId}`);
    });
  }

  /**
   * Verifies a group chat has opened
   * @param groupChatName - The name of the group chat to verify, should be exact match
   */
  async verifyGroupChatHasOpened(groupChatName: string) {
    await test.step(`Verifying group chat ${groupChatName} has opened`, async () => {
      const groupChatHeader = this.focusedGroupChatHeader.filter({ hasText: groupChatName });
      await this.verifier.verifyTheElementIsVisible(groupChatHeader, {
        assertionMessage: 'expecting group chat header to be visible',
        timeout: TIMEOUTS.MEDIUM,
      });
    });
  }

  /**
   * Gets the details of the selected group chat
   * @returns The name and id of the selected group chat
   */
  async getTheSelectedGroupChatDetails(): Promise<{ groupChatName: string; groupChatId: string }> {
    //selecting group chat locator which has data-active attribute set as true
    const activeGroupChatLocator = this.page.locator("[data-testid*='group-item']").filter({
      has: this.page.locator("[data-active='true']"),
    });
    //getting the group chat name
    const groupChatName = await activeGroupChatLocator.getAttribute('aria-label');
    //getting the group chat id
    const groupChatId = (await activeGroupChatLocator.getAttribute('data-sidebar-chat-id'))?.split('-')[1];
    if (!groupChatName || !groupChatId) {
      throw new Error('Group chat name or id is not found');
    }
    return { groupChatName, groupChatId };
  }
}
