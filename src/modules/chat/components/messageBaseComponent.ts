import { expect, Locator, Page, test } from '@playwright/test';

import { MessageEmojis } from '@core/constants/messageEmojis';

import { BaseComponent } from '@/src/core/components/baseComponent';

export class MessageBaseComponent extends BaseComponent {
  readonly messageContainer: Locator;
  readonly messageActionsContainer: Locator;
  readonly emojiPickerButton: Locator;
  readonly emojiPickerContainer: Locator;
  readonly emojiPickerEmojisGroupsContainer: Locator;
  readonly threeDotsButtonToOpenMessageActionsMenu: Locator;
  readonly deleteMessageButtonFromMessageActionsMenu: Locator;
  readonly deleteMessageConfirmationPrompt: Locator;
  readonly deleteButtonOnDeleteMessageConfirmationPrompt: Locator;

  constructor(page: Page, messageContainer: Locator) {
    super(page, messageContainer);
    this.messageContainer = messageContainer;
    this.messageActionsContainer = this.messageContainer.getByTestId('message-action-root');
    this.emojiPickerButton = this.messageActionsContainer.getByLabel('addEmoji icon');
    this.emojiPickerContainer = this.page.locator("[class*='EmojiPicker_root']").first();
    this.emojiPickerEmojisGroupsContainer = this.emojiPickerContainer.locator("[EmojiPicker_emojiGroupWrapper']");
    this.threeDotsButtonToOpenMessageActionsMenu = this.messageContainer
      .getByTestId('message-action-trigger')
      .filter({ visible: true });
    this.deleteMessageButtonFromMessageActionsMenu = this.page.getByTestId('deleteMessageButton');
    this.deleteMessageConfirmationPrompt = this.page
      .locator("[role='dialog']")
      .filter({ hasText: 'This action cannot be undone' });
    this.deleteButtonOnDeleteMessageConfirmationPrompt =
      this.deleteMessageConfirmationPrompt.getByTestId('delete-message-button');
  }

  async getMessageText(): Promise<string | null> {
    let messageText: string | null = null;
    await test.step(`Getting the text of the message`, async () => {
      messageText = await this.messageContainer.locator('section').locator('p').textContent();
    });
    return messageText;
  }

  async reactOnMessage(
    reaction: MessageEmojis,
    options?: {
      stepInfo?: string;
    }
  ): Promise<void> {
    /**
     * Note: It could happen that the hover actions get nullified if there is a scroll happening in the page.
     * and that happens when the user is typing notification disappears
     * so to handle that we are retrying the action
     */
    await test.step(options?.stepInfo ?? `React on message: ${reaction}`, async () => {
      try {
        await this.openMessageActions({
          stepInfo: `${options?.stepInfo} - Opening Message Actions`,
        });
        await this.clickOnElement(this.messageActionsContainer.getByLabel(reaction));
      } catch (error) {
        console.log(`Retrying to react on message to add more resilience`);
        const messageActionsContainerCoordinates = await this.messageContainer.boundingBox();
        const messageContainerCentre = {
          x: (messageActionsContainerCoordinates?.x ?? 0) + (messageActionsContainerCoordinates?.width ?? 0) / 2,
          y: (messageActionsContainerCoordinates?.y ?? 0) + (messageActionsContainerCoordinates?.height ?? 0) / 2,
        };
        await this.page.mouse.move(messageContainerCentre.x, messageContainerCentre.y);
        //expect the message actions container to be visible
        await this.verifier.verifyTheElementIsVisible(this.messageActionsContainer, {
          assertionMessage: 'expecting message actions container to be visible after clicking on the reaction',
        });
        await this.clickOnElement(this.messageActionsContainer.getByLabel(reaction));
      }
    });
  }

  async openMessageActions(options?: { stepInfo?: string }): Promise<void> {
    await test.step(options?.stepInfo ?? `Opening the message actions`, async () => {
      await this.messageContainer.hover();
      await this.verifier.verifyTheElementIsVisible(this.messageActionsContainer, {
        assertionMessage: 'expecting message actions container to be visible',
      });
    });
  }

  async openEmojiPicker(): Promise<void> {
    await test.step(`Opening the emoji picker`, async () => {
      await this.openMessageActions();
      await this.clickOnElement(this.emojiPickerButton);
    });
  }

  async pickAnyRandomEmojiFromEmojiPicker(): Promise<void> {
    await test.step(`Picking any random emoji from the emoji picker`, async () => {
      await this.verifier.verifyTheElementIsVisible(this.emojiPickerContainer, {
        assertionMessage: 'expecting emoji picker container to be visible',
      });
      await this.clickOnElement(this.emojiPickerContainer.getByRole('button'));
    });
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

  async openMessageActionsMenuFrom3Dots(): Promise<void> {
    await test.step(`Opening the message actions menu from 3 dots`, async () => {
      await this.messageContainer.hover();
      await this.clickOnElement(this.threeDotsButtonToOpenMessageActionsMenu);
    });
  }

  async openMessageActionsMenuFromThreeDots(): Promise<void> {
    await test.step(`Opening the message actions menu from 3 dots`, async () => {
      try {
        await this.messageContainer.hover();
        await this.clickOnElement(this.threeDotsButtonToOpenMessageActionsMenu, { timeout: 5_000, delay: 500 });
        await this.verifier.verifyTheElementIsVisible(this.deleteMessageButtonFromMessageActionsMenu, {
          assertionMessage: 'expecting message actions container to be visible after clicking on the reaction',
        });
      } catch (error) {
        console.log(`Retrying to open message actions menu from 3 dots to add more resilience`);
        await this.messageContainer.hover();
        await this.clickOnElement(this.threeDotsButtonToOpenMessageActionsMenu, {
          timeout: 5_000,
          delay: 500,
          force: true,
        });
      }
    });
  }
}
