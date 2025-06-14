import { expect, Locator, Page, test } from '@playwright/test';
import { MessageEmojis } from '@core/constants/messageEmojis';
import { MessageBaseComponent } from '@chat/components/messageBaseComponent';
import { MessageReplyThreadComponent } from '@chat/components/messageReplyThreadComponent';

export class FocusedMessageComponent extends MessageBaseComponent {
  readonly focusedMessageContainer: Locator;
  readonly messageActionsContainer: Locator;
  readonly emojiPickerButton: Locator;
  readonly emojiPickerContainer: Locator;
  readonly emojiPickerEmojisGroupsContainer: Locator;
  readonly threeDotsButtonToOpenMessageActionsMenu: Locator;
  readonly deleteMessageButtonFromMessageActionsMenu: Locator;
  readonly replyInThreadButton: Locator;
  readonly replyThreadComponentContainer: Locator;

  constructor(page: Page, focusedMessageContainer: Locator) {
    super(page, focusedMessageContainer);
    this.focusedMessageContainer = focusedMessageContainer;
    this.messageActionsContainer = this.focusedMessageContainer.getByTestId('message-action-root');
    this.emojiPickerButton = this.messageActionsContainer.getByLabel('addEmoji icon');
    this.emojiPickerContainer = this.page.locator("[class*='EmojiPicker_root']").first();
    this.emojiPickerEmojisGroupsContainer = this.emojiPickerContainer.locator(
      "[EmojiPicker_emojiGroupWrapper']"
    );
    this.threeDotsButtonToOpenMessageActionsMenu =
      this.focusedMessageContainer.getByTestId('message-action-trigger');
    this.deleteMessageButtonFromMessageActionsMenu = this.page.getByTestId('deleteMessageButton');
    this.replyInThreadButton = this.page.getByTestId('replyInThreadButton');
    this.replyThreadComponentContainer = this.page.locator(
      "[data-variant='thread'][class*='styles_root_']"
    );
  }

  /**
   * Gets the text of the message
   * @returns The text of the message
   */
  async getMessageText(options?: { stepInfo?: string }): Promise<string | null> {
    let messageText: string | null = null;
    await test.step(options?.stepInfo ?? `Getting the text of the message`, async () => {
      messageText = await this.focusedMessageContainer
        .locator('section')
        .locator('p')
        .textContent();
    });
    return messageText;
  }

  async reactOnMessage(reaction: MessageEmojis, options?: { stepInfo?: string }): Promise<void> {
    await test.step(options?.stepInfo ?? `React on message: ${reaction}`, async () => {
      await this.openMessageActions(options);
      await this.clickOnElement(this.messageActionsContainer.getByLabel(reaction));
    });
  }

  async openMessageActions(options?: { stepInfo?: string }): Promise<void> {
    await test.step(options?.stepInfo ?? `Opening the message actions`, async () => {
      await this.focusedMessageContainer.hover();
      await expect(
        this.messageActionsContainer,
        `expecting message actions container to be visible`
      ).toBeVisible();
    });
  }

  async openEmojiPicker(options?: { stepInfo?: string }): Promise<void> {
    await test.step(options?.stepInfo ?? `Opening the emoji picker`, async () => {
      await this.openMessageActions(options);
      await this.clickOnElement(this.emojiPickerButton);
    });
  }

  async pickAnyRandomEmojiFromEmojiPicker(options?: { stepInfo?: string }): Promise<void> {
    await test.step(
      options?.stepInfo ?? `Picking any random emoji from the emoji picker`,
      async () => {
        await expect(
          this.emojiPickerContainer,
          `expecting emoji picker container to be visible`
        ).toBeVisible();
        await this.clickOnElement(this.emojiPickerContainer.getByRole('button'));
      }
    );
  }

  async deleteMessage(options?: { stepInfo?: string }): Promise<void> {
    await test.step(options?.stepInfo ?? `Deleting the message`, async () => {
      await this.openMessageActions(options);
      await this.clickOnElement(this.messageActionsContainer.getByLabel('delete icon'));
    });
  }

  async openMessageActionsMenuFrom3Dots(options?: { stepInfo?: string }): Promise<void> {
    await test.step(
      options?.stepInfo ?? `Opening the message actions menu from 3 dots`,
      async () => {
        await this.focusedMessageContainer.hover();
        await expect(
          this.threeDotsButtonToOpenMessageActionsMenu,
          `expecting three dots button to be visible`
        ).toBeVisible();
        await this.clickOnElement(this.threeDotsButtonToOpenMessageActionsMenu, { delay: 100 });
      }
    );
  }

  async deleteMessageFromMessageActionsMenu(options?: { stepInfo?: string }): Promise<void> {
    await test.step(
      options?.stepInfo ?? `Deleting the message from the message actions menu`,
      async () => {
        await this.openMessageActionsMenuFrom3Dots(options);
        await this.clickOnElement(this.deleteMessageButtonFromMessageActionsMenu);
      }
    );
  }

  /**
   * Opens the reply thread
   * @param options - optional parameters
   * @param options.stepInfo - the step info for the wait
   */
  async openReplyThread(options?: { stepInfo?: string }): Promise<MessageReplyThreadComponent> {
    await test.step(options?.stepInfo ?? `Opening the reply thread`, async () => {
      /**
       * Note: It could happen that the hover actions get nullified if there is a scroll happening in the page.
       * and that happens when the user is typing notification disappears
       * so to handle that we are retrying the action
       */
      try {
        await this.openMessageActionsMenuFrom3Dots();
        await expect(
          this.replyInThreadButton,
          `expecting reply in thread button to be visible`
        ).toBeVisible({ timeout: 3_000 });
        await this.clickOnElement(this.replyInThreadButton);
      } catch (error) {
        console.log(`Retrying to open the reply thread to add more resilience`);
        await this.openMessageActionsMenuFrom3Dots();
        await this.clickOnElement(this.replyInThreadButton);
      }
    });
    return new MessageReplyThreadComponent(this.page, this.replyThreadComponentContainer);
  }
}
