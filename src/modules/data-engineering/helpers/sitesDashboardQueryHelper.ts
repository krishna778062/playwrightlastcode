import { BaseAnalyticsQueryHelper, FilterOptions, SnowflakeHelper } from '@data-engineering/helpers';
import { SitesSql } from '@data-engineering/sqlQueries/sites';

export interface TotalSitesDistributionData {
  siteType: string;
  count: number;
  percentage: number;
}

export interface TotalSitesDistributionLast90DaysData {
  siteType: string;
  count: number;
}

export interface MostPopularSitesData {
  site_code: string;
  site_name: string;
  site_type_code: string;
  total_shares: number;
  total_views: number;
  total_likes: number;
  total_replies: number;
  total_comments: number;
  total_popularity: number;
}

export interface MostPublishedContentData {
  site_name: string;
  code: string;
  pages_count: number;
  events_count: number;
  albums_count: number;
  total_content: number;
}

export interface LowActivitySitesData {
  site_name: string;
  description: string;
  total_views: number;
}

export class SitesDashboardQueryHelper extends BaseAnalyticsQueryHelper {
  constructor(snowflakeHelper: SnowflakeHelper, orgId: string) {
    super(snowflakeHelper, orgId);
  }

  /**
   * Gets total sites data from database with filters.
   * @param filterBy - Filter options including time period and user filters
   * @returns Promise<number> - Total sites data
   */
  async getTotalSitesDataFromDBWithFilters({ filterBy }: { filterBy: FilterOptions }): Promise<number> {
    const finalQuery = await this.transformQueryWithFilters({
      baseQuery: SitesSql.TOTAL_SITES,
      filterBy,
    });
    return await this.getHeroMetricDataFromDB(finalQuery);
  }

  /**
   * Gets new sites created in last 90 days data from database with filters.
   * Note: This query always uses the last 90 days from current date and does not apply date filters.
   * @param filterBy - Filter options (only tenantCode is used, date filters are ignored)
   * @returns Promise<number> - New sites created in last 90 days data
   */
  async getNewSitesLast90DaysDataFromDBWithFilters({ filterBy }: { filterBy: FilterOptions }): Promise<number> {
    // Only replace tenantCode, do not apply date filters as the query calculates last 90 days directly
    const finalQuery = SitesSql.NEW_SITES_LAST_90_DAYS.replace(/{tenantCode}/g, filterBy.tenantCode);
    return await this.getHeroMetricDataFromDB(finalQuery);
  }

  /**
   * Gets featured sites data from database with filters.
   * @param filterBy - Filter options including time period and user filters
   * @returns Promise<number> - Featured sites data
   */
  async getFeaturedSitesDataFromDBWithFilters({ filterBy }: { filterBy: FilterOptions }): Promise<number> {
    const finalQuery = await this.transformQueryWithFilters({
      baseQuery: SitesSql.FEATURED_SITES,
      filterBy,
    });
    return await this.getHeroMetricDataFromDB(finalQuery);
  }

  /**
   * Gets total managers data from database with filters.
   * @param filterBy - Filter options including time period and user filters
   * @returns Promise<number> - Total managers data
   */
  async getTotalManagersDataFromDBWithFilters({ filterBy }: { filterBy: FilterOptions }): Promise<number> {
    const finalQuery = await this.transformQueryWithFilters({
      baseQuery: SitesSql.TOTAL_MANAGERS,
      filterBy,
    });
    return await this.getHeroMetricDataFromDB(finalQuery);
  }

  /**
   * Transforms raw database results to typed TotalSitesDistributionData objects
   * @param rawResults - Raw results from database query (single row with all site type data)
   * @returns TotalSitesDistributionData[] - Properly typed and transformed data with percentages
   */
  private transformTotalSitesDistributionResults(rawResults: any[]): TotalSitesDistributionData[] {
    if (rawResults.length === 0) {
      return [];
    }

    const result = rawResults[0];
    const distributionData: TotalSitesDistributionData[] = [];

    // Get total sites count for percentage calculation
    const totalSites = Number(result.TOTAL_SITES);

    // Add Public sites
    if (result.PUBLIC_SITES > 0) {
      const count = Number(result.PUBLIC_SITES);
      // Calculate percentage with 2 decimal places to match UI display
      const percentage = totalSites > 0 ? Math.round((count / totalSites) * 100 * 100) / 100 : 0;
      distributionData.push({
        siteType: 'Public',
        count,
        percentage,
      });
    }

    // Add Private sites
    if (result.PRIVATE_SITES > 0) {
      const count = Number(result.PRIVATE_SITES);
      // Calculate percentage with 2 decimal places to match UI display
      const percentage = totalSites > 0 ? Math.round((count / totalSites) * 100 * 100) / 100 : 0;
      distributionData.push({
        siteType: 'Private',
        count,
        percentage,
      });
    }

    // Add Unlisted sites
    if (result.UNLISTED_SITES > 0) {
      const count = Number(result.UNLISTED_SITES);
      // Calculate percentage with 2 decimal places to match UI display
      const percentage = totalSites > 0 ? Math.round((count / totalSites) * 100 * 100) / 100 : 0;
      distributionData.push({
        siteType: 'Unlisted',
        count,
        percentage,
      });
    }

    return distributionData;
  }

  /**
   * Gets total sites distribution data from database with filters.
   * @param filterBy - Filter options including time period and user filters
   * @returns Promise<TotalSitesDistributionData[]> - Total sites distribution data
   */
  async getTotalSitesDistributionDataFromDBWithFilters({
    filterBy,
  }: {
    filterBy: FilterOptions;
  }): Promise<TotalSitesDistributionData[]> {
    const finalQuery = await this.transformQueryWithFilters({
      baseQuery: SitesSql.TOTAL_SITES,
      filterBy,
    });

    const rawResults = await this.executeQuery(finalQuery);
    return this.transformTotalSitesDistributionResults(rawResults);
  }

  /**
   * Transforms raw database results to typed TotalSitesDistributionLast90DaysData objects
   * @param rawResults - Raw results from database query (single row with all site type data)
   * @returns TotalSitesDistributionLast90DaysData[] - Properly typed and transformed data
   */
  private transformTotalSitesDistributionLast90DaysResults(rawResults: any[]): TotalSitesDistributionLast90DaysData[] {
    if (rawResults.length === 0) {
      return [];
    }

    const result = rawResults[0];
    const distributionData: TotalSitesDistributionLast90DaysData[] = [];

    // Add Public sites
    if (result.PUBLIC_SITES > 0) {
      distributionData.push({
        siteType: 'Public',
        count: Number(result.PUBLIC_SITES),
      });
    }

    // Add Private sites
    if (result.PRIVATE_SITES > 0) {
      distributionData.push({
        siteType: 'Private',
        count: Number(result.PRIVATE_SITES),
      });
    }

    // Add Unlisted sites
    if (result.UNLISTED_SITES > 0) {
      distributionData.push({
        siteType: 'Unlisted',
        count: Number(result.UNLISTED_SITES),
      });
    }

    return distributionData;
  }

  /**
   * Gets total sites distribution (last 90 days) data from database with filters.
   * Note: This query always uses the last 90 days from current date and does not apply date filters.
   * @param filterBy - Filter options (only tenantCode is used, date filters are ignored)
   * @returns Promise<TotalSitesDistributionLast90DaysData[]> - Total sites distribution (last 90 days) data
   */
  async getTotalSitesDistributionLast90DaysDataFromDBWithFilters({
    filterBy,
  }: {
    filterBy: FilterOptions;
  }): Promise<TotalSitesDistributionLast90DaysData[]> {
    // Only replace tenantCode, do not apply date filters as the query calculates last 90 days directly
    const finalQuery = SitesSql.TOTAL_SITES_DISTRIBUTION_LAST_90_DAYS.replace(/{tenantCode}/g, filterBy.tenantCode);

    const rawResults = await this.executeQuery(finalQuery);
    return this.transformTotalSitesDistributionLast90DaysResults(rawResults);
  }

  /**
   * Transforms raw database results to typed MostPopularSitesData objects
   * @param rawResults - Raw results from database query
   * @returns MostPopularSitesData[] - Properly typed and transformed data
   */
  private transformMostPopularSitesResults(rawResults: any[]): MostPopularSitesData[] {
    return rawResults.map(result => ({
      site_code: result.SITE_CODE || '',
      site_name: result.SITE_NAME || '',
      site_type_code: result.SITE_TYPE_CODE || '',
      total_shares: Number(result.TOTAL_SHARES || 0),
      total_views: Number(result.TOTAL_VIEWS || 0),
      total_likes: Number(result.TOTAL_LIKES || 0),
      total_replies: Number(result.TOTAL_REPLIES || 0),
      total_comments: Number(result.TOTAL_COMMENTS || 0),
      total_popularity: Number(result.TOTAL_POPULARITY || 0),
    }));
  }

  /**
   * Gets most popular sites data from database with filters.
   * @param filterBy - Filter options including time period and user filters
   * @returns Promise<MostPopularSitesData[]> - Most popular sites data (up to 5 sites)
   */
  async getMostPopularSitesDataFromDBWithFilters({
    filterBy,
  }: {
    filterBy: FilterOptions;
  }): Promise<MostPopularSitesData[]> {
    const finalQuery = await this.transformQueryWithFilters({
      baseQuery: SitesSql.MOST_POPULAR_SITES,
      filterBy,
    });

    const rawResults = await this.executeQuery(finalQuery);
    return this.transformMostPopularSitesResults(rawResults);
  }

  /**
   * Gets least popular sites data from database with filters.
   * @param filterBy - Filter options including time period and user filters
   * @returns Promise<MostPopularSitesData[]> - Least popular sites data (up to 5 sites)
   */
  async getLeastPopularSitesDataFromDBWithFilters({
    filterBy,
  }: {
    filterBy: FilterOptions;
  }): Promise<MostPopularSitesData[]> {
    const finalQuery = await this.transformQueryWithFilters({
      baseQuery: SitesSql.LEAST_POPULAR_SITES,
      filterBy,
    });

    const rawResults = await this.executeQuery(finalQuery);
    return this.transformMostPopularSitesResults(rawResults);
  }

  /**
   * Transforms raw database results to typed MostPublishedContentData objects
   * @param rawResults - Raw results from database query
   * @returns MostPublishedContentData[] - Properly typed and transformed data
   */
  private transformMostPublishedContentResults(rawResults: any[]): MostPublishedContentData[] {
    return rawResults.map(result => ({
      site_name: result.SITE_NAME || '',
      code: result.CODE || '',
      pages_count: Number(result.PAGES_COUNT || 0),
      events_count: Number(result.EVENTS_COUNT || 0),
      albums_count: Number(result.ALBUMS_COUNT || 0),
      total_content: Number(result.TOTAL_CONTENT || 0),
    }));
  }

  /**
   * Gets most published content data from database with filters.
   * @param filterBy - Filter options including time period and user filters
   * @returns Promise<MostPublishedContentData[]> - Most published content data (up to 5 sites)
   */
  async getMostPublishedContentDataFromDBWithFilters({
    filterBy,
  }: {
    filterBy: FilterOptions;
  }): Promise<MostPublishedContentData[]> {
    const finalQuery = await this.transformQueryWithFilters({
      baseQuery: SitesSql.MOST_PUBLISHED_CONTENT,
      filterBy,
    });

    const rawResults = await this.executeQuery(finalQuery);
    return this.transformMostPublishedContentResults(rawResults);
  }

  /**
   * Gets least published content data from database with filters.
   * @param filterBy - Filter options including time period and user filters
   * @returns Promise<MostPublishedContentData[]> - Least published content data (up to 5 sites)
   */
  async getLeastPublishedContentDataFromDBWithFilters({
    filterBy,
  }: {
    filterBy: FilterOptions;
  }): Promise<MostPublishedContentData[]> {
    const finalQuery = await this.transformQueryWithFilters({
      baseQuery: SitesSql.LEAST_PUBLISHED_CONTENT,
      filterBy,
    });

    const rawResults = await this.executeQuery(finalQuery);
    return this.transformMostPublishedContentResults(rawResults);
  }

  /**
   * Transforms raw database results to typed LowActivitySitesData objects
   * @param rawResults - Raw results from database query
   * @returns LowActivitySitesData[] - Properly typed and transformed data
   */
  private transformLowActivitySitesResults(rawResults: any[]): LowActivitySitesData[] {
    return rawResults.map(result => ({
      site_name: result.SITE_NAME || '',
      description: result.DESCRIPTION || '',
      total_views: Number(result.TOTAL_VIEWS || 0),
    }));
  }

  /**
   * Gets low activity sites data from database.
   * Always uses last 90 days - custom filters are not applied to this metric.
   * @returns Promise<LowActivitySitesData[]> - Low activity sites data (up to 5 sites)
   */
  async getLowActivitySitesDataFromDB(): Promise<LowActivitySitesData[]> {
    const finalQuery = SitesSql.LOW_ACTIVITY_SITES.replace(/{tenantCode}/g, this.orgId);

    const rawResults = await this.executeQuery(finalQuery);
    return this.transformLowActivitySitesResults(rawResults);
  }
}
