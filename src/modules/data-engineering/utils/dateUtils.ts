/**
 * Utility functions for date handling in analytics tests
 */

/**
 * Converts numeric month (1-12 or 01-12) to UI-expected month abbreviation
 * @param month - Numeric month string (e.g., "1", "01", "12")
 * @returns Month abbreviation (e.g., "Jan", "Feb", "Dec")
 */
export function convertNumericMonthToAbbreviation(month: string): string {
  const monthMap: Record<string, string> = {
    '1': 'Jan',
    '01': 'Jan',
    '2': 'Feb',
    '02': 'Feb',
    '3': 'Mar',
    '03': 'Mar',
    '4': 'Apr',
    '04': 'Apr',
    '5': 'May',
    '05': 'May',
    '6': 'Jun',
    '06': 'Jun',
    '7': 'Jul',
    '07': 'Jul',
    '8': 'Aug',
    '08': 'Aug',
    '9': 'Sep',
    '09': 'Sep',
    '10': 'Oct',
    '11': 'Nov',
    '12': 'Dec',
  };

  return monthMap[month] || month;
}

/**
 * Converts numeric month (1-12 or 01-12) to full month name
 * @param month - Numeric month string (e.g., "1", "01", "12")
 * @returns Full month name (e.g., "January", "February", "December")
 */
export function convertNumericMonthToFullName(month: string): string {
  const monthMap: Record<string, string> = {
    '1': 'January',
    '01': 'January',
    '2': 'February',
    '02': 'February',
    '3': 'March',
    '03': 'March',
    '4': 'April',
    '04': 'April',
    '5': 'May',
    '05': 'May',
    '6': 'June',
    '06': 'June',
    '7': 'July',
    '07': 'July',
    '8': 'August',
    '08': 'August',
    '9': 'September',
    '09': 'September',
    '10': 'October',
    '11': 'November',
    '12': 'December',
  };

  return monthMap[month] || month;
}

/**
 * Converts month abbreviation to numeric month
 * @param abbreviation - Month abbreviation (e.g., "Jan", "Feb", "Dec")
 * @returns Numeric month string (e.g., "01", "02", "12")
 */
export function convertMonthAbbreviationToNumeric(abbreviation: string): string {
  const monthMap: Record<string, string> = {
    Jan: '01',
    Feb: '02',
    Mar: '03',
    Apr: '04',
    May: '05',
    Jun: '06',
    Jul: '07',
    Aug: '08',
    Sep: '09',
    Oct: '10',
    Nov: '11',
    Dec: '12',
  };

  return monthMap[abbreviation] || abbreviation;
}

/**
 * Validates if a month string is in numeric format (1-12 or 01-12)
 * @param month - Month string to validate
 * @returns True if month is numeric format
 */
export function isNumericMonth(month: string): boolean {
  return /^([1-9]|0[1-9]|1[0-2])$/.test(month);
}

/**
 * Validates if a month string is in abbreviation format (Jan-Dec)
 * @param month - Month string to validate
 * @returns True if month is abbreviation format
 */
export function isMonthAbbreviation(month: string): boolean {
  return /^(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)$/.test(month);
}

/**
 * Helper function to create custom date range for analytics filters
 * @param params - Object containing date parameters
 * @param params.startYear - Start year (e.g., "2024")
 * @param params.startMonth - Start month as numeric string (e.g., "1" or "01")
 * @param params.startDay - Start day (e.g., "1" or "01")
 * @param params.endYear - End year (e.g., "2025"), defaults to current year if not provided
 * @param params.endMonth - End month as numeric string (e.g., "8" or "08"), defaults to current month if not provided
 * @param params.endDay - End day (e.g., "1" or "01"), defaults to current day if not provided
 * @returns Object with customStartDate and customEndDate for analytics filters
 */
export function createCustomDateRange(params: {
  startYear: string;
  startMonth: string;
  startDay: string;
  endYear?: string;
  endMonth?: string;
  endDay?: string;
}) {
  const { startYear, startMonth, startDay, endYear, endMonth, endDay } = params;

  // Use current date as default if end date components are not provided
  const currentDate = new Date();
  const defaultEndYear = endYear || currentDate.getFullYear().toString();
  const defaultEndMonth = endMonth || (currentDate.getMonth() + 1).toString().padStart(2, '0');
  const defaultEndDay = endDay || currentDate.getDate().toString().padStart(2, '0');

  return {
    customStartDate: {
      year: startYear,
      month: startMonth, // Will be converted to abbreviation in the component
      day: startDay,
    },
    customEndDate: {
      year: defaultEndYear,
      month: defaultEndMonth, // Will be converted to abbreviation in the component
      day: defaultEndDay,
    },
  };
}
