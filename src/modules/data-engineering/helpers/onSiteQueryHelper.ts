import { OnSiteSql } from '../sqlQueries/onSite';

import { BaseAnalyticsQueryHelper, FilterOptions } from './baseAnalyticsQueryHelper';
import { DateHelper } from './dateHelper';
import { SnowflakeHelper } from './snowflakeHelper';

export interface OnSiteFilterOptions extends FilterOptions {
  siteCode: string;
  interactionTypeCode?: string | string[]; // Can be single code or array for multiple codes
}

/**
 * On-Site Analytics Query Helper
 * Handles all database operations specific to the On-Site analytics page
 * Extends BaseAnalyticsQueryHelper to inherit common database operations
 */
export class OnSiteQueryHelper extends BaseAnalyticsQueryHelper {
  constructor(snowflakeHelper: SnowflakeHelper, orgId: string) {
    super(snowflakeHelper, orgId);
  }

  /**
   * Transforms an on-site query by replacing placeholders including siteCode and interactionTypeCode
   * @param baseQuery - The metric-specific query (with SELECT clause and placeholders)
   * @param filterBy - Filter options including time period, siteCode, and interactionTypeCode
   */
  private async transformOnSiteQuery({
    baseQuery,
    filterBy,
  }: {
    baseQuery: string;
    filterBy: OnSiteFilterOptions;
  }): Promise<string> {
    // Handle date replacements
    const dateReplacements = DateHelper.getDateReplacements(
      filterBy.timePeriod,
      filterBy.customStartDate,
      filterBy.customEndDate
    );

    // Replace all placeholders in base query
    let query = baseQuery
      .replace(/{tenantCode}/g, filterBy.tenantCode)
      .replace(/{startDate}/g, dateReplacements.startDate)
      .replace(/{endDate}/g, dateReplacements.endDate)
      .replace(/{siteCode}/g, filterBy.siteCode);

    // Replace interactionTypeCode if provided
    if (filterBy.interactionTypeCode) {
      // Handle both single code and array of codes
      const codes = Array.isArray(filterBy.interactionTypeCode)
        ? filterBy.interactionTypeCode.map(code => `'${code}'`).join(', ')
        : `'${filterBy.interactionTypeCode}'`;
      query = query.replace(/{interactionTypeCode}/g, codes);
    }

    return query;
  }

  /**
   * Gets reactions made data from database with filters applied
   * @param filterBy - Filter options including time period, siteCode, and interactionTypeCode
   * @returns Promise<any[]> - Reactions made data records
   */
  async getReactionsMadeDataFromDBWithFilters({ filterBy }: { filterBy: OnSiteFilterOptions }): Promise<any[]> {
    const finalQuery = await this.transformOnSiteQuery({
      baseQuery: OnSiteSql.REACTIONS_MADE,
      filterBy,
    });
    return await this.executeQuery(finalQuery);
  }

  /**
   * Gets reactions received data from database with filters applied
   * @param filterBy - Filter options including time period, siteCode, and interactionTypeCode
   * @returns Promise<any[]> - Reactions received data records
   */
  async getReactionsReceivedDataFromDBWithFilters({ filterBy }: { filterBy: OnSiteFilterOptions }): Promise<any[]> {
    const finalQuery = await this.transformOnSiteQuery({
      baseQuery: OnSiteSql.REACTIONS_RECEIVED,
      filterBy,
    });
    return await this.executeQuery(finalQuery);
  }

  /**
   * Gets most popular content data from database with filters applied
   * @param filterBy - Filter options including time period and siteCode
   * @returns Promise<any[]> - Most popular content data records
   */
  async getMostPopularDataFromDBWithFilters({ filterBy }: { filterBy: OnSiteFilterOptions }): Promise<any[]> {
    const finalQuery = await this.transformOnSiteQuery({
      baseQuery: OnSiteSql.MOST_POPULAR,
      filterBy,
    });
    return await this.executeQuery(finalQuery);
  }

  /**
   * Gets content referrals data from database with filters applied
   * @param filterBy - Filter options including time period and siteCode
   * @returns Promise<any[]> - Content referrals data records
   */
  async getContentReferralsDataFromDBWithFilters({ filterBy }: { filterBy: OnSiteFilterOptions }): Promise<any[]> {
    const finalQuery = await this.transformOnSiteQuery({
      baseQuery: OnSiteSql.CONTENT_REFERRALS,
      filterBy,
    });
    return await this.executeQuery(finalQuery);
  }

  /**
   * Gets most content published data from database with filters applied
   * @param filterBy - Filter options including time period and siteCode
   * @returns Promise<any[]> - Most content published data records
   */
  async getMostContentPublishedDataFromDBWithFilters({ filterBy }: { filterBy: OnSiteFilterOptions }): Promise<any[]> {
    const finalQuery = await this.transformOnSiteQuery({
      baseQuery: OnSiteSql.MOST_CONTENT_PUBLISHED,
      filterBy,
    });
    return await this.executeQuery(finalQuery);
  }

  /**
   * Gets most viewed content data from database with filters applied
   * @param filterBy - Filter options including time period and siteCode
   * @returns Promise<any[]> - Most viewed content data records
   */
  async getMostViewedContentDataFromDBWithFilters({ filterBy }: { filterBy: OnSiteFilterOptions }): Promise<any[]> {
    const finalQuery = await this.transformOnSiteQuery({
      baseQuery: OnSiteSql.MOST_VIEWED_CONTENT,
      filterBy,
    });
    return await this.executeQuery(finalQuery);
  }

  /**
   * Gets site code from database based on tenant code and date range
   * Returns the site with the most interactions that meets all the required interaction type criteria
   * @param filterBy - Filter options including time period and tenantCode
   * @returns Promise<string | null> - Site code (UUID) or null if no matching site found
   */
  async getSiteCodeFromDB({ filterBy }: { filterBy: FilterOptions }): Promise<string | null> {
    // Handle date replacements
    const dateReplacements = DateHelper.getDateReplacements(
      filterBy.timePeriod,
      filterBy.customStartDate,
      filterBy.customEndDate
    );

    // Replace placeholders in the query
    const query = OnSiteSql.GET_SITE_CODE.replace(/{tenantCode}/g, filterBy.tenantCode)
      .replace(/{startDate}/g, dateReplacements.startDate)
      .replace(/{endDate}/g, dateReplacements.endDate);

    const results = await this.executeQuery(query);

    if (results && results.length > 0) {
      // Try different possible column name variations
      const firstRow = results[0] as any;
      const siteCode = firstRow.SITE_CODE || firstRow.site_code || firstRow['SITE_CODE'] || firstRow['site_code'];
      return siteCode || null;
    }

    return null;
  }
}
