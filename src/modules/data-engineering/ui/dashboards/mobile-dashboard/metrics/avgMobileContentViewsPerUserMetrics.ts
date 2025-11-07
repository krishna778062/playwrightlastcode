import { MOBILE_DASHBOARD_METRICS } from '@data-engineering/constants/mobileDashboardMetrics';
import { expect, FrameLocator, Page, test } from '@playwright/test';

import { HeroMetricsComponent } from '../../../components/heroMetricsComponent';

export class AvgMobileContentViewsPerUserMetrics extends HeroMetricsComponent {
  constructor(page: Page, thoughtSpotIframe: FrameLocator) {
    super(page, thoughtSpotIframe, MOBILE_DASHBOARD_METRICS.AVG_MOBILE_CONTENT_VIEWS_PER_USER.title);
  }

  /**
   * Verifies all UI data points for the Avg mobile content views per user metric
   */
  async verifyMetricUIDataPoints(): Promise<void> {
    await this.verifyAnswerTitleIsVisible();
    await this.verifyAnswerSubTitleIsVisible(MOBILE_DASHBOARD_METRICS.AVG_MOBILE_CONTENT_VIEWS_PER_USER.subtitle);
  }

  /**
   * Verifies the metric value matches the expected value
   * Overrides base method to handle decimal values (e.g., "0.0" vs "0")
   * @param expectedValue - The expected metric value
   */
  async verifyMetricValue(expectedValue: string): Promise<void> {
    await test.step(`Verify hero metric value for ${this.metricTitle} is ${expectedValue}`, async () => {
      const expectedNumericValue = parseFloat(expectedValue);

      // Get the actual UI value and normalize it
      const actualValue = await this.getMetricValue();
      const normalizedActualValue = actualValue.replace(/,/g, '').split(' ')[0];
      const actualNumericValue = parseFloat(normalizedActualValue);

      // Compare as numbers to handle decimal formatting differences (e.g., "0.0" vs "0")
      expect(actualNumericValue, `Hero metric value should be ${expectedNumericValue} (UI shows: ${actualValue})`).toBe(
        expectedNumericValue
      );
    });
  }
}
