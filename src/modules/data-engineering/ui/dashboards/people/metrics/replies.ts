import { FrameLocator, Page } from '@playwright/test';

import { PeopleDashboardTabularMetricsComponent } from './basePeopleDashboardTabularMetricsComponent';

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
      const validationConfig: CSVValidationConfig = {
        csvPath: filePath,
        expectedDBData: snowflakeData as any,
        metricName: PEOPLE_METRICS.REPLIES.title,
        selectedPeriod,
        ...(customDates || {}),
        expectedHeaders: [
          'Name',
          'Email',
          'Company name',
          'Segment',
          'Division',
          'Department',
          'City',
          'State',
          'Country',
          'User category',
          'Count',
        ],
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
