import { DataEngineeringTestSuite } from '@data-engineering/constants/testSuite';
import { Page, test } from '@playwright/test';

import { PeriodFilterTimeRange } from '../../../constants/periodFilterTimeRange';
import { ContentDashboardQueryHelper, SnowflakeHelper } from '../../../helpers';
import { FilterOptions } from '../../../helpers/baseAnalyticsQueryHelper';
import { ContentDashboard } from '../../../ui/dashboards';

import { TestGroupType } from '@/src/core';
import { TestPriority } from '@/src/core/constants/testPriority';
import { tagTest } from '@/src/core/utils/testDecorator';
import {
  cleanupDashboardTesting,
  setupContentDashboardForTest,
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
  'content Dashboard - Default Load State',
  {
    tag: [DataEngineeringTestSuite.ANALYTICS, '@content-dashboard-default-state'],
  },
  () => {
    test.slow();

    let testEnvironment: {
      page: Page;
      contentDashboard: ContentDashboard;
      snowflakeHelper: SnowflakeHelper;
      contentDashboardQueryHelper: ContentDashboardQueryHelper;
    };
    let testFiltersConfig: FilterOptions;

    test.beforeAll(
      'Setting up the content dashboard without making any changes to the filters',
      async ({ browser }) => {
        // Setup dashboard using dedicated method
        testEnvironment = await setupContentDashboardForTest(browser, UserRole.APP_MANAGER);

        testFiltersConfig = {
          tenantCode: process.env.ORG_ID!,
          timePeriod: PeriodFilterTimeRange.LAST_30_DAYS, // default period filter
        };

        const { analyticsFiltersComponent } = testEnvironment.contentDashboard;
        // Content dashboard only has Period filter
        await test.step('Verify Period filter is visible', async () => {
          await analyticsFiltersComponent.filterGroup('Period').waitFor({ state: 'visible', timeout: 40_000 });
        });
        await analyticsFiltersComponent.applyFiltersFromConfig(testFiltersConfig);
      }
    );

    test.afterAll('Cleaning up the test environment', async () => {
      await cleanupDashboardTesting(testEnvironment);
    });

    test(
      'verify Total content views metric data validation with default period filter (Last 30 days)',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, '@total-content-views'],
      },
      async () => {
        tagTest(test.info(), {
          description: 'To verify the answer of Total content views in Content dashboard with default filter',
          zephyrTestId: '',
          storyId: '',
        });

        const { contentDashboardQueryHelper } = testEnvironment;

        // Get expected metric value from snowflake with default period (Last 30 days)
        const expectedMetricValue = await contentDashboardQueryHelper.getTotalContentViewsDataFromDBWithFilters({
          filterBy: testFiltersConfig,
        });

        // UI validation
        const totalContentViewsMetric = testEnvironment.contentDashboard.totalContentViewsMetric;
        await totalContentViewsMetric.verifyMetricIsLoaded();
        // since it is a hero metric, it should return a single value and we are directly passing the value to the verifyMetricValue method
        await totalContentViewsMetric.verifyMetricValue(expectedMetricValue);
      }
    );

    test(
      'verify Total content published metric data validation with default period filter (Last 30 days)',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, '@total-content-published'],
      },
      async () => {
        tagTest(test.info(), {
          description: 'To verify the answer of Total content published in Content dashboard with default filter',
          zephyrTestId: '',
          storyId: '',
        });

        const { contentDashboardQueryHelper } = testEnvironment;

        // Get expected metric value from snowflake with default period (Last 30 days)
        const expectedMetricValue = await contentDashboardQueryHelper.getTotalContentPublishedDataFromDBWithFilters({
          filterBy: testFiltersConfig,
        });

        // UI validation
        const totalContentPublishedMetric = testEnvironment.contentDashboard.totalContentPublishedMetric;
        await totalContentPublishedMetric.verifyMetricIsLoaded();
        // Verify the absolute value (the metric shows just a number, not a percentage)
        await totalContentPublishedMetric.verifyAbsoluteMetricValueIs(expectedMetricValue.toString());
      }
    );

    test(
      'verify Unique content view metric data validation with default period filter (Last 30 days)',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, '@unique-content-view'],
      },
      async () => {
        tagTest(test.info(), {
          description: 'To verify the answer of Unique content view in Content dashboard with default filter',
          zephyrTestId: '',
          storyId: '',
        });

        const { contentDashboardQueryHelper } = testEnvironment;

        // Get expected metric value from snowflake with default period (Last 30 days)
        const expectedMetricValue = await contentDashboardQueryHelper.getUniqueContentViewDataFromDBWithFilters({
          filterBy: testFiltersConfig,
        });

        // UI validation
        const uniqueContentViewMetric = testEnvironment.contentDashboard.uniqueContentViewMetric;
        await uniqueContentViewMetric.verifyMetricIsLoaded();
        // since it is a hero metric, it should return a single value and we are directly passing the value to the verifyMetricValue method
        await uniqueContentViewMetric.verifyMetricValue(expectedMetricValue);
      }
    );

    test(
      'verify Currently published chart data validation with default period filter (Last 30 days)',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, '@currently-published'],
      },
      async () => {
        tagTest(test.info(), {
          description: 'To verify the answer of Currently published chart in Content dashboard with default filter',
          zephyrTestId: '',
          storyId: '',
        });

        const { contentDashboardQueryHelper } = testEnvironment;

        // Get expected chart data from snowflake
        const expectedChartData = await contentDashboardQueryHelper.getCurrentlyPublishedDataFromDBWithFilters({
          filterBy: testFiltersConfig,
        });

        // UI validation
        const currentlyPublishedMetric = testEnvironment.contentDashboard.currentlyPublishedMetric;
        await currentlyPublishedMetric.verifyChartIsLoaded();
        await currentlyPublishedMetric.verifyAxisLabels();

        // Extract content type names in the order they appear in DB (sorted DESC by count)
        const expectedContentTypes = expectedChartData.map(data => data.contentTypeName);
        await currentlyPublishedMetric.verifyXAxisLabelsMatchContentTypes(expectedContentTypes);
        await currentlyPublishedMetric.verifyBarsAreSortedByCountDescending(expectedChartData);
        await currentlyPublishedMetric.verifyBarsWithTooltips(expectedChartData);
      }
    );
  }
);
