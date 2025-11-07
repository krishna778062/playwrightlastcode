import { PeriodFilterTimeRange } from '@data-engineering/constants/periodFilterTimeRange';
import { DataEngineeringTestSuite } from '@data-engineering/constants/testSuite';
import { SnowflakeHelper } from '@data-engineering/helpers';
import { FilterOptions } from '@data-engineering/helpers/baseAnalyticsQueryHelper';
import {
  cleanupDashboardTesting,
  setupMobileDashboardForTest,
  UserRole,
} from '@data-engineering/helpers/dashboardSetupHelper';
import { MobileDashboardQueryHelper } from '@data-engineering/helpers/mobileDashboardQueryHelper';
import { MobileDashboard } from '@data-engineering/ui/dashboards';
import { CSVValidationUtil } from '@data-engineering/utils/csvValidationUtil';
import { Page, test } from '@playwright/test';

import { TestGroupType } from '@/src/core';
import { TestPriority } from '@/src/core/constants/testPriority';
import { tagTest } from '@/src/core/utils/testDecorator';

/**
 * Mobile Dashboard CSV Validation Test Suite
 * Tests CSV exports against database data with various filter combinations
 */

test.describe(
  'mobile Dashboard - CSV Validation with Filters',
  {
    tag: [DataEngineeringTestSuite.MOBILE, '@csv-validation'],
  },
  () => {
    test.slow();

    let testEnvironment: {
      page: Page;
      mobileDashboard: MobileDashboard;
      snowflakeHelper: SnowflakeHelper;
      mobileDashboardQueryHelper: MobileDashboardQueryHelper;
    };
    let testFiltersConfig: FilterOptions;

    test.beforeAll('Setting up the mobile dashboard with filters', async ({ browser }) => {
      // Setup dashboard using dedicated method
      testEnvironment = await setupMobileDashboardForTest(browser, UserRole.APP_MANAGER);

      testFiltersConfig = {
        tenantCode: process.env.ORG_ID!,
        timePeriod: PeriodFilterTimeRange.LAST_12_MONTHS,
      };

      const { analyticsFiltersComponent } = testEnvironment.mobileDashboard;
      await analyticsFiltersComponent.verifyFilterComponentIsVisible();

      // Apply filters using unified configuration
      await analyticsFiltersComponent.applyFiltersFromConfig(testFiltersConfig);
    });

    test.afterAll('Cleaning up the test environment', async () => {
      await cleanupDashboardTesting(testEnvironment);
    });

    test(
      'tS To verify the csv of mobile adoption rate answer in mobile dashboard',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, '@mobile-adoption-rate-csv'],
      },
      async () => {
        tagTest(test.info(), {
          description: 'Verify CSV export for mobile adoption rate metric matches database data',
          zephyrTestId: 'DE-26001',
        });

        const { mobileDashboardQueryHelper, mobileDashboard } = testEnvironment;

        // Step 1: Fetch expected data from database
        const dbData = await mobileDashboardQueryHelper.getMobileAdoptionRateDataFromDBWithFilters({
          filterBy: testFiltersConfig,
        });

        console.log(`Info: Fetched ${dbData.length} records from database`);

        // Step 2: Scroll to the metric and download CSV
        await mobileDashboard.mobileAdoptionRateMetrics.scrollToComponent();
        const { filePath } = await mobileDashboard.mobileAdoptionRateMetrics.downloadDataAsCSV();

        console.log(`Info: Downloaded CSV file to path: ${filePath}`);

        // Step 3: Validate CSV against database data
        await CSVValidationUtil.validateAndAssert({
          csvPath: filePath,
          expectedDBData: dbData as any,
          metricName: 'Mobile adoption rate',
          selectedPeriod: testFiltersConfig.timePeriod,
          expectedHeaders: [
            'User name',
            'Email',
            'Designation',
            'Company Name',
            'Division',
            'Department',
            'City',
            'State',
            'Country',
            'Date of last login',
          ],
          transformations: {
            // Map CSV headers to database field names
            headerMapping: {
              'User name': 'fullName',
              Email: 'email',
              Designation: 'title',
              'Company Name': 'companyName',
              Division: 'division',
              Department: 'department',
              City: 'city',
              State: 'state',
              Country: 'country',
              'Date of last login': 'dateOfLastLogin',
            },
            // No value mappings needed - database already returns 'Undefined' for null values
            valueMappings: {},
          },
        });

        console.log('Info: CSV validation completed successfully');
      }
    );
  }
);
