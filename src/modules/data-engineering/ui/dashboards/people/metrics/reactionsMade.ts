import { FrameLocator, Page } from '@playwright/test';

import { PeopleDashboardTabularMetricsComponent } from './basePeopleDashboardTabularMetricsComponent';

import { CSVUtils } from '@/src/core/utils/csvUtils';
import { PEOPLE_METRICS } from '@/src/modules/data-engineering/constants/peopleMetrics';
import { PeriodFilterTimeRange } from '@/src/modules/data-engineering/constants/periodFilterTimeRange';
import { CSVValidationConfig, CSVValidationUtil } from '@/src/modules/data-engineering/utils/csvValidationUtil';

export enum ReactionsMadeColumns {
  NAME = 'Name',
  REACTIONS_MADE = 'Reactions made',
}

export class ReactionsMade extends PeopleDashboardTabularMetricsComponent {
  constructor(page: Page, iframe: FrameLocator) {
    super(page, iframe, PEOPLE_METRICS.REACTIONS_MADE.title);
  }

  async verifyUIDataMatchesWithSnowflakeData(
    snowflakeDataArray: Array<{
      Name: string;
      'Reactions made': number;
    }>
  ): Promise<void> {
    const dataMapper = (item: any) => ({
      [ReactionsMadeColumns.NAME]: item['Name'],
      [ReactionsMadeColumns.REACTIONS_MADE]: item['Reactions made'].toString(),
    });

    await this.compareUIDataWithDBRecords(snowflakeDataArray, dataMapper, ReactionsMadeColumns.NAME);
  }

  async verifyDataIsLoaded(): Promise<void> {
    await this.verifyTabluarDataIsLoaded();
  }

  // Downloads CSV and validates it against Snowflake data
  async downloadAndValidateReactionsMadeCSV(
    snowflakeData: Array<{
      Name: string;
      'Reactions made': number;
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
        metricName: PEOPLE_METRICS.REACTIONS_MADE.title,
        selectedPeriod,
        ...(customDates || {}),
        expectedHeaders: expectedCsvHeaders,
        transformations: {
          headerMapping: {
            Name: 'Name',
            Count: 'Reactions made',
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
