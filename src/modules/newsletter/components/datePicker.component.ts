import { expect, Locator, Page } from '@playwright/test';

import { BaseActionUtil } from '@core/utils/baseActionUtil';

export type DateSelection = {
  month: string;
  year: string;
  day: string;
};

type DatePickerConfig = {
  fromDateLocator?: Locator;
  toDateLocator?: Locator;
};

export class NewsletterDatePickerComponent extends BaseActionUtil {
  private readonly fromDateInput: Locator;
  private readonly toDateInput: Locator;
  private readonly monthLabels: Record<string, string>;

  constructor(page: Page, config?: DatePickerConfig) {
    super(page);
    this.fromDateInput = config?.fromDateLocator ?? this.page.locator('#from_date');
    this.toDateInput = config?.toDateLocator ?? this.page.locator('#to_date');
    this.monthLabels = {
      jan: 'January',
      january: 'January',
      feb: 'February',
      february: 'February',
      mar: 'March',
      march: 'March',
      apr: 'April',
      april: 'April',
      may: 'May',
      jun: 'June',
      june: 'June',
      jul: 'July',
      july: 'July',
      aug: 'August',
      august: 'August',
      sep: 'September',
      sept: 'September',
      september: 'September',
      oct: 'October',
      october: 'October',
      nov: 'November',
      november: 'November',
      dec: 'December',
      december: 'December',
    };
  }

  private async resolveDateTrigger(
    explicitLocator: Locator,
    rolePattern: RegExp,
    fallbackSelector: string
  ): Promise<Locator> {
    const locatorCandidates: Locator[] = [
      explicitLocator,
      this.page.getByRole('button', { name: rolePattern }),
      this.page.getByRole('textbox', { name: rolePattern }),
      this.page.locator(fallbackSelector),
    ];

    for (const candidate of locatorCandidates) {
      try {
        const resolved = candidate.first();
        await resolved.waitFor({ state: 'visible', timeout: 2000 });
        return resolved;
      } catch {
        continue;
      }
    }

    throw new Error(`Unable to resolve visible trigger for date picker using pattern ${rolePattern}`);
  }

  private getVisibleMonthDropdown(): Locator {
    return this.page.locator('[aria-label="Select month"]:visible');
  }

  private getVisibleYearDropdown(): Locator {
    return this.page.locator('[aria-label="Select year"]:visible');
  }

  private getVisibleCalendarDays(): Locator {
    return this.page.locator('[class="DayPicker-Day"]:visible');
  }

  private async selectDropdownOption(dropdownLocator: Locator, label: string): Promise<void> {
    const dropdown = dropdownLocator.first();
    await expect(dropdown, `Dropdown with label ${label} should be visible`).toBeVisible();
    try {
      await dropdown.selectOption({ label });
      return;
    } catch {
      const fallbackResult = await dropdown.selectOption({ value: label }).catch(() => []);
      if (Array.isArray(fallbackResult) && fallbackResult.length > 0) {
        return;
      }
      throw new Error(`Unable to select option with label or value "${label}" from date picker dropdown.`);
    }
  }

  private normalizeMonth(month: string): string {
    const normalized = month.trim().toLowerCase();
    return this.monthLabels[normalized] || month;
  }

  private normalizeDay(day: string): string {
    const parsedDay = Number.parseInt(day, 10);
    if (Number.isNaN(parsedDay) || parsedDay <= 0 || parsedDay > 31) {
      throw new Error(`Invalid day provided to date picker: ${day}`);
    }
    return String(parsedDay);
  }

  private async selectCalendarDay(month: string, year: string, day: string): Promise<void> {
    const normalizedMonth = this.normalizeMonth(month);
    const normalizedDay = this.normalizeDay(day);
    const ariaSubstring = `${normalizedMonth} ${normalizedDay}, ${year}`;

    const calendarDay = this.page
      .locator(`[class="DayPicker-Day"][aria-label*="${ariaSubstring}"]:not([aria-disabled="true"])`)
      .first();

    await expect(calendarDay, `Date ${ariaSubstring} should be available for selection`).toBeVisible();
    await calendarDay.click();
  }

  async selectFromDate(month: string, year: string, day: string): Promise<void> {
    const fromTrigger = await this.resolveDateTrigger(this.fromDateInput, /^Date from/i, '#from_date');
    await this.clickOnElement(fromTrigger, {
      stepInfo: 'Open From date picker',
    });
    await this.selectDropdownOption(this.getVisibleMonthDropdown(), this.normalizeMonth(month));
    await this.selectDropdownOption(this.getVisibleYearDropdown(), year);
    await this.selectCalendarDay(month, year, day);
  }

  async selectToDate(month: string, year: string, day: string): Promise<void> {
    const toTrigger = await this.resolveDateTrigger(this.toDateInput, /^Date to/i, '#to_date');
    await this.clickOnElement(toTrigger, {
      stepInfo: 'Open To date picker',
    });
    await this.selectDropdownOption(this.getVisibleMonthDropdown(), this.normalizeMonth(month));
    await this.selectDropdownOption(this.getVisibleYearDropdown(), year);
    await this.selectCalendarDay(month, year, day);
  }

  async selectDateRange(from: DateSelection, to: DateSelection): Promise<void> {
    await this.selectFromDate(from.month, from.year, from.day);
    await this.selectToDate(to.month, to.year, to.day);
  }
}
