import { ContentSql } from '../sqlQueries/content';

import { BaseAnalyticsQueryHelper, FilterOptions, SnowflakeHelper } from '.';

export interface CurrentlyPublishedData {
  contentTypeCode: string;
  contentTypeName: string;
  contentCount: number;
}

export class ContentDashboardQueryHelper extends BaseAnalyticsQueryHelper {
  constructor(snowflakeHelper: SnowflakeHelper, orgId: string) {
    super(snowflakeHelper, orgId);
  }

  /**
   * Adds user join conditionally when user-based filters are present
   */
  private addUserJoinIfNeeded(filterBy: FilterOptions): string {
    const hasUserFilters =
      (filterBy.locations && filterBy.locations.length > 0) ||
      (filterBy.departments && filterBy.departments.length > 0) ||
      (filterBy.segments && filterBy.segments.length > 0) ||
      (filterBy.userCategories && filterBy.userCategories.length > 0) ||
      (filterBy.companyName && filterBy.companyName.length > 0);

    if (hasUserFilters) {
      return `inner join SIMPPLR_COMMON_TENANT.udl.vw_user_as_is u on i.interacted_by_user_code = u.code and i.tenant_code = u.tenant_code`;
    }
    return '';
  }

  /**
   * Gets total content views data from database with filters.
   * @param filterBy - Filter options including time period and user filters
   * @returns Promise<number> - Total content views count
   */
  async getTotalContentViewsDataFromDBWithFilters({ filterBy }: { filterBy: FilterOptions }): Promise<number> {
    let query = await this.transformQueryWithFilters({
      baseQuery: ContentSql.TOTAL_CONTENT_VIEWS,
      filterBy,
    });

    // Replace userJoin placeholder
    query = query.replace(/{userJoin}/g, this.addUserJoinIfNeeded(filterBy));

    return await this.getHeroMetricDataFromDB(query);
  }

  /**
   * Gets total content published data from database with filters.
   * @param filterBy - Filter options including time period
   * @returns Promise<number> - Total content published count
   */
  async getTotalContentPublishedDataFromDBWithFilters({ filterBy }: { filterBy: FilterOptions }): Promise<number> {
    const finalQuery = await this.transformQueryWithFilters({
      baseQuery: ContentSql.TOTAL_CONTENT_PUBLISHED,
      filterBy,
    });
    return await this.getHeroMetricDataFromDB(finalQuery);
  }

  /**
   * Gets unique content view data from database with filters.
   * @param filterBy - Filter options including time period and user filters
   * @returns Promise<number> - Unique content view count
   */
  async getUniqueContentViewDataFromDBWithFilters({ filterBy }: { filterBy: FilterOptions }): Promise<number> {
    let query = await this.transformQueryWithFilters({
      baseQuery: ContentSql.UNIQUE_CONTENT_VIEW,
      filterBy,
    });

    // Replace userJoin placeholder
    query = query.replace(/{userJoin}/g, this.addUserJoinIfNeeded(filterBy));

    return await this.getHeroMetricDataFromDB(query);
  }

  /**
   * Maps content type code to display name
   */
  private mapContentTypeCodeToName(code: string): string {
    const mapping: Record<string, string> = {
      CT001: 'Blog Post',
      CT002: 'Page',
      CT003: 'Event',
      CT004: 'Album',
    };
    return mapping[code] || code;
  }

  /**
   * Gets currently published content data from database.
   * @param filterBy - Filter options (currently no filters are applied to this metric)
   * @returns Promise<CurrentlyPublishedData[]> - Array of content type and count
   */
  async getCurrentlyPublishedDataFromDBWithFilters({
    filterBy,
  }: {
    filterBy: FilterOptions;
  }): Promise<CurrentlyPublishedData[]> {
    const finalQuery = await this.transformQueryWithFilters({
      baseQuery: ContentSql.CURRENTLY_PUBLISHED,
      filterBy,
    });

    const results = await this.executeQuery(finalQuery);

    return results.map((row: any) => ({
      contentTypeCode: row.CONTENT_TYPE_CODE,
      contentTypeName: this.mapContentTypeCodeToName(row.CONTENT_TYPE_CODE),
      contentCount: Number(row.CONTENT_COUNT),
    }));
  }
}
