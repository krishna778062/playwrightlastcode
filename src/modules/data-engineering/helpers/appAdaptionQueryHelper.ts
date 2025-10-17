import { DateHelper } from './dateHelper';
import { BaseAnalyticsQueryHelper, SnowflakeHelper } from '.';

interface FilterOptions {
  tenantCode: string;
  timePeriod: string; // e.g., "Last 30 days", "Last 12 months", "Custom"
  customStartDate?: string; // Required if timePeriod is "Custom"
  customEndDate?: string; // Required if timePeriod is "Custom"
  locations?: string[];
  departments?: string[];
  segments?: string[];
  userCategories?: string[];
  companyName?: string[];
  groupBy?: 'department' | 'location' | 'user_category';
}

export class AppAdoptionDashboardQueryHelper extends BaseAnalyticsQueryHelper {
  constructor(snowflakeHelper: SnowflakeHelper, orgId: string) {
    super(snowflakeHelper, orgId);
  }

  // ===== HELPER METHODS =====

  /**
   * Maps UI user category names to database UUIDs
   * @param userCategoryNames - Array of UI user category names (e.g., ['Adil Option1'])
   * @returns Promise<string[]> - Array of corresponding UUIDs
   */
  private async mapUserCategoryNamesToCodes(userCategoryNames?: string[]): Promise<string[]> {
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
   * Transforms a base query by adding filters, date replacements, GROUP BY, and ORDER BY
   * @param baseQuery - The metric-specific query (with SELECT clause and placeholders)
   * @param filterBy - Filter options (locations, departments, userCategories, etc.)
   * @param dateReplacements - Date range replacements (startDate, endDate)
   * @param groupByParam - Group by dimension ('department', 'location', 'segment', etc.)
   * @param orderBy - Order by configuration {column, direction} (optional)
   */
  private async transformQuery({
    baseQuery,
    filterBy,
    dateReplacements,
    groupByParam,
    orderBy,
  }: {
    baseQuery: string;
    filterBy: FilterOptions;
    dateReplacements: any;
    groupByParam?: string;
    orderBy?: { column: string; direction: 'asc' | 'desc' };
  }): Promise<string> {
    // Replace placeholders in base query
    let query = baseQuery
      .replace('{tenantCode}', filterBy.tenantCode)
      .replace('{startDate}', dateReplacements.startDate)
      .replace('{endDate}', dateReplacements.endDate);

    // Add all filters (with internal mapping for user categories)
    query = await this.addAllFilters(query, filterBy);

    // Add GROUP BY if specified
    if (groupByParam) {
      query = this.addGroupBy(query, groupByParam);
    }

    // Add ORDER BY if specified
    if (orderBy) {
      query += `\n  order by ${orderBy.column} ${orderBy.direction}`;
    }

    return query;
  }

  /**
   * Adds all filter clauses to the query
   * Handles user category mapping internally if needed
   */
  private async addAllFilters(query: string, filterBy: FilterOptions): Promise<string> {
    query += this.addLocationFilter(filterBy.locations);
    query += this.addDepartmentFilter(filterBy.departments);
    query += this.addSegmentFilter(filterBy.segments);

    // Handle user category mapping internally
    if (filterBy.userCategories && filterBy.userCategories.length > 0) {
      const userCategoryCodes = await this.mapUserCategoryNamesToCodes(filterBy.userCategories);
      query += this.addUserCategoryFilter(userCategoryCodes);
    } else {
      query += this.addUserCategoryFilter(filterBy.userCategories);
    }

    query += this.addCompanyNameFilter(filterBy.companyName);
    return query;
  }

  /**
   * Adds GROUP BY clause based on groupBy parameter
   */
  private addGroupBy(query: string, groupBy?: string): string {
    if (!groupBy) return query;

    const groupByMap: Record<string, string> = {
      department: 'department',
      location: 'location',
      segment: 'segment_code',
      user_category: 'user_category_code',
      company_name: 'company_name',
    };

    const groupByColumn = groupByMap[groupBy];
    if (groupByColumn) {
      query += `\n  group by ${groupByColumn}`;
    }

    return query;
  }

  // ===== SHARED FILTER METHODS =====

  private addLocationFilter(locations?: string[]): string {
    if (!locations || locations.length === 0) return '';
    const quotedValues = locations.map(v => `'${v}'`).join(', ');
    return `\n  and u.location in (${quotedValues})`;
  }

  private addDepartmentFilter(departments?: string[]): string {
    if (!departments || departments.length === 0) return '';
    const quotedValues = departments.map(v => `'${v}'`).join(', ');
    return `\n  and u.department in (${quotedValues})`;
  }

  private addSegmentFilter(segments?: string[]): string {
    if (!segments || segments.length === 0) return '';
    const quotedValues = segments.map(v => `'${v}'`).join(', ');
    return `\n  and u.segment_code in (${quotedValues})`;
  }

  private addUserCategoryFilter(userCategories?: string[]): string {
    if (!userCategories || userCategories.length === 0) return '';
    const quotedValues = userCategories.map(v => `'${v}'`).join(', ');
    return `\n  and u.user_category_code in (${quotedValues})`;
  }

  private addCompanyNameFilter(companyNames?: string[]): string {
    if (!companyNames || companyNames.length === 0) return '';
    const quotedValues = companyNames.map(v => `'${v}'`).join(', ');
    return `\n  and u.company_name in (${quotedValues})`;
  }

  // ===== ENHANCED METHODS (With Filters) =====

  /**
   * Gets total users data from database with filters.
   * @param filterBy - Filter options including time period and user filters
   * @returns Promise<number> - Total users data
   */
  async getTotalUsersDataFromDBWithFilters({ filterBy }: { filterBy: FilterOptions }): Promise<number> {
    const dateReplacements = DateHelper.getDateReplacements(
      filterBy.timePeriod,
      filterBy.customStartDate,
      filterBy.customEndDate
    );

    const baseQuery = `
      select count(distinct user_code) 
      from udl.vw_daily_user_adoption dua 
      inner join udl.vw_user_as_is u on dua.user_code = u.code 
      where u.tenant_code = '{tenantCode}' 
        and reporting_date >= '{startDate}' 
        and reporting_date <= '{endDate}' 
        and status_code = 'US001'
    `;

    const finalQuery = await this.transformQuery({
      baseQuery,
      filterBy,
      dateReplacements,
    });
    return await this.getHeroMetricDataFromDB(finalQuery);
  }

  async getAdoptionLeadersDataFromDB({
    filterBy,
    groupByParam = 'department',
    orderBy = { column: 'adoption_rate', direction: 'desc' },
  }: {
    filterBy: FilterOptions;
    groupByParam?: 'department' | 'location' | 'user_category';
    orderBy?: { column: string; direction: 'asc' | 'desc' };
  }): Promise<any[]> {
    // Special handling for user_category - use dedicated method
    if (groupByParam === 'user_category') {
      return this.getAdoptionLeadersDataByUserCategory({ filterBy, orderBy });
    }

    const dateReplacements = DateHelper.getDateReplacements(
      filterBy.timePeriod,
      filterBy.customStartDate,
      filterBy.customEndDate
    );

    const baseQuery = `
      select 
        u.${groupByParam} as view_category,
        count(distinct case when ul.has_logged_in then ul.user_code end) as logged_in_users,
        count(distinct u.code) as total_users,
        concat(round(count(distinct case when ul.has_logged_in then ul.user_code end) / count(distinct u.code) * 100, 1), '%') as adoption_rate
      from udl.vw_user_as_is u 
      inner join udl.vw_daily_user_adoption ul on u.code = ul.user_code 
      where u.tenant_code = '{tenantCode}' 
        and ul.reporting_date >= '{startDate}' 
        and ul.reporting_date <= '{endDate}' 
        and u.status_code = 'US001'
    `;

    const finalQuery = await this.transformQuery({
      baseQuery,
      filterBy,
      dateReplacements,
      groupByParam,
      orderBy,
    });
    return await this.executeQuery(finalQuery);
  }

  /**
   * Special method for user category grouping that returns readable category names
   */
  private async getAdoptionLeadersDataByUserCategory({
    filterBy,
    orderBy = { column: 'adoption_rate', direction: 'desc' },
  }: {
    filterBy: FilterOptions;
    orderBy?: { column: string; direction: 'asc' | 'desc' };
  }): Promise<any[]> {
    const dateReplacements = DateHelper.getDateReplacements(
      filterBy.timePeriod,
      filterBy.customStartDate,
      filterBy.customEndDate
    );

    const baseQuery = `
      select 
        coalesce(u.user_category_name, 'Uncategorized') as view_category,
        count(distinct case when ul.has_logged_in then ul.user_code end) as logged_in_users,
        count(distinct u.code) as total_users,
        concat(round(count(distinct case when ul.has_logged_in then ul.user_code end) / count(distinct u.code) * 100, 1), '%') as adoption_rate
      from udl.vw_user_as_is u 
      inner join udl.vw_daily_user_adoption ul on u.code = ul.user_code 
      where u.tenant_code = '{tenantCode}' 
        and ul.reporting_date >= '{startDate}' 
        and ul.reporting_date <= '{endDate}' 
        and u.status_code = 'US001'
      group by coalesce(u.user_category_name, 'Uncategorized')
    `;

    const finalQuery = await this.transformQuery({
      baseQuery,
      filterBy,
      dateReplacements,
      // Don't pass groupByParam since we're handling GROUP BY manually
      orderBy,
    });
    return await this.executeQuery(finalQuery);
  }
}
