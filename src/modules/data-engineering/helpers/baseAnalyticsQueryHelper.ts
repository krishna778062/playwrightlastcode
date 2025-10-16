import { DateHelper } from './dateHelper';
import { SnowflakeHelper } from './snowflakeHelper';

/**
 * Base Analytics Query Helper
 * Provides common database operations that all dashboard query helpers can use
 * Follows the Template Method pattern - common operations with dashboard-specific extensions
 */
export abstract class BaseAnalyticsQueryHelper {
  readonly snowflakeHelper: SnowflakeHelper;
  readonly orgId: string;

  constructor(snowflakeHelper: SnowflakeHelper, orgId: string) {
    this.snowflakeHelper = snowflakeHelper;
    this.orgId = orgId;
  }

  /**
   * Executes a SQL query with standard parameters.
   * Handles both static periods and custom date ranges.
   *
   * @param query - The SQL query string
   * @param timePeriod - Time period filter or 'Custom'
   * @param customStartDate - Custom start date (YYYY-MM-DD format) - required if timePeriod is 'Custom'
   * @param customEndDate - Custom end date (YYYY-MM-DD format) - required if timePeriod is 'Custom'
   * @returns Promise<any[]> - Raw query results
   */
  async executeQuery(
    query: string,
    timePeriod: string,
    customStartDate?: string,
    customEndDate?: string
  ): Promise<any[]> {
    const dateReplacements = DateHelper.getDateReplacements(timePeriod, customStartDate, customEndDate);

    return await this.snowflakeHelper.runQueryWithReplacements(query, {
      orgId: this.orgId,
      ...dateReplacements,
    });
  }

  /**
   * Gets hero metric data from database.
   * Hero metrics are designed to return exactly 1 record with 1 numeric value.
   * This method encapsulates the business rule that hero metrics are single numbers.
   *
   * @param query - The SQL query string (should return 1 record)
   * @param timePeriod - Time period filter or 'Custom'
   * @param customStartDate - Custom start date (YYYY-MM-DD format) - required if timePeriod is 'Custom'
   * @param customEndDate - Custom end date (YYYY-MM-DD format) - required if timePeriod is 'Custom'
   * @returns Promise<number> - The hero metric value
   */
  async getHeroMetricDataFromDB(
    query: string,
    timePeriod: string,
    customStartDate?: string,
    customEndDate?: string
  ): Promise<number> {
    const results = await this.executeQuery(query, timePeriod, customStartDate, customEndDate);

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
   * @param params.timePeriod - Time period filter or 'Custom'
   * @param params.customStartDate - Custom start date (YYYY-MM-DD format) - required if timePeriod is 'Custom'
   * @param params.customEndDate - Custom end date (YYYY-MM-DD format) - required if timePeriod is 'Custom'
   * @returns Promise<{ uiValue: number; dbValue: number; match: boolean }> - Comparison result
   */
  async compareHeroMetricWithDB(params: {
    uiValue: string;
    query: string;
    timePeriod: string;
    customStartDate?: string;
    customEndDate?: string;
  }): Promise<{ uiValue: number; dbValue: number; match: boolean }> {
    const dbValue = await this.getHeroMetricDataFromDB(
      params.query,
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
}
