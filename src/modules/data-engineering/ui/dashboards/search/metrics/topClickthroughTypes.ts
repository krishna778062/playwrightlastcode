import { FrameLocator, Page } from '@playwright/test';

import { SEARCH_METRICS } from '../../../../constants/searchMetrics';
import { TopClickthroughTypesData } from '../../../../helpers/searchDashboardQueryHelper';
import { TabluarMetricsComponent } from '../../../../ui/components/tabluarMetricsComponent';
import { CSVValidationUtil } from '../../../../utils/csvValidationUtil';

import { FileUtil } from '@/src/core/utils/fileUtil';

export enum TopClickthroughTypesColumns {
  TYPE = 'Type',
  TOTAL_CLICK_THROUGH = 'Total click-through',
  PERCENTAGE_OF_CLICK_THROUGH_TYPES = 'Percentage of click-through types',
}

// Re-export the type for convenience
export type { TopClickthroughTypesData };

export class TopClickthroughTypes extends TabluarMetricsComponent {
  constructor(page: Page, thoughtSpotIframe: FrameLocator) {
    super(page, thoughtSpotIframe, SEARCH_METRICS.TOP_CLICKTHROUGH_TYPES.title);
  }

  /**
   * Verifies that the top clickthrough types data is loaded
   */
  async verifyDataIsLoaded(): Promise<void> {
    await this.verifyTabluarDataIsLoaded();
  }

  /**
   * Verifies that the UI data matches the database data
   * @param snowflakeDataArray - Array of top clickthrough types data from Snowflake
   */
  async verifyUIDataMatchesWithSnowflakeData(snowflakeDataArray: TopClickthroughTypesData[]): Promise<void> {
    const dataMapper = (item: TopClickthroughTypesData) => ({
      [TopClickthroughTypesColumns.TYPE]: item.item_type,
      [TopClickthroughTypesColumns.TOTAL_CLICK_THROUGH]: item.click_count.toString(),
      [TopClickthroughTypesColumns.PERCENTAGE_OF_CLICK_THROUGH_TYPES]: item.percentage,
    });

    await this.compareUIDataWithDBRecords(snowflakeDataArray, dataMapper, TopClickthroughTypesColumns.TYPE);
  }

  /**
   * Verifies CSV data matches with Snowflake data
   * Handles all CSV validation logic internally including data transformation
   * @param snowflakeDataArray - Raw database data from Snowflake (query helper handles transformation with forCSVValidation=true)
   * @param selectedPeriod - Selected period filter for validation
   */
  async verifyCSVDataMatchesWithSnowflakeData(
    snowflakeDataArray: TopClickthroughTypesData[],
    selectedPeriod: string
  ): Promise<void> {
    await this.verifyDataIsLoaded();
    const { filePath } = await this.downloadDataAsCSV();
    console.log(`Downloaded data from UI should be saved at: ${filePath}`);

    try {
      // Note: CSV doesn't include total_clickthrough field, so we exclude it from validation
      const transformedData = snowflakeDataArray.map(item => ({
        item_type: item.item_type,
        click_count: item.click_count,
        percentage: item.percentage, // Already converted to decimal by query helper
      }));

      // Validate the data in the CSV matches with the data from snowflake
      await CSVValidationUtil.validateAndAssert({
        csvPath: filePath,
        expectedDBData: transformedData as any,
        metricName: 'Top clickthrough types',
        selectedPeriod: selectedPeriod,
        expectedHeaders: ['Type', 'Total click-through', 'Percentage of click-through types'],
        transformations: {
          headerMapping: {
            Type: 'item_type',
            'Total click-through': 'click_count',
            'Percentage of click-through types': 'percentage',
          },
          // Note: CSV has decimal format (1) not percentage format (100%)
          // DB data has been converted to decimal format in transformedData
          // Use percentageField with normalizeToPercentage false to apply tolerance for decimal comparison
          percentageField: {
            fieldName: 'percentage',
            normalizeToPercentage: false, // Don't normalize since both are already in decimal format
          },
          tolerance: {
            percentage: 0.01, // Allow 1 percentage point difference (0.01 in decimal format)
          },
        },
      });
    } finally {
      // Clean up CSV file
      FileUtil.deleteTemporaryFile(filePath);
    }
  }
}
