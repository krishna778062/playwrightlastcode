import { expect, Locator, Page, test } from '@playwright/test';

import { BasePage } from '@/src/core/ui/pages/basePage';

export interface ICalendarPageActions {
  navigateToCalendarPage: (userId?: string) => Promise<void>;
  selectCalendarView: (view: 'Week' | 'Month') => Promise<void>;
  pressRightAndLeftArrowButtons: (pressRightCount: number, pressLeftCount: number) => Promise<void>;
  selectFiltersForEvents: (filter: string) => Promise<void>;
  resetFiltersForEvents: () => Promise<void>;
  calendarToView: (calendar: string) => Promise<void>;
  clickTodayButton: () => Promise<void>;
  selectGoogleEventColor: (colorChoice: string) => Promise<string>;
}

export interface ICalendarPageAssertions {
  verifyThePageIsLoaded: () => Promise<void>;
  verifyTwentyFourHourSlots: (expectedPresent: boolean) => Promise<void>;
  verifyVisibilityOfTodaysDate: (expectedVisible: boolean) => Promise<void>;
  verifyGoogleTestEvent: (expectedVisible: boolean, isXMoreTodaysDateVisible: boolean) => Promise<void>;
  verifyOutlookTestEvent: (expectedVisible: boolean, isXMoreTodaysDateVisible: boolean) => Promise<void>;
  verifyGoogleAndOutlookTestEvents: (verifyGoogleTestEvent: boolean, verifyOutlookTestEvent: boolean) => Promise<void>;
  verifyGoogleEventColor: (ariaLabel: string) => Promise<void>;
}

export class CalendarPage extends BasePage implements ICalendarPageActions, ICalendarPageAssertions {
  readonly calendarWeekViewDropdown: Locator;
  readonly filterButton: Locator;
  readonly resetButton: Locator;
  readonly yesRSVPButton: Locator;
  readonly noRSVPButton: Locator;
  readonly maybeRSVPButton: Locator;
  readonly pendingRSVPButton: Locator;
  readonly notRequiredRSVPButton: Locator;
  readonly allSitesButton: Locator;
  readonly sitesYouAreMemberOfButton: Locator;
  readonly sitesYouFollowButton: Locator;
  readonly applyButton: Locator;
  readonly cancelButton: Locator;
  readonly calendarDayView: Locator;
  readonly listView: Locator;
  readonly todayButton: Locator;
  readonly inputSearch: Locator;
  readonly settingsButton: Locator;
  readonly rightIconButton: Locator;
  readonly leftIconButton: Locator;
  readonly calendarMonthViewDropdownOption: Locator;
  readonly calendarWeekViewDropdownOption: Locator;
  private cachedUserId?: string;
  readonly todaysDate: Locator;
  readonly weekViewArrowDownIconButton: Locator;
  readonly twentyfourHoursLocator: Locator;
  readonly googleTesteventLocator: Locator;
  readonly outlookTesteventLocator: Locator;
  readonly xmoreTodaysDateLocator: Locator;
  readonly calendarsToViewArrowDownIconButton: Locator;
  readonly viewGoogleCalendarOption: Locator;
  readonly viewOutlookCalendarOption: Locator;
  readonly peopleCalendarsOption: Locator;
  readonly tenantCalendarsOption: Locator;
  readonly googleEventColorChoice1: Locator;
  readonly googleEventColorChoice2: Locator;

  constructor(page: Page) {
    super(page, '/people/:userId/calendar/week');
    this.calendarWeekViewDropdown = page.locator('button[aria-label="View switcher menu"] > div:has-text("Week")');
    this.calendarMonthViewDropdownOption = page.getByRole('menuitem', { name: 'Month' });
    this.calendarWeekViewDropdownOption = page.getByRole('menuitem', { name: 'Week' });
    this.filterButton = page.locator('button[aria-label="Filters"]');
    this.resetButton = page.getByText('Reset');
    this.yesRSVPButton = page.getByText('Yes');
    this.noRSVPButton = page.getByText('No').first();
    this.maybeRSVPButton = page.getByText('Maybe');
    this.pendingRSVPButton = page.getByText('Pending');
    this.notRequiredRSVPButton = page.getByText('Not required');
    this.allSitesButton = page.getByText('All sites');
    this.sitesYouAreMemberOfButton = page.getByText("Sites you're a member of");
    this.sitesYouFollowButton = page.getByText('Sites you follow');
    this.applyButton = page.getByText('Apply');
    this.cancelButton = page.getByText('Cancel');
    this.calendarDayView = page.locator('button[aria-label="Calendar"]');
    this.listView = page.locator('button[aria-label="List View"]');
    this.todayButton = page.getByText('Today').first();
    this.inputSearch = page.locator('input[placeholder="Search for any event"]');
    this.settingsButton = page.locator('button[aria-label="Calendar settings"]');
    this.rightIconButton = page.locator('[data-testid="i-arrowRight"]');
    this.leftIconButton = page.locator('[data-testid="i-arrowLeft"]');
    this.weekViewArrowDownIconButton = page.locator('[data-testid="i-arrowDown"]').nth(1);
    this.calendarsToViewArrowDownIconButton = page.locator('[data-testid="i-arrowDown"]').first();
    this.viewGoogleCalendarOption = page.getByText('Google Calendar').first();
    this.viewOutlookCalendarOption = page.getByText('Outlook Calendar').first();
    this.peopleCalendarsOption = page.getByText("People's calendars").first();
    this.tenantCalendarsOption = page.locator("xpath=//div[contains(text(), 'Tenant calendar')]");
    this.todaysDate = page
      .locator('xpath=//p[contains(@style, "color: var(--color-typography-invert-darkest);")]')
      .first();
    this.twentyfourHoursLocator = page.locator(
      'xpath=//td[@class="fc-timegrid-slot fc-timegrid-slot-label fc-scrollgrid-shrink"]'
    );
    this.googleTesteventLocator = page.locator(
      'xpath=//i[@data-testid = "i-tbc"]//ancestor::div[@data-placement]//p[text()="Google Test Event"]'
    );
    this.outlookTesteventLocator = page.locator(
      'xpath=//i[@data-testid = "i-tbc"]//ancestor::div[@data-placement]//p[text()="Outlook Test Event"]'
    );
    this.xmoreTodaysDateLocator = page
      .locator(`xpath=//button[contains(@aria-label, "${this.getFormattedTodaysDate()}")]`)
      .first();

    this.googleEventColorChoice1 = page.locator('xpath=//h4[text()="Google Calendar"]/parent::div//button').first();
    this.googleEventColorChoice2 = page.locator('xpath=//h4[text()="Google Calendar"]/parent::div//button').nth(1);
  }

  get actions(): ICalendarPageActions {
    return this;
  }

  get assertions(): ICalendarPageAssertions {
    return this;
  }

  getFormattedTodaysDate(): string {
    // Get the current time in the desired timezone
    const now = new Date();

    // Convert to India timezone using Intl.DateTimeFormat
    const formatter = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'long' });
    const parts = formatter.formatToParts(now);

    const day = parts.find(p => p.type === 'day')?.value;
    const month = parts.find(p => p.type === 'month')?.value;

    // Function to get ordinal suffix
    const getOrdinalSuffix = (n: string) => {
      const num = parseInt(n, 10);
      if (num > 3 && num < 21) return 'th';
      switch (num % 10) {
        case 1:
          return 'st';
        case 2:
          return 'nd';
        case 3:
          return 'rd';
        default:
          return 'th';
      }
    };

    return `${day}${getOrdinalSuffix(day || '')} ${month}`;
  }

  getXMoreTodaysDateLocator(): Locator {
    // today date like 5th November
    return this.xmoreTodaysDateLocator;
  }

  async navigateToCalendarPage(userId?: string): Promise<void> {
    await test.step('Navigate to calendar page', async () => {
      if (!userId) {
        if (this.cachedUserId) {
          userId = this.cachedUserId;
        } else {
          userId = await this.page.evaluate(() => {
            return (window as any).Simpplr?.CurrentUser?.uid;
          });
          if (!userId) {
            throw new Error('Could not get current user ID from Simpplr.CurrentUser.uid');
          }
          this.cachedUserId = userId;
        }
      }
      const url = `/people/${userId}/calendar/week`;
      await this.page.goto(url, { waitUntil: 'domcontentloaded' });
    });
  }

  async selectCalendarView(view: 'Week' | 'Month'): Promise<void> {
    await test.step(`Select calendar view: ${view}`, async () => {
      await this.page.waitForLoadState('domcontentloaded');
      await this.clickOnElement(this.weekViewArrowDownIconButton, {
        stepInfo: 'Click on down arrow icon button',
      });

      if (view === 'Week') {
        await this.clickOnElement(this.calendarWeekViewDropdownOption, {
          stepInfo: 'Click on the calendar week view dropdown option',
        });
      } else {
        await this.clickOnElement(this.calendarMonthViewDropdownOption, {
          stepInfo: 'Click on the calendar month view dropdown option',
        });
      }
    });
  }

  async verifyThePageIsLoaded(): Promise<void> {
    await test.step('Verify the calendar page is loaded', async () => {
      await this.page.waitForLoadState('domcontentloaded');

      // Verify main calendar controls using verifier for better error messages
      await this.verifier.verifyTheElementIsVisible(this.calendarWeekViewDropdown, {
        timeout: 30_000,
        assertionMessage: 'Verifying that the calendar week view dropdown is visible',
      });
      await this.verifier.verifyTheElementIsVisible(this.filterButton, {
        timeout: 10_000,
        assertionMessage: 'Verifying that the filter button is visible',
      });
      await this.verifier.verifyTheElementIsVisible(this.calendarDayView, {
        timeout: 10_000,
        assertionMessage: 'Verifying that the calendar day view button is visible',
      });
      await this.verifier.verifyTheElementIsVisible(this.listView, {
        timeout: 10_000,
        assertionMessage: 'Verifying that the list view button is visible',
      });
      await this.verifier.verifyTheElementIsVisible(this.todayButton, {
        timeout: 10_000,
        assertionMessage: 'Verifying that the today button is visible',
      });
      await this.verifier.verifyTheElementIsVisible(this.inputSearch, {
        timeout: 10_000,
        assertionMessage: 'Verifying that the search input is visible',
      });
      await this.verifier.verifyTheElementIsVisible(this.todaysDate, {
        timeout: 10_000,
        assertionMessage: 'Verifying that the today date is visible',
      });

      //  twenty four hour locator count verification
      const twentyfourHoursCount = await this.twentyfourHoursLocator.count();
      expect(twentyfourHoursCount).toBe(24);
    });
  }

  async verifyVisibilityOfTodaysDate(expectedVisible: boolean): Promise<void> {
    await test.step(`Verify today's date visibility: ${expectedVisible}`, async () => {
      if (expectedVisible) {
        await this.verifier.verifyTheElementIsVisible(this.todaysDate, {
          timeout: 10_000,
          assertionMessage: 'Verifying that the today date is visible',
        });
      } else {
        await this.verifier.verifyTheElementIsNotVisible(this.todaysDate, {
          timeout: 10_000,
          assertionMessage: 'Verifying that the today date is not visible',
        });
      }
    });
  }

  async pressRightAndLeftArrowButtons(pressRightCount: number, pressLeftCount: number): Promise<void> {
    await test.step(`Press right arrow button ${pressRightCount} times and left arrow button ${pressLeftCount} times`, async () => {
      for (let i = 0; i < pressRightCount; i++) {
        await this.clickOnElement(this.rightIconButton, {
          stepInfo: 'Click on right arrow button',
        });
      }
      for (let i = 0; i < pressLeftCount; i++) {
        await this.clickOnElement(this.leftIconButton, {
          stepInfo: 'Click on left arrow button',
        });
      }
    });
  }

  async clickTodayButton(): Promise<void> {
    await test.step('Click on Today button', async () => {
      await this.clickOnElement(this.todayButton, {
        stepInfo: 'Click on Today button',
      });
      await this.page.waitForLoadState('domcontentloaded');
    });
  }

  // make a function to reset the filters
  async resetFiltersForEvents(): Promise<void> {
    await test.step('Reset filters for events', async () => {
      await this.verifier.verifyTheElementIsVisible(this.filterButton, {
        timeout: 10_000,
        assertionMessage: 'Verifying that the filter button is visible',
      });

      await this.clickOnElement(this.filterButton, {
        stepInfo: 'Click on filter button',
      });

      let isResetButtonVisible = await this.verifier.isTheElementVisible(this.resetButton, {
        timeout: 10_000,
      });

      while (!isResetButtonVisible) {
        await this.clickOnElement(this.filterButton, {
          stepInfo: 'Click on filter button',
          force: true,
        });

        await this.page.waitForTimeout(2000);
        isResetButtonVisible = await this.verifier.isTheElementVisible(this.resetButton, {
          timeout: 10_000,
        });
      }

      await this.page.waitForTimeout(5000);

      await this.clickOnElement(this.resetButton, {
        stepInfo: 'Click on reset button',
        force: true,
      });

      await this.verifier.verifyTheElementIsVisible(this.applyButton, {
        timeout: 10_000,
        assertionMessage: 'Verifying that the apply button is visible',
      });

      await this.clickOnElement(this.applyButton, {
        stepInfo: 'Click on apply button',
      });

      await this.clickOnElement(this.filterButton, {
        stepInfo: 'Click on filter button',
      });
      // wait for dom content loaded
      await this.page.waitForLoadState('domcontentloaded');
    });
  }

  // write a function to select the passed filters
  async selectFiltersForEvents(filter: string): Promise<void> {
    await test.step(`Select filters: ${filter}`, async () => {
      await this.page.waitForTimeout(3000);

      await this.clickOnElement(this.filterButton, {
        stepInfo: 'Click on filter button',
      });

      const filterDialog = this.page.locator('[role="dialog"]').filter({ hasText: 'Filters' }).first();

      // Use exact text matching within the filter dialog to avoid "No" matching "Not required"
      const filterLocator = filterDialog.getByText(filter, { exact: true }).first();

      let isFilterLocatorVisible = await this.verifier.isTheElementVisible(filterLocator, {
        timeout: 10_000,
      });

      while (!isFilterLocatorVisible) {
        await this.clickOnElement(this.filterButton, {
          stepInfo: 'Click on filter button',
          force: true,
        });
        await this.page.waitForTimeout(2000);
        isFilterLocatorVisible = await this.verifier.isTheElementVisible(filterLocator, {
          timeout: 10_000,
        });
      }

      await this.clickOnElement(filterLocator, {
        stepInfo: `Click on ${filter} checkbox`,
      });

      await this.page.waitForTimeout(2000);

      let isResetButtonVisible = await this.verifier.isTheElementVisible(this.resetButton, {
        timeout: 10_000,
      });

      while (!isResetButtonVisible) {
        await this.clickOnElement(this.filterButton, {
          stepInfo: 'Click on filter button',
          force: true,
        });

        await this.page.waitForTimeout(2000);
        isResetButtonVisible = await this.verifier.isTheElementVisible(this.resetButton, {
          timeout: 10_000,
        });
      }

      // click on reset button
      await this.clickOnElement(this.resetButton, {
        stepInfo: 'Click on reset button',
        force: true,
      });
      await this.page.waitForTimeout(3000);

      // verify that the checkbox is visible
      await this.verifier.verifyTheElementIsVisible(filterLocator, {
        timeout: 10_000,
        assertionMessage: `Verifying that the ${filter} checkbox is visible`,
      });

      await this.clickOnElement(filterLocator, {
        stepInfo: `Click on ${filter} checkbox`,
      });

      // click on apply button
      await this.clickOnElement(this.applyButton, {
        stepInfo: 'Click on apply button',
      });

      // wait for 10 seconds
      await this.page.waitForTimeout(10000);
    });
  }

  // google and outlook test event verification
  async verifyGoogleTestEvent(expectedVisible: boolean, isXMoreTodaysDateVisible: boolean): Promise<void> {
    await test.step('Verify Google test event is visible', async () => {
      if (!isXMoreTodaysDateVisible && expectedVisible) {
        await this.verifier.verifyTheElementIsVisible(
          this.page.locator('xpath=//*[contains(text(), "Google Test Event")]'),
          {
            timeout: 10_000,
            assertionMessage: 'Verifying that the google test event is visible',
          }
        );

        await this.page.waitForLoadState('domcontentloaded');
        return;
      }
      if (expectedVisible) {
        await this.verifier.verifyTheElementIsVisible(this.googleTesteventLocator, {
          timeout: 10_000,
          assertionMessage: 'Verifying that the google test event is visible',
        });
      } else {
        await this.verifier.verifyTheElementIsNotVisible(this.googleTesteventLocator, {
          timeout: 10_000,
          assertionMessage: 'Verifying that the google test event is not visible',
        });
      }
    });
  }

  async verifyOutlookTestEvent(expectedVisible: boolean, isXMoreTodaysDateVisible: boolean): Promise<void> {
    await test.step('Verify Outlook test event is visible', async () => {
      if (!isXMoreTodaysDateVisible && expectedVisible) {
        await this.verifier.verifyTheElementIsVisible(
          this.page.locator('xpath=//*[contains(text(), "Outlook Test Event")]'),
          {
            timeout: 10_000,
            assertionMessage: 'Verifying that the outlook test event is visible',
          }
        );
        return;
      }
      if (expectedVisible) {
        await this.verifier.verifyTheElementIsVisible(this.outlookTesteventLocator, {
          timeout: 10_000,
          assertionMessage: 'Verifying that the outlook test event is visible',
        });
      } else {
        await this.verifier.verifyTheElementIsNotVisible(this.outlookTesteventLocator, {
          timeout: 10_000,
          assertionMessage: 'Verifying that the outlook test event is not visible',
        });
      }
    });
  }

  async verifyGoogleAndOutlookTestEvents(
    verifyGoogleTestEvent: boolean,
    verifyOutlookTestEvent: boolean
  ): Promise<void> {
    await test.step('Verify Google and Outlook test events are visible', async () => {
      const isXMoreTodaysDateVisible = await this.verifier.isTheElementVisible(this.getXMoreTodaysDateLocator(), {
        timeout: 10_000,
      });

      if (isXMoreTodaysDateVisible) {
        await this.clickOnElement(this.getXMoreTodaysDateLocator(), {
          stepInfo: 'Click on the x more todays date',
        });
      }

      await this.verifyGoogleTestEvent(verifyGoogleTestEvent, isXMoreTodaysDateVisible);
      await this.verifyOutlookTestEvent(verifyOutlookTestEvent, isXMoreTodaysDateVisible);
      await this.page.keyboard.press('Enter');
    });

    // wait for 10 seconds
    await this.page.waitForTimeout(10000);
  }

  async verifyTwentyFourHourSlots(expectedPresent: boolean): Promise<void> {
    await test.step(`Verify twenty-four hour slots ${expectedPresent ? 'are present' : 'are not present'}`, async () => {
      if (expectedPresent) {
        const twentyfourHoursCount = await this.twentyfourHoursLocator.count();
        expect(twentyfourHoursCount).toBe(24);
      } else {
        // verify that the twenty four hour slots are not present
        await this.verifier.verifyTheElementIsNotVisible(this.twentyfourHoursLocator, {
          timeout: 10_000,
          assertionMessage: 'Verifying that the twenty four hour slots are not present',
        });
      }
    });
  }

  // make a function based on paramtere to view which calendar to view
  async calendarToView(calendar: string): Promise<void> {
    await test.step(`View ${calendar} calendar`, async () => {
      await this.clickOnElement(this.calendarsToViewArrowDownIconButton, {
        stepInfo: 'Click on the calendars to view arrow down icon button',
      });

      await this.page.waitForLoadState('domcontentloaded');
      await this.page.waitForTimeout(5000);
      // click on reset button
      await this.clickOnElement(this.resetButton, {
        stepInfo: 'Click on reset button',
      });

      // wait for 10 seconds
      await this.page.waitForTimeout(3000);

      if (calendar === 'Outlook') {
        await this.clickOnElement(this.viewOutlookCalendarOption, {
          stepInfo: 'Click on the outlook calendar option',
        });

        await this.clickOnElement(this.peopleCalendarsOption, {
          stepInfo: 'Click on the people calendars option to select',
        });

        await this.clickOnElement(this.tenantCalendarsOption, {
          stepInfo: 'Click on the tenant calendars option',
        });
      } else if (calendar === 'Google') {
        await this.clickOnElement(this.tenantCalendarsOption, {
          stepInfo: 'Click on the tenant calendars option',
        });
        await this.clickOnElement(this.viewGoogleCalendarOption, {
          stepInfo: 'Click on the google calendar option',
        });
      } else {
        // enable both calendars
        await this.clickOnElement(this.tenantCalendarsOption, {
          stepInfo: 'Click on the tenant calendars option',
        });
        await this.clickOnElement(this.viewGoogleCalendarOption, {
          stepInfo: 'Click on the google calendar option',
        });
        await this.clickOnElement(this.viewOutlookCalendarOption, {
          stepInfo: 'Click on the outlook calendar option',
        });
        await this.clickOnElement(this.peopleCalendarsOption, {
          stepInfo: 'Click on the people calendars option to select',
        });
      }

      // click on apply button
      await this.clickOnElement(this.applyButton, {
        stepInfo: 'Click on apply button',
      });

      await this.page.waitForLoadState('domcontentloaded');
      // wait for 20 seconds
      await this.page.waitForTimeout(10000);
    });
  }

  async selectGoogleEventColor(colorChoice: string): Promise<string> {
    return await test.step(`Select Google event color: ${colorChoice}`, async () => {
      // click on settings button
      await this.clickOnElement(this.settingsButton, {
        stepInfo: 'Click on the settings button',
      });

      let selectedColorLocator: Locator;
      if (colorChoice === '1') {
        // click on outlook event color choice 1
        selectedColorLocator = this.googleEventColorChoice1;
        await this.clickOnElement(this.googleEventColorChoice1, {
          stepInfo: 'Click on the google event color choice 1',
        });
      } else {
        selectedColorLocator = this.googleEventColorChoice2;
        await this.clickOnElement(this.googleEventColorChoice2, {
          stepInfo: 'Click on the google event color choice 2',
        });
      }

      // Get the aria-label of the selected color choice
      const ariaLabel = (await selectedColorLocator.getAttribute('aria-label')) ?? '';

      // click on apply button
      await this.clickOnElement(this.applyButton, {
        stepInfo: 'Click on apply button',
      });

      await this.page.waitForLoadState('domcontentloaded');

      return ariaLabel;
    });
  }

  async verifyGoogleEventColor(ariaLabel: string): Promise<void> {
    await test.step(`Verify Google event color with aria-label: ${ariaLabel}`, async () => {
      await this.verifier.verifyTheElementIsVisible(
        this.page.locator(`xpath=//button[contains(@style, '--focused-color: ${ariaLabel}')]`),
        {
          timeout: 10_000,
          assertionMessage: `Verifying that the google test event is visible with aria-label ${ariaLabel}`,
        }
      );
    });
  }
}
