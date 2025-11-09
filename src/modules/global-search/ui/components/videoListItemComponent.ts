import { Locator, Page, test } from '@playwright/test';

import { IntranetFileListComponent } from './intranetFileListComponent';

/**
 * The VideoListItemComponent class is a UI component that represents a video list item with captions functionality.
 * It provides methods for interacting with video captions, timestamps, and related elements.
 */
export class VideoListItemComponent extends IntranetFileListComponent {
  readonly captionsText: Locator;
  readonly captionsIcon: Locator;
  readonly timestampButton: Locator;
  readonly captionSpan: Locator;
  readonly videoPlayButton: Locator;
  readonly videoTimeDisplay: Locator;

  /**
   * Constructs a new instance of the VideoListItemComponent class.
   * @param page - The Playwright Page object.
   * @param rootLocator - The root locator for the component.
   */
  constructor(page: Page, rootLocator?: Locator) {
    super(page, rootLocator);
    this.captionsText = this.rootLocator.locator('[class*="VideoListItem_truncate"]');
    this.captionsIcon = this.rootLocator.getByTestId('i-cc');
    this.timestampButton = this.rootLocator.locator('[class*="VideoCaptions_timeStamp"]');
    this.captionSpan = this.rootLocator.locator('[class*="VideoCaptions_captio"]');
    this.videoPlayButton = this.page.locator('[class*="VideoPlayButton-module"]');
    this.videoTimeDisplay = this.page.locator('[class*="playkit-time-display"]');
  }

  /**
   * Verifies that captions text is displayed under the video title.
   * @param expectedText - The expected caption text to verify.
   */
  async verifyCaptionsTextIsDisplayed(expectedText: string): Promise<void> {
    await test.step(`Verifying captions text "${expectedText}" is displayed under video title`, async () => {
      await this.verifier.verifyElementContainsText(this.captionsText.first(), expectedText, {
        timeout: 20000,
        assertionMessage: `Verifying captions text "${expectedText}" is displayed`,
      });
    });
  }

  /**
   * Verifies that the captions icon is displayed.
   */
  async verifyCaptionsIconIsDisplayed(): Promise<void> {
    await test.step('Verifying captions icon is displayed', async () => {
      await this.verifier.verifyTheElementIsVisible(this.captionsIcon.first(), {
        timeout: 20000,
        assertionMessage: 'Verifying captions icon is displayed',
      });
    });
  }

  /**
   * Clicks on the captions icon to open captions.
   */
  async clickOnCaptionsIcon(): Promise<void> {
    await test.step('Clicking on captions icon', async () => {
      await this.clickOnElement(this.captionsIcon.first());
    });
  }

  /**
   * Verifies that a timestamp button is displayed with the expected time.
   * @param expectedTime - The expected timestamp (e.g., "00:41").
   */
  async verifyTimestampIsDisplayed(expectedTime: string): Promise<void> {
    await test.step(`Verifying timestamp "${expectedTime}" is displayed`, async () => {
      const timestampWithTime = this.timestampButton.filter({ hasText: expectedTime });
      await this.verifier.verifyTheElementIsVisible(timestampWithTime.first(), {
        timeout: 20000,
        assertionMessage: `Verifying timestamp "${expectedTime}" is displayed`,
      });
    });
  }

  /**
   * Verifies that caption text is displayed for a specific timestamp.
   * @param expectedText - The expected caption text to verify.
   */
  async verifyCaptionTextForTimestamp(expectedText: string): Promise<void> {
    await test.step(`Verifying caption text "${expectedText}" is displayed for timestamp`, async () => {
      await this.verifier.verifyElementContainsText(this.captionSpan.first(), expectedText, {
        timeout: 20000,
        assertionMessage: `Verifying caption text "${expectedText}" is displayed for timestamp`,
      });
    });
  }

  /**
   * Clicks on a timestamp button.
   * @param timestamp - The timestamp to click (e.g., "00:43").
   */
  async clickTimestamp(timestamp: string): Promise<void> {
    await test.step(`Clicking on timestamp "${timestamp}"`, async () => {
      const timestampWithTime = this.timestampButton.filter({ hasText: timestamp });
      await this.verifier.verifyTheElementIsVisible(timestampWithTime.first(), {
        timeout: 20000,
        assertionMessage: `Verifying timestamp "${timestamp}" is visible before clicking`,
      });
      await this.clickOnElement(timestampWithTime.first());
    });
  }

  /**
   * Clicks on the video play button to resume video playback.
   */
  async clickVideoPlayButton(): Promise<void> {
    await test.step('Clicking on video play button to resume video playback', async () => {
      await this.verifier.verifyTheElementIsVisible(this.videoPlayButton, {
        timeout: 60000,
        assertionMessage: 'Verifying video play button is visible before clicking',
      });
      await this.clickOnElement(this.videoPlayButton);
    });
  }

  // /**
  //  * Parses a time string in MM:SS format to total seconds.
  //  * @param timeStr - Time string in format "MM:SS" (e.g., "00:43").
  //  * @returns Total seconds as a number.
  //  */
  // private parseTimeToSeconds(timeStr: string): number {
  //   const parts = timeStr.split(':');
  //   if (parts.length !== 2) {
  //     throw new Error(`Invalid time format: ${timeStr}. Expected format: MM:SS`);
  //   }
  //   const minutes = parseInt(parts[0], 10);
  //   const seconds = parseInt(parts[1], 10);
  //   if (isNaN(minutes) || isNaN(seconds)) {
  //     throw new Error(`Invalid time format: ${timeStr}. Minutes and seconds must be numbers`);
  //   }
  //   return minutes * 60 + seconds;
  // }

  // /**
  //  * Verifies that the video time display shows a time greater than the expected timestamp.
  //  * The format should be like "00:43 / 00:59" where the current time is greater than the timestamp.
  //  * @param expectedTimestamp - The timestamp that was clicked (e.g., "00:43").
  //  */
  // async verifyVideoResumesFromTimestamp(expectedTimestamp: string): Promise<void> {
  //   await test.step(`Verifying video resumes from timestamp "${expectedTimestamp}" and time display shows greater value`, async () => {
  //     await this.verifier.verifyTheElementIsVisible(this.videoTimeDisplay, {
  //       timeout: 60000,
  //       assertionMessage: 'Verifying video time display is visible',
  //     });

  //     // Get the text content from the time display
  //     const timeDisplayText = await this.videoTimeDisplay.textContent({ timeout: 30000 });

  //     if (!timeDisplayText) {
  //       throw new Error('Video time display text is empty');
  //     }

  //     // Extract current time from display (format: "00:43 / 00:59" or just "00:43")
  //     // Match the first time pattern (MM:SS) in the display
  //     const timeMatch = timeDisplayText.match(/(\d{2}:\d{2})/);
  //     const currentTimeStr = timeMatch?.[1];
  //     if (!currentTimeStr) {
  //       throw new Error(
  //         `Could not parse time from display: "${timeDisplayText}". Expected format: MM:SS or MM:SS / MM:SS`
  //       );
  //     }
  //     const expectedTimeSeconds = this.parseTimeToSeconds(expectedTimestamp);
  //     const currentTimeSeconds = this.parseTimeToSeconds(currentTimeStr);

  //     // Verify current time is greater than or equal to the expected timestamp
  //     if (currentTimeSeconds < expectedTimeSeconds) {
  //       throw new Error(
  //         `Video time display shows ${currentTimeStr} which is less than expected timestamp ${expectedTimestamp}. Display text: "${timeDisplayText}"`
  //       );
  //     }
  //   });
  // }
}
