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
   * Executes a complete SQL query with filters already applied.
   * Used by the new query builder approach.
   *
   * @param query - The complete SQL query string with all filters applied
   * @returns Promise<any[]> - Raw query results
   */
  async executeQuery(query: string): Promise<any[]> {
    return await this.snowflakeHelper.runQueryWithReplacements(query, {
      orgId: this.orgId,
    });
  }

  /**
   * Gets hero metric data from database.
   * Hero metrics are designed to return exactly 1 record with 1 numeric value.
   * This method encapsulates the business rule that hero metrics are single numbers.
   *
   * @param query - The complete SQL query string with all filters applied (should return 1 record)
   * @returns Promise<number> - The hero metric value
   */
  async getHeroMetricDataFromDB(query: string): Promise<number> {
    const results = await this.executeQuery(query);

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
   * @param params.query - The complete SQL query string with all filters applied
   * @returns Promise<{ uiValue: number; dbValue: number; match: boolean }> - Comparison result
   */
  async compareHeroMetricWithDB(params: {
    uiValue: string;
    query: string;
  }): Promise<{ uiValue: number; dbValue: number; match: boolean }> {
    const dbValue = await this.getHeroMetricDataFromDB(params.query);
    const numericUiValue = parseInt(params.uiValue.replace(/,/g, ''), 10);

    return {
      uiValue: numericUiValue,
      dbValue: dbValue,
      match: numericUiValue === dbValue,
    };
  }
}
