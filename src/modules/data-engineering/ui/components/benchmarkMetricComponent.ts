import { expect, FrameLocator, Locator, Page, test } from '@playwright/test';

import { BaseComponent } from '@/src/core/ui/components/baseComponent';
import {
  TREND_ARROWS,
  TREND_COLORS,
  TREND_DIRECTIONS,
  type TrendColor,
  type TrendDirection,
} from '@/src/modules/data-engineering/constants/benchmarkMetricConstants';

export class BenchmarkMetricComponent extends BaseComponent {
  // Core metric elements
  readonly metricTitleLocator: Locator;
  readonly metricDescription: Locator;
  readonly metricValue: Locator;

  // Trend/benchmark elements
  readonly trendArrow: Locator;
  readonly trendText: Locator;
  readonly trendColor: Locator;

  // Chart iframe (for data extraction only)
  readonly chartIframe: FrameLocator;

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

    // Core metric elements
    this.metricTitleLocator = this.rootLocator.getByRole('heading', { name: metricTitle, exact: true });
    this.metricDescription = this.rootLocator.locator('span[role="heading"]').nth(1);

    // Chart iframe - handle nested iframe structure
    this.chartIframe = this.rootLocator.locator('iframe[class*="chart-module__chartIframe"]').contentFrame();

    // Metric value is inside the 2nd iframe - target the first generic element
    this.metricValue = this.chartIframe.locator('iframe').contentFrame().locator('generic').first();

    // Trend/benchmark elements - these are also in the 2nd iframe
    this.trendArrow = this.chartIframe.locator('iframe').contentFrame().getByText('↑').first();
    this.trendText = this.chartIframe
      .locator('iframe')
      .contentFrame()
      .getByText(/% more than benchmark/)
      .first();
    this.trendColor = this.chartIframe.locator('iframe').contentFrame().getByText('↑').first(); // Same as arrow for color detection
  }

  // ==================== DATA EXTRACTION METHODS ====================

  /**
   * Gets the main metric value (e.g., "20 (57.1%)")
   */
  async getMetricValue(): Promise<string> {
    return await test.step(`Get benchmark metric value`, async () => {
      await this.verifier.verifyTheElementIsVisible(this.metricValue, { timeout: 30_000 });
      const value = await this.metricValue.textContent();
      return value?.trim() || '';
    });
  }

  /**
   * Gets the trend direction (up, down, neutral)
   */
  async getTrendDirection(): Promise<TrendDirection> {
    return await test.step(`Get trend direction`, async () => {
      const arrowText = await this.trendArrow.textContent();
      if (arrowText?.includes(TREND_ARROWS.UP)) return TREND_DIRECTIONS.UP;
      if (arrowText?.includes(TREND_ARROWS.DOWN)) return TREND_DIRECTIONS.DOWN;
      return TREND_DIRECTIONS.NEUTRAL;
    });
  }

  /**
   * Gets the trend percentage (e.g., 54.8)
   */
  async getTrendPercentage(): Promise<number> {
    return await test.step(`Get trend percentage`, async () => {
      const trendText = await this.getTrendText();
      const percentageMatch = trendText.match(/(\d+\.?\d*)%/);
      return percentageMatch ? parseFloat(percentageMatch[1]) : 0;
    });
  }

  /**
   * Gets the benchmark value (e.g., 2.4)
   */
  async getBenchmarkValue(): Promise<number> {
    return await test.step(`Get benchmark value`, async () => {
      const trendText = await this.getTrendText();
      const benchmarkMatch = trendText.match(/\((\d+\.?\d*)%\)/);
      return benchmarkMatch ? parseFloat(benchmarkMatch[1]) : 0;
    });
  }

  /**
   * Gets the complete trend text (e.g., "54.8% more than benchmark (2.4%)")
   */
  async getTrendText(): Promise<string> {
    return await test.step(`Get trend text`, async () => {
      await this.verifier.verifyTheElementIsVisible(this.trendText, { timeout: 30_000 });
      const text = await this.trendText.textContent();
      return text?.trim() || '';
    });
  }

  /**
   * Gets the trend color (green, red, gray)
   */
  async getTrendColor(): Promise<TrendColor> {
    return await test.step(`Get trend color`, async () => {
      const colorClass = await this.trendColor.getAttribute('class');
      if (colorClass?.includes('green') || colorClass?.includes('positive')) return TREND_COLORS.POSITIVE;
      if (colorClass?.includes('red') || colorClass?.includes('negative')) return TREND_COLORS.NEGATIVE;
      return TREND_COLORS.NEUTRAL;
    });
  }

  // ==================== COMBINED DATA METHODS ====================

  /**
   * Gets all trend-related data in one call
   */
  async getTrendData(): Promise<{
    direction: TrendDirection;
    percentage: number;
    benchmarkValue: number;
    text: string;
    color: TrendColor;
  }> {
    return await test.step(`Get complete trend data`, async () => {
      const [direction, percentage, benchmarkValue, text, color] = await Promise.all([
        this.getTrendDirection(),
        this.getTrendPercentage(),
        this.getBenchmarkValue(),
        this.getTrendText(),
        this.getTrendColor(),
      ]);

      return {
        direction,
        percentage,
        benchmarkValue,
        text,
        color,
      };
    });
  }

  /**
   * Gets all metric data in one call
   */
  async getMetricData(): Promise<{
    title: string;
    description: string;
    value: string;
    trend: {
      direction: TrendDirection;
      percentage: number;
      benchmarkValue: number;
      text: string;
      color: TrendColor;
    };
  }> {
    return await test.step(`Get complete metric data`, async () => {
      const [title, description, value, trend] = await Promise.all([
        this.getMetricTitle(),
        this.getMetricDescription(),
        this.getMetricValue(),
        this.getTrendData(),
      ]);

      return {
        title,
        description,
        value,
        trend,
      };
    });
  }

  // ==================== HELPER METHODS ====================

  /**
   * Gets the metric title
   */
  async getMetricTitle(): Promise<string> {
    return await test.step(`Get metric title`, async () => {
      await this.verifier.verifyTheElementIsVisible(this.metricTitleLocator, { timeout: 30_000 });
      const title = await this.metricTitleLocator.textContent();
      return title?.trim() || '';
    });
  }

  /**
   * Gets the metric description
   */
  async getMetricDescription(): Promise<string> {
    return await test.step(`Get metric description`, async () => {
      await this.verifier.verifyTheElementIsVisible(this.metricDescription, { timeout: 30_000 });
      const description = await this.metricDescription.textContent();
      return description?.trim() || '';
    });
  }

  // ==================== VALIDATION METHODS ====================

  /**
   * Verifies the metric has a positive trend
   */
  async verifyPositiveTrend(): Promise<void> {
    await test.step(`Verify positive trend`, async () => {
      const direction = await this.getTrendDirection();
      const color = await this.getTrendColor();

      expect(direction, `Trend direction should be up`).toBe(TREND_DIRECTIONS.UP);
      expect(color, `Trend color should be positive`).toBe(TREND_COLORS.POSITIVE);
    });
  }

  /**
   * Verifies the metric has a negative trend
   */
  async verifyNegativeTrend(): Promise<void> {
    await test.step(`Verify negative trend`, async () => {
      const direction = await this.getTrendDirection();
      const color = await this.getTrendColor();

      expect(direction, `Trend direction should be down`).toBe(TREND_DIRECTIONS.DOWN);
      expect(color, `Trend color should be negative`).toBe(TREND_COLORS.NEGATIVE);
    });
  }

  /**
   * Verifies the trend percentage matches expected value
   */
  async verifyTrendPercentage(expectedPercentage: number): Promise<void> {
    await test.step(`Verify trend percentage is ${expectedPercentage}%`, async () => {
      const actualPercentage = await this.getTrendPercentage();
      expect(actualPercentage, `Trend percentage should be ${expectedPercentage}%`).toBe(expectedPercentage);
    });
  }

  /**
   * Verifies the benchmark value matches expected value
   */
  async verifyBenchmarkComparison(expectedBenchmark: number): Promise<void> {
    await test.step(`Verify benchmark value is ${expectedBenchmark}%`, async () => {
      const actualBenchmark = await this.getBenchmarkValue();
      expect(actualBenchmark, `Benchmark value should be ${expectedBenchmark}%`).toBe(expectedBenchmark);
    });
  }

  /**
   * Verifies the metric value matches expected value
   */
  async verifyMetricValue(expectedValue: string): Promise<void> {
    await test.step(`Verify metric value is "${expectedValue}"`, async () => {
      const actualValue = await this.getMetricValue();
      expect(actualValue, `Metric value should be "${expectedValue}"`).toBe(expectedValue);
    });
  }

  /**
   * Verifies all UI data points are visible
   */
  async verifyMetricUIDataPoints(): Promise<void> {
    await test.step(`Verify metric UI data points are visible`, async () => {
      await this.verifier.verifyTheElementIsVisible(this.metricTitleLocator, { timeout: 30_000 });
      await this.verifier.verifyTheElementIsVisible(this.metricDescription, { timeout: 30_000 });
      await this.verifier.verifyTheElementIsVisible(this.metricValue, { timeout: 30_000 });
      await this.verifier.verifyTheElementIsVisible(this.trendArrow, { timeout: 30_000 });
      await this.verifier.verifyTheElementIsVisible(this.trendText, { timeout: 30_000 });
    });
  }

  /**
   * Verifies the metric is loaded
   */
  async verifyMetricIsLoaded(): Promise<void> {
    await test.step(`Verify metric - ${this.metricTitle} is loaded`, async () => {
      await this.verifier.verifyTheElementIsVisible(this.metricValue, { timeout: 60_000 });
    });
  }

  /**
   * Verifies the complete metric with expected values
   */
  async verifyCompleteMetric(params: {
    expectedValue: string;
    expectedTrend: 'positive' | 'negative';
    expectedPercentage?: number;
    expectedBenchmark?: number;
  }): Promise<void> {
    const { expectedValue, expectedTrend, expectedPercentage, expectedBenchmark } = params;

    await test.step(`Verify complete metric`, async () => {
      // Verify UI elements are visible
      await this.verifyMetricUIDataPoints();

      // Verify metric value
      await this.verifyMetricValue(expectedValue);

      // Verify trend direction and color
      if (expectedTrend === 'positive') {
        await this.verifyPositiveTrend();
      } else {
        await this.verifyNegativeTrend();
      }

      // Verify specific percentages if provided
      if (expectedPercentage !== undefined) {
        await this.verifyTrendPercentage(expectedPercentage);
      }

      if (expectedBenchmark !== undefined) {
        await this.verifyBenchmarkComparison(expectedBenchmark);
      }
    });
  }
}
