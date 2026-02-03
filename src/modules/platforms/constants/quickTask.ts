/**
 * Array of day names in order (Sunday to Saturday)
 */
export const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

/**
 * Array of month names in order (January to December)
 */
export const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

/**
 * Default number of days in the future to select for task due date
 */
export const DEFAULT_FUTURE_DAYS_OFFSET = 7;

/**
 * Default tags to use when creating tasks via API
 */
export const DEFAULT_TASK_TAGS = ['Bug', 'Feature'];

/**
 * Returns the ordinal suffix (st, nd, rd, th) for a given number
 * @param n - The number to get the ordinal suffix for
 * @returns The ordinal suffix string
 */
export const getOrdinalSuffix = (n: number): string => {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return s[(v - 20) % 10] || s[v] || s[0];
};
