/**
 * Helper class for date calculations in Data Engineering tests
 */
export class DateHelper {
  /**
   * Gets date replacements for SQL queries based on period type
   * Handles both static periods (Last X days/months) and custom date ranges
   *
   * @param period - The period string or 'Custom'
   * @param customStartDate - Custom start date (YYYY-MM-DD format)
   * @param customEndDate - Custom end date (YYYY-MM-DD format), defaults to current date if not provided
   * @returns Object with date parameters for SQL replacement
   */
  static getDateReplacements(period: string, customStartDate?: string, customEndDate?: string): Record<string, string> {
    // Handle Custom period
    if (period === 'Custom') {
      if (!customStartDate) {
        throw new Error('Custom period requires customStartDate');
      }

      // Use current date as default if customEndDate is not provided
      const endDate = customEndDate || new Date().toISOString().split('T')[0];

      // Validate date format
      this.validateDateFormat(customStartDate, 'customStartDate');
      this.validateDateFormat(endDate, 'customEndDate');

      // Validate date range
      this.validateDateRange(customStartDate, endDate);

      return {
        startDate: `${customStartDate} 00:00:00`,
        endDate: `${endDate} 23:59:59`,
      };
    }

    // Handle static periods (Last X days/months, Year to date)
    const daysToSubtract = this.getPeriodDays(period);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - daysToSubtract);

    return {
      startDate: `${startDate.toISOString().split('T')[0]} 00:00:00`,
      endDate: `${new Date().toISOString().split('T')[0]} 23:59:59`,
    };
  }

  /**
   * Converts a period string to the number of days for date range calculations
   *
   * @param period - The period string (e.g., "Last 7 days", "Last 12 months", "Year to date")
   * @returns The number of days to subtract from current date
   *
   * @example
   * DateHelper.getPeriodDays("Last 7 days") // returns 6
   * DateHelper.getPeriodDays("Last 30 days") // returns 29
   * DateHelper.getPeriodDays("Last 12 months") // returns ~365 (actual days in 12 months)
   * DateHelper.getPeriodDays("Year to date") // returns days from Jan 1 to today
   */
  static getPeriodDays(period: string): number {
    const today = new Date();

    // Handle "Last X days"
    const daysMatch = period.match(/Last (\d+) days?/i);
    if (daysMatch) {
      const days = parseInt(daysMatch[1], 10);
      return days - 1; // e.g., "Last 7 days" returns 6
    }

    // Handle "Last X months"
    const monthsMatch = period.match(/Last (\d+) months?/i);
    if (monthsMatch) {
      const months = parseInt(monthsMatch[1], 10);
      const targetDate = new Date(today);
      targetDate.setMonth(today.getMonth() - months);

      // Calculate actual days between the two dates
      const diffTime = Math.abs(today.getTime() - targetDate.getTime());
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      return diffDays;
    }

    // Handle "Year to date"
    if (period.match(/Year to date/i)) {
      const startOfYear = new Date(today.getFullYear(), 0, 1); // January 1st of current year
      const diffTime = Math.abs(today.getTime() - startOfYear.getTime());
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      return diffDays;
    }

    // Handle "Custom" or unknown periods
    throw new Error(
      `Unsupported period format: "${period}". Supported formats: "Last X days", "Last X months", "Year to date"`
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
}
