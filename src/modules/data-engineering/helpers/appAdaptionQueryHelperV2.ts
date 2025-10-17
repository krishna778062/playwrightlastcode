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
  groupBy?: 'department' | 'location' | 'segment' | 'user_category' | 'company_name';
}

export class AppAdoptionDashboardQueryHelperV2 extends BaseAnalyticsQueryHelper {
  constructor(snowflakeHelper: SnowflakeHelper, orgId: string) {
    super(snowflakeHelper, orgId);
  }

  // ===== HELPER METHODS =====

  /**
   * Transforms a query template by replacing placeholders and adding filters
   * @param template - SQL template with placeholders like {tenantCode}, {startDate}, etc.
   * @param filters - Filter options
   * @param dateReplacements - Date range replacements
   * @param addGroupBy - Whether to add GROUP BY clause (false for hero metrics)
   */
  private static transformQueryTemplate(
    template: string,
    filters: FilterOptions,
    dateReplacements: any,
    addGroupBy: boolean = false
  ): string {
    // Replace all placeholders in template
    let query = template
      .replace('{tenantCode}', filters.tenantCode)
      .replace('{startDate}', dateReplacements.startDate)
      .replace('{endDate}', dateReplacements.endDate);

    // Add filters dynamically
    query = this.addAllFilters(query, filters);

    // Add GROUP BY if needed
    if (addGroupBy) {
      query = this.addGroupBy(query, filters.groupBy);
    }

    return query;
  }

  /**
   * Adds all filter clauses to the query
   */
  private static addAllFilters(query: string, filters: FilterOptions): string {
    query += this.addLocationFilter(filters.locations);
    query += this.addDepartmentFilter(filters.departments);
    query += this.addSegmentFilter(filters.segments);
    query += this.addUserCategoryFilter(filters.userCategories);
    query += this.addCompanyNameFilter(filters.companyName);
    return query;
  }

  /**
   * Adds GROUP BY clause based on groupBy parameter
   */
  private static addGroupBy(query: string, groupBy?: string): string {
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

  private static addLocationFilter(locations?: string[]): string {
    if (!locations || locations.length === 0) return '';
    const quotedValues = locations.map(v => `'${v}'`).join(', ');
    return `\n  and u.location in (${quotedValues})`;
  }

  private static addDepartmentFilter(departments?: string[]): string {
    if (!departments || departments.length === 0) return '';
    const quotedValues = departments.map(v => `'${v}'`).join(', ');
    return `\n  and u.department in (${quotedValues})`;
  }

  private static addSegmentFilter(segments?: string[]): string {
    if (!segments || segments.length === 0) return '';
    const quotedValues = segments.map(v => `'${v}'`).join(', ');
    return `\n  and u.segment_code in (${quotedValues})`;
  }

  private static addUserCategoryFilter(userCategories?: string[]): string {
    if (!userCategories || userCategories.length === 0) return '';
    const quotedValues = userCategories.map(v => `'${v}'`).join(', ');
    return `\n  and u.user_category_code in (${quotedValues})`;
  }

  private static addCompanyNameFilter(companyNames?: string[]): string {
    if (!companyNames || companyNames.length === 0) return '';
    const quotedValues = companyNames.map(v => `'${v}'`).join(', ');
    return `\n  and u.company_name in (${quotedValues})`;
  }

  // ===== QUERY TEMPLATES =====

  /**
   * Total Users query template (Hero metric - no GROUP BY)
   */
  private static readonly TOTAL_USERS_TEMPLATE = `
    select count(distinct user_code) 
    from udl.vw_daily_user_adoption dua 
    inner join udl.vw_user_as_is u on dua.user_code = u.code 
    where u.tenant_code = '{tenantCode}' 
      and reporting_date >= '{startDate}' 
      and reporting_date <= '{endDate}' 
      and status_code = 'US001'
  `;

  /**
   * Department Breakdown query template (Tabular metric - with GROUP BY)
   */
  private static readonly DEPARTMENT_BREAKDOWN_TEMPLATE = `
    select department, count(distinct user_code) as user_count
    from udl.vw_daily_user_adoption dua 
    inner join udl.vw_user_as_is u on dua.user_code = u.code 
    where u.tenant_code = '{tenantCode}' 
      and reporting_date >= '{startDate}' 
      and reporting_date <= '{endDate}' 
      and status_code = 'US001'
  `;

  /**
   * Logged In Users query template (Hero metric - no GROUP BY)
   */
  private static readonly LOGGED_IN_USERS_TEMPLATE = `
    select count(distinct user_code) 
    from udl.vw_daily_user_adoption dua 
    inner join udl.vw_user_as_is u on dua.user_code = u.code 
    where u.tenant_code = '{tenantCode}' 
      and reporting_date >= '{startDate}' 
      and reporting_date <= '{endDate}' 
      and status_code = 'US001'
      and u.last_login_date is not null
  `;

  /**
   * Contributors and Participants query template (Hero metric - no GROUP BY)
   */
  private static readonly CONTRIBUTORS_TEMPLATE = `
    select count(distinct user_code) 
    from udl.vw_daily_user_adoption dua 
    inner join udl.vw_user_as_is u on dua.user_code = u.code 
    where u.tenant_code = '{tenantCode}' 
      and reporting_date >= '{startDate}' 
      and reporting_date <= '{endDate}' 
      and status_code = 'US001'
      and u.is_contributor = true
      and u.is_participant = true
  `;

  // ===== ENHANCED METHODS (With Filters) =====

  /**
   * Gets total users data from database with filters.
   * @param filters - Filter options including time period and user filters
   * @returns Promise<number> - Total users data
   */
  async getTotalUsersDataFromDBWithFilters(filters: FilterOptions): Promise<number> {
    const dateReplacements = DateHelper.getDateReplacements(
      filters.timePeriod,
      filters.customStartDate,
      filters.customEndDate
    );

    const finalQuery = AppAdoptionDashboardQueryHelperV2.transformQueryTemplate(
      AppAdoptionDashboardQueryHelperV2.TOTAL_USERS_TEMPLATE,
      filters,
      dateReplacements,
      false // No GROUP BY for hero metrics
    );

    return await this.getHeroMetricDataFromDB(finalQuery);
  }

  /**
   * Gets department breakdown data from database with filters.
   * @param filters - Filter options including time period and user filters
   * @returns Promise<any[]> - Department breakdown data
   */
  async getDepartmentBreakdownDataFromDBWithFilters(filters: FilterOptions): Promise<any[]> {
    const dateReplacements = DateHelper.getDateReplacements(
      filters.timePeriod,
      filters.customStartDate,
      filters.customEndDate
    );

    const finalQuery = AppAdoptionDashboardQueryHelperV2.transformQueryTemplate(
      AppAdoptionDashboardQueryHelperV2.DEPARTMENT_BREAKDOWN_TEMPLATE,
      filters,
      dateReplacements,
      true // Add GROUP BY for tabular metrics
    );

    return await this.executeQuery(finalQuery);
  }

  /**
   * Gets logged in users data from database with filters.
   * @param filters - Filter options including time period and user filters
   * @returns Promise<number> - Logged in users data
   */
  async getLoggedInUsersDataFromDBWithFilters(filters: FilterOptions): Promise<number> {
    const dateReplacements = DateHelper.getDateReplacements(
      filters.timePeriod,
      filters.customStartDate,
      filters.customEndDate
    );

    const finalQuery = AppAdoptionDashboardQueryHelperV2.transformQueryTemplate(
      AppAdoptionDashboardQueryHelperV2.LOGGED_IN_USERS_TEMPLATE,
      filters,
      dateReplacements,
      false // No GROUP BY for hero metrics
    );

    return await this.getHeroMetricDataFromDB(finalQuery);
  }

  /**
   * Gets contributors and participants data from database with filters.
   * @param filters - Filter options including time period and user filters
   * @returns Promise<number> - Contributors and participants data
   */
  async getContributorsAndParticipantsDataFromDBWithFilters(filters: FilterOptions): Promise<number> {
    const dateReplacements = DateHelper.getDateReplacements(
      filters.timePeriod,
      filters.customStartDate,
      filters.customEndDate
    );

    const finalQuery = AppAdoptionDashboardQueryHelperV2.transformQueryTemplate(
      AppAdoptionDashboardQueryHelperV2.CONTRIBUTORS_TEMPLATE,
      filters,
      dateReplacements,
      false // No GROUP BY for hero metrics
    );

    return await this.getHeroMetricDataFromDB(finalQuery);
  }

  // ===== DEBUGGING METHODS =====

  /**
   * Gets the final query string for debugging purposes
   * @param template - The query template
   * @param filters - Filter options
   * @param dateReplacements - Date range replacements
   * @param addGroupBy - Whether to add GROUP BY clause
   * @returns The final query string
   */
  static getFinalQueryString(
    template: string,
    filters: FilterOptions,
    dateReplacements: any,
    addGroupBy: boolean = false
  ): string {
    return this.transformQueryTemplate(template, filters, dateReplacements, addGroupBy);
  }

  /**
   * Logs the template and final query for debugging
   * @param template - The query template
   * @param filters - Filter options
   * @param dateReplacements - Date range replacements
   * @param addGroupBy - Whether to add GROUP BY clause
   */
  static debugQuery(
    template: string,
    filters: FilterOptions,
    dateReplacements: any,
    addGroupBy: boolean = false
  ): void {
    console.log('=== QUERY DEBUG ===');
    console.log('Template:', template);
    console.log('Filters:', filters);
    console.log('Date Replacements:', dateReplacements);
    console.log('Add Group By:', addGroupBy);
    console.log('Final Query:', this.transformQueryTemplate(template, filters, dateReplacements, addGroupBy));
    console.log('==================');
  }
}
