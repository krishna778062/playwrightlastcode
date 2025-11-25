import { expect, FrameLocator, Locator, Page, test } from '@playwright/test';

import { BaseComponent } from '@/src/core/ui/components/baseComponent';

export class VerticalBarChartComponent extends BaseComponent {
  readonly verticalAxisContainer: Locator;
  readonly horizontalAxisContainer: Locator;
  readonly verticalAxisLabel: Locator;
  readonly horizontalAxisLabel: Locator;

  readonly barChartXAxisLabels: Locator;
  readonly barChartYAxisLabels: Locator;
  readonly bars: Locator;

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
    this.verticalAxisContainer = this.rootLocator.locator('[class*="bk-vertical-axis"]');
    this.horizontalAxisContainer = this.rootLocator.locator('[class*="bk-horizontal-axis"]');
    this.verticalAxisLabel = this.verticalAxisContainer.locator('[class="axis-label-title"]');
    this.horizontalAxisLabel = this.horizontalAxisContainer.locator('[class="axis-label-title"]');
    this.bars = this.rootLocator
      .locator('[class*="highcharts-series-group"]')
      .locator('rect[class*="highcharts-point"]');
    this.barChartXAxisLabels = this.rootLocator.locator('[class*="highcharts-xaxis-labels"]').locator('text');
    this.barChartYAxisLabels = this.rootLocator.locator('[class*="highcharts-yaxis-labels"]').locator('text');

    // Tool tip container
    this.toolTipContainer = this.thoughtSpotIframe.locator('[class*="highcharts-tooltip-container"]');
    this.getToolTipBlockWithKeyTextAs = (label: string) =>
      this.toolTipContainer.locator("[class*='chart-tooltip-block']").filter({ hasText: label });
  }

  /**
   * Verifies the axis labels are as expected
   * @param params - The parameters for the validation
   * @param params.verticalAxisLabel - The expected vertical axis label
   * @param params.horizontalAxisLabel - The expected horizontal axis label
   * @example
   * {
   *   verticalAxisLabel: 'Adoption rate',
   *   horizontalAxisLabel: 'Reporting date (for 2025)',
   * }
   */
  async verifyAxisLabelsAreAsExpected(params: {
    verticalAxisLabel: string;
    horizontalAxisLabel: string;
  }): Promise<void> {
    await test.step(`Verify axis labels are as expected for metric ${this.metricTitle}`, async () => {
      const { verticalAxisLabel, horizontalAxisLabel } = params;
      await expect(this.verticalAxisLabel, `Vertical axis label should be ${verticalAxisLabel}`).toContainText(
        verticalAxisLabel
      );
      await expect(this.horizontalAxisLabel, `Horizontal axis label should be ${horizontalAxisLabel}`).toContainText(
        horizontalAxisLabel
      );
    });
  }

  /**
   * Verifies the number of bars visible on the bar chart are as expected
   * @param params - The parameters for the validation
   * @param params.numberOfBars - The expected number of bars
   * @example
   * {
   *   numberOfBars: 12,
   * }
   */
  async verifyNumberOfBarsAreAsExpected(params: { numberOfBars: number }): Promise<void> {
    await test.step(`Verify number of bars are as expected for metric ${this.metricTitle}`, async () => {
      const { numberOfBars } = params;
      await expect(this.bars, `Number of bars should be ${numberOfBars}`).toHaveCount(numberOfBars);
    });
  }

  /**
   * Verifies the number of X axis labels visible on the bar chart are as expected
   * @param params - The parameters for the validation
   * @param params.noOfXAxisLabels - The expected number of X axis labels
   * @example
   * {
   *   noOfXAxisLabels: 12,
   * }
   */
  async verifyNoOfXAxisLabelsAreAsExpected(params: { noOfXAxisLabels: number }): Promise<void> {
    await test.step(`Verify number of X axis labels are as expected for metric ${this.metricTitle}`, async () => {
      const { noOfXAxisLabels } = params;
      await expect(this.barChartXAxisLabels, `Number of X axis labels should be ${noOfXAxisLabels}`).toHaveCount(
        noOfXAxisLabels
      );
    });
  }

  /**
   * Verifies the number of Y axis labels visible on the bar chart are as expected
   * @param params - The parameters for the validation
   * @param params.noOfYAxisLabels - The expected number of Y axis labels
   * @example
   * {
   *   noOfYAxisLabels: 12,
   * }
   */
  async verifyNoOfYAxisLabelsAreAsExpected(params: { noOfYAxisLabels: number }): Promise<void> {
    await test.step(`Verify number of Y axis labels are as expected for metric ${this.metricTitle}`, async () => {
      const { noOfYAxisLabels } = params;
      await expect(this.barChartYAxisLabels, `Number of Y axis labels should be ${noOfYAxisLabels}`).toHaveCount(
        noOfYAxisLabels
      );
    });
  }

  /**
   * Verifies the X axis labels visible on the bar chart are as expected
   * @param params - The parameters for the validation
   * @param params.xAxisLabels - The expected X axis labels
   * @example
   * {
   *   xAxisLabels: ['Oct 01', 'Oct 02', 'Oct 03'],
   * }
   */
  async verifyXAxisLabelsAreAsExpected(params: { xAxisLabels: string[] }): Promise<void> {
    await test.step(`Verify X axis labels are as expected for metric ${this.metricTitle}`, async () => {
      const { xAxisLabels } = params;
      for (const label of xAxisLabels) {
        const xAxisLabel = this.barChartXAxisLabels.filter({ hasText: label });
        await expect(xAxisLabel, `X axis with label ${label} should be visible`).toBeVisible();
      }
    });
  }

  /**
   * Verifies the Y axis labels visible on the bar chart are as expected
   * @param params - The parameters for the validation
   * @param params.yAxisLabels - The expected Y axis labels
   * @example
   * {
   *   yAxisLabels: ['10%', '20%', '30%'],
   * }
   */
  async verifyYAxisLabelsAreAsExpected(params: { yAxisLabels: string[] }): Promise<void> {
    await test.step(`Verify Y axis labels are as expected for metric ${this.metricTitle}`, async () => {
      const { yAxisLabels } = params;
      for (const label of yAxisLabels) {
        const yAxisLabel = this.barChartYAxisLabels.getByText(label, { exact: true });
        await expect(yAxisLabel, `Y axis with label ${label} should be visible`).toBeVisible();
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
   * Verifies the tool tip container is visible
   */
  async waitForToolTipContainerToBeVisible(): Promise<void> {
    await expect(
      this.toolTipContainer,
      `Tool tip container should be visible and there should be only 1 tool tip container`
    ).toHaveCount(1, { timeout: 10_000 });
    await test.step(`Verify tool tip container is visible for metric ${this.metricTitle}`, async () => {
      await this.verifier.waitUntilElementIsVisible(this.toolTipContainer, {
        timeout: 30_000,
        stepInfo: `Wait for tool tip container to be visible for metric ${this.metricTitle}`,
      });
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
}
