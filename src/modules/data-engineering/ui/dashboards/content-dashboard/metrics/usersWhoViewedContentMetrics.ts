import { expect, FrameLocator, Page, test } from '@playwright/test';

import { CustomHeroMetricComponent } from '../../../components/customHeroMetricComponent';

export class UsersWhoViewedContentMetrics extends CustomHeroMetricComponent {
  constructor(page: Page, thoughtSpotIframe: FrameLocator) {
    super(page, thoughtSpotIframe, 'Users who viewed content');
  }

  /**
   * Verifies the metric value matches the expected percentage value
   * Overrides base method to handle percentage values (e.g., "14.1%" or "14.1")
   * @param expectedValue - The expected metric value as a number (e.g., 14.1 for 14.1%)
   */
  async verifyMetricValue(expectedValue: number | string): Promise<void> {
    await test.step(`Verify hero metric value for ${this.metricTitle} is ${expectedValue}%`, async () => {
      const expectedNumericValue = typeof expectedValue === 'string' ? parseFloat(expectedValue) : expectedValue;

      await expect(async () => {
        // Get the actual UI value and normalize it
        const actualValue = await this.getMetricValue();
        // Remove commas and % sign, then extract the numeric value
        const normalizedActualValue = actualValue.replace(/,/g, '').replace(/%/g, '').trim();
        const actualNumericValue = parseFloat(normalizedActualValue);

        // Compare as numbers to handle decimal formatting differences
        expect(
          actualNumericValue,
          `Hero metric value should be ${expectedNumericValue}% (UI shows: ${actualValue})`
        ).toBeCloseTo(expectedNumericValue, 1); // Allow 0.1% tolerance for rounding
      }, `Polling for the metric value to be loaded and matches the expected value ${expectedNumericValue}% for metric ${this.metricTitle}`).toPass(
        {
          timeout: 60_000,
        }
      );
    });
  }
}
