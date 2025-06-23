import { BaseComponent } from '@/src/core/components/baseComponent';
import { expect, Locator, Page, test } from '@playwright/test';
import fs from 'fs';
import { RecordVideoPromptComponent } from '@chat/components/recordVideoPromptComponent';
import { RecordAudioPromptComponent } from '@chat/components/recordAudioPromptComponent';

export class ChatEditorComponent extends BaseComponent {
  readonly inputTextBox: Locator;
  readonly sendMessageButton: Locator;
  //toolbar buttons
  readonly toolbarContainer: Locator;
  readonly boldButton: Locator;

  //actions buttons
  readonly addMediaAttachmentButton: Locator;
  readonly recordAudioButton: Locator;
  readonly recordVideoButton: Locator;

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

    //action buttons on editor footer
    this.addMediaAttachmentButton = this.chatEditorComponentContainer.getByLabel('Choose files');
    this.recordAudioButton = this.chatEditorComponentContainer.getByLabel('Record audio');
    this.recordVideoButton = this.chatEditorComponentContainer.getByLabel('Record video');

    //attachements
    this.attachementsContainer = this.chatEditorComponentContainer.locator("[class*='Attachment_attachmentRoot']");
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
      await this.clickOnElement(this.sendMessageButton);
    });
  }

  /**
   * Adds a media attachment to the chat
   * @param filePath - The path to the media file
   */
  async addMediaAttachment(
    filePath: string,
    options?: {
      stepInfo?: string;
    }
  ): Promise<void> {
    await test.step(options?.stepInfo ?? `Adding media attachment: ${filePath}`, async () => {
      //first check if file exists at given path
      if (fs.existsSync(filePath)) {
        await this.addMediaAttachmentButton.setInputFiles(filePath);
      } else {
        throw new Error(`File does not exist at path: ${filePath}`);
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
}
