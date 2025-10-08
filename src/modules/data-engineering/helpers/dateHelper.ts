/**
 * Helper class for date calculations in Data Engineering tests
 */
export class DateHelper {
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
}
