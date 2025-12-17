import { SearchSql } from '../sqlQueries/search';
import { convertPercentageToDecimal } from '../utils/percentageUtils';

import { BaseAnalyticsQueryHelper, FilterOptions } from './baseAnalyticsQueryHelper';
import { SnowflakeHelper } from './snowflakeHelper';

// Type definitions for transformed data
export interface TopSearchQueriesData {
  search_query: string;
  total_search: number;
  clickthrough: number;
  success_rate: string;
}

export interface TopSearchQueriesWithNoClickthroughData {
  search_query: string;
  total_search: number;
  no_click_count: number;
  no_click_rate: string | number; // Can be string for UI, number for CSV
}

export interface TopClickthroughTypesData {
  item_type: string;
  click_count: number;
  total_clickthrough: number;
  percentage: string | number; // Can be string for UI, number for CSV
}

export interface NoResultSearchQueriesData {
  search_term: string;
  failed_search_count: number;
  total_search_count: number;
  failure_percentage: number;
}

export interface MostSearchesPerformedByDepartmentData {
  department: string;
  total_searches: number;
  distinct_users: number;
  avg_searches_per_user: number;
}

export interface SearchUsageVolumeClickThroughRateData {
  search_date: string;
  total_search_count: number;
  total_click_count: number;
}

/**
 * Search Dashboard Query Helper
 * Handles all database operations specific to the Search dashboard
 * Extends BaseAnalyticsQueryHelper to inherit common database operations
 * Follows the adoption dashboard pattern with FilterOptions
 */
export class SearchDashboardQueryHelper extends BaseAnalyticsQueryHelper {
  constructor(snowflakeHelper: SnowflakeHelper, orgId: string) {
    super(snowflakeHelper, orgId);
  }

  /**
   * Gets total search volume data from database with filters applied.
   * @param filterBy - Filter options including time period and user filters
   * @returns Promise<number> - Total search volume count
   */
  async getTotalSearchVolumeFromDBWithFilters({ filterBy }: { filterBy: FilterOptions }): Promise<number> {
    const finalQuery = await this.transformQueryWithFilters({
      baseQuery: SearchSql.Total_Search_Volume,
      filterBy: { ...filterBy, tenantCode: this.orgId },
    });
    return await this.getHeroMetricDataFromDB(finalQuery);
  }

  /**
   * Gets search click through rate data from database with filters applied.
   * @param filterBy - Filter options including time period and user filters
   * @returns Promise<string> - Formatted click through rate string
   */
  async getSearchClickThroughRateFromDBWithFilters({ filterBy }: { filterBy: FilterOptions }): Promise<string> {
    const finalQuery = await this.transformQueryWithFilters({
      baseQuery: SearchSql.Search_Click_Through_Rate,
      filterBy: { ...filterBy, tenantCode: this.orgId },
    });
    const result = await this.executeQuery(finalQuery);

    if (result.length === 0) {
      return '0 (0%)';
    }

    const formattedResult = result[0].FORMATTED_RESULT;
    return formattedResult || '0 (0%)';
  }

  /**
   * Gets no results search data from database with filters applied.
   * @param filterBy - Filter options including time period and user filters
   * @returns Promise<string> - Formatted no results search string
   */
  async getNoResultsSearchFromDBWithFilters({ filterBy }: { filterBy: FilterOptions }): Promise<string> {
    const finalQuery = await this.transformQueryWithFilters({
      baseQuery: SearchSql.No_Results_Search,
      filterBy: { ...filterBy, tenantCode: this.orgId },
    });
    const result = await this.executeQuery(finalQuery);

    if (result.length === 0) {
      return '0 (0%)';
    }

    const formattedResult = result[0].FORMATTED_RESULT;
    return formattedResult || '0 (0%)';
  }

  /**
   * Gets average searches per logged in user data from database with filters applied.
   * @param filterBy - Filter options including time period and user filters
   * @returns Promise<number> - Average searches per logged in user
   */
  async getAverageSearchesPerLoggedInUserFromDBWithFilters({ filterBy }: { filterBy: FilterOptions }): Promise<number> {
    const finalQuery = await this.transformQueryWithFilters({
      baseQuery: SearchSql.Average_Searches_Per_Logged_In_User,
      filterBy: { ...filterBy, tenantCode: this.orgId },
    });
    const result = await this.executeQuery(finalQuery);

    if (!result || result.length === 0) return 0;

    let finalRatio = Number(result[0].FINAL_RATIO ?? 0);
    finalRatio = Math.round(finalRatio * 100) / 100;

    return isNaN(finalRatio) ? 0 : finalRatio;
  }

  /**
   * Transforms raw database results to TopSearchQueriesData format
   * @param rawResults - Raw results from database query
   * @returns TopSearchQueriesData[] - Properly typed and transformed data
   */
  private transformTopSearchQueriesResults(rawResults: any[]): TopSearchQueriesData[] {
    return rawResults.map((item: any) => {
      const clickthroughValue = Number(item.CLICKTHROUGH || item.clickthrough);
      return {
        search_query: item.SEARCH_TERM || item.search_term,
        total_search: Number(item.TOTAL_SEARCH || item.total_search),
        clickthrough: isNaN(clickthroughValue) ? 0 : clickthroughValue,
        success_rate: item.SUCCESS_RATE || item.success_rate,
      };
    });
  }

  /**
   * Gets top search queries data from database with filters applied.
   * @param filterBy - Filter options including time period and user filters
   * @returns Promise<TopSearchQueriesData[]> - Top search queries data with proper typing
   */
  async getTopSearchQueriesFromDBWithFilters({
    filterBy,
  }: {
    filterBy: FilterOptions;
  }): Promise<TopSearchQueriesData[]> {
    const finalQuery = await this.transformQueryWithFilters({
      baseQuery: SearchSql.Top_Search_Queries,
      filterBy: { ...filterBy, tenantCode: this.orgId },
    });

    const rawResults = await this.executeQuery(finalQuery);
    return this.transformTopSearchQueriesResults(rawResults);
  }

  /**
   * Transforms raw database results to TopSearchQueriesWithNoClickthroughData format
   * @param rawResults - Raw results from database query
   * @param forCSVValidation - If true, converts no_click_rate to decimal format for CSV comparison
   * @returns TopSearchQueriesWithNoClickthroughData[] - Properly typed and transformed data
   */
  private transformTopSearchQueriesWithNoClickthroughResults(
    rawResults: any[],
    forCSVValidation: boolean = false
  ): TopSearchQueriesWithNoClickthroughData[] {
    return rawResults.map((item: any) => {
      const noClickCountValue = Number(item.NO_CLICK_COUNT || item.no_click_count);
      const noClickRateValue = item.NO_CLICK_RATE || item.no_click_rate;

      let noClickRate: string | number;
      if (forCSVValidation) {
        // Convert percentage to decimal format for CSV validation
        noClickRate = convertPercentageToDecimal(noClickRateValue);
      } else {
        // Keep as string for UI validation
        noClickRate = typeof noClickRateValue === 'string' ? noClickRateValue : String(noClickRateValue);
      }

      return {
        search_query: item.SEARCH_TERM || item.search_term,
        total_search: Number(item.TOTAL_SEARCH || item.total_search),
        no_click_count: isNaN(noClickCountValue) ? 0 : noClickCountValue,
        no_click_rate: noClickRate,
      };
    });
  }

  /**
   * Gets top search queries with no clickthrough data from database with filters applied.
   * @param filterBy - Filter options including time period and user filters
   * @param forCSVValidation - If true, converts no_click_rate to decimal format for CSV comparison
   * @returns Promise<TopSearchQueriesWithNoClickthroughData[]> - Top search queries with no clickthrough data
   */
  async getTopSearchQueriesWithNoClickthroughFromDBWithFilters({
    filterBy,
    forCSVValidation = false,
  }: {
    filterBy: FilterOptions;
    forCSVValidation?: boolean;
  }): Promise<TopSearchQueriesWithNoClickthroughData[]> {
    const finalQuery = await this.transformQueryWithFilters({
      baseQuery: SearchSql.Top_Search_Queries_With_No_Clickthrough,
      filterBy: { ...filterBy, tenantCode: this.orgId },
    });

    const rawResults = await this.executeQuery(finalQuery);
    return this.transformTopSearchQueriesWithNoClickthroughResults(rawResults, forCSVValidation);
  }

  /**
   * Transforms raw database results to TopClickthroughTypesData format
   * @param rawResults - Raw results from database query
   * @param forCSVValidation - If true, converts percentage to decimal format for CSV comparison
   * @returns TopClickthroughTypesData[] - Properly typed and transformed data
   */
  private transformTopClickthroughTypesResults(
    rawResults: any[],
    forCSVValidation: boolean = false
  ): TopClickthroughTypesData[] {
    return rawResults.map((item: any) => {
      const percentageValue = item.PERCENTAGE || item.percentage;

      let percentage: string | number;
      if (forCSVValidation) {
        // Convert percentage to decimal format for CSV validation
        percentage = convertPercentageToDecimal(percentageValue);
      } else {
        // Keep as string for UI validation
        percentage = typeof percentageValue === 'string' ? percentageValue : String(percentageValue);
      }

      return {
        item_type: item.ITEM_TYPE || item.item_type,
        click_count: Number(item.CLICK_COUNT || item.click_count),
        total_clickthrough: Number(item.TOTAL_CLICKTHROUGH || item.total_clickthrough),
        percentage: percentage,
      };
    });
  }

  /**
   * Gets top clickthrough types data from database with filters applied.
   * @param filterBy - Filter options including time period and user filters
   * @param forCSVValidation - If true, converts percentage to decimal format for CSV comparison
   * @returns Promise<TopClickthroughTypesData[]> - Top clickthrough types data
   */
  async getTopClickthroughTypesFromDBWithFilters({
    filterBy,
    forCSVValidation = false,
  }: {
    filterBy: FilterOptions;
    forCSVValidation?: boolean;
  }): Promise<TopClickthroughTypesData[]> {
    const finalQuery = await this.transformQueryWithFilters({
      baseQuery: SearchSql.Top_Clickthrough_Types,
      filterBy: { ...filterBy, tenantCode: this.orgId },
    });

    const rawResults = await this.executeQuery(finalQuery);
    return this.transformTopClickthroughTypesResults(rawResults, forCSVValidation);
  }

  /**
   * Transforms raw database results to NoResultSearchQueriesData format
   * @param rawResults - Raw results from database query
   * @param forCSVValidation - If true, converts failure_percentage to decimal format for CSV comparison
   * @returns NoResultSearchQueriesData[] - Properly typed and transformed data
   */
  private transformNoResultSearchQueriesResults(
    rawResults: any[],
    forCSVValidation: boolean = false
  ): NoResultSearchQueriesData[] {
    return rawResults.map((item: any) => {
      const failurePercentageValue = item.FAILURE_PERCENTAGE || item.failure_percentage;

      let failurePercentage: number;
      if (forCSVValidation) {
        // Convert percentage to decimal format for CSV validation
        failurePercentage = convertPercentageToDecimal(failurePercentageValue);
      } else {
        // Keep as number (already in percentage format from DB)
        failurePercentage =
          typeof failurePercentageValue === 'number'
            ? failurePercentageValue
            : parseFloat(String(failurePercentageValue)) || 0;
      }

      return {
        search_term: item.SEARCH_TERM || item.search_term,
        failed_search_count: Number(item.FAILED_SEARCH_COUNT || item.failed_search_count),
        total_search_count: Number(item.TOTAL_SEARCH_COUNT || item.total_search_count),
        failure_percentage: failurePercentage,
      };
    });
  }

  /**
   * Gets no result search queries data from database with filters applied.
   * @param filterBy - Filter options including time period and user filters
   * @param forCSVValidation - If true, converts failure_percentage to decimal format for CSV comparison
   * @returns Promise<NoResultSearchQueriesData[]> - No result search queries data
   */
  async getNoResultSearchQueriesFromDBWithFilters({
    filterBy,
    forCSVValidation = false,
  }: {
    filterBy: FilterOptions;
    forCSVValidation?: boolean;
  }): Promise<NoResultSearchQueriesData[]> {
    // Get base filter strings (they use 'u' alias by default)
    const baseLocationFilter = this.addLocationFilter(filterBy.locations);
    const baseDepartmentFilter = this.addDepartmentFilter(filterBy.departments);

    // Create filter strings with correct aliases for each subquery
    const locationFilterU2 = baseLocationFilter.replace(/u\.location/g, 'u2.location');
    const departmentFilterU2 = baseDepartmentFilter.replace(/u\.department/g, 'u2.department');
    const locationFilterU3 = baseLocationFilter.replace(/u\.location/g, 'u3.location');
    const departmentFilterU3 = baseDepartmentFilter.replace(/u\.department/g, 'u3.department');

    let query = SearchSql.No_Result_Search_Queries;

    // Replace placeholders in first subquery (u2) - must be done before base helper replacement
    query = query.replace(
      /(SELECT COUNT\(\*\)[\s\S]*?INNER JOIN udl\.user u2[\s\S]*?WHERE[\s\S]*?)\{locationFilter\}/,
      `$1${locationFilterU2}`
    );
    query = query.replace(
      /(SELECT COUNT\(\*\)[\s\S]*?INNER JOIN udl\.user u2[\s\S]*?WHERE[\s\S]*?)\{departmentFilter\}/,
      `$1${departmentFilterU2}`
    );

    // Replace placeholders in second subquery (u3) - must be done before base helper replacement
    query = query.replace(
      /(SELECT COUNT\(\*\)[\s\S]*?INNER JOIN udl\.user u3[\s\S]*?WHERE[\s\S]*?)\{locationFilter\}/,
      `$1${locationFilterU3}`
    );
    query = query.replace(
      /(SELECT COUNT\(\*\)[\s\S]*?INNER JOIN udl\.user u3[\s\S]*?WHERE[\s\S]*?)\{departmentFilter\}/,
      `$1${departmentFilterU3}`
    );

    // Now use base helper to replace tenantCode, dates, and remaining filters (u alias)
    const finalQuery = await this.transformQueryWithFilters({
      baseQuery: query,
      filterBy: { ...filterBy, tenantCode: this.orgId },
    });

    const rawResults = await this.executeQuery(finalQuery);
    return this.transformNoResultSearchQueriesResults(rawResults, forCSVValidation);
  }

  /**
   * Transforms raw database results to MostSearchesPerformedByDepartmentData format
   * @param rawResults - Raw results from database query
   * @returns MostSearchesPerformedByDepartmentData[] - Properly typed and transformed data
   */
  private transformMostSearchesPerformedByDepartmentResults(
    rawResults: any[]
  ): MostSearchesPerformedByDepartmentData[] {
    return rawResults.map((item: any) => {
      const avgSearchesPerUser = Number(item.AVG_SEARCHES_PER_USER || item.avg_searches_per_user);
      return {
        department: item.DEPARTMENT || item.department,
        total_searches: Number(item.TOTAL_SEARCHES || item.total_searches),
        distinct_users: Number(item.DISTINCT_USERS || item.distinct_users),
        avg_searches_per_user: isNaN(avgSearchesPerUser) ? 0 : avgSearchesPerUser,
      };
    });
  }

  /**
   * Gets most searches performed by department data from database with filters applied.
   * @param filterBy - Filter options including time period and user filters
   * @returns Promise<MostSearchesPerformedByDepartmentData[]> - Most searches performed by department data
   */
  async getMostSearchesPerformedByDepartmentFromDBWithFilters({
    filterBy,
  }: {
    filterBy: FilterOptions;
  }): Promise<MostSearchesPerformedByDepartmentData[]> {
    const finalQuery = await this.transformQueryWithFilters({
      baseQuery: SearchSql.Most_Searches_Performed_By_Department,
      filterBy: { ...filterBy, tenantCode: this.orgId },
    });

    const rawResults = await this.executeQuery(finalQuery);
    return this.transformMostSearchesPerformedByDepartmentResults(rawResults);
  }

  /**
   * Transforms raw database results to SearchUsageVolumeClickThroughRateData format
   * @param rawResults - Raw results from database query
   * @returns SearchUsageVolumeClickThroughRateData[] - Properly typed and transformed data
   */
  private transformSearchUsageVolumeAndClickThroughRateResults(
    rawResults: any[]
  ): SearchUsageVolumeClickThroughRateData[] {
    return rawResults.map((item: any) => {
      const searchDate = item.SEARCH_DATE || item.search_date;
      const totalSearchCount =
        item.TOTAL_SEARCH_COUNT !== undefined && item.TOTAL_SEARCH_COUNT !== null
          ? Number(item.TOTAL_SEARCH_COUNT)
          : item.total_search_count !== undefined && item.total_search_count !== null
            ? Number(item.total_search_count)
            : 0;
      const totalClickCount =
        item.TOTAL_CLICK_COUNT !== undefined && item.TOTAL_CLICK_COUNT !== null
          ? Number(item.TOTAL_CLICK_COUNT)
          : item.total_click_count !== undefined && item.total_click_count !== null
            ? Number(item.total_click_count)
            : 0;

      // Format date as string - preserve the date format from Snowflake
      // Snowflake DATE() returns dates that can be Date objects or strings
      // Convert to string in YYYY-MM-DD format to ensure consistency
      let searchDateStr: string;
      if (searchDate instanceof Date) {
        const year = searchDate.getFullYear();
        const month = String(searchDate.getMonth() + 1).padStart(2, '0');
        const day = String(searchDate.getDate()).padStart(2, '0');
        searchDateStr = `${year}-${month}-${day}`;
      } else if (typeof searchDate === 'string') {
        // Extract YYYY-MM-DD from string (could be "2025-10-30" or "2025-10-30T00:00:00.000Z")
        searchDateStr = searchDate.split('T')[0].split(' ')[0];
      } else {
        // Convert to string and extract date part
        searchDateStr = String(searchDate).split('T')[0].split(' ')[0];
      }

      return {
        search_date: searchDateStr,
        total_search_count: isNaN(totalSearchCount) ? 0 : totalSearchCount,
        total_click_count: isNaN(totalClickCount) ? 0 : totalClickCount,
      };
    });
  }

  /**
   * Gets search usage volume and click through rate data from database with filters applied.
   * @param filterBy - Filter options including time period and user filters
   * @returns Promise<SearchUsageVolumeClickThroughRateData[]> - Search usage volume and click through rate data
   */
  async getSearchUsageVolumeAndClickThroughRateFromDBWithFilters({
    filterBy,
  }: {
    filterBy: FilterOptions;
  }): Promise<SearchUsageVolumeClickThroughRateData[]> {
    const finalQuery = await this.transformQueryWithFilters({
      baseQuery: SearchSql.Search_Usage_Volume_And_Click_Through_Rate,
      filterBy: { ...filterBy, tenantCode: this.orgId },
    });

    const rawResults = await this.executeQuery(finalQuery);
    return this.transformSearchUsageVolumeAndClickThroughRateResults(rawResults);
  }
}
