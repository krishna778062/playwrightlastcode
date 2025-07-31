import { expect, Locator, test } from '@playwright/test';
import { Page } from '@playwright/test';

import { PAGE_ENDPOINTS } from '@core/constants/pageEndpoints';
import { TIMEOUTS } from '@core/constants/timeouts';

import { BasePage } from '@/src/core/pages/basePage';

export interface IAudioVideoCallActions {
  enableMicrophone: (options?: { stepInfo?: string }) => Promise<void>;
  enableVideo: (options?: { stepInfo?: string }) => Promise<void>;
  disableMicrophone: (options?: { stepInfo?: string }) => Promise<void>;
  disableVideo: (options?: { stepInfo?: string }) => Promise<void>;
  endCall: (options?: { stepInfo?: string }) => Promise<void>;
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

export class BaseAudioVideoCallPage extends BasePage {
  readonly mediaControlContainer: Locator;
  readonly audioCallButton: Locator;
  readonly videoCallButton: Locator;
  readonly endCallButton: Locator;
  readonly videoTile: Locator;
  readonly videoTileNamePlate: Locator;
  readonly attendeeListButton: Locator;
  readonly meetingParticipantNameInList: Locator;
  readonly closeMeetingParticipantListButton: Locator;
  readonly addParticipantForm: Locator;
  readonly inviteParticipantInputSearchField: Locator;
  readonly addButtonToInviteParticipant: Locator;
  readonly userSelectionDropdownOptions: Locator;

  constructor(page: Page) {
    super(page, PAGE_ENDPOINTS.AUDIO_VIDEO_CALL_PAGE);
    this.mediaControlContainer = this.page.locator("[class*='MediaControls_meetingContainer']");
    this.audioCallButton = this.mediaControlContainer.getByLabel('call.record_video_modal.aria_label.microphone');
    this.videoCallButton = this.mediaControlContainer.getByLabel('video');
    this.endCallButton = this.page.getByRole('button', { name: 'End', exact: true });
    this.videoTile = this.page.getByTestId('video-tile');
    this.videoTileNamePlate = this.page.locator("header[class*='ch-nameplate']");
    this.attendeeListButton = this.page.getByRole('button', {
      name: 'Attendee count icon',
      exact: true,
    });
    this.meetingParticipantNameInList = this.page.locator("[class*='User_userAvatarWithNam']");
    this.closeMeetingParticipantListButton = this.page.getByRole('button', {
      name: 'Cross icon',
      exact: true,
    });
    this.addParticipantForm = this.page.getByTestId('addParticipantForm');
    this.inviteParticipantInputSearchField = this.addParticipantForm
      .getByPlaceholder('Invite Participants', { exact: false })
      .locator('input ');
    this.addButtonToInviteParticipant = this.addParticipantForm.getByRole('button');
    this.userSelectionDropdownOptions = this.page.locator("div[role='menuitem']");
  }

  /**
   * Verifies the audio video call page is loaded
   * @param options - The options for the verification
   */
  async verifyThePageIsLoaded(options?: { stepInfo?: string }): Promise<void> {
    await test.step(options?.stepInfo ?? `Verifying the audio video call page is loaded`, async () => {
      await expect(this.mediaControlContainer.first(), `expecting media control container to be visible`).toBeVisible({
        timeout: TIMEOUTS.MEDIUM,
      });
    });
  }

  getVideoStreamForUser(userName: string): Locator {
    return this.videoTile.filter({ has: this.videoTileNamePlate.filter({ hasText: userName }) });
  }
}
