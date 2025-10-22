import { expect, FrameLocator, Page, test } from '@playwright/test';

import { SOCIAL_INTERACTION_METRICS } from '@/src/modules/data-engineering/constants/socialInteractionMetrics';
import { TabluarMetricsComponent } from '@/src/modules/data-engineering/ui/components/tabluarMetricsComponent';

export class SocialCampaignShareDistribution extends TabluarMetricsComponent {
  constructor(page: Page, iframe: FrameLocator) {
    super(page, iframe, SOCIAL_INTERACTION_METRICS.SOCIAL_CAMPAIGN_SHARE_DISTRIBUTION.title);
  }

  /**
   * Verifies that the social campaign share data matches the snowflake data
   * @param snowflakeDataArray - The snowflake data array
   */
  async verifyDataMatchesWithSnowflakeData(
    snowflakeDataArray: Array<{
      'Social platform': string;
      'Share count': number;
      'Platform share contribution (%)': string;
    }>
  ): Promise<void> {
    await test.step(`Verify social campaign share data is correct`, async () => {
      // Verify table is loaded
      await this.verifyTabluarDataIsLoaded();

      // Get UI data as objects with column names as keys
      const uiDataObjects = await this.getAllDataAsObjects();
      console.log('UI Data Objects:', uiDataObjects);

      // Convert DB data to UI format for comparison (convert numbers to strings)
      const mappedDbData = snowflakeDataArray.map(item => ({
        'Social platform': item['Social platform'],
        'Share count': item['Share count'].toString(),
        'Platform share contribution (%)': item['Platform share contribution (%)'],
      }));
      console.log('Mapped DB Data:', mappedDbData);

      // Compare the data
      await this.compareCampaignShareData(uiDataObjects, mappedDbData);
    });
  }

  /**
   * Compares the social campaign share data with structured verification
   * @param uiData - The UI data array
   * @param dbData - The snowflake data array
   */
  private async compareCampaignShareData(
    uiData: Record<string, string>[],
    dbData: Record<string, string>[]
  ): Promise<void> {
    // Step 1: Verify record count matches exactly
    await test.step('Verify record count fetched from snowflake matches with the number of records in the UI', async () => {
      expect(uiData.length, 'UI and DB should have same number of records').toBe(dbData.length);
    });

    // Step 2: Verify column headers match exactly
    await test.step('Verify column headers fetched from snowflake matches with the column headers in the UI', async () => {
      const uiHeaders = Object.keys(uiData[0] || {});
      const dbHeaders = Object.keys(dbData[0] || {});
      expect(uiHeaders, 'UI and DB should have same column headers').toEqual(dbHeaders);
    });

    // Step 3: Verify data for each platform
    await test.step('Verify data for each platform fetched from snowflake matches with the data in the UI', async () => {
      for (const dbEntry of dbData) {
        const platform = dbEntry['Social platform'];
        console.log(`\nComparing data fetched from snowflake for social platform - ${platform}`);

        // Find matching UI entry
        const uiEntry = uiData.find(ui => ui['Social platform'] === platform);

        if (!uiEntry) {
          throw new Error(`${platform} found in snowflake but not in UI`);
        }

        console.log(`  UI:`, uiEntry);
        console.log(`  Snowflake:`, dbEntry);

        // Compare share count
        await test.step(`Comparing total share count from UI - ${uiEntry['Share count']} for ${platform} matches ${dbEntry['Share count']} in the UI`, async () => {
          expect(uiEntry['Share count'], `${platform} share count should match exactly`).toBe(dbEntry['Share count']);
        });

        // Compare percentage
        await test.step(`Comparing total percentage from UI - ${uiEntry['Platform share contribution (%)']} for ${platform} matches ${dbEntry['Platform share contribution (%)']} in the UI`, async () => {
          expect(uiEntry['Platform share contribution (%)'], `${platform} percentage should match exactly`).toBe(
            dbEntry['Platform share contribution (%)']
          );
        });
      }
    });
  }

  /**
   * Sorts the Social Campaign Share table by a specific column
   * @param columnName - The column name to sort by
   * @param direction - Sort direction ('asc' or 'desc')
   */
  async sortByColumn(columnName: string, direction: 'Ascending' | 'Descending' = 'Ascending'): Promise<void> {
    await this.sortTableByColumn(columnName, direction);
  }

  /**
   * Drills down on a specific cell in the Social Campaign Share table
   * @param platform - The platform to drill down on (e.g., 'Twitter')
   * @param targetColumn - The column to drill down on (e.g., 'Share count')
   */
  async drillDownOnPlatform(platform: string, targetColumn: string): Promise<void> {
    await this.drillDownOnCell({ column: 'Social platform', value: platform }, targetColumn);
  }

  /**
   * Verifies that the social campaign share data is loaded
   */
  async verifyDataIsLoaded(): Promise<void> {
    await this.verifyTabluarDataIsLoaded();
  }

  /**
   * Verifies that the social campaign share has the correct number of columns
   */
  async verifyNumberOfColumnsIsCorrect(): Promise<void> {
    await test.step(`Verify social campaign share number of columns is correct`, async () => {
      const headers = await this.getHeaders();
      expect(headers.length, `Social campaign share data should have 3 columns`).toBe(3);
    });
  }
}
