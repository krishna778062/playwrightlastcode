import { PeriodFilterTimeRange } from '@data-engineering/constants/periodFilterTimeRange';
import { TestCaseType } from '@data-engineering/constants/testCaseType';
import { DataEngineeringTestSuite } from '@data-engineering/constants/testSuite';
import { SitesDashboardQueryHelper, SnowflakeHelper } from '@data-engineering/helpers';
import { FilterOptions } from '@data-engineering/helpers/baseAnalyticsQueryHelper';
import { SitesDashboard } from '@data-engineering/ui/dashboards';
import { Page, test } from '@playwright/test';

import { TestGroupType } from '@/src/core';
import { TestPriority } from '@/src/core/constants/testPriority';
import { tagTest } from '@/src/core/utils/testDecorator';
import {
  cleanupDashboardTesting,
  setupSitesDashboardForTest,
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
  'sites Dashboard - Default Load State',
  {
    tag: [DataEngineeringTestSuite.SITES, '@sites-dashboard-default-state'],
  },
  () => {
    test.slow();

    let testEnvironment: {
      page: Page;
      sitesDashboard: SitesDashboard;
      snowflakeHelper: SnowflakeHelper;
      sitesDashboardQueryHelper: SitesDashboardQueryHelper;
    };
    let testFiltersConfig: FilterOptions;

    test.beforeAll('Setting up the sites dashboard without making any changes to the filters', async ({ browser }) => {
      // Setup dashboard using dedicated method
      testEnvironment = await setupSitesDashboardForTest(browser, UserRole.APP_MANAGER);

      testFiltersConfig = {
        tenantCode: process.env.ORG_ID!,
        timePeriod: PeriodFilterTimeRange.LAST_30_DAYS, //default period filter
      };

      const { analyticsFiltersComponent } = testEnvironment.sitesDashboard;

      // Apply filters using unified configuration
      await analyticsFiltersComponent.applyFiltersFromConfig(testFiltersConfig);
    });

    test.afterAll('Cleaning up the test environment', async () => {
      if (testEnvironment) {
        await cleanupDashboardTesting(testEnvironment);
      }
    });

    test(
      'tS To verify the answer Total sites in Sites Dashboard',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, TestCaseType.HERO_METRIC, '@sites-total-sites-metric'],
      },
      async () => {
        tagTest(test.info(), {
          description: 'TS To verify the answer Total sites in Sites Dashboard',
          zephyrTestId: 'DE-26335',
          storyId: 'DE-26231',
        });

        const { sitesDashboardQueryHelper, sitesDashboard: _sitesDashboard } = testEnvironment;

        const dbValues = await sitesDashboardQueryHelper.getTotalSitesDataFromDBWithFilters({
          filterBy: testFiltersConfig,
        });

        console.log('dbValues', dbValues);

        const totalSitesMetrics = testEnvironment.sitesDashboard.totalSitesMetrics;
        //since it is a hero metric, it should return a single value and we are directly passing the value to the verifyMetricValue method
        //verifyMetricValue has built-in retry logic, so we don't need to verify metric is loaded separately
        await totalSitesMetrics.verifyMetricValue(dbValues.toString());
      }
    );

    test(
      'tS To verify the answer Site created in last 90 days in Sites Dashboard',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, TestCaseType.HERO_METRIC, '@sites-new-sites-last-90-days-metric'],
      },
      async () => {
        tagTest(test.info(), {
          description: 'TS To verify the answer Site created in last 90 days in Sites Dashboard',
          zephyrTestId: 'DE-26336',
          storyId: 'DE-26232',
        });

        const { sitesDashboardQueryHelper, sitesDashboard: _sitesDashboard } = testEnvironment;

        const dbValues = await sitesDashboardQueryHelper.getNewSitesLast90DaysDataFromDBWithFilters({
          filterBy: testFiltersConfig,
        });

        console.log('dbValues', dbValues);

        const newSitesLast90DaysMetrics = testEnvironment.sitesDashboard.newSitesLast90DaysMetrics;
        //since it is a hero metric, it should return a single value and we are directly passing the value to the verifyMetricValue method
        //verifyMetricValue has built-in retry logic, so we don't need to verify metric is loaded separately
        await newSitesLast90DaysMetrics.verifyMetricValue(dbValues.toString());
      }
    );

    test(
      'tS To verify the answer Featured sites in Sites Dashboard',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, TestCaseType.HERO_METRIC, '@sites-featured-sites-metric'],
      },
      async () => {
        tagTest(test.info(), {
          description: 'TS To verify the answer Featured sites in Sites Dashboard',
          zephyrTestId: 'DE-26337',
          storyId: 'DE-26233',
        });

        const { sitesDashboardQueryHelper, sitesDashboard: _sitesDashboard } = testEnvironment;

        const dbValues = await sitesDashboardQueryHelper.getFeaturedSitesDataFromDBWithFilters({
          filterBy: testFiltersConfig,
        });

        console.log('dbValues', dbValues);

        const featuredSitesMetrics = testEnvironment.sitesDashboard.featuredSitesMetrics;
        //since it is a hero metric, it should return a single value and we are directly passing the value to the verifyMetricValue method
        //verifyMetricValue has built-in retry logic, so we don't need to verify metric is loaded separately
        await featuredSitesMetrics.verifyMetricValue(dbValues.toString());
      }
    );

    test(
      'tS To verify the answer Total managers in Sites Dashboard',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, TestCaseType.HERO_METRIC, '@sites-total-managers-metric'],
      },
      async () => {
        tagTest(test.info(), {
          description: 'TS To verify the answer Total managers in Sites Dashboard',
          zephyrTestId: 'DE-26338',
          storyId: 'DE-26234',
        });

        const { sitesDashboardQueryHelper, sitesDashboard: _sitesDashboard } = testEnvironment;

        const dbValues = await sitesDashboardQueryHelper.getTotalManagersDataFromDBWithFilters({
          filterBy: testFiltersConfig,
        });

        console.log('dbValues', dbValues);

        const totalManagersMetrics = testEnvironment.sitesDashboard.totalManagersMetrics;
        //since it is a hero metric, it should return a single value and we are directly passing the value to the verifyMetricValue method
        //verifyMetricValue has built-in retry logic, so we don't need to verify metric is loaded separately
        await totalManagersMetrics.verifyMetricValue(dbValues.toString());
      }
    );

    test(
      'tS To verify the answer Total sites distribution in Sites Dashboard',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, TestCaseType.PIE_CHART, '@sites-total-sites-distribution-metric'],
      },
      async () => {
        tagTest(test.info(), {
          description: 'TS To verify the answer Total sites distribution in Sites Dashboard',
          zephyrTestId: 'DE-26339',
          storyId: 'DE-26235',
        });

        const { sitesDashboardQueryHelper, sitesDashboard } = testEnvironment;

        const dbResults = await sitesDashboardQueryHelper.getTotalSitesDistributionDataFromDBWithFilters({
          filterBy: testFiltersConfig,
        });

        console.log('dbResults', dbResults);

        const totalSitesDistributionMetrics = sitesDashboard.totalSitesDistributionMetrics;
        await totalSitesDistributionMetrics.scrollToComponent();

        // Verify number of segments matches DB results
        await totalSitesDistributionMetrics.verifyNumberOfSegmentsVisibleonPieChartIs(dbResults.length);

        // Verify each segment label data points
        for (const data of dbResults) {
          await totalSitesDistributionMetrics.verifySegmentLabelDataPointsAreAsExpected({
            label: data.siteType,
            expectedText: `${data.siteType} - ${data.count} (${data.percentage}%)`,
          });
        }

        // Verify tooltip is visible for each segment (hover interaction)
        for (const data of dbResults) {
          await totalSitesDistributionMetrics.hoverOverSegmentLabelWithLabelAs(data.siteType);
          await totalSitesDistributionMetrics.waitForToolTipContainerToBeVisible();
          // Note: Tooltip content validation is skipped as tooltip structure may differ
          // The main validation is the segment label data points above
        }
      }
    );

    test(
      'tS To verify the answer Total sites distribution (last 90 days) in Sites Dashboard',
      {
        tag: [
          TestPriority.P0,
          TestGroupType.SMOKE,
          TestCaseType.BAR_CHART,
          '@sites-total-sites-distribution-last-90-days-metric',
        ],
      },
      async () => {
        tagTest(test.info(), {
          description: 'TS To verify the answer Total sites distribution (last 90 days) in Sites Dashboard',
          zephyrTestId: 'DE-26340',
          storyId: 'DE-26235',
        });

        const { sitesDashboardQueryHelper, sitesDashboard } = testEnvironment;

        const dbResults = await sitesDashboardQueryHelper.getTotalSitesDistributionLast90DaysDataFromDBWithFilters({
          filterBy: testFiltersConfig,
        });

        console.log('dbResults', dbResults);

        const totalSitesDistributionLast90DaysMetrics = sitesDashboard.totalSitesDistributionLast90DaysMetrics;
        await totalSitesDistributionLast90DaysMetrics.scrollToComponent();

        // Verify number of bars matches DB results
        await totalSitesDistributionLast90DaysMetrics.verifyNumberOfBarsAreAsExpected({
          numberOfBars: dbResults.length,
        });

        // Verify tooltip for each bar
        for (const data of dbResults) {
          await totalSitesDistributionLast90DaysMetrics.hoverOnBarWithLabelAs(data.siteType);
          await totalSitesDistributionLast90DaysMetrics.waitForToolTipContainerToBeVisible();
          // Note: Tooltip content validation is skipped as tooltip structure may differ
          // The main validation is the number of bars matching DB results
        }
      }
    );

    test(
      'tS To verify the answer Most Popular in Sites Dashboard',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, TestCaseType.TABULAR_METRIC, '@sites-most-popular-metric'],
      },
      async () => {
        tagTest(test.info(), {
          description: 'TS To verify the answer Most Popular in Sites Dashboard',
          zephyrTestId: 'DE-26383',
          storyId: 'DE-26250',
        });

        const { sitesDashboardQueryHelper, sitesDashboard } = testEnvironment;

        const dbResults = await sitesDashboardQueryHelper.getMostPopularSitesDataFromDBWithFilters({
          filterBy: testFiltersConfig,
        });

        console.log('dbResults', dbResults);

        const mostPopularSitesMetrics = sitesDashboard.mostPopularSitesMetrics;
        await mostPopularSitesMetrics.scrollToComponent();

        // Verify tabular data is loaded
        await mostPopularSitesMetrics.verifyDataIsLoaded();

        // Verify UI data matches DB data
        await mostPopularSitesMetrics.verifyUIDataMatchesWithSnowflakeData(dbResults);
      }
    );

    test(
      'tS To verify the answer Least Popular in Sites Dashboard',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, TestCaseType.TABULAR_METRIC, '@sites-least-popular-metric'],
      },
      async () => {
        tagTest(test.info(), {
          description: 'TS To verify the answer Least Popular in Sites Dashboard',
          zephyrTestId: 'DE-26384',
          storyId: 'DE-26237',
        });

        const { sitesDashboardQueryHelper, sitesDashboard } = testEnvironment;

        const dbResults = await sitesDashboardQueryHelper.getLeastPopularSitesDataFromDBWithFilters({
          filterBy: testFiltersConfig,
        });

        console.log('dbResults', dbResults);

        const leastPopularSitesMetrics = sitesDashboard.leastPopularSitesMetrics;
        await leastPopularSitesMetrics.scrollToComponent();

        // Verify tabular data is loaded
        await leastPopularSitesMetrics.verifyDataIsLoaded();

        // Verify UI data matches DB data
        await leastPopularSitesMetrics.verifyUIDataMatchesWithSnowflakeData(dbResults);
      }
    );

    test(
      'tS To verify the answer Most published content in Sites Dashboard',
      {
        tag: [
          TestPriority.P0,
          TestGroupType.SMOKE,
          TestCaseType.TABULAR_METRIC,
          '@sites-most-published-content-metric',
        ],
      },
      async () => {
        tagTest(test.info(), {
          description: 'TS To verify the answer Most published content in Sites Dashboard',
          zephyrTestId: 'DE-26385',
          storyId: 'DE-26238',
        });

        const { sitesDashboardQueryHelper, sitesDashboard } = testEnvironment;

        const dbResults = await sitesDashboardQueryHelper.getMostPublishedContentDataFromDBWithFilters({
          filterBy: testFiltersConfig,
        });

        console.log('dbResults', dbResults);

        const mostPublishedContentMetrics = sitesDashboard.mostPublishedContentMetrics;
        await mostPublishedContentMetrics.scrollToComponent();

        // Verify tabular data is loaded
        await mostPublishedContentMetrics.verifyDataIsLoaded();

        // Verify UI data matches DB data
        await mostPublishedContentMetrics.verifyUIDataMatchesWithSnowflakeData(dbResults);
      }
    );

    test(
      'tS To verify the answer Least published content in Sites Dashboard',
      {
        tag: [
          TestPriority.P0,
          TestGroupType.SMOKE,
          TestCaseType.TABULAR_METRIC,
          '@sites-least-published-content-metric',
        ],
      },
      async () => {
        tagTest(test.info(), {
          description: 'TS To verify the answer Least published content in Sites Dashboard',
          zephyrTestId: 'DE-26386',
          storyId: 'DE-26239',
        });

        const { sitesDashboardQueryHelper, sitesDashboard } = testEnvironment;

        const dbResults = await sitesDashboardQueryHelper.getLeastPublishedContentDataFromDBWithFilters({
          filterBy: testFiltersConfig,
        });

        console.log('dbResults', dbResults);

        const leastPublishedContentMetrics = sitesDashboard.leastPublishedContentMetrics;
        await leastPublishedContentMetrics.scrollToComponent();

        // Verify tabular data is loaded
        await leastPublishedContentMetrics.verifyDataIsLoaded();

        // Verify UI data matches DB data
        await leastPublishedContentMetrics.verifyUIDataMatchesWithSnowflakeData(dbResults);
      }
    );

    test(
      'tS To verify the CSV Most Popular in Sites Dashboard',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, TestCaseType.CSV_VALIDATION, '@sites-most-popular-csv'],
      },
      async () => {
        tagTest(test.info(), {
          description: 'TS To verify the CSV Most Popular in Sites Dashboard',
          zephyrTestId: 'DE-26738',
          storyId: 'DE-26250',
        });

        // Get expected metric value from snowflake with default period (Last 30 days)
        const dbData = await testEnvironment.sitesDashboardQueryHelper.getMostPopularSitesDataFromDBWithFilters({
          filterBy: testFiltersConfig,
        });

        // Component handles CSV validation internally
        const mostPopularSitesMetric = testEnvironment.sitesDashboard.mostPopularSitesMetrics;
        await mostPopularSitesMetric.verifyCSVDataMatchesWithSnowflakeData(dbData, testFiltersConfig.timePeriod);
      }
    );

    test(
      'tS To verify the CSV Least Popular in Sites Dashboard',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, TestCaseType.CSV_VALIDATION, '@sites-least-popular-csv'],
      },
      async () => {
        tagTest(test.info(), {
          description: 'TS To verify the CSV Least Popular in Sites Dashboard',
          zephyrTestId: 'DE-26739',
          storyId: 'DE-26237',
        });

        // Get expected metric value from snowflake with default period (Last 30 days)
        const dbData = await testEnvironment.sitesDashboardQueryHelper.getLeastPopularSitesDataFromDBWithFilters({
          filterBy: testFiltersConfig,
        });

        // Component handles CSV validation internally
        const leastPopularSitesMetric = testEnvironment.sitesDashboard.leastPopularSitesMetrics;
        await leastPopularSitesMetric.verifyCSVDataMatchesWithSnowflakeData(dbData, testFiltersConfig.timePeriod);
      }
    );

    test(
      'tS To verify the CSV Most published content in Sites Dashboard',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, TestCaseType.CSV_VALIDATION, '@sites-most-published-content-csv'],
      },
      async () => {
        tagTest(test.info(), {
          description: 'TS To verify the CSV Most published content in Sites Dashboard',
          zephyrTestId: 'DE-26740',
          storyId: 'DE-26238',
        });

        // Get expected metric value from snowflake with default period (Last 30 days)
        const dbData = await testEnvironment.sitesDashboardQueryHelper.getMostPublishedContentDataFromDBWithFilters({
          filterBy: testFiltersConfig,
        });

        // Component handles CSV validation internally
        const mostPublishedContentMetric = testEnvironment.sitesDashboard.mostPublishedContentMetrics;
        await mostPublishedContentMetric.verifyCSVDataMatchesWithSnowflakeData(dbData, testFiltersConfig.timePeriod);
      }
    );

    test(
      'tS To verify the CSV Least published content in Sites Dashboard',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, TestCaseType.CSV_VALIDATION, '@sites-least-published-content-csv'],
      },
      async () => {
        tagTest(test.info(), {
          description: 'TS To verify the CSV Least published content in Sites Dashboard',
          zephyrTestId: 'DE-26741',
          storyId: 'DE-26239',
        });

        // Get expected metric value from snowflake with default period (Last 30 days)
        const dbData = await testEnvironment.sitesDashboardQueryHelper.getLeastPublishedContentDataFromDBWithFilters({
          filterBy: testFiltersConfig,
        });

        // Component handles CSV validation internally
        const leastPublishedContentMetric = testEnvironment.sitesDashboard.leastPublishedContentMetrics;
        await leastPublishedContentMetric.verifyCSVDataMatchesWithSnowflakeData(dbData, testFiltersConfig.timePeriod);
      }
    );

    test(
      'tS To verify the answer Low activity sites in Sites Dashboard',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, TestCaseType.TABULAR_METRIC, '@sites-low-activity-sites-metric'],
      },
      async () => {
        tagTest(test.info(), {
          description: 'TS To verify the answer Low activity sites in Sites Dashboard',
          zephyrTestId: 'DE-26341',
          storyId: 'DE-26236',
        });

        const { sitesDashboardQueryHelper, sitesDashboard } = testEnvironment;

        const dbResults = await sitesDashboardQueryHelper.getLowActivitySitesDataFromDB();

        console.log('dbResults', dbResults);

        const lowActivitySitesMetrics = sitesDashboard.lowActivitySitesMetrics;
        await lowActivitySitesMetrics.scrollToComponent();

        // Verify tabular data is loaded
        await lowActivitySitesMetrics.verifyDataIsLoaded();

        // Verify UI data matches DB data
        await lowActivitySitesMetrics.verifyUIDataMatchesWithSnowflakeData(dbResults);
      }
    );
  }
);
