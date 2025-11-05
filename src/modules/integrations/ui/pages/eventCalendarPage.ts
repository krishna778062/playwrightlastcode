import { expect, Locator, Page, test } from '@playwright/test';

import { BasePage } from '@/src/core/ui/pages/basePage';

export interface ICalendarPageActions {
  navigateToCalendarPage: (userId?: string) => Promise<void>;
  selectCalendarView: (view: 'Week' | 'Month') => Promise<void>;
  pressRightAndLeftArrowButtons: (pressRightCount: number, pressLeftCount: number) => Promise<void>;
}

export interface ICalendarPageAssertions {
  verifyThePageIsLoaded: () => Promise<void>;
  verifyTwentyFourHourSlots: (expectedPresent: boolean) => Promise<void>;
  verifyVisibilityOfTodaysDate: (expectedVisible: boolean) => Promise<void>;
  verifyGoogleTestEvent: () => Promise<void>;
  verifyOutlookTestEvent: () => Promise<void>;
  verifyGoogleAndOutlookTestEvents: () => Promise<void>;
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
  readonly arrowDownIconButton: Locator;
  readonly twentyfourHoursLocator: Locator;
  readonly googleTesteventLocator: Locator;
  readonly outlookTesteventLocator: Locator;
  readonly xmoreTodaysDateLocator: Locator;

  constructor(page: Page) {
    super(page, '/people/:userId/calendar/week');
    this.calendarWeekViewDropdown = page.locator('button[aria-label="View switcher menu"] > div:has-text("Week")');
    this.calendarMonthViewDropdownOption = page.getByRole('menuitem', { name: 'Month' });
    this.calendarWeekViewDropdownOption = page.getByRole('menuitem', { name: 'Week' });
    this.filterButton = page.locator('button[aria-label="Filters"]');
    this.resetButton = page.locator('button:has-text("Reset")');
    this.yesRSVPButton = page.locator('div:has-text("Yes")');
    this.noRSVPButton = page.locator('div:has-text("No")');
    this.maybeRSVPButton = page.locator('div:has-text("Maybe")');
    this.pendingRSVPButton = page.locator('div:has-text("Pending")');
    this.notRequiredRSVPButton = page.locator('div:has-text("Not required")');
    this.allSitesButton = page.locator('div:has-text("All sites")');
    this.sitesYouAreMemberOfButton = page.locator('div:has-text("Sites you\'re a member of")');
    this.sitesYouFollowButton = page.locator('div:has-text("Sites you follow")');
    this.applyButton = page.locator('button:has-text("Apply")');
    this.cancelButton = page.locator('button:has-text("Cancel")');
    this.calendarDayView = page.locator('button[aria-label="Calendar"]');
    this.listView = page.locator('button[aria-label="List View"]');
    this.todayButton = page.locator('button:has-text("Today")');
    this.inputSearch = page.locator('input[placeholder="Search for any event"]');
    this.settingsButton = page.locator('span[class="Button-module__icon__zeHJa"]');
    this.rightIconButton = page.locator('[data-testid="i-arrowRight"]');
    this.leftIconButton = page.locator('[data-testid="i-arrowLeft"]');
    this.arrowDownIconButton = page.locator('[data-testid="i-arrowDown"]').nth(1);
    this.todaysDate = page
      .locator('xpath=//p[contains(@style, "color: var(--color-typography-invert-darkest);")]')
      .first();
    this.twentyfourHoursLocator = page.locator(
      'xpath=//td[@class="fc-timegrid-slot fc-timegrid-slot-label fc-scrollgrid-shrink"]'
    );
    this.googleTesteventLocator = page.locator(
      'xpath=//i[@data-testid = "i-tbc"]//ancestor::div[@data-placement]//p[contains(text(), "Google Test Event")]'
    );
    this.outlookTesteventLocator = page.locator(
      'xpath=//i[@data-testid = "i-tbc"]//ancestor::div[@data-placement]//p[contains(text(), "Outlook Test Event")]'
    );
    this.xmoreTodaysDateLocator = page.locator(
      `xpath=//button[contains(@aria-label, "${this.getFormattedTodaysDate()}")]`
    );
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

  // function to select the calendar view
  async selectCalendarView(view: 'Week' | 'Month'): Promise<void> {
    await test.step(`Select calendar view: ${view}`, async () => {
      await this.page.waitForLoadState('domcontentloaded');
      await this.clickOnElement(this.arrowDownIconButton, {
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

  // function to verify visible of todaysDate depending on parameter passed
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

  // write a function in which i can pass left and right arrow button locator and count to press right and left arrow buttons
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

  // google and outlook test event verification
  async verifyGoogleTestEvent(): Promise<void> {
    await test.step('Verify Google test event is visible', async () => {
      await this.verifier.verifyTheElementIsVisible(this.googleTesteventLocator, {
        timeout: 10_000,
        assertionMessage: 'Verifying that the google test event is visible',
      });
    });
  }
  async verifyOutlookTestEvent(): Promise<void> {
    await test.step('Verify Outlook test event is visible', async () => {
      await this.verifier.verifyTheElementIsVisible(this.outlookTesteventLocator, {
        timeout: 10_000,
        assertionMessage: 'Verifying that the outlook test event is visible',
      });
    });
  }

  async verifyGoogleAndOutlookTestEvents(): Promise<void> {
    await test.step('Verify Google and Outlook test events are visible', async () => {
      await this.verifier.verifyTheElementIsVisible(this.getXMoreTodaysDateLocator(), {
        timeout: 60_000,
        assertionMessage: 'Verifying that the x more todays date is visible',
      });
      await this.clickOnElement(this.getXMoreTodaysDateLocator(), {
        stepInfo: 'Click on the x more todays date',
      });
      await this.verifyGoogleTestEvent();
      await this.verifyOutlookTestEvent();
    });
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
}
