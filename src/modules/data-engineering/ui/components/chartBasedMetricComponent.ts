import { expect, FrameLocator, Locator, Page, test } from '@playwright/test';

import { BaseComponent } from '@/src/core/ui/components/baseComponent';

export class ChartBasedMetricComponent extends BaseComponent {
  // Core metric elements
  readonly metricTitleLocator: Locator;
  readonly metricDescription: Locator;

  // Chart iframe (for data extraction)
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
  }

  // ==================== DATA EXTRACTION METHODS ====================

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

  /**
   * Gets any numeric value from the chart iframe
   */
  async getMetricValue(): Promise<string> {
    return await test.step(`Get chart-based metric value`, async () => {
      // Navigate to the nested iframe and find any numeric text
      const metricValue = this.chartIframe.locator('iframe').contentFrame().getByText(/\d+/).first();

      await this.verifier.verifyTheElementIsVisible(metricValue, { timeout: 60_000 });
      const value = await metricValue.textContent();
      return value?.trim() || '';
    });
  }

  // ==================== VALIDATION METHODS ====================

  /**
   * Verifies all UI data points are visible
   */
  async verifyMetricUIDataPoints(): Promise<void> {
    await test.step(`Verify chart-based metric UI data points are visible`, async () => {
      await this.verifier.verifyTheElementIsVisible(this.metricTitleLocator, { timeout: 30_000 });
      await this.verifier.verifyTheElementIsVisible(this.metricDescription, { timeout: 30_000 });

      // Verify chart iframe is loaded
      const chartIframe = this.chartIframe.locator('iframe');
      await this.verifier.verifyTheElementIsVisible(chartIframe, { timeout: 60_000 });
    });
  }

  /**
   * Verifies that the metric is loaded and visible
   */
  async verifyMetricIsLoaded(): Promise<void> {
    await test.step(`Verify chart-based metric is loaded for ${this.metricTitle}`, async () => {
      // Verify the chart iframe is loaded
      const chartIframe = this.chartIframe.locator('iframe');
      await this.verifier.verifyTheElementIsVisible(chartIframe, { timeout: 60_000 });

      // Verify we can find numeric content inside the iframe
      const metricValue = this.chartIframe.locator('iframe').contentFrame().getByText(/\d+/).first();

      await this.verifier.verifyTheElementIsVisible(metricValue, { timeout: 60_000 });
    });
  }

  /**
   * Verifies the metric value matches expected value
   */
  async verifyMetricValue(expectedValue: string): Promise<void> {
    await test.step(`Verify chart-based metric value is "${expectedValue}"`, async () => {
      const actualValue = await this.getMetricValue();
      expect(actualValue, `Chart-based metric value should be "${expectedValue}"`).toBe(expectedValue);
    });
  }

  /**
   * Verifies the complete metric with expected values
   */
  async verifyCompleteMetric(params: {
    expectedValue: string;
    expectedTitle?: string;
    expectedDescription?: string;
  }): Promise<void> {
    const { expectedValue, expectedTitle, expectedDescription } = params;

    await test.step(`Verify complete chart-based metric`, async () => {
      // Verify UI elements are visible
      await this.verifyMetricUIDataPoints();

      // Verify metric value
      await this.verifyMetricValue(expectedValue);

      // Verify title if provided
      if (expectedTitle) {
        const actualTitle = await this.getMetricTitle();
        expect(actualTitle, `Metric title should be "${expectedTitle}"`).toBe(expectedTitle);
      }

      // Verify description if provided
      if (expectedDescription) {
        const actualDescription = await this.getMetricDescription();
        expect(actualDescription, `Metric description should be "${expectedDescription}"`).toBe(expectedDescription);
      }
    });
  }
}
