import { FrameLocator, Page } from '@playwright/test';

import { PeopleDashboardTabularMetricsComponent } from './basePeopleDashboardTabularMetricsComponent';

import { CSVUtils } from '@/src/core/utils/csvUtils';
import { PEOPLE_METRICS } from '@/src/modules/data-engineering/constants/peopleMetrics';
import { PeriodFilterTimeRange } from '@/src/modules/data-engineering/constants/periodFilterTimeRange';
import { CSVValidationConfig, CSVValidationUtil } from '@/src/modules/data-engineering/utils/csvValidationUtil';

export enum ReactionsReceivedColumns {
  NAME = 'Name',
  REACTIONS_RECEIVED = 'Reactions received',
}

export class ReactionsReceived extends PeopleDashboardTabularMetricsComponent {
  constructor(page: Page, iframe: FrameLocator) {
    super(page, iframe, PEOPLE_METRICS.REACTIONS_RECEIVED.title);
  }

  async verifyUIDataMatchesWithSnowflakeData(
    snowflakeDataArray: Array<{
      Name: string;
      'Reactions received': number;
    }>
  ): Promise<void> {
    const dataMapper = (item: any) => ({
      [ReactionsReceivedColumns.NAME]: item['Name'],
      [ReactionsReceivedColumns.REACTIONS_RECEIVED]: item['Reactions received'].toString(),
    });

    await this.compareUIDataWithDBRecords(snowflakeDataArray, dataMapper, ReactionsReceivedColumns.NAME);
  }

  async verifyDataIsLoaded(): Promise<void> {
    await this.verifyTabluarDataIsLoaded();
  }

  // Downloads CSV and validates it against Snowflake data
  async downloadAndValidateReactionsReceivedCSV(
    snowflakeData: Array<{
      Name: string;
      'Reactions received': number;
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
        'Department',
        'Division',
        'City',
        'State',
        'Country',
        'Count',
      ];

      // Build expected headers based on actual CSV headers
      const expectedCsvHeaders: string[] = [...baseCsvHeaders];
      if (actualCSVHeaders.includes('Segment name') || actualCSVHeaders.includes('Segment')) {
        const segmentHeader = actualCSVHeaders.includes('Segment name') ? 'Segment name' : 'Segment';
        expectedCsvHeaders.splice(3, 0, segmentHeader); // Insert after 'Company name'
      }
      if (actualCSVHeaders.includes('User category')) {
        // Insert User category after Country
        const countryIndex = expectedCsvHeaders.indexOf('Country');
        expectedCsvHeaders.splice(countryIndex + 1, 0, 'User category');
      }

      // Build header mapping dynamically
      const headerMapping: Record<string, string> = {
        Name: 'Name',
        Count: 'Reactions received',
      };

      const validationConfig: CSVValidationConfig = {
        csvPath: filePath,
        expectedDBData: snowflakeData as any,
        metricName: PEOPLE_METRICS.REACTIONS_RECEIVED.title,
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
