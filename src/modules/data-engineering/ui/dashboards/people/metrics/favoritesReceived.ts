import { FrameLocator, Page } from '@playwright/test';

import { PEOPLE_METRICS } from '@/src/modules/data-engineering/constants/peopleMetrics';
import { PeriodFilterTimeRange } from '@/src/modules/data-engineering/constants/periodFilterTimeRange';
import { TabluarMetricsComponent } from '@/src/modules/data-engineering/ui/components/tabluarMetricsComponent';
import { CSVValidationConfig, CSVValidationUtil } from '@/src/modules/data-engineering/utils/csvValidationUtil';

export enum FavoritesReceivedColumns {
  NAME = 'Name',
  FAVORITES_RECEIVED = 'Favorites received',
}

export class FavoritesReceived extends TabluarMetricsComponent {
  constructor(page: Page, iframe: FrameLocator) {
    super(page, iframe, PEOPLE_METRICS.FAVORITES_RECEIVED.title);
  }

  async verifyUIDataMatchesWithSnowflakeData(
    snowflakeDataArray: Array<{
      Name: string;
      'Favorites received': number;
    }>
  ): Promise<void> {
    const dataMapper = (item: any) => ({
      [FavoritesReceivedColumns.NAME]: item['Name'],
      [FavoritesReceivedColumns.FAVORITES_RECEIVED]: item['Favorites received'].toString(),
    });

    await this.compareUIDataWithDBRecords(snowflakeDataArray, dataMapper, FavoritesReceivedColumns.NAME);
  }

  async verifyDataIsLoaded(): Promise<void> {
    await this.verifyTabluarDataIsLoaded();
  }

  // Downloads CSV and validates it against Snowflake data
  async downloadAndValidateFavoritesReceivedCSV(
    snowflakeData: Array<{
      Name: string;
      'Favorites received': number;
    }>,
    selectedPeriod: PeriodFilterTimeRange,
    customDates?: { customStartDate: string; customEndDate: string }
  ): Promise<{ filePath: string; fileName: string }> {
    const { filePath, fileName } = await this.downloadDataAsCSV();

    try {
      const validationConfig: CSVValidationConfig = {
        csvPath: filePath,
        expectedDBData: snowflakeData as any,
        metricName: PEOPLE_METRICS.FAVORITES_RECEIVED.title,
        selectedPeriod,
        ...(customDates || {}),
        expectedHeaders: [
          'User name',
          'Email',
          'Company name',
          'Division',
          'Department',
          'City',
          'State',
          'Country',
          'Segment name',
          'User category',
          'Count',
        ],
        transformations: {
          headerMapping: {
            'User name': 'Name',
            Count: 'Favorites received',
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
