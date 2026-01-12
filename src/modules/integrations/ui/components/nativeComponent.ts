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
  readonly outlookCalendarGroupDropdown: Locator;
  readonly outlookCalendarDropdown: Locator;
  readonly reactSelectInputs: Locator;
  readonly reactSelectMenu: Locator;
  readonly reactSelectMenuOption: Locator;
  readonly reactSelectListboxMenus: Locator;
  readonly reactSelectOption: Locator;
  readonly panelItem: Locator;
  readonly tileTitleInput: Locator;
  readonly addToHomeButton: Locator;
  readonly eventsContentTypeRadio: Locator;
  readonly googleCalendarFromRadio: Locator;
  readonly outlookCalendarFromRadio: Locator;
  readonly calendarValueDisplay: Locator;
  readonly editModalHeading: Locator;
  readonly dialog: Locator;
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
  readonly getReactSelectMenuById: (menuId: string) => Locator;

  constructor(page: Page) {
    super(page);
    this.addContentTileButton = page.getByRole('button', { name: 'Add pages, events & albums' });
    this.eventsContentTypeButton = page.getByLabel('Add content tile').getByText('Events');
    this.googleCalendarRadioInModal = page.getByLabel('Add content tile').getByText('Google Calendar');
    this.outlookCalendarRadio = page.getByText('Outlook Calendar');
    this.calendarDropdownInput = page.getByRole('combobox').first();
    this.reactSelectInput = page.locator('#react-select-2-input');
    this.calendarDropdownFirstOption = page.getByRole('option').first();
    this.reactSelectInputs = page.locator('input[id^="react-select"]');
    // For Outlook Calendar: first dropdown is calendar group, second is specific calendar
    this.outlookCalendarGroupDropdown = page.locator('input[id^="react-select"]').first();
    this.outlookCalendarDropdown = page.locator('input[id^="react-select"]').nth(1);
    // React-select menu and options - scoped to the modal
    this.reactSelectMenu = page.locator('[id^="react-select"][id$="-listbox"]').first();
    this.reactSelectMenuOption = page.locator('[role="listbox"] .ReactSelectInput-option').first();
    this.reactSelectListboxMenus = page.locator('[id^="react-select"][id$="-listbox"]');
    // Base locators for React Select options and panel items (used with selector strings when scoping)
    this.reactSelectOption = page.locator('.ReactSelectInput-option');
    this.panelItem = page.locator('.Panel-item');
    this.tileTitleInput = page.getByRole('dialog').locator('input[name="title"], input[id="title"]').first();
    this.addToHomeButton = page.getByRole('button', { name: 'Add to home' });
    this.eventsContentTypeRadio = page.locator('#options_type_event');
    this.googleCalendarFromRadio = page.locator('#options_siteFilter_googleCalendar');
    this.outlookCalendarFromRadio = page.locator('#options_siteFilter_outlookCalendar');
    this.calendarValueDisplay = page.locator('.css-15bnrdl-singleValue').first();
    this.editModalHeading = page.getByRole('heading', { name: 'Edit Latest & popular tile' });
    this.dialog = page.getByRole('dialog');
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
    this.getReactSelectMenuById = (menuId: string) => page.locator(`#${menuId}`);
  }

  async clickAddContentTileButton(): Promise<void> {
    await test.step('Click Add pages, events & albums button', async () => {
      await this.clickOnElement(this.addContentTileButton, { timeout: 30_000 });
    });
  }

  async selectEventsContentType(): Promise<void> {
    await test.step('Select Events content type', async () => {
      await this.clickOnElement(this.eventsContentTypeButton, { timeout: 30_000 });
    });
  }

  async selectGoogleCalendar(): Promise<void> {
    await test.step('Select Google Calendar', async () => {
      await this.clickOnElement(this.googleCalendarRadioInModal, { timeout: 30_000 });
    });
  }

  async selectOutlookCalendar(): Promise<void> {
    await test.step('Select Outlook Calendar', async () => {
      await this.clickOnElement(this.outlookCalendarRadio, { timeout: 30_000 });
    });
  }

  async selectCalendarFromDropdown(calendarEmail: string): Promise<void> {
    await test.step(`Select calendar: ${calendarEmail}`, async () => {
      await this.clickOnElement(this.reactSelectInput, { timeout: 30_000 });
      await this.clickOnElement(this.getCalendarEmailOption(calendarEmail), { timeout: 30_000 });
    });
  }

  /**
   * Select Outlook Calendar group and then a specific calendar
   * Outlook Calendar requires two selections: first the group, then the calendar
   * @param calendarGroup - The calendar group name (e.g., "My Calendars", "Shared")
   * @param calendarName - Optional specific calendar name. If not provided, selects first available
   */
  async selectOutlookCalendarGroupAndCalendar(calendarGroup: string, calendarName?: string): Promise<void> {
    await test.step(`Select Outlook Calendar group: ${calendarGroup}${calendarName ? ` and calendar: ${calendarName}` : ''}`, async () => {
      // Select calendar group (first dropdown)
      await this.clickOnElement(this.outlookCalendarGroupDropdown, { timeout: 30_000 });
      const firstMenu = this.reactSelectListboxMenus.first();
      await firstMenu.waitFor({ state: 'visible', timeout: 10000 });

      const groupOption = firstMenu
        .locator(this.reactSelectOption)
        .filter({ has: this.panelItem.filter({ hasText: calendarGroup }) })
        .first();
      await this.clickOnElement(groupOption, { timeout: 30_000 });
      await firstMenu.waitFor({ state: 'hidden', timeout: 10000 }).catch(() => {});

      await this.page.waitForTimeout(4000);

      await expect(this.outlookCalendarDropdown).toBeEnabled({ timeout: 15000 });

      await this.clickOnElement(this.outlookCalendarDropdown, { timeout: 30_000 });
      await this.page.waitForTimeout(2000);
      await this.clickOnElement(this.outlookCalendarDropdown, { timeout: 30_000 });

      let finalMenuId: string | null = null;
      await expect
        .poll(
          async () => {
            const ariaOwns = await this.outlookCalendarDropdown.getAttribute('aria-owns');
            if (ariaOwns) {
              finalMenuId = ariaOwns;
              return true;
            }
            const inputId = await this.outlookCalendarDropdown.getAttribute('id');
            const match = inputId?.match(/react-select-(\d+)-input/);
            if (match) {
              finalMenuId = `react-select-${match[1]}-listbox`;
              return true;
            }
            return false;
          },
          { timeout: 10000, intervals: [200, 500, 1000] }
        )
        .toBeTruthy();

      await this.page.waitForSelector(`#${finalMenuId!}`, { state: 'visible', timeout: 15000 });
      const secondMenu = this.getReactSelectMenuById(finalMenuId!);
      await expect(secondMenu.locator(this.reactSelectOption).first()).toBeVisible({ timeout: 10000 });

      const calendarOption = calendarName
        ? secondMenu
            .locator(this.reactSelectOption)
            .filter({ has: this.panelItem.filter({ hasText: calendarName }) })
            .first()
        : secondMenu.locator(this.reactSelectOption).first();

      await this.clickOnElement(calendarOption, { timeout: 30_000 });
    });
  }

  async selectFirstAvailableCalendar(): Promise<void> {
    await test.step('Select first available calendar', async () => {
      await this.calendarDropdownInput.waitFor({ state: 'visible', timeout: 10000 });
      await this.clickOnElement(this.calendarDropdownInput, { timeout: 30_000 });
      await this.calendarDropdownFirstOption.waitFor({ state: 'visible', timeout: 10000 });
      await this.clickOnElement(this.calendarDropdownFirstOption, { timeout: 30_000 });
    });
  }

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

  async setTileTitle(tileTitle: string): Promise<void> {
    await test.step(`Set tile title: ${tileTitle}`, async () => {
      await this.tileTitleInput.waitFor({ state: 'visible', timeout: 10000 });
      await this.tileTitleInput.clear();
      await this.fillInElement(this.tileTitleInput, tileTitle);
    });
  }

  async clickAddToHome(): Promise<void> {
    await test.step('Click Add to home button', async () => {
      await this.clickOnElement(this.addToHomeButton, { timeout: 30_000 });
    });
  }

  async verifyTileTitle(expectedTitle: string): Promise<void> {
    await test.step(`Verify tile title is: ${expectedTitle}`, async () => {
      await this.tileTitleInput.waitFor({ state: 'visible', timeout: 10000 });
      const actualValue = await this.tileTitleInput.inputValue();
      expect(actualValue, `Expected tile title to be "${expectedTitle}"`).toBe(expectedTitle);
    });
  }

  async verifyEventsContentTypeSelected(): Promise<void> {
    await test.step('Verify Events content type is selected', async () => {
      await expect(this.eventsContentTypeRadio, 'Expected Events content type to be checked').toBeChecked();
    });
  }

  async verifyGoogleCalendarSelected(): Promise<void> {
    await test.step('Verify Google Calendar is selected', async () => {
      await expect(this.googleCalendarFromRadio, 'Expected Google Calendar to be checked').toBeChecked();
    });
  }

  async verifyOutlookCalendarSelected(): Promise<void> {
    await test.step('Verify Outlook Calendar is selected', async () => {
      await expect(this.outlookCalendarFromRadio, 'Expected Outlook Calendar to be checked').toBeChecked();
    });
  }

  async verifyCalendarEmail(expectedEmail: string): Promise<void> {
    await test.step(`Verify calendar email is: ${expectedEmail}`, async () => {
      await this.calendarValueDisplay.waitFor({ state: 'visible', timeout: 10000 });
      const actualValue = await this.calendarValueDisplay.textContent();
      expect(actualValue?.trim(), `Expected calendar email to be "${expectedEmail}"`).toBe(expectedEmail);
    });
  }

  async verifyEditModalOpened(): Promise<void> {
    await test.step('Verify edit modal is opened', async () => {
      await expect(this.editModalHeading, 'Expected edit modal heading to be visible').toBeVisible({ timeout: 10000 });
    });
  }

  async verifyCalendarDropdownVisible(): Promise<void> {
    await test.step('Verify calendar dropdown is visible', async () => {
      await this.calendarDropdownInput.waitFor({ state: 'visible', timeout: 10000 });
      await expect(this.calendarDropdownInput, 'Expected calendar dropdown to be visible').toBeVisible({
        timeout: 10000,
      });
    });
  }

  async verifyCalendarUpcomingEventsTileData(
    tileTitle: string,
    eventTitle: RegExp = /^[\p{L}\p{N}\p{P}\p{S} ]{1,100}$/u,
    calDate: RegExp = /(?:(?:[A-Z][a-z]{2},?\s)?[A-Z][a-z]{2}\s(?:[1-9]|[12]\d|3[01])(?:,\s\d{4})?(?:\s(?:at|to)\s(?:1[0-2]|0?\d):[0-5]\d(?:AM|PM))?(?:\s-\s[A-Z][a-z]{2}\s(?:[1-9]|[12]\d|3[01])(?:,\s\d{4})?)?)|(?:Today(?:\s(?:at|to)\s(?:1[0-2]|0?\d):[0-5]\d(?:AM|PM))?(?:\s-\s[A-Z][a-z]{2}\s(?:[1-9]|[12]\d|3[01])(?:,\s\d{4})?)?)/,
    minExpectedCount: number = 1,
    calendarType: string = 'Google Calendar'
  ): Promise<void> {
    await test.step(`Verify Calendar upcoming events tile data for native tile '${tileTitle}'`, async () => {
      const tile = this.getTileContainer(tileTitle).first();
      const listingItems = this.getListingItems(this.getContentList(tile));

      const eventCount = await listingItems.count();
      expect(
        eventCount,
        `Expected at least ${minExpectedCount} event(s), but found ${eventCount}`
      ).toBeGreaterThanOrEqual(minExpectedCount);

      const firstEventItem = listingItems.first();
      await expect(firstEventItem, 'Expected at least one calendar event to be visible').toBeVisible({
        timeout: 10000,
      });

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
      await expect(this.getCalendarDayMonth(calendarDay), 'Calendar day month should be visible').toBeVisible();
      await expect(this.getCalendarDayDate(calendarDay), 'Calendar day date should be visible').toBeVisible();
      await expect(calendarDay, 'Calendar day should be clickable').toHaveAttribute('href');

      const expectedCalendarLabel = calendarType === 'Outlook Calendar' ? 'Outlook Calendar' : 'Google Calendar';
      const calendarLabel = this.getCalendarLabel(firstEventItem).filter({ hasText: expectedCalendarLabel });
      await expect(calendarLabel, `${expectedCalendarLabel} label should be visible`).toBeVisible({ timeout: 10000 });
    });
  }

  async verifyShowMoreBehavior(tileTitle: string): Promise<void> {
    await test.step(`Verify 'Show more' behavior for native tile '${tileTitle}'`, async () => {
      const tile = this.getTileContainer(tileTitle).first();
      const listingItems = this.getListingItems(this.getContentList(tile));
      const showMoreButton = this.getShowMoreButton(tile);

      await expect(showMoreButton, 'Show More button should be visible').toBeVisible({ timeout: 10000 });

      const initialVisible = await listingItems.count();
      expect(
        initialVisible,
        `Expected at least 4 events initially, but found ${initialVisible}`
      ).toBeGreaterThanOrEqual(4);

      await this.clickOnElement(showMoreButton, { timeout: 30_000 });

      await expect.poll(async () => await listingItems.count(), { timeout: 10000 }).toBeGreaterThan(initialVisible);
    });
  }

  async verifyTileRedirects(tileTitle: string, expectedUrl: string): Promise<void> {
    await test.step(`Verify native tile '${tileTitle}' redirects to '${expectedUrl}'`, async () => {
      const tile = this.getTileContainer(tileTitle).first();
      const listingItems = this.getListingItems(this.getContentList(tile));
      const link = this.getEventTitleLink(listingItems.first()).first();
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

  async verifyEventsChronologicalOrder(tileTitle: string): Promise<void> {
    await test.step(`Verify events in tile '${tileTitle}' are in chronological order`, async () => {
      const tile = this.getTileContainer(tileTitle).first();
      const listingItems = this.getListingItems(this.getContentList(tile));
      const eventDates: Date[] = [];
      const count = await listingItems.count();

      for (let i = 0; i < count; i++) {
        const dateText = await this.getEventDate(listingItems.nth(i)).textContent();
        const dateMatch = dateText?.match(/(\w{3},?\s)?(\w{3})\s(\d{1,2})(?:,\s(\d{4}))?/);
        if (dateMatch) {
          const month = dateMatch[2];
          const day = dateMatch[3];
          const year = dateMatch[4] || new Date().getFullYear().toString();
          const parsedDate = new Date(`${month} ${day}, ${year}`);
          if (!isNaN(parsedDate.getTime())) {
            eventDates.push(parsedDate);
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

  async verifyCalendarDayElements(tileTitle: string): Promise<void> {
    await test.step(`Verify calendar day elements in tile '${tileTitle}'`, async () => {
      const tile = this.getTileContainer(tileTitle).first();
      const listingItems = this.getListingItems(this.getContentList(tile));
      const calendarDay = this.getCalendarDay(listingItems.first());

      await expect(calendarDay, 'Calendar day element should be visible').toBeVisible({ timeout: 10000 });
      await expect(this.getCalendarDayMonth(calendarDay), 'Calendar day month should be visible').toBeVisible();
      await expect(this.getCalendarDayDate(calendarDay), 'Calendar day date should be visible').toBeVisible();
      await expect(calendarDay, 'Calendar day should be clickable').toHaveAttribute('href');
    });
  }

  async verifyGoogleCalendarLabel(tileTitle: string): Promise<void> {
    await test.step(`Verify Google Calendar label in tile '${tileTitle}'`, async () => {
      const tile = this.getTileContainer(tileTitle).first();
      const listingItems = this.getListingItems(this.getContentList(tile));
      const calendarLabel = this.getCalendarLabel(listingItems.first()).filter({ hasText: 'Google Calendar' });
      await expect(calendarLabel, 'Google Calendar label should be visible').toBeVisible({ timeout: 10000 });
    });
  }

  async verifyEventCount(tileTitle: string, minExpectedCount: number = 1): Promise<void> {
    await test.step(`Verify event count in tile '${tileTitle}'`, async () => {
      const tile = this.getTileContainer(tileTitle).first();
      const listingItems = this.getListingItems(this.getContentList(tile));
      const eventCount = await listingItems.count();
      expect(
        eventCount,
        `Expected at least ${minExpectedCount} event(s), but found ${eventCount}`
      ).toBeGreaterThanOrEqual(minExpectedCount);
    });
  }
}
