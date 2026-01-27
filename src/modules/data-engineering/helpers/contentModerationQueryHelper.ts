import { ContentModerationSql } from '../sqlQueries/content-moderation';

import { DateHelper, PeriodFilterOption } from './dateHelper';
import { SnowflakeHelper } from './snowflakeHelper';

/**
 * Simple filter options for Content Moderation Analytics
 * Only requires tenant code and time period (no user-based filters)
 */
export interface ContentModerationFilterOptions {
  tenantCode: string;
  timePeriod: PeriodFilterOption;
  customStartDate?: string;
  customEndDate?: string;
}

/**
 * Content Moderation Analytics Query Helper
 * Handles all database operations specific to the Content Moderation Analytics dashboard
 * Uses simplified filters (no location, department, segment filters required)
 */
export class ContentModerationQueryHelper {
  readonly snowflakeHelper: SnowflakeHelper;
  readonly orgId: string;

  constructor(snowflakeHelper: SnowflakeHelper, orgId: string) {
    this.snowflakeHelper = snowflakeHelper;
    this.orgId = orgId;
  }

  /**
   * Executes a SQL query
   */
  private async executeQuery(query: string): Promise<any[]> {
    return await this.snowflakeHelper.runQueryWithReplacements(query, {
      orgId: this.orgId,
    });
  }

  /**
   * Gets hero metric data from database (single numeric value)
   */
  private async getHeroMetricDataFromDB(query: string): Promise<number> {
    const results = await this.executeQuery(query);
    if (results.length === 0) return 0;
    const firstResult = results[0];
    const dbValue = Object.values(firstResult)[0];
    return typeof dbValue === 'string' ? parseInt(dbValue, 10) : Number(dbValue);
  }

  /**
   * Transforms query with simple date filters (no user-based filters)
   */
  private transformQueryWithFilters(baseQuery: string, filterBy: ContentModerationFilterOptions): string {
    const dateReplacements = DateHelper.getDateReplacements(
      filterBy.timePeriod,
      filterBy.customStartDate,
      filterBy.customEndDate
    );

    return baseQuery
      .replace(/{tenantCode}/g, filterBy.tenantCode)
      .replace(/{startDate}/g, dateReplacements.startDate)
      .replace(/{endDate}/g, dateReplacements.endDate);
  }

  /**
   * Gets total sources count from database with filters applied
   * @param filterBy - Filter options (tenant code and time period only)
   * @returns Promise<number> - Total sources count value
   */
  async getTotalSourcesDataFromDBWithFilters({
    filterBy,
  }: {
    filterBy: ContentModerationFilterOptions;
  }): Promise<number> {
    const finalQuery = this.transformQueryWithFilters(ContentModerationSql.Total_Sources, filterBy);
    return await this.getHeroMetricDataFromDB(finalQuery);
  }

  /**
   * Gets detected count from database with filters applied
   * @param filterBy - Filter options (tenant code and time period only)
   * @returns Promise<number> - Detected count value
   */
  async getDetectedDataFromDBWithFilters({ filterBy }: { filterBy: ContentModerationFilterOptions }): Promise<number> {
    const finalQuery = this.transformQueryWithFilters(ContentModerationSql.DETECTED, filterBy);
    return await this.getHeroMetricDataFromDB(finalQuery);
  }

  /**
   * Gets reported count from database with filters applied
   * @param filterBy - Filter options (tenant code and time period only)
   * @returns Promise<number> - Reported count value
   */
  async getReportedDataFromDBWithFilters({ filterBy }: { filterBy: ContentModerationFilterOptions }): Promise<number> {
    const finalQuery = this.transformQueryWithFilters(ContentModerationSql.REPORTED, filterBy);
    return await this.getHeroMetricDataFromDB(finalQuery);
  }

  /**
   * Gets removed count from database with filters applied
   * @param filterBy - Filter options (tenant code and time period only)
   * @returns Promise<number> - Removed count value
   */
  async getRemovedDataFromDBWithFilters({ filterBy }: { filterBy: ContentModerationFilterOptions }): Promise<number> {
    const finalQuery = this.transformQueryWithFilters(ContentModerationSql.REMOVED, filterBy);
    return await this.getHeroMetricDataFromDB(finalQuery);
  }
}
