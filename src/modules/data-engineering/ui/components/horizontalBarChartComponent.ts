import { expect, FrameLocator, Locator, Page, test } from '@playwright/test';

import { BaseComponent } from '@/src/core/ui/components/baseComponent';

export class HorizontalBarChartComponent extends BaseComponent {
  readonly bars: Locator;
  readonly chartLegends: Locator;

  //tooltip container and get tooltip block with key text as
  readonly toolTipContainer: Locator;
  readonly getToolTipBlockWithKeyTextAs: (keyText: string) => Locator;
  constructor(
    page: Page,
    readonly thoughtSpotIframe: FrameLocator,
    readonly metricTitle: string
  ) {
    const container = thoughtSpotIframe.locator('[class*="answer-content-module__answerVizContainer"]').filter({
      has: thoughtSpotIframe.getByRole('heading', { name: metricTitle, exact: true }),
    });
    super(page, container);
    //chart elements
    this.bars = this.rootLocator
      .locator('[class*="highcharts-series-group"]')
      .locator('rect[class*="highcharts-point"]');

    this.chartLegends = this.rootLocator.locator('[class*="legend-item-v2"]').locator('.label-v2');

    // Tool tip container
    this.toolTipContainer = this.thoughtSpotIframe
      .locator('[class*="highcharts-tooltip-container"]')
      .filter({ has: this.thoughtSpotIframe.locator("g[opacity='1']") });
    this.getToolTipBlockWithKeyTextAs = (label: string) =>
      this.toolTipContainer.locator("[class*='chart-tooltip-block']").filter({ hasText: label });
  }

  /**
   * Verifies the chart legends are as expected
   * @param params - The parameters for the validation
   * @param params.chartLegends - The expected chart legends
   * @example
   * {
   *   chartLegends: ['No logins', '1-3 times', '4+ times'],
   * }
   */
  async verifyChartLegendsAreAsExpected(params: {
    numberOfChartLegends: number;
    chartLegends: string[];
  }): Promise<void> {
    await test.step(`Verify chart legends are as expected for ${this.metricTitle}`, async () => {
      const { numberOfChartLegends, chartLegends } = params;
      //verify the number of chart legends are as expected
      await expect(this.chartLegends, `Number of chart legends should be ${numberOfChartLegends}`).toHaveCount(
        numberOfChartLegends
      );
      for (const legend of chartLegends) {
        await expect(this.chartLegends.filter({ hasText: legend }), `Chart legend should be ${legend}`).toContainText(
          legend
        );
      }
    });
  }

  /**
   * Hover on the bar with the given index
   * @param barIndex - The index of the bar to hover on
   */
  async hoverOnBarWithIndexAs(barIndex: number): Promise<void> {
    await test.step(`Hover on bar at index ${barIndex} for metric ${this.metricTitle}`, async () => {
      // await this.bars.nth(barIndex).hover();
      const barBoundingBox = await this.bars.nth(barIndex).boundingBox();
      //get the middle point of the bar
      const middlePoint = {
        x: (barBoundingBox?.x ?? 0) + (barBoundingBox?.width ?? 0) / 2,
        y: (barBoundingBox?.y ?? 0) + (barBoundingBox?.height ?? 0) / 2,
      };
      await this.page.mouse.move(middlePoint.x, middlePoint.y);
    });
  }

  /**
   * Hover on the bar with the given index
   * @param barIndex - The index of the bar to hover on
   */
  async hoverOnBarWithLabelAs(label: string): Promise<void> {
    await test.step(`Hover on bar with label ${label} for metric ${this.metricTitle}`, async () => {
      // await this.bars.nth(barIndex).hover();
      const exactBarToLocate = this.rootLocator
        .locator('[class*="highcharts-series-group"]')
        .locator(`rect[class*="highcharts-point"][aria-label*="${label}"]`);
      await expect(exactBarToLocate, `Bar with label ${label} should be visible`).toBeVisible();
      const barBoundingBox = await exactBarToLocate.boundingBox();
      //get the middle point of the bar
      const middlePoint = {
        x: (barBoundingBox?.x ?? 0) + (barBoundingBox?.width ?? 0) / 2,
        y: (barBoundingBox?.y ?? 0) + (barBoundingBox?.height ?? 0) / 2,
      };
      await this.page.mouse.move(middlePoint.x, middlePoint.y);
    });
  }

  /**
   * Clicks on the legend with the given label
   * @param label - The label of the legend to click on
   * @param params - The parameters for the click
   * @param params.force - Whether to force the click
   * @example
   * {
   *   force: true,
   * }
   */
  async clickOnLegendWithLabelAs(label: string, params?: { force?: boolean }): Promise<void> {
    await test.step(`Click on legend with label ${label} for metric ${this.metricTitle}`, async () => {
      const legend = this.chartLegends.filter({ hasText: label });
      await expect(legend, `Legend with label ${label} should be visible`).toBeVisible();
      await legend.click(params);
    });
  }

  /**
   * Verifies the legend with the given label is enabled
   * @param label - The label of the legend to verify
   */
  async verifyLegendWithLabelIsEnabled(label: string): Promise<void> {
    await test.step(`Verify legend with label ${label} is enabled for metric ${this.metricTitle}`, async () => {
      const legend = this.chartLegends.filter({ hasText: label });
      await expect(legend, `Legend with label ${label} should be enabled`).toBeEnabled();
    });
  }

  /**
   * Verifies the legend with the given label is disabled
   * @param label - The label of the legend to verify
   */
  async verifyLegendWithLabelIsDisabled(label: string): Promise<void> {
    await test.step(`Verify legend with label ${label} is disabled for metric ${this.metricTitle}`, async () => {
      const legend = this.chartLegends.filter({ hasText: label });
      await expect(legend, `Legend with label ${label} should be disabled`).toBeDisabled();
    });
  }

  /**
   * Verifies the tool tip container is visible
   */
  async waitForToolTipContainerToBeVisible(): Promise<void> {
    await this.verifier.waitUntilElementIsVisible(this.toolTipContainer, {
      timeout: 10_000,
      stepInfo: `Wait for tool tip container to be visible for metric ${this.metricTitle}`,
    });
  }

  /**
   * Validates the values shown in the tool tip are as expected
   * @param params - The parameters for the validation
   * @param params.labelsAndValues - The key texts and expected values to validate
   * @example
   * {
   *   labelsAndValues: [
   *     { keyText: 'Reporting date:', expectedValue: '10/8/2025' },
   *     { keyText: 'Adoption rate:', expectedValue: '10%' },
   *     { keyText: 'User logins:', expectedValue: '3' },
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
   * Verifies the number of bars are as expected
   * @param params - The parameters for the validation
   * @param params.numberOfBars - The expected number of bars
   * @example
   * {
   *   numberOfBars: 5,
   * }
   */
  async verifyNumberOfBarsAreAsExpected(params: { numberOfBars: number }): Promise<void> {
    await test.step(`Verify number of bars are as expected for metric ${this.metricTitle} and number of bars are as expected: ${params.numberOfBars}`, async () => {
      const { numberOfBars } = params;
      await expect(this.bars, `Number of bars should be ${numberOfBars}`).toHaveCount(numberOfBars);
    });
  }
}
