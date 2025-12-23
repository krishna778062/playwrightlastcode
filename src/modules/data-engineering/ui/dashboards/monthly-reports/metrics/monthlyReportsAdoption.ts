import { FrameLocator, Page } from '@playwright/test';

import { CSVUtils } from '@/src/core/utils/csvUtils';
import { MONTHLY_REPORTS_METRICS } from '@/src/modules/data-engineering/constants/monthlyReportsMetrics';
import { PeriodFilterTimeRange } from '@/src/modules/data-engineering/constants/periodFilterTimeRange';
import { TabluarMetricsComponent } from '@/src/modules/data-engineering/ui/components/tabluarMetricsComponent';
import { CSVValidationConfig, CSVValidationUtil } from '@/src/modules/data-engineering/utils/csvValidationUtil';

export enum MonthlyReportsAdoptionColumns {
  MONTH = 'Month',
  TOTAL_USERS_MONTH_END = 'Total users (month end snapshot )', // Note: trailing space in UI
  TOTAL_LOGGED_IN_USERS_MONTH_END = 'Total logged in users (month end snapshot)',
  APP_ADOPTION_RATE_MONTH_END = 'App adoption rate (month end snapshot)',
  TOTAL_USERS_AS_OF_TODAY = 'Total users (as of today)',
  TOTAL_LOGGED_IN_USERS_AS_OF_TODAY = 'Total logged in users(as of today)', // Note: no space before parenthesis in UI
  APP_ADOPTION_RATE_AS_OF_TODAY = 'App adoption rate (as of today)',
  VIEWED_CONTENT_MONTH_END = 'Viewed content (month end snapshot)',
  AVG_VIEWS_PER_USER_MONTH_END = 'Avg views per user (month end snapshot)',
  POSTS_AND_REPLIES_MONTH_END = 'Posts & replies(month end snapshot)', // Note: no space before parenthesis in UI
  REACTIONS_MONTH_END = 'Reactions (month end snapshot)',
  SHARES_MONTH_END = 'Shares (month end snapshot)',
}

export class MonthlyReportsAdoption extends TabluarMetricsComponent {
  constructor(page: Page, iframe: FrameLocator) {
    super(page, iframe, MONTHLY_REPORTS_METRICS.MONTHLY_REPORTS_ADOPTION.title);
  }

  async verifyUIDataMatchesWithSnowflakeData(
    snowflakeDataArray: Array<{
      MONTH: string;
      TOTAL_ACTIVE_USERS: number;
      USER_LOGGED_IN_COUNT: number;
      USER_LOGGED_IN_PERCENTAGE: number;
      TOTAL_USERS_AS_OF_TODAY: number;
      ACTIVE_USER_ADOPTION_COUNT: number;
      ACTIVE_USER_ADOPTION_PERCENTAGE: number;
      VIEWED_CONTENT_COUNT: number;
      VIEWED_CONTENT_PERCENTAGE: number;
      AVG_VIEW_PER_USER: number;
      POSTS_AND_REPLIES: number;
      LIKES: number;
      SHARES: number;
    }>
  ): Promise<void> {
    const dataMapper = (item: any) => {
      // Calculate app adoption rate percentage for month end snapshot
      const monthEndAdoptionRate =
        item['TOTAL_ACTIVE_USERS'] > 0
          ? ((item['USER_LOGGED_IN_COUNT'] / item['TOTAL_ACTIVE_USERS']) * 100).toFixed(1)
          : '0.0';

      // Calculate app adoption rate percentage for as of today
      const todayAdoptionRate =
        item['TOTAL_USERS_AS_OF_TODAY'] > 0
          ? ((item['ACTIVE_USER_ADOPTION_COUNT'] / item['TOTAL_USERS_AS_OF_TODAY']) * 100).toFixed(1)
          : '0.0';

      return {
        [MonthlyReportsAdoptionColumns.MONTH]: item['MONTH'] || '',
        [MonthlyReportsAdoptionColumns.TOTAL_USERS_MONTH_END]: (item['TOTAL_ACTIVE_USERS'] || 0).toString(),
        [MonthlyReportsAdoptionColumns.TOTAL_LOGGED_IN_USERS_MONTH_END]: (item['USER_LOGGED_IN_COUNT'] || 0).toString(),
        [MonthlyReportsAdoptionColumns.APP_ADOPTION_RATE_MONTH_END]: `${monthEndAdoptionRate}%`,
        [MonthlyReportsAdoptionColumns.TOTAL_USERS_AS_OF_TODAY]: (item['TOTAL_USERS_AS_OF_TODAY'] || 0).toString(),
        [MonthlyReportsAdoptionColumns.TOTAL_LOGGED_IN_USERS_AS_OF_TODAY]: (
          item['ACTIVE_USER_ADOPTION_COUNT'] || 0
        ).toString(),
        [MonthlyReportsAdoptionColumns.APP_ADOPTION_RATE_AS_OF_TODAY]: `${todayAdoptionRate}%`,
        [MonthlyReportsAdoptionColumns.VIEWED_CONTENT_MONTH_END]: (item['VIEWED_CONTENT_COUNT'] || 0).toLocaleString(
          'en-US'
        ),
        [MonthlyReportsAdoptionColumns.AVG_VIEWS_PER_USER_MONTH_END]: (item['AVG_VIEW_PER_USER'] || 0).toString(),
        [MonthlyReportsAdoptionColumns.POSTS_AND_REPLIES_MONTH_END]: (item['POSTS_AND_REPLIES'] || 0).toString(),
        [MonthlyReportsAdoptionColumns.REACTIONS_MONTH_END]: (item['LIKES'] || 0).toString(),
        [MonthlyReportsAdoptionColumns.SHARES_MONTH_END]: (item['SHARES'] || 0).toString(),
      };
    };

    await this.compareUIDataWithDBRecords(snowflakeDataArray, dataMapper, MonthlyReportsAdoptionColumns.MONTH);
  }

  async verifyDataIsLoaded(): Promise<void> {
    await this.verifyTabluarDataIsLoaded();
  }

  // Downloads CSV and validates it against Snowflake data
  async downloadAndValidateMonthlyReportsAdoptionCSV(
    snowflakeData: Array<{
      MONTH: string;
      TOTAL_ACTIVE_USERS: number;
      USER_LOGGED_IN_COUNT: number;
      USER_LOGGED_IN_PERCENTAGE: number;
      TOTAL_USERS_AS_OF_TODAY: number;
      ACTIVE_USER_ADOPTION_COUNT: number;
      ACTIVE_USER_ADOPTION_PERCENTAGE: number;
      VIEWED_CONTENT_COUNT: number;
      VIEWED_CONTENT_PERCENTAGE: number;
      AVG_VIEW_PER_USER: number;
      POSTS_AND_REPLIES: number;
      LIKES: number;
      SHARES: number;
    }>,
    selectedPeriod: PeriodFilterTimeRange = PeriodFilterTimeRange.LAST_36_MONTHS
  ): Promise<{ filePath: string; fileName: string }> {
    const { filePath, fileName } = await this.downloadDataAsCSV();

    try {
      // First, read CSV to get the list of months (to filter out incomplete months from DB)
      const csvData = CSVUtils.getDataRecordsFromReportCSV(filePath);
      const csvMonths = new Set(csvData.map((row: any) => row.Month?.trim()).filter(Boolean));

      // Transform DB data to match CSV format and filter to only include months in CSV:
      // - Percentages: CSV has decimals rounded to 6 decimal places (0.314286), not full precision
      // - Numbers: CSV has no commas (18912), not comma-separated (18,912)
      // - Avg views per user: CSV calculates with full precision, not using rounded DB value
      // - All numeric values should be numbers (not strings) for proper comparison
      const transformedDBData = snowflakeData
        .filter(item => csvMonths.has(item['MONTH']?.trim())) // Only include months present in CSV
        .map(item => {
          // Calculate percentages as decimals and round to 6 decimal places (matching CSV format)
          const monthEndAdoptionRateDecimal =
            item['TOTAL_ACTIVE_USERS'] > 0
              ? Math.round((item['USER_LOGGED_IN_COUNT'] / item['TOTAL_ACTIVE_USERS']) * 1000000) / 1000000
              : 0;

          const todayAdoptionRateDecimal =
            item['TOTAL_USERS_AS_OF_TODAY'] > 0
              ? Math.round((item['ACTIVE_USER_ADOPTION_COUNT'] / item['TOTAL_USERS_AS_OF_TODAY']) * 1000000) / 1000000
              : 0;

          // Calculate avg views per user and round to 6 decimal places (matching CSV format)
          const avgViewsPerUser =
            item['TOTAL_ACTIVE_USERS'] > 0 && item['VIEWED_CONTENT_COUNT'] > 0
              ? Math.round((item['VIEWED_CONTENT_COUNT'] / item['TOTAL_ACTIVE_USERS']) * 1000000) / 1000000
              : 0;

          return {
            Month: item['MONTH'] || '',
            'Total users (month end snapshot )': item['TOTAL_ACTIVE_USERS'] || 0,
            'Total logged in users (month end snapshot)': item['USER_LOGGED_IN_COUNT'] || 0,
            'App adoption rate (month end snapshot)': monthEndAdoptionRateDecimal,
            'Total users (as of today)': item['TOTAL_USERS_AS_OF_TODAY'] || 0,
            'Total logged in users(as of today)': item['ACTIVE_USER_ADOPTION_COUNT'] || 0,
            'App adoption rate (as of today)': todayAdoptionRateDecimal,
            'Viewed content (month end snapshot)': item['VIEWED_CONTENT_COUNT'] || 0, // No commas in CSV
            'Avg views per user (month end snapshot)': avgViewsPerUser,
            'Posts & replies(month end snapshot)': item['POSTS_AND_REPLIES'] || 0,
            'Reactions (month end snapshot)': item['LIKES'] || 0,
            'Shares (month end snapshot)': item['SHARES'] || 0,
          };
        });

      const validationConfig: CSVValidationConfig = {
        csvPath: filePath,
        expectedDBData: transformedDBData as any,
        metricName: MONTHLY_REPORTS_METRICS.MONTHLY_REPORTS_ADOPTION.title,
        selectedPeriod,
        skipDateRangeValidation: true, // Monthly reports don't use date ranges
        expectedHeaders: [
          'Month',
          'Total users (month end snapshot )',
          'Total logged in users (month end snapshot)',
          'App adoption rate (month end snapshot)',
          'Total users (as of today)',
          'Total logged in users(as of today)',
          'App adoption rate (as of today)',
          'Viewed content (month end snapshot)',
          'Avg views per user (month end snapshot)',
          'Posts & replies(month end snapshot)',
          'Reactions (month end snapshot)',
          'Shares (month end snapshot)',
        ],
        transformations: {
          headerMapping: {
            Month: 'Month',
            'Total users (month end snapshot )': 'Total users (month end snapshot )',
            'Total logged in users (month end snapshot)': 'Total logged in users (month end snapshot)',
            'App adoption rate (month end snapshot)': 'App adoption rate (month end snapshot)',
            'Total users (as of today)': 'Total users (as of today)',
            'Total logged in users(as of today)': 'Total logged in users(as of today)',
            'App adoption rate (as of today)': 'App adoption rate (as of today)',
            'Viewed content (month end snapshot)': 'Viewed content (month end snapshot)',
            'Avg views per user (month end snapshot)': 'Avg views per user (month end snapshot)',
            'Posts & replies(month end snapshot)': 'Posts & replies(month end snapshot)',
            'Reactions (month end snapshot)': 'Reactions (month end snapshot)',
            'Shares (month end snapshot)': 'Shares (month end snapshot)',
          },
          keyFields: ['Month'],
          // Handle percentage fields as decimals (CSV format)
          // Note: CSV exports percentages as decimals (0.314286), not percentage strings (31.4%)
          // We specify one percentageField for tolerance, but both percentage fields are in decimal format
          percentageField: {
            fieldName: 'App adoption rate (month end snapshot)',
            normalizeToPercentage: false, // CSV has decimals, not percentages
          },
          // Allow tolerance for decimal precision differences
          // Note: Tolerance only applies to the percentageField specified above
          // For "App adoption rate (as of today)", the normalizePercentageValue function will handle
          // the comparison, but without tolerance. Since both are decimals, they should match closely.
          // For numeric fields like "Avg views per user", we rely on exact match or very close values.
          tolerance: {
            percentage: 0.001, // Allow 0.1% difference in decimal format (0.001 = 0.1%)
          },
        },
      };

      await CSVValidationUtil.validateAndAssert(validationConfig);
      return { filePath, fileName };
    } finally {
      // Clean up the downloaded CSV file
      CSVValidationUtil.cleanup(filePath);
    }
  }
}
