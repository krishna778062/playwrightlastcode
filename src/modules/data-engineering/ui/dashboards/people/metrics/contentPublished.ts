import { FrameLocator, Page } from '@playwright/test';

import { PeopleDashboardTabularMetricsComponent } from './basePeopleDashboardTabularMetricsComponent';

import { CSVUtils } from '@/src/core/utils/csvUtils';
import { PEOPLE_METRICS } from '@/src/modules/data-engineering/constants/peopleMetrics';
import { PeriodFilterTimeRange } from '@/src/modules/data-engineering/constants/periodFilterTimeRange';
import { CSVValidationConfig, CSVValidationUtil } from '@/src/modules/data-engineering/utils/csvValidationUtil';

export enum ContentPublishedColumns {
  NAME = 'Name',
  PUBLISHED_CONTENT = 'Published content',
}

export class ContentPublished extends PeopleDashboardTabularMetricsComponent {
  constructor(page: Page, iframe: FrameLocator) {
    super(page, iframe, PEOPLE_METRICS.CONTENT_PUBLISHED.title);
  }

  async verifyUIDataMatchesWithSnowflakeData(
    snowflakeDataArray: Array<{
      Name: string;
      'Published content': number;
    }>
  ): Promise<void> {
    const dataMapper = (item: any) => ({
      [ContentPublishedColumns.NAME]: item['Name'],
      [ContentPublishedColumns.PUBLISHED_CONTENT]: item['Published content'].toString(),
    });

    await this.compareUIDataWithDBRecords(snowflakeDataArray, dataMapper, ContentPublishedColumns.NAME);
  }

  async verifyDataIsLoaded(): Promise<void> {
    await this.verifyTabluarDataIsLoaded();
  }

  // Downloads CSV and validates it against Snowflake data
  async downloadAndValidateContentPublishedCSV(
    snowflakeData: Array<{
      Name: string;
      'Published content': number;
    }>,
    selectedPeriod: PeriodFilterTimeRange,
    customDates?: { customStartDate: string; customEndDate: string }
  ): Promise<{ filePath: string; fileName: string }> {
    const { filePath, fileName } = await this.downloadDataAsCSV();

    try {
      // Parse CSV to get actual headers dynamically
      const actualCSVHeaders = CSVUtils.getHeadersFromReportCSV(filePath);

      // Base CSV headers (always present)
      const baseCsvHeaders = [
        'Name',
        'Email',
        'Company name',
        'Division',
        'Department',
        'City',
        'State',
        'Country',
        'Count',
      ];

      // Build expected headers based on actual CSV headers
      const expectedCsvHeaders: string[] = [...baseCsvHeaders];
      if (actualCSVHeaders.includes('Segment')) {
        expectedCsvHeaders.splice(3, 0, 'Segment'); // Insert after 'Company name'
      }
      if (actualCSVHeaders.includes('User category')) {
        // Insert User category after Country
        const countryIndex = expectedCsvHeaders.indexOf('Country');
        expectedCsvHeaders.splice(countryIndex + 1, 0, 'User category');
      }

      // Build header mapping dynamically
      const headerMapping: Record<string, string> = {
        Name: 'Name',
        Count: 'Published content',
      };

      const validationConfig: CSVValidationConfig = {
        csvPath: filePath,
        expectedDBData: snowflakeData as any,
        metricName: PEOPLE_METRICS.CONTENT_PUBLISHED.title,
        selectedPeriod,
        ...(customDates || {}),
        expectedHeaders: expectedCsvHeaders,
        transformations: {
          headerMapping,
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
