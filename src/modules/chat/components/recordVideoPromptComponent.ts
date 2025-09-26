import { expect, Locator, Page } from '@playwright/test';
import { test } from '@playwright/test';

import { BaseComponent } from '@/src/core/ui/components/baseComponent';

export class RecordVideoPromptComponent extends BaseComponent {
  readonly recordVideoButton: Locator;
  readonly audioButtonInOnState: Locator;
  readonly audioButtonInOffState: Locator;
  readonly videoButtonInOnState: Locator;
  readonly videoButtonInOffState: Locator;
  readonly cancelButton: Locator;
  readonly myVideoStreamContainer: Locator;

  readonly videoRecordingProgressBar: Locator;
  readonly pauseVideoRecordingButton: Locator;
  readonly stopVideoRecordingButton: Locator;
  readonly resumeVideoRecordingButton: Locator;
  readonly recordingDoneButton: Locator;
  readonly recordedVideoRangeSlider: Locator;

  constructor(page: Page) {
    super(page);
    this.recordVideoButton = this.page.getByRole('button', { name: 'Record' });
    this.audioButtonInOnState = this.page.getByRole('button', { name: 'microphone', exact: true });
    this.audioButtonInOffState = this.page.getByRole('button', {
      name: 'microphone off',
      exact: true,
    });

    this.videoButtonInOnState = this.page.getByRole('button', { name: 'video', exact: true });
    this.videoButtonInOffState = this.page.getByRole('button', { name: 'video off', exact: true });

    this.cancelButton = this.page.getByRole('button', { name: 'Close' });
    this.myVideoStreamContainer = this.page.locator("video[aria-label='Preview']");

    this.videoRecordingProgressBar = this.page.locator("[class*='RecordVideo_progressBarContainer']");

    this.pauseVideoRecordingButton = this.page.getByRole('button', { name: 'Pause' });
    this.stopVideoRecordingButton = this.page.getByRole('button', { name: 'Stop' });
    this.resumeVideoRecordingButton = this.page.getByRole('button', { name: 'Resume' });
    this.recordingDoneButton = this.page.getByRole('button', { name: 'Done' });

    this.recordedVideoRangeSlider = this.page.locator("[class*='RecordVideo_rangeSlider']");
  }

  /**
   * Verifies that the record video prompt component is visible
   */
  async verifyTheComponentIsVisible(): Promise<void> {
    await this.verifier.verifyTheElementIsVisible(this.recordVideoButton, {
      assertionMessage: 'expecting record video button to be visible',
    });
  }

  /**
   * Verifies that the record button is disabled
   */
  async verifyRecordButtonIsDisabled(): Promise<void> {
    await expect(this.recordVideoButton, `expecting record video button to be disabled`).toBeDisabled();
  }

  /**
   * Verifies that the record button is enabled
   */
  async verifyRecordButtonIsEnabled(): Promise<void> {
    await this.verifier.verifyTheElementIsEnabled(this.recordVideoButton, {
      assertionMessage: 'expecting record video button to be enabled',
    });
  }

  /**
   * Verifies that the video recording is in progress
   */
  async verifyVideoRecordingIsInProgress(): Promise<void> {
    await this.verifier.verifyTheElementIsVisible(this.videoRecordingProgressBar, {
      assertionMessage: 'expecting video recording progress bar to be visible',
    });
  }

  /**
   * Verifies that the video recording is not in progress
   */
  async verifyVideoRecordingIsNotInProgress(): Promise<void> {
    await this.verifier.verifyTheElementIsNotVisible(this.videoRecordingProgressBar, {
      assertionMessage: 'expecting video recording progress bar to be not visible',
    });
  }

  /**
   * Presses the space bar to resume video recording
   */
  async pressSpaceBarToResumeVideoRecording() {
    await this.page.keyboard.press('Space');
  }

  /**
   * Gets the current recorded video stream length
   */
  async getTheCurrentRecordedVideoStreamLength(): Promise<number> {
    const progressBarText = await this.videoRecordingProgressBar.textContent();
    const progressBarTextArray = progressBarText?.split('/');
    const currentRecordedVideoStreamLength = Number(progressBarTextArray?.[0]);
    return currentRecordedVideoStreamLength;
  }

  /**
   * Verifies if the user is able to play the recorded video
   */
  async verifyIfUserIsAbleToPlayTheRecordedVideo(): Promise<void> {
    await this.verifier.verifyTheElementIsVisible(this.recordingDoneButton, {
      assertionMessage: 'expecting recording done button to be visible',
    });
    //get the current recorded video stream length
    await this.verifier.verifyTheElementIsVisible(this.recordedVideoRangeSlider, {
      assertionMessage: 'expecting recorded video range slider to be visible',
    });
    //get the current recorded video stream length
    const initialPlayedVideoLength = await this.recordedVideoRangeSlider.getAttribute('value');
    //click on the resume button to play the recorded video
    await this.resumeVideoRecordingButton.click(); //same resume button is used to play the recorded video

    //wait for 2 seconds
    await this.sleep(2_000);

    //now get the current played video length
    const currentPlayedVideoLength = await this.recordedVideoRangeSlider.getAttribute('value');
    //verify that the current played video length is greater than the initial played video length
    expect(Number(currentPlayedVideoLength)).toBeGreaterThan(Number(initialPlayedVideoLength));
  }

  /**
   * Adds the recorded video to the chat
   */
  async addTheRecordedVideoToTheChat(): Promise<void> {
    //click on the recording done button and wait for the request to be completed
    await test.step(`Clicking on the recording done button and waiting for the request to be completed`, async () => {
      await this.performActionAndWaitForRequest(
        () => this.recordingDoneButton.last().click(),
        request => request.url().includes('attachments') && request.method() === 'POST',
        { timeout: 60_000 }
      );
    });
  }

  /**
   * Records and adds the video to the chat
   */
  async recordAndAddTheVideoToTheChat(
    timeToRecord: number = 2_000,
    { keepAudioOn = false, keepVideoOn = false }
  ): Promise<void> {
    //both video and audio cant be disabled at the same time
    if (!keepAudioOn && !keepVideoOn) {
      throw new Error('Both audio and video cant be disabled at the same time');
    }

    if (keepAudioOn) {
      await this.enableMicrophone();
    }
    if (keepVideoOn) {
      await this.enableCamera();
    }
    //verify the video stream preview is visible
    await this.verifier.verifyTheElementIsVisible(this.myVideoStreamContainer, {
      assertionMessage: 'expecting my video stream container to be visible',
    });
    //video streams take some time to load, so we will wait for 1.2 seconds
    await this.sleep(1_200);
    await this.clickToStartTheVideoRecording();
    await this.sleep(timeToRecord);
    await this.stopTheVideoRecording();
    await this.addTheRecordedVideoToTheChat();
  }

  async clickToStartTheVideoRecording(options?: { stepInfo?: string }): Promise<void> {
    await test.step(options?.stepInfo ?? `Clicking to start the video recording`, async () => {
      try {
        await this.clickOnElement(this.recordVideoButton);
        await this.verifier.verifyTheElementIsNotVisible(this.recordVideoButton, {
          assertionMessage: 'expecting record video button to be not visible',
          timeout: 2_000,
        });
      } catch (error) {
        //wait for 2 second and then again click on it
        await this.sleep(2_000);
        await this.clickOnElement(this.recordVideoButton);
      }
    });
  }

  /**
   * Starts the video recording
   */
  async startTheVideoRecording(
    timeToRecord: number = 2_000,
    options?: {
      stepInfo?: string;
    }
  ): Promise<void> {
    await test.step(options?.stepInfo ?? `Starting the video recording`, async () => {
      await this.clickOnElement(this.recordVideoButton);
      //verify that the video recording is in progress
      await this.verifyVideoRecordingIsInProgress();
    });
  }

  /**
   * Stops the video recording
   */
  async stopTheVideoRecording(options?: { stepInfo?: string }): Promise<void> {
    await test.step(options?.stepInfo ?? `Stopping the video recording`, async () => {
      await this.clickOnElement(this.stopVideoRecordingButton);
      //verify that the video recording is not in progress
      await this.verifyVideoRecordingIsNotInProgress();
    });
  }

  async enableMicrophone(options?: { stepInfo?: string }): Promise<void> {
    await test.step(options?.stepInfo ?? `Enabling the microphone`, async () => {
      //if microphone is already enabled, then do nothing
      if (await this.audioButtonInOnState.isVisible()) {
        return;
      }
      await this.clickOnElement(this.audioButtonInOffState);
    });
  }

  async disableMicrophone(options?: { stepInfo?: string }): Promise<void> {
    await test.step(options?.stepInfo ?? `Disabling the microphone`, async () => {
      //if microphone is already disabled, then do nothing
      if (await this.audioButtonInOffState.isVisible()) {
        return;
      }
      await this.clickOnElement(this.audioButtonInOnState);
    });
  }

  async enableCamera(options?: { stepInfo?: string }): Promise<void> {
    await test.step(options?.stepInfo ?? `Enabling the camera`, async () => {
      //if camera is already enabled, then do nothing
      if (await this.videoButtonInOnState.isVisible()) {
        return;
      }
      await this.clickOnElement(this.videoButtonInOffState);
    });
  }

  async disableCamera(options?: { stepInfo?: string }): Promise<void> {
    await test.step(options?.stepInfo ?? `Disabling the camera`, async () => {
      //if camera is already disabled, then do nothing
      if (await this.videoButtonInOffState.isVisible()) {
        return;
      }
      await this.clickOnElement(this.videoButtonInOnState);
    });
  }
}
