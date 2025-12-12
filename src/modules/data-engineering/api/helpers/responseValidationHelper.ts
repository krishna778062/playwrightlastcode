/**
 * Response Validation Helper
 * Provides utility functions for validating API response data against expected values
 */

import { expect, TestInfo } from '@playwright/test';

/** Default API response time threshold in ms */
const DEFAULT_RESPONSE_TIME_MS = 2000;

/** Result of API call with timing */
export interface TimedResponse<T> {
  data: T;
  responseTime: number;
}

/** Options for withTiming */
export interface TimingOptions {
  /** Max allowed response time in ms (default: 2000). Set to 0 to skip validation */
  maxResponseTime?: number;
}

/**
 * Wraps an API call, measures response time, and validates against threshold
 * @param apiCall - The API call to execute
 * @param options - Optional config (maxResponseTime defaults to 2000ms)
 */
export async function withTiming<T>(apiCall: () => Promise<T>, options?: TimingOptions): Promise<TimedResponse<T>> {
  const maxTime = options?.maxResponseTime ?? DEFAULT_RESPONSE_TIME_MS;

  const start = Date.now();
  const data = await apiCall();
  const responseTime = Date.now() - start;

  if (maxTime > 0) {
    expect.soft(responseTime, `Verify API responds within ${maxTime}ms`).toBeLessThan(maxTime);
  }

  return { data, responseTime };
}

/**
 * Skips test if no data is found and adds annotation to report
 * @returns true if test should be skipped (no data), false otherwise
 */
export function skipIfNoData<T>(
  data: T[],
  skipReason: string,
  testInfo: TestInfo,
  skipFn: (condition: boolean, reason: string) => void
): data is [] {
  if (data.length === 0) {
    testInfo.annotations.push({ type: 'Skip Reason', description: skipReason });
    skipFn(true, skipReason);
    return true;
  }
  return false;
}

/** Content engagement response metadata */
export interface ContentEngagementMetadata {
  success: boolean;
  metadata: {
    tenantId: string;
    contentId: string;
    isRestricted: boolean;
  };
}

/** Expected metadata values for validation */
export interface ExpectedMetadata {
  tenantId: string;
  contentId: string;
  isRestricted: boolean;
}

/**
 * Asserts content engagement API response metadata is valid
 */
export function assertResponseMetadata(response: ContentEngagementMetadata, expected: ExpectedMetadata): void {
  expect(response.success, 'Verify API returns successful response').toBe(true);
  expect(response.metadata.tenantId, 'Verify tenant identifier in response').toBe(expected.tenantId);
  expect(response.metadata.contentId, 'Verify content identifier in response').toBe(expected.contentId);
  expect(response.metadata.isRestricted, 'Verify restricted flag in response').toBe(expected.isRestricted);
}

/** Engagement metrics from API response */
export interface EngagementMetrics {
  total_reactions: number;
  total_comments: number;
  total_replies: number;
  total_shares: number;
  total_favorites: number;
}

/** Engagement metrics from database */
export interface DbEngagementMetrics {
  REACTIONS_COUNT: number;
  COMMENT_COUNT: number;
  REPLIES_COUNT: number;
  SHARES_COUNT: number;
  FAVORITES_COUNT: number;
}

/**
 * Asserts engagement metrics from API match database values
 */
export function assertEngagementMetricsMatch(apiMetrics: EngagementMetrics, dbMetrics: DbEngagementMetrics): void {
  expect(apiMetrics.total_reactions, 'Verify reactions count matches data warehouse').toBe(dbMetrics.REACTIONS_COUNT);
  expect(apiMetrics.total_comments, 'Verify comments count matches data warehouse').toBe(dbMetrics.COMMENT_COUNT);
  expect(apiMetrics.total_replies, 'Verify replies count matches data warehouse').toBe(dbMetrics.REPLIES_COUNT);
  expect(apiMetrics.total_shares, 'Verify shares count matches data warehouse').toBe(dbMetrics.SHARES_COUNT);
  expect(apiMetrics.total_favorites, 'Verify favorites count matches data warehouse').toBe(dbMetrics.FAVORITES_COUNT);
}
