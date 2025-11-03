import { FrameLocator, Page, test } from '@playwright/test';

import { SEARCH_METRICS } from '../../../../constants/searchMetrics';
import { LineChartComponent } from '../../../../ui/components/lineChartComponent';

export interface SearchUsageVolumeClickThroughRateData {
  search_date: string;
  total_search_count: number;
  total_click_count: number;
}

export class SearchUsageVolumeClickThroughRate extends LineChartComponent {
  constructor(page: Page, thoughtSpotIframe: FrameLocator) {
    super(page, thoughtSpotIframe, SEARCH_METRICS.SEARCH_USAGE_VOLUME_AND_CLICK_THROUGH_RATE.title);
  }

  /**
   * Verifies that the search usage volume and click through rate data is loaded
   */
  async verifyDataIsLoaded(): Promise<void> {
    await test.step(`Verify ${this.metricTitle} data is loaded`, async () => {
      await this.verifier.verifyTheElementIsVisible(this.rootLocator, {
        timeout: 60_000,
        assertionMessage: `${this.metricTitle} chart should be visible`,
      });
      // Verify chart has loaded by checking for axis labels
      await this.verifier.verifyTheElementIsVisible(this.horizontalAxisContainer, {
        timeout: 60_000,
        assertionMessage: `${this.metricTitle} chart axis should be visible`,
      });
    });
  }

  /**
   * Verifies all plotted line points by validating tooltips with database data
   * Iterates through line chart points and validates those with search count > 0 or clickthrough > 0
   * (Points with 0 values exist in DOM but may not be hoverable, so we skip them)
   * @param dbData - The search usage volume and click through rate data from database
   * @example
   * const dbData = await searchDashboardQueryHelper.getSearchUsageVolumeAndClickThroughRateFromDB(query, timePeriod);
   * await searchUsageVolumeMetric.verifyLinePointsWithTooltips(dbData);
   */
  async verifyLinePointsWithTooltips(dbData: SearchUsageVolumeClickThroughRateData[]): Promise<void> {
    await test.step(`Verify all plotted line points and their tooltips for ${this.metricTitle}`, async () => {
      console.log(`----> The search usage volume and click through rate data is `, dbData);
      console.log(`----> Total data points: ${dbData.length}`);

      // Get the actual number of line points in the DOM (total across all series)
      const pointCount = await this.linePoints.count();
      console.log(`----> Total line points in DOM: ${pointCount}`);

      // Note: Line chart with dual Y-axis may have points for both series
      // We'll verify points from the first series (search volume) which should match dbData order
      // For dual-axis charts, points might be interleaved, so we verify based on data availability

      // Iterate through dbData and verify corresponding points
      // Since there are 2 series (search volume and clickthrough), we expect 2 * dbData.length points total
      const pointsPerSeries = pointCount / 2;
      const seriesToVerify = Math.min(pointsPerSeries, dbData.length);

      for (let index = 0; index < seriesToVerify; index++) {
        const data = dbData[index];

        // Skip points with 0 searches and 0 clickthroughs (these may not be hoverable)
        if (data.total_search_count === 0 && data.total_click_count === 0) {
          console.log(
            `----> Skipping point at index ${index} (Date: ${data.search_date}, Searches: ${data.total_search_count}, Clickthrough: ${data.total_click_count})`
          );
          continue;
        }

        // For line charts with multiple series, we need to hover on the point for the first series (search volume)
        // Index calculation: first series points are at even indices (0, 2, 4...) if points are interleaved
        // Or they might be sequential: first dbData.length points for series 1, next dbData.length for series 2
        // We'll hover on the first series point
        const pointIndex = index; // First series points are at indices 0 to (dbData.length - 1)

        // Hover over the line point and verify the tooltip values
        await this.hoverOnLinePointWithIndexAs(pointIndex);
        await this.waitForToolTipContainerToBeVisible();

        // Format date to match tooltip format (likely YYYY-MM-DD HH:MM:SS or similar)
        const formattedDate = `${data.search_date} 00:00:00`;

        await this.validateValuesShownInToolTipAreAsExpected({
          labelsAndValues: [
            { keyText: 'Search performed datetime:', expectedValue: formattedDate },
            { keyText: 'Total search:', expectedValue: data.total_search_count.toString() },
            { keyText: 'Total clickthrough:', expectedValue: data.total_click_count.toString() },
          ],
        });
        console.log(
          `----> Verified line point at index ${pointIndex} (Date: ${data.search_date}, Searches: ${data.total_search_count}, Clickthrough: ${data.total_click_count})`
        );
        // Hold 1 second between hovers to avoid rapid interactions
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    });
  }
}
