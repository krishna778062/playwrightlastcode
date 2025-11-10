import { FrameLocator, Page } from '@playwright/test';

import { PEOPLE_METRICS } from '@/src/modules/data-engineering/constants/peopleMetrics';
import { PeriodFilterTimeRange } from '@/src/modules/data-engineering/constants/periodFilterTimeRange';
import { TabluarMetricsComponent } from '@/src/modules/data-engineering/ui/components/tabluarMetricsComponent';
import { CSVValidationConfig, CSVValidationUtil } from '@/src/modules/data-engineering/utils/csvValidationUtil';

export enum ProfileViewsColumns {
  NAME = 'Name',
  PROFILE_VIEWS = 'Profile views',
}

export class ProfileViews extends TabluarMetricsComponent {
  constructor(page: Page, iframe: FrameLocator) {
    super(page, iframe, PEOPLE_METRICS.PROFILE_VIEWS.title);
  }

  async verifyUIDataMatchesWithSnowflakeData(
    snowflakeDataArray: Array<{
      Name: string;
      'Profile views': number;
    }>
  ): Promise<void> {
    const dataMapper = (item: any) => ({
      [ProfileViewsColumns.NAME]: item['Name'],
      [ProfileViewsColumns.PROFILE_VIEWS]: item['Profile views'].toString(),
    });

    await this.compareUIDataWithDBRecords(snowflakeDataArray, dataMapper, ProfileViewsColumns.NAME);
  }

  async verifyDataIsLoaded(): Promise<void> {
    await this.verifyTabluarDataIsLoaded();
  }

  // Downloads CSV and validates it against Snowflake data
  async downloadAndValidateProfileViewsCSV(
    snowflakeData: Array<{
      Name: string;
      'Profile views': number;
    }>,
    selectedPeriod: PeriodFilterTimeRange,
    customDates?: { customStartDate: string; customEndDate: string }
  ): Promise<{ filePath: string; fileName: string }> {
    const { filePath, fileName } = await this.downloadDataAsCSV();

    try {
      const validationConfig: CSVValidationConfig = {
        csvPath: filePath,
        expectedDBData: snowflakeData as any,
        metricName: PEOPLE_METRICS.PROFILE_VIEWS.title,
        selectedPeriod,
        ...(customDates || {}),
        expectedHeaders: [
          'Name',
          'Email',
          'Company name',
          'Division',
          'Department',
          'City',
          'State',
          'Country',
          'User category',
          'Segment',
          'Count',
        ],
        transformations: {
          headerMapping: {
            Name: 'Name',
            Count: 'Profile views',
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
