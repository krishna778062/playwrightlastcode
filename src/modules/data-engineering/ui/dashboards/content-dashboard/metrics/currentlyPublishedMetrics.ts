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
   * @param dbData - The currently published data from database (should be sorted DESC)
   */
  async verifyBarsAreSortedByCountDescending(dbData: CurrentlyPublishedData[]): Promise<void> {
    await test.step(`Verify bars are sorted in descending order by count for ${this.metricTitle}`, async () => {
      const barCount = await this.bars.count();
      const barHeights: number[] = [];

      // Get heights of all bars
      for (let index = 0; index < barCount; index++) {
        const boundingBox = await this.bars.nth(index).boundingBox();
        if (boundingBox) {
          barHeights.push(boundingBox.height);
        }
      }

      // Verify heights are in descending order (or equal)
      for (let i = 0; i < barHeights.length - 1; i++) {
        expect(
          barHeights[i],
          `Bar at index ${i} (${dbData[i]?.contentTypeName || 'unknown'}) should be >= bar at index ${i + 1} (${dbData[i + 1]?.contentTypeName || 'unknown'})`
        ).toBeGreaterThanOrEqual(barHeights[i + 1]);
      }

      console.log(`----> Verified bars are sorted in descending order by count`);
      console.log(`----> Bar heights: ${barHeights.join(', ')}`);
      console.log(`----> Content types: ${dbData.map(d => d.contentTypeName).join(', ')}`);
    });
  }

  /**
   * Verifies all plotted bars by validating tooltips with database data
   * @param dbData - The currently published data from database
   */
  async verifyBarsWithTooltips(dbData: CurrentlyPublishedData[]): Promise<void> {
    await test.step(`Verify all plotted bars and their tooltips for ${this.metricTitle}`, async () => {
      console.log(`----> The currently published data is `, dbData);
      console.log(`----> Total data points: ${dbData.length}`);

      const barCount = await this.bars.count();
      console.log(`----> Total bars in DOM: ${barCount}`);

      for (let index = 0; index < dbData.length && index < barCount; index++) {
        const data = dbData[index];

        if (data.contentCount === 0) {
          console.log(`----> Skipping bar at index ${index} (${data.contentTypeName}: ${data.contentCount})`);
          continue;
        }

        await this.hoverOnBarWithIndexAs(index);
        await this.waitForToolTipContainerToBeVisible();
        await this.validateValuesShownInToolTipAreAsExpected({
          labelsAndValues: [{ keyText: 'Total content count', expectedValue: data.contentCount.toString() }],
        });
        console.log(`----> Verified bar at index ${index} (${data.contentTypeName}: ${data.contentCount})`);
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    });
  }
}
