import { BaseComponent } from '@/src/core/components/baseComponent';
import { expect, Locator, Page, test } from '@playwright/test';

export class RecordAudioPromptComponent extends BaseComponent {
  readonly recordAudioContainer: Locator;
  readonly cancelButton: Locator;
  readonly stopAudioRecordingButton: Locator;
  readonly audioRecordingProgressBar: Locator;
  readonly audioRecordingDuration: Locator;
  constructor(page: Page) {
    super(page);
    this.recordAudioContainer = this.page.locator("[class*='RecordAudio_wrapper']");
    this.cancelButton = this.recordAudioContainer.getByLabel('Cancel');
    this.stopAudioRecordingButton = this.recordAudioContainer.getByRole('button', { name: 'Done' });
    this.audioRecordingProgressBar = this.recordAudioContainer.locator(
      "div[class*='RecordAudio_visualizer__LaUAT']"
    );
    this.audioRecordingDuration = this.recordAudioContainer.locator(
      "div[class*='RecordAudio_visualizer__LaUAT'] + p"
    );
  }

  async verifyTheComponentIsVisible(): Promise<void> {
    await test.step(`Verifying that the record audio prompt component is visible`, async () => {
      await expect(
        this.recordAudioContainer,
        `expecting record audio prompt component to be visible`
      ).toBeVisible();
    });
  }

  async verifyTheAudioRecordingIsInProgress(): Promise<void> {
    await test.step(`Verifying that the audio recording is in progress`, async () => {
      await expect(
        this.recordAudioContainer,
        `expecting record audio container to be visible`
      ).toBeVisible();
    });
  }

  /**
   * Gets the audio recording duration
   * @returns the audio recording duration
   */
  async getTheAudioRecordingDuration(): Promise<string> {
    let audioRecordingDuration: string | null = null;
    await test.step(`Getting the audio recording duration`, async () => {
      audioRecordingDuration = await this.audioRecordingDuration.textContent();
      if (audioRecordingDuration == null) {
        throw new Error(`Audio recording duration is not visible`);
      }
    });
    return audioRecordingDuration!;
  }

  /**
   * Verifies that the audio recording is not in progress
   */
  async verifyTheAudioRecordingIsNotInProgress(): Promise<void> {
    await test.step(`Verifying that the audio recording is not in progress`, async () => {
      await expect(
        this.stopAudioRecordingButton,
        `expecting stop audio recording button to not be visible`
      ).not.toBeVisible();
    });
  }

  async completeTheAudioRecording(): Promise<void> {
    await test.step(`Completing the audio recording`, async () => {
      await this.stopAudioRecordingButton.click();
    });
  }

  async recordAudioAndAddItToTheChat(options?: { stepInfo?: string }): Promise<void> {
    await test.step(options?.stepInfo ?? `Recording audio and adding it to the chat`, async () => {
      await this.verifyTheAudioRecordingIsInProgress();
      //wait for 2 seconds to get the audio recorded
      await this.page.waitForTimeout(2_000);

      //when we click on done button, there will be a request to upload video we will wait for that request
      const uploadAudioRequestPromise = this.page.waitForRequest(
        request => request.url().includes('attachments') && request.method() === 'POST'
      );
      await this.completeTheAudioRecording();
      await uploadAudioRequestPromise;
      await this.verifyTheAudioRecordingIsNotInProgress();
    });
  }
}
