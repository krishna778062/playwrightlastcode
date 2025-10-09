import { expect, Locator, Page, test } from '@playwright/test';

import { PAGE_ENDPOINTS } from '@core/constants/pageEndpoints';

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
  toggleEventSync: (enable: boolean) => Promise<void>;
}

export interface IEventDetailAssertions {
  verifyThePageIsLoaded: () => Promise<void>;
  verifyEventTitle: (expectedTitle: string) => Promise<void>;
  verifyRsvpIndicators: () => Promise<void>;
  verifyRsvpSelection: (expectedOption: RsvpOption | 'yes' | 'no' | 'maybe', maxRetries?: number) => Promise<void>;
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
  readonly editButtonLocator: Locator;
  readonly eventSyncToggleLocator: Locator;
  readonly removeSyncButtonLocator: Locator;

  constructor(page: Page, siteId: string, eventId: string) {
    super(page, PAGE_ENDPOINTS.getContentPreviewPage(siteId, eventId, 'event'));

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
    this.editButtonLocator = page.getByRole('button', { name: 'Edit' });
    this.eventSyncToggleLocator = page.getByRole('switch');
    this.removeSyncButtonLocator = page.getByRole('button', { name: 'Remove sync' });
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

      if (await this.unpublishButtonLocator.isVisible()) {
        await this.unpublishButtonLocator.click({ force: true });
      } else {
        throw new Error('Unpublish button not visible after clicking three dots menu');
      }
    });
  }

  /**
   * Publishes the event via three dots menu
   */
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

  /**
   * Edits the event details and publishes changes
   */
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

  /**
   * Toggles event sync on/off
   */
  async toggleEventSync(enable: boolean): Promise<void> {
    await test.step(`${enable ? 'Enable' : 'Disable'} event sync`, async () => {
      await this.editButtonLocator.click();
      await this.page.waitForLoadState('domcontentloaded');

      await this.eventSyncToggleLocator.waitFor({ state: 'visible', timeout: 10000 });
      const toggleState = await this.eventSyncToggleLocator.getAttribute('data-state');
      const ariaChecked = await this.eventSyncToggleLocator.getAttribute('aria-checked');
      const isCurrentlyEnabled = toggleState === 'checked' || ariaChecked === 'true';

      if (isCurrentlyEnabled !== enable) {
        await this.eventSyncToggleLocator.click({ force: true });

        if (!enable) {
          await this.removeSyncButtonLocator.waitFor({ state: 'visible', timeout: 5000 });
          if (await this.removeSyncButtonLocator.isVisible()) {
            await this.removeSyncButtonLocator.click({ force: true });
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
        timeout: 10000,
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
}
