import { expect, FrameLocator, Page } from '@playwright/test';

import { TabluarMetricsComponent } from '../../../components/tabluarMetricsComponent';

import { CSVUtils } from '@/src/core/utils/csvUtils';
import { PeriodFilterTimeRange } from '@/src/modules/data-engineering/constants/periodFilterTimeRange';
import { DateHelper } from '@/src/modules/data-engineering/helpers/dateHelper';
import { CSVValidationUtil } from '@/src/modules/data-engineering/utils/csvValidationUtil';

export enum ViewsByTypeColumns {
  CONTENT_TYPE = 'Content type',
  TOTAL_CONTENT_VIEWS = 'Total content views',
  UNIQUE_VIEWS = 'Unique views',
  TOTAL_CONTENT = 'Total content',
  VIEWS_CONTRIBUTION = 'Views contribution',
  AVERAGE_CONTENT_VIEWS = 'Average content views',
}

export class ViewsByTypeMetrics extends TabluarMetricsComponent {
  constructor(page: Page, thoughtSpotIframe: FrameLocator) {
    super(page, thoughtSpotIframe, 'Views by type');
  }

  async verifyUIDataMatchesWithSnowflakeData(
    snowflakeDataArray: Array<{
      CONTENT_TYPE: string;
      TOTAL_CONTENT_VIEWS: number;
      UNIQUE_VIEWS: number;
      TOTAL_CONTENT: number;
      VIEWS_CONTRIBUTION: number;
      AVERAGE_CONTENT_VIEWS: number;
    }>
  ): Promise<void> {
    const dataMapper = (item: any) => {
      // Format views contribution as percentage (e.g., "80.99%")
      const viewsContributionFormatted = item.VIEWS_CONTRIBUTION?.toFixed(2) + '%' || '0%';

      return {
        [ViewsByTypeColumns.CONTENT_TYPE]: item.CONTENT_TYPE || '',
        [ViewsByTypeColumns.TOTAL_CONTENT_VIEWS]: item.TOTAL_CONTENT_VIEWS?.toString() || '0',
        [ViewsByTypeColumns.UNIQUE_VIEWS]: item.UNIQUE_VIEWS?.toString() || '0',
        [ViewsByTypeColumns.TOTAL_CONTENT]: item.TOTAL_CONTENT?.toString() || '0',
        [ViewsByTypeColumns.VIEWS_CONTRIBUTION]: viewsContributionFormatted,
        [ViewsByTypeColumns.AVERAGE_CONTENT_VIEWS]: item.AVERAGE_CONTENT_VIEWS?.toFixed(2) || '0',
      };
    };

    await this.compareUIDataWithDBRecords(snowflakeDataArray, dataMapper, ViewsByTypeColumns.CONTENT_TYPE);
  }

  async verifyDataIsLoaded(): Promise<void> {
    await this.verifyTabluarDataIsLoaded();
  }

  /**
   * Downloads CSV and validates it against Snowflake data
   * @param snowflakeData - Raw database data from Snowflake
   * @param selectedPeriod - Selected period filter for validation
   * @param customDates - Optional custom date range
   */
  async downloadAndValidateViewsByTypeCSV(
    snowflakeData: Array<{
      CONTENT_TYPE: string;
      TOTAL_CONTENT_VIEWS: number;
      UNIQUE_VIEWS: number;
      TOTAL_CONTENT: number;
      VIEWS_CONTRIBUTION: number;
      AVERAGE_CONTENT_VIEWS: number;
    }>,
    selectedPeriod: PeriodFilterTimeRange,
    customDates?: { customStartDate: string; customEndDate: string }
  ): Promise<{ filePath: string; fileName: string }> {
    const { filePath, fileName } = await this.downloadDataAsCSV();

    try {
      // Parse CSV to get data records
      const csvData = CSVUtils.getDataRecordsFromReportCSV(filePath);

      // CSV has user-level data with content type views as columns
      // Need to aggregate: Page views, Album views, Event views, Blog post views
      const contentTypeColumns = {
        'Page views': 'Page',
        'Album views': 'Album',
        'Event views': 'Event',
        'Blog post views': 'Blog Post',
      };

      // Aggregate views by content type from CSV
      // CSV has user-level data with columns: Page views, Album views, Event views, Blog post views
      // We need to aggregate these to match DB structure
      const csvAggregatedData: Record<
        string,
        {
          totalViews: number;
          uniqueViews: Set<string>;
          totalContent: Set<string>;
        }
      > = {};

      // Initialize aggregated data for each content type
      for (const contentTypeName of Object.values(contentTypeColumns)) {
        csvAggregatedData[contentTypeName] = {
          totalViews: 0,
          uniqueViews: new Set(),
          totalContent: new Set(),
        };
      }

      // Aggregate data from each user row
      for (const row of csvData) {
        for (const [columnName, contentTypeName] of Object.entries(contentTypeColumns)) {
          const viewsValue = row[columnName];
          const views =
            typeof viewsValue === 'string'
              ? Number(viewsValue.trim())
              : typeof viewsValue === 'number'
                ? viewsValue
                : Number(viewsValue || 0);

          if (!isNaN(views) && views > 0) {
            csvAggregatedData[contentTypeName].totalViews += views;

            // For unique views: count distinct user-content-date combinations
            // Since CSV is user-level, we approximate by counting users who viewed this content type
            const emailValue = row['Email'];
            const nameValue = row['User name'];
            const userEmail =
              typeof emailValue === 'string'
                ? emailValue.trim()
                : typeof nameValue === 'string'
                  ? nameValue.trim()
                  : '';
            if (userEmail) {
              csvAggregatedData[contentTypeName].uniqueViews.add(userEmail);
            }

            // For total content: approximate by counting users who viewed (each user might have viewed different content)
            // This is an approximation since we don't have content IDs in the CSV
            if (userEmail) {
              csvAggregatedData[contentTypeName].totalContent.add(userEmail);
            }
          }
        }
      }

      // Calculate total views for contribution percentage
      const totalViewsAll = Object.values(csvAggregatedData).reduce((sum, data) => sum + data.totalViews, 0);

      // Validate CSV metadata (title, date range) using CSVUtils directly
      const expectedDateRange = DateHelper.generateExpectedCSVDateRange(
        selectedPeriod,
        customDates?.customStartDate,
        customDates?.customEndDate
      );
      const metadataValidation = await CSVUtils.validateReportMetadata('Views by type', expectedDateRange, filePath);
      expect(
        metadataValidation.isValid,
        `CSV metadata validation failed: Title match=${metadataValidation.titleMatch}, Date range match=${metadataValidation.dateRangeMatch}`
      ).toBe(true);

      // Compare aggregated CSV data with DB data - exact matching required for all columns
      for (const dbItem of snowflakeData) {
        const csvAggregated = csvAggregatedData[dbItem.CONTENT_TYPE];
        expect(csvAggregated, `Content type "${dbItem.CONTENT_TYPE}" not found in CSV aggregated data`).toBeDefined();

        // Calculate aggregated values from CSV
        const csvTotalViews = csvAggregated.totalViews;
        const csvUniqueViews = csvAggregated.uniqueViews.size;
        const csvTotalContent = csvAggregated.totalContent.size;
        const csvViewsContribution = totalViewsAll > 0 ? (csvTotalViews / totalViewsAll) * 100 : 0;
        const csvAvgContentViews = csvTotalContent > 0 ? csvTotalViews / csvTotalContent : 0;

        // Exact match for all columns - if not matching, it's a bug
        expect(
          csvTotalViews,
          `Content type "${dbItem.CONTENT_TYPE}" total views mismatch: DB=${dbItem.TOTAL_CONTENT_VIEWS}, CSV=${csvTotalViews}`
        ).toBe(dbItem.TOTAL_CONTENT_VIEWS);

        expect(
          csvUniqueViews,
          `Content type "${dbItem.CONTENT_TYPE}" unique views mismatch: DB=${dbItem.UNIQUE_VIEWS}, CSV=${csvUniqueViews}`
        ).toBe(dbItem.UNIQUE_VIEWS);

        expect(
          csvTotalContent,
          `Content type "${dbItem.CONTENT_TYPE}" total content mismatch: DB=${dbItem.TOTAL_CONTENT}, CSV=${csvTotalContent}`
        ).toBe(dbItem.TOTAL_CONTENT);

        expect(
          csvViewsContribution,
          `Content type "${dbItem.CONTENT_TYPE}" views contribution mismatch: DB=${dbItem.VIEWS_CONTRIBUTION}, CSV=${csvViewsContribution.toFixed(2)}`
        ).toBeCloseTo(dbItem.VIEWS_CONTRIBUTION, 2);

        expect(
          csvAvgContentViews,
          `Content type "${dbItem.CONTENT_TYPE}" average content views mismatch: DB=${dbItem.AVERAGE_CONTENT_VIEWS}, CSV=${csvAvgContentViews.toFixed(2)}`
        ).toBeCloseTo(dbItem.AVERAGE_CONTENT_VIEWS, 2);
      }

      return { filePath, fileName };
    } finally {
      // Clean up the downloaded CSV file
      CSVValidationUtil.cleanup(filePath);
    }
  }
}
