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
  readonly deleteMessageConfirmationPrompt: Locator;
  readonly deleteButtonOnDeleteMessageConfirmationPrompt: Locator;

  constructor(page: Page, focusedMessageContainer: Locator) {
    super(page, focusedMessageContainer);
    this.focusedMessageContainer = focusedMessageContainer;
    this.messageActionsContainer = this.focusedMessageContainer.getByTestId('message-action-root');
    this.emojiPickerButton = this.messageActionsContainer.getByLabel('addEmoji icon');
    this.emojiPickerContainer = this.page.locator("[class*='EmojiPicker_root']").first();
    this.emojiPickerEmojisGroupsContainer = this.emojiPickerContainer.locator("[EmojiPicker_emojiGroupWrapper']");
    this.threeDotsButtonToOpenMessageActionsMenu = this.focusedMessageContainer.getByTestId('message-action-trigger');
    this.deleteMessageButtonFromMessageActionsMenu = this.page
      .getByTestId('deleteMessageButton')
      .filter({ visible: true });
    this.replyInThreadButton = this.page.getByTestId('replyInThreadButton');
    this.replyThreadComponentContainer = this.page.locator("[data-variant='thread'][class*='styles_root_']");
    this.deleteMessageButtonFromMessageActionsMenu = this.page.getByTestId('deleteMessageButton');
    this.deleteMessageConfirmationPrompt = this.page
      .locator("[role='dialog']")
      .filter({ hasText: 'This action cannot be undone' });
    this.deleteButtonOnDeleteMessageConfirmationPrompt =
      this.deleteMessageConfirmationPrompt.getByTestId('delete-message-button');
  }

  /**
   * Gets the text of the message
   * @returns The text of the message
   */
  async getMessageText(options?: { stepInfo?: string }): Promise<string | null> {
    let messageText: string | null = null;
    await test.step(options?.stepInfo ?? `Getting the text of the message`, async () => {
      messageText = await this.focusedMessageContainer.locator('section').locator('p').textContent();
    });
    return messageText;
  }

  async deleteMessage(): Promise<void> {
    await test.step(`Deleting the message`, async () => {
      await this.openMessageActionsMenuFromThreeDots();
      await this.clickOnElement(this.deleteMessageButtonFromMessageActionsMenu);
      await this.verifier.verifyTheElementIsVisible(this.deleteMessageConfirmationPrompt, {
        assertionMessage: 'expecting delete message confirmation prompt to be visible',
      });
      await this.clickOnElement(this.deleteButtonOnDeleteMessageConfirmationPrompt);
    });
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
      await this.verifier.verifyTheElementIsVisible(this.messageActionsContainer, {
        assertionMessage: 'expecting message actions container to be visible',
      });
    });
  }

  async openEmojiPicker(options?: { stepInfo?: string }): Promise<void> {
    await test.step(options?.stepInfo ?? `Opening the emoji picker`, async () => {
      await this.openMessageActions(options);
      await this.clickOnElement(this.emojiPickerButton);
    });
  }

  async pickAnyRandomEmojiFromEmojiPicker(options?: { stepInfo?: string }): Promise<void> {
    await test.step(options?.stepInfo ?? `Picking any random emoji from the emoji picker`, async () => {
      await this.verifier.verifyTheElementIsVisible(this.emojiPickerContainer, {
        assertionMessage: 'expecting emoji picker container to be visible',
      });
      await this.clickOnElement(this.emojiPickerContainer.getByRole('button'));
    });
  }

  async openMessageActionsMenuFrom3Dots(options?: { stepInfo?: string }): Promise<void> {
    await test.step(options?.stepInfo ?? `Opening the message actions menu from 3 dots`, async () => {
      await this.focusedMessageContainer.hover();
      if (await this.verifier.isTheElementVisible(this.threeDotsButtonToOpenMessageActionsMenu)) {
        await this.clickOnElement(this.threeDotsButtonToOpenMessageActionsMenu, { delay: 100 });
      } else {
        await this.focusedMessageContainer.hover();
        await this.clickOnElement(this.threeDotsButtonToOpenMessageActionsMenu, { delay: 100 });
      }
    });
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
        await this.verifier.verifyTheElementIsVisible(this.replyInThreadButton, {
          assertionMessage: 'expecting reply in thread button to be visible',
          timeout: 3_000,
        });
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
