import { DataEngineeringTestSuite } from '@data-engineering/constants/testSuite';
import { Page, test } from '@playwright/test';

import { PeriodFilterTimeRange } from '../../../constants/periodFilterTimeRange';
import { SnowflakeHelper } from '../../../helpers';
import { FilterOptions } from '../../../helpers/baseAnalyticsQueryHelper';
import { MobileDashboardQueryHelper } from '../../../helpers/mobileDashboardQueryHelper';
import { MobileDashboard } from '../../../ui/dashboards';

import { TestGroupType } from '@/src/core';
import { TestPriority } from '@/src/core/constants/testPriority';
import { tagTest } from '@/src/core/utils/testDecorator';
import {
  cleanupDashboardTesting,
  setupMobileDashboardForTest,
  UserRole,
} from '@/src/modules/data-engineering/helpers/dashboardSetupHelper';

/**
 * Currently I am picking static values for all the filters as
 * per the given tenant + env.
 * We will replace this with dynamic values in the future.
 * Where we should fetch the values from the DB for each filter
 * and decide which one to pick for the test.
 */

test.describe(
  'mobile Dashboard - Default Load State',
  {
    tag: [DataEngineeringTestSuite.MOBILE, '@mobile-dashboard-default-state'],
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

    test.beforeAll('Setting up the mobile dashboard without making any changes to the filters', async ({ browser }) => {
      // Setup dashboard using dedicated method
      testEnvironment = await setupMobileDashboardForTest(browser, UserRole.APP_MANAGER);

      testFiltersConfig = {
        tenantCode: process.env.ORG_ID!,
        timePeriod: PeriodFilterTimeRange.LAST_30_DAYS, //default period filter
      };

      const { analyticsFiltersComponent } = testEnvironment.mobileDashboard;
      await analyticsFiltersComponent.verifyFilterComponentIsVisible();

      // Apply filters using unified configuration
      await analyticsFiltersComponent.applyFiltersFromConfig(testFiltersConfig);
    });

    test.afterAll('Cleaning up the test environment', async () => {
      if (testEnvironment) {
        await cleanupDashboardTesting(testEnvironment);
      }
    });

    test(
      'tS To verify the answer Total users in Mobile Dashboard',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, '@mobile-total-users-metric'],
      },
      async () => {
        tagTest(test.info(), {
          description: 'To verify the answer Total users in Mobile Dashboard',
          zephyrTestId: 'DE-25967',
          storyId: 'DE-25936',
        });

        const { mobileDashboardQueryHelper, mobileDashboard: _mobileDashboard } = testEnvironment;

        const dbValues = await mobileDashboardQueryHelper.getTotalUsersDataFromDBWithFilters({
          filterBy: testFiltersConfig,
        });

        const totalUsersMetrics = testEnvironment.mobileDashboard.totalUsersMetrics;
        //since it is a hero metric, it should return a single value and we are directly passing the value to the verifyMetricValue method
        //verifyMetricValue has built-in retry logic, so we don't need to verify metric is loaded separately
        await totalUsersMetrics.verifyMetricValue(dbValues.toString());
      }
    );

    test(
      'tS To verify the answer Mobile logged-in users in Mobile Dashboard',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, '@mobile-logged-in-users-metric'],
      },
      async () => {
        tagTest(test.info(), {
          description: 'To verify the answer Mobile logged-in users in Mobile Dashboard',
          zephyrTestId: 'DE-25972',
          storyId: 'DE-25937',
        });

        const { mobileDashboardQueryHelper, mobileDashboard: _mobileDashboard } = testEnvironment;

        const dbValues = await mobileDashboardQueryHelper.getMobileLoggedInUsersDataFromDBWithFilters({
          filterBy: testFiltersConfig,
        });

        const mobileLoggedInUsersMetrics = testEnvironment.mobileDashboard.mobileLoggedInUsersMetrics;
        //since it is a hero metric, it should return a single value and we are directly passing the value to the verifyMetricValue method
        await mobileLoggedInUsersMetrics.verifyMetricValue(dbValues.toString());
      }
    );

    test(
      'tS To verify the answer Mobile content viewers in Mobile Dashboard',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, '@mobile-content-viewers-metric'],
      },
      async () => {
        tagTest(test.info(), {
          description: 'To verify the answer Mobile content viewers in Mobile Dashboard',
          zephyrTestId: 'DE-25973',
          storyId: 'DE-25938',
        });

        const { mobileDashboardQueryHelper, mobileDashboard: _mobileDashboard } = testEnvironment;

        const dbValues = await mobileDashboardQueryHelper.getMobileContentViewersDataFromDBWithFilters({
          filterBy: testFiltersConfig,
        });

        const mobileContentViewersMetrics = testEnvironment.mobileDashboard.mobileContentViewersMetrics;
        //since it is a hero metric, it should return a single value and we are directly passing the value to the verifyMetricValue method
        await mobileContentViewersMetrics.verifyMetricValue(dbValues.toString());
      }
    );

    test(
      'tS To verify the answer Total mobile content views in Mobile Dashboard',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, '@total-mobile-content-views-metric'],
      },
      async () => {
        tagTest(test.info(), {
          description: 'To verify the answer Total mobile content views in Mobile Dashboard',
          zephyrTestId: 'DE-25974',
          storyId: 'DE-25939',
        });

        const { mobileDashboardQueryHelper, mobileDashboard: _mobileDashboard } = testEnvironment;

        const dbValues = await mobileDashboardQueryHelper.getTotalMobileContentViewsDataFromDBWithFilters({
          filterBy: testFiltersConfig,
        });

        const totalMobileContentViewsMetrics = testEnvironment.mobileDashboard.totalMobileContentViewsMetrics;
        //since it is a hero metric, it should return a single value and we are directly passing the value to the verifyMetricValue method
        await totalMobileContentViewsMetrics.verifyMetricValue(dbValues.toString());
      }
    );

    test(
      'tS To verify the answer Avg mobile content views per user in Mobile Dashboard',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, '@avg-mobile-content-views-per-user-metric'],
      },
      async () => {
        tagTest(test.info(), {
          description: 'To verify the answer Avg mobile content views per user in Mobile Dashboard',
          zephyrTestId: 'DE-25975',
          storyId: 'DE-25940',
        });

        const { mobileDashboardQueryHelper, mobileDashboard: _mobileDashboard } = testEnvironment;

        const dbValues = await mobileDashboardQueryHelper.getAvgMobileContentViewsPerUserDataFromDBWithFilters({
          filterBy: testFiltersConfig,
        });

        const avgMobileContentViewsPerUserMetrics = testEnvironment.mobileDashboard.avgMobileContentViewsPerUserMetrics;
        //since it is a hero metric, it should return a single value and we are directly passing the value to the verifyMetricValue method
        await avgMobileContentViewsPerUserMetrics.verifyMetricValue(dbValues.toString());
      }
    );

    test(
      'tS To verify the answer Unique Mobile content views in Mobile Dashboard',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, '@unique-mobile-content-views-metric'],
      },
      async () => {
        tagTest(test.info(), {
          description: 'To verify the answer Unique Mobile content views in Mobile Dashboard',
          zephyrTestId: 'DE-25976',
          storyId: 'DE-25941',
        });

        const { mobileDashboardQueryHelper, mobileDashboard: _mobileDashboard } = testEnvironment;

        const dbValues = await mobileDashboardQueryHelper.getUniqueMobileContentViewsDataFromDBWithFilters({
          filterBy: testFiltersConfig,
        });

        const uniqueMobileContentViewsMetrics = testEnvironment.mobileDashboard.uniqueMobileContentViewsMetrics;
        //since it is a hero metric, it should return a single value and we are directly passing the value to the verifyMetricValue method
        await uniqueMobileContentViewsMetrics.verifyMetricValue(dbValues.toString());
      }
    );
  }
);
