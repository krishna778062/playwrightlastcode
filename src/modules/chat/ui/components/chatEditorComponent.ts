import { Locator, Page, test } from '@playwright/test';

import { RecordAudioPromptComponent } from '@chat/ui/components/recordAudioPromptComponent';
import { RecordVideoPromptComponent } from '@chat/ui/components/recordVideoPromptComponent';

import { BaseComponent } from '@/src/core/ui/components/baseComponent';

export interface FormattingOptions {
  usesBold?: boolean;
  usesItalic?: boolean;
  usesUnderline?: boolean;
  usesStrikethrough?: boolean;
  usesBulletList?: boolean;
  usesOrderList?: boolean;
}

export class ChatEditorComponent extends BaseComponent {
  readonly inputTextBox: Locator;
  readonly sendMessageButton: Locator;
  //toolbar buttons
  readonly toolbarContainer: Locator;
  readonly boldButton: Locator;
  readonly italicButton: Locator;
  readonly underlineButton: Locator;
  readonly strikethroughButton: Locator;
  readonly bulletListButton: Locator;
  readonly orderListButton: Locator;
  readonly emojiButton: Locator;
  readonly linkButton: Locator;
  readonly linkTextBox: Locator;
  readonly linkTextfield: Locator;
  readonly linkUrlfield: Locator;
  readonly linkUrlBox: Locator;
  readonly insertButton: Locator;
  readonly linkErrorMessage: Locator;
  readonly textErrorMessage: Locator;

  //emoji picker
  readonly emojiPickerContainer: Locator;
  readonly emojiSearchInput: Locator;
  readonly emojiSearchResults: Locator;

  //actions buttons
  readonly addMediaAttachmentButton: Locator;
  readonly recordAudioButton: Locator;
  readonly recordVideoButton: Locator;
  readonly deleteAttachmentButton: Locator;

  //attachements
  readonly attachementsContainer: Locator;

  constructor(
    page: Page,
    protected readonly chatEditorComponentContainer: Locator
  ) {
    super(page);
    this.chatEditorComponentContainer = chatEditorComponentContainer;
    this.inputTextBox = this.chatEditorComponentContainer.getByRole('textbox', {
      name: 'You are in the content editor',
    });
    this.sendMessageButton = this.chatEditorComponentContainer.getByLabel('Send message');

    //toolbar container
    this.toolbarContainer = this.chatEditorComponentContainer.locator("[class*='_toolbarWrapper_']");
    //toolbar buttons
    this.boldButton = this.toolbarContainer.getByLabel('Bold');
    this.italicButton = this.toolbarContainer.getByLabel('Italic');
    this.underlineButton = this.toolbarContainer.getByLabel('Underline');
    this.strikethroughButton = this.toolbarContainer.getByLabel('Strikethrough');
    this.bulletListButton = this.toolbarContainer.getByLabel('Bulleted list');
    this.orderListButton = this.toolbarContainer.getByLabel('Ordered list');
    this.emojiButton = this.toolbarContainer.getByLabel('Emoji');
    this.linkButton = this.toolbarContainer.getByLabel('Open Insert link options');
    this.linkTextBox = this.page.locator('#text');
    this.linkUrlBox = this.page.locator('#url');

    this.linkTextfield = this.page.getByTestId('field-Text');
    this.linkUrlfield = this.page.getByTestId('field-Link');

    this.linkErrorMessage = this.page.getByText('Please enter a valid link');
    this.textErrorMessage = this.page.getByText('Please fill out this field');

    this.insertButton = this.page.locator('button[type="submit"]');

    //emoji picker
    this.emojiPickerContainer = this.page.locator('[aria-label="Choose an Emoji"]');
    this.emojiSearchInput = this.page.locator('input[placeholder="Search for an emoji…"]');
    this.emojiSearchResults = this.page.locator(`//div[contains(@class,'emojiPicker')]//button`);

    //action buttons on editor footer
    this.addMediaAttachmentButton = this.chatEditorComponentContainer.getByLabel('Choose files');
    this.recordAudioButton = this.chatEditorComponentContainer.getByLabel('Record audio');
    this.recordVideoButton = this.chatEditorComponentContainer.getByLabel('Record video');

    //attachements
    this.attachementsContainer = this.chatEditorComponentContainer.locator("[class*='Attachment_attachmentRoot']");
    this.deleteAttachmentButton = this.attachementsContainer.getByTestId('delete-button');
  }

  /**
   * Sends a message to the chat
   * @param message - The message to send
   */
  async sendMessage(
    message: string,
    options?: {
      stepInfo?: string;
    }
  ): Promise<void> {
    await test.step(options?.stepInfo ?? `Sending message: ${message}`, async () => {
      await this.fillInElement(this.inputTextBox, message);
      await this.clickOnSendMessageButton();
    });
  }

  /**
   * Sends a formatted message to the chat
   * @param message - The message to send
   * @param formattingOptions - The formatting options to apply
   * @param options - Additional options for the step
   */
  async sendFormattedMessage(
    message: string,
    formattingOptions: FormattingOptions,
    options?: {
      stepInfo?: string;
    }
  ): Promise<void> {
    const stepInfo = options?.stepInfo ?? `Sending formatted message: ${message}`;
    await test.step(stepInfo, async () => {
      // Apply formatting first
      await this.applyFormatting(formattingOptions, {
        stepInfo: 'Applying text formatting',
      });

      // Fill the message
      await this.fillInElement(this.inputTextBox, message);

      // Send the message
      await this.clickOnSendMessageButton();
    });
  }

  async appendMessage(message: string, options?: { stepInfo?: string }): Promise<void> {
    await test.step(options?.stepInfo ?? `Appending to existing message: ${message}`, async () => {
      await this.inputTextBox.pressSequentially(message);
    });
  }

  async clickOnSendMessageButton(options?: { stepInfo?: string; timeout?: number }): Promise<void> {
    await test.step(options?.stepInfo ?? `Clicking on send message button`, async () => {
      await this.clickOnElement(this.sendMessageButton, {
        timeout: options?.timeout ?? 10_000,
      });
    });
  }

  /**
   * Adds a media attachment to the chat
   * @param filePath - The path to the media file
   * @param options - The options to pass to the function
   * @param options.stepInfo - The step info to pass to the function
   * @param options.attachementRequestTimeout - The timeout for the attachement request api call
   *
   * Note: This function will wait for the attachement request api call to complete and then return
   */
  async addMediaAttachment(
    filePath: string,
    options?: {
      stepInfo?: string;
      attachementRequestTimeout?: number;
      waitForAttachementRequestToComplete?: boolean;
    }
  ): Promise<void> {
    await test.step(options?.stepInfo ?? `Adding media attachment: ${filePath}`, async () => {
      const waitForAttachementRequestToComplete = options?.waitForAttachementRequestToComplete ?? true;
      if (waitForAttachementRequestToComplete) {
        await this.performActionAndWaitForRequest(
          () => this.addInputFiles(this.addMediaAttachmentButton, filePath),
          request => request.url().includes('attachments') && request.method() === 'POST',
          {
            timeout: options?.attachementRequestTimeout ?? 40_000,
            stepInfo: 'Clicking on add media attachment button should add the media file to the chat',
          }
        );
      } else {
        await this.addInputFiles(this.addMediaAttachmentButton, filePath);
      }
    });
  }

  /**
   * Clicks on the record video option
   * which opens the record video prompt component
   */
  async clickOnRecordVideoOption(options?: { stepInfo?: string }): Promise<RecordVideoPromptComponent> {
    let recordVideoPromptComponent: RecordVideoPromptComponent;
    await test.step(options?.stepInfo ?? `Clicking on record video option`, async () => {
      await this.clickOnElement(this.recordVideoButton);
      recordVideoPromptComponent = new RecordVideoPromptComponent(this.page);
      await recordVideoPromptComponent.verifyTheComponentIsVisible();
    });
    return recordVideoPromptComponent!;
  }

  async clickOnRecordAudioOption(options?: { stepInfo?: string }): Promise<RecordAudioPromptComponent> {
    let recordAudioPromptComponent: RecordAudioPromptComponent;
    await test.step(options?.stepInfo ?? `Clicking on record audio option`, async () => {
      await this.clickOnElement(this.recordAudioButton);
      recordAudioPromptComponent = new RecordAudioPromptComponent(this.page);
      await recordAudioPromptComponent.verifyTheComponentIsVisible();
    });
    return recordAudioPromptComponent!;
  }

  /**
   * Verifies that the video is visible as attachement in the chat editor
   */
  async verifyTheVideoIsVisibleAsAttachementInTheChatEditor(options?: { stepInfo?: string }): Promise<void> {
    await test.step(
      options?.stepInfo ?? `Verifying that the video is visible as attachement in the chat editor`,
      async () => {
        //verify that the attachments container has video in it
        await this.verifier.verifyTheElementIsVisible(this.attachementsContainer);
        //get the attachements container text
        const videoAttachment = this.attachementsContainer.locator('video');
        //verify that the video attachment is visible
        await this.verifier.verifyTheElementIsVisible(videoAttachment);
        //verify that the video attachment has the correct src
      }
    );
  }

  /**
   * Verifies that the attachment is not visible
   * @param options - The options to pass to the function
   * @param options.stepInfo - The step info to pass to the function
   */
  async verifyTheAttachmentIsNotVisible(options?: { stepInfo?: string; timeout?: number }): Promise<void> {
    await test.step(options?.stepInfo ?? `Verifying that the attachment is not visible`, async () => {
      await this.verifier.verifyTheElementIsNotVisible(this.attachementsContainer, {
        assertionMessage: 'expecting attachements container to be not visible',
        timeout: options?.timeout ?? 10_000,
      });
    });
  }

  /**
   * Verifies that the attachment has been added to the chat editor
   * @param options - The options to pass to the function
   * @param options.stepInfo - The step info to pass to the function
   */
  async verifyAttachementHasAddedToChatEditor(options?: { stepInfo?: string }): Promise<void> {
    await test.step(
      options?.stepInfo ?? `Verifying that the attachment has been added to the chat editor`,
      async () => {
        await this.verifier.verifyTheElementIsVisible(this.attachementsContainer, {
          assertionMessage: 'expecting attachements container to be visible',
        });
      }
    );
  }

  /**
   * Deletes the attachment from the chat editor
   * @param attachmentIndex - The index of the attachment to delete
   * @param options - The options to pass to the function
   * @param options.stepInfo - The step info to pass to the function
   */
  async deleteAttachementFromChatEditor(attachmentIndex: number = 0, options?: { stepInfo?: string }): Promise<void> {
    await test.step(options?.stepInfo ?? `Deleting the attachment from the chat editor`, async () => {
      await this.clickOnElement(this.deleteAttachmentButton.nth(attachmentIndex));
    });
  }

  async verifyTheAudioIsVisibleAsAttachementInTheChatEditor(options?: { stepInfo?: string }): Promise<void> {
    await test.step(
      options?.stepInfo ?? `Verifying that the audio is visible as attachement in the chat editor`,
      async () => {
        await this.verifier.verifyTheElementIsVisible(this.attachementsContainer, {
          assertionMessage: 'expecting attachements container to be visible',
        });
        //get the attachements container text
        const audioAttachment = this.attachementsContainer.locator("[class*='Attachments_audioContainer']").first();
        //verify that the audio attachment is visible
        await this.verifier.verifyTheElementIsVisible(audioAttachment, {
          assertionMessage: 'expecting audio attachment to be visible',
        });
      }
    );
  }

  /**
   * Sends a message by first writing text, then selecting it and applying formatting
   * @param message - The message to send
   * @param formattingOptions - The formatting options to apply
   * @param options - Additional options for the step
   */
  async sendMessageWithSelectAndFormat(
    message: string,
    formattingOptions: FormattingOptions,
    options?: {
      stepInfo?: string;
    }
  ): Promise<void> {
    const stepInfo = options?.stepInfo ?? `Sending message with select-then-format: ${message}`;
    await test.step(stepInfo, async () => {
      // First, fill the message
      await this.fillInElement(this.inputTextBox, message);

      // Select all text in the input
      await this.inputTextBox.selectText();

      // Apply formatting to the selected text
      await this.applyFormatting(formattingOptions, {
        stepInfo: 'Applying formatting to selected text',
      });

      await this.inputTextBox.click();

      // Send the message
      await this.clickOnSendMessageButton();
    });
  }

  async verifyInsertLinkErrorMessages(errorType: string): Promise<void> {
    if (errorType === 'link') {
      await this.verifier.verifyTheElementIsVisible(this.linkErrorMessage, {
        assertionMessage: 'Please enter a valid link',
      });
    } else if (errorType === 'text') {
      await this.verifier.verifyTheElementIsVisible(this.textErrorMessage, {
        assertionMessage: 'Please fill out this field',
      });
    }
  }

  /**
   * Selects emojis from the emoji picker
   * @param emojiCount - Number of emojis to select sequentially
   */
  async selectEmojisFromPicker(emojiCount: number): Promise<void> {
    await test.step(`Selecting ${emojiCount} emojis from picker`, async () => {
      for (let i = 1; i <= emojiCount; i++) {
        await this.clickOnElement(this.emojiButton);
        await this.verifier.verifyTheElementIsVisible(this.emojiPickerContainer);

        const emojiButtons = this.emojiPickerContainer.locator(
          `//div[@aria-label='People section' or @aria-label='']/..//button[${i}]`
        );
        await emojiButtons.click();

        await this.verifier.verifyTheElementIsNotVisible(this.emojiPickerContainer);
      }
    });
  }

  /**
   * Applies formatting options to the chat editor
   * @param formattingOptions - The formatting options to apply
   * @param options - Additional options for the step
   */
  async applyFormatting(
    formattingOptions: FormattingOptions,
    options?: {
      stepInfo?: string;
    }
  ): Promise<void> {
    await test.step(options?.stepInfo ?? 'Applying text formatting', async () => {
      const formattingActions = [
        { condition: formattingOptions.usesBold, action: () => this.clickOnElement(this.boldButton) },
        { condition: formattingOptions.usesItalic, action: () => this.clickOnElement(this.italicButton) },
        { condition: formattingOptions.usesUnderline, action: () => this.clickOnElement(this.underlineButton) },
        { condition: formattingOptions.usesStrikethrough, action: () => this.clickOnElement(this.strikethroughButton) },
        { condition: formattingOptions.usesBulletList, action: () => this.clickOnElement(this.bulletListButton) },
        { condition: formattingOptions.usesOrderList, action: () => this.clickOnElement(this.orderListButton) },
      ];

      for (const { condition, action } of formattingActions) {
        switch (condition) {
          case true:
            await action();
            break;
          case false:
          default:
            // No action needed
            break;
        }
      }
    });
  }
}
