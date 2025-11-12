import { MobileSql } from '../sqlQueries/mobile';

import { BaseAnalyticsQueryHelper, FilterOptions, SnowflakeHelper } from '.';

export interface MobileDeviceLoginsData {
  platform: string;
  count: number;
  percentage: number;
}

export interface MobileContentViewsByTypeData {
  contentType: string;
  count: number;
  percentage: number;
}

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

  /**
   * Transforms raw database results to typed MobileDeviceLoginsData objects
   * @param rawResults - Raw results from database query
   * @returns MobileDeviceLoginsData[] - Properly typed and transformed data with percentages
   */
  private transformMobileDeviceLoginsResults(rawResults: any[]): MobileDeviceLoginsData[] {
    if (rawResults.length === 0) {
      return [];
    }

    const result = rawResults[0];
    const transformedData: MobileDeviceLoginsData[] = [];

    // Always include all three platforms to match UI behavior
    // Android only - UI shows "Android logins"
    transformedData.push({
      platform: 'Android logins',
      count: Number(result.ANDROID_ONLY || 0),
      percentage: Number(result.ANDROID_PERCENTAGE || 0),
    });

    // iOS only - UI shows "IOS logins"
    transformedData.push({
      platform: 'IOS logins',
      count: Number(result.IOS_ONLY || 0),
      percentage: Number(result.IOS_PERCENTAGE || 0),
    });

    // Both - UI shows "Both iOS and android logins"
    transformedData.push({
      platform: 'Both iOS and android logins',
      count: Number(result.BOTH || 0),
      percentage: Number(result.BOTH_PERCENTAGE || 0),
    });

    return transformedData;
  }

  /**
   * Gets mobile device logins data from database with filters.
   * @param filterBy - Filter options including time period and user filters
   * @returns Promise<MobileDeviceLoginsData[]> - Mobile device logins data
   */
  async getMobileDeviceLoginsDataFromDBWithFilters({
    filterBy,
  }: {
    filterBy: FilterOptions;
  }): Promise<MobileDeviceLoginsData[]> {
    const finalQuery = await this.transformQueryWithFilters({
      baseQuery: MobileSql.MOBILE_DEVICE_LOGINS,
      filterBy,
    });

    const rawResults = await this.executeQuery(finalQuery);
    return this.transformMobileDeviceLoginsResults(rawResults);
  }

  /**
   * Transforms raw database results to typed MobileContentViewsByTypeData objects
   * @param rawResults - Raw results from database query
   * @returns MobileContentViewsByTypeData[] - Properly typed and transformed data with percentages
   */
  private transformMobileContentViewsByTypeResults(rawResults: any[]): MobileContentViewsByTypeData[] {
    if (rawResults.length === 0) {
      return [];
    }

    const result = rawResults[0];
    const transformedData: MobileContentViewsByTypeData[] = [];

    // Page views - UI shows "Page" (based on ContentType enum)
    const pageViewCount = Number(result.PAGE_VIEW || 0);
    if (pageViewCount > 0) {
      transformedData.push({
        contentType: 'Page',
        count: pageViewCount,
        percentage: Number(result.PAGE_VIEW_PERCENTAGE || 0),
      });
    }

    // Event views - UI shows "Event" (based on ContentType enum)
    const eventViewCount = Number(result.EVENT_VIEW || 0);
    if (eventViewCount > 0) {
      transformedData.push({
        contentType: 'Event',
        count: eventViewCount,
        percentage: Number(result.EVENT_VIEW_PERCENTAGE || 0),
      });
    }

    // Album views - UI shows "Album" (based on ContentType enum)
    const albumViewCount = Number(result.ALBUM_VIEW || 0);
    if (albumViewCount > 0) {
      transformedData.push({
        contentType: 'Album',
        count: albumViewCount,
        percentage: Number(result.ALBUM_VIEW_PERCENTAGE || 0),
      });
    }

    return transformedData;
  }

  /**
   * Gets mobile content views by type data from database with filters.
   * @param filterBy - Filter options including time period and user filters
   * @returns Promise<MobileContentViewsByTypeData[]> - Mobile content views by type data
   */
  async getMobileContentViewsByTypeDataFromDBWithFilters({
    filterBy,
  }: {
    filterBy: FilterOptions;
  }): Promise<MobileContentViewsByTypeData[]> {
    const finalQuery = await this.transformQueryWithFilters({
      baseQuery: MobileSql.MOBILE_CONTENT_VIEWS_BY_TYPE,
      filterBy,
    });

    const rawResults = await this.executeQuery(finalQuery);
    return this.transformMobileContentViewsByTypeResults(rawResults);
  }
}
