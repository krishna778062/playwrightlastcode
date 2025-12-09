import { expect, FrameLocator, Locator, Page, test } from '@playwright/test';

import { TIMEOUTS } from '@core/constants/timeouts';

import { VerticalBarChartComponent } from '../../../components/verticalBarChartComponent';

/**
 * Base class for mobile dashboard bar chart metrics that render bars for all dates in the range,
 * but only some bars have data (non-zero height).
 *
 * This class provides:
 * - Override of bars locator to be more specific (first series group only)
 * - Common implementation of verifyNumberOfBarsAreAsExpected that filters for bars with data
 */
export abstract class BaseMobileBarChartMetric extends VerticalBarChartComponent {
  // Override bars locator to be more specific - get only the first series group to avoid matching other charts
  readonly bars: Locator;

  constructor(page: Page, thoughtSpotIframe: FrameLocator, metricTitle: string) {
    super(page, thoughtSpotIframe, metricTitle);
    // Override bars locator to get only bars from the first series group (this chart)
    // The rootLocator is already scoped to the metric container, but we add .first()
    // to ensure we only get the first series group in case there are multiple
    this.bars = this.rootLocator
      .locator('[class*="highcharts-series-group"]')
      .first()
      .locator('rect[class*="highcharts-point"]');
  }

  /**
   * Override to wait for chart to load and use the more specific bars locator
   * Note: This chart renders bars for all dates in the range (365 bars for a year),
   * but only some bars have data (non-zero height). We verify that:
   * 1. Chart is loaded
   * 2. At least one bar with data is visible
   * 3. We have at least the expected number of bars with data
   */
  async verifyNumberOfBarsAreAsExpected(params: { numberOfBars: number }): Promise<void> {
    await test.step(`Verify number of bars are as expected for metric ${this.metricTitle}`, async () => {
      const { numberOfBars } = params;

      // Wait for the metric container to be visible first
      await this.verifier.waitUntilElementIsVisible(this.rootLocator, {
        timeout: TIMEOUTS.VERY_LONG,
        stepInfo: `Wait for metric container to be visible for ${this.metricTitle}`,
      });

      // Wait for the chart series group to be visible (indicates chart is rendered)
      const chartSeriesGroup = this.rootLocator.locator('[class*="highcharts-series-group"]').first();
      await this.verifier.waitUntilElementIsVisible(chartSeriesGroup, {
        timeout: TIMEOUTS.VERY_LONG,
        stepInfo: `Wait for chart series group to be visible for ${this.metricTitle}`,
      });

      // Wait for at least one bar to exist in DOM (chart may render bars for all dates in range)
      await expect(this.bars.first(), `At least one bar should exist in DOM for ${this.metricTitle}`).toBeAttached({
        timeout: TIMEOUTS.VERY_LONG,
      });

      // Now wait for at least one bar with non-zero height to be visible
      // Many bars may have height="0" (not visible), so we need to find at least one with height > 0
      let hasVisibleBar = false;
      let visibleBarsCount = 0;
      const maxWaitTime = TIMEOUTS.MEDIUM;
      const startTime = Date.now();
      const pollInterval = 500;

      while (!hasVisibleBar && Date.now() - startTime < maxWaitTime) {
        const barCount = await this.bars.count();
        visibleBarsCount = 0;

        for (let i = 0; i < barCount; i++) {
          const bar = this.bars.nth(i);
          try {
            const height = await bar.getAttribute('height');
            if (height !== null && parseFloat(height) > 0) {
              visibleBarsCount++;
              // Found a bar with non-zero height, verify it's visible
              const isVisible = await bar.isVisible().catch(() => false);
              if (isVisible && !hasVisibleBar) {
                hasVisibleBar = true;
              }
            }
          } catch (error) {
            // Continue checking other bars if this one fails
            continue;
          }
        }

        // If we found at least one visible bar and have enough bars with data, we're done
        if (hasVisibleBar && visibleBarsCount >= numberOfBars) {
          break;
        }

        if (!hasVisibleBar || visibleBarsCount < numberOfBars) {
          await new Promise(resolve => setTimeout(resolve, pollInterval));
        }
      }

      if (!hasVisibleBar) {
        throw new Error(
          `No bars with non-zero height found for ${this.metricTitle} after ${maxWaitTime}ms. Chart may have no data or is still loading.`
        );
      }

      if (visibleBarsCount < numberOfBars) {
        throw new Error(
          `Expected at least ${numberOfBars} bars with data for ${this.metricTitle}, but found only ${visibleBarsCount} bars with non-zero height.`
        );
      }
    });
  }
}
