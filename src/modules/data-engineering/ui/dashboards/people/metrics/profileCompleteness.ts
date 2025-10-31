import { expect, FrameLocator, Page, test } from '@playwright/test';

import { PEOPLE_METRICS } from '@/src/modules/data-engineering/constants/peopleMetrics';
import { PeriodFilterTimeRange } from '@/src/modules/data-engineering/constants/periodFilterTimeRange';
import { TabluarMetricsComponent } from '@/src/modules/data-engineering/ui/components/tabluarMetricsComponent';
import { CSVValidationUtil } from '@/src/modules/data-engineering/utils/csvValidationUtil';

export enum ProfileCompletenessColumns {
  ABOUT_TEXT = 'About text',
  BIRTHDAY_DATE = 'Birthday date',
  PROFILE_PICTURE = 'Profile picture',
  PHONE_NUMBER = 'Phone number',
}

export class ProfileCompleteness extends TabluarMetricsComponent {
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

      const dbRecord = snowflakeDataArray[0];
      const uiRecord = (await this.getAllDataAsObjects())[0];

      if (!dbRecord || !uiRecord) {
        throw new Error('No data found for Profile Completeness');
      }

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
    selectedPeriod: PeriodFilterTimeRange
  ): Promise<{ filePath: string; fileName: string }> {
    const { filePath, fileName } = await this.downloadDataAsCSV();

    try {
      const headers = [
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
        'Is App Manager ?',
        'Day(User Created Datetime)',
        'Day(User Active Datetime)',
        'About text',
        'Birthday date',
        'Phone number',
        'Profile image',
      ];

      const valueMappings = ['Is App Manager ?', 'About text', 'Birthday date', 'Phone number', 'Profile image'].reduce(
        (m, f) => ({ ...m, [f]: { null: '' } }),
        {} as Record<string, { null: string }>
      );

      await CSVValidationUtil.validateAndAssert({
        csvPath: filePath,
        expectedDBData: snowflakeData as any,
        metricName: PEOPLE_METRICS.PROFILE_COMPLETENESS.title,
        selectedPeriod,
        expectedHeaders: headers,
        transformations: {
          headerMapping: headers.reduce((m, h) => ({ ...m, [h]: h }), {} as Record<string, string>),
          valueMappings,
        },
      });

      return { filePath, fileName };
    } finally {
      CSVValidationUtil.cleanup(filePath);
    }
  }
}
