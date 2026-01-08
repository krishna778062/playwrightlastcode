import { FilesSql } from '../sqlQueries/files';

import { BaseAnalyticsQueryHelper, FilterOptions } from './baseAnalyticsQueryHelper';
import { SnowflakeHelper } from './snowflakeHelper';

/**
 * Files Dashboard Query Helper
 * Provides methods to query Files dashboard metrics from Snowflake
 */
export class FilesDashboardQueryHelper extends BaseAnalyticsQueryHelper {
  constructor(snowflakeHelper: SnowflakeHelper, orgId: string) {
    super(snowflakeHelper, orgId);
  }

  /**
   * Gets total views data from database with filters applied.
   * @param filterBy - Filter options including time period and user filters
   * @returns Promise<number> - Total views count
   */
  async getTotalViewsFromDBWithFilters({ filterBy }: { filterBy: FilterOptions }): Promise<number> {
    const finalQuery = await this.transformQueryWithFilters({
      baseQuery: FilesSql.TOTAL_VIEWS,
      filterBy: { ...filterBy, tenantCode: this.orgId },
    });
    return await this.getHeroMetricDataFromDB(finalQuery);
  }

  /**
   * Gets total downloads data from database with filters applied.
   * @param filterBy - Filter options including time period and user filters
   * @returns Promise<number> - Total downloads count
   */
  async getDownloadsFromDBWithFilters({ filterBy }: { filterBy: FilterOptions }): Promise<number> {
    const finalQuery = await this.transformQueryWithFilters({
      baseQuery: FilesSql.TOTAL_DOWNLOADS,
      filterBy: { ...filterBy, tenantCode: this.orgId },
    });
    return await this.getHeroMetricDataFromDB(finalQuery);
  }

  /**
   * Gets total favourites data from database with filters applied.
   * @param filterBy - Filter options including time period and user filters
   * @returns Promise<number> - Total favourites count
   */
  async getFavouritesFromDBWithFilters({ filterBy }: { filterBy: FilterOptions }): Promise<number> {
    const finalQuery = await this.transformQueryWithFilters({
      baseQuery: FilesSql.TOTAL_FAVOURITES,
      filterBy: { ...filterBy, tenantCode: this.orgId },
    });
    return await this.getHeroMetricDataFromDB(finalQuery);
  }

  /**
   * Gets total reactions data from database with filters applied.
   * @param filterBy - Filter options including time period and user filters
   * @returns Promise<number> - Total reactions count
   */
  async getReactionsFromDBWithFilters({ filterBy }: { filterBy: FilterOptions }): Promise<number> {
    const finalQuery = await this.transformQueryWithFilters({
      baseQuery: FilesSql.TOTAL_REACTIONS,
      filterBy: { ...filterBy, tenantCode: this.orgId },
    });
    return await this.getHeroMetricDataFromDB(finalQuery);
  }

  /**
   * Gets total unique views data from database with filters applied.
   * @param filterBy - Filter options including time period and user filters
   * @returns Promise<number> - Total unique views count (distinct file-user-date combinations)
   */
  async getUniqueViewsFromDBWithFilters({ filterBy }: { filterBy: FilterOptions }): Promise<number> {
    const finalQuery = await this.transformQueryWithFilters({
      baseQuery: FilesSql.TOTAL_UNIQUE_VIEWS,
      filterBy: { ...filterBy, tenantCode: this.orgId },
    });
    return await this.getHeroMetricDataFromDB(finalQuery);
  }
}
