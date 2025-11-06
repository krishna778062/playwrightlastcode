import { MobileSql } from '../sqlQueries/mobile';

import { BaseAnalyticsQueryHelper, FilterOptions, SnowflakeHelper } from '.';

export class MobileDashboardQueryHelper extends BaseAnalyticsQueryHelper {
  constructor(snowflakeHelper: SnowflakeHelper, orgId: string) {
    super(snowflakeHelper, orgId);
  }

  /**
   * Gets total users data from database with filters.
   * @param filterBy - Filter options including time period and user filters
   * @returns Promise<number> - Total users data
   */
  async getTotalUsersDataFromDBWithFilters({ filterBy }: { filterBy: FilterOptions }): Promise<number> {
    const finalQuery = await this.transformQueryWithFilters({
      baseQuery: MobileSql.TOTAL_USERS,
      filterBy,
    });
    return await this.getHeroMetricDataFromDB(finalQuery);
  }

  /**
   * Gets mobile logged in users data from database with filters.
   * @param filterBy - Filter options including time period and user filters
   * @returns Promise<number> - Mobile logged in users data
   */
  async getMobileLoggedInUsersDataFromDBWithFilters({ filterBy }: { filterBy: FilterOptions }): Promise<number> {
    const finalQuery = await this.transformQueryWithFilters({
      baseQuery: MobileSql.MOBILE_LOGGED_IN_USERS,
      filterBy,
    });
    return await this.getHeroMetricDataFromDB(finalQuery);
  }

  /**
   * Gets mobile content viewers data from database with filters.
   * @param filterBy - Filter options including time period and user filters
   * @returns Promise<number> - Mobile content viewers data
   */
  async getMobileContentViewersDataFromDBWithFilters({ filterBy }: { filterBy: FilterOptions }): Promise<number> {
    const finalQuery = await this.transformQueryWithFilters({
      baseQuery: MobileSql.MOBILE_CONTENT_VIEWERS,
      filterBy,
    });
    return await this.getHeroMetricDataFromDB(finalQuery);
  }

  /**
   * Gets total mobile content views data from database with filters.
   * @param filterBy - Filter options including time period and user filters
   * @returns Promise<number> - Total mobile content views data
   */
  async getTotalMobileContentViewsDataFromDBWithFilters({ filterBy }: { filterBy: FilterOptions }): Promise<number> {
    const finalQuery = await this.transformQueryWithFilters({
      baseQuery: MobileSql.TOTAL_MOBILE_CONTENT_VIEWS,
      filterBy,
    });
    return await this.getHeroMetricDataFromDB(finalQuery);
  }

  /**
   * Gets average mobile content views per user data from database with filters.
   * @param filterBy - Filter options including time period and user filters
   * @returns Promise<number> - Average mobile content views per user data
   */
  async getAvgMobileContentViewsPerUserDataFromDBWithFilters({
    filterBy,
  }: {
    filterBy: FilterOptions;
  }): Promise<number> {
    const finalQuery = await this.transformQueryWithFilters({
      baseQuery: MobileSql.AVG_MOBILE_CONTENT_VIEWS_PER_USER,
      filterBy,
    });
    return await this.getHeroMetricDataFromDB(finalQuery);
  }

  /**
   * Gets unique mobile content views data from database with filters.
   * @param filterBy - Filter options including time period and user filters
   * @returns Promise<number> - Unique mobile content views data
   */
  async getUniqueMobileContentViewsDataFromDBWithFilters({ filterBy }: { filterBy: FilterOptions }): Promise<number> {
    const finalQuery = await this.transformQueryWithFilters({
      baseQuery: MobileSql.UNIQUE_MOBILE_CONTENT_VIEWS,
      filterBy,
    });
    return await this.getHeroMetricDataFromDB(finalQuery);
  }
}
