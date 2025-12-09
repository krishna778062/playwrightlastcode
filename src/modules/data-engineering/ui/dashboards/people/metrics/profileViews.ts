import { FrameLocator, Page } from '@playwright/test';

import { PeopleDashboardTabularMetricsComponent } from './basePeopleDashboardTabularMetricsComponent';

import { CSVUtils } from '@/src/core/utils/csvUtils';
import { PEOPLE_METRICS } from '@/src/modules/data-engineering/constants/peopleMetrics';
import { PeriodFilterTimeRange } from '@/src/modules/data-engineering/constants/periodFilterTimeRange';
import { CSVValidationConfig, CSVValidationUtil } from '@/src/modules/data-engineering/utils/csvValidationUtil';

export enum ProfileViewsColumns {
  NAME = 'Name',
  PROFILE_VIEWS = 'Profile views',
}

export class ProfileViews extends PeopleDashboardTabularMetricsComponent {
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
      Email: string;
      'Profile views': number;
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
        Email: 'Email',
        Count: 'Profile views',
      };

      const validationConfig: CSVValidationConfig = {
        csvPath: filePath,
        expectedDBData: snowflakeData as any,
        metricName: PEOPLE_METRICS.PROFILE_VIEWS.title,
        selectedPeriod,
        ...(customDates || {}),
        expectedHeaders: expectedCsvHeaders,
        transformations: {
          headerMapping,
          // Use composite key (Name + Email) for matching since names can be duplicate
          // This ensures we match the correct user when multiple users have the same name
          keyFields: ['Name', 'Email'],
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
