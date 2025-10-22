import { differenceInDays, format, startOfYear, subDays, subMonths, subYears } from 'date-fns';

import { PeriodFilterTimeRange } from '../constants/periodFilterTimeRange';

/**
 * Type for period filter options
 */
export type PeriodFilterOption = (typeof PeriodFilterTimeRange)[keyof typeof PeriodFilterTimeRange];

/**
 * Interface for date replacement results
 */
export interface DateReplacements {
  timePeriod: PeriodFilterOption;
  startDate: string;
  endDate: string;
}

/**
 * Helper class for date calculations in Data Engineering tests
 */
export class DateHelper {
  /**
   * Gets the current date in UTC timezone
   * @returns Date object representing current UTC date
   */
  static getCurrentUTCDate(): Date {
    const localDate = new Date();
    return new Date(localDate.getTime() + localDate.getTimezoneOffset() * 60000);
  }
  /**
   * Gets date replacements for SQL queries based on period type
   * Handles both static periods (Last X days/months) and custom date ranges
   *
   * @param period - The period filter option from PeriodFilterTimeRange enum
   * @param customStartDate - Custom start date (YYYY-MM-DD format), required if period is CUSTOM
   * @param customEndDate - Custom end date (YYYY-MM-DD format), defaults to current date if not provided
   * @returns DateReplacements object with startDate and endDate
   */
  static getDateReplacements(
    period: PeriodFilterOption,
    customStartDate?: string,
    customEndDate?: string
  ): DateReplacements {
    // Handle Custom period
    if (period === PeriodFilterTimeRange.CUSTOM) {
      if (!customStartDate) {
        throw new Error('Custom period requires customStartDate');
      }

      // Use current date as default if customEndDate is not provided
      const endDate = customEndDate || DateHelper.getCurrentUTCDate().toISOString().split('T')[0];

      // Validate date format
      this.validateDateFormat(customStartDate, 'customStartDate');
      this.validateDateFormat(endDate, 'customEndDate');

      // Validate date range
      this.validateDateRange(customStartDate, endDate);

      return {
        timePeriod: PeriodFilterTimeRange.CUSTOM,
        startDate: `${customStartDate} 00:00:00`,
        endDate: `${endDate} 23:59:59`,
      };
    }

    // Handle static periods (Last X days/months, Year to date)
    const daysToSubtract = this.getPeriodDays(period);
    const currentDate = DateHelper.getCurrentUTCDate();
    const startDate = subDays(currentDate, daysToSubtract);

    return {
      timePeriod: period,
      startDate: `${format(startDate, 'yyyy-MM-dd')} 00:00:00`,
      endDate: `${format(currentDate, 'yyyy-MM-dd')} 23:59:59`,
    };
  }

  /**
   * Converts a period filter option to the number of days for date range calculations
   *
   * @param period - The period filter option from PeriodFilterTimeRange enum
   * @returns The number of days to subtract from current date
   *
   * @example
   * DateHelper.getPeriodDays(PeriodFilterTimeRange.LAST_7_DAYS) // returns 6 (7 days total including start and end)
   * DateHelper.getPeriodDays(PeriodFilterTimeRange.LAST_30_DAYS) // returns 29 (30 days total including start and end)
   * DateHelper.getPeriodDays(PeriodFilterTimeRange.LAST_12_MONTHS) // returns ~365 (actual days in 12 months)
   * DateHelper.getPeriodDays(PeriodFilterTimeRange.YEAR_TO_DATE) // returns days from Jan 1 to today
   */
  static getPeriodDays(period: PeriodFilterOption): number {
    const today = DateHelper.getCurrentUTCDate();

    // Handle "Last X days"
    const daysMatch = period.match(/Last (\d+) days?/i);
    if (daysMatch) {
      const days = parseInt(daysMatch[1], 10);
      return days - 1; // e.g., "Last 7 days" returns 6, "Last 30 days" returns 29
    }

    // Handle "Last X months"
    const monthsMatch = period.match(/Last (\d+) months?/i);
    if (monthsMatch) {
      const months = parseInt(monthsMatch[1], 10);
      const targetDate = subMonths(today, months);
      return differenceInDays(today, targetDate);
    }

    // Handle "Year to date"
    if (period.match(/Year to date/i)) {
      const yearStart = startOfYear(today);
      return differenceInDays(today, yearStart);
    }

    // Handle "Custom" or unknown periods
    throw new Error(
      `Unsupported period: "${period}". Supported periods: ${Object.values(PeriodFilterTimeRange).join(', ')}`
    );
  }

  /**
   * Validates that a date string is in YYYY-MM-D or YYYY-MM-DD format
   * @param dateString - The date string to validate
   * @param paramName - The parameter name for error messages
   */
  private static validateDateFormat(dateString: string, paramName: string): void {
    const dateRegex = /^\d{4}-\d{1,2}-\d{1,2}$/;
    if (!dateRegex.test(dateString)) {
      throw new Error(`${paramName} must be in YYYY-MM-D or YYYY-MM-DD format. Received: "${dateString}"`);
    }

    // Validate that it's a valid date
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      throw new Error(`${paramName} must be a valid date. Received: "${dateString}"`);
    }
  }

  /**
   * Validates that start date is before or equal to end date
   * @param startDate - Start date in YYYY-MM-DD format
   * @param endDate - End date in YYYY-MM-DD format
   */
  private static validateDateRange(startDate: string, endDate: string): void {
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (start > end) {
      throw new Error(`customStartDate (${startDate}) must be before or equal to customEndDate (${endDate})`);
    }
  }

  /**
   * Creates a custom date range for testing purposes
   * Start date: Current date - 1 year - 1 month
   * End date: Current date - 1 day
   *
   * @returns Object with custom date range in ISO format
   */
  static createTestCustomDateRange(): {
    startDate: string;
    endDate: string;
  } {
    const currentDate = DateHelper.getCurrentUTCDate();

    const startDate = subMonths(subYears(currentDate, 1), 1);
    const endDate = subDays(currentDate, 1);

    // Log the calculated dates for debugging
    console.log('Custom Period Filter Dates:');
    console.log(`  ISO Format: ${format(startDate, 'yyyy-MM-dd')} to ${format(endDate, 'yyyy-MM-dd')}`);

    return {
      startDate: format(startDate, 'yyyy-MM-dd'),
      endDate: format(endDate, 'yyyy-MM-dd'),
    };
  }

  /**
   * Converts ISO date strings to UI format for date picker components
   * @param startDate - Start date in ISO format (YYYY-MM-DD)
   * @param endDate - End date in ISO format (YYYY-MM-DD)
   * @returns Object with UI format dates
   */
  static convertISOToUIFormat(
    startDate: string,
    endDate: string
  ): {
    customStartDate: { year: string; month: string; day: string };
    customEndDate: { year: string; month: string; day: string };
  } {
    const start = new Date(startDate);
    const end = new Date(endDate);

    return {
      customStartDate: {
        year: format(start, 'yyyy'),
        month: format(start, 'MMM'),
        day: format(start, 'd'),
      },
      customEndDate: {
        year: format(end, 'yyyy'),
        month: format(end, 'MMM'),
        day: format(end, 'd'),
      },
    };
  }

  /**
   * Calculates the difference in days between two dates
   * @param startDate - Start date in YYYY-MM-DD format
   * @param endDate - End date in YYYY-MM-DD format
   * @returns The difference in days
   */
  static differenceInDays(startDate: string, endDate: string): number {
    const start = new Date(startDate);
    const end = new Date(endDate);
    return differenceInDays(end, start);
  }
}
