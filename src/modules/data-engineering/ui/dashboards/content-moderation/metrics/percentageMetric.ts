import { expect, FrameLocator, Locator, Page, test } from '@playwright/test';

import { TIMEOUTS } from '@/src/core/constants/timeouts';
import { BaseComponent } from '@/src/core/ui/components/baseComponent';
import { formatKpiLabel } from '@/src/modules/data-engineering/constants/contentModerationMetrics';

/**
 * Configuration interface for percentage-based metrics
 */
export interface PercentageMetricConfig {
  title: string;
  subtitle: string;
  kpiLabelTemplate: string;
}

/**
 * Base class for Content Moderation metrics that display a percentage KPI label.
 * Uses nested iframe structure: ThoughtSpot iframe → chart iframe → kpi-value
 * Dynamically calculates and validates the KPI label percentage.
 */
export class PercentageMetric extends BaseComponent {
  readonly metricTitle: string;
  readonly answerTitle: Locator;
  readonly answerSubTitle: Locator;
  readonly chartIframe: FrameLocator;
  readonly metricValue: Locator;
  readonly kpiLabel: Locator;

  constructor(
    page: Page,
    thoughtSpotIframe: FrameLocator,
    protected readonly config: PercentageMetricConfig
  ) {
    // Find the container for this metric
    const container = thoughtSpotIframe
      .locator('[class*="answer-content-module__answerVizContainer"]')
      .filter({
        has: thoughtSpotIframe.getByRole('heading', { name: config.title, exact: true }),
      })
      .first();

    super(page, container);

    this.metricTitle = config.title;

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
   * Verifies all UI data points for the metric (excluding kpiLabel which needs totalSources)
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
      expect(subtitleText?.trim(), `Subtitle should contain expected text`).toContain(this.config.subtitle);

      // Verify kpiLabel is visible (text content validated separately with dynamic percentage)
      await this.verifier.verifyTheElementIsVisible(this.kpiLabel, {
        timeout: TIMEOUTS.VERY_VERY_LONG,
        assertionMessage: `${this.metricTitle} kpiLabel should be visible`,
      });
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

  /**
   * Verifies the KPI label with a dynamically calculated percentage.
   * @param totalSourcesCount - The total count of sources.
   * @param metricCount - The count of this metric's items.
   */
  async verifyKpiLabel(totalSourcesCount: number, metricCount: number): Promise<void> {
    await test.step(`Verify ${this.metricTitle} KPI label percentage`, async () => {
      let percentage = 0;
      if (totalSourcesCount > 0) {
        percentage = (metricCount / totalSourcesCount) * 100;
      }
      // Round to 1 decimal place, but show whole number if decimal is 0
      const roundedPercentage = Math.round(percentage * 10) / 10;
      const formattedPercentage =
        roundedPercentage % 1 === 0
          ? roundedPercentage.toFixed(0) // Whole number: "33"
          : roundedPercentage.toFixed(1); // With decimal: "33.5"

      const expectedKpiLabel = formatKpiLabel(this.config.kpiLabelTemplate, `${formattedPercentage}%`);

      const actualKpiLabelText = await this.kpiLabel.textContent();

      expect(actualKpiLabelText?.trim(), `KPI Label should match expected percentage`).toBe(expectedKpiLabel);
    });
  }
}
