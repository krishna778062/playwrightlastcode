import { FrameLocator, Page } from '@playwright/test';

import { SEARCH_METRICS } from '../../../../constants/searchMetrics';
import { HeroMetricsComponent } from '../../../../ui/components/heroMetricsComponent';

export class AverageSearchesPerLoggedInUser extends HeroMetricsComponent {
  constructor(page: Page, iframe: FrameLocator) {
    super(page, iframe, SEARCH_METRICS.AVERAGE_SEARCHES_PER_LOGGED_IN_USER.title);
  }

  /**
   * Verifies all UI data points for the Average Searches Per Logged In User metric
   */
  async verifyMetricUIDataPoints(): Promise<void> {
    await this.verifyAnswerTitleIsVisible();
    await this.verifyAnswerSubTitleIsVisible(SEARCH_METRICS.AVERAGE_SEARCHES_PER_LOGGED_IN_USER.subtitle);
  }

  /**
   * Verifies the metric value matches the expected value
   * @param expectedValue - The expected metric value
   */
  async verifyMetricValue(expectedValue: number): Promise<void> {
    // Round to 1 decimal place to match UI display format
    const roundedValue = Math.round(expectedValue * 10) / 10;
    await this.verifyMetricValueIsLoadedForHeroMetric(roundedValue);
  }
}
