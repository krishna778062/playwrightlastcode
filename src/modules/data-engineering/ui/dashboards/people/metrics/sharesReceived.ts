import { FrameLocator, Page } from '@playwright/test';

import { PEOPLE_METRICS } from '@/src/modules/data-engineering/constants/peopleMetrics';
import { PeriodFilterTimeRange } from '@/src/modules/data-engineering/constants/periodFilterTimeRange';
import { TabluarMetricsComponent } from '@/src/modules/data-engineering/ui/components/tabluarMetricsComponent';
import { CSVValidationConfig, CSVValidationUtil } from '@/src/modules/data-engineering/utils/csvValidationUtil';

export enum SharesReceivedColumns {
  NAME = 'Name',
  SHARES_RECEIVED = 'Shares received',
}

export class SharesReceived extends TabluarMetricsComponent {
  constructor(page: Page, iframe: FrameLocator) {
    super(page, iframe, PEOPLE_METRICS.SHARES_RECEIVED.title);
  }

  async verifyUIDataMatchesWithSnowflakeData(
    snowflakeDataArray: Array<{
      Name: string;
      'Shares received': number;
    }>
  ): Promise<void> {
    const dataMapper = (item: any) => ({
      [SharesReceivedColumns.NAME]: item['Name'],
      [SharesReceivedColumns.SHARES_RECEIVED]: item['Shares received'].toString(),
    });

    await this.compareUIDataWithDBRecords(snowflakeDataArray, dataMapper, SharesReceivedColumns.NAME);
  }

  async verifyDataIsLoaded(): Promise<void> {
    await this.verifyTabluarDataIsLoaded();
  }

  // Downloads CSV and validates it against Snowflake data
  async downloadAndValidateSharesReceivedCSV(
    snowflakeData: Array<{
      Name: string;
      'Shares received': number;
    }>,
    selectedPeriod: PeriodFilterTimeRange,
    customDates?: { customStartDate: string; customEndDate: string }
  ): Promise<{ filePath: string; fileName: string }> {
    const { filePath, fileName } = await this.downloadDataAsCSV();

    try {
      const validationConfig: CSVValidationConfig = {
        csvPath: filePath,
        expectedDBData: snowflakeData as any,
        metricName: PEOPLE_METRICS.SHARES_RECEIVED.title,
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
            Count: 'Shares received',
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
