/**
 * Constants for Benchmark Metric Component
 * Defines trend directions, colors, and benchmark-related labels
 */

export const TREND_DIRECTIONS = {
  UP: 'up',
  DOWN: 'down',
} as const;

export const TREND_COLORS = {
  POSITIVE: 'green',
  NEGATIVE: 'red',
  NEUTRAL: 'gray',
} as const;

export const BENCHMARK_LABELS = {
  MORE_THAN_BENCHMARK: 'more than benchmark',
  LESS_THAN_BENCHMARK: 'less than benchmark',
  EQUAL_TO_BENCHMARK: 'equal to benchmark',
} as const;

export const TREND_ARROWS = {
  UP: '↑',
  DOWN: '↓',
  NEUTRAL: '→',
} as const;

export type TrendDirection = (typeof TREND_DIRECTIONS)[keyof typeof TREND_DIRECTIONS];
export type BenchmarkLabel = (typeof BENCHMARK_LABELS)[keyof typeof BENCHMARK_LABELS];
