import { PeriodFilterTimeRange } from '@data-engineering/constants/periodFilterTimeRange';
import { TestCaseType } from '@data-engineering/constants/testCaseType';
import { DataEngineeringTestSuite } from '@data-engineering/constants/testSuite';
import { SitesDashboardQueryHelper, SnowflakeHelper } from '@data-engineering/helpers';
import { FilterOptions } from '@data-engineering/helpers/baseAnalyticsQueryHelper';
import { DateHelper } from '@data-engineering/helpers/dateHelper';
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
  'sites Dashboard - Custom Period Filter Applied',
  {
    tag: [DataEngineeringTestSuite.SITES, '@custom-period-filter'],
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

    test.beforeAll('Setting up the sites dashboard + applying custom period filter', async ({ browser }) => {
      // Setup dashboard using dedicated method
      testEnvironment = await setupSitesDashboardForTest(browser, UserRole.APP_MANAGER);

      // Set custom period: Start date and End date from DateHelper
      const customDateRange = DateHelper.createTestCustomDateRange();

      testFiltersConfig = {
        tenantCode: process.env.ORG_ID!,
        timePeriod: PeriodFilterTimeRange.CUSTOM,
        customStartDate: customDateRange.startDate,
        customEndDate: customDateRange.endDate,
      };

      const { analyticsFiltersComponent } = testEnvironment.sitesDashboard;

      // Apply filters using unified configuration
      await analyticsFiltersComponent.applyFiltersFromConfig(testFiltersConfig);
    });

    test.afterAll('Cleaning up the test environment', async () => {
      await cleanupDashboardTesting(testEnvironment);
    });

    test(
      'verify Total sites metric data validation with custom period filter applied (Custom Date Range)',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, TestCaseType.HERO_METRIC, '@sites-total-sites-metric'],
      },
      async () => {
        tagTest(test.info(), {
          description: 'To verify the answer of Total sites in Sites dashboard with custom period filter applied',
          zephyrTestId: 'DE-26335',
          storyId: 'DE-26231',
        });

        // Get expected metric value from snowflake with custom period filter applied
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
      'verify Featured sites metric data validation with custom period filter applied (Custom Date Range)',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, TestCaseType.HERO_METRIC, '@sites-featured-sites-metric'],
      },
      async () => {
        tagTest(test.info(), {
          description: 'To verify the answer of Featured sites in Sites dashboard with custom period filter applied',
          zephyrTestId: 'DE-26337',
          storyId: 'DE-26233',
        });

        // Get expected metric value from snowflake with custom period filter applied
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
      'verify Total managers metric data validation with custom period filter applied (Custom Date Range)',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, TestCaseType.HERO_METRIC, '@sites-total-managers-metric'],
      },
      async () => {
        tagTest(test.info(), {
          description: 'To verify the answer of Total managers in Sites dashboard with custom period filter applied',
          zephyrTestId: 'DE-26338',
          storyId: 'DE-26234',
        });

        // Get expected metric value from snowflake with custom period filter applied
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
      'verify Total sites distribution metric data validation with custom period filter applied (Custom Date Range)',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, TestCaseType.PIE_CHART, '@sites-total-sites-distribution-metric'],
      },
      async () => {
        tagTest(test.info(), {
          description:
            'To verify the answer of Total sites distribution in Sites dashboard with custom period filter applied',
          zephyrTestId: 'DE-26339',
          storyId: 'DE-26235',
        });

        // Get expected metric value from snowflake with custom period filter applied
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

    test.fail(
      'verify Most Popular sites metric data validation with custom period filter applied (Custom Date Range)',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, TestCaseType.TABULAR_METRIC, '@sites-most-popular-metric'],
      },
      async () => {
        tagTest(test.info(), {
          isKnownFailure: true,
          description:
            'To verify the answer of Most Popular sites in Sites dashboard with custom period filter applied',
          zephyrTestId: 'DE-26383',
          storyId: 'DE-26250',
        });

        // Get expected metric value from snowflake with custom period filter applied
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
      'verify Least Popular sites metric data validation with custom period filter applied (Custom Date Range)',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, TestCaseType.TABULAR_METRIC, '@sites-least-popular-metric'],
      },
      async () => {
        tagTest(test.info(), {
          description:
            'To verify the answer of Least Popular sites in Sites dashboard with custom period filter applied',
          zephyrTestId: 'DE-26384',
          storyId: 'DE-26237',
        });

        // Get expected metric value from snowflake with custom period filter applied
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
      'verify Most published content metric data validation with custom period filter applied (Custom Date Range)',
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
            'To verify the answer of Most published content in Sites dashboard with custom period filter applied',
          zephyrTestId: 'DE-26385',
          storyId: 'DE-26238',
        });

        // Get expected metric value from snowflake with custom period filter applied
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
      'verify Least published content metric data validation with custom period filter applied (Custom Date Range)',
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
            'To verify the answer of Least published content in Sites dashboard with custom period filter applied',
          zephyrTestId: 'DE-26386',
          storyId: 'DE-26239',
        });

        // Get expected metric value from snowflake with custom period filter applied
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
  }
);
