import { Locator, Page, Response, test } from '@playwright/test';

import { PAGE_ENDPOINTS } from '@core/constants/pageEndpoints';
import { BasePage } from '@core/pages/basePage';

import { EventCreationPage } from './eventCreationPage';

export interface IEventDetailActions {
  clickRsvpOption: (option: 'yes' | 'no' | 'maybe') => Promise<void>;
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
  verifyRsvpSelection: (expectedOption: 'yes' | 'no' | 'maybe', maxRetries?: number) => Promise<void>;
}

export class EventDetailPage extends BasePage implements IEventDetailActions, IEventDetailAssertions {
  // Event detail locators - read-only view
  readonly eventTitleHeading: Locator;
  readonly rsvpYesIndicator: Locator;
  readonly rsvpNoIndicator: Locator;
  readonly rsvpMaybeIndicator: Locator;

  // RSVP attendance verification locators
  readonly attendingCountLocator: Locator;
  readonly attendingStatusTextLocator: Locator;

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

    // Event content locators
    this.eventTitleHeading = page.locator('//h1[@class="type--h1 Hero-heading"]');

    // Event Sync locators
    this.rsvpYesIndicator = page.locator('//input[@id="rsvpYes"]');
    this.rsvpNoIndicator = page.locator('//input[@id="rsvpNo"]');
    this.rsvpMaybeIndicator = page.locator('//input[@id="rsvpMaybe"]');

    // RSVP attendance verification locators (based on the UI structure from image)
    this.attendingCountLocator = page.locator('//h3[@class="type--stamp" and contains(text(), "Attending")]');
    this.attendingStatusTextLocator = page.locator(
      '//div[@class="type--secondary type--b2" and contains(text(), "attending this event")]'
    );

    // Event actions locators
    this.threeDotsMenuLocator = page.locator('//button[.//i[@data-testid="i-threeDots"]]');
    this.deleteButtonLocator = page.locator('//button[@title="Delete"]');
    this.deleteSpanLocator = page.locator('//span[text()="Delete"]');
    this.unpublishButtonLocator = page.locator('//button[@title="Unpublish this event"]');
    this.publishButtonLocator = page.locator('//button[@title="Publish this event"]');
    this.editButtonLocator = page.locator('//button[text()="Edit"]');
    this.eventSyncToggleLocator = page.locator('//button[@role="switch"]');
    this.removeSyncButtonLocator = page.locator('//button[text()="Remove sync"]');
  }

  // Actions getter
  get actions(): IEventDetailActions {
    return this;
  }

  // Assertions getter
  get assertions(): IEventDetailAssertions {
    return this;
  }

  /**
   * Clicks on the specified RSVP option (yes, no, or maybe)
   */
  async clickRsvpOption(option: 'yes' | 'no' | 'maybe'): Promise<void> {
    await test.step(`Click RSVP option: ${option}`, async () => {
      let targetLocator: Locator;

      switch (option.toLowerCase()) {
        case 'yes':
          targetLocator = this.rsvpYesIndicator;
          break;
        case 'no':
          targetLocator = this.rsvpNoIndicator;
          break;
        case 'maybe':
          targetLocator = this.rsvpMaybeIndicator;
          break;
        default:
          throw new Error(`Invalid RSVP option: ${option}. Valid options are: 'yes', 'no', 'maybe'`);
      }

      // Verify element is visible
      await this.verifier.verifyTheElementIsVisible(targetLocator, {
        assertionMessage: `RSVP ${option} option should be visible before clicking`,
        timeout: 15000,
      });

      // Force click since normal click doesn't work reliably
      await targetLocator.click({ force: true });
      console.log(`✅ Clicked RSVP option: ${option}`);
    });
  }

  /**
   * Deletes the event by hovering over three dots menu and clicking delete button
   */
  async deleteEvent(): Promise<void> {
    await test.step('Delete event via three dots menu', async () => {
      await this.threeDotsMenuLocator.click({ force: true });
      await this.page.waitForTimeout(500);

      if (await this.deleteButtonLocator.isVisible()) {
        await this.deleteButtonLocator.click({ force: true });
        await this.page.waitForTimeout(500);

        if (await this.deleteSpanLocator.isVisible()) {
          await this.deleteSpanLocator.click({ force: true });
        } else {
          throw new Error('Delete span not visible after clicking delete button');
        }
      } else {
        throw new Error('Delete button not visible after clicking three dots menu');
      }
    });
  }

  /**
   * Unpublishes the event by hovering over three dots menu and clicking unpublish button
   */
  async unpublishEvent(): Promise<void> {
    await test.step('Unpublish event via three dots menu', async () => {
      await this.threeDotsMenuLocator.click({ force: true });
      await this.page.waitForTimeout(500);

      if (await this.unpublishButtonLocator.isVisible()) {
        await this.unpublishButtonLocator.click({ force: true });
      } else {
        throw new Error('Unpublish button not visible after clicking three dots menu');
      }
    });
  }

  /**
   * Publishes the event by hovering over three dots menu and clicking publish button
   */
  async publishEvent(): Promise<void> {
    await test.step('Publish event via three dots menu', async () => {
      await this.threeDotsMenuLocator.click({ force: true });
      await this.page.waitForTimeout(500);

      if (await this.publishButtonLocator.isVisible()) {
        await this.publishButtonLocator.click({ force: true });
      } else {
        throw new Error('Publish button not visible after clicking three dots menu');
      }
    });
  }

  /**
   * Edits the event by clicking Edit button, filling new details, and publishing
   */
  async editEvent(options: { title?: string; description?: string; location?: string }): Promise<void> {
    return await test.step('Edit event details', async () => {
      // Click Edit button
      await this.editButtonLocator.click();

      // Wait for edit page to load completely - use networkidle for rich text editors
      // await this.page.waitForLoadState('networkidle');
      await this.page.waitForTimeout(3000); // Extra wait for rich text editor initialization

      // Create EventCreationPage instance to use its methods
      const eventCreationPage = new EventCreationPage(this.page);

      // Fill event details if provided
      if (options.title || options.description || options.location) {
        await eventCreationPage.fillEventDetails({
          title: options.title || '',
          description: options.description || '',
          location: options.location || '',
        });
      }

      // Publish the updated event
      await eventCreationPage.publishEditEventChanges();
    });
  }

  /**
   * Toggles event sync on/off by clicking the event sync toggle switch
   */
  async toggleEventSync(enable: boolean): Promise<void> {
    await test.step(`${enable ? 'Enable' : 'Disable'} event sync`, async () => {
      // Navigate to edit page
      await this.editButtonLocator.click();
      await this.page.waitForTimeout(3000);

      // Wait for toggle and check current state
      await this.eventSyncToggleLocator.waitFor({ state: 'visible', timeout: 10000 });
      const toggleState = await this.eventSyncToggleLocator.getAttribute('data-state');
      const ariaChecked = await this.eventSyncToggleLocator.getAttribute('aria-checked');
      const isCurrentlyEnabled = toggleState === 'checked' || ariaChecked === 'true';

      console.log(`Event sync: ${isCurrentlyEnabled ? 'enabled' : 'disabled'} → ${enable ? 'enabled' : 'disabled'}`);

      // Toggle if state needs to change
      if (isCurrentlyEnabled !== enable) {
        await this.eventSyncToggleLocator.click({ force: true });
        await this.page.waitForTimeout(1000);

        // If disabling sync, click "Remove sync" button if it appears
        if (!enable) {
          try {
            await this.removeSyncButtonLocator.waitFor({ state: 'visible', timeout: 5000 });
            if (await this.removeSyncButtonLocator.isVisible()) {
              await this.removeSyncButtonLocator.click({ force: true });
              console.log('✅ "Remove sync" button clicked');
            }
          } catch (error) {
            // Continue if "Remove sync" button not found
          }
        }
      }

      // Save changes
      const eventCreationPage = new EventCreationPage(this.page);
      if (await eventCreationPage.publishChangeButton.isVisible()) {
        await eventCreationPage.publishEditEventChanges();
      }

      console.log(`✅ Event sync ${enable ? 'enabled' : 'disabled'} successfully`);
    });
  }

  /**
   * Verifies the event detail page is loaded
   */
  async verifyThePageIsLoaded(): Promise<void> {
    await test.step('Verify event detail page is loaded', async () => {
      await this.verifier.verifyTheElementIsVisible(this.eventTitleHeading, {
        assertionMessage: 'Event title should be visible on event detail page',
        timeout: 10000,
      });

      await this.page.waitForLoadState('domcontentloaded');
      console.log('✅ Event detail page loaded successfully');
    });
  }

  /**
   * Verifies the event title matches expected value
   */
  async verifyEventTitle(expectedTitle: string): Promise<void> {
    await test.step(`Verify event title: ${expectedTitle}`, async () => {
      await this.verifier.verifyElementContainsText(this.eventTitleHeading, expectedTitle, {
        assertionMessage: `Event title should contain "${expectedTitle}"`,
      });
      console.log(`✅ Event title verified: ${expectedTitle}`);
    });
  }

  /**
   * Verifies the RSVP indicators are visible
   */
  async verifyRsvpIndicators(): Promise<void> {
    await test.step('Verify RSVP indicators', async () => {
      await this.verifier.verifyTheElementIsVisible(this.rsvpYesIndicator, {
        assertionMessage: 'RSVP Yes indicator should be visible',
      });
      await this.verifier.verifyTheElementIsVisible(this.rsvpNoIndicator, {
        assertionMessage: 'RSVP No indicator should be visible',
      });
      await this.verifier.verifyTheElementIsVisible(this.rsvpMaybeIndicator, {
        assertionMessage: 'RSVP Maybe indicator should be visible',
      });
      console.log('✅ RSVP indicators verified');
    });
  }

  /**
   * Verifies the selected RSVP state with retry logic using attendance count and status text
   */
  async verifyRsvpSelection(expectedOption: 'yes' | 'no' | 'maybe', maxRetries: number = 5): Promise<void> {
    await test.step(`Verify RSVP selection: ${expectedOption}`, async () => {
      const expectedCount = expectedOption === 'yes' ? 'Attending (1)' : 'Attending (0)';

      for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
          // Wait for sync with exponential backoff
          await this.page.waitForTimeout(attempt * 2000);

          const attendingCountText = await this.attendingCountLocator.textContent();

          if (attendingCountText?.trim() === expectedCount) {
            console.log(`RSVP ${expectedOption} verified: ${attendingCountText} (attempt ${attempt})`);
            return; // Success - exit immediately
          }

          console.log(`Attempt ${attempt}/${maxRetries}: Expected "${expectedCount}", got "${attendingCountText}"`);

          // Refresh page for next attempt (except last)
          if (attempt < maxRetries) {
            await this.page.reload();
          }
        } catch (error) {
          console.log(`Attempt ${attempt} failed:`, error);
          if (attempt === maxRetries) throw error;
        }
      }

      throw new Error(`RSVP ${expectedOption} not verified after ${maxRetries} attempts. Expected: "${expectedCount}"`);
    });
  }
}
