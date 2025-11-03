import { test } from '@playwright/test';

import { BaseAnalyticsQueryHelper } from './baseAnalyticsQueryHelper';
import { DateHelper, PeriodFilterOption } from './dateHelper';
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
      // Replace date placeholders
      const dateReplacements = DateHelper.getDateReplacements(
        timePeriod as PeriodFilterOption,
        customStartDate,
        customEndDate
      );
      query = query.replace('{startDate}', dateReplacements.startDate);
      query = query.replace('{endDate}', dateReplacements.endDate);

      const result = await this.executeQuery(query);

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
      // Replace date placeholders
      const dateReplacements = DateHelper.getDateReplacements(
        timePeriod as PeriodFilterOption,
        customStartDate,
        customEndDate
      );
      query = query.replace('{startDate}', dateReplacements.startDate);
      query = query.replace('{endDate}', dateReplacements.endDate);

      const result = await this.executeQuery(query);

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
      // Replace date placeholders
      const dateReplacements = DateHelper.getDateReplacements(
        timePeriod as PeriodFilterOption,
        customStartDate,
        customEndDate
      );
      query = query.replace('{startDate}', dateReplacements.startDate);
      query = query.replace('{endDate}', dateReplacements.endDate);

      const result = await this.executeQuery(query);

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
      const { startDate, endDate } = DateHelper.getDateReplacements(
        timePeriod as PeriodFilterOption,
        customStartDate,
        customEndDate
      );

      // Use regular expressions to replace all occurrences
      query = query
        .replace(/\{startDate\}/g, startDate)
        .replace(/\{endDate\}/g, endDate)
        .replace(/\{orgId\}/g, this.orgId); // Or your method of getting orgId

      const result = await this.executeQuery(query);
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
      // Replace date placeholders
      const dateReplacements = DateHelper.getDateReplacements(
        timePeriod as PeriodFilterOption,
        customStartDate,
        customEndDate
      );
      query = query.replace('{startDate}', dateReplacements.startDate);
      query = query.replace('{endDate}', dateReplacements.endDate);

      const result = await this.executeQuery(query);
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
      // Replace date placeholders
      const dateReplacements = DateHelper.getDateReplacements(
        timePeriod as PeriodFilterOption,
        customStartDate,
        customEndDate
      );
      query = query.replace('{startDate}', dateReplacements.startDate);
      query = query.replace('{endDate}', dateReplacements.endDate);

      const result = await this.executeQuery(query);

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
      // Replace date placeholders using regular expressions
      const dateReplacements = DateHelper.getDateReplacements(
        timePeriod as PeriodFilterOption,
        customStartDate,
        customEndDate
      );

      // Replace all occurrences using regular expressions
      query = query.replace(/{startDate}/g, dateReplacements.startDate);
      query = query.replace(/{endDate}/g, dateReplacements.endDate);

      const result = await this.executeQuery(query);
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
      // Replace date placeholders using regular expressions
      const dateReplacements = DateHelper.getDateReplacements(
        timePeriod as PeriodFilterOption,
        customStartDate,
        customEndDate
      );

      // Replace all occurrences using regular expressions
      query = query.replace(/{startDate}/g, dateReplacements.startDate);
      query = query.replace(/{endDate}/g, dateReplacements.endDate);

      const result = await this.executeQuery(query);
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
      // Replace date placeholders using regular expressions
      const dateReplacements = DateHelper.getDateReplacements(
        timePeriod as PeriodFilterOption,
        customStartDate,
        customEndDate
      );

      // Replace all occurrences using regular expressions
      query = query.replace(/{startDate}/g, dateReplacements.startDate);
      query = query.replace(/{endDate}/g, dateReplacements.endDate);

      const result = await this.executeQuery(query);
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
      // Replace date placeholders using regular expressions
      const dateReplacements = DateHelper.getDateReplacements(
        timePeriod as PeriodFilterOption,
        customStartDate,
        customEndDate
      );

      // Replace all occurrences using regular expressions (needed for queries with multiple date references)
      query = query.replace(/{startDate}/g, dateReplacements.startDate);
      query = query.replace(/{endDate}/g, dateReplacements.endDate);
      query = query.replace(/{orgId}/g, this.orgId);

      const result = await this.executeQuery(query);
      return result;
    });
  }
}
