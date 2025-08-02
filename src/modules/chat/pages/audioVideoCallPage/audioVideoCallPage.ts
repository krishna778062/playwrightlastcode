import { expect, test } from '@playwright/test';

import { TIMEOUTS } from '@core/constants/timeouts';

import { BaseAudioVideoCallPage } from './baseAudioVideoCallPage';

export interface IAudioVideoCallActions {
  enableMicrophone: (options?: { stepInfo?: string }) => Promise<void>;
  enableVideo: (options?: { stepInfo?: string }) => Promise<void>;
  disableMicrophone: (options?: { stepInfo?: string }) => Promise<void>;
  disableVideo: (options?: { stepInfo?: string }) => Promise<void>;
  endCall: (options?: { stepInfo?: string }) => Promise<void>;
  openMeetingParticipantList: (options?: { stepInfo?: string }) => Promise<void>;
  closeMeetingParticipantList: (options?: { stepInfo?: string }) => Promise<void>;
  inviteUserToThisMeeting: (userName: string, options?: { stepInfo?: string }) => Promise<void>;
}

export interface IAudioVideoCallAssertions {
  verifyCountOfVideoTitles: (count: number, options?: { stepInfo?: string }) => Promise<void>;
  verifyVideoStreamFromUserIsVisible: (
    userName: string,
    videoStreamEnabled: boolean,
    options?: { stepInfo?: string }
  ) => Promise<void>;
  verifyMyVideoStreamIsVisible: (options?: { stepInfo?: string }) => Promise<void>;
  verifyCountOfMeetingParticipants: (count: number, options?: { stepInfo?: string }) => Promise<void>;
  verifyMeetingParticipantNameInList: (userName: string, options?: { stepInfo?: string }) => Promise<void>;
}

export class AudioVideoCallPage
  extends BaseAudioVideoCallPage
  implements IAudioVideoCallActions, IAudioVideoCallAssertions
{
  get actions(): IAudioVideoCallActions {
    return this;
  }

  get assertions(): IAudioVideoCallAssertions {
    return this;
  }

  /**
   * Enables the microphone
   * @param options - The options for the enabling
   */
  async enableMicrophone(options?: { stepInfo?: string }): Promise<void> {
    await test.step(options?.stepInfo ?? `Enabling microphone`, async () => {
      //check if the microphone is already enabled
      if (!(await this.isMicrophoneEnabled())) {
        await this.clickOnElement(this.audioCallButton);
      } else {
        console.log('Microphone is already enabled, hence not clicking on it');
      }
    });
  }

  /**
   * Enables the video
   * @param options - The options for the enabling
   */
  async enableVideo(options?: { stepInfo?: string }): Promise<void> {
    await test.step(options?.stepInfo ?? `Enabling video`, async () => {
      if (await this.isVideoEnabled()) {
        await this.clickOnElement(this.videoCallButton);
      } else {
        console.log('Video is already enabled, hence not clicking on it');
      }
    });
  }

  /**
   * Disables the microphone
   * @param options - The options for the disabling
   */
  async disableMicrophone(options?: { stepInfo?: string }): Promise<void> {
    await test.step(options?.stepInfo ?? `Disabling microphone`, async () => {
      if (await this.isMicrophoneEnabled()) {
        await this.clickOnElement(this.audioCallButton);
      } else {
        console.log('Microphone is already disabled, hence not clicking on it');
      }
    });
  }

  /**
   * Disables the video
   * @param options - The options for the disabling
   */
  async disableVideo(options?: { stepInfo?: string }): Promise<void> {
    await test.step(options?.stepInfo ?? `Disabling video`, async () => {
      if (await this.isVideoEnabled()) {
        await this.clickOnElement(this.videoCallButton);
      } else {
        console.log('Video is already disabled, hence not clicking on it');
      }
    });
  }

  /**
   * Checks if the microphone is enabled
   * @returns true if the microphone is enabled, false otherwise
   */
  async isMicrophoneEnabled(): Promise<boolean> {
    //if the container has MediaControls_mediaOffButton class then that control is disabled
    const audioCallControlContainer = this.mediaControlContainer.filter({
      has: this.audioCallButton,
    });
    return await audioCallControlContainer
      .locator("[class*='MediaControls_mediaOffButton']")
      .isVisible({ timeout: TIMEOUTS.MEDIUM });
  }

  /**
   *
   * @returns
   */
  async isVideoEnabled(): Promise<boolean> {
    //if the container has MediaControls_mediaOffButton class then that control is disabled
    const videoCallControlContainer = this.mediaControlContainer.filter({
      has: this.videoCallButton,
    });
    return await videoCallControlContainer
      .locator("[class*='MediaControls_mediaOffButton']")
      .isVisible({ timeout: TIMEOUTS.MEDIUM });
  }

  /**
   * Ends the call
   * @param options - The options for the ending
   */
  async endCall(options?: { stepInfo?: string }): Promise<void> {
    await test.step(options?.stepInfo ?? `Ending call`, async () => {
      await this.clickOnElement(this.endCallButton);
    });
  }

  async openMeetingParticipantList(options?: { stepInfo?: string }): Promise<void> {
    await test.step(options?.stepInfo ?? `Opening meeting participant list`, async () => {
      await this.clickOnElement(this.attendeeListButton);
    });
  }

  async closeMeetingParticipantList(options?: { stepInfo?: string }): Promise<void> {
    await test.step(options?.stepInfo ?? `Closing meeting participant list`, async () => {
      await this.clickOnElement(this.closeMeetingParticipantListButton);
    });
  }

  async inviteUserToThisMeeting(userName: string, options?: { stepInfo?: string }): Promise<void> {
    await test.step(options?.stepInfo ?? `Inviting user to this meeting`, async () => {
      await this.openMeetingParticipantList();
      await expect(this.addParticipantForm, `expecting add participant form to be visible`).toBeVisible({
        timeout: TIMEOUTS.MEDIUM,
      });
      await this.clickOnElement(this.inviteParticipantInputSearchField);
      await this.fillInElement(this.inviteParticipantInputSearchField, userName);
      //wait for the user suggestion in dropdwon to be visible
      await expect(
        this.userSelectionDropdownOptions.first(),
        `expecting user selection dropdown to be visible`
      ).toBeVisible();

      //select the user from the dropdown
      await this.userSelectionDropdownOptions.filter({ hasText: userName }).first().click();
      /**
       * when we click to add, there is an API call to add the user to the meeting
       * we need to wait for the API call to be successful
       * and then we can close the add participant form
       */
      await this.clickAndWaitForResponse(
        () => this.clickOnElement(this.addButtonToInviteParticipant),
        response => response.url().includes('/invite') && response.status() === 201,
        { timeout: 20000, stepInfo: 'Inviting user to meeting' }
      );
      await expect(
        this.meetingParticipantNameInList,
        `expecting meeting participant name in list to be visible`
      ).toHaveText(userName);
      await this.closeMeetingParticipantList();
    });
  }

  //---------------------------------Assertions---------------------------------

  /**
   * Verifies the count of video titles
   * @param count - The count of video titles
   * @param options - The options for the verification
   */
  async verifyCountOfVideoTitles(count: number, options?: { stepInfo?: string }): Promise<void> {
    await test.step(options?.stepInfo ?? `Verifying count of video titles`, async () => {
      await expect(this.videoTile, `expecting video titles to be visible`).toHaveCount(count);
    });
  }

  /**
   * Verifies the video stream from the user is visible
   * @param userName - The name of the user
   * @param options - The options for the verification
   */
  async verifyVideoStreamFromUserIsVisible(
    userName: string,
    videoStreamEnabled: boolean = true,
    options?: { stepInfo?: string }
  ): Promise<void> {
    await test.step(options?.stepInfo ?? `Verifying video stream from user is visible`, async () => {
      const userVideoStream = this.getVideoStreamForUser(userName).locator('video');
      await expect(userVideoStream, `expecting video stream to be visible from user ${userName}`).toBeVisible({
        timeout: TIMEOUTS.MEDIUM,
      });

      //verify is video stream enabled from user
      if (videoStreamEnabled) {
        await expect(userVideoStream, `expecting video stream to be enabled from user ${userName}`).toHaveAttribute(
          'autoplay',
          'true'
        );
      } else {
        await expect(
          userVideoStream,
          `expecting video stream to be disabled from user ${userName}`
        ).not.toHaveAttribute('autoplay', 'true');
      }
    });
  }

  /**
   * Verifies the my video stream is visible
   * @param options - The options for the verification
   */
  async verifyMyVideoStreamIsVisible(options?: { stepInfo?: string }): Promise<void> {
    await test.step(options?.stepInfo ?? `Verifying my video stream is visible`, async () => {
      const myVideoStream = this.getVideoStreamForUser('Me').locator('video');
      await expect(myVideoStream, `expecting video stream container to be visible`).toBeVisible({
        timeout: TIMEOUTS.MEDIUM,
      });
    });
  }

  async verifyCountOfMeetingParticipants(count: number, options?: { stepInfo?: string }): Promise<void> {
    await test.step(options?.stepInfo ?? `Verifying count of meeting participants`, async () => {
      await this.openMeetingParticipantList();
      await expect(
        this.meetingParticipantNameInList,
        `expecting meeting participant name in list to be visible`
      ).toHaveCount(count);
      await this.closeMeetingParticipantList();
    });
  }

  /**
   * Verifies the meeting participant name in list
   * @param userName - The name of the user
   * @param options - The options for the verification
   */
  async verifyMeetingParticipantNameInList(userName: string, options?: { stepInfo?: string }): Promise<void> {
    await test.step(options?.stepInfo ?? `Verifying meeting participant name in list`, async () => {
      await this.openMeetingParticipantList();
      const userNameInList = this.meetingParticipantNameInList.filter({ hasText: userName });
      await expect(userNameInList, `expecting meeting participant name in list to be visible`).toHaveText(userName);
      await this.closeMeetingParticipantList();
    });
  }
}
