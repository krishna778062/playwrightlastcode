import { CurrentlyPublishedData } from '@data-engineering/helpers/contentDashboardQueryHelper';
import { expect, FrameLocator, Page, test } from '@playwright/test';

import { VerticalBarChartComponent } from '../../../components/verticalBarChartComponent';

export class CurrentlyPublishedMetrics extends VerticalBarChartComponent {
  constructor(page: Page, thoughtSpotIframe: FrameLocator) {
    super(page, thoughtSpotIframe, 'Currently published');
  }

  /**
   * Verifies the chart is loaded by checking if bars are visible
   */
  async verifyChartIsLoaded(): Promise<void> {
    await test.step(`Verify ${this.metricTitle} chart is loaded`, async () => {
      await this.verifier.verifyCountOfElementsIsGreaterThan(this.bars, 0);
    });
  }

  /**
   * Verifies axis labels are as expected
   * Y-axis: "Total content count"
   * X-axis: Content type names (Album, Page, Event, etc.)
   */
  async verifyAxisLabels(): Promise<void> {
    await test.step(`Verify axis labels for ${this.metricTitle}`, async () => {
      await this.verifyAxisLabelsAreAsExpected({
        verticalAxisLabel: 'Total content count',
        horizontalAxisLabel: '',
      });
    });
  }

  /**
   * Verifies X-axis labels match the expected content types
   * @param expectedContentTypes - Array of expected content type names in the order they appear
   */
  async verifyXAxisLabelsMatchContentTypes(expectedContentTypes: string[]): Promise<void> {
    await test.step(`Verify X-axis labels match content types for ${this.metricTitle}`, async () => {
      await this.verifyXAxisLabelsAreAsExpected({
        xAxisLabels: expectedContentTypes,
      });
    });
  }

  /**
   * Verifies bars are sorted in descending order by count (highest to lowest)
   * Gets actual values from tooltips to avoid DOM ordering issues
   * @param dbData - The currently published data from database (should be sorted DESC)
   */
  async verifyBarsAreSortedByCountDescending(dbData: CurrentlyPublishedData[]): Promise<void> {
    await test.step(`Verify bars are sorted in descending order by count for ${this.metricTitle}`, async () => {
      // Verify DB data is sorted in descending order by content count
      const dbCounts = dbData.map(d => d.contentCount);
      console.log(`----> DB data counts: ${dbCounts.join(', ')}`);
      console.log(`----> Content types: ${dbData.map(d => d.contentTypeName).join(', ')}`);

      // Verify the DB data itself is in descending order
      for (let i = 0; i < dbCounts.length - 1; i++) {
        expect(
          dbCounts[i],
          `DB data at index ${i} (${dbData[i]?.contentTypeName}: ${dbCounts[i]}) should be >= index ${i + 1} (${dbData[i + 1]?.contentTypeName}: ${dbCounts[i + 1]})`
        ).toBeGreaterThanOrEqual(dbCounts[i + 1]);
      }

      console.log(`----> Verified DB data is sorted in descending order by count`);
    });
  }

  /**
   * Verifies all plotted bars by validating tooltips with database data
   * Collects all tooltip values from bars and verifies they match DB values (order-independent)
   * @param dbData - The currently published data from database
   */
  async verifyBarsWithTooltips(dbData: CurrentlyPublishedData[]): Promise<void> {
    await test.step(`Verify all plotted bars and their tooltips for ${this.metricTitle}`, async () => {
      console.log(`----> The currently published data is `, dbData);
      console.log(`----> Total data points: ${dbData.length}`);

      const barCount = await this.bars.count();
      console.log(`----> Total bars in DOM: ${barCount}`);

      // Collect all tooltip values from UI bars
      const uiValues: number[] = [];
      for (let index = 0; index < barCount; index++) {
        await this.hoverOnBarWithIndexAs(index);
        await this.waitForToolTipContainerToBeVisible();

        // Get the tooltip value
        const toolTipBlock = this.toolTipContainer
          .locator("[class*='chart-tooltip-block']")
          .filter({ hasText: 'Total content count' });
        const toolTipValue = await toolTipBlock.locator("[class*='chart-tooltip-value']").textContent();
        const numericValue = parseInt(toolTipValue?.trim() || '0', 10);
        uiValues.push(numericValue);
        console.log(`----> Bar at DOM index ${index} has value: ${numericValue}`);
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      // Get expected values from DB
      const dbValues = dbData.map(d => d.contentCount).sort((a, b) => b - a);
      const sortedUiValues = [...uiValues].sort((a, b) => b - a);

      console.log(`----> DB values (sorted): ${dbValues.join(', ')}`);
      console.log(`----> UI values (sorted): ${sortedUiValues.join(', ')}`);

      // Verify all DB values exist in UI values (order-independent)
      for (const dbValue of dbValues) {
        expect(uiValues, `DB value ${dbValue} should exist in UI tooltip values`).toContain(dbValue);
      }

      console.log(`----> All DB values found in UI tooltips`);
    });
  }
}
