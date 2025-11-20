import { FrameLocator, Page } from '@playwright/test';

import { PeopleDashboardTabularMetricsComponent } from './basePeopleDashboardTabularMetricsComponent';

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
      const validationConfig: CSVValidationConfig = {
        csvPath: filePath,
        expectedDBData: snowflakeData as any,
        metricName: PEOPLE_METRICS.REACTIONS_RECEIVED.title,
        selectedPeriod,
        ...(customDates || {}),
        expectedHeaders: [
          'Name',
          'Email',
          'Company name',
          'Segment name',
          'Department',
          'Division',
          'City',
          'State',
          'Country',
          'User category',
          'Count',
        ],
        transformations: {
          headerMapping: {
            Name: 'Name',
            Count: 'Reactions received',
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
