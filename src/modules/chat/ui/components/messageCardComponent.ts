import { Locator, Page, test } from '@playwright/test';

import { MessageBaseComponent } from '@chat/ui/components/messageBaseComponent';
import { MessageReplyThreadComponent } from '@chat/ui/components/messageReplyThreadComponent';
import { MessageEmojis } from '@core/constants/messageEmojis';

export class MessageCardComponent extends MessageBaseComponent {
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
  readonly editMessageButtonFromMessageActionsMenu: Locator;
  readonly updateMessageButtonFromMessageActionsMenu: Locator;
  readonly cancelMessageButtonFromMessageEditBox: Locator;
  readonly pinMessageButtonFromMessageActionsMenu: Locator;
  readonly pinnedToastMessage: Locator;
  readonly unPinMessageButtonFromMessageActionsMenu: Locator;
  readonly unPinMessageConfirmationPrompt: Locator;
  readonly unPinnedToastMessage: Locator;
  readonly getPinnedMessage: (message: string) => Locator;

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
    this.editMessageButtonFromMessageActionsMenu = this.page.getByTestId('editMessageButton');
    this.updateMessageButtonFromMessageActionsMenu = this.page.getByTestId('editUpdateButton');
    this.cancelMessageButtonFromMessageEditBox = this.page.getByTestId('editCancelButton');
    this.pinMessageButtonFromMessageActionsMenu = this.page.getByTestId('pinMessageButton');
    this.pinnedToastMessage = this.page.locator("(//div[@role='alert']//p[text()='Message pinned'])[1]");
    this.unPinMessageButtonFromMessageActionsMenu = this.page.getByTestId('unpinMessageButton');
    this.unPinMessageConfirmationPrompt = this.page.getByTestId('unpin-message-button');
    this.unPinnedToastMessage = this.page.locator("(//div[@role='alert']//p[text()='Message un-pinned'])[1]");
    this.getPinnedMessage = (message: string) =>
      this.page.locator("//div[@class='Base_pinnedMessage__8q6MM']").locator(`//p[text()='${message}']`);
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
      await this.clickByInjectingJavaScript(this.deleteMessageButtonFromMessageActionsMenu);
      await this.verifier.verifyTheElementIsVisible(this.deleteMessageConfirmationPrompt, {
        assertionMessage: 'expecting delete message confirmation prompt to be visible',
      });
      await this.clickOnElement(this.deleteButtonOnDeleteMessageConfirmationPrompt);
    });
  }

  async unPinMessageFromPinnedMessage(): Promise<void> {
    await test.step(`Deleting the message`, async () => {
      await this.openMessageActionsMenuFromThreeDots();
      await this.clickOnElement(this.unPinMessageButtonFromMessageActionsMenu);
      await this.clickOnElement(this.unPinMessageConfirmationPrompt);
      await this.verifier.verifyTheElementIsVisible(this.unPinnedToastMessage, {
        assertionMessage: 'expecting unpinned toast message to be visible',
      });
    });
  }

  async verifyMessageActionsNotVisibleToUser(): Promise<void> {
    await test.step(`Verifying message actions are not visible`, async () => {
      await this.messageContainer.hover();
      await this.verifier.verifyTheElementIsNotVisible(this.messageActionsContainer, {
        assertionMessage: 'expecting message actions container to be not visible',
      });
      await this.verifier.verifyTheElementIsNotVisible(this.emojiPickerButton, {
        assertionMessage: 'expecting emoji picker button to be not visible',
      });
      await this.verifier.verifyTheElementIsNotVisible(this.threeDotsButtonToOpenMessageActionsMenu, {
        assertionMessage: 'expecting three dots button to be not visible',
      });
    });
  }

  async verifyEditMessageOptionNotVisibleToUser(): Promise<void> {
    await test.step(`Verifying edit message option is not visible`, async () => {
      await this.verifier.verifyTheElementIsVisible(this.messageContainer, {
        assertionMessage: 'expecting message container to be visible',
      });
      await this.messageContainer.hover();
      await this.clickOnElement(this.threeDotsButtonToOpenMessageActionsMenu);
      await this.verifier.verifyTheElementIsNotVisible(this.editMessageButtonFromMessageActionsMenu, {
        assertionMessage: 'expecting edit message button to be not visible',
      });
      await this.verifier.verifyTheElementIsVisible(this.replyInThreadButton);
    });
  }

  async verifyMessageActionsIsVisibleToUser(): Promise<void> {
    await test.step(`Verifying message actions are not visible`, async () => {
      await this.messageContainer.hover();
      await this.verifier.verifyTheElementIsVisible(this.messageActionsContainer, {
        assertionMessage: 'expecting message actions container to be not visible',
      });
      await this.verifier.verifyTheElementIsVisible(this.emojiPickerButton, {
        assertionMessage: 'expecting emoji picker button to be not visible',
      });
      await this.verifier.verifyTheElementIsVisible(this.threeDotsButtonToOpenMessageActionsMenu, {
        assertionMessage: 'expecting three dots button to be not visible',
      });
    });
  }

  async editAndUpdateMessage(message: string, editedMessage: string): Promise<void> {
    await test.step(`Editing and updating the message`, async () => {
      await this.messageContainer.hover();
      await this.clickOnElement(this.threeDotsButtonToOpenMessageActionsMenu);
      await this.clickOnElement(this.editMessageButtonFromMessageActionsMenu);
      const messageEditor = this.page.getByLabel(message).getByTestId('tiptap-content');
      await messageEditor.click();
      // Clear and fill with new content
      const contentEditor = this.page.getByLabel(message).getByLabel('You are in the content editor');
      await contentEditor.fill(editedMessage);
      await this.clickOnElement(this.updateMessageButtonFromMessageActionsMenu);
    });
  }

  async editAndCancelMessage(): Promise<void> {
    await test.step(`Editing and updating the message`, async () => {
      await this.messageContainer.hover();
      await this.clickOnElement(this.threeDotsButtonToOpenMessageActionsMenu);
      await this.clickOnElement(this.editMessageButtonFromMessageActionsMenu);
      await this.verifier.verifyTheElementIsVisible(this.cancelMessageButtonFromMessageEditBox, {
        assertionMessage: 'expecting cancel message button to be visible',
      });
      await this.clickOnElement(this.cancelMessageButtonFromMessageEditBox);
    });
  }

  async pinSentMessage(): Promise<void> {
    await test.step(`Pinning the sent message`, async () => {
      await this.openMessageActionsMenuFrom3Dots();
      await this.clickOnElement(this.pinMessageButtonFromMessageActionsMenu);
      await this.verifier.verifyTheElementIsVisible(this.pinnedToastMessage, {
        assertionMessage: 'expecting pinned toast message to be visible',
      });
    });
  }
  async verifyPinnedMessageIsVisible(message: string): Promise<void> {
    await test.step(`Verifying the pinned message`, async () => {
      await this.verifier.verifyTheElementIsVisible(this.getPinnedMessage(message), {
        assertionMessage: 'expecting pinned message to be visible',
      });
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

  /**

   * @param attachmentType
   * @param options 
   */
  async openAttachmentForPreview(
    attachmentType: 'image' | 'file' | 'video',
    attachmentIndex: number = 0,
    options?: { stepInfo?: string }
  ): Promise<void> {
    await test.step(options?.stepInfo ?? `Clicking on the attachment for preview`, async () => {
      if (attachmentType === 'image') {
        await this.clickOnElement(this.focusedMessageContainer.getByLabel('Image preview').nth(attachmentIndex));
      } else if (attachmentType === 'file') {
        await this.clickOnElement(
          this.focusedMessageContainer.getByTestId('filePreviewAttachment').nth(attachmentIndex)
        );
      } else if (attachmentType === 'video') {
        await this.clickOnElement(
          this.focusedMessageContainer.getByTestId('messageVideoAttachments').nth(attachmentIndex)
        );
      }
    });
  }
}
