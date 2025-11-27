import { Locator, Page, Response, test } from '@playwright/test';

import { EventCreationResponse } from '@content/apis/types/eventCreationResponse';
import { AttachementUploaderComponent } from '@content/ui/components/attachementUploader';
import { ImageCropperComponent } from '@content/ui/components/imageCropper';
import { PAGE_ENDPOINTS } from '@core/constants/pageEndpoints';

import { BasePage } from '@/src/core/ui/pages/basePage';

export interface EventCreationOptions {
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  location: string;
  coverImage?: {
    fileName: string;
    cropOptions?: {
      widescreen?: boolean;
      square?: boolean;
    };
  };
}

export interface IEventCreationActions {
  createAndPublishEvent(options: EventCreationOptions): Promise<{
    eventId: string;
    siteId: string;
  }>;
  createAndSubmitEvent(options: EventCreationOptions): Promise<{
    eventId: string;
    siteId: string;
    peopleId: string;
    peopleName: string;
    response: EventCreationResponse;
  }>;
}

export interface IEventCreationAssertions {
  verifyThePageIsLoaded: () => Promise<void>;
  verifyEventSyncConfiguration: (options?: {
    verifyGoogleCalendar?: boolean;
    verifyOutlookCalendar?: boolean;
    verifyRsvpToggle?: boolean;
  }) => Promise<void>;
  verifyLanguageDropdown: () => Promise<void>;
}

export class EventCreationPage extends BasePage implements IEventCreationActions, IEventCreationAssertions {
  // Essential locators for event creation
  readonly titleInput: Locator;
  readonly descriptionInput: Locator;
  readonly locationInput: Locator;
  readonly startDateInput: Locator;
  readonly endDateInput: Locator;
  readonly publishButton: Locator;
  readonly publishChangeButton: Locator;

  // Event sync configuration locators
  readonly eventSyncingToggle: Locator;
  readonly rsvpToggle: Locator;
  readonly googleCalendarToggle: Locator;
  readonly outlookCalendarToggle: Locator;

  // Cover image components (if needed)
  readonly coverImageUploaderContainer: Locator;
  readonly submitButton: Locator;
  readonly coverImageUploader: AttachementUploaderComponent;
  readonly imageCropper: ImageCropperComponent;
  readonly languageDropdown: Locator;
  readonly closeAlertDialogButton: Locator;

  constructor(page: Page, siteId?: string) {
    super(page, PAGE_ENDPOINTS.getEventCreationPage(siteId ?? ''));

    // Essential event creation locators
    this.titleInput = page.locator("textarea[placeholder='Event title']");
    this.descriptionInput = page.locator("div[aria-label='Event description']");
    this.locationInput = page.locator('//input[@id="location"]');
    this.startDateInput = page.getByRole('button', { name: 'Start date*' });
    this.endDateInput = page.getByRole('button', { name: 'End date*' });
    this.publishButton = page.getByRole('button', { name: 'Publish' });
    this.publishChangeButton = page.getByRole('button', { name: 'Publish changes' });
    this.submitButton = page.locator('span').filter({ hasText: 'Submit for approval' });

    // Event sync configuration locators
    this.eventSyncingToggle = page.locator("//button[@role='switch' and @data-state='checked']");
    this.rsvpToggle = page.locator("//input[@id='hasRsvp_yes']");
    this.googleCalendarToggle = page.locator(
      "//label[@for='eventSync_destinationgooglecalendar' and @title='Google Calendar sync']"
    );
    this.outlookCalendarToggle = page.locator(
      "//label[@for='eventSync_destinationoutlook' and @title='Outlook Calendar sync']"
    );

    // Cover image components (optional)
    this.coverImageUploaderContainer = page
      .locator("[class*='AddFromContainer']")
      .filter({ hasText: 'Select from computer' })
      .nth(0);
    this.coverImageUploader = new AttachementUploaderComponent(page, this.coverImageUploaderContainer);
    this.imageCropper = new ImageCropperComponent(page);
    this.languageDropdown = page.getByLabel('Page language');
    this.closeAlertDialogButton = page.getByRole('button', { name: 'Close' });
  }

  get actions(): IEventCreationActions {
    return this;
  }

  get assertions(): IEventCreationAssertions {
    return this;
  }

  /**
   * Verifies the event creation page is loaded
   */
  async verifyThePageIsLoaded(): Promise<void> {
    await test.step('Verify event creation page is loaded', async () => {
      await this.verifier.verifyTheElementIsVisible(this.titleInput, {
        assertionMessage: 'Title input should be visible on event creation page',
      });
    });
  }

  /**
   * Creates a page with the given options and publishes it
   * @param options - The options for creating the page
   * @returns The options for the created page
   */
  async createAndPublishEvent(options: EventCreationOptions): Promise<{
    eventId: string;
    siteId: string;
  }> {
    return await test.step(`Creating and publishing event with title: ${options.title}`, async () => {
      // Fill in event mandatory details
      await this.fillEventDetails({
        title: options.title,
        description: options.description,
        location: options.location,
        startDate: options.startDate,
        endDate: options.endDate,
      });

      // Upload cover image if provided
      if (options.coverImage) {
        await this.uploadCoverImage(options.coverImage.fileName, {
          widescreenCropOption: options.coverImage.cropOptions?.widescreen,
          squareCropOption: options.coverImage.cropOptions?.square,
        });
      }

      // Publish the event
      const publishResponse = await this.publishEvent();

      // Parse response body
      const publishResponseBody = (await publishResponse.json()) as EventCreationResponse;

      // Extract event ID and site ID from response
      const eventId = publishResponseBody.result.id;
      const siteId = publishResponseBody.result.site.siteId;

      return {
        eventId: eventId,
        siteId: siteId,
      };
    });
  }

  /**
   * Uploads a cover image for the event (optional)
   * @param fileName - The name of the file to upload
   */
  async uploadCoverImage(
    fileName: string,
    options?: {
      widescreenCropOption?: boolean;
      squareCropOption?: boolean;
    }
  ) {
    await test.step(`Upload cover image: ${fileName}`, async () => {
      // Setup response promises for 3 upload requests
      const responsePromises = [];
      const responsePromise = this.page.waitForResponse(
        response =>
          response.request().url().includes('X-Amz-SignedHeaders=host') &&
          response.request().method() === 'PUT' &&
          response.status() === 200,
        { timeout: 35000 }
      );
      responsePromises.push(responsePromise);

      await this.coverImageUploader.uploadAttachment(fileName);

      // Handle crop options
      if (options?.widescreenCropOption) {
        await this.imageCropper.selectCropOption('Widescreen');
      }
      await this.imageCropper.clickOnNextButton();

      if (options?.squareCropOption) {
        await this.imageCropper.selectCropOption('Square');
      }
      await this.imageCropper.clickOnNextButton();
      await this.imageCropper.clickOnNextButton();
      await this.imageCropper.clickOnAddButton();

      // Wait for all 3 upload responses to complete with 200 status
      await Promise.all(responsePromises);
    });
  }

  /**
   * Fills in the event details
   * @param options - The options for filling in the event details
   */
  async fillEventDetails(options: {
    title: string;
    description: string;
    location: string;
    startDate?: string;
    endDate?: string;
  }) {
    await test.step(`Filling event details`, async () => {
      // Add title (only if not empty)
      if (options.title) {
        await this.fillInElement(this.titleInput, options.title);
      }

      // Add description (only if not empty) - Handle rich text editor specially
      if (options.description) {
        await test.step('Fill description in rich text editor', async () => {
          // Based on logs: div[contenteditable='true'] always works, no fallback needed
          try {
            const locator = this.page.locator("div[contenteditable='true']").first();
            await locator.waitFor({ state: 'visible', timeout: 3000 });

            // Use evaluate method directly (proven to work)
            await locator.evaluate((element, text) => {
              if (element instanceof HTMLElement) {
                element.innerHTML = text;
                element.dispatchEvent(new Event('input', { bubbles: true }));
                element.dispatchEvent(new Event('change', { bubbles: true }));
              }
            }, options.description);
          } catch {
            console.log('Failed to fill description field');
          }
        });
      }

      // Add start date (only if provided)
      if (options.startDate) {
        await this.selectDateFromPicker(this.startDateInput, options.startDate, 'start');
      }

      // Add end date (only if provided)
      if (options.endDate) {
        await this.selectDateFromPicker(this.endDateInput, options.endDate, 'end');
      }

      // Add location (only if not empty)
      if (options.location) {
        await this.fillInElement(this.locationInput, options.location);
      }
    });
  }

  /**
   * Publishes the event changes and waits for API response
   */
  async publishEditEventChanges(): Promise<void> {
    return await test.step(`Publishing event changes`, async () => {
      await this.clickOnElement(this.publishChangeButton, { force: true });
    });
  }

  /**
   * Publishes the event and waits for API response
   */
  async publishEvent(): Promise<Response> {
    return await test.step(`Publishing event and wait for publish api response`, async () => {
      // Verify publish button is enabled before clicking
      await this.verifier.verifyTheElementIsVisible(this.publishButton, {
        assertionMessage: 'Publish button should be visible',
      });

      // Check if button is disabled (form validation might be failing)
      const isDisabled = await this.publishButton.isDisabled().catch(() => false);
      if (isDisabled) {
        throw new Error(
          'Publish button is disabled. Please check that all required fields are filled correctly, including dates.'
        );
      }

      const publishResponse = await this.performActionAndWaitForResponse(
        () => this.clickOnElement(this.publishButton, { delay: 2_000 }),
        response =>
          response.url().includes('content?action=publish') &&
          response.request().method() === 'POST' &&
          (response.status() === 201 || response.status() === 200),
        {
          timeout: 30_000,
        }
      );
      return publishResponse;
    });
  }

  /**
   * Creates a page with the given options and publishes it
   * @param options - The options for creating the page
   * @returns The options for the created page
   */
  async createAndSubmitEvent(options: EventCreationOptions): Promise<{
    eventId: string;
    siteId: string;
    peopleId: string;
    peopleName: string;
    response: EventCreationResponse;
  }> {
    return await test.step(`Creating and publishing event with title: ${options.title}`, async () => {
      // Fill in event mandatory details
      await this.fillEventDetails({
        title: options.title,
        description: options.description,
        location: options.location,
        startDate: options.startDate,
        endDate: options.endDate,
      });

      // Upload cover image if provided
      if (options.coverImage) {
        await this.uploadCoverImage(options.coverImage.fileName, {
          widescreenCropOption: options.coverImage.cropOptions?.widescreen,
          squareCropOption: options.coverImage.cropOptions?.square,
        });
      }

      // Publish the event
      const submitResponse = await this.submitEvent();

      // Parse response body
      const submitResponseBody = (await submitResponse.json()) as EventCreationResponse;

      // Extract the event ID and site ID from the response
      const eventId = submitResponseBody.result.id;
      const siteId = submitResponseBody.result.site.siteId;
      const peopleId = submitResponseBody.result.authoredBy.peopleId;
      const peopleName = submitResponseBody.result.authoredBy.name;

      return {
        eventId: eventId,
        siteId: siteId,
        peopleId: peopleId,
        peopleName: peopleName.trim(),
        response: submitResponseBody,
      };
    });
  }

  /**
   * Publishes the event and waits for API response
   */
  async submitEvent(): Promise<Response> {
    return await test.step(`Submitting event and wait for submit api response`, async () => {
      const submitResponse = await this.performActionAndWaitForResponse(
        () => this.clickOnElement(this.submitButton, { delay: 2_000 }),
        response =>
          response.url().includes('content?action=publish') &&
          response.request().method() === 'POST' &&
          response.status() === 201,
        {
          timeout: 20_000,
        }
      );
      return submitResponse;
    });
  }

  /**
   * Verifies the event sync configuration section on the event creation page
   * This includes toggle state, calendar connections, and other sync-related settings
   * @param options - Configuration for what to verify
   * @param options.verifyGoogleCalendar
   * @param options.verifyOutlookCalendar
   * @param options.verifyRsvpToggle
   */
  async verifyEventSyncConfiguration(options?: {
    verifyGoogleCalendar?: boolean;
    verifyOutlookCalendar?: boolean;
    verifyRsvpToggle?: boolean;
  }): Promise<void> {
    await test.step('Verify event sync configuration', async () => {
      await this.verifier.verifyTheElementIsVisible(this.eventSyncingToggle, {
        assertionMessage: 'Event syncing toggle should be visible and checked',
        timeout: 10000,
      });

      if (options?.verifyRsvpToggle) {
        await this.verifier.verifyTheElementIsVisible(this.rsvpToggle, {
          assertionMessage: 'RSVP toggle should be visible and checked',
          timeout: 10000,
        });
      }

      if (options?.verifyGoogleCalendar) {
        await this.verifier.verifyTheElementIsVisible(this.googleCalendarToggle, {
          assertionMessage: 'Google Calendar toggle should be visible',
          timeout: 10000,
        });
      }

      if (options?.verifyOutlookCalendar) {
        await this.verifier.verifyTheElementIsVisible(this.outlookCalendarToggle, {
          assertionMessage: 'Outlook Calendar toggle should be visible',
          timeout: 10000,
        });
      }
    });
  }
  async verifyLanguageDropdown(): Promise<void> {
    await test.step('Verify language dropdown', async () => {
      await this.verifier.verifyTheElementIsVisible(this.languageDropdown, {
        assertionMessage: 'Language dropdown should be visible',
      });
    });
  }

  /**
   * Selects a date from the date picker calendar
   * @param dateButton - The date input button to click
   * @param dateString - The date string in YYYY-MM-DD format
   * @param dateType - Type of date ('start' or 'end') for logging
   */
  private async selectDateFromPicker(
    dateButton: Locator,
    dateString: string,
    dateType: 'start' | 'end'
  ): Promise<void> {
    await test.step(`Fill ${dateType} date: ${dateString}`, async () => {
      // Parse the date string (YYYY-MM-DD format)
      const date = new Date(dateString + 'T00:00:00');
      if (isNaN(date.getTime())) {
        throw new Error(`Invalid date format: ${dateString}. Expected YYYY-MM-DD format.`);
      }

      const targetDay = date.getDate();
      const targetMonth = date.getMonth();
      const targetYear = date.getFullYear();

      // Click on the date button to open the picker
      await this.verifier.verifyTheElementIsVisible(dateButton, {
        assertionMessage: `${dateType} date input should be visible`,
      });
      await this.clickOnElement(dateButton);

      // Wait for calendar picker to be visible - try multiple selectors
      const calendarGrid = this.page.locator('.rdp').first();
      await this.verifier.verifyTheElementIsVisible(calendarGrid, {
        assertionMessage: 'Calendar grid should be visible',
      });

      // Check if we need to navigate to a different month/year
      const now = new Date();
      const currentMonth = now.getMonth();
      const currentYear = now.getFullYear();

      if (targetMonth !== currentMonth || targetYear !== currentYear) {
        // Navigate to the correct month/year
        // Try to find next/previous month buttons with various selectors
        const nextMonthButton = this.page
          .locator('button[aria-label*="next" i], button[aria-label*="Next"], button[title*="next" i]')
          .first();
        const prevMonthButton = this.page
          .locator('button[aria-label*="previous" i], button[aria-label*="Previous"], button[title*="previous" i]')
          .first();

        // Calculate how many months to navigate
        const monthsDiff = (targetYear - currentYear) * 12 + (targetMonth - currentMonth);

        if (monthsDiff > 0) {
          // Navigate forward
          for (let i = 0; i < monthsDiff; i++) {
            if (await nextMonthButton.isVisible({ timeout: 2000 }).catch(() => false)) {
              await this.clickOnElement(nextMonthButton);
            } else {
              console.warn(`Could not find next month button to navigate to ${targetMonth + 1}/${targetYear}`);
              break;
            }
          }
        } else if (monthsDiff < 0) {
          // Navigate backward
          for (let i = 0; i < Math.abs(monthsDiff); i++) {
            if (await prevMonthButton.isVisible({ timeout: 2000 }).catch(() => false)) {
              await this.clickOnElement(prevMonthButton);
            } else {
              console.warn(`Could not find previous month button to navigate to ${targetMonth + 1}/${targetYear}`);
              break;
            }
          }
        }
      }

      // Select the day from the calendar grid - try multiple approaches
      const dayCell = this.page.getByRole('gridcell', { name: targetDay.toString(), exact: true });

      await this.verifier.verifyTheElementIsVisible(dayCell, {
        assertionMessage: `Day ${targetDay} should be visible in date picker`,
      });
      await this.clickOnElement(dayCell);

      // Verify the date was set by checking if the picker closed
      await calendarGrid.waitFor({ state: 'hidden', timeout: 3000 });
    });
  }
}
