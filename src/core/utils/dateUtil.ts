/**
 * Returns today's date formatted as 'Mon DD, YYYY' (e.g., 'Jul 31, 2024').
 * @returns {string} The formatted date string for today.
 */
export function getTodayFormattedDate(): string {
  const today = new Date();
  return today.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

/**
 * Returns today's date as an ISO string (e.g., '2024-07-31T00:00:00.000Z').
 * @returns {string} The ISO string for today's date.
 */
export function getTodayDateIsoString(): string {
  return new Date().toISOString();
}

/**
 * Returns tomorrow's date as an ISO string (e.g., '2024-08-01T00:00:00.000Z').
 * @returns {string} The ISO string for tomorrow's date.
 */
export function getTomorrowDateIsoString(): string {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return tomorrow.toISOString();
}

/**
 * Returns the display text for an event date range. If the range is today and tomorrow, returns 'TODAY - TOMORROW'.
 * Otherwise, returns a formatted range like 'Thu, Jul 31 - Aug 1'.
 * @param {string} fromDate - The start date of the event (ISO string).
 * @param {string} toDate - The end date of the event (ISO string).
 * @returns {string} The formatted event date display text.
 */
export function getEventDateDisplayText(fromDate: string, toDate: string): string {
  const from = new Date(fromDate);
  const to = new Date(toDate);
  const now = new Date();

  // Helper to check if a date is today
  const isToday = (date: Date) =>
    date.getDate() === now.getDate() && date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();

  // Helper to check if a date is tomorrow
  const tomorrow = new Date(now);
  tomorrow.setDate(now.getDate() + 1);
  const isTomorrow = (date: Date) =>
    date.getDate() === tomorrow.getDate() &&
    date.getMonth() === tomorrow.getMonth() &&
    date.getFullYear() === tomorrow.getFullYear();

  if (isToday(from) && isTomorrow(to)) {
    return 'Today  - Tomorrow';
  } else {
    // Example: Thu, Jul 31 - Aug 1
    const fromStr =
      from.toLocaleString('en-US', { weekday: 'short' }) +
      ', ' +
      from.toLocaleString('en-US', { month: 'short' }) +
      ' ' +
      from.getDate();
    const toStr = to.toLocaleString('en-US', { month: 'short' }) + ' ' + to.getDate();
    return `${fromStr} - ${toStr}`;
  }
}

/**
 * Changes the date format to YYYY-MM-DD.
 * @param {string} dateToBeFormatted - Date to be formatted.
 * @returns {string} The formatted date.
 */
export function changeDateFormatToYYYYMMDD(dateToBeFormatted: string): string {
  const date = new Date(dateToBeFormatted);
  // Format as YYYY-MM-DD
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-based
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

/**
 * Checks if a given date falls on a weekend (Saturday or Sunday)
 * @param {Date} date - The date to check
 * @returns {boolean} True if the date is a weekend, false otherwise
 */
export function isWeekend(date: Date): boolean {
  const dayOfWeek = date.getDay();
  return dayOfWeek === 0 || dayOfWeek === 6; // Sunday = 0, Saturday = 6
}

/**
 * Gets the next working day from a given date (skips weekends)
 * @param {Date} startDate - The starting date
 * @returns {Date} The next working day
 */
export function getNextWorkingDay(startDate: Date): Date {
  // Create a new date object to avoid mutating the original
  const result = new Date(startDate.getTime());
  result.setDate(result.getDate() + 1);

  while (isWeekend(result)) {
    result.setDate(result.getDate() + 1);
  }
  return result;
}

/**
 * Adds a specified number of working days to a given date (skips weekends)
 * @param {Date} startDate - The starting date
 * @param {number} workingDaysToAdd - Number of working days to add
 * @returns {Date} The resulting date after adding working days
 */
export function addWorkingDays(startDate: Date, workingDaysToAdd: number): Date {
  // Create a new date object to avoid mutating the original
  const result = new Date(startDate.getTime());
  let addedDays = 0;

  while (addedDays < workingDaysToAdd) {
    result.setDate(result.getDate() + 1);
    if (!isWeekend(result)) {
      addedDays++;
    }
  }
  return result;
}

/**
 * Formats a date for date picker aria-label (e.g., "Mon Sep 16 2025")
 * @param {Date} date - The date to format
 * @returns {string} Formatted date string for aria-label
 */
export function formatDateForAriaLabel(date: Date): string {
  const formatter = new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    month: 'short',
    day: '2-digit',
    year: 'numeric',
  });
  return formatter
    .format(date)
    .replace(/,/g, '')
    .replace(/\u00A0/g, ' ');
}

/**
 * Formats a date for display in date inputs (e.g., "Sep 16, 2025")
 * @param {Date} date - The date to format
 * @returns {string} Formatted date string for display
 */
export function formatDateForDisplay(date: Date): string {
  // Validate the date object
  if (!date || isNaN(date.getTime())) {
    throw new Error(`Invalid date object: ${date}`);
  }

  // for consistent local time formatting
  const month = date.toLocaleDateString('en-US', {
    month: 'short',
    localeMatcher: 'best fit',
  });
  const day = date.getDate();
  const year = date.getFullYear();

  return `${month} ${day}, ${year}`;
}

/**
 * Formats a date for display using UTC methods to avoid timezone conversion issues (e.g., "Sep 16, 2025")
 * @param {Date} date - The date to format
 * @returns {string} Formatted date string for display using UTC
 */
export function formatDateForDisplayUTC(date: Date): string {
  // Validate the date object
  if (!date || isNaN(date.getTime())) {
    throw new Error(`Invalid date object: ${date}`);
  }

  // Use UTC methods to avoid timezone conversion issues
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const month = monthNames[date.getUTCMonth()];
  const day = date.getUTCDate();
  const year = date.getUTCFullYear();

  return `${month} ${day}, ${year}`;
}

export function validateTimestampFormat(timestamp: string): boolean {
  if (!timestamp || typeof timestamp !== 'string') {
    console.error(`Invalid timestamp: ${timestamp}`);
    return false;
  }
  console.log(`Validating timestamp: ${timestamp}`);
  const timestampPattern =
    /^(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+\d{1,2},\s+\d{4}\s+at\s+\d{1,2}:\d{2}\s*(am|pm)$/i;

  return timestampPattern.test(timestamp.trim());
}
