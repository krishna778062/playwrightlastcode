import { expect, FrameLocator, Page } from '@playwright/test';

import { PieChartComponent } from '../../../components/pieChartComponent';

import { CSVUtils } from '@/src/core/utils/csvUtils';
import { PeriodFilterTimeRange } from '@/src/modules/data-engineering/constants/periodFilterTimeRange';
import { DateHelper } from '@/src/modules/data-engineering/helpers/dateHelper';
import { CSVValidationUtil } from '@/src/modules/data-engineering/utils/csvValidationUtil';

export interface ContentPublishedByTypeData {
  contentTypeName: string;
  count: number;
  percentage: number;
}

export class ContentPublishedMetrics extends PieChartComponent {
  constructor(page: Page, thoughtSpotIframe: FrameLocator) {
    super(page, thoughtSpotIframe, 'Content published');
  }

  /**
   * Downloads CSV and validates it against Snowflake data
   * @param snowflakeData - Raw database data from Snowflake
   * @param selectedPeriod - Selected period filter for validation
   * @param customDates - Optional custom date range
   */
  async downloadAndValidateContentPublishedCSV(
    snowflakeData: ContentPublishedByTypeData[],
    selectedPeriod: PeriodFilterTimeRange,
    customDates?: { customStartDate: string; customEndDate: string }
  ): Promise<{ filePath: string; fileName: string }> {
    const { filePath, fileName } = await this.downloadDataAsCSV();

    try {
      // Parse CSV to get data records and headers
      const csvData = CSVUtils.getDataRecordsFromReportCSV(filePath);
      const csvHeaders = CSVUtils.getHeadersFromReportCSV(filePath);

      // Find the "Content type" column name
      const contentTypeColumnName = csvHeaders.find(header => header.toLowerCase() === 'content type');
      if (!contentTypeColumnName) {
        throw new Error('CSV does not contain "Content type" column');
      }

      // Count records by content type from CSV
      // CSV data is parsed as objects with column names as keys
      const csvCountsByType: Record<string, number> = {};
      for (const row of csvData) {
        const contentTypeValue = row[contentTypeColumnName];
        const contentType =
          typeof contentTypeValue === 'string' ? contentTypeValue.trim() : String(contentTypeValue || '').trim();
        if (contentType) {
          csvCountsByType[contentType] = (csvCountsByType[contentType] || 0) + 1;
        }
      }

      // Validate CSV metadata (title, date range) using CSVUtils directly
      const expectedDateRange = DateHelper.generateExpectedCSVDateRange(
        selectedPeriod,
        customDates?.customStartDate,
        customDates?.customEndDate
      );
      const metadataValidation = await CSVUtils.validateReportMetadata(
        'Content published',
        expectedDateRange,
        filePath
      );
      expect(
        metadataValidation.isValid,
        `CSV metadata validation failed: Title match=${metadataValidation.titleMatch}, Date range match=${metadataValidation.dateRangeMatch}`
      ).toBe(true);

      // Validate CSV headers
      const headersValidation = await CSVUtils.validateReportHeaders(csvHeaders, filePath);
      expect(
        headersValidation.isValid,
        `CSV headers validation failed: Missing headers=${headersValidation.missingHeaders.join(', ')}, Unexpected headers=${headersValidation.unexpectedHeaders.join(', ')}`
      ).toBe(true);

      // Verify counts match between DB and CSV
      for (const dbItem of snowflakeData) {
        const csvCount = csvCountsByType[dbItem.contentTypeName] || 0;
        expect(
          csvCount,
          `Content type "${dbItem.contentTypeName}" count mismatch: DB=${dbItem.count}, CSV=${csvCount}`
        ).toBe(dbItem.count);
      }

      // Verify all CSV content types exist in DB data
      for (const contentType of Object.keys(csvCountsByType)) {
        const dbItem = snowflakeData.find(item => item.contentTypeName === contentType);
        expect(dbItem, `Content type "${contentType}" found in CSV but not in DB data`).toBeDefined();
      }

      return { filePath, fileName };
    } finally {
      // Clean up the downloaded CSV file
      CSVValidationUtil.cleanup(filePath);
    }
  }
}
