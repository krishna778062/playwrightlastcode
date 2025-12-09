import { expect, FrameLocator, Locator, Page, test } from '@playwright/test';

import { BaseComponent } from '@/src/core/ui/components/baseComponent';
import {
  TREND_ARROWS,
  TREND_DIRECTIONS,
  type TrendDirection,
} from '@/src/modules/data-engineering/constants/benchmarkMetricConstants';

/**
 * This is a custom component made by us
 * which shows multiple data points
 *  - metric title
 *  - metric description
    - custom chart iframe
      -metric value
      - metrics comparison section
        - trend direction
        - bench mark comparison text
 *
 */
export class BenchmarkMetricComponent extends BaseComponent {
  // Core metric elements
  readonly metricTitleLocator: Locator;
  readonly metricDescription: Locator;

  // Chart iframe (for data extraction only)
  readonly customChartComponent: FrameLocator;
  readonly metricValue: Locator;
  readonly metricsComparisonSection: Locator; //it has positive, negative trend indicator

  constructor(
    page: Page,
    readonly thoughtSpotIframe: FrameLocator,
    readonly metricTitle: string
  ) {
    // Find the container internally using the metricTitle
    const container = thoughtSpotIframe.locator('[class*="answer-content-module__answerVizContainer"]').filter({
      has: thoughtSpotIframe.getByRole('heading', { name: metricTitle, exact: true }),
    });

    super(page, container);

    this.customChartComponent = this.rootLocator
      .getByTestId('custom-chart-component')
      .locator('iframe')
      .contentFrame()
      .locator('#preview-iframe-container')
      .locator('iframe')
      .contentFrame();

    // Core metric elements
    this.metricTitleLocator = this.rootLocator.getByRole('heading', { name: metricTitle, exact: true });
    this.metricDescription = this.rootLocator.locator('span[role="heading"]').nth(1);

    // Metric value is inside the 2nd iframe - target the first generic element
    this.metricValue = this.customChartComponent.locator('.kpi-value').first();

    // Trend/benchmark elements - these are also in the 2nd iframe
    this.metricsComparisonSection = this.customChartComponent.locator('.kpi-comparisons');
  }

  // ==================== DATA EXTRACTION METHODS ====================

  /**
   * Gets the main metric value (e.g., "20 (57.1%)")
   */
  async getMetricValue(): Promise<string> {
    return await test.step(`Get benchmark metric value - for metric ${this.metricTitle}`, async () => {
      await this.verifier.verifyTheElementIsVisible(this.metricValue, { timeout: 30_000 });
      const value = await this.metricValue.textContent();
      return value?.trim() || '';
    });
  }

  /**
   * Gets the trend direction (up, down)
   */
  async getTrendDirection(): Promise<TrendDirection> {
    return await test.step(`Get trend direction - for metric ${this.metricTitle}`, async () => {
      const arrowText = await this.metricsComparisonSection.textContent();
      if (arrowText?.includes(TREND_ARROWS.UP)) return TREND_DIRECTIONS.UP;
      if (arrowText?.includes(TREND_ARROWS.DOWN)) return TREND_DIRECTIONS.DOWN;
      else throw new Error(`Trend direction not found`);
    });
  }

  /**
   * Gets the bench mark comparison text
   */
  async getBenchMarkComparisonText(): Promise<string> {
    return await test.step(`Get bench mark comparison text - for metric ${this.metricTitle}`, async () => {
      const text = await this.metricsComparisonSection.textContent();
      return text?.trim() || '';
    });
  }

  /**
   * Gets the metric value in percentage
   * it splits the text like "20 (57.1%)" and returns the percentage which is "57.1"
   */
  async getMetricValueInPercentage(): Promise<string> {
    return await test.step(`Get metric value in percentage - for metric ${this.metricTitle}`, async () => {
      await expect(this.metricValue).not.toHaveText('');
      const metricValueText = await this.metricValue.textContent();
      //it will be like "20 (57.1%)" or "20 (0)" or "1 (100.0%)"
      const percentage = metricValueText?.split('(')[1]?.split(')')[0]?.trim();
      // Remove the % symbol if present and return just the number
      const cleanPercentage = percentage?.replace('%', '') || '';
      console.log(`percentage value fetched from the metric value: ${metricValueText} is`, cleanPercentage);
      return cleanPercentage;
    });
  }

  /**
   * Gets the absolute metric value
   * it splits the text like "20 (57.1%)" and returns the absolute value which is "20"
   */
  async getAbsoluteMetricValue(): Promise<string> {
    return await test.step(`Get absolute metric value - for metric ${this.metricTitle}`, async () => {
      await expect(this.metricValue).not.toHaveText('');
      const metricValueText = await this.metricValue.textContent();
      //From string like "20 (57.1%)" it will return "20"
      const absoluteValue = metricValueText?.split('(')[0];
      console.log(`absolute value fetched from the metric value: ${metricValueText} is`, absoluteValue);
      return absoluteValue?.trim() || '';
    });
  }

  // ==================== COMBINED DATA METHODS ====================

  // ==================== VALIDATION METHODS ====================

  async verifyMetricsSowsNegativeTrend(): Promise<void> {
    await test.step(`Verify metrics shows downwards trend - for metric ${this.metricTitle}`, async () => {
      await expect(this.metricsComparisonSection, `expecting negative trend indicator to be visible`).toHaveClass(
        'negative',
        { timeout: 40_000 }
      );
    });
  }

  async verifyMetricsShowsPositiveTrend(): Promise<void> {
    await test.step(`Verify metrics shows positive trend - for metric ${this.metricTitle}`, async () => {
      await expect(this.metricsComparisonSection, `expecting positive trend indicator to be visible`).toHaveClass(
        'positive',
        { timeout: 40_000 }
      );
    });
  }

  /**
   * Verifies the bench mark comparison text is visible
   * @param benchMarkComparisonText - The bench mark comparison text to verify
   */
  async verifyBenchMarkComparisonTextIs(benchMarkComparisonText: string): Promise<void> {
    await test.step(`Verify bench mark comparison text is visible - for metric ${this.metricTitle}`, async () => {
      await expect(this.metricsComparisonSection, `expecting bench mark comparison text to be visible`).toContainText(
        benchMarkComparisonText,
        { timeout: 40_000 }
      );
    });
  }

  /**
   * Verifies the metrics are visible
   */
  async verifyMetricIsLoaded(): Promise<void> {
    await test.step(`Verify metrics UI data points are visible - for metric ${this.metricTitle}`, async () => {
      await expect(this.metricTitleLocator, `expecting metric title to be visible`).toBeVisible({ timeout: 120_000 });
      await expect(this.metricDescription, `expecting metric description to be visible`).toBeVisible({
        timeout: 120_000,
      });
      await expect(this.metricValue, `expecting metric value to be visible`).toBeVisible({
        timeout: 120_000,
      });
      await expect(this.metricsComparisonSection, `expecting metrics comparison section to be visible`).toBeVisible({
        timeout: 120_000,
      });
    });
  }

  /**
   * Verifies the metrics description is visible
   * @param metricDescription - The metrics description to verify
   */

  async verifyMetricsDescriptionIs(metricDescription: string): Promise<void> {
    await test.step(`Verify metrics description is visible - for metric ${this.metricTitle}`, async () => {
      await expect(this.metricDescription, `expecting metric description to be visible`).toContainText(
        metricDescription,
        { timeout: 40_000 }
      );
    });
  }

  /**
   * Verifies the absolute metric value is as expected
   * @param expectedValue - The expected absolute value
   */
  async verifyAbsoluteMetricValueIs(expectedValue: string): Promise<void> {
    await test.step(`Verify absolute metric value is ${expectedValue} - for metric ${this.metricTitle}`, async () => {
      await expect(async () => {
        const actualValue = await this.getAbsoluteMetricValue();
        expect(actualValue, `Absolute metric value should be ${expectedValue}`).toBe(expectedValue);
      }, `Polling for the metric value to be loaded and matches the expected value "${expectedValue}" for metric ${this.metricTitle}`).toPass(
        { timeout: 20_000 }
      );
    });
  }

  /**
   * Verifies the percentage metric value is as expected
   * @param expectedValue - The expected percentage value
   */
  async verifyPercentageMetricValueIsAsExpected(expectedValue: number): Promise<void> {
    await test.step(`Verify percentage metric value is as expected - for metric ${this.metricTitle} is ${expectedValue}`, async () => {
      await expect(async () => {
        const actualValue = await this.getMetricValueInPercentage();
        const actualNumericValue = parseFloat(actualValue);
        if (expectedValue === 0) {
          expect(actualNumericValue, `Percentage metric value should be 0`).toBe(0);
        } else {
          expect(actualNumericValue, `Percentage metric value should be ${expectedValue}`).toBeCloseTo(
            expectedValue,
            0.1
          );
        }
      }, `Polling for the metric value to be loaded and matches the expected value "${expectedValue}" for metric ${this.metricTitle}`).toPass(
        { timeout: 20_000 }
      );
    });
  }
}
