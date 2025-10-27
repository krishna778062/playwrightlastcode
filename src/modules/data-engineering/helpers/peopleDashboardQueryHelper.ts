import { BaseAnalyticsQueryHelper } from './baseAnalyticsQueryHelper';
import { SnowflakeHelper } from './snowflakeHelper';

/**
 * People Dashboard Query Helper
 * Provides database operations specific to the People dashboard
 * Extends BaseAnalyticsQueryHelper for common operations
 */
export class PeopleDashboardQueryHelper extends BaseAnalyticsQueryHelper {
  constructor(snowflakeHelper: SnowflakeHelper, orgId: string) {
    super(snowflakeHelper, orgId);
  }

  /**
   * Gets total users count from database
   * Note: This query doesn't use date filters as it counts current active users
   * @param query - SQL query string for total users count
   * @returns Promise<number> - The total users count
   */
  async getTotalUsersCount(query: string): Promise<number> {
    const results = await this.snowflakeHelper.runQueryWithReplacements(query, {
      orgId: this.orgId,
    });

    if (results.length === 0) return 0;
    const firstResult = results[0];
    const dbValue = Object.values(firstResult)[0];
    return typeof dbValue === 'string' ? parseInt(dbValue, 10) : Number(dbValue);
  }

  /**
   * Gets departments count from database
   * Note: This query doesn't use date filters as it counts current departments
   * @param query - SQL query string for departments count
   * @returns Promise<number> - The departments count
   */
  async getDepartmentsCount(query: string): Promise<number> {
    const results = await this.snowflakeHelper.runQueryWithReplacements(query, {
      orgId: this.orgId,
    });

    if (results.length === 0) return 0;
    const firstResult = results[0];
    const dbValue = Object.values(firstResult)[0];
    return typeof dbValue === 'string' ? parseInt(dbValue, 10) : Number(dbValue);
  }

  /**
   * Gets locations count from database
   * Note: This query doesn't use date filters as it counts current locations
   * @param query - SQL query string for locations count
   * @returns Promise<number> - The locations count
   */
  async getLocationsCount(query: string): Promise<number> {
    const results = await this.snowflakeHelper.runQueryWithReplacements(query, {
      orgId: this.orgId,
    });

    if (results.length === 0) return 0;
    const firstResult = results[0];
    const dbValue = Object.values(firstResult)[0];
    return typeof dbValue === 'string' ? parseInt(dbValue, 10) : Number(dbValue);
  }

  /**
   * Gets user category count from database
   * Note: This query doesn't use date filters and excludes N/A categories
   * @param query - SQL query string for user category count
   * @returns Promise<number> - The user category count
   */
  async getUserCategoryCount(query: string): Promise<number> {
    const results = await this.snowflakeHelper.runQueryWithReplacements(query, {
      orgId: this.orgId,
    });

    if (results.length === 0) return 0;
    const firstResult = results[0];
    const dbValue = Object.values(firstResult)[0];
    return typeof dbValue === 'string' ? parseInt(dbValue, 10) : Number(dbValue);
  }
}
