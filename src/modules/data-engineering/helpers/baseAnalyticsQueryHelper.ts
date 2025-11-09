import { TREND_ARROWS } from '../constants/benchmarkMetricConstants';
import { GroupByOnUserParameter } from '../constants/filters';

import { DateHelper, PeriodFilterOption } from './dateHelper';
import { SnowflakeHelper } from './snowflakeHelper';

// Export FilterOptions interface for reuse across all dashboard query helpers
export interface FilterOptions {
  tenantCode: string;
  timePeriod: PeriodFilterOption; // Period filter option from PeriodFilterTimeRange enum
  customStartDate?: string; // Required if timePeriod is CUSTOM
  customEndDate?: string; // Optional, defaults to current date if not provided
  locations?: string[];
  departments?: string[];
  segments?: string[];
  userCategories?: string[];
  companyName?: string[];
  groupBy?: GroupByOnUserParameter;
}

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

  /**
   *
   * This method is used to get the trend text for the metric
   * @param actualValue - actual value of the metric
   * @param benchmarkValue - benchmark value of the metric
   * @returns text as example "↑ 3.6% more than benchmark (3.9%)" or "↓ 3.6% less than benchmark (3.9%)" or "→ 3.6% equal to benchmark (3.9%)"
   */
  getTrendText(actualValue: number, benchmarkValue: number): string {
    const differenceInValue = actualValue - benchmarkValue;
    const roundedDifference = Math.round(Math.abs(differenceInValue) * 10) / 10;

    if (differenceInValue > 0) {
      return `${TREND_ARROWS.UP} ${roundedDifference}% more than benchmark (${benchmarkValue}%)`;
    } else if (differenceInValue < 0) {
      return `${TREND_ARROWS.DOWN} ${roundedDifference}% less than benchmark (${benchmarkValue}%)`;
    } else {
      return `${TREND_ARROWS.NEUTRAL} ${roundedDifference}% equal to benchmark (${benchmarkValue}%)`;
    }
  }

  // ===== GENERIC FILTER METHODS =====
  // These methods can be used by any dashboard query helper

  /**
   * Maps UI user category names to database UUIDs
   * @param userCategoryNames - Array of UI user category names (e.g., ['Adil Option1'])
   * @returns Promise<string[]> - Array of corresponding UUIDs
   */
  protected async mapUserCategoryNamesToCodes(userCategoryNames?: string[]): Promise<string[]> {
    if (!userCategoryNames || userCategoryNames.length === 0) return [];

    const mappingQuery = `
      select distinct user_category_code 
      from udl.vw_user_as_is 
      where tenant_code = '${this.orgId}' 
        and user_category_name in (${userCategoryNames.map(name => `'${name}'`).join(', ')})
    `;

    const results = await this.executeQuery(mappingQuery);
    return results.map(row => row.USER_CATEGORY_CODE).filter(code => code && code !== 'N/A');
  }

  /**
   * Transforms a base query by adding filters and date replacements ONLY
   * Does NOT add GROUP BY or ORDER BY - assumes they're already in the base query
   * Uses global replacement to handle placeholders that appear multiple times (e.g., in subqueries)
   * @param baseQuery - The metric-specific query (with SELECT clause and placeholders)
   * @param filterBy - Filter options (locations, departments, userCategories, etc.)
   */
  protected async transformQueryWithFilters({
    baseQuery,
    filterBy,
  }: {
    baseQuery: string;
    filterBy: FilterOptions;
  }): Promise<string> {
    // Handle date replacements internally
    const dateReplacements = DateHelper.getDateReplacements(
      filterBy.timePeriod,
      filterBy.customStartDate,
      filterBy.customEndDate
    );

    // Check if any user-based filters are present to determine if we need the user JOIN
    const hasUserFilters =
      (filterBy.locations && filterBy.locations.length > 0) ||
      (filterBy.departments && filterBy.departments.length > 0) ||
      (filterBy.segments && filterBy.segments.length > 0) ||
      (filterBy.userCategories && filterBy.userCategories.length > 0) ||
      (filterBy.companyName && filterBy.companyName.length > 0);

    const userJoin = hasUserFilters
      ? 'inner join simpplr_common_tenant.udl.vw_user_as_is as u on i.interacted_by_user_code = u.code and i.tenant_code = u.tenant_code'
      : '';

    // Replace all placeholders in base query using global regex to handle multiple occurrences
    let query = baseQuery
      .replace(/{tenantCode}/g, filterBy.tenantCode)
      .replace(/{startDate}/g, dateReplacements.startDate)
      .replace(/{endDate}/g, dateReplacements.endDate)
      .replace(/{userJoin}/g, userJoin)
      .replace(/{locationFilter}/g, this.addLocationFilter(filterBy.locations))
      .replace(/{departmentFilter}/g, this.addDepartmentFilter(filterBy.departments))
      .replace(/{segmentFilter}/g, this.addSegmentFilter(filterBy.segments))
      .replace(/{companyNameFilter}/g, this.addCompanyNameFilter(filterBy.companyName));

    // Handle user category mapping and replacement
    if (filterBy.userCategories && filterBy.userCategories.length > 0) {
      const userCategoryCodes = await this.mapUserCategoryNamesToCodes(filterBy.userCategories);
      query = query.replace(/{userCategoryFilter}/g, this.addUserCategoryFilter(userCategoryCodes));
    } else {
      query = query.replace(/{userCategoryFilter}/g, this.addUserCategoryFilter(filterBy.userCategories));
    }

    return query;
  }

  // ===== INDIVIDUAL FILTER METHODS =====

  protected addLocationFilter(locations?: string[]): string {
    if (!locations || locations.length === 0) return '';
    // Use LOWER() with IN for case-insensitive matching like ThoughtSpot
    const quotedValues = locations.map(v => `LOWER('${v}')`).join(', ');
    return `\n  and LOWER(u.location) in (${quotedValues})`;
  }

  protected addDepartmentFilter(departments?: string[]): string {
    if (!departments || departments.length === 0) return '';
    const quotedValues = departments.map(v => `'${v}'`).join(', ');
    return `\n  and u.department in (${quotedValues})`;
  }

  protected addSegmentFilter(segments?: string[]): string {
    if (!segments || segments.length === 0) return '';
    const quotedValues = segments.map(v => `'${v}'`).join(', ');
    return `\n  and u.segment_name in (${quotedValues})`;
  }

  protected addUserCategoryFilter(userCategories?: string[]): string {
    if (!userCategories || userCategories.length === 0) return '';
    const quotedValues = userCategories.map(v => `'${v}'`).join(', ');
    return `\n  and u.user_category_code in (${quotedValues})`;
  }

  protected addCompanyNameFilter(companyNames?: string[]): string {
    if (!companyNames || companyNames.length === 0) return '';
    const quotedValues = companyNames.map(v => `'${v}'`).join(', ');
    return `\n  and u.company_name in (${quotedValues})`;
  }
}
