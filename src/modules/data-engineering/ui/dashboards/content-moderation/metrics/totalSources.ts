import { expect, FrameLocator, Locator, Page, test } from '@playwright/test';

import { TIMEOUTS } from '@/src/core/constants/timeouts';
import { BaseComponent } from '@/src/core/ui/components/baseComponent';
import { CONTENT_MODERATION_METRICS } from '@/src/modules/data-engineering/constants/contentModerationMetrics';

/**
 * Total Sources metric component for Content Moderation Analytics
 * Uses nested iframe structure: ThoughtSpot iframe → chart iframe → kpi-value
 */
export class TotalSources extends BaseComponent {
  readonly metricTitle: string;
  readonly answerTitle: Locator;
  readonly answerSubTitle: Locator;
  readonly chartIframe: FrameLocator;
  readonly metricValue: Locator;
  readonly kpiLabel: Locator;

  constructor(
    page: Page,
    readonly thoughtSpotIframe: FrameLocator
  ) {
    // Find the container for Total sources metric
    const container = thoughtSpotIframe
      .locator('[class*="answer-content-module__answerVizContainer"]')
      .filter({
        has: thoughtSpotIframe.getByRole('heading', {
          name: CONTENT_MODERATION_METRICS.TOTAL_SOURCES.title,
          exact: true,
        }),
      })
      .first();

    super(page, container);

    this.metricTitle = CONTENT_MODERATION_METRICS.TOTAL_SOURCES.title;

    // Title and subtitle locators
    this.answerTitle = this.rootLocator.locator('span[role="heading"]').first();
    this.answerSubTitle = this.rootLocator.locator('span[role="heading"]').nth(1);

    // The metric value and kpiLabel are inside a doubly-nested iframe:
    // chart-module__chartIframe > iframe > #preview-iframe-container > iframe > #kpi-value / #kpi-change
    const firstNestedIframe = this.rootLocator.locator('[class*="chart-module__chartIframe"] iframe').contentFrame();
    const secondNestedIframe = firstNestedIframe.locator('#preview-iframe-container iframe').contentFrame();
    this.chartIframe = secondNestedIframe;
    this.metricValue = this.chartIframe.locator('#kpi-value');
    this.kpiLabel = this.chartIframe.locator('#kpi-change');
  }

  /**
   * Verifies the metric is loaded and visible
   * Note: No test.step wrapper as this is called from beforeAll hook
   */
  async verifyMetricIsLoaded(): Promise<void> {
    await this.verifier.verifyTheElementIsVisible(this.answerTitle, {
      timeout: TIMEOUTS.VERY_VERY_LONG,
      assertionMessage: `${this.metricTitle} title should be visible`,
    });
  }

  /**
   * Verifies all UI data points for the Total Sources metric
   */
  async verifyMetricUIDataPoints(): Promise<void> {
    await test.step(`Verify ${this.metricTitle} UI data points`, async () => {
      // Verify title is visible
      await this.verifier.verifyTheElementIsVisible(this.answerTitle, {
        timeout: TIMEOUTS.VERY_VERY_LONG,
        assertionMessage: `${this.metricTitle} title should be visible`,
      });

      // Verify subtitle is visible and contains expected text
      await this.verifier.verifyTheElementIsVisible(this.answerSubTitle, {
        timeout: TIMEOUTS.VERY_VERY_LONG,
        assertionMessage: `${this.metricTitle} subtitle should be visible`,
      });

      const subtitleText = await this.answerSubTitle.textContent();
      expect(subtitleText?.trim(), `Subtitle should contain expected text`).toContain('All feed posts and comments');

      // Verify kpiLabel is visible and contains expected text
      await this.verifier.verifyTheElementIsVisible(this.kpiLabel, {
        timeout: TIMEOUTS.VERY_VERY_LONG,
        assertionMessage: `${this.metricTitle} kpiLabel should be visible`,
      });

      const kpiLabelText = await this.kpiLabel.textContent();
      expect(kpiLabelText?.trim(), `KPI Label should contain expected text`).toContain(
        CONTENT_MODERATION_METRICS.TOTAL_SOURCES.kpiLabel
      );
    });
  }

  /**
   * Gets the metric value from the nested iframe
   */
  async getMetricValue(): Promise<string> {
    await this.verifier.verifyTheElementIsVisible(this.metricValue, { timeout: TIMEOUTS.VERY_VERY_LONG });
    const value = await this.metricValue.textContent();
    return value?.trim() || '';
  }

  /**
   * Verifies the metric value matches the expected value
   * @param expectedValue - The expected metric value
   */
  async verifyMetricValue(expectedValue: number): Promise<void> {
    await test.step(`Verify ${this.metricTitle} value is ${expectedValue}`, async () => {
      const actualValue = await this.getMetricValue();
      const normalizedActualValue = actualValue.replace(/,/g, '').split(' ')[0];

      expect(
        normalizedActualValue,
        `${this.metricTitle} value should be ${expectedValue} (UI shows: ${actualValue})`
      ).toBe(expectedValue.toString());
    });
  }
}
