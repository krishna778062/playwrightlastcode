import { expect, FrameLocator, Locator, Page, test } from '@playwright/test';

import { BaseComponent } from '@/src/core';
import { TIMEOUTS } from '@/src/core/constants/timeouts';

export class PieChartComponent extends BaseComponent {
  readonly toolTipContainer: Locator;
  readonly chartSegmentLocator: Locator;
  readonly getToolTipBlockWithKeyTextAs: (keyText: string) => Locator;
  readonly getChartLabelLocatorWithLabelAs: (label: string) => Locator;
  constructor(
    readonly page: Page,
    readonly thoughtSpotIframe: FrameLocator,
    readonly metricTitle: string
  ) {
    // Find the container internally
    const container = thoughtSpotIframe.locator('[class*="answer-content-module__answerVizContainer"]').filter({
      has: thoughtSpotIframe.getByRole('heading', { name: metricTitle, exact: true }),
    });
    super(page, container);
    // Tooltips in Highcharts are rendered at the iframe level, not scoped to individual charts
    // When multiple charts exist, there can be multiple tooltip containers in the DOM
    // We use .first() to get the first visible one, which should be the one for the chart we're interacting with
    this.toolTipContainer = this.thoughtSpotIframe.locator('[class*="highcharts-tooltip-container"]').first();
    this.chartSegmentLocator = this.rootLocator.locator("g[class*='highcharts-series-group']").locator('path');
    this.getToolTipBlockWithKeyTextAs = (label: string) =>
      this.toolTipContainer.locator("[class*='chart-tooltip-block']").filter({ hasText: label });
    this.getChartLabelLocatorWithLabelAs = (label: string) =>
      this.rootLocator.locator(`g[class*='highcharts-data-label-color']`).filter({ hasText: label });
  }

  /**
   * Waits for the pie chart to be loaded and visible
   */
  async waitForChartToLoad(): Promise<void> {
    await test.step(`Wait for pie chart to load for metric ${this.metricTitle}`, async () => {
      // Wait for the container to be visible
      await this.verifier.waitUntilElementIsVisible(this.rootLocator, {
        timeout: TIMEOUTS.VERY_LONG,
        stepInfo: `Wait for metric container to be visible for ${this.metricTitle}`,
      });

      // Wait for the chart series group to be present (indicates chart is rendered)
      const chartSeriesGroup = this.rootLocator.locator("g[class*='highcharts-series-group']");
      await this.verifier.waitUntilElementIsVisible(chartSeriesGroup, {
        timeout: TIMEOUTS.VERY_LONG,
        stepInfo: `Wait for chart series group to be visible for ${this.metricTitle}`,
      });
    });
  }

  /**
   * Verifies the number of segments visible on the pie chart
   * @param numberOfSegments - The number of segments to verify
   */
  async verifyNumberOfSegmentsVisibleonPieChartIs(numberOfSegments: number) {
    // Wait for chart to load first
    await this.waitForChartToLoad();

    await expect(
      this.chartSegmentLocator,
      `Number of segments visible on pie chart should be ${numberOfSegments}`
    ).toHaveCount(numberOfSegments, { timeout: TIMEOUTS.MEDIUM });
  }

  /**
   * Verifies the tool tip container is visible
   * Note: Uses .first() to handle cases where multiple tooltip containers exist in the DOM
   * (e.g., when multiple charts are present on the page)
   * Uses expect().toBeVisible() instead of waitFor() to avoid strict mode violations
   */
  async waitForToolTipContainerToBeVisible(): Promise<void> {
    // Get the first visible tooltip container to avoid strict mode violations
    // when multiple charts are present on the page
    // Use expect().toBeVisible() instead of waitFor() because waitFor() checks strict mode
    // before .first() is applied, while expect() handles .first() correctly
    const visibleTooltip = this.thoughtSpotIframe.locator('[class*="highcharts-tooltip-container"]').first();

    await expect(
      visibleTooltip,
      `Wait for tool tip container to be visible for metric ${this.metricTitle}`
    ).toBeVisible({ timeout: TIMEOUTS.MEDIUM });
  }

  /**
   * Validates the values shown in the tool tip are as expected
   * @param params - The parameters for the validation
   * @param params.labelsAndValues - The key texts and expected values to validate
   * @example
   * {
   *   labelsAndValues: [
   *     { keyText: 'Total Count', expectedValue: '100' },
   *     { keyText: 'Total Count', expectedValue: '200' },
   *   ],
   * }
   */
  async validateValuesShownInToolTipAreAsExpected(params: {
    labelsAndValues: { keyText: string; expectedValue: string }[];
  }): Promise<void> {
    await test.step(`Validate values shown in tool tip are as expected for metric ${this.metricTitle} and labels and values are as expected: ${params.labelsAndValues}`, async () => {
      const { labelsAndValues } = params;
      for (const { keyText, expectedValue } of labelsAndValues) {
        const toolTipBlock = this.getToolTipBlockWithKeyTextAs(keyText);
        const toolTipValue = toolTipBlock.locator("[class*='chart-tooltip-value']");
        await expect(
          toolTipValue,
          `Value shown in tool tip for key text ${keyText} should be ${expectedValue}`
        ).toHaveText(expectedValue.toString());
      }
    });
  }

  /**
   * Hover over the segment label with the given label
   * @param label - The label of the segment to hover over
   */
  async hoverOverSegmentLabelWithLabelAs(label: string): Promise<void> {
    const chartLabel = this.getChartLabelLocatorWithLabelAs(label);
    await chartLabel.hover();
  }

  /**
   * Normalizes text by removing invisible characters and normalizing whitespace.
   * Handles optional whitespace around punctuation (parentheses, dashes, etc.)
   * @param text - The text to normalize
   * @returns Normalized text
   */
  private normalizeText(text: string): string {
    return text
      .replace(/[\u200B-\u200D\uFEFF]/g, '') // Remove zero-width spaces and other invisible characters
      .replace(/\s*\(\s*/g, '(') // Normalize spaces before opening parenthesis: "1 (" or "1(" -> "1("
      .replace(/\s*\)\s*/g, ')') // Normalize spaces around closing parenthesis: " )" or ")" -> ")"
      .replace(/\s*-\s*/g, ' - ') // Normalize spaces around dashes: "-" or " -" or "- " -> " - "
      .replace(/\s+/g, ' ') // Collapse multiple whitespace characters into a single space
      .trim();
  }

  /**
   * Verifies the data points of the segment label are as expected
   * @param params - The parameters for the validation
   * @param params.label - The label of the segment to verify
   * @param params.expectedText - The expected full text content
   * @example
   * {
   *   label: 'Contributor',
   *   expectedText: 'Contributor - 4 (40%)',
   * }
   */
  async verifySegmentLabelDataPointsAreAsExpected(params: { label: string; expectedText: string }): Promise<void> {
    const { label, expectedText } = params;
    const chartLabel = this.getChartLabelLocatorWithLabelAs(label);
    const actualText = await chartLabel.textContent();
    const normalizedActual = this.normalizeText(actualText || '');
    const normalizedExpected = this.normalizeText(expectedText);

    expect(
      normalizedActual,
      `Segment label ${label} should display text: ${expectedText}, but got: ${actualText}`
    ).toBe(normalizedExpected);
  }
}
