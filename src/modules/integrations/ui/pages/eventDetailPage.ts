import { expect, Locator, Page, test } from '@playwright/test';

import { PAGE_ENDPOINTS } from '@core/constants/pageEndpoints';

import { EventSyncDestination } from '@/src/core/types/contentManagement.types';
import { BasePage } from '@/src/core/ui/pages/basePage';
import { EventCreationPage } from '@/src/modules/content/ui/pages/eventCreationPage';

export enum RsvpOption {
  YES = 'yes',
  NO = 'no',
  MAYBE = 'maybe',
}

export interface IEventDetailActions {
  clickRsvpOption: (option: RsvpOption) => Promise<void>;
  deleteEvent: () => Promise<void>;
  unpublishEvent: () => Promise<void>;
  publishEvent: () => Promise<void>;
  editEvent: (options: { title?: string; description?: string; location?: string }) => Promise<void>;
  toggleEventSync: (enable: boolean, destination?: EventSyncDestination) => Promise<void>;
}

export interface IEventDetailAssertions {
  verifyThePageIsLoaded: () => Promise<void>;
  verifyEventTitle: (expectedTitle: string) => Promise<void>;
  verifyRsvpIndicators: () => Promise<void>;
  verifyRsvpSelection: (expectedOption: RsvpOption | 'yes' | 'no' | 'maybe', maxRetries?: number) => Promise<void>;
  verifyOutlookRsvpDisclaimer: () => Promise<void>;
  verifyEventDetails: () => Promise<void>;
  verifyRsvpToOutlookCalendarLabel: () => Promise<void>;
  verifySyncedFromOutlookCalendar: () => Promise<void>;
  verifyRemovingSyncingWillDeleteEventFromOutlookCalendars: () => Promise<void>;
  verifyRemovingSyncingWillDeleteEventFromGoogleCalendars: () => Promise<void>;
  verifyOutlookCalendarSyncRequiresUsersConnectTheirMicrosoftAccounts: () => Promise<void>;
  verifyGoogleCalendarSyncRequiresUsersConnectTheirGoogleAccounts: () => Promise<void>;
}

export class EventDetailPage extends BasePage implements IEventDetailActions, IEventDetailAssertions {
  // Event detail locators - read-only view
  readonly eventTitleHeading: Locator;

  // RSVP attendance verification locators
  readonly attendingCountLocator: Locator;
  readonly attendingStatusTextLocator: Locator;

  // RSVP option locators
  readonly rsvpYesRadioLocator: Locator;
  readonly rsvpNoRadioLocator: Locator;
  readonly rsvpMaybeRadioLocator: Locator;

  // Event actions locators
  readonly threeDotsMenuLocator: Locator;
  readonly deleteButtonLocator: Locator;
  readonly deleteSpanLocator: Locator;
  readonly unpublishButtonLocator: Locator;
  readonly publishButtonLocator: Locator;
  readonly publishChangesButtonLocator: Locator;
  readonly editButtonLocator: Locator;
  readonly changeButtonLocator: Locator;
  readonly noChangeConnectedAccountButtonLocator: Locator;
  readonly confirmChangeButtonLocator: Locator;
  readonly crossIconLocator: Locator;
  readonly inputBoxAuthorByNameLocator: Locator;
  readonly eventSyncToggleLocator: Locator;
  readonly removeSyncButtonLocator: Locator;
  readonly eventSyncGoogleCalendarLabelLocator: Locator;
  readonly eventSyncOutlookCalendarLabelLocator: Locator;
  readonly outlookRsvpDisclaimerLocator: Locator;
  readonly inviteOrRemoveAttendeesButtonLocator: Locator;
  readonly locationLocator: Locator;
  readonly addToOtherCalendarsButtonLocator: Locator;
  readonly rsvpToOutlookCalendarLabelLocator: Locator;
  readonly syncedFromOutlookCalendarLocator: Locator;
  readonly removingSyncingWillDeleteEventFromOutlookCalendarsLocator: Locator;
  readonly removingSyncingWillDeleteEventFromGoogleCalendarsLocator: Locator;
  readonly outlookCalendarSyncRequiresUsersConnectTheirMicrosoftAccountsLocator: Locator;
  readonly googleCalendarSyncRequiresUsersConnectTheirGoogleAccountsLocator: Locator;

  constructor(page: Page, siteId: string, eventId: string) {
    super(page, PAGE_ENDPOINTS.getContentPreviewPage(siteId, eventId, 'event'));

    this.crossIconLocator = page.getByLabel('Clear search');
    this.changeButtonLocator = page.getByRole('button', { name: 'Change', exact: true });
    this.inputBoxAuthorByNameLocator = page.locator("//input[@id='authoredBy']");
    this.noChangeConnectedAccountButtonLocator = page.getByText(/No, change connected account/i);
    this.confirmChangeButtonLocator = page.getByText(/Confirm/i);
    this.eventTitleHeading = page.locator('//h1[@class="type--h1 Hero-heading"]');
    this.attendingCountLocator = page.locator('//h3[@class="type--stamp" and contains(text(), "Attending")]');
    this.attendingStatusTextLocator = page.locator(
      '//div[@class="type--secondary type--b2" and contains(text(), "attending this event")]'
    );
    this.rsvpYesRadioLocator = page.getByRole('radio', { name: 'Yes' });
    this.rsvpNoRadioLocator = page.getByRole('radio', { name: 'No' });
    this.rsvpMaybeRadioLocator = page.getByRole('radio', { name: 'Maybe' });
    this.threeDotsMenuLocator = page.getByTestId('i-threeDots').locator('..');
    this.deleteButtonLocator = page.getByRole('button', { name: 'Delete' });
    this.deleteSpanLocator = page.locator('//span[text()="Delete"]');
    this.unpublishButtonLocator = page.locator('//button[@title="Unpublish this event"]');
    this.publishButtonLocator = page.locator('//button[@title="Publish this event"]');
    this.publishChangesButtonLocator = page.getByText(/Publish changes/i);

    this.editButtonLocator = page.getByRole('button', { name: 'Edit' });
    this.eventSyncToggleLocator = page.getByRole('switch');
    this.removeSyncButtonLocator = page.getByRole('button', { name: 'Remove sync' });
    this.eventSyncGoogleCalendarLabelLocator = page.locator(
      '//label[@for="eventSync_destinationgooglecalendar" and @title="Google Calendar sync"]'
    );
    this.eventSyncOutlookCalendarLabelLocator = page.locator(
      '//label[@for="eventSync_destinationoutlook" and @title="Outlook Calendar sync"]'
    );
    this.outlookRsvpDisclaimerLocator = page.getByText("As the organizer, Outlook doesn't track your RSVP.");
    this.inviteOrRemoveAttendeesButtonLocator = page.getByRole('button', { name: 'Invite or remove attendees' });
    this.locationLocator = page.getByText('Location', { exact: true });
    this.addToOtherCalendarsButtonLocator = page.getByText('Add to other calendars');
    this.rsvpToOutlookCalendarLabelLocator = page.getByText('RSVPing this event adds it to your Outlook Calendar');
    this.syncedFromOutlookCalendarLocator = page.getByText(/Synced from Outlook Calendar on/i);
    this.removingSyncingWillDeleteEventFromOutlookCalendarsLocator = page.locator(
      "//h4[text()='Removing syncing will delete this event from all site members and followers’ Outlook Calendars. They can no longer RSVP from their Outlook Calendars.']"
    );
    this.removingSyncingWillDeleteEventFromGoogleCalendarsLocator = page.locator(
      "//h4[text()='Removing syncing will delete this event from all site members and followers’ Google Calendars. They can no longer RSVP from their Google Calendars.']"
    );
    this.outlookCalendarSyncRequiresUsersConnectTheirMicrosoftAccountsLocator = page.locator(
      "//h4[text()='Outlook Calendar sync requires users connect their Microsoft accounts']"
    );
    this.googleCalendarSyncRequiresUsersConnectTheirGoogleAccountsLocator = page.locator(
      "//h4[text()='Google Calendar sync requires users to connect their Google accounts']"
    );
  }

  get actions(): IEventDetailActions {
    return this;
  }

  get assertions(): IEventDetailAssertions {
    return this;
  }

  /**
   * Clicks on the specified RSVP option (yes, no, or maybe)
   */
  async clickRsvpOption(option: RsvpOption): Promise<void> {
    await test.step(`Click RSVP option: ${option}`, async () => {
      let targetLocator: Locator;

      await this.verifyThePageIsLoaded();

      switch (option) {
        case RsvpOption.YES:
          targetLocator = this.rsvpYesRadioLocator;
          break;
        case RsvpOption.NO:
          targetLocator = this.rsvpNoRadioLocator;
          break;
        case RsvpOption.MAYBE:
          targetLocator = this.rsvpMaybeRadioLocator;
          break;
        default:
          throw new Error(`Invalid RSVP option: ${option}`);
      }

      await targetLocator.click({ force: true });
    });
  }

  /**
   * Deletes the event via three dots menu
   */
  async deleteEvent(): Promise<void> {
    await test.step('Delete event via three dots menu', async () => {
      await this.threeDotsMenuLocator.click({ force: true });
      await expect(this.deleteButtonLocator).toBeVisible({ timeout: 10000 });
      await this.deleteButtonLocator.click({ force: true });
      await expect(this.deleteSpanLocator).toBeVisible({ timeout: 10000 });
      await this.deleteSpanLocator.click({ force: true });
    });
  }

  /**
   * Unpublishes the event via three dots menu
   */
  async unpublishEvent(): Promise<void> {
    await test.step('Unpublish event via three dots menu', async () => {
      await this.threeDotsMenuLocator.click({ force: true });
      await expect(this.unpublishButtonLocator).toBeVisible({ timeout: 10000 });
      if (await this.unpublishButtonLocator.isVisible()) {
        await this.unpublishButtonLocator.click({ force: true });
      } else {
        throw new Error('Unpublish button not visible after clicking three dots menu');
      }
    });
  }

  async publishEvent(): Promise<void> {
    await test.step('Publish event via three dots menu', async () => {
      await this.threeDotsMenuLocator.click({ force: true });

      if (await this.publishButtonLocator.isVisible()) {
        await this.publishButtonLocator.click({ force: true });
      } else {
        throw new Error('Publish button not visible after clicking three dots menu');
      }
    });
  }

  async changeEventAuthor(author: string): Promise<void> {
    await test.step('Change event author', async () => {
      await this.editButtonLocator.click();
      await this.page.waitForLoadState('domcontentloaded');

      await this.changeButtonLocator.click();
      await this.crossIconLocator.click();
      await this.inputBoxAuthorByNameLocator.fill(author);
      await this.page.waitForTimeout(5000);
      await this.page.keyboard.press('Enter');

      await this.noChangeConnectedAccountButtonLocator.click();
      await this.confirmChangeButtonLocator.click();

      await this.publishChangesButtonLocator.click();
    });
  }

  getEventAuthorLocator(expectedAuthor: string): Locator {
    return this.page.getByRole('link', { name: expectedAuthor });
  }

  async verifyEventAuthor(expectedAuthor: string): Promise<void> {
    await test.step('Verify event author', async () => {
      const eventAuthorLocator = this.getEventAuthorLocator(expectedAuthor);
      await this.verifier.verifyElementContainsText(eventAuthorLocator, expectedAuthor, {
        assertionMessage: `Event author should contain "${expectedAuthor}"`,
      });
    });
  }

  async editEvent(options: { title?: string; description?: string; location?: string }): Promise<void> {
    return await test.step('Edit event details', async () => {
      await this.editButtonLocator.click();
      await this.page.waitForLoadState('domcontentloaded');

      const eventCreationPage = new EventCreationPage(this.page);

      if (options.title || options.description || options.location) {
        await eventCreationPage.fillEventDetails({
          title: options.title || '',
          description: options.description || '',
          location: options.location || '',
        });
      }

      await eventCreationPage.publishEditEventChanges();
    });
  }

  async toggleEventSync(enable: boolean, destination?: EventSyncDestination): Promise<void> {
    await test.step(`${enable ? 'Enable' : 'Disable'} event sync`, async () => {
      await this.editButtonLocator.click();
      await this.page.waitForLoadState('domcontentloaded');

      await this.eventSyncToggleLocator.waitFor({ state: 'visible', timeout: 10000 });
      const toggleState = await this.eventSyncToggleLocator.getAttribute('data-state');
      const ariaChecked = await this.eventSyncToggleLocator.getAttribute('aria-checked');
      const isCurrentlyEnabled = toggleState === 'checked' || ariaChecked === 'true';

      if (isCurrentlyEnabled) {
        if (destination === EventSyncDestination.OUTLOOK_CALENDAR) {
          await this.verifyOutlookCalendarSyncRequiresUsersConnectTheirMicrosoftAccounts();
        } else {
          await this.verifyGoogleCalendarSyncRequiresUsersConnectTheirGoogleAccounts();
        }
      }

      if (isCurrentlyEnabled !== enable) {
        await this.eventSyncToggleLocator.click({ force: true });

        if (!enable) {
          await this.removeSyncButtonLocator.waitFor({ state: 'visible', timeout: 5000 });
          if (await this.removeSyncButtonLocator.isVisible()) {
            if (destination === EventSyncDestination.OUTLOOK_CALENDAR) {
              await this.verifyRemovingSyncingWillDeleteEventFromOutlookCalendars();
            } else if (destination === EventSyncDestination.GOOGLE_CALENDAR) {
              await this.verifyRemovingSyncingWillDeleteEventFromGoogleCalendars();
            }
            await this.removeSyncButtonLocator.click({ force: true });
          }
        }

        if (destination && enable) {
          if (destination === EventSyncDestination.GOOGLE_CALENDAR) {
            await this.eventSyncGoogleCalendarLabelLocator.click({ force: true });
          } else {
            await this.eventSyncOutlookCalendarLabelLocator.click({ force: true });
          }
        }
      }

      const eventCreationPage = new EventCreationPage(this.page);
      if (await eventCreationPage.publishChangeButton.isVisible()) {
        await eventCreationPage.publishEditEventChanges();
      }
    });
  }

  async verifyThePageIsLoaded(): Promise<void> {
    await test.step('Verify event detail page is loaded', async () => {
      await this.verifier.verifyTheElementIsVisible(this.eventTitleHeading, {
        assertionMessage: 'Event title should be visible on event detail page',
        timeout: 30000,
      });
      await this.page.waitForLoadState('domcontentloaded');
    });
  }

  async verifyEventTitle(expectedTitle: string): Promise<void> {
    await test.step(`Verify event title: ${expectedTitle}`, async () => {
      await this.verifier.verifyElementContainsText(this.eventTitleHeading, expectedTitle, {
        assertionMessage: `Event title should contain "${expectedTitle}"`,
      });
    });
  }

  async verifyRsvpIndicators(): Promise<void> {
    await test.step('Verify RSVP indicators', async () => {
      await expect(this.rsvpYesRadioLocator).toBeVisible();
      await expect(this.rsvpNoRadioLocator).toBeVisible();
      await expect(this.rsvpMaybeRadioLocator).toBeVisible();
    });
  }

  async verifyRsvpSelection(expectedOption: 'yes' | 'no' | 'maybe', maxRetries: number = 5): Promise<void> {
    await test.step(`Verify RSVP selection: ${expectedOption}`, async () => {
      const expectedCount = expectedOption === 'yes' ? 'Attending (1)' : 'Attending (0)';

      for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
          await this.page.waitForTimeout(attempt * 1000);
          await this.attendingCountLocator.waitFor({ state: 'visible', timeout: 10000 });

          const attendingCountText = await this.attendingCountLocator.textContent();

          if (attendingCountText?.trim() === expectedCount) {
            return;
          }

          if (attempt < maxRetries) {
            await this.page.reload();
            await this.page.waitForLoadState('domcontentloaded');
          }
        } catch (error) {
          if (attempt === maxRetries) throw error;
        }
      }

      throw new Error(`RSVP ${expectedOption} not verified after ${maxRetries} attempts. Expected: "${expectedCount}"`);
    });
  }

  async verifyOutlookRsvpDisclaimer(): Promise<void> {
    await test.step('Verify Outlook RSVP disclaimer text', async () => {
      await this.verifier.verifyTheElementIsVisible(this.outlookRsvpDisclaimerLocator, {
        timeout: 10_000,
        assertionMessage: 'Outlook RSVP disclaimer should be visible',
      });
    });
  }

  async verifyEventDetails(): Promise<void> {
    await test.step('Verify event details are visible', async () => {
      await this.verifier.verifyTheElementIsVisible(this.inviteOrRemoveAttendeesButtonLocator, {
        timeout: 10_000,
        assertionMessage: 'Invite or remove attendees button should be visible',
      });

      await this.verifier.verifyTheElementIsVisible(this.locationLocator, {
        timeout: 10_000,
        assertionMessage: 'Location should be visible',
      });

      await this.verifier.verifyTheElementIsVisible(this.addToOtherCalendarsButtonLocator, {
        timeout: 10_000,
        assertionMessage: 'Add to other calendars button should be visible',
      });
    });
  }

  async verifyRsvpToOutlookCalendarLabel(): Promise<void> {
    await test.step('Verify RSVP to Outlook Calendar label text', async () => {
      await this.verifier.verifyTheElementIsVisible(this.rsvpToOutlookCalendarLabelLocator, {
        timeout: 10_000,
        assertionMessage: 'RSVP to Outlook Calendar label should be visible',
      });
    });
  }

  async verifySyncedFromOutlookCalendar(): Promise<void> {
    await test.step('Verify Synced from Outlook Calendar on text', async () => {
      await this.verifier.verifyTheElementIsVisible(this.syncedFromOutlookCalendarLocator, {
        timeout: 10_000,
        assertionMessage: 'Synced from Outlook Calendar on text should be visible',
      });
    });
  }

  async verifyRemovingSyncingWillDeleteEventFromOutlookCalendars(): Promise<void> {
    await test.step('Verify removing syncing will delete event from Outlook Calendars warning text', async () => {
      await this.verifier.verifyTheElementIsVisible(this.removingSyncingWillDeleteEventFromOutlookCalendarsLocator, {
        timeout: 10_000,
        assertionMessage: 'Removing syncing will delete event from Outlook Calendars warning should be visible',
      });
    });
  }

  async verifyRemovingSyncingWillDeleteEventFromGoogleCalendars(): Promise<void> {
    await test.step('Verify removing syncing will delete event from Google Calendars warning text', async () => {
      await this.verifier.verifyTheElementIsVisible(this.removingSyncingWillDeleteEventFromGoogleCalendarsLocator, {
        timeout: 10_000,
        assertionMessage: 'Removing syncing will delete event from Google Calendars warning should be visible',
      });
    });
  }

  async verifyOutlookCalendarSyncRequiresUsersConnectTheirMicrosoftAccounts(): Promise<void> {
    await test.step('Verify Outlook Calendar sync requires users to connect their Microsoft accounts text', async () => {
      await this.verifier.verifyTheElementIsVisible(
        this.outlookCalendarSyncRequiresUsersConnectTheirMicrosoftAccountsLocator,
        {
          timeout: 10_000,
          assertionMessage:
            'Outlook Calendar sync requires users to connect their Microsoft accounts text should be visible',
        }
      );
    });
  }

  async verifyGoogleCalendarSyncRequiresUsersConnectTheirGoogleAccounts(): Promise<void> {
    await test.step('Verify Google Calendar sync requires users to connect their Google accounts text', async () => {
      await this.verifier.verifyTheElementIsVisible(
        this.googleCalendarSyncRequiresUsersConnectTheirGoogleAccountsLocator,
        {
          timeout: 10_000,
          assertionMessage:
            'Google Calendar sync requires users to connect their Google accounts text should be visible',
        }
      );
    });
  }
}
