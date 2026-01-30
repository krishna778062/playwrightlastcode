import { PeriodFilterTimeRange } from '../constants/periodFilterTimeRange';

/**
 * Static period filter configuration with hardcoded expected values
 * Used across analytics dashboards for testing with different period filters
 */
export interface StaticPeriodFilterConfig {
  filter: PeriodFilterTimeRange;
  expectedValue: number;
}

/**
 * Static period filters available for random selection
 * Note: Expected values are placeholders - update based on actual test data
 */
export const STATIC_PERIOD_FILTERS: readonly PeriodFilterTimeRange[] = [
  PeriodFilterTimeRange.LAST_7_DAYS,
  PeriodFilterTimeRange.LAST_30_DAYS,
  PeriodFilterTimeRange.LAST_90_DAYS,
  PeriodFilterTimeRange.LAST_12_MONTHS,
  PeriodFilterTimeRange.YEAR_TO_DATE,
];

/**
 * Randomly selects a static period filter from the available options
 * @returns A randomly selected period filter time range
 */
export function getRandomStaticPeriodFilter(): PeriodFilterTimeRange {
  const randomIndex = Math.floor(Math.random() * STATIC_PERIOD_FILTERS.length);
  return STATIC_PERIOD_FILTERS[randomIndex];
}

/**
 * Gets all available static period filters
 * @returns Array of all static period filters
 */
export function getAllStaticPeriodFilters(): readonly PeriodFilterTimeRange[] {
  return STATIC_PERIOD_FILTERS;
}
