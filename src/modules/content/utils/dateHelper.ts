/**
 * Date helper utilities for generating past and upcoming dates
 */

/**
 * Generates a past date string in YYYY-MM-DD format
 * @param daysAgo - Number of days in the past (default: 1)
 * @returns Date string in YYYY-MM-DD format
 */
export function getPastDate(daysAgo: number = 1): string {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return date.toISOString().split('T')[0];
}

/**
 * Generates an upcoming date string in YYYY-MM-DD format
 * @param daysAhead - Number of days in the future (default: 1)
 * @returns Date string in YYYY-MM-DD format
 */
export function getUpcomingDate(daysAhead: number = 1): string {
  const date = new Date();
  date.setDate(date.getDate() + daysAhead);
  return date.toISOString().split('T')[0];
}
