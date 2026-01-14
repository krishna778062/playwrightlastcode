import { SITES_DASHBOARD_METRICS } from '@data-engineering/constants/sitesDashboardMetrics';
import { PieChartComponent } from '@data-engineering/ui/components/pieChartComponent';
import { FrameLocator, Page } from '@playwright/test';

import { TotalSitesDistributionCSVData } from '../../../../helpers/sitesDashboardQueryHelper';
import { CSVValidationUtil } from '../../../../utils/csvValidationUtil';

import { FileUtil } from '@/src/core/utils/fileUtil';

export class TotalSitesDistributionMetrics extends PieChartComponent {
  constructor(page: Page, thoughtSpotIframe: FrameLocator) {
    super(page, thoughtSpotIframe, SITES_DASHBOARD_METRICS.TOTAL_SITES_DISTRIBUTION.title);
  }

  /**
   * Verifies CSV data matches with Snowflake data
   * Handles all CSV validation logic internally including data transformation
   * @param snowflakeDataArray - Raw database data from Snowflake (detailed site records)
   */
  async verifyCSVDataMatchesWithSnowflakeData(snowflakeDataArray: TotalSitesDistributionCSVData[]): Promise<void> {
    await this.waitForChartToLoad();
    const { filePath } = await this.downloadDataAsCSV();
    console.log(`Downloaded data from UI should be saved at: ${filePath}`);

    try {
      // Transform DB data for CSV validation
      // Keep boolean values as booleans (CSV parsing returns booleans for true/false values)
      const transformedDataForValidation = snowflakeDataArray.map(item => ({
        site_code: item.site_code,
        site_name: item.site_name,
        site_category_name: item.site_category_name,
        site_type: item.site_type,
        is_feature_site: item.is_feature_site,
        is_broadcast_only: item.is_broadcast_only,
        role: item.role,
        user_name: item.user_name,
        email: item.email,
      }));

      // Validate the CSV data matches with the DB data
      // The CSV exports detailed site data, not aggregated distribution
      await CSVValidationUtil.validateAndAssert({
        csvPath: filePath,
        expectedDBData: transformedDataForValidation as any,
        metricName: 'Total sites distribution',
        selectedPeriod: 'CUSTOM', // This metric doesn't use date range
        skipDateRangeValidation: true,
        expectedHeaders: [
          'Site code',
          'Site name',
          'Site category name',
          'User name',
          'Role',
          'Site type',
          'Email',
          'Broadcast only',
          'Is featured',
        ],
        transformations: {
          headerMapping: {
            'Site code': 'site_code',
            'Site name': 'site_name',
            'Site category name': 'site_category_name',
            'User name': 'user_name',
            Role: 'role',
            'Site type': 'site_type',
            Email: 'email',
            'Broadcast only': 'is_broadcast_only',
            'Is featured': 'is_feature_site',
          },
          // Use composite key for matching: site_code + user_name (since same site can have multiple managers)
          keyFields: ['site_code', 'user_name'],
        },
      });
    } finally {
      // Clean up CSV file
      FileUtil.deleteTemporaryFile(filePath);
    }
  }
}
