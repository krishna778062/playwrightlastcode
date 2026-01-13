import { FilesSql } from '../sqlQueries/files';

import { BaseAnalyticsQueryHelper, FilterOptions } from './baseAnalyticsQueryHelper';
import { SnowflakeHelper } from './snowflakeHelper';

// Type definitions for transformed data
export interface DistributionOfViewsByFileCategoryData {
  File_category: string;
  Total_views: number;
  View_contribution: string;
  Average_file_views: string;
}

export interface DistributionOfDownloadsByFileCategoryData {
  File_category: string;
  Total_downloads: number;
  Download_contribution: string;
  Average_file_downloads: string;
}

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

  /**
   * Transforms raw database results to DistributionOfViewsByFileCategoryData format
   * @param rawResults - Raw results from database query
   * @returns DistributionOfViewsByFileCategoryData[] - Properly typed and transformed data
   */
  private transformDistributionOfViewsByFileCategoryResults(
    rawResults: any[]
  ): DistributionOfViewsByFileCategoryData[] {
    return rawResults.map((item: any) => ({
      File_category: item.FILE_CATEGORY || item.File_category || '',
      Total_views: Number(item.TOTAL_VIEWS || item.Total_views || 0),
      View_contribution: item.VIEW_CONTRIBUTION || item.View_contribution || '0%',
      Average_file_views: item.AVERAGE_FILE_VIEWS || item.Average_file_views || '0',
    }));
  }

  /**
   * Gets distribution of views by file category data from database with filters applied.
   * @param filterBy - Filter options including time period and user filters
   * @returns Promise<DistributionOfViewsByFileCategoryData[]> - Distribution of views by file category data
   */
  async getDistributionOfViewsByFileCategoryFromDBWithFilters({
    filterBy,
  }: {
    filterBy: FilterOptions;
  }): Promise<DistributionOfViewsByFileCategoryData[]> {
    const finalQuery = await this.transformQueryWithFilters({
      baseQuery: FilesSql.DISTRIBUTION_OF_VIEWS_BY_FILE_CATEGORY,
      filterBy: { ...filterBy, tenantCode: this.orgId },
    });

    const rawResults = await this.executeQuery(finalQuery);
    return this.transformDistributionOfViewsByFileCategoryResults(rawResults);
  }

  /**
   * Transforms raw database results to DistributionOfDownloadsByFileCategoryData format
   * @param rawResults - Raw results from database query
   * @returns DistributionOfDownloadsByFileCategoryData[] - Properly typed and transformed data
   */
  private transformDistributionOfDownloadsByFileCategoryResults(
    rawResults: any[]
  ): DistributionOfDownloadsByFileCategoryData[] {
    return rawResults.map((item: any) => ({
      File_category: item.FILE_CATEGORY || item.File_category || '',
      Total_downloads: Number(item.TOTAL_VIEWS || item.Total_views || 0),
      Download_contribution: item.VIEW_CONTRIBUTION || item.View_contribution || '0%',
      Average_file_downloads: item.AVERAGE_FILE_VIEWS || item.Average_file_views || '0',
    }));
  }

  /**
   * Gets distribution of downloads by file category data from database with filters applied.
   * @param filterBy - Filter options including time period and user filters
   * @returns Promise<DistributionOfDownloadsByFileCategoryData[]> - Distribution of downloads by file category data
   */
  async getDistributionOfDownloadsByFileCategoryFromDBWithFilters({
    filterBy,
  }: {
    filterBy: FilterOptions;
  }): Promise<DistributionOfDownloadsByFileCategoryData[]> {
    const finalQuery = await this.transformQueryWithFilters({
      baseQuery: FilesSql.DISTRIBUTION_OF_DOWNLOADS_BY_FILE_CATEGORY,
      filterBy: { ...filterBy, tenantCode: this.orgId },
    });

    const rawResults = await this.executeQuery(finalQuery);
    return this.transformDistributionOfDownloadsByFileCategoryResults(rawResults);
  }
}
