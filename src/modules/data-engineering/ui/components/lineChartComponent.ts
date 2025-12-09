import { expect, FrameLocator, Locator, Page, test } from '@playwright/test';

import { BaseComponent } from '@/src/core/ui/components/baseComponent';

export class LineChartComponent extends BaseComponent {
  readonly verticalAxisContainer: Locator;
  readonly horizontalAxisContainer: Locator;
  readonly verticalAxisLabels: Locator;
  readonly horizontalAxisLabel: Locator;

  readonly lineChartXAxisLabels: Locator;
  readonly lineChartYAxisLabels: Locator;
  readonly linePoints: Locator;

  readonly toolTipContainer: Locator;
  readonly getToolTipBlockWithKeyTextAs: (keyText: string) => Locator;
  readonly downloadCSVButton: Locator;

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
    this.verticalAxisLabels = this.verticalAxisContainer.locator('[class="axis-label-title"]');
    this.horizontalAxisLabel = this.horizontalAxisContainer.locator('[class="axis-label-title"]');
    this.linePoints = this.rootLocator
      .locator('[class*="highcharts-series-group"]')
      .locator('circle[class*="highcharts-point"]');
    this.lineChartXAxisLabels = this.rootLocator.locator('[class*="highcharts-xaxis-labels"]').locator('text');
    this.lineChartYAxisLabels = this.rootLocator.locator('[class*="highcharts-yaxis-labels"]').locator('text');

    // Tool tip container
    this.toolTipContainer = this.thoughtSpotIframe
      .locator('[class*="highcharts-tooltip-container"]')
      .filter({ has: this.thoughtSpotIframe.locator("g[opacity='1']") });
    this.getToolTipBlockWithKeyTextAs = (label: string) =>
      this.toolTipContainer.locator("[class*='chart-tooltip-block']").filter({ hasText: label });

    // Download CSV button
    this.downloadCSVButton = this.rootLocator.getByRole('button', { name: 'Download CSV' });
  }

  /**
   * Verifies the axis labels are as expected
   * Supports both single and dual Y-axis charts
   * @param params - The parameters for the validation
   * @param params.leftVerticalAxisLabel - The expected left vertical axis label (for dual Y-axis charts)
   * @param params.rightVerticalAxisLabel - The expected right vertical axis label (for dual Y-axis charts, optional)
   * @param params.verticalAxisLabel - The expected vertical axis label (for single Y-axis charts, optional)
   * @param params.horizontalAxisLabel - The expected horizontal axis label
   * @example
   * // For dual Y-axis:
   * {
   *   leftVerticalAxisLabel: 'Total searches',
   *   rightVerticalAxisLabel: 'Total clickthrough',
   *   horizontalAxisLabel: 'Search performed date (for 2025)',
   * }
   * // For single Y-axis:
   * {
   *   verticalAxisLabel: 'Value',
   *   horizontalAxisLabel: 'Date',
   * }
   */
  async verifyAxisLabelsAreAsExpected(params: {
    leftVerticalAxisLabel?: string;
    rightVerticalAxisLabel?: string;
    verticalAxisLabel?: string;
    horizontalAxisLabel: string;
  }): Promise<void> {
    await test.step(`Verify axis labels are as expected for metric ${this.metricTitle}`, async () => {
      const { leftVerticalAxisLabel, rightVerticalAxisLabel, verticalAxisLabel, horizontalAxisLabel } = params;

      // Verify horizontal axis label
      await expect(this.horizontalAxisLabel, `Horizontal axis label should be ${horizontalAxisLabel}`).toContainText(
        horizontalAxisLabel
      );

      // Handle dual Y-axis (left and right)
      if (leftVerticalAxisLabel || rightVerticalAxisLabel) {
        if (leftVerticalAxisLabel) {
          const leftAxisLabel = this.verticalAxisLabels.filter({ hasText: leftVerticalAxisLabel }).first();
          await expect(leftAxisLabel, `Left vertical axis label should be ${leftVerticalAxisLabel}`).toBeVisible();
        }
        if (rightVerticalAxisLabel) {
          const rightAxisLabel = this.verticalAxisLabels.filter({ hasText: rightVerticalAxisLabel }).first();
          await expect(rightAxisLabel, `Right vertical axis label should be ${rightVerticalAxisLabel}`).toBeVisible();
        }
      } else if (verticalAxisLabel) {
        // Handle single Y-axis
        await expect(this.verticalAxisLabels, `Vertical axis label should be ${verticalAxisLabel}`).toContainText(
          verticalAxisLabel
        );
      }
    });
  }

  /**
   * Verifies the number of line points visible on the line chart are as expected
   * @param params - The parameters for the validation
   * @param params.numberOfPoints - The expected number of points
   * @example
   * {
   *   numberOfPoints: 30,
   * }
   */
  async verifyNumberOfPointsAreAsExpected(params: { numberOfPoints: number }): Promise<void> {
    await test.step(`Verify number of line points are as expected for metric ${this.metricTitle}`, async () => {
      const { numberOfPoints } = params;
      await expect(this.linePoints, `Number of line points should be ${numberOfPoints}`).toHaveCount(numberOfPoints);
    });
  }

  /**
   * Verifies the X axis labels visible on the line chart are as expected
   * @param params - The parameters for the validation
   * @param params.xAxisLabels - The expected X axis labels
   * @example
   * {
   *   xAxisLabels: ['Oct 06', 'Oct 13', 'Oct 20', 'Oct 27'],
   * }
   */
  async verifyXAxisLabelsAreAsExpected(params: { xAxisLabels: string[] }): Promise<void> {
    await test.step(`Verify X axis labels are as expected for metric ${this.metricTitle}`, async () => {
      const { xAxisLabels } = params;
      for (const label of xAxisLabels) {
        const xAxisLabel = this.lineChartXAxisLabels.filter({ hasText: label });
        await expect(xAxisLabel, `X axis with label ${label} should be visible`).toBeVisible();
      }
    });
  }

  /**
   * Hover on the line point with the given index
   * @param pointIndex - The index of the line point to hover on
   */
  async hoverOnLinePointWithIndexAs(pointIndex: number): Promise<void> {
    await test.step(`Hover on line point at index ${pointIndex} for metric ${this.metricTitle}`, async () => {
      const pointBoundingBox = await this.linePoints.nth(pointIndex).boundingBox();
      // Get the middle point of the circle
      const middlePoint = {
        x: (pointBoundingBox?.x ?? 0) + (pointBoundingBox?.width ?? 0) / 2,
        y: (pointBoundingBox?.y ?? 0) + (pointBoundingBox?.height ?? 0) / 2,
      };
      await this.page.mouse.move(middlePoint.x, middlePoint.y);
    });
  }

  /**
   * Verifies the tool tip container is visible
   */
  async waitForToolTipContainerToBeVisible(): Promise<void> {
    await test.step(`Verify tool tip container is visible for metric ${this.metricTitle}`, async () => {
      await this.verifier.waitUntilElementIsVisible(this.toolTipContainer, {
        timeout: 10_000,
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
   *     { keyText: 'Search performed datetime:', expectedValue: '2025-10-30 00:00:00' },
   *     { keyText: 'Total search:', expectedValue: '1' },
   *     { keyText: 'Total clickthrough:', expectedValue: '0' },
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
   * Downloads the data as csv
   * @returns The downloaded file path and filename
   */
  async downloadDataAsCSV(): Promise<{ filePath: string; fileName: string }> {
    return await test.step(`download data as csv for ${this.metricTitle}`, async () => {
      /**
       * 1. first hover over the container, it should reveal the download csv button
       * 2. click on the download csv button
       * 3. save the file to downloads folder
       * 4. return the downloaded file path and filename
       */
      const downloadAction = async () => {
        await this.rootLocator.hover();
        await this.verifier.verifyTheElementIsVisible(this.downloadCSVButton, {
          timeout: 10_000,
          assertionMessage: `Download csv button should be visible for ${this.metricTitle}`,
        });
        await this.clickOnElement(this.downloadCSVButton, { stepInfo: `Click on download csv button` });
      };
      return await this.downloadAndSaveFile(downloadAction, { stepInfo: `Download csv file for ${this.metricTitle}` });
    });
  }
}
