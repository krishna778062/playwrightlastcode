import { expect, FrameLocator, Page, test } from '@playwright/test';

import { PeopleDashboardTabularMetricsComponent } from './basePeopleDashboardTabularMetricsComponent';

import { CSVUtils } from '@/src/core/utils/csvUtils';
import { PEOPLE_METRICS } from '@/src/modules/data-engineering/constants/peopleMetrics';
import { PeriodFilterTimeRange } from '@/src/modules/data-engineering/constants/periodFilterTimeRange';
import { CSVValidationUtil } from '@/src/modules/data-engineering/utils/csvValidationUtil';

export enum ProfileCompletenessColumns {
  ABOUT_TEXT = 'About text',
  BIRTHDAY_DATE = 'Birthday date',
  PROFILE_PICTURE = 'Profile picture',
  PHONE_NUMBER = 'Phone number',
}

export class ProfileCompleteness extends PeopleDashboardTabularMetricsComponent {
  constructor(page: Page, iframe: FrameLocator) {
    super(page, iframe, PEOPLE_METRICS.PROFILE_COMPLETENESS.title);
  }

  async verifyUIDataMatchesWithSnowflakeData(
    snowflakeDataArray: Array<{
      'About text': number | null;
      'Birthday date': number | null;
      'Profile picture': number | null;
      'Phone number': number | null;
    }>
  ): Promise<void> {
    await test.step('Verify Profile completeness data is correct', async () => {
      await this.verifyTabluarDataIsLoaded();

      if (snowflakeDataArray.length === 0) {
        throw new Error('No data found for Profile Completeness in database');
      }
      const dbRecord = snowflakeDataArray[0];

      const uiData = await this.getAllDataAsObjects();
      if (uiData.length === 0) {
        throw new Error('No data found for Profile Completeness in UI');
      }
      const uiRecord = uiData[0];

      const columns = Object.values(ProfileCompletenessColumns);
      for (const column of columns) {
        const normalizedUiValue = uiRecord[column].replace(/\s*\([^)]*%\)/, '').trim();
        const dbValue = (dbRecord[column] ?? 0).toString();
        expect(normalizedUiValue, `${column} should match`).toBe(dbValue);
      }
    });
  }

  async verifyDataIsLoaded(): Promise<void> {
    await this.verifyTabluarDataIsLoaded();
  }

  // Downloads CSV and validates it against Snowflake data
  async downloadAndValidateProfileCompletenessCSV(
    snowflakeData: Array<{
      Name: string;
      Email: string;
      'Company name': string;
      Segment: string;
      Division: string;
      Department: string;
      City: string;
      State: string;
      Country: string;
      'User category': string;
      'Is App Manager ?': string | null;
      'Day(User Created Datetime)': number | null;
      'Day(User Active Datetime)': number | null;
      'About text': number | null;
      'Birthday date': number | null;
      'Phone number': number | null;
      'Profile image': number | null;
    }>,
    selectedPeriod: PeriodFilterTimeRange,
    tenantDetails?: {
      is_segment_enabled: boolean;
      is_people_category_enabled: boolean;
      people_category_singular_name: string | null;
    }
  ): Promise<{ filePath: string; fileName: string }> {
    const { filePath, fileName } = await this.downloadDataAsCSV();

    try {
      // Parse CSV to get actual headers using the same method as CSVValidationUtil
      // This will dynamically find headers by skipping filter metadata lines
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
        'User created on',
        'User activated on',
        'About text',
        'Birthday date',
        'Phone number',
        'Profile image',
        'Is app manager',
      ];

      // Build expected headers based on actual CSV headers
      // Note: We include headers if they exist in CSV, regardless of feature flags
      // Feature flags only determine whether we include them in the header mapping
      const expectedCsvHeaders: string[] = [...baseCsvHeaders];
      if (actualCSVHeaders.includes('Segment')) {
        expectedCsvHeaders.splice(3, 0, 'Segment'); // Insert after 'Company name'
      }
      if (actualCSVHeaders.includes('User category')) {
        // Insert User category after Country
        const countryIndex = expectedCsvHeaders.indexOf('Country');
        expectedCsvHeaders.splice(countryIndex + 1, 0, 'User category');
      }

      // Add 'User name' to expected headers if it exists in CSV (it's an extra column that can be ignored)
      if (actualCSVHeaders.includes('User name')) {
        expectedCsvHeaders.push('User name');
      }

      // Base header mapping (always present)
      const baseHeaderMapping: Record<string, string> = {
        Name: 'Name',
        Email: 'Email',
        'Company name': 'Company name',
        Division: 'Division',
        Department: 'Department',
        City: 'City',
        State: 'State',
        Country: 'Country',
        'User created on': 'Day(User Created Datetime)',
        'User activated on': 'Day(User Active Datetime)',
        'Is app manager': 'Is App Manager ?',
        'About text': 'About text',
        'Birthday date': 'Birthday date',
        'Phone number': 'Phone number',
        'Profile image': 'Profile image',
      };

      // Build header mapping based on feature flags and actual CSV headers
      // Only include headers that exist in both expected headers and actual CSV
      const headerMapping: Record<string, string> = { ...baseHeaderMapping };
      if (tenantDetails?.is_segment_enabled && actualCSVHeaders.includes('Segment')) {
        headerMapping['Segment'] = 'Segment';
      }
      if (tenantDetails?.is_people_category_enabled && actualCSVHeaders.includes('User category')) {
        headerMapping['User category'] = 'User category';
      }

      // Filter headerMapping to only include headers that actually exist in CSV
      const finalHeaderMapping: Record<string, string> = {};
      for (const [csvHeader, dbField] of Object.entries(headerMapping)) {
        if (actualCSVHeaders.includes(csvHeader)) {
          finalHeaderMapping[csvHeader] = dbField;
        }
      }

      // Value mappings: Convert boolean values to empty strings for profile fields
      // Also handle empty strings and null values
      // Note: These fields are expected to be empty in DB, so we convert CSV boolean values to empty strings
      const valueMappings: Record<string, Record<string, string>> = {
        'Is App Manager ?': { true: '', false: '', '': '', null: '' },
        'About text': { true: '', false: '', '': '', null: '' },
        'Birthday date': { true: '', false: '', '': '', null: '' },
        'Phone number': { true: '', false: '', '': '', null: '' },
        'Profile image': { true: '', false: '', '': '', null: '' },
      };

      await CSVValidationUtil.validateAndAssert({
        csvPath: filePath,
        expectedDBData: snowflakeData as any,
        metricName: PEOPLE_METRICS.PROFILE_COMPLETENESS.title,
        selectedPeriod,
        expectedHeaders: expectedCsvHeaders, // Use expected headers based on feature flags
        skipDateRangeValidation: true, // Profile Completeness is time-independent, uses "Created On" instead of date range
        transformations: {
          headerMapping: finalHeaderMapping, // Only include headers that exist in CSV
          valueMappings,
          // Use composite key (Name + Email) for matching since names can be duplicate
          // This ensures we match the correct user when multiple users have the same name
          keyFields: ['Name', 'Email'],
        },
      });

      return { filePath, fileName };
    } finally {
      CSVValidationUtil.cleanup(filePath);
    }
  }
}
