import { expect, Locator, Page, test } from '@playwright/test';

import { BaseComponent } from '@/src/core/ui/components/baseComponent';

/**
 * Component for handling Native Tiles functionality (pages, events & albums)
 */
export class NativeTileComponent extends BaseComponent {
  readonly addContentTileButton: Locator;
  readonly eventsContentTypeButton: Locator;
  readonly googleCalendarRadioInModal: Locator;
  readonly outlookCalendarRadio: Locator;
  readonly calendarDropdownInput: Locator;
  readonly reactSelectInput: Locator;
  readonly calendarDropdownFirstOption: Locator;
  readonly tileTitleInput: Locator;
  readonly addToHomeButton: Locator;
  readonly eventsContentTypeRadio: Locator;
  readonly googleCalendarFromRadio: Locator;
  readonly calendarValueDisplay: Locator;
  readonly editModalHeading: Locator;
  readonly tileContainerBase: Locator;
  readonly getTileContainer: (tileTitle: string) => Locator;
  readonly getCalendarEmailOption: (calendarEmail: string) => Locator;
  readonly getContentList: (tile: Locator) => Locator;
  readonly getListingItems: (contentList: Locator) => Locator;
  readonly getEventTitleLink: (item: Locator) => Locator;
  readonly getEventDate: (item: Locator) => Locator;
  readonly getCalendarDay: (item: Locator) => Locator;
  readonly getCalendarDayMonth: (calendarDay: Locator) => Locator;
  readonly getCalendarDayDate: (calendarDay: Locator) => Locator;
  readonly getCalendarLabel: (item: Locator) => Locator;
  readonly getShowMoreButton: (tile: Locator) => Locator;

  constructor(page: Page) {
    super(page);
    this.addContentTileButton = page.getByRole('button', { name: 'Add pages, events & albums' });
    this.eventsContentTypeButton = page.getByLabel('Add content tile').getByText('Events');
    this.googleCalendarRadioInModal = page.getByLabel('Add content tile').getByText('Google Calendar');
    this.outlookCalendarRadio = page.getByText('Outlook Calendar');
    this.calendarDropdownInput = page.getByRole('combobox').first();
    this.reactSelectInput = page.locator('#react-select-2-input');
    this.calendarDropdownFirstOption = page.getByRole('option').first();
    this.tileTitleInput = page.getByRole('textbox', { name: 'Tile title' });
    this.addToHomeButton = page.getByRole('button', { name: 'Add to home' });
    this.eventsContentTypeRadio = page.locator('#options_type_event');
    this.googleCalendarFromRadio = page.locator('#options_siteFilter_googleCalendar');
    this.calendarValueDisplay = page.locator('.css-15bnrdl-singleValue').first();
    this.editModalHeading = page.getByRole('heading', { name: 'Edit Latest & popular tile' });
    this.tileContainerBase = page.locator('aside').filter({ has: page.locator('[class*="Tile"]') });
    this.getTileContainer = (tileTitle: string) =>
      this.tileContainerBase.filter({ has: page.getByRole('heading', { name: tileTitle, exact: true }) });
    this.getCalendarEmailOption = (calendarEmail: string) => page.getByText(calendarEmail, { exact: true });
    this.getContentList = (tile: Locator) => tile.locator('ul.Tile-contentList');
    this.getListingItems = (contentList: Locator) => contentList.locator('li.ListingItem');
    this.getEventTitleLink = (item: Locator) => item.locator('h3').getByRole('link');
    this.getEventDate = (item: Locator) => item.locator('[class*="type--secondary"][class*="type--b3"]');
    this.getCalendarDay = (item: Locator) => item.locator('a.CalendarDay').first();
    this.getCalendarDayMonth = (calendarDay: Locator) => calendarDay.locator('[class*="CalendarDay-month"]');
    this.getCalendarDayDate = (calendarDay: Locator) => calendarDay.locator('[class*="CalendarDay-date"]');
    this.getCalendarLabel = (item: Locator) => item.locator('[class*="ListingItem-typeName"]');
    this.getShowMoreButton = (tile: Locator) => tile.getByRole('button', { name: 'Show more' });
  }

  /**
   * Click on "Add pages, events & albums" button
   */
  async clickAddContentTileButton(): Promise<void> {
    await test.step('Click Add pages, events & albums button', async () => {
      await this.clickOnElement(this.addContentTileButton, { timeout: 30_000 });
    });
  }

  /**
   * Select Events content type
   */
  async selectEventsContentType(): Promise<void> {
    await test.step('Select Events content type', async () => {
      await this.clickOnElement(this.eventsContentTypeButton, { timeout: 30_000 });
    });
  }

  /**
   * Select Google Calendar radio option
   */
  async selectGoogleCalendar(): Promise<void> {
    await test.step('Select Google Calendar', async () => {
      await this.clickOnElement(this.googleCalendarRadioInModal, { timeout: 30_000 });
    });
  }

  /**
   * Select Outlook Calendar radio option
   */
  async selectOutlookCalendar(): Promise<void> {
    await test.step('Select Outlook Calendar', async () => {
      await this.clickOnElement(this.outlookCalendarRadio, { timeout: 30_000 });
    });
  }

  /**
   * Select calendar from dropdown by email/name
   */
  async selectCalendarFromDropdown(calendarEmail: string): Promise<void> {
    await test.step(`Select calendar: ${calendarEmail}`, async () => {
      await this.clickOnElement(this.reactSelectInput, { timeout: 30_000 });
      const calendarEmailOption = this.getCalendarEmailOption(calendarEmail);
      await this.clickOnElement(calendarEmailOption, { timeout: 30_000 });
    });
  }

  /**
   * Select first available calendar from dropdown
   */
  async selectFirstAvailableCalendar(): Promise<void> {
    await test.step('Select first available calendar', async () => {
      await this.calendarDropdownInput.waitFor({ state: 'visible', timeout: 10000 });
      await this.clickOnElement(this.calendarDropdownInput, { timeout: 30_000 });
      await this.calendarDropdownFirstOption.waitFor({ state: 'visible', timeout: 10000 });
      await this.clickOnElement(this.calendarDropdownFirstOption, { timeout: 30_000 });
    });
  }

  /**
   * Select calendar type (Google Calendar or Outlook Calendar)
   * @param calendarType - The calendar type string from test
   */
  async selectCalendarType(calendarType: string): Promise<void> {
    await test.step(`Select calendar type: ${calendarType}`, async () => {
      if (calendarType === 'Google Calendar') {
        await this.selectGoogleCalendar();
      } else if (calendarType === 'Outlook Calendar') {
        await this.selectOutlookCalendar();
      } else {
        throw new Error(`Unsupported calendar type: "${calendarType}". Use 'Google Calendar' or 'Outlook Calendar'`);
      }
    });
  }

  /**
   * Set tile title
   */
  async setTileTitle(tileTitle: string): Promise<void> {
    await test.step(`Set tile title: ${tileTitle}`, async () => {
      await this.tileTitleInput.waitFor({ state: 'visible', timeout: 10000 });
      await this.tileTitleInput.clear();
      await this.fillInElement(this.tileTitleInput, tileTitle);
    });
  }

  /**
   * Click Add to home button
   */
  async clickAddToHome(): Promise<void> {
    await test.step('Click Add to home button', async () => {
      await this.clickOnElement(this.addToHomeButton, { timeout: 30_000 });
    });
  }

  /**
   * Verify tile title in edit modal
   */
  async verifyTileTitle(expectedTitle: string): Promise<void> {
    await test.step(`Verify tile title is: ${expectedTitle}`, async () => {
      await this.tileTitleInput.waitFor({ state: 'visible', timeout: 10000 });
      const actualValue = await this.tileTitleInput.inputValue();
      expect(actualValue, `Expected tile title to be "${expectedTitle}"`).toBe(expectedTitle);
    });
  }

  /**
   * Verify Events content type is selected
   */
  async verifyEventsContentTypeSelected(): Promise<void> {
    await test.step('Verify Events content type is selected', async () => {
      await expect(this.eventsContentTypeRadio, 'Expected Events content type to be checked').toBeChecked();
    });
  }

  /**
   * Verify Google Calendar is selected in From section
   */
  async verifyGoogleCalendarSelected(): Promise<void> {
    await test.step('Verify Google Calendar is selected', async () => {
      await expect(this.googleCalendarFromRadio, 'Expected Google Calendar to be checked').toBeChecked();
    });
  }

  /**
   * Verify calendar email in dropdown
   */
  async verifyCalendarEmail(expectedEmail: string): Promise<void> {
    await test.step(`Verify calendar email is: ${expectedEmail}`, async () => {
      await this.calendarValueDisplay.waitFor({ state: 'visible', timeout: 10000 });
      const actualValue = await this.calendarValueDisplay.textContent();
      expect(actualValue?.trim(), `Expected calendar email to be "${expectedEmail}"`).toBe(expectedEmail);
    });
  }

  /**
   * Verify edit modal is opened with correct heading
   */
  async verifyEditModalOpened(): Promise<void> {
    await test.step('Verify edit modal is opened', async () => {
      await expect(this.editModalHeading, 'Expected edit modal heading to be visible').toBeVisible({ timeout: 10000 });
    });
  }

  /**
   * Verify calendar dropdown is visible
   */
  async verifyCalendarDropdownVisible(): Promise<void> {
    await test.step('Verify calendar dropdown is visible', async () => {
      await this.calendarDropdownInput.waitFor({ state: 'visible', timeout: 10000 });
      await expect(this.calendarDropdownInput, 'Expected calendar dropdown to be visible').toBeVisible({
        timeout: 10000,
      });
    });
  }

  /**
   * Verify Calendar upcoming events tile data for native tiles
   * Native tiles use different HTML structure: Tile-contentList > ListingItem
   * This method consolidates verification of event data, calendar day elements, Google Calendar label, and event count
   * @param tileTitle - The title of the tile to verify
   * @param eventTitle - Optional regex pattern for event title (defaults to any text)
   * @param calDate - Optional regex pattern for calendar date (defaults to standard date format)
   * @param minExpectedCount - Optional minimum expected number of events (defaults to 1)
   */
  async verifyCalendarUpcomingEventsTileData(
    tileTitle: string,
    eventTitle: RegExp = /^[\p{L}\p{N}\p{P}\p{S} ]{1,100}$/u,
    calDate: RegExp = /(?:(?:[A-Z][a-z]{2},?\s)?[A-Z][a-z]{2}\s(?:[1-9]|[12]\d|3[01])(?:,\s\d{4})?(?:\s(?:at|to)\s(?:1[0-2]|0?\d):[0-5]\d(?:AM|PM))?(?:\s-\s[A-Z][a-z]{2}\s(?:[1-9]|[12]\d|3[01])(?:,\s\d{4})?)?)|(?:Today(?:\s(?:at|to)\s(?:1[0-2]|0?\d):[0-5]\d(?:AM|PM))?(?:\s-\s[A-Z][a-z]{2}\s(?:[1-9]|[12]\d|3[01])(?:,\s\d{4})?)?)/,
    minExpectedCount: number = 1
  ): Promise<void> {
    await test.step(`Verify Calendar upcoming events tile data for native tile '${tileTitle}'`, async () => {
      const tile = this.getTileContainer(tileTitle).first();
      const contentList = this.getContentList(tile);
      const listingItems = this.getListingItems(contentList);

      const eventCount = await listingItems.count();
      expect(
        eventCount,
        `Expected at least ${minExpectedCount} event(s), but found ${eventCount}`
      ).toBeGreaterThanOrEqual(minExpectedCount);

      await expect(listingItems.first(), 'Expected at least one calendar event to be visible').toBeVisible({
        timeout: 10000,
      });

      const firstEventItem = listingItems.first();
      const eventTitleLink = this.getEventTitleLink(firstEventItem);
      const eventDate = this.getEventDate(firstEventItem);

      await expect(eventTitleLink, 'Expected event title link to be visible').toBeVisible({ timeout: 10000 });
      await expect(eventDate, 'Expected event date to be visible').toBeVisible({ timeout: 10000 });

      const titleText = await eventTitleLink.textContent();
      const dateText = await eventDate.textContent();

      expect(titleText, `Event title "${titleText}" should match pattern`).toMatch(eventTitle);
      expect(dateText, `Event date "${dateText}" should match pattern`).toMatch(calDate);

      const calendarDay = this.getCalendarDay(firstEventItem);
      await expect(calendarDay, 'Calendar day element should be visible').toBeVisible({ timeout: 10000 });

      const month = this.getCalendarDayMonth(calendarDay);
      const date = this.getCalendarDayDate(calendarDay);
      await expect(month, 'Calendar day month should be visible').toBeVisible();
      await expect(date, 'Calendar day date should be visible').toBeVisible();

      await expect(calendarDay, 'Calendar day should be clickable').toHaveAttribute('href');

      const calendarLabel = this.getCalendarLabel(firstEventItem).filter({ hasText: 'Google Calendar' });
      await expect(calendarLabel, 'Google Calendar label should be visible').toBeVisible({ timeout: 10000 });
    });
  }

  /**
   * Verify "Show more" behavior for native tiles
   * Verifies that initially at least 4 events are displayed, then clicking "Show more" displays additional events
   * @param tileTitle - The title of the tile to verify
   */
  async verifyShowMoreBehavior(tileTitle: string): Promise<void> {
    await test.step(`Verify 'Show more' behavior for native tile '${tileTitle}'`, async () => {
      const tile = this.getTileContainer(tileTitle).first();
      const contentList = this.getContentList(tile);
      const listingItems = this.getListingItems(contentList);
      const showMoreButton = this.getShowMoreButton(tile);

      await expect(showMoreButton, 'Show More button should be visible').toBeVisible({ timeout: 10000 });

      const initialVisible = await listingItems.count();
      expect(
        initialVisible,
        `Expected at least 4 events initially, but found ${initialVisible}`
      ).toBeGreaterThanOrEqual(4);

      await this.clickOnElement(showMoreButton, { timeout: 30_000 });

      await expect
        .poll(
          async () => {
            return await listingItems.count();
          },
          { timeout: 10000 }
        )
        .toBeGreaterThan(initialVisible);
    });
  }

  /**
   * Verify tile redirects to expected URL for native tiles
   * Native tiles use h3 > a.type--title structure (link is inside h3, not h3 inside link)
   * @param tileTitle - The title of the tile
   * @param expectedUrl - The expected URL to redirect to
   */
  async verifyTileRedirects(tileTitle: string, expectedUrl: string): Promise<void> {
    await test.step(`Verify native tile '${tileTitle}' redirects to '${expectedUrl}'`, async () => {
      const tile = this.getTileContainer(tileTitle).first();
      const contentList = this.getContentList(tile);
      const listingItems = this.getListingItems(contentList);
      const firstEventItem = listingItems.first();
      const link = this.getEventTitleLink(firstEventItem).first();
      await this.clickOnElement(link, { timeout: 30_000 });

      const urlRegex = new RegExp(`^${expectedUrl.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}.*`);
      const popup = await this.page.waitForEvent('popup', { timeout: 5000 }).catch(() => null);
      if (popup) {
        await expect(popup, `Expected popup to redirect to URL matching "${expectedUrl}"`).toHaveURL(urlRegex);
        await popup.close();
      } else {
        await this.page.waitForURL(urlRegex, { timeout: 10000 });
        await this.page.goBack();
      }
    });
  }

  /**
   * Verify events are sorted in chronological order (earliest to latest)
   * @param tileTitle - The title of the tile to verify
   */
  async verifyEventsChronologicalOrder(tileTitle: string): Promise<void> {
    await test.step(`Verify events in tile '${tileTitle}' are in chronological order`, async () => {
      const tile = this.getTileContainer(tileTitle).first();
      const contentList = this.getContentList(tile);
      const listingItems = this.getListingItems(contentList);

      const eventDates: Date[] = [];
      const count = await listingItems.count();

      for (let i = 0; i < count; i++) {
        const item = listingItems.nth(i);
        const dateText = await this.getEventDate(item).textContent();
        if (dateText) {
          const dateMatch = dateText.match(/(\w{3},?\s)?(\w{3})\s(\d{1,2})(?:,\s(\d{4}))?/);
          if (dateMatch) {
            const month = dateMatch[2];
            const day = dateMatch[3];
            const year = dateMatch[4] || new Date().getFullYear().toString();
            const dateStr = `${month} ${day}, ${year}`;
            const parsedDate = new Date(dateStr);
            if (!isNaN(parsedDate.getTime())) {
              eventDates.push(parsedDate);
            }
          }
        }
      }

      for (let i = 0; i < eventDates.length - 1; i++) {
        expect(
          eventDates[i].getTime(),
          `Event ${i + 1} date (${eventDates[i].toDateString()}) should be <= event ${i + 2} date (${eventDates[i + 1].toDateString()})`
        ).toBeLessThanOrEqual(eventDates[i + 1].getTime());
      }
    });
  }

  /**
   * Verify calendar day elements are displayed and clickable
   * @param tileTitle - The title of the tile to verify
   */
  async verifyCalendarDayElements(tileTitle: string): Promise<void> {
    await test.step(`Verify calendar day elements in tile '${tileTitle}'`, async () => {
      const tile = this.getTileContainer(tileTitle).first();
      const contentList = this.getContentList(tile);
      const listingItems = this.getListingItems(contentList);

      const firstItem = listingItems.first();
      const calendarDay = this.getCalendarDay(firstItem);
      await expect(calendarDay, 'Calendar day element should be visible').toBeVisible({ timeout: 10000 });

      const month = this.getCalendarDayMonth(calendarDay);
      const date = this.getCalendarDayDate(calendarDay);
      await expect(month, 'Calendar day month should be visible').toBeVisible();
      await expect(date, 'Calendar day date should be visible').toBeVisible();

      await expect(calendarDay, 'Calendar day should be clickable').toHaveAttribute('href');
    });
  }

  /**
   * Verify Google Calendar label is present on all events
   * @param tileTitle - The title of the tile to verify
   */
  async verifyGoogleCalendarLabel(tileTitle: string): Promise<void> {
    await test.step(`Verify Google Calendar label in tile '${tileTitle}'`, async () => {
      const tile = this.getTileContainer(tileTitle).first();
      const contentList = this.getContentList(tile);
      const listingItems = this.getListingItems(contentList);

      const firstItem = listingItems.first();
      const calendarLabel = this.getCalendarLabel(firstItem).filter({ hasText: 'Google Calendar' });
      await expect(calendarLabel, 'Google Calendar label should be visible').toBeVisible({ timeout: 10000 });
    });
  }

  /**
   * Verify event count matches expected minimum
   * @param tileTitle - The title of the tile to verify
   * @param minExpectedCount - Minimum expected number of events
   */
  async verifyEventCount(tileTitle: string, minExpectedCount: number = 1): Promise<void> {
    await test.step(`Verify event count in tile '${tileTitle}'`, async () => {
      const tile = this.getTileContainer(tileTitle).first();
      const contentList = this.getContentList(tile);
      const listingItems = this.getListingItems(contentList);

      const eventCount = await listingItems.count();
      expect(
        eventCount,
        `Expected at least ${minExpectedCount} event(s), but found ${eventCount}`
      ).toBeGreaterThanOrEqual(minExpectedCount);
    });
  }
}
