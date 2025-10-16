import { test } from '@playwright/test';

import { BaseAnalyticsQueryHelper } from './baseAnalyticsQueryHelper';
import { SnowflakeHelper } from './snowflakeHelper';

/**
 * Social Interaction Dashboard Query Helper
 * Handles all database operations specific to the Social Interaction dashboard
 * Extends BaseAnalyticsQueryHelper to inherit common database operations
 */
export class SocialInteractionDashboardQueryHelper extends BaseAnalyticsQueryHelper {
  constructor(snowflakeHelper: SnowflakeHelper, orgId: string) {
    super(snowflakeHelper, orgId);
  }
  /**
   * Gets campaign share data from database.
   * Campaign share queries return complex data with multiple columns.
   * This method encapsulates the business rule for campaign share data structure.
   *
   * @param query - The SQL query string (should return campaign share data)
   * @param timePeriod - Time period filter or 'Custom'
   * @param customStartDate - Custom start date (YYYY-MM-DD format) - required if timePeriod is 'Custom'
   * @param customEndDate - Custom end date (YYYY-MM-DD format) - required if timePeriod is 'Custom'
   * @returns Promise<any[]> - Campaign share data records
   */
  async getCampaignShareDataFromDB(
    query: string,
    timePeriod: string,
    customStartDate?: string,
    customEndDate?: string
  ): Promise<any[]> {
    return await test.step(`Get campaign share data from database`, async () => {
      return await this.executeQuery(query, timePeriod, customStartDate, customEndDate);
    });
  }

  /**
   * Checks if campaign share data is available (non-zero values)
   * Social Interaction specific business logic for determining data availability
   *
   * @param dbResult - Database result array
   * @returns boolean - True if data is available
   */
  isCampaignShareDataAvailable(dbResult: any[]): boolean {
    if (dbResult.length === 0) {
      return false;
    }

    const data = dbResult[0];
    return data.TOTAL_SHARE > 0 || data.FACEBOOK_SHARE > 0 || data.LINKEDIN_SHARE > 0 || data.TWITTER_SHARE > 0;
  }

  /**
   * Converts database result to UI-compatible array format
   * Social Interaction specific data transformation for campaign share data
   * Only includes entries with non-zero share counts.
   *
   * @param dbData - Database result object
   * @returns string[][] - Array of [platform, count, percentage] tuples
   */
  convertCampaignShareDataToArray(dbData: any): string[][] {
    const dbArray: string[][] = [];

    // Only add non-zero entries to DB array
    if (dbData.FACEBOOK_SHARE > 0) {
      dbArray.push(['Facebook', dbData.FACEBOOK_SHARE.toString(), `${dbData.FACEBOOK_PERCENT}%`]);
    }
    if (dbData.LINKEDIN_SHARE > 0) {
      dbArray.push(['LinkedIn', dbData.LINKEDIN_SHARE.toString(), `${dbData.LINKEDIN_PERCENT}%`]);
    }
    if (dbData.TWITTER_SHARE > 0) {
      dbArray.push(['Twitter', dbData.TWITTER_SHARE.toString(), `${dbData.TWITTER_PERCENT}%`]);
    }

    console.log('DB Data Array (non-zero only):', dbArray);
    return dbArray;
  }
}
