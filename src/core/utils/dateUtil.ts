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
