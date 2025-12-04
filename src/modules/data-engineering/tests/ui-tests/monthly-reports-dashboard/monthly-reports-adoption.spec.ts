import { PeriodFilterTimeRange } from '@data-engineering/constants/periodFilterTimeRange';
import { TestCaseType } from '@data-engineering/constants/testCaseType';
import { DataEngineeringTestSuite } from '@data-engineering/constants/testSuite';
import { Page, test } from '@playwright/test';

import { TestPriority } from '@core/constants/testPriority';
import { TestGroupType } from '@core/constants/testType';
import { tagTest } from '@core/utils/testDecorator';

import { MonthlyReportsQueryHelper, SnowflakeHelper } from '../../../helpers';
import { MonthlyReportsDashboard } from '../../../ui/dashboards/monthly-reports/monthlyReportsDashboard';

import {
  cleanupDashboardTesting,
  setupMonthlyReportsDashboardForTest,
  UserRole,
} from '@/src/modules/data-engineering/helpers/dashboardSetupHelper';

test.describe(
  'monthly Reports Dashboard - Monthly Reports Adoption',
  {
    tag: [DataEngineeringTestSuite.MONTHLY_REPORTS, '@monthly-reports-adoption'],
  },
  () => {
    test.slow();

    let testEnvironment: {
      page: Page;
      monthlyReportsDashboard: MonthlyReportsDashboard;
      monthlyReportsQueryHelper: MonthlyReportsQueryHelper;
      snowflakeHelper: SnowflakeHelper;
    };

    test.beforeAll('Setting up the Monthly Reports dashboard', async ({ browser }) => {
      // Setup dashboard using dedicated method
      testEnvironment = await setupMonthlyReportsDashboardForTest(browser, UserRole.APP_MANAGER);
    });

    test.afterAll('Cleaning up the test environment', async () => {
      await cleanupDashboardTesting(testEnvironment);
    });

    test(
      'verify Monthly Reports Adoption Dashboard tabular data validation',
      { tag: [TestPriority.P0, TestGroupType.SMOKE, '@monthly-reports-adoption-metric', TestCaseType.TABULAR_METRIC] },
      async () => {
        tagTest(test.info(), {
          description: 'TS To verify the answer of Monthly reports Adoption Dashboard',
          zephyrTestId: 'DE-25971',
          storyId: 'DE-25349',
        });

        const { monthlyReportsQueryHelper } = testEnvironment;

        // Get data from database
        const monthlyReportsData = await monthlyReportsQueryHelper.getMonthlyReportsAdoptionDataFromDB();

        console.log('monthlyReportsData', monthlyReportsData);

        // Verify UI data matches database data
        const monthlyReportsMetric = testEnvironment.monthlyReportsDashboard.monthlyReportsAdoption;
        await monthlyReportsMetric.verifyUIDataMatchesWithSnowflakeData(monthlyReportsData);
      }
    );

    test(
      'verify Monthly Reports Adoption Dashboard CSV download and validation',
      {
        tag: [
          TestPriority.P0,
          TestGroupType.SMOKE,
          TestCaseType.CSV_VALIDATION,
          '@monthly-reports-adoption-csv',
          TestCaseType.CSV_VALIDATION,
        ],
      },
      async () => {
        tagTest(test.info(), {
          description: 'TS To verify the csv of answer of Monthly reports Adoption Dashboard',
          zephyrTestId: 'DE-25987',
          storyId: 'DE-25349',
        });

        const { monthlyReportsQueryHelper } = testEnvironment;

        // Get data from database
        const monthlyReportsData = await monthlyReportsQueryHelper.getMonthlyReportsAdoptionDataFromDB();

        console.log(`Info: Fetched ${monthlyReportsData.length} records from database`);

        // Download CSV and validate against database data
        const monthlyReportsMetric = testEnvironment.monthlyReportsDashboard.monthlyReportsAdoption;
        const { filePath, fileName } = await monthlyReportsMetric.downloadAndValidateMonthlyReportsAdoptionCSV(
          monthlyReportsData,
          PeriodFilterTimeRange.LAST_36_MONTHS
        );

        console.log(`CSV downloaded successfully: ${fileName} at ${filePath}`);
      }
    );
  }
);
