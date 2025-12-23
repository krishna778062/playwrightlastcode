import { MonthlyReportsSql } from '../sqlQueries/monthlyReports';

import { BaseAnalyticsQueryHelper } from './baseAnalyticsQueryHelper';
import { SnowflakeHelper } from './snowflakeHelper';

/**
 * Monthly Reports Dashboard Query Helper
 * Handles all database operations specific to the Monthly Reports dashboard
 * Extends BaseAnalyticsQueryHelper to inherit common database operations
 */
export class MonthlyReportsQueryHelper extends BaseAnalyticsQueryHelper {
  constructor(snowflakeHelper: SnowflakeHelper, orgId: string) {
    super(snowflakeHelper, orgId);
  }

  /**
   * Gets monthly reports adoption data from database
   * Note: This query doesn't use standard filters as it's based on monthly snapshots
   * @returns Promise<any[]> - Monthly reports adoption data records
   */
  async getMonthlyReportsAdoptionDataFromDB(): Promise<any[]> {
    // Replace tenant code in the query
    const finalQuery = MonthlyReportsSql.MONTHLY_REPORTS_ADOPTION.replace(/{tenantCode}/g, this.orgId);
    return await this.executeQuery(finalQuery);
  }
}
