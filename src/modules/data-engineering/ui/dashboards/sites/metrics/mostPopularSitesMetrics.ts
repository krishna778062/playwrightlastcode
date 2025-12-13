import { SITES_DASHBOARD_METRICS } from '@data-engineering/constants/sitesDashboardMetrics';
import { FrameLocator, Page } from '@playwright/test';
import fs from 'fs';

import { MostPopularSitesData } from '../../../../helpers/sitesDashboardQueryHelper';
import { CSVValidationUtil } from '../../../../utils/csvValidationUtil';

import { BaseSitesTabularMetric } from './baseSitesTabularMetric';

import { CSVUtils } from '@/src/core/utils/csvUtils';
import { FileUtil } from '@/src/core/utils/fileUtil';

export enum MostPopularSitesColumns {
  SITE_NAME = 'Site name',
  SITE_TYPE = 'Site Type',
  POPULARITY_SCORE = 'Popularity Score',
}

// Re-export the type for convenience
export type { MostPopularSitesData };

export class MostPopularSitesMetrics extends BaseSitesTabularMetric {
  constructor(page: Page, thoughtSpotIframe: FrameLocator) {
    super(page, thoughtSpotIframe, SITES_DASHBOARD_METRICS.MOST_POPULAR_SITES.title);
  }

  /**
   * Verifies that the UI data matches the database data
   * @param snowflakeDataArray - Array of most popular sites data from Snowflake
   */
  async verifyUIDataMatchesWithSnowflakeData(snowflakeDataArray: MostPopularSitesData[]): Promise<void> {
    const dataMapper = (item: MostPopularSitesData) => ({
      [MostPopularSitesColumns.SITE_NAME]: item.site_name.trim(),
      [MostPopularSitesColumns.SITE_TYPE]: this.mapSiteTypeCodeToDisplayName(item.site_type_code),
      [MostPopularSitesColumns.POPULARITY_SCORE]: item.total_popularity.toString(),
    });

    await this.compareUIDataWithDBRecordsHelper(snowflakeDataArray, dataMapper, MostPopularSitesColumns.SITE_NAME);
  }

  /**
   * Verifies CSV data matches with Snowflake data
   * Handles all CSV validation logic internally including data transformation
   * @param snowflakeDataArray - Raw database data from Snowflake
   * @param selectedPeriod - Selected period filter for validation
   */
  async verifyCSVDataMatchesWithSnowflakeData(
    snowflakeDataArray: MostPopularSitesData[],
    selectedPeriod: string
  ): Promise<void> {
    await this.verifyDataIsLoaded();
    const { filePath } = await this.downloadDataAsCSV();
    console.log(`Downloaded data from UI should be saved at: ${filePath}`);

    try {
      // CSV export includes all sites, not just top 5 shown in UI
      // Parse CSV first to get which site names are actually in the CSV
      const csvData = await CSVUtils.parseReportCSV(filePath);
      const dbSiteNames = snowflakeDataArray.map(item => item.site_name.trim());

      // Filter CSV data to only include rows that match our DB records
      // This ensures we only validate the top 5 sites, not all sites in CSV
      const filteredCsvData = csvData.data.filter((row: any) => {
        const csvSiteName = row['Site name']?.trim();
        return dbSiteNames.includes(csvSiteName);
      });

      // Create a temporary filtered CSV file for validation
      // We need to write the filtered data back to a CSV format with proper metadata
      const filteredCsvPath = filePath.replace('.csv', '-filtered.csv');
      const csvHeaders = csvData.metadata.headers.join(',');
      const csvRows = filteredCsvData.map((row: any) => {
        return csvData.metadata.headers
          .map(header => {
            const value = row[header];
            // Handle values with commas or quotes
            if (value !== null && value !== undefined) {
              const stringValue = value.toString();
              if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
                return `"${stringValue.replace(/"/g, '""')}"`;
              }
              return stringValue;
            }
            return '';
          })
          .join(',');
      });
      // Preserve CSV metadata format: title, date range, created on, headers, then data
      const filteredCsvContent = [
        `"${csvData.metadata.title}"`,
        `"${csvData.metadata.dateRange}"`,
        `"${csvData.metadata.createdOn}"`,
        csvHeaders,
        ...csvRows,
      ].join('\n');
      fs.writeFileSync(filteredCsvPath, filteredCsvContent);

      // Transform DB data for CSV validation
      const transformedDataForValidation = snowflakeDataArray.map(item => ({
        site_name: item.site_name.trim(),
        popularity_score: item.total_popularity,
      }));

      // Validate the filtered CSV data matches with the DB data
      // Note: CSV has "Popularity score" (lowercase 's') and includes extra columns (Views, Likes, etc.)
      // We only validate site_name and popularity_score since Site Type is not in CSV
      await CSVValidationUtil.validateAndAssert({
        csvPath: filteredCsvPath,
        expectedDBData: transformedDataForValidation as any,
        metricName: 'Most popular',
        selectedPeriod: selectedPeriod,
        expectedHeaders: ['Site name', 'Popularity score', 'Views', 'Likes', 'Replies', 'Shares', 'Posts'],
        transformations: {
          headerMapping: {
            'Site name': 'site_name',
            'Popularity score': 'popularity_score',
            // Views, Likes, Replies, Shares, Posts are in CSV but not validated against DB
          },
        },
      });

      // Clean up filtered CSV file
      FileUtil.deleteTemporaryFile(filteredCsvPath);
    } finally {
      // Clean up CSV file
      FileUtil.deleteTemporaryFile(filePath);
    }
  }
}
