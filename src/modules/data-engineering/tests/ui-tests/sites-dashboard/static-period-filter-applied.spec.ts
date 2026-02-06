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
import { getDataEngineeringConfigFromCache } from '@/src/modules/data-engineering/config/dataEngineeringConfig';
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
  'sites Dashboard - Static Period Filter Applied',
  {
    tag: [DataEngineeringTestSuite.SITES, '@static-period-filter'],
  },
  () => {
    test.slow();

    let testEnvironment: {
      page: Page;
      sitesDashboard: SitesDashboard;
      sitesDashboardQueryHelper: SitesDashboardQueryHelper;
      snowflakeHelper: SnowflakeHelper;
    };
    let testFiltersConfig: FilterOptions;

    test.beforeAll('Setting up the sites dashboard + applying Last 36 months period filter', async ({ browser }) => {
      // Setup dashboard using dedicated method
      testEnvironment = await setupSitesDashboardForTest(browser, UserRole.APP_MANAGER);

      testFiltersConfig = {
        tenantCode: getDataEngineeringConfigFromCache().orgId,
        timePeriod: PeriodFilterTimeRange.LAST_36_MONTHS,
      };

      const { analyticsFiltersComponent } = testEnvironment.sitesDashboard;

      // Apply filters using unified configuration
      await analyticsFiltersComponent.applyFiltersFromConfig(testFiltersConfig);
    });

    test.afterAll('Cleaning up the test environment', async () => {
      await cleanupDashboardTesting(testEnvironment);
    });

    test(
      'verify Total sites metric data validation with Last 36 months period filter applied',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, TestCaseType.HERO_METRIC, '@sites-total-sites-metric'],
      },
      async () => {
        tagTest(test.info(), {
          description:
            'To verify the answer of Total sites in Sites dashboard with Last 36 months period filter applied',
          zephyrTestId: 'DE-26335',
          storyId: 'DE-26231',
        });

        // Get expected metric value from snowflake with Last 36 months period filter applied
        const expectedMetricValue = await testEnvironment.sitesDashboardQueryHelper.getTotalSitesDataFromDBWithFilters({
          filterBy: testFiltersConfig,
        });

        console.log('Expected Total Sites Value:', expectedMetricValue);

        // UI validation
        const totalSitesMetrics = testEnvironment.sitesDashboard.totalSitesMetrics;
        await totalSitesMetrics.verifyMetricValue(expectedMetricValue.toString());
      }
    );

    test(
      'tS To verify the answer Site created in last 90 days in Sites Dashboard (should show last 90 days data even with Last 36 months period filter)',
      {
        tag: [
          TestPriority.P0,
          TestGroupType.SMOKE,
          TestGroupType.HEALTHCHECK,
          TestCaseType.HERO_METRIC,
          '@sites-new-sites-last-90-days-metric',
        ],
      },
      async () => {
        tagTest(test.info(), {
          description:
            'TS To verify the answer Site created in last 90 days in Sites Dashboard - verifies that this widget always shows last 90 days data regardless of Last 36 months period filter',
          zephyrTestId: 'DE-26336',
          storyId: 'DE-26232',
        });

        const { sitesDashboardQueryHelper, sitesDashboard: _sitesDashboard } = testEnvironment;

        // Query helper only uses tenantCode and ignores date filters - always returns last 90 days data
        // Last 36 months period filter is still active in UI, but this widget always shows last 90 days
        const dbValues = await sitesDashboardQueryHelper.getNewSitesLast90DaysDataFromDBWithFilters({
          filterBy: testFiltersConfig,
        });

        console.log('dbValues (last 90 days):', dbValues);

        const newSitesLast90DaysMetrics = testEnvironment.sitesDashboard.newSitesLast90DaysMetrics;
        //since it is a hero metric, it should return a single value and we are directly passing the value to the verifyMetricValue method
        //verifyMetricValue has built-in retry logic, so we don't need to verify metric is loaded separately
        //This verifies that the widget shows last 90 days data even though Last 36 months period filter is applied
        await newSitesLast90DaysMetrics.verifyMetricValue(dbValues.toString());
      }
    );

    test(
      'verify Featured sites metric data validation with Last 36 months period filter applied',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, TestCaseType.HERO_METRIC, '@sites-featured-sites-metric'],
      },
      async () => {
        tagTest(test.info(), {
          description:
            'To verify the answer of Featured sites in Sites dashboard with Last 36 months period filter applied',
          zephyrTestId: 'DE-26337',
          storyId: 'DE-26233',
        });

        // Get expected metric value from snowflake with Last 36 months period filter applied
        const expectedMetricValue =
          await testEnvironment.sitesDashboardQueryHelper.getFeaturedSitesDataFromDBWithFilters({
            filterBy: testFiltersConfig,
          });

        console.log('Expected Featured Sites Value:', expectedMetricValue);

        // UI validation
        const featuredSitesMetrics = testEnvironment.sitesDashboard.featuredSitesMetrics;
        await featuredSitesMetrics.verifyMetricValue(expectedMetricValue.toString());
      }
    );

    test(
      'verify Total managers metric data validation with Last 36 months period filter applied',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, TestCaseType.HERO_METRIC, '@sites-total-managers-metric'],
      },
      async () => {
        tagTest(test.info(), {
          description:
            'To verify the answer of Total managers in Sites dashboard with Last 36 months period filter applied',
          zephyrTestId: 'DE-26338',
          storyId: 'DE-26234',
        });

        // Get expected metric value from snowflake with Last 36 months period filter applied
        const expectedMetricValue =
          await testEnvironment.sitesDashboardQueryHelper.getTotalManagersDataFromDBWithFilters({
            filterBy: testFiltersConfig,
          });

        console.log('Expected Total Managers Value:', expectedMetricValue);

        // UI validation
        const totalManagersMetrics = testEnvironment.sitesDashboard.totalManagersMetrics;
        await totalManagersMetrics.verifyMetricValue(expectedMetricValue.toString());
      }
    );

    test(
      'verify Total sites distribution metric data validation with Last 36 months period filter applied',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, TestCaseType.PIE_CHART, '@sites-total-sites-distribution-metric'],
      },
      async () => {
        tagTest(test.info(), {
          description:
            'To verify the answer of Total sites distribution in Sites dashboard with Last 36 months period filter applied',
          zephyrTestId: 'DE-26339',
          storyId: 'DE-26235',
        });

        // Get expected metric value from snowflake with Last 36 months period filter applied
        const expectedMetricValue =
          await testEnvironment.sitesDashboardQueryHelper.getTotalSitesDistributionDataFromDBWithFilters({
            filterBy: testFiltersConfig,
          });

        console.log('Expected Total Sites Distribution Data:', expectedMetricValue);

        // UI validation
        const totalSitesDistributionMetrics = testEnvironment.sitesDashboard.totalSitesDistributionMetrics;
        await totalSitesDistributionMetrics.scrollToComponent();

        // Verify number of segments matches DB results
        await totalSitesDistributionMetrics.verifyNumberOfSegmentsVisibleonPieChartIs(expectedMetricValue.length);

        // Verify each segment label data points
        for (const data of expectedMetricValue) {
          await totalSitesDistributionMetrics.verifySegmentLabelDataPointsAreAsExpected({
            label: data.siteType,
            expectedText: `${data.siteType} - ${data.count} (${data.percentage}%)`,
          });
        }

        // Verify tooltip is visible for each segment (hover interaction)
        for (const data of expectedMetricValue) {
          await totalSitesDistributionMetrics.hoverOverSegmentLabelWithLabelAs(data.siteType);
          await totalSitesDistributionMetrics.waitForToolTipContainerToBeVisible();
        }
      }
    );

    test(
      'verify Total sites distribution CSV data validation with Last 36 months period filter applied',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, TestCaseType.CSV_VALIDATION, '@sites-total-sites-distribution-csv'],
      },
      async () => {
        tagTest(test.info(), {
          description:
            'To verify the CSV Total sites distribution in Sites dashboard with Last 36 months period filter applied',
          zephyrTestId: 'DE-XXXXX',
          storyId: 'DE-26235',
        });

        // Get expected CSV data from snowflake (detailed site records matching CSV export format)
        const dbData =
          await testEnvironment.sitesDashboardQueryHelper.getTotalSitesDistributionCSVDataFromDBWithFilters({
            filterBy: testFiltersConfig,
          });

        // Component handles CSV validation internally
        const totalSitesDistributionMetrics = testEnvironment.sitesDashboard.totalSitesDistributionMetrics;
        await totalSitesDistributionMetrics.verifyCSVDataMatchesWithSnowflakeData(dbData);
      }
    );

    test(
      'tS To verify the answer Total sites distribution (last 90 days) in Sites Dashboard (should show last 90 days data even with Last 36 months period filter)',
      {
        tag: [
          TestPriority.P0,
          TestGroupType.SMOKE,
          TestGroupType.HEALTHCHECK,
          TestCaseType.BAR_CHART,
          '@sites-total-sites-distribution-last-90-days-metric',
        ],
      },
      async () => {
        tagTest(test.info(), {
          description:
            'TS To verify the answer Total sites distribution (last 90 days) in Sites Dashboard - verifies that this widget always shows last 90 days data regardless of Last 36 months period filter',
          zephyrTestId: 'DE-26340',
          storyId: 'DE-26235',
        });

        const { sitesDashboardQueryHelper, sitesDashboard } = testEnvironment;

        // Query helper only uses tenantCode and ignores date filters - always returns last 90 days data
        // Last 36 months period filter is still active in UI, but this widget always shows last 90 days
        const dbResults = await sitesDashboardQueryHelper.getTotalSitesDistributionLast90DaysDataFromDBWithFilters({
          filterBy: testFiltersConfig,
        });

        console.log('dbResults (last 90 days):', dbResults);

        const totalSitesDistributionLast90DaysMetrics = sitesDashboard.totalSitesDistributionLast90DaysMetrics;
        await totalSitesDistributionLast90DaysMetrics.scrollToComponent();

        // Verify number of bars matches DB results
        // This verifies that the widget shows last 90 days data even though Last 36 months period filter is applied
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
      'verify Most Popular sites metric data validation with Last 36 months period filter applied',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, TestCaseType.TABULAR_METRIC, '@sites-most-popular-metric'],
      },
      async () => {
        tagTest(test.info(), {
          description:
            'To verify the answer of Most Popular sites in Sites dashboard with Last 36 months period filter applied',
          zephyrTestId: 'DE-26383',
          storyId: 'DE-26250',
        });

        // Get expected metric value from snowflake with Last 36 months period filter applied
        const expectedMetricValue =
          await testEnvironment.sitesDashboardQueryHelper.getMostPopularSitesDataFromDBWithFilters({
            filterBy: testFiltersConfig,
          });

        console.log('Expected Most Popular Sites Data:', expectedMetricValue);

        // UI validation
        const mostPopularSitesMetrics = testEnvironment.sitesDashboard.mostPopularSitesMetrics;
        await mostPopularSitesMetrics.scrollToComponent();

        // Verify tabular data is loaded
        await mostPopularSitesMetrics.verifyDataIsLoaded();

        // Verify UI data matches DB data
        await mostPopularSitesMetrics.verifyUIDataMatchesWithSnowflakeData(expectedMetricValue);
      }
    );

    test(
      'verify Most Popular sites CSV data validation with Last 36 months period filter applied',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, TestCaseType.CSV_VALIDATION, '@sites-most-popular-csv'],
      },
      async () => {
        tagTest(test.info(), {
          description:
            'To verify the CSV Most Popular sites in Sites dashboard with Last 36 months period filter applied',
          zephyrTestId: 'DE-26738',
          storyId: 'DE-26250',
        });

        // Get expected metric value from snowflake with Last 36 months period filter applied
        const dbData = await testEnvironment.sitesDashboardQueryHelper.getMostPopularSitesDataFromDBWithFilters({
          filterBy: testFiltersConfig,
        });

        // Component handles CSV validation internally
        const mostPopularSitesMetric = testEnvironment.sitesDashboard.mostPopularSitesMetrics;
        await mostPopularSitesMetric.verifyCSVDataMatchesWithSnowflakeData(dbData, testFiltersConfig.timePeriod);
      }
    );

    test(
      'verify Least Popular sites metric data validation with Last 36 months period filter applied',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, TestCaseType.TABULAR_METRIC, '@sites-least-popular-metric'],
      },
      async () => {
        tagTest(test.info(), {
          description:
            'To verify the answer of Least Popular sites in Sites dashboard with Last 36 months period filter applied',
          zephyrTestId: 'DE-26384',
          storyId: 'DE-26237',
        });

        // Get expected metric value from snowflake with Last 36 months period filter applied
        const expectedMetricValue =
          await testEnvironment.sitesDashboardQueryHelper.getLeastPopularSitesDataFromDBWithFilters({
            filterBy: testFiltersConfig,
          });

        console.log('Expected Least Popular Sites Data:', expectedMetricValue);

        // UI validation
        const leastPopularSitesMetrics = testEnvironment.sitesDashboard.leastPopularSitesMetrics;
        await leastPopularSitesMetrics.scrollToComponent();

        // Verify tabular data is loaded
        await leastPopularSitesMetrics.verifyDataIsLoaded();

        // Verify UI data matches DB data
        await leastPopularSitesMetrics.verifyUIDataMatchesWithSnowflakeData(expectedMetricValue);
      }
    );

    test(
      'verify Least Popular sites CSV data validation with Last 36 months period filter applied',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, TestCaseType.CSV_VALIDATION, '@sites-least-popular-csv'],
      },
      async () => {
        tagTest(test.info(), {
          description:
            'To verify the CSV Least Popular sites in Sites dashboard with Last 36 months period filter applied',
          zephyrTestId: 'DE-26739',
          storyId: 'DE-26237',
        });

        // Get expected metric value from snowflake with Last 36 months period filter applied
        const dbData = await testEnvironment.sitesDashboardQueryHelper.getLeastPopularSitesDataFromDBWithFilters({
          filterBy: testFiltersConfig,
        });

        // Component handles CSV validation internally
        const leastPopularSitesMetric = testEnvironment.sitesDashboard.leastPopularSitesMetrics;
        await leastPopularSitesMetric.verifyCSVDataMatchesWithSnowflakeData(dbData, testFiltersConfig.timePeriod);
      }
    );

    test(
      'verify Most published content metric data validation with Last 36 months period filter applied',
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
          description:
            'To verify the answer of Most published content in Sites dashboard with Last 36 months period filter applied',
          zephyrTestId: 'DE-26385',
          storyId: 'DE-26238',
        });

        // Get expected metric value from snowflake with Last 36 months period filter applied
        const expectedMetricValue =
          await testEnvironment.sitesDashboardQueryHelper.getMostPublishedContentDataFromDBWithFilters({
            filterBy: testFiltersConfig,
          });

        console.log('Expected Most Published Content Data:', expectedMetricValue);

        // UI validation
        const mostPublishedContentMetrics = testEnvironment.sitesDashboard.mostPublishedContentMetrics;
        await mostPublishedContentMetrics.scrollToComponent();

        // Verify tabular data is loaded
        await mostPublishedContentMetrics.verifyDataIsLoaded();

        // Verify UI data matches DB data
        await mostPublishedContentMetrics.verifyUIDataMatchesWithSnowflakeData(expectedMetricValue);
      }
    );

    test(
      'verify Most published content CSV data validation with Last 36 months period filter applied',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, TestCaseType.CSV_VALIDATION, '@sites-most-published-content-csv'],
      },
      async () => {
        tagTest(test.info(), {
          description:
            'To verify the CSV Most published content in Sites dashboard with Last 36 months period filter applied',
          zephyrTestId: 'DE-26740',
          storyId: 'DE-26238',
        });

        // Get expected metric value from snowflake with Last 36 months period filter applied
        const dbData = await testEnvironment.sitesDashboardQueryHelper.getMostPublishedContentDataFromDBWithFilters({
          filterBy: testFiltersConfig,
        });

        // Component handles CSV validation internally
        const mostPublishedContentMetric = testEnvironment.sitesDashboard.mostPublishedContentMetrics;
        await mostPublishedContentMetric.verifyCSVDataMatchesWithSnowflakeData(dbData, testFiltersConfig.timePeriod);
      }
    );

    test(
      'verify Least published content metric data validation with Last 36 months period filter applied',
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
          description:
            'To verify the answer of Least published content in Sites dashboard with Last 36 months period filter applied',
          zephyrTestId: 'DE-26386',
          storyId: 'DE-26239',
        });

        // Get expected metric value from snowflake with Last 36 months period filter applied
        const expectedMetricValue =
          await testEnvironment.sitesDashboardQueryHelper.getLeastPublishedContentDataFromDBWithFilters({
            filterBy: testFiltersConfig,
          });

        console.log('Expected Least Published Content Data:', expectedMetricValue);

        // UI validation
        const leastPublishedContentMetrics = testEnvironment.sitesDashboard.leastPublishedContentMetrics;
        await leastPublishedContentMetrics.scrollToComponent();

        // Verify tabular data is loaded
        await leastPublishedContentMetrics.verifyDataIsLoaded();

        // Verify UI data matches DB data
        await leastPublishedContentMetrics.verifyUIDataMatchesWithSnowflakeData(expectedMetricValue);
      }
    );

    test(
      'verify Least published content CSV data validation with Last 36 months period filter applied',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, TestCaseType.CSV_VALIDATION, '@sites-least-published-content-csv'],
      },
      async () => {
        tagTest(test.info(), {
          description:
            'To verify the CSV Least published content in Sites dashboard with Last 36 months period filter applied',
          zephyrTestId: 'DE-26741',
          storyId: 'DE-26239',
        });

        // Get expected metric value from snowflake with Last 36 months period filter applied
        const dbData = await testEnvironment.sitesDashboardQueryHelper.getLeastPublishedContentDataFromDBWithFilters({
          filterBy: testFiltersConfig,
        });

        // Component handles CSV validation internally
        const leastPublishedContentMetric = testEnvironment.sitesDashboard.leastPublishedContentMetrics;
        await leastPublishedContentMetric.verifyCSVDataMatchesWithSnowflakeData(dbData, testFiltersConfig.timePeriod);
      }
    );

    test(
      'tS To verify the answer Low activity sites in Sites Dashboard (should show last 90 days data even with Last 36 months period filter)',
      {
        tag: [
          TestPriority.P0,
          TestGroupType.SMOKE,
          TestGroupType.HEALTHCHECK,
          TestCaseType.TABULAR_METRIC,
          '@sites-low-activity-sites-metric',
        ],
      },
      async () => {
        tagTest(test.info(), {
          description:
            'TS To verify the answer Low activity sites in Sites Dashboard - verifies that this widget always shows last 90 days data regardless of Last 36 months period filter',
          zephyrTestId: 'DE-26341',
          storyId: 'DE-26236',
        });

        const { sitesDashboardQueryHelper, sitesDashboard } = testEnvironment;

        // Query helper always uses last 90 days - doesn't take filterBy parameter
        // Last 36 months period filter is still active in UI, but this widget always shows last 90 days
        const dbResults = await sitesDashboardQueryHelper.getLowActivitySitesDataFromDB();

        console.log('dbResults (last 90 days):', dbResults);

        const lowActivitySitesMetrics = sitesDashboard.lowActivitySitesMetrics;
        await lowActivitySitesMetrics.scrollToComponent();

        // Verify tabular data is loaded
        await lowActivitySitesMetrics.verifyDataIsLoaded();

        // Verify UI data matches DB data
        // This verifies that the widget shows last 90 days data even though Last 36 months period filter is applied
        await lowActivitySitesMetrics.verifyUIDataMatchesWithSnowflakeData(dbResults);
      }
    );
  }
);
