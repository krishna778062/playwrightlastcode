import { expect, Locator, Page, test } from '@playwright/test';
import { MessageEmojis } from '@core/constants/messageEmojis';
import { BaseComponent } from './baseComponent';

export class MessageBaseComponent extends BaseComponent {
  readonly messageContainer: Locator;
  readonly messageActionsContainer: Locator;
  readonly emojiPickerButton: Locator;
  readonly emojiPickerContainer: Locator;
  readonly emojiPickerEmojisGroupsContainer: Locator;
  readonly threeDotsButtonToOpenMessageActionsMenu: Locator;
  readonly deleteMessageButtonFromMessageActionsMenu: Locator;

  constructor(page: Page, messageContainer: Locator) {
    super(page);
    this.messageContainer = messageContainer;
    this.messageActionsContainer = this.messageContainer.getByTestId('message-action-root');
    this.emojiPickerButton = this.messageActionsContainer.getByLabel('addEmoji icon');
    this.emojiPickerContainer = this.page.locator("[class*='EmojiPicker_root']").first();
    this.emojiPickerEmojisGroupsContainer = this.emojiPickerContainer.locator(
      "[EmojiPicker_emojiGroupWrapper']"
    );
    this.threeDotsButtonToOpenMessageActionsMenu =
      this.messageContainer.getByTestId('message-action-trigger');
    this.deleteMessageButtonFromMessageActionsMenu = this.page.getByTestId('deleteMessageButton');
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
        await this.messageActionsContainer.getByLabel(reaction).click();
      } catch (error) {
        console.log(`Retrying to react on message to add more resilience`);
        const messageActionsContainerCoordinates = await this.messageContainer.boundingBox();
        const messageContainerCentre = {
          x:
            (messageActionsContainerCoordinates?.x ?? 0) +
            (messageActionsContainerCoordinates?.width ?? 0) / 2,
          y:
            (messageActionsContainerCoordinates?.y ?? 0) +
            (messageActionsContainerCoordinates?.height ?? 0) / 2,
        };
        await this.page.mouse.move(messageContainerCentre.x, messageContainerCentre.y);
        //expect the message actions container to be visible
        await expect(
          this.messageActionsContainer,
          `expecting message actions container to be visible after clicking on the reaction`
        ).toBeVisible();
        await this.messageActionsContainer.getByLabel(reaction).click();
      }
    });
  }

  async openMessageActions(options?: { stepInfo?: string }): Promise<void> {
    await test.step(options?.stepInfo ?? `Opening the message actions`, async () => {
      await this.messageContainer.hover();
      await expect(
        this.messageActionsContainer,
        `expecting message actions container to be visible`
      ).toBeVisible();
    });
  }

  async openEmojiPicker(): Promise<void> {
    await test.step(`Opening the emoji picker`, async () => {
      await this.openMessageActions();
      await this.emojiPickerButton.click();
    });
  }

  async pickAnyRandomEmojiFromEmojiPicker(): Promise<void> {
    await test.step(`Picking any random emoji from the emoji picker`, async () => {
      await expect(
        this.emojiPickerContainer,
        `expecting emoji picker container to be visible`
      ).toBeVisible();
      await this.emojiPickerContainer.getByRole('button').click();
    });
  }

  async deleteMessage(): Promise<void> {
    await test.step(`Deleting the message`, async () => {
      await this.openMessageActions();
      await this.messageActionsContainer.getByLabel('delete icon').click();
    });
  }

  async openMessageActionsMenuFrom3Dots(): Promise<void> {
    await test.step(`Opening the message actions menu from 3 dots`, async () => {
      await this.messageContainer.hover();
      await this.threeDotsButtonToOpenMessageActionsMenu.click();
    });
  }

  async deleteMessageFromMessageActionsMenu(): Promise<void> {
    await test.step(`Deleting the message from the message actions menu`, async () => {
      await this.openMessageActionsMenuFrom3Dots();
      await this.deleteMessageButtonFromMessageActionsMenu.click();
    });
  }
}
