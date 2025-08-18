export const TIMEOUTS = {
  DEFAULT: 8_000,
  SHORT: 15_000,
  MEDIUM: 30_000,
  LONG: 45_000,
  VERY_LONG: 60_000,
  VERY_VERY_LONG: 120_000,
};

// Retry intervals (in milliseconds) - Used in tests
export const RETRY_INTERVALS = {
  DEFAULT: [1500, 3000, 5000] as number[],
  FAST: [1000, 2000, 3000] as number[],
  SLOW: [3000, 5000, 8000] as number[],
};
