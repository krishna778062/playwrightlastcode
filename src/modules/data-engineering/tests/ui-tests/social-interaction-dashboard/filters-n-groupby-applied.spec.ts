import { GroupByOnUserParameter } from '@data-engineering/constants/filters';
import { PeriodFilterTimeRange } from '@data-engineering/constants/periodFilterTimeRange';
import { TestCaseType } from '@data-engineering/constants/testCaseType';
import { DataEngineeringTestSuite } from '@data-engineering/constants/testSuite';
import { Page, test } from '@playwright/test';

import { TestPriority } from '@core/constants/testPriority';
import { TestGroupType } from '@core/constants/testType';
import { tagTest } from '@core/utils/testDecorator';

import { SnowflakeHelper, SocialInteractionDashboardQueryHelper } from '../../../helpers';
import { FilterOptions } from '../../../helpers/baseAnalyticsQueryHelper';
import { SocialInteractionDashboard } from '../../../ui/dashboards';

import {
  cleanupDashboardTesting,
  setupSocialInteractionDashboardForTest,
  UserRole,
} from '@/src/modules/data-engineering/helpers/dashboardSetupHelper';

test.describe(
  'social Interaction Dashboard - Filters and Group By Applied',
  {
    tag: [DataEngineeringTestSuite.SOCIAL_INTERACTION, '@filters-n-groupby-applied'],
  },
  () => {
    test.slow();

    let testEnvironment: {
      page: Page;
      socialInteractionDashboard: SocialInteractionDashboard;
      socialInteractionQueryHelper: SocialInteractionDashboardQueryHelper;
      snowflakeHelper: SnowflakeHelper;
    };
    let testFiltersConfig: FilterOptions;

    test.beforeAll(
      'Setting up the social interaction dashboard + applying filters and group by Location',
      async ({ browser }) => {
        // Setup dashboard using dedicated method
        testEnvironment = await setupSocialInteractionDashboardForTest(browser, UserRole.APP_MANAGER);

        testFiltersConfig = {
          tenantCode: process.env.ORG_ID!,
          timePeriod: PeriodFilterTimeRange.LAST_90_DAYS,
          segments: ['New segment DUCK DB'],
          departments: ['New department DUCK DB'],
          locations: ['New city DUCK DB, New state DUCK DB, New country DUCK DB'],
          groupBy: GroupByOnUserParameter.LOCATION,
        };

        const { analyticsFiltersComponent } = testEnvironment.socialInteractionDashboard;
        await analyticsFiltersComponent.verifyFilterComponentIsVisible();

        // Apply filters using unified configuration
        await analyticsFiltersComponent.applyFiltersFromConfig(testFiltersConfig);
      }
    );

    test.afterAll('Cleaning up the test environment', async () => {
      await cleanupDashboardTesting(testEnvironment);
    });

    test(
      'verify Most engaged by Department tabular data validation with group by Location',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, TestCaseType.TABULAR_METRIC, '@most-engaged-by-department'],
      },
      async () => {
        tagTest(test.info(), {
          description:
            'To verify Most engaged by Department metric in Social Interaction dashboard with group by Location',
          zephyrTestId: 'DE-26017',
          storyId: 'DE-25757',
        });

        const { socialInteractionQueryHelper } = testEnvironment;

        // Get expected data from snowflake with filters and groupBy applied
        const mostEngagedByDepartmentData =
          await socialInteractionQueryHelper.getMostEngagedByDepartmentDataFromDBWithFilters({
            filterBy: testFiltersConfig,
          });

        // Verify the same data is displayed in the dashboard
        const mostEngagedByDepartment = testEnvironment.socialInteractionDashboard.mostEngagedByDepartment;
        await mostEngagedByDepartment.scrollToComponent(testFiltersConfig.groupBy);
        await mostEngagedByDepartment.verifyUIDataMatchesWithSnowflakeData(
          mostEngagedByDepartmentData,
          testFiltersConfig.groupBy
        );
      }
    );

    test(
      'verify Least engaged by Department tabular data validation with group by Location',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, TestCaseType.TABULAR_METRIC, '@least-engaged-by-department'],
      },
      async () => {
        tagTest(test.info(), {
          description:
            'To verify Least engaged by Department metric in Social Interaction dashboard with group by Location',
          zephyrTestId: 'DE-26017',
          storyId: 'DE-25757',
        });

        const { socialInteractionQueryHelper } = testEnvironment;

        // Get expected data from snowflake with filters and groupBy applied
        const leastEngagedByDepartmentData =
          await socialInteractionQueryHelper.getLeastEngagedByDepartmentDataFromDBWithFilters({
            filterBy: testFiltersConfig,
          });

        // Verify the same data is displayed in the dashboard
        const leastEngagedByDepartment = testEnvironment.socialInteractionDashboard.leastEngagedByDepartment;
        await leastEngagedByDepartment.scrollToComponent(testFiltersConfig.groupBy);
        await leastEngagedByDepartment.verifyUIDataMatchesWithSnowflakeData(
          leastEngagedByDepartmentData,
          testFiltersConfig.groupBy
        );
      }
    );

    test(
      'verify Most engaged by Department CSV download and validation with group by Location',
      {
        tag: [
          TestPriority.P0,
          TestGroupType.REGRESSION,
          TestCaseType.CSV_VALIDATION,
          '@most-engaged-by-department-csv',
        ],
      },
      async () => {
        tagTest(test.info(), {
          description:
            'To verify Most engaged by Department CSV download and validation in Social Interaction dashboard with group by Location',
          zephyrTestId: 'DE-26017',
          storyId: 'DE-25757',
        });

        const { socialInteractionQueryHelper } = testEnvironment;

        // Get expected data from snowflake with filters and groupBy applied
        const mostEngagedByDepartmentData =
          await socialInteractionQueryHelper.getMostEngagedByDepartmentDataFromDBWithFilters({
            filterBy: testFiltersConfig,
          });

        // Verify CSV download and validation
        const mostEngagedByDepartment = testEnvironment.socialInteractionDashboard.mostEngagedByDepartment;
        // Scroll to component first to ensure it's visible
        await mostEngagedByDepartment.scrollToComponent(testFiltersConfig.groupBy);
        await mostEngagedByDepartment.verifyCSVDataMatchesWithDBData(mostEngagedByDepartmentData, testFiltersConfig);
      }
    );

    test(
      'verify Least engaged by Department CSV download and validation with group by Location',
      {
        tag: [
          TestPriority.P0,
          TestGroupType.REGRESSION,
          TestCaseType.CSV_VALIDATION,
          '@least-engaged-by-department-csv',
        ],
      },
      async () => {
        tagTest(test.info(), {
          description:
            'To verify Least engaged by Department CSV download and validation in Social Interaction dashboard with group by Location',
          zephyrTestId: 'DE-26017',
          storyId: 'DE-25757',
        });

        const { socialInteractionQueryHelper } = testEnvironment;

        // Get expected data from snowflake with filters and groupBy applied
        const leastEngagedByDepartmentData =
          await socialInteractionQueryHelper.getLeastEngagedByDepartmentDataFromDBWithFilters({
            filterBy: testFiltersConfig,
          });

        // Verify CSV download and validation
        const leastEngagedByDepartment = testEnvironment.socialInteractionDashboard.leastEngagedByDepartment;
        // Scroll to component first to ensure it's visible
        await leastEngagedByDepartment.scrollToComponent(testFiltersConfig.groupBy);
        await leastEngagedByDepartment.verifyCSVDataMatchesWithDBData(leastEngagedByDepartmentData, testFiltersConfig);
      }
    );
  }
);
