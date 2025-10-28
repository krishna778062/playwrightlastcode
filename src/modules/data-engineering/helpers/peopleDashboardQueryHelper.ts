import { PeopleSql } from '../sqlQueries/people';

import { BaseAnalyticsQueryHelper, FilterOptions } from './baseAnalyticsQueryHelper';
import { SnowflakeHelper } from './snowflakeHelper';

/**
 * People Dashboard Query Helper
 * Handles all database operations specific to the People dashboard
 * Extends BaseAnalyticsQueryHelper to inherit common database operations
 */
export class PeopleDashboardQueryHelper extends BaseAnalyticsQueryHelper {
  constructor(snowflakeHelper: SnowflakeHelper, orgId: string) {
    super(snowflakeHelper, orgId);
  }

  /**
   * Gets total users count from database with filters applied
   * @param filterBy - Filter options including time period and user filters
   * @returns Promise<number> - Total users count
   */
  async getTotalUsersDataFromDBWithFilters({ filterBy }: { filterBy: FilterOptions }): Promise<number> {
    const finalQuery = await this.transformQueryWithFilters({
      baseQuery: PeopleSql.TOTAL_USERS,
      filterBy,
    });
    return await this.getHeroMetricDataFromDB(finalQuery);
  }

  /**
   * Gets departments count from database with filters applied
   * @param filterBy - Filter options including time period and user filters
   * @returns Promise<number> - Departments count
   */
  async getDepartmentsCountDataFromDBWithFilters({ filterBy }: { filterBy: FilterOptions }): Promise<number> {
    const finalQuery = await this.transformQueryWithFilters({
      baseQuery: PeopleSql.DEPARTMENTS_COUNT,
      filterBy,
    });
    return await this.getHeroMetricDataFromDB(finalQuery);
  }

  /**
   * Gets locations count from database with filters applied
   * @param filterBy - Filter options including time period and user filters
   * @returns Promise<number> - Locations count
   */
  async getLocationsCountDataFromDBWithFilters({ filterBy }: { filterBy: FilterOptions }): Promise<number> {
    const finalQuery = await this.transformQueryWithFilters({
      baseQuery: PeopleSql.LOCATIONS_COUNT,
      filterBy,
    });
    return await this.getHeroMetricDataFromDB(finalQuery);
  }

  /**
   * Gets user category count from database with filters applied
   * @param filterBy - Filter options including time period and user filters
   * @returns Promise<number> - User category count
   */
  async getUserCategoryCountDataFromDBWithFilters({ filterBy }: { filterBy: FilterOptions }): Promise<number> {
    const finalQuery = await this.transformQueryWithFilters({
      baseQuery: PeopleSql.USER_CATEGORY_COUNT,
      filterBy,
    });
    return await this.getHeroMetricDataFromDB(finalQuery);
  }

  /**
   * Gets content published data (top 5 users) from database with filters applied
   * @param filterBy - Filter options including time period and user filters
   * @returns Promise<any[]> - Content published data records
   */
  async getContentPublishedDataFromDBWithFilters({ filterBy }: { filterBy: FilterOptions }): Promise<any[]> {
    const finalQuery = await this.transformQueryWithFilters({
      baseQuery: PeopleSql.CONTENT_PUBLISHED,
      filterBy,
    });
    return await this.executeQuery(finalQuery);
  }

  async getFavoritesReceivedDataFromDBWithFilters({ filterBy }: { filterBy: FilterOptions }): Promise<any[]> {
    const finalQuery = await this.transformQueryWithFilters({
      baseQuery: PeopleSql.FAVORITES_RECEIVED,
      filterBy,
    });
    return await this.executeQuery(finalQuery);
  }

  async getReactionsMadeDataFromDBWithFilters({ filterBy }: { filterBy: FilterOptions }): Promise<any[]> {
    const finalQuery = await this.transformQueryWithFilters({
      baseQuery: PeopleSql.REACTIONS_MADE,
      filterBy,
    });
    return await this.executeQuery(finalQuery);
  }

  async getReactionsReceivedDataFromDBWithFilters({ filterBy }: { filterBy: FilterOptions }): Promise<any[]> {
    const finalQuery = await this.transformQueryWithFilters({
      baseQuery: PeopleSql.REACTIONS_RECEIVED,
      filterBy,
    });
    return await this.executeQuery(finalQuery);
  }

  async getFeedPostsAndCommentsDataFromDBWithFilters({ filterBy }: { filterBy: FilterOptions }): Promise<any[]> {
    const finalQuery = await this.transformQueryWithFilters({
      baseQuery: PeopleSql.FEED_POSTS_AND_COMMENTS,
      filterBy,
    });
    return await this.executeQuery(finalQuery);
  }

  async getRepliesDataFromDBWithFilters({ filterBy }: { filterBy: FilterOptions }): Promise<any[]> {
    const finalQuery = await this.transformQueryWithFilters({
      baseQuery: PeopleSql.REPLIES,
      filterBy,
    });
    return await this.executeQuery(finalQuery);
  }

  async getRepliesFromOtherUsersDataFromDBWithFilters({ filterBy }: { filterBy: FilterOptions }): Promise<any[]> {
    const finalQuery = await this.transformQueryWithFilters({
      baseQuery: PeopleSql.REPLIES_FROM_OTHER_USERS,
      filterBy,
    });
    return await this.executeQuery(finalQuery);
  }

  async getSharesReceivedDataFromDBWithFilters({ filterBy }: { filterBy: FilterOptions }): Promise<any[]> {
    const finalQuery = await this.transformQueryWithFilters({
      baseQuery: PeopleSql.SHARES_RECEIVED,
      filterBy,
    });
    return await this.executeQuery(finalQuery);
  }

  async getProfileViewsDataFromDBWithFilters({ filterBy }: { filterBy: FilterOptions }): Promise<any[]> {
    const finalQuery = await this.transformQueryWithFilters({
      baseQuery: PeopleSql.PROFILE_VIEWS,
      filterBy,
    });
    return await this.executeQuery(finalQuery);
  }

  async getProfileCompletenessDataFromDB(): Promise<any[]> {
    // Profile completeness is time-independent, only needs tenant code
    const finalQuery = PeopleSql.PROFILE_COMPLETENESS.replace('{tenantCode}', this.orgId);
    return await this.executeQuery(finalQuery);
  }
}
