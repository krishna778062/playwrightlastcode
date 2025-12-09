import { FrameLocator, Page } from '@playwright/test';

import { TabluarMetricsComponent } from '../../../components/tabluarMetricsComponent';

import { PeriodFilterTimeRange } from '@/src/modules/data-engineering/constants/periodFilterTimeRange';
import { CSVValidationConfig, CSVValidationUtil } from '@/src/modules/data-engineering/utils/csvValidationUtil';

export enum ContentReferralSourcesColumns {
  REFERRAL_SOURCE = 'Referral source',
  TOTAL_CONTENT_ITEM = 'Total content item',
  INTERACTION_COUNT = 'Interaction count',
  REFERRAL_CONTRIBUTION = 'Referral contribution',
  AVERAGE_REFERRAL_CONTRIBUTION = 'Average referral contribution',
}

export class ContentReferralSourcesMetrics extends TabluarMetricsComponent {
  constructor(page: Page, thoughtSpotIframe: FrameLocator) {
    super(page, thoughtSpotIframe, 'Content referral sources');
  }

  async verifyUIDataMatchesWithSnowflakeData(
    snowflakeDataArray: Array<{
      DESCRIPTION: string;
      CONTENT_ITEMS: number;
      REFERRALS: number;
      AVG_REF: number;
    }>
  ): Promise<void> {
    // Calculate total referrals for percentage calculation
    const totalReferrals = snowflakeDataArray.reduce((sum, item) => sum + (item.REFERRALS || 0), 0);

    const dataMapper = (item: any) => {
      // Map DESCRIPTION: 'N/A' in DB becomes 'Direct/undefined' in UI
      const referralSource = item.DESCRIPTION === 'N/A' ? 'Direct/undefined' : item.DESCRIPTION || '';

      // Calculate referral contribution percentage
      const referralContribution = totalReferrals > 0 ? ((item.REFERRALS || 0) / totalReferrals) * 100 : 0;
      const referralContributionFormatted = referralContribution.toFixed(1) + '%';

      return {
        [ContentReferralSourcesColumns.REFERRAL_SOURCE]: referralSource,
        [ContentReferralSourcesColumns.TOTAL_CONTENT_ITEM]: item.CONTENT_ITEMS?.toString() || '0',
        [ContentReferralSourcesColumns.INTERACTION_COUNT]: item.REFERRALS?.toString() || '0',
        [ContentReferralSourcesColumns.REFERRAL_CONTRIBUTION]: referralContributionFormatted,
        [ContentReferralSourcesColumns.AVERAGE_REFERRAL_CONTRIBUTION]: item.AVG_REF?.toString() || '0',
      };
    };

    await this.compareUIDataWithDBRecords(
      snowflakeDataArray,
      dataMapper,
      ContentReferralSourcesColumns.REFERRAL_SOURCE
    );
  }

  async verifyDataIsLoaded(): Promise<void> {
    await this.verifyTabluarDataIsLoaded();
  }

  /**
   * Downloads CSV and validates it against Snowflake data
   * @param snowflakeData - Raw database data from Snowflake
   * @param selectedPeriod - Selected period filter for validation
   * @param customDates - Optional custom date range
   */
  async downloadAndValidateContentReferralSourcesCSV(
    snowflakeData: Array<{
      DESCRIPTION: string;
      CONTENT_ITEMS: number;
      REFERRALS: number;
      AVG_REF: number;
    }>,
    selectedPeriod: PeriodFilterTimeRange,
    customDates?: { customStartDate: string; customEndDate: string }
  ): Promise<{ filePath: string; fileName: string }> {
    const { filePath, fileName } = await this.downloadDataAsCSV();

    try {
      // Calculate total referrals for percentage calculation
      const totalReferrals = snowflakeData.reduce((sum, item) => sum + (item.REFERRALS || 0), 0);

      // Transform DB data for CSV validation
      const transformedDataForValidation = snowflakeData.map(item => {
        // Map DESCRIPTION: 'N/A' in DB becomes 'Direct/undefined' in CSV
        const referralSource = item.DESCRIPTION === 'N/A' ? 'Direct/undefined' : item.DESCRIPTION || '';

        // Calculate referral contribution as decimal (CSV stores as decimal, e.g., 0.809909 = 80.9909%)
        const referralContributionDecimal = totalReferrals > 0 ? (item.REFERRALS || 0) / totalReferrals : 0;

        return {
          'Referral source': referralSource,
          'Total content item': item.CONTENT_ITEMS || 0,
          'Interaction count': item.REFERRALS || 0,
          'Referral contribution': referralContributionDecimal,
          'Average referral contribution': item.AVG_REF || 0,
        };
      });

      const validationConfig: CSVValidationConfig = {
        csvPath: filePath,
        expectedDBData: transformedDataForValidation as any,
        metricName: 'Content referral sources',
        selectedPeriod,
        ...(customDates || {}),
        expectedHeaders: [
          'Referral source',
          'Total content item',
          'Interaction count',
          'Referral contribution',
          'Average referral contribution',
        ],
        transformations: {
          headerMapping: {
            'Referral source': 'Referral source',
            'Total content item': 'Total content item',
            'Interaction count': 'Interaction count',
            'Referral contribution': 'Referral contribution',
            'Average referral contribution': 'Average referral contribution',
          },
          percentageField: {
            fieldName: 'Referral contribution',
            normalizeToPercentage: false, // CSV stores as decimal (0.809909 = 80.9909%)
          },
          tolerance: {
            percentage: 0.1, // Allow 0.1% difference for rounding (in percentage terms, applied to decimal)
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
