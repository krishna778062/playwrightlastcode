import { FrameLocator, Page } from '@playwright/test';

import { PeopleDashboardTabularMetricsComponent } from './basePeopleDashboardTabularMetricsComponent';

import { CSVUtils } from '@/src/core/utils/csvUtils';
import { PEOPLE_METRICS } from '@/src/modules/data-engineering/constants/peopleMetrics';
import { PeriodFilterTimeRange } from '@/src/modules/data-engineering/constants/periodFilterTimeRange';
import { CSVValidationConfig, CSVValidationUtil } from '@/src/modules/data-engineering/utils/csvValidationUtil';

export enum RepliesColumns {
  NAME = 'Name',
  REPLIES = 'Replies',
}

export class Replies extends PeopleDashboardTabularMetricsComponent {
  constructor(page: Page, iframe: FrameLocator) {
    super(page, iframe, PEOPLE_METRICS.REPLIES.title);
  }

  async verifyUIDataMatchesWithSnowflakeData(
    snowflakeDataArray: Array<{
      Name: string;
      Replies: number;
    }>
  ): Promise<void> {
    const dataMapper = (item: any) => ({
      [RepliesColumns.NAME]: item['Name'],
      [RepliesColumns.REPLIES]: item['Replies'].toString(),
    });

    await this.compareUIDataWithDBRecords(snowflakeDataArray, dataMapper, RepliesColumns.NAME);
  }

  async verifyDataIsLoaded(): Promise<void> {
    await this.verifyTabluarDataIsLoaded();
  }

  // Downloads CSV and validates it against Snowflake data
  async downloadAndValidateRepliesCSV(
    snowflakeData: Array<{
      Name: string;
      Replies: number;
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
      if (actualCSVHeaders.includes('Segment') || actualCSVHeaders.includes('Segment name')) {
        const segmentHeader = actualCSVHeaders.includes('Segment') ? 'Segment' : 'Segment name';
        expectedCsvHeaders.splice(3, 0, segmentHeader);
      }
      if (actualCSVHeaders.includes('User category') || actualCSVHeaders.includes('User Category')) {
        const countryIndex = expectedCsvHeaders.indexOf('Country');
        const userCategoryHeader = actualCSVHeaders.includes('User category') ? 'User category' : 'User Category';
        expectedCsvHeaders.splice(countryIndex + 1, 0, userCategoryHeader);
      }

      const validationConfig: CSVValidationConfig = {
        csvPath: filePath,
        expectedDBData: snowflakeData as any,
        metricName: PEOPLE_METRICS.REPLIES.title,
        selectedPeriod,
        ...(customDates || {}),
        expectedHeaders: expectedCsvHeaders,
        transformations: {
          headerMapping: {
            Name: 'Name',
            Count: 'Replies',
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
