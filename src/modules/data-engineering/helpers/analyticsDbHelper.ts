import { DateHelper } from './dateHelper';
import { SnowflakeHelper } from './snowflakeHelper';

/**
 * Analytics Database Helper
 * Centralized place for all analytics-related database operations
 * Separates DB concerns from UI page objects
 */
export class AnalyticsDbHelper {
  /**
   * Executes a SQL query with standard parameters.
   * Handles both static periods and custom date ranges.
   *
   * @param query - The SQL query string
   * @param orgId - Organization ID
   * @param timePeriod - Time period filter or 'Custom'
   * @param customStartDate - Custom start date (YYYY-MM-DD format) - required if timePeriod is 'Custom'
   * @param customEndDate - Custom end date (YYYY-MM-DD format) - required if timePeriod is 'Custom'
   * @returns Promise<any[]> - Raw query results
   */
  static async executeQuery(
    query: string,
    orgId: string,
    timePeriod: string,
    customStartDate?: string,
    customEndDate?: string
  ): Promise<any[]> {
    const dateReplacements = DateHelper.getDateReplacements(timePeriod, customStartDate, customEndDate);

    return await SnowflakeHelper.runQueryWithReplacements(query, {
      orgId: orgId,
      ...dateReplacements,
    });
  }

  /**
   * Gets hero metric data from database.
   * Hero metrics are designed to return exactly 1 record with 1 numeric value.
   * This method encapsulates the business rule that hero metrics are single numbers.
   *
   * @param query - The SQL query string (should return 1 record)
   * @param orgId - Organization ID
   * @param timePeriod - Time period filter or 'Custom'
   * @param customStartDate - Custom start date (YYYY-MM-DD format) - required if timePeriod is 'Custom'
   * @param customEndDate - Custom end date (YYYY-MM-DD format) - required if timePeriod is 'Custom'
   * @returns Promise<number> - The hero metric value
   */
  static async getHeroMetricDataFromDB(
    query: string,
    orgId: string,
    timePeriod: string,
    customStartDate?: string,
    customEndDate?: string
  ): Promise<number> {
    const results = await this.executeQuery(query, orgId, timePeriod, customStartDate, customEndDate);

    // Business rule: Hero metrics always return 1 record with 1 numeric value
    if (results.length === 0) return 0;
    const firstResult = results[0];
    const dbValue = Object.values(firstResult)[0];
    return typeof dbValue === 'string' ? parseInt(dbValue, 10) : Number(dbValue);
  }

  /**
   * Compares hero metric UI value with database value.
   * Handles the common pattern of UI showing formatted numbers (1,234) vs DB raw numbers (1234).
   *
   * @param params - Object containing all parameters
   * @param params.uiValue - The UI metric value (e.g., "1,234")
   * @param params.query - The SQL query string
   * @param params.orgId - Organization ID
   * @param params.timePeriod - Time period filter or 'Custom'
   * @param params.customStartDate - Custom start date (YYYY-MM-DD format) - required if timePeriod is 'Custom'
   * @param params.customEndDate - Custom end date (YYYY-MM-DD format) - required if timePeriod is 'Custom'
   * @returns Promise<{ uiValue: number; dbValue: number; match: boolean }> - Comparison result
   */
  static async compareHeroMetricWithDB(params: {
    uiValue: string;
    query: string;
    orgId: string;
    timePeriod: string;
    customStartDate?: string;
    customEndDate?: string;
  }): Promise<{ uiValue: number; dbValue: number; match: boolean }> {
    const dbValue = await this.getHeroMetricDataFromDB(
      params.query,
      params.orgId,
      params.timePeriod,
      params.customStartDate,
      params.customEndDate
    );
    const numericUiValue = parseInt(params.uiValue.replace(/,/g, ''), 10);

    return {
      uiValue: numericUiValue,
      dbValue: dbValue,
      match: numericUiValue === dbValue,
    };
  }

  /**
   * Gets campaign share data from database.
   * Campaign share queries return complex data with multiple columns.
   * This method encapsulates the business rule for campaign share data structure.
   *
   * @param query - The SQL query string (should return campaign share data)
   * @param orgId - Organization ID
   * @param timePeriod - Time period filter or 'Custom'
   * @param customStartDate - Custom start date (YYYY-MM-DD format) - required if timePeriod is 'Custom'
   * @param customEndDate - Custom end date (YYYY-MM-DD format) - required if timePeriod is 'Custom'
   * @returns Promise<any[]> - Campaign share data records
   */
  static async getCampaignShareDataFromDB(
    query: string,
    orgId: string,
    timePeriod: string,
    customStartDate?: string,
    customEndDate?: string
  ): Promise<any[]> {
    return await this.executeQuery(query, orgId, timePeriod, customStartDate, customEndDate);
  }

  /**
   * Checks if campaign share data is available (non-zero values)
   * @param dbResult - Database result array
   * @returns boolean - True if data is available
   */
  static isCampaignShareDataAvailable(dbResult: any[]): boolean {
    if (dbResult.length === 0) {
      return false;
    }

    const data = dbResult[0];
    return data.TOTAL_SHARE > 0 || data.FACEBOOK_SHARE > 0 || data.LINKEDIN_SHARE > 0 || data.TWITTER_SHARE > 0;
  }

  /**
   * Converts database result to UI-compatible array format
   * @param dbData - Database result object
   * @returns string[][] - Array of [platform, count, percentage] tuples
   */
  static convertCampaignShareDataToArray(dbData: any): string[][] {
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
