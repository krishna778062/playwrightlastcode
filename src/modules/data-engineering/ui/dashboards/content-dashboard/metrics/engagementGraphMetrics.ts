import { expect, FrameLocator, Page, test } from '@playwright/test';

import { VerticalBarChartComponent } from '../../../components/verticalBarChartComponent';

import { CSVUtils } from '@/src/core/utils/csvUtils';
import { PeriodFilterTimeRange } from '@/src/modules/data-engineering/constants/periodFilterTimeRange';
import { DateHelper } from '@/src/modules/data-engineering/helpers/dateHelper';
import { CSVValidationConfig, CSVValidationUtil } from '@/src/modules/data-engineering/utils/csvValidationUtil';

export interface EngagementGraphData {
  DATE: string;
  LIKES: number;
  COMMENT: number;
  REPLIES: number;
  SHARE: number;
  FAVORITE: number;
}

export class EngagementGraphMetrics extends VerticalBarChartComponent {
  constructor(page: Page, thoughtSpotIframe: FrameLocator) {
    super(page, thoughtSpotIframe, 'Engagement graph');
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
   * Verifies X-axis labels match expected dates
   * @param expectedDates - Array of expected date labels in the format they appear in UI
   */
  async verifyXAxisLabelsMatchDates(expectedDates: string[]): Promise<void> {
    await test.step(`Verify X-axis labels match dates for ${this.metricTitle}`, async () => {
      await this.verifyXAxisLabelsAreAsExpected({
        xAxisLabels: expectedDates,
      });
    });
  }

  /**
   * Verifies tooltip values for a specific bar at given index
   * @param barIndex - Index of the bar to verify
   * @param expectedData - Expected engagement data for that date
   */
  async verifyBarTooltip(barIndex: number, expectedData: EngagementGraphData): Promise<void> {
    await test.step(`Verify tooltip for bar at index ${barIndex} (date: ${expectedData.DATE})`, async () => {
      await this.hoverOnBarWithIndexAs(barIndex);
      await this.waitForToolTipContainerToBeVisible();

      const labelsAndValues = [
        { keyText: 'Likes', expectedValue: expectedData.LIKES.toString() },
        { keyText: 'Comment', expectedValue: expectedData.COMMENT.toString() },
        { keyText: 'Replies', expectedValue: expectedData.REPLIES.toString() },
        { keyText: 'Share', expectedValue: expectedData.SHARE.toString() },
        { keyText: 'Favorite', expectedValue: expectedData.FAVORITE.toString() },
      ];

      await this.validateValuesShownInToolTipAreAsExpected({
        labelsAndValues,
      });

      // Small delay to allow tooltip to disappear before next hover
      await new Promise(resolve => setTimeout(resolve, 500));
    });
  }

  /**
   * Downloads CSV and validates it against Snowflake data
   * @param snowflakeData - Raw database data from Snowflake
   * @param selectedPeriod - Selected period filter for validation
   * @param customDates - Optional custom date range
   */
  async downloadAndValidateEngagementGraphCSV(
    snowflakeData: EngagementGraphData[],
    selectedPeriod: PeriodFilterTimeRange,
    customDates?: { customStartDate: string; customEndDate: string }
  ): Promise<{ filePath: string; fileName: string }> {
    const { filePath, fileName } = await this.downloadDataAsCSV();

    try {
      // Parse CSV to get data records and headers
      const csvData = CSVUtils.getDataRecordsFromReportCSV(filePath);
      const csvHeaders = CSVUtils.getHeadersFromReportCSV(filePath);

      // Expected headers for Engagement graph CSV (actual CSV uses different names)
      const expectedHeaders = [
        'Date',
        'Content reactions',
        'Content comments',
        'Comment replies',
        'Content shares',
        'Content favorites',
      ];

      // Validate CSV metadata (title, date range) using CSVUtils directly
      const expectedDateRange = DateHelper.generateExpectedCSVDateRange(
        selectedPeriod,
        customDates?.customStartDate,
        customDates?.customEndDate
      );
      const metadataValidation = await CSVUtils.validateReportMetadata('Engagement graph', expectedDateRange, filePath);
      expect(
        metadataValidation.isValid,
        `CSV metadata validation failed: Title match=${metadataValidation.titleMatch}, Date range match=${metadataValidation.dateRangeMatch}`
      ).toBe(true);

      // Validate CSV headers
      const headersValidation = await CSVUtils.validateReportHeaders(expectedHeaders, filePath);
      expect(
        headersValidation.isValid,
        `CSV headers validation failed: Missing: [${headersValidation.missingHeaders.join(
          ', '
        )}]. Unexpected: [${headersValidation.unexpectedHeaders.join(', ')}]`
      ).toBe(true);

      // Transform DB data for CSV validation (map DB column names to CSV header names)
      // CSV only includes dates with data, so we need to format dates consistently
      // DB DATE is a string like "2025-11-10", CSV Date is also "2025-11-10"
      const transformedDataForValidation = snowflakeData.map(item => {
        // Ensure date is in YYYY-MM-DD format (DB might return Date object or string)
        const dateStr =
          typeof item.DATE === 'string' ? item.DATE.split('T')[0] : new Date(item.DATE).toISOString().split('T')[0];
        return {
          Date: dateStr,
          'Content reactions': item.LIKES, // DB: LIKES -> CSV: Content reactions
          'Content comments': item.COMMENT, // DB: COMMENT -> CSV: Content comments
          'Comment replies': item.REPLIES, // DB: REPLIES -> CSV: Comment replies
          'Content shares': item.SHARE, // DB: SHARE -> CSV: Content shares
          'Content favorites': item.FAVORITE, // DB: FAVORITE -> CSV: Content favorites
        };
      });

      // CSV only includes dates with data (non-zero values), so filter DB data to only include dates present in CSV
      // This matches the CSV export behavior where dates with all zeros are excluded
      const csvDates = new Set(csvData.map(row => row.Date?.toString().trim() || ''));
      const filteredDBData = transformedDataForValidation.filter(item => csvDates.has(item.Date));

      // Validate CSV data against filtered DB data
      const validationConfig: CSVValidationConfig = {
        csvPath: filePath,
        expectedDBData: filteredDBData as any,
        metricName: 'Engagement graph',
        selectedPeriod,
        ...(customDates || {}),
        expectedHeaders,
        transformations: {
          headerMapping: {
            Date: 'Date',
            'Content reactions': 'Content reactions',
            'Content comments': 'Content comments',
            'Comment replies': 'Comment replies',
            'Content shares': 'Content shares',
            'Content favorites': 'Content favorites',
          },
        },
      };

      await CSVValidationUtil.validateAndAssert(validationConfig);
      return { filePath, fileName };
    } finally {
      // Clean up the downloaded CSV file
      CSVValidationUtil.cleanup(filePath);
    }
  }
}
