import { expect, FrameLocator, Page, test } from '@playwright/test';

import { PEOPLE_METRICS } from '@/src/modules/data-engineering/constants/peopleMetrics';
import { TabluarMetricsComponent } from '@/src/modules/data-engineering/ui/components/tabluarMetricsComponent';

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
}
