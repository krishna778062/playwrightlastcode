import { format } from 'date-fns';

import { MobileSql } from '../sqlQueries/mobile';

import { BaseAnalyticsQueryHelper, FilterOptions, SnowflakeHelper } from '.';

/**
 * Interface for Mobile Adoption Rate data
 * Note: userCode is used in SQL GROUP BY but excluded from CSV comparison
 */
export interface MobileAdoptionRateData {
  fullName: string;
  email: string;
  title: string;
  companyName: string;
  division: string;
  department: string;
  city: string;
  state: string;
  country: string;
  dateOfLastLogin: string;
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

  async getMobileAdoptionRateDataFromDBWithFilters({
    filterBy,
  }: {
    filterBy: FilterOptions;
  }): Promise<MobileAdoptionRateData[]> {
    const finalQuery = await this.transformQueryWithFilters({
      baseQuery: MobileSql.MOBILE_ADOPTION_RATE_CSV,
      filterBy,
    });

    const rawResults = await this.executeQuery(finalQuery);
    return this.transformMobileAdoptionRateResults(rawResults);
  }

  /**
   * Transforms raw database results for mobile adoption rate data
   * Note: user_code is excluded as it's only used in SQL GROUP BY, not in CSV
   * @param rawResults - Raw results from database query
   * @returns Transformed data in expected format (without userCode)
   */
  private transformMobileAdoptionRateResults(rawResults: any[]): MobileAdoptionRateData[] {
    return rawResults.map(result => {
      // Format date to YYYY-MM-DD to match CSV format
      const dateOfLastLogin = result.DATE_OF_LAST_LOGIN
        ? format(new Date(result.DATE_OF_LAST_LOGIN), 'yyyy-MM-dd')
        : '';

      return {
        fullName: result.FULL_NAME || '',
        email: result.EMAIL || '',
        title: result.TITLE || 'Undefined',
        companyName: result.COMPANY_NAME || 'Undefined',
        division: result.DIVISION || 'Undefined',
        department: result.DEPARTMENT || 'Undefined',
        city: result.CITY || 'Undefined',
        state: result.STATE || 'Undefined',
        country: result.COUNTRY || 'Undefined',
        dateOfLastLogin,
      };
    });
  }
}
