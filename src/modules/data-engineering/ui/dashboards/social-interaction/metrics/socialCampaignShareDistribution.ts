import { expect, FrameLocator, Page, test } from '@playwright/test';

import { SOCIAL_INTERACTION_METRICS } from '@/src/modules/data-engineering/constants/socialInteractionMetrics';
import { TabluarMetricsComponent } from '@/src/modules/data-engineering/ui/components/tabluarMetricsComponent';

/**
 * Column names for the Social Campaign Share Distribution table
 */
export enum SocialCampaignDataColumns {
  SOCIAL_PLATFORM = 'Social platform',
  SHARE_COUNT = 'Share count',
  PLATFORM_SHARE_CONTRIBUTION = 'Platform share contribution (%)',
}

export class SocialCampaignShareDistribution extends TabluarMetricsComponent {
  constructor(page: Page, iframe: FrameLocator) {
    super(page, iframe, SOCIAL_INTERACTION_METRICS.SOCIAL_CAMPAIGN_SHARE_DISTRIBUTION.title);
  }

  /**
   * Verifies that the social campaign share data matches the snowflake data
   * Uses the robust validation from base component
   * @param snowflakeDataArray - The snowflake data array
   */
  async verifyUIDataMatchesWithSnowflakeData(
    snowflakeDataArray: Array<{
      'Social platform': string;
      'Share count': number;
      'Platform share contribution (%)': string;
    }>
  ): Promise<void> {
    // Helper to get case-insensitive property value
    const getCaseInsensitiveValue = (obj: any, key: string): any => {
      const foundKey = Object.keys(obj).find(k => k.toLowerCase() === key.toLowerCase());
      return foundKey ? obj[foundKey] : obj[key];
    };

    // Define data mapper function
    const dataMapper = (item: any) => ({
      [SocialCampaignDataColumns.SOCIAL_PLATFORM]: getCaseInsensitiveValue(item, 'Social platform'),
      [SocialCampaignDataColumns.SHARE_COUNT]: getCaseInsensitiveValue(item, 'Share count').toString(),
      [SocialCampaignDataColumns.PLATFORM_SHARE_CONTRIBUTION]: getCaseInsensitiveValue(
        item,
        'Platform share contribution (%)'
      ),
    });

    // Use the generic validation method from base component
    await this.compareUIDataWithDBRecords(snowflakeDataArray, dataMapper, SocialCampaignDataColumns.SOCIAL_PLATFORM);
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
    await this.drillDownOnCell({ column: SocialCampaignDataColumns.SOCIAL_PLATFORM, value: platform }, targetColumn);
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
