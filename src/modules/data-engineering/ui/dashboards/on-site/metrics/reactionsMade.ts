import { FrameLocator, Page } from '@playwright/test';

import { BaseOnSiteTabularMetricsComponent } from './baseOnSiteTabularMetricsComponent';

import { ON_SITE_METRICS } from '@/src/modules/data-engineering/constants/onSiteMetrics';
import { PeriodFilterTimeRange } from '@/src/modules/data-engineering/constants/periodFilterTimeRange';
import { CSVValidationConfig, CSVValidationUtil } from '@/src/modules/data-engineering/utils/csvValidationUtil';

export enum ReactionsMadeColumns {
  NAME = 'Name',
  INTERACTIONS_COUNT = 'Interactions Count',
}

export class ReactionsMade extends BaseOnSiteTabularMetricsComponent {
  constructor(page: Page, iframe: FrameLocator) {
    super(page, iframe, ON_SITE_METRICS.REACTIONS_MADE.title, ON_SITE_METRICS.REACTIONS_MADE.subtitle);
  }

  async verifyUIDataMatchesWithSnowflakeData(
    snowflakeDataArray: Array<{
      'Full name': string;
      'Interaction count': number;
    }>
  ): Promise<void> {
    const dataMapper = (item: any) => ({
      [ReactionsMadeColumns.NAME]: item['Full name'],
      [ReactionsMadeColumns.INTERACTIONS_COUNT]: item['Interaction count'].toString(),
    });

    await this.compareUIDataWithDBRecords(snowflakeDataArray, dataMapper, ReactionsMadeColumns.NAME);
  }

  async verifyDataIsLoaded(): Promise<void> {
    await this.verifyTabluarDataIsLoaded();
  }

  // Downloads CSV and validates it against Snowflake data
  async downloadAndValidateReactionsMadeCSV(
    snowflakeData: Array<{
      'Full name': string;
      'Interacted by user code': string;
      'Audience role': string | null;
      'Site name': string;
      'Site role': string | null;
      City: string | null;
      Department: string | null;
      Email: string | null;
      'Phone number': string | null;
      State: string | null;
      'Job title': string | null;
      Country: string | null;
      'Interaction count': number;
    }>,
    selectedPeriod: PeriodFilterTimeRange,
    customDates?: { customStartDate: string; customEndDate: string }
  ): Promise<{ filePath: string; fileName: string }> {
    const { filePath, fileName } = await this.downloadDataAsCSV();

    try {
      // Normalize DB data: convert null and "Undefined" to empty string for nullable fields
      // to match CSV blank values
      const normalizeValue = (value: string | null | undefined): string => {
        if (value === null || value === undefined || value === 'Undefined' || value === '') {
          return '';
        }
        return value;
      };

      const normalizedDBData = snowflakeData.map(record => ({
        ...record,
        'Phone number': normalizeValue(record['Phone number']),
        'Audience role': normalizeValue(record['Audience role']),
        'Site role': normalizeValue(record['Site role']),
        City: normalizeValue(record.City),
        Department: normalizeValue(record.Department),
        Email: normalizeValue(record.Email),
        State: normalizeValue(record.State),
        'Job title': normalizeValue(record['Job title']),
        Country: normalizeValue(record.Country),
      }));

      // Expected CSV headers based on the query
      const expectedCsvHeaders = [
        'Name',
        'Interacted By User Code',
        'Audience role',
        'Site name',
        'Site role',
        'City',
        'Department',
        'Email',
        'Phone number',
        'State',
        'Job title',
        'Country',
        'Count',
      ];

      const validationConfig: CSVValidationConfig = {
        csvPath: filePath,
        expectedDBData: normalizedDBData as any,
        metricName: ON_SITE_METRICS.REACTIONS_MADE.title,
        selectedPeriod,
        ...(customDates || {}),
        expectedHeaders: expectedCsvHeaders,
        transformations: {
          headerMapping: {
            Name: 'Full name',
            'Interacted By User Code': 'Interacted by user code',
            'Audience role': 'Audience role',
            'Site name': 'Site name',
            'Site role': 'Site role',
            City: 'City',
            Department: 'Department',
            Email: 'Email',
            'Phone number': 'Phone number',
            State: 'State',
            'Job title': 'Job title',
            Country: 'Country',
            Count: 'Interaction count',
          },
          // Use "Full name" as the key field for matching records
          keyFields: ['Full name'],
          // Map "Undefined" values from CSV to empty string to match normalized DB data
          valueMappings: {
            City: { Undefined: '' },
            Country: { Undefined: '' },
            Department: { Undefined: '' },
            State: { Undefined: '' },
            'Job title': { Undefined: '' },
            'Audience role': { Undefined: '' },
            'Site role': { Undefined: '' },
            'Phone number': { null: '', '': '' },
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
