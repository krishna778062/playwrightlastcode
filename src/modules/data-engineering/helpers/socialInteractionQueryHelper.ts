import { GroupByOnUserParameter } from '../constants/filters';
import { SocialInteractionSql } from '../sqlQueries/social-interaction';

import { BaseAnalyticsQueryHelper, FilterOptions } from './baseAnalyticsQueryHelper';
import { SnowflakeHelper } from './snowflakeHelper';

/**
 * Social Interaction Dashboard Query Helper
 * Handles all database operations specific to the Social Interaction dashboard
 * Extends BaseAnalyticsQueryHelper to inherit common database operations
 */
export class SocialInteractionDashboardQueryHelper extends BaseAnalyticsQueryHelper {
  constructor(snowflakeHelper: SnowflakeHelper, orgId: string) {
    super(snowflakeHelper, orgId);
  }

  /**
   * Gets reaction count data from database with filters applied
   * @param filterBy - Filter options including time period and other filters
   * @returns Promise<number> - Reaction count value
   */
  async getReactionCountDataFromDBWithFilters({ filterBy }: { filterBy: FilterOptions }): Promise<number> {
    const finalQuery = await this.transformQueryWithFilters({
      baseQuery: SocialInteractionSql.Reaction_Count,
      filterBy,
    });
    return await this.getHeroMetricDataFromDB(finalQuery);
  }

  /**
   * Gets feed posts and comments count data from database with filters applied
   * @param filterBy - Filter options including time period and other filters
   * @returns Promise<number> - Feed posts and comments count value
   */
  async getFeedPostsAndCommentsCountDataFromDBWithFilters({ filterBy }: { filterBy: FilterOptions }): Promise<number> {
    const finalQuery = await this.transformQueryWithFilters({
      baseQuery: SocialInteractionSql.Feed_Posts_Comments_Count,
      filterBy,
    });
    return await this.getHeroMetricDataFromDB(finalQuery);
  }

  /**
   * Gets replies count data from database with filters applied
   * @param filterBy - Filter options including time period and other filters
   * @returns Promise<number> - Replies count value
   */
  async getRepliesCountDataFromDBWithFilters({ filterBy }: { filterBy: FilterOptions }): Promise<number> {
    const finalQuery = await this.transformQueryWithFilters({
      baseQuery: SocialInteractionSql.Replies_Count,
      filterBy,
    });
    return await this.getHeroMetricDataFromDB(finalQuery);
  }

  /**
   * Gets shares count data from database with filters applied
   * @param filterBy - Filter options including time period and other filters
   * @returns Promise<number> - Shares count value
   */
  async getSharesCountDataFromDBWithFilters({ filterBy }: { filterBy: FilterOptions }): Promise<number> {
    const finalQuery = await this.transformQueryWithFilters({
      baseQuery: SocialInteractionSql.Shares_Count,
      filterBy,
    });
    return await this.getHeroMetricDataFromDB(finalQuery);
  }

  /**
   * Gets favorites count data from database with filters applied
   * @param filterBy - Filter options including time period and other filters
   * @returns Promise<number> - Favorites count value
   */
  async getFavoritesCountDataFromDBWithFilters({ filterBy }: { filterBy: FilterOptions }): Promise<number> {
    const finalQuery = await this.transformQueryWithFilters({
      baseQuery: SocialInteractionSql.Favorites_Count,
      filterBy,
    });
    return await this.getHeroMetricDataFromDB(finalQuery);
  }

  /**
   * Gets campaign share data from database with filters applied
   * @param filterBy - Filter options including time period and other filters
   * @returns Promise<any[]> - Campaign share data records
   */
  async getCampaignShareDataFromDBWithFilters({ filterBy }: { filterBy: FilterOptions }): Promise<any[]> {
    const finalQuery = await this.transformQueryWithFilters({
      baseQuery: SocialInteractionSql.Social_Campaign_Shares,
      filterBy,
    });
    return await this.executeQuery(finalQuery);
  }

  /**
   * Maps GroupByOnUserParameter enum to SQL column name
   */
  private mapGroupByToColumnName(groupBy?: GroupByOnUserParameter): string {
    switch (groupBy) {
      case GroupByOnUserParameter.LOCATION:
        return 'location';
      case GroupByOnUserParameter.SEGMENT:
        return 'segment_name';
      case GroupByOnUserParameter.USER_CATEGORY:
        return 'user_category_name';
      case GroupByOnUserParameter.DEPARTMENT:
      default:
        return 'department';
    }
  }

  /**
   * Maps GroupByOnUserParameter enum to display column name (for SQL output and UI)
   */
  private mapGroupByToDisplayColumnName(groupBy?: GroupByOnUserParameter): string {
    return groupBy || GroupByOnUserParameter.DEPARTMENT;
  }

  /**
   * Gets most engaged by department data from database with filters applied
   * @param filterBy - Filter options including time period, filters, and optional groupBy
   * @returns Promise<any[]> - Most engaged by department/location/user category data records
   */
  async getMostEngagedByDepartmentDataFromDBWithFilters({ filterBy }: { filterBy: FilterOptions }): Promise<any[]> {
    // Use groupBy from filterBy if provided, otherwise default to 'department'
    const userParameter = this.mapGroupByToColumnName(filterBy.groupBy);
    const columnName = this.mapGroupByToDisplayColumnName(filterBy.groupBy);
    let baseQuery = SocialInteractionSql.Most_Engaged_By_Department.replace('{userParameter}', userParameter);
    baseQuery = baseQuery.replace(/{columnName}/g, columnName);
    const finalQuery = await this.transformQueryWithFilters({
      baseQuery,
      filterBy,
    });
    return await this.executeQuery(finalQuery);
  }

  /**
   * Gets least engaged by department data from database with filters applied
   * @param filterBy - Filter options including time period, filters, and optional groupBy
   * @returns Promise<any[]> - Least engaged by department/location/user category data records
   */
  async getLeastEngagedByDepartmentDataFromDBWithFilters({ filterBy }: { filterBy: FilterOptions }): Promise<any[]> {
    // Use groupBy from filterBy if provided, otherwise default to 'department'
    const userParameter = this.mapGroupByToColumnName(filterBy.groupBy);
    const columnName = this.mapGroupByToDisplayColumnName(filterBy.groupBy);
    let baseQuery = SocialInteractionSql.Least_Engaged_By_Department.replace('{userParameter}', userParameter);
    baseQuery = baseQuery.replace(/{columnName}/g, columnName);
    const finalQuery = await this.transformQueryWithFilters({
      baseQuery,
      filterBy,
    });
    return await this.executeQuery(finalQuery);
  }

  /**
   * Gets participant engagement activity data from database with filters applied
   * @param filterBy - Filter options including time period and other filters
   * @returns Promise<any[]> - Participant engagement activity data records
   */
  async getParticipantEngagementActivityDataFromDBWithFilters({
    filterBy,
  }: {
    filterBy: FilterOptions;
  }): Promise<any[]> {
    const finalQuery = await this.transformQueryWithFilters({
      baseQuery: SocialInteractionSql.Participant_Engagement_Activity,
      filterBy,
    });
    return await this.executeQuery(finalQuery);
  }
}
