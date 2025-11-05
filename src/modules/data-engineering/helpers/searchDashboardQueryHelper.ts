import { test } from '@playwright/test';

import { BaseAnalyticsQueryHelper } from './baseAnalyticsQueryHelper';
import { FilterOptions } from './baseAnalyticsQueryHelper';
import { PeriodFilterOption } from './dateHelper';
import { SnowflakeHelper } from './snowflakeHelper';

/**
 * Search Dashboard Query Helper
 * Handles all database operations specific to the Search dashboard
 * Extends BaseAnalyticsQueryHelper to inherit common database operations
 */
export class SearchDashboardQueryHelper extends BaseAnalyticsQueryHelper {
  constructor(snowflakeHelper: SnowflakeHelper, orgId: string) {
    super(snowflakeHelper, orgId);
  }

  /**
   * Gets total search volume data from database.
   * Search volume queries return count data.
   * This method encapsulates the business rule for search volume data structure.
   *
   * @param query - The SQL query string (should return search volume data)
   * @param timePeriod - Time period filter or 'Custom'
   * @param customStartDate - Custom start date (YYYY-MM-DD format) - required if timePeriod is 'Custom'
   * @param customEndDate - Custom end date (YYYY-MM-DD format) - required if timePeriod is 'Custom'
   * @returns Promise<number> - Total search volume count
   */
  async getTotalSearchVolumeFromDB(
    query: string,
    timePeriod: string,
    customStartDate?: string,
    customEndDate?: string
  ): Promise<number> {
    return await test.step(`Get total search volume from database`, async () => {
      const filterBy: FilterOptions = {
        tenantCode: this.orgId,
        timePeriod: timePeriod as PeriodFilterOption,
        customStartDate,
        customEndDate,
      };
      const transformedQuery = await this.transformQueryWithFilters({ baseQuery: query, filterBy });
      const result = await this.executeQuery(transformedQuery);

      if (result.length === 0) {
        return 0;
      }

      const count = result[0].TOTAL_SEARCH_VOLUME;
      return typeof count === 'string' ? parseInt(count) : count;
    });
  }

  /**
   * Gets search click through rate data from database.
   * Click through rate queries return formatted string data.
   * This method encapsulates the business rule for click through rate data structure.
   *
   * @param query - The SQL query string (should return click through rate data)
   * @param timePeriod - Time period filter or 'Custom'
   * @param customStartDate - Custom start date (YYYY-MM-DD format) - required if timePeriod is 'Custom'
   * @param customEndDate - Custom end date (YYYY-MM-DD format) - required if timePeriod is 'Custom'
   * @returns Promise<string> - Formatted click through rate string
   */
  async getSearchClickThroughRateFromDB(
    query: string,
    timePeriod: string,
    customStartDate?: string,
    customEndDate?: string
  ): Promise<string> {
    return await test.step(`Get search click through rate from database`, async () => {
      const filterBy: FilterOptions = {
        tenantCode: this.orgId,
        timePeriod: timePeriod as PeriodFilterOption,
        customStartDate,
        customEndDate,
      };
      const transformedQuery = await this.transformQueryWithFilters({ baseQuery: query, filterBy });
      const result = await this.executeQuery(transformedQuery);

      if (result.length === 0) {
        return '0 (0%)';
      }

      const formattedResult = result[0].FORMATTED_RESULT;
      return formattedResult || '0 (0%)';
    });
  }

  async getNoResultsSearchFromDB(
    query: string,
    timePeriod: string,
    customStartDate?: string,
    customEndDate?: string
  ): Promise<string> {
    return await test.step(`Get no results search from database`, async () => {
      const filterBy: FilterOptions = {
        tenantCode: this.orgId,
        timePeriod: timePeriod as PeriodFilterOption,
        customStartDate,
        customEndDate,
      };
      const transformedQuery = await this.transformQueryWithFilters({ baseQuery: query, filterBy });
      const result = await this.executeQuery(transformedQuery);

      if (result.length === 0) {
        return '0 (0%)';
      }

      const formattedResult = result[0].FORMATTED_RESULT;
      return formattedResult || '0 (0%)';
    });
  }

  async getAverageSearchesPerLoggedInUserFromDB(
    query: string,
    timePeriod: string,
    customStartDate?: string,
    customEndDate?: string
  ): Promise<number> {
    return await test.step(`Get average searches per logged in user from database`, async () => {
      const filterBy: FilterOptions = {
        tenantCode: this.orgId,
        timePeriod: timePeriod as PeriodFilterOption,
        customStartDate,
        customEndDate,
      };
      const transformedQuery = await this.transformQueryWithFilters({ baseQuery: query, filterBy });
      const result = await this.executeQuery(transformedQuery);
      if (!result || result.length === 0) return 0;

      // Snowflake might return uppercased identifiers -> FINAL_RATIO
      let finalRatio = Number(result[0].FINAL_RATIO ?? 0);

      // Round to 2 decimal places
      finalRatio = Math.round(finalRatio * 100) / 100;

      return isNaN(finalRatio) ? 0 : finalRatio;
    });
  }

  /**
   * Gets top search queries data from database.
   * This query returns tabular data with multiple rows.
   *
   * @param query - The SQL query string (should return top search queries data)
   * @param timePeriod - Time period filter or 'Custom'
   * @param customStartDate - Custom start date (YYYY-MM-DD format) - required if timePeriod is 'Custom'
   * @param customEndDate - Custom end date (YYYY-MM-DD format) - required if timePeriod is 'Custom'
   * @returns Promise<any[]> - Array of top search queries records
   */
  async getTopSearchQueriesFromDB(
    query: string,
    timePeriod: string,
    customStartDate?: string,
    customEndDate?: string
  ): Promise<any[]> {
    return await test.step(`Get top search queries from database`, async () => {
      const filterBy: FilterOptions = {
        tenantCode: this.orgId,
        timePeriod: timePeriod as PeriodFilterOption,
        customStartDate,
        customEndDate,
      };
      const transformedQuery = await this.transformQueryWithFilters({ baseQuery: query, filterBy });
      const result = await this.executeQuery(transformedQuery);
      return result;
    });
  }

  /**
   * Gets top search queries with no clickthrough data from database.
   * This query returns tabular data with multiple rows.
   *
   * Note: CSV format shows no_click_rate as decimal (0.5) while DB may return percentage format (50% or 50).
   * This method converts percentage to decimal format for CSV validation consistency.
   * When the CSV format issue is fixed, this conversion can be removed.
   *
   * @param query - The SQL query string (should return top search queries with no clickthrough data)
   * @param timePeriod - Time period filter or 'Custom'
   * @param customStartDate - Custom start date (YYYY-MM-DD format) - required if timePeriod is 'Custom'
   * @param customEndDate - Custom end date (YYYY-MM-DD format) - required if timePeriod is 'Custom'
   * @param forCSVValidation - If true, converts no_click_rate from percentage to decimal format for CSV comparison
   * @returns Promise<any[]> - Array of top search queries with no clickthrough records
   */
  async getTopSearchQueriesWithNoClickthroughFromDB(
    query: string,
    timePeriod: string,
    customStartDate?: string,
    customEndDate?: string,
    forCSVValidation: boolean = false
  ): Promise<any[]> {
    return await test.step(`Get top search queries with no clickthrough from database`, async () => {
      const filterBy: FilterOptions = {
        tenantCode: this.orgId,
        timePeriod: timePeriod as PeriodFilterOption,
        customStartDate,
        customEndDate,
      };
      const transformedQuery = await this.transformQueryWithFilters({ baseQuery: query, filterBy });
      const result = await this.executeQuery(transformedQuery);

      // If CSV validation is requested, convert percentage to decimal format
      if (forCSVValidation) {
        return result.map((item: any) => {
          const noClickCountValue = Number(item.NO_CLICK_COUNT || item.no_click_count);
          const noClickRateValue = item.NO_CLICK_RATE || item.no_click_rate;

          // Convert percentage to decimal format to match CSV format
          // CSV shows decimal (0.5) while DB may have percentage (50% or 50)
          let noClickRateDecimal: number;
          if (typeof noClickRateValue === 'string') {
            // Remove % if present and convert to number
            const cleanValue = noClickRateValue.replace('%', '').trim();
            const percentageValue = parseFloat(cleanValue);
            // Convert percentage to decimal (50 -> 0.5)
            noClickRateDecimal = isNaN(percentageValue) ? 0 : percentageValue / 100;
          } else if (typeof noClickRateValue === 'number') {
            // If it's already a number, check if it's percentage (> 1) or decimal (<= 1)
            // If > 1, assume it's percentage and convert to decimal
            noClickRateDecimal = noClickRateValue > 1 ? noClickRateValue / 100 : noClickRateValue;
          } else {
            noClickRateDecimal = 0;
          }

          return {
            SEARCH_TERM: item.SEARCH_TERM || item.search_term,
            search_term: item.SEARCH_TERM || item.search_term,
            TOTAL_SEARCH: Number(item.TOTAL_SEARCH || item.total_search),
            total_search: Number(item.TOTAL_SEARCH || item.total_search),
            NO_CLICK_COUNT: isNaN(noClickCountValue) ? 0 : noClickCountValue,
            no_click_count: isNaN(noClickCountValue) ? 0 : noClickCountValue,
            NO_CLICK_RATE: noClickRateDecimal,
            no_click_rate: noClickRateDecimal,
          };
        });
      }

      return result;
    });
  }

  /**
   * Gets top clickthrough types data from database.
   * This query returns tabular data with multiple rows.
   *
   * @param query - The SQL query string (should return top clickthrough types data)
   * @param timePeriod - Time period filter or 'Custom'
   * @param customStartDate - Custom start date (YYYY-MM-DD format) - required if timePeriod is 'Custom'
   * @param customEndDate - Custom end date (YYYY-MM-DD format) - required if timePeriod is 'Custom'
   * @returns Promise<any[]> - Array of top clickthrough types records
   */
  async getTopClickthroughTypesFromDB(
    query: string,
    timePeriod: string,
    customStartDate?: string,
    customEndDate?: string
  ): Promise<any[]> {
    return await test.step(`Get top clickthrough types from database`, async () => {
      const filterBy: FilterOptions = {
        tenantCode: this.orgId,
        timePeriod: timePeriod as PeriodFilterOption,
        customStartDate,
        customEndDate,
      };
      const transformedQuery = await this.transformQueryWithFilters({ baseQuery: query, filterBy });
      const result = await this.executeQuery(transformedQuery);
      return result;
    });
  }

  /**
   * Gets no result search queries data from database.
   * This query returns tabular data with multiple rows.
   *
   * @param query - The SQL query string (should return no result search queries data)
   * @param timePeriod - Time period filter or 'Custom'
   * @param customStartDate - Custom start date (YYYY-MM-DD format) - required if timePeriod is 'Custom'
   * @param customEndDate - Custom end date (YYYY-MM-DD format) - required if timePeriod is 'Custom'
   * @returns Promise<any[]> - Array of no result search queries records
   */
  async getNoResultSearchQueriesFromDB(
    query: string,
    timePeriod: string,
    customStartDate?: string,
    customEndDate?: string
  ): Promise<any[]> {
    return await test.step(`Get no result search queries from database`, async () => {
      const filterBy: FilterOptions = {
        tenantCode: this.orgId,
        timePeriod: timePeriod as PeriodFilterOption,
        customStartDate,
        customEndDate,
      };
      const transformedQuery = await this.transformQueryWithFilters({ baseQuery: query, filterBy });
      const result = await this.executeQuery(transformedQuery);
      return result;
    });
  }

  /**
   * Gets most searches performed by department data from database.
   * This query returns tabular data with multiple rows.
   *
   * @param query - The SQL query string (should return most searches performed by department data)
   * @param timePeriod - Time period filter or 'Custom'
   * @param customStartDate - Custom start date (YYYY-MM-DD format) - required if timePeriod is 'Custom'
   * @param customEndDate - Custom end date (YYYY-MM-DD format) - required if timePeriod is 'Custom'
   * @returns Promise<any[]> - Array of most searches performed by department records
   */
  async getMostSearchesPerformedByDepartmentFromDB(
    query: string,
    timePeriod: string,
    customStartDate?: string,
    customEndDate?: string
  ): Promise<any[]> {
    return await test.step(`Get most searches performed by department from database`, async () => {
      const filterBy: FilterOptions = {
        tenantCode: this.orgId,
        timePeriod: timePeriod as PeriodFilterOption,
        customStartDate,
        customEndDate,
      };
      const transformedQuery = await this.transformQueryWithFilters({ baseQuery: query, filterBy });
      const result = await this.executeQuery(transformedQuery);
      return result;
    });
  }

  /**
   * Gets search usage volume and click through rate data from database.
   * This query returns time series data with date, search count, and clickthrough count.
   *
   * @param query - The SQL query string (should return search usage volume and click through rate data)
   * @param timePeriod - Time period filter or 'Custom'
   * @param customStartDate - Custom start date (YYYY-MM-DD format) - required if timePeriod is 'Custom'
   * @param customEndDate - Custom end date (YYYY-MM-DD format) - required if timePeriod is 'Custom'
   * @returns Promise<any[]> - Array of search usage volume and click through rate records
   */
  async getSearchUsageVolumeAndClickThroughRateFromDB(
    query: string,
    timePeriod: string,
    customStartDate?: string,
    customEndDate?: string
  ): Promise<any[]> {
    return await test.step(`Get search usage volume and click through rate from database`, async () => {
      const filterBy: FilterOptions = {
        tenantCode: this.orgId,
        timePeriod: timePeriod as PeriodFilterOption,
        customStartDate,
        customEndDate,
      };
      const transformedQuery = await this.transformQueryWithFilters({ baseQuery: query, filterBy });
      const result = await this.executeQuery(transformedQuery);
      return result;
    });
  }

  /**
   * Gets total search volume data from database with filters applied.
   * @param query - The SQL query string (should return search volume data)
   * @param filterBy - Filter options (locations, departments, etc.)
   * @returns Promise<number> - Total search volume count
   */
  async getTotalSearchVolumeFromDBWithFilters(query: string, filterBy: FilterOptions): Promise<number> {
    return await test.step(`Get total search volume from database with filters`, async () => {
      const transformedQuery = await this.transformQueryWithFilters({ baseQuery: query, filterBy });
      const result = await this.executeQuery(transformedQuery);

      if (result.length === 0) {
        return 0;
      }

      const count = result[0].TOTAL_SEARCH_VOLUME;
      return typeof count === 'string' ? parseInt(count) : count;
    });
  }

  /**
   * Gets search click through rate data from database with filters applied.
   * @param query - The SQL query string (should return click through rate data)
   * @param filterBy - Filter options (locations, departments, etc.)
   * @returns Promise<string> - Formatted click through rate string
   */
  async getSearchClickThroughRateFromDBWithFilters(query: string, filterBy: FilterOptions): Promise<string> {
    return await test.step(`Get search click through rate from database with filters`, async () => {
      const transformedQuery = await this.transformQueryWithFilters({ baseQuery: query, filterBy });
      const result = await this.executeQuery(transformedQuery);

      if (result.length === 0) {
        return '0 (0%)';
      }

      const formattedResult = result[0].FORMATTED_RESULT;
      return formattedResult || '0 (0%)';
    });
  }

  /**
   * Gets no results search data from database with filters applied.
   * @param query - The SQL query string (should return no results search data)
   * @param filterBy - Filter options (locations, departments, etc.)
   * @returns Promise<string> - Formatted no results search string
   */
  async getNoResultsSearchFromDBWithFilters(query: string, filterBy: FilterOptions): Promise<string> {
    return await test.step(`Get no results search from database with filters`, async () => {
      const transformedQuery = await this.transformQueryWithFilters({ baseQuery: query, filterBy });
      const result = await this.executeQuery(transformedQuery);

      if (result.length === 0) {
        return '0 (0%)';
      }

      const formattedResult = result[0].FORMATTED_RESULT;
      return formattedResult || '0 (0%)';
    });
  }

  /**
   * Gets average searches per logged in user data from database with filters applied.
   * @param query - The SQL query string (should return average searches per logged in user data)
   * @param filterBy - Filter options (locations, departments, etc.)
   * @returns Promise<number> - Average searches per logged in user
   */
  async getAverageSearchesPerLoggedInUserFromDBWithFilters(query: string, filterBy: FilterOptions): Promise<number> {
    return await test.step(`Get average searches per logged in user from database with filters`, async () => {
      const transformedQuery = await this.transformQueryWithFilters({ baseQuery: query, filterBy });
      const result = await this.executeQuery(transformedQuery);

      if (!result || result.length === 0) return 0;

      let finalRatio = Number(result[0].FINAL_RATIO ?? 0);
      finalRatio = Math.round(finalRatio * 100) / 100;

      return isNaN(finalRatio) ? 0 : finalRatio;
    });
  }

  /**
   * Gets top search queries data from database with filters applied.
   * @param query - The SQL query string (should return top search queries data)
   * @param filterBy - Filter options (locations, departments, etc.)
   * @returns Promise<any[]> - Array of top search queries records
   */
  async getTopSearchQueriesFromDBWithFilters(query: string, filterBy: FilterOptions): Promise<any[]> {
    return await test.step(`Get top search queries from database with filters`, async () => {
      const transformedQuery = await this.transformQueryWithFilters({ baseQuery: query, filterBy });
      const result = await this.executeQuery(transformedQuery);
      return result;
    });
  }

  /**
   * Gets top search queries with no clickthrough data from database with filters applied.
   * @param query - The SQL query string (should return top search queries with no clickthrough data)
   * @param filterBy - Filter options (locations, departments, etc.)
   * @param forCSVValidation - If true, converts no_click_rate from percentage to decimal format
   * @returns Promise<any[]> - Array of top search queries with no clickthrough records
   */
  async getTopSearchQueriesWithNoClickthroughFromDBWithFilters(
    query: string,
    filterBy: FilterOptions,
    forCSVValidation: boolean = false
  ): Promise<any[]> {
    return await test.step(`Get top search queries with no clickthrough from database with filters`, async () => {
      const transformedQuery = await this.transformQueryWithFilters({ baseQuery: query, filterBy });
      const result = await this.executeQuery(transformedQuery);

      if (forCSVValidation) {
        return result.map((item: any) => {
          const noClickCountValue = Number(item.NO_CLICK_COUNT || item.no_click_count);
          const noClickRateValue = item.NO_CLICK_RATE || item.no_click_rate;

          let noClickRateDecimal: number;
          if (typeof noClickRateValue === 'string') {
            const cleanValue = noClickRateValue.replace('%', '').trim();
            const percentageValue = parseFloat(cleanValue);
            noClickRateDecimal = isNaN(percentageValue) ? 0 : percentageValue / 100;
          } else if (typeof noClickRateValue === 'number') {
            noClickRateDecimal = noClickRateValue > 1 ? noClickRateValue / 100 : noClickRateValue;
          } else {
            noClickRateDecimal = 0;
          }

          return {
            SEARCH_TERM: item.SEARCH_TERM || item.search_term,
            search_term: item.SEARCH_TERM || item.search_term,
            TOTAL_SEARCH: Number(item.TOTAL_SEARCH || item.total_search),
            total_search: Number(item.TOTAL_SEARCH || item.total_search),
            NO_CLICK_COUNT: isNaN(noClickCountValue) ? 0 : noClickCountValue,
            no_click_count: isNaN(noClickCountValue) ? 0 : noClickCountValue,
            NO_CLICK_RATE: noClickRateDecimal,
            no_click_rate: noClickRateDecimal,
          };
        });
      }

      return result;
    });
  }

  /**
   * Gets top clickthrough types data from database with filters applied.
   * @param query - The SQL query string (should return top clickthrough types data)
   * @param filterBy - Filter options (locations, departments, etc.)
   * @returns Promise<any[]> - Array of top clickthrough types records
   */
  async getTopClickthroughTypesFromDBWithFilters(query: string, filterBy: FilterOptions): Promise<any[]> {
    return await test.step(`Get top clickthrough types from database with filters`, async () => {
      const transformedQuery = await this.transformQueryWithFilters({ baseQuery: query, filterBy });
      const result = await this.executeQuery(transformedQuery);
      return result;
    });
  }

  /**
   * Gets no result search queries data from database with filters applied.
   * @param query - The SQL query string (should return no result search queries data)
   * @param filterBy - Filter options (locations, departments, etc.)
   * @returns Promise<any[]> - Array of no result search queries records
   */
  async getNoResultSearchQueriesFromDBWithFilters(query: string, filterBy: FilterOptions): Promise<any[]> {
    return await test.step(`Get no result search queries from database with filters`, async () => {
      // Get base filter strings (they use 'u' alias by default)
      const baseLocationFilter = this.addLocationFilter(filterBy.locations);
      const baseDepartmentFilter = this.addDepartmentFilter(filterBy.departments);

      // Create filter strings with correct aliases for each subquery
      const locationFilterU2 = baseLocationFilter.replace(/u\.location/g, 'u2.location');
      const departmentFilterU2 = baseDepartmentFilter.replace(/u\.department/g, 'u2.department');
      const locationFilterU3 = baseLocationFilter.replace(/u\.location/g, 'u3.location');
      const departmentFilterU3 = baseDepartmentFilter.replace(/u\.department/g, 'u3.department');

      // Replace placeholders in first subquery (u2) - must be done before base helper replacement
      // Match the first subquery pattern: SELECT COUNT(*) ... FROM udl.search s2 ... INNER JOIN udl.user u2
      query = query.replace(
        /(SELECT COUNT\(\*\)[\s\S]*?INNER JOIN udl\.user u2[\s\S]*?WHERE[\s\S]*?)\{locationFilter\}/,
        `$1${locationFilterU2}`
      );
      query = query.replace(
        /(SELECT COUNT\(\*\)[\s\S]*?INNER JOIN udl\.user u2[\s\S]*?WHERE[\s\S]*?)\{departmentFilter\}/,
        `$1${departmentFilterU2}`
      );

      // Replace placeholders in second subquery (u3) - must be done before base helper replacement
      // Match the second subquery pattern: SELECT COUNT(*) ... FROM udl.search s3 ... INNER JOIN udl.user u3
      query = query.replace(
        /(SELECT COUNT\(\*\)[\s\S]*?INNER JOIN udl\.user u3[\s\S]*?WHERE[\s\S]*?)\{locationFilter\}/,
        `$1${locationFilterU3}`
      );
      query = query.replace(
        /(SELECT COUNT\(\*\)[\s\S]*?INNER JOIN udl\.user u3[\s\S]*?WHERE[\s\S]*?)\{departmentFilter\}/,
        `$1${departmentFilterU3}`
      );

      // Now use base helper to replace tenantCode, dates, and remaining filters (u alias)
      const transformedQuery = await this.transformQueryWithFilters({ baseQuery: query, filterBy });

      const result = await this.executeQuery(transformedQuery);
      return result;
    });
  }

  /**
   * Gets most searches performed by department data from database with filters applied.
   * @param query - The SQL query string (should return most searches performed by department data)
   * @param filterBy - Filter options (locations, departments, etc.)
   * @returns Promise<any[]> - Array of most searches performed by department records
   */
  async getMostSearchesPerformedByDepartmentFromDBWithFilters(query: string, filterBy: FilterOptions): Promise<any[]> {
    return await test.step(`Get most searches performed by department from database with filters`, async () => {
      const transformedQuery = await this.transformQueryWithFilters({ baseQuery: query, filterBy });
      const result = await this.executeQuery(transformedQuery);
      return result;
    });
  }

  /**
   * Gets search usage volume and click through rate data from database with filters applied.
   * @param query - The SQL query string (should return search usage volume and click through rate data)
   * @param filterBy - Filter options (locations, departments, etc.)
   * @returns Promise<any[]> - Array of search usage volume and click through rate records
   */
  async getSearchUsageVolumeAndClickThroughRateFromDBWithFilters(
    query: string,
    filterBy: FilterOptions
  ): Promise<any[]> {
    return await test.step(`Get search usage volume and click through rate from database with filters`, async () => {
      const transformedQuery = await this.transformQueryWithFilters({ baseQuery: query, filterBy });
      const result = await this.executeQuery(transformedQuery);
      return result;
    });
  }
}
