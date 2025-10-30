import { expect, FrameLocator, Locator, Page } from '@playwright/test';

import { BaseComponent } from '@/src/core';

export class PieChartComponent extends BaseComponent {
  readonly toolTipContainer: Locator;
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
    this.toolTipContainer = this.rootLocator.locator('highcharts-tooltip-container');
    this.getToolTipBlockWithKeyTextAs = (label: string) =>
      this.toolTipContainer.locator("[class*='chart-tooltip-block']").filter({ hasText: label });
    this.getChartLabelLocatorWithLabelAs = (label: string) =>
      this.rootLocator.locator(`g[class*='highcharts-data-label-color']`).filter({ hasText: label });
  }

  /**
   * Verifies the number of segments visible on the pie chart
   * @param numberOfSegments - The number of segments to verify
   */
  async verifyNumberOfSegmentsVisibleonPieChartIs(numberOfSegments: number) {
    const chartSegmentLocator = this.rootLocator.locator("g[class*='highcharts-series-group']").locator('path');
    await expect(
      chartSegmentLocator,
      `Number of segments visible on pie chart should be ${numberOfSegments}`
    ).toHaveCount(numberOfSegments);
  }

  /**
   * Verifies the tool tip container is visible
   */
  async verifyToolTipContainerIsVisible(): Promise<void> {
    await this.verifier.verifyTheElementIsVisible(this.rootLocator.locator('[data-highcharts-chart=3]').locator('g'), {
      timeout: 30_000,
      assertionMessage: 'ToolTip container should be visible',
    });
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
    const { labelsAndValues } = params;
    for (const { keyText, expectedValue } of labelsAndValues) {
      const toolTipBlock = this.getToolTipBlockWithKeyTextAs(keyText);
      const toolTipValue = toolTipBlock.locator("[class*='chart-tooltip-value']");
      await expect(
        toolTipValue,
        `Value shown in tool tip for key text ${keyText} should be ${expectedValue}`
      ).toHaveText(expectedValue.toString());
    }
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
    await expect(chartLabel, `Segment label ${label} should display text: ${expectedText}`).toHaveText(expectedText);
  }
}
