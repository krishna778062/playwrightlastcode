import { Locator, Page, test, expect } from '@playwright/test';
import { BaseComponent } from './baseComponent';
import { TIMEOUTS } from '@core/constants/timeouts';
import { AudioVideoCallPage } from '../audioVideoCallPage';

export class IncomingAudioVideoCallComponent extends BaseComponent {
  readonly callerName: Locator;
  readonly incomingCallContainer: Locator;
  readonly acceptIncomingCallButton: Locator;
  readonly rejectIncomingCallButton: Locator;

  readonly incomingVideoCallStreamPreview: Locator;
  readonly incomingCallGroupImageContainer: Locator;
  readonly cameraButton: Locator;
  readonly enableCameraButton: Locator;

  constructor(page: Page) {
    super(page);
    this.callerName = this.page.getByTestId('callerName');
    this.incomingCallContainer = this.page.getByTestId('incomingCallModal');
    this.acceptIncomingCallButton = this.incomingCallContainer.getByRole('button', {
      name: 'Accept',
      exact: true,
    });
    this.incomingCallContainer = this.page.getByTestId('incomingCallModal');
    this.acceptIncomingCallButton = this.incomingCallContainer.getByRole('button', {
      name: 'Accept',
      exact: true,
    });
    this.rejectIncomingCallButton = this.incomingCallContainer.getByRole('button', {
      name: 'Decline',
      exact: true,
    });

    this.callerName = this.page.getByTestId('callerName');
    this.incomingCallGroupImageContainer = this.page.getByTestId('groupImageContainer');
    this.incomingVideoCallStreamPreview = this.page.locator("video[aria-label='video-preview']");

    //camera
    this.cameraButton = this.incomingCallContainer.getByRole('button', {
      name: 'Toggle video',
      exact: true,
    });

    this.enableCameraButton = this.cameraButton.filter({
      has: this.page.getByTestId('i-videoOff'),
    });
  }

  /**
   * Verifies the incoming call is received from the caller
   * (Note): For group chat, the caller name will be the group name
   * @param callerName - The name of the caller
   * @param typeOfCall - The type of call
   * @param options - The options for the verification
   *
   */
  async verifyIncomingCallIsReceivedFromCaller(
    callerName: string,
    typeOfCall: 'audio' | 'video',
    options?: {
      isGroupChat?: boolean;
      stepInfo?: string;
    }
  ): Promise<IncomingAudioVideoCallComponent> {
    const isGroupChat = options?.isGroupChat ?? false;
    await test.step(options?.stepInfo ?? `Verifying incoming call is received`, async () => {
      await expect(
        this.incomingCallContainer,
        `expecting incoming call container to be visible`
      ).toBeVisible({ timeout: TIMEOUTS.MEDIUM });
      await expect(this.callerName, `expecting caller name to be visible`).toHaveText(callerName);

      if (typeOfCall === 'audio') {
        await expect(
          this.enableCameraButton,
          `expecting enable video button to be visible`
        ).toBeVisible({ timeout: TIMEOUTS.MEDIUM });
      } else {
        //for video call, we will see the incoming video call stream preview
        if (isGroupChat) {
          await expect(
            this.incomingCallGroupImageContainer,
            `expecting incoming call group image container to be visible`
          ).toBeVisible({ timeout: TIMEOUTS.MEDIUM });
        } else {
          await expect(
            this.incomingVideoCallStreamPreview,
            `expecting incoming video call stream preview to be visible`
          ).toBeVisible({ timeout: TIMEOUTS.MEDIUM });
        }
        //video should already be enabled
        await expect(this.cameraButton, `expecting camera button to be visible`).toBeVisible({
          timeout: TIMEOUTS.MEDIUM,
        });
        await expect(this.enableCameraButton, `expecting video to be already enabed`).toBeHidden({
          timeout: TIMEOUTS.MEDIUM,
        });
      }
    });
    return this;
  }

  /**
   * Accepts the incoming call
   * @param options - The options for the acceptance
   * @returns The audio video call page
   */
  async acceptIncomingCall(options?: { stepInfo?: string }): Promise<AudioVideoCallPage> {
    let audioVideoCallPage: Page | undefined;
    await test.step(options?.stepInfo ?? `Accepting incoming call`, async () => {
      /**
       * Accepting incoming call will redirect the user to the audio video call page
       * We need to wait for the user to be redirected to the audio video call page
       * and we will return the audio video call page
       */
      const audioVideoCallPagePromise = this.page
        .context()
        .waitForEvent('page', { timeout: 30_000 });
      await this.acceptIncomingCallButton.click();
      audioVideoCallPage = await audioVideoCallPagePromise;
    });
    return new AudioVideoCallPage(audioVideoCallPage!);
  }

  async rejectIncomingCall(options?: { stepInfo?: string }): Promise<void> {
    await test.step(options?.stepInfo ?? `Rejecting incoming call`, async () => {
      await this.rejectIncomingCallButton.click();
    });
  }

  async enableCamera(options?: { stepInfo?: string }): Promise<void> {
    await test.step(options?.stepInfo ?? `Enabling camera`, async () => {
      await this.enableCameraButton.click();
    });
  }

  /**
   * Checks if the camera is disabled
   * @returns true if the camera is disabled, false otherwise
   */
  async isCameraDisabled(): Promise<boolean> {
    //if the camera is disabled, the button to enable camera will be visible
    try {
      await this.enableCameraButton.waitFor({ state: 'visible' });
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Checks if the camera is enabled
   * @returns true if the camera is enabled, false otherwise
   */
  async isCameraEnabled(): Promise<boolean> {
    //if the camera is enabled, the button to enable camera will be hidden
    try {
      await this.enableCameraButton.waitFor({ state: 'hidden' });
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Disables the camera
   * @param options - The options for the disabling
   */
  async disableCamera(options?: { stepInfo?: string }): Promise<void> {
    await test.step(options?.stepInfo ?? `Disabling camera`, async () => {
      //if the camera is not already disabled
      if (await this.isCameraEnabled()) {
        //if the camera is enabled, we will disable it
        await this.cameraButton.click();
      } else {
        console.log('Camera is already disabled, hence not clicking on it to disable it');
      }
    });
  }

  /**
   * Verifies the incoming call modal is visible
   * @param options - The options for the verification
   */
  async verifyIcomingCallModalIsVisible(options?: { stepInfo?: string }): Promise<void> {
    await test.step(options?.stepInfo ?? `Verifying incoming call modal is visible`, async () => {
      await expect(
        this.incomingCallContainer,
        `expecting incoming call container to be visible`
      ).toBeVisible({ timeout: TIMEOUTS.MEDIUM });
    });
  }

  /**
   * Verifies the incoming call modal is not visible
   * @param options - The options for the verification
   */
  async verifyIcomingCallModalIsNotVisible(options?: { stepInfo?: string }): Promise<void> {
    await test.step(
      options?.stepInfo ?? `Verifying incoming call modal is not visible`,
      async () => {
        await expect(
          this.incomingCallContainer,
          `expecting incoming call container to be hidden`
        ).toBeHidden({ timeout: TIMEOUTS.MEDIUM });
      }
    );
  }
}
