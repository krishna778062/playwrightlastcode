import { DataEngineeringTestSuite } from '@data-engineering/constants/testSuite';
import { Page, test } from '@playwright/test';

import { TestPriority } from '@core/constants/testPriority';
import { TestGroupType } from '@core/constants/testType';
import { tagTest } from '@core/utils/testDecorator';

import { PeriodFilterTimeRange } from '../../../constants/periodFilterTimeRange';
import { DateHelper, SearchDashboardQueryHelper, SnowflakeHelper } from '../../../helpers';
import { FilterOptions } from '../../../helpers/baseAnalyticsQueryHelper';
import { SearchDashboard } from '../../../ui/dashboards';

import {
  cleanupDashboardTesting,
  setupSearchDashboardForTest,
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
  'search Dashboard - All Filters Applied',
  {
    tag: [DataEngineeringTestSuite.SEARCH, '@all-filters-applied'],
  },
  () => {
    test.slow();

    let testEnvironment: {
      page: Page;
      searchDashboard: SearchDashboard;
      searchDashboardQueryHelper: SearchDashboardQueryHelper;
      snowflakeHelper: SnowflakeHelper;
    };
    let testFiltersConfig: FilterOptions;

    test.beforeAll('Setting up the search dashboard + applying all the filters', async ({ browser }) => {
      // Setup dashboard using dedicated method
      testEnvironment = await setupSearchDashboardForTest(browser, UserRole.APP_MANAGER);

      // Calculate dates for "Last 60 days" using CUSTOM period
      const endDate = DateHelper.getCurrentUTCDate();
      const startDate = new Date(endDate);
      startDate.setDate(startDate.getDate() - 59); // 60 days ago (including today)

      testFiltersConfig = {
        tenantCode: process.env.ORG_ID!,
        timePeriod: PeriodFilterTimeRange.CUSTOM,
        customStartDate: startDate.toISOString().split('T')[0], // YYYY-MM-DD format
        customEndDate: endDate.toISOString().split('T')[0], // YYYY-MM-DD format
        departments: ['Undefined'], // All three department filters
        locations: ['Gurugram, Haryana, India', 'India'], // Both location filters
      };

      const { analyticsFiltersComponent } = testEnvironment.searchDashboard;
      await analyticsFiltersComponent.verifyFilterComponentIsVisible();

      // Apply filters using unified configuration
      await analyticsFiltersComponent.applyFiltersFromConfig(testFiltersConfig);
    });

    test.afterAll('Cleaning up the test environment', async () => {
      await cleanupDashboardTesting(testEnvironment);
    });

    test(
      'verify Total search volume metric data validation with all filters applied (Last 60 days, Departments: Test, Undefined, test, Locations: Gurugram Haryana India, India)',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, '@total-search-volume'],
      },
      async () => {
        tagTest(test.info(), {
          description: 'To verify the answer of Total search volume in Search dashboard with all filters applied',
          zephyrTestId: '',
          storyId: '',
        });

        // Get expected metric value from snowflake with all filters applied
        const expectedMetricValue =
          await testEnvironment.searchDashboardQueryHelper.getTotalSearchVolumeFromDBWithFilters({
            filterBy: testFiltersConfig,
          });

        // UI validation
        const totalSearchVolumeMetric = testEnvironment.searchDashboard.totalSearchVolume;
        await totalSearchVolumeMetric.verifyMetricUIDataPoints();
        await totalSearchVolumeMetric.verifyMetricValue(expectedMetricValue);
      }
    );

    test(
      'verify Search click through rate metric data validation with all filters applied (Last 60 days, Departments: Test, Undefined, test, Locations: Gurugram Haryana India, India)',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, '@search-click-through-rate'],
      },
      async () => {
        tagTest(test.info(), {
          description: 'To verify the answer of Search click through rate in Search dashboard with all filters applied',
          zephyrTestId: '',
          storyId: '',
        });

        // Get expected metric value from snowflake with all filters applied
        const expectedMetricValue =
          await testEnvironment.searchDashboardQueryHelper.getSearchClickThroughRateFromDBWithFilters({
            filterBy: testFiltersConfig,
          });

        // UI validation
        const searchClickThroughRateMetric = testEnvironment.searchDashboard.searchClickThroughRate;
        await searchClickThroughRateMetric.verifyMetricUIDataPoints();
        await searchClickThroughRateMetric.verifyMetricValue(expectedMetricValue);
      }
    );

    test(
      'verify No results search metric data validation with all filters applied (Last 60 days, Departments: Test, Undefined, test, Locations: Gurugram Haryana India, India)',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, '@no-results-search'],
      },
      async () => {
        tagTest(test.info(), {
          description: 'To verify the answer of No results search in Search dashboard with all filters applied',
          zephyrTestId: '',
          storyId: '',
        });

        // Get expected metric value from snowflake with all filters applied
        const expectedMetricValue =
          await testEnvironment.searchDashboardQueryHelper.getNoResultsSearchFromDBWithFilters({
            filterBy: testFiltersConfig,
          });

        // UI validation
        const noResultsSearchMetric = testEnvironment.searchDashboard.noResultSearch;
        await noResultsSearchMetric.verifyMetricUIDataPoints();
        await noResultsSearchMetric.verifyMetricValue(expectedMetricValue);
      }
    );

    test(
      'verify Top search queries metric data validation with all filters applied (Last 60 days, Departments: Test, Undefined, test, Locations: Gurugram Haryana India, India)',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, '@top-search-queries'],
      },
      async () => {
        tagTest(test.info(), {
          description: 'To verify the answer of Top search queries in Search dashboard with all filters applied',
          zephyrTestId: '',
          storyId: '',
        });

        // Get expected metric value from snowflake with all filters applied
        // Query helper now returns properly transformed data
        const expectedMetricValue =
          await testEnvironment.searchDashboardQueryHelper.getTopSearchQueriesFromDBWithFilters({
            filterBy: testFiltersConfig,
          });

        console.log('Expected Top Search Queries Data:', expectedMetricValue);

        // UI validation - component handles transformation internally
        const topSearchQueriesMetric = testEnvironment.searchDashboard.topSearchQueries;
        await topSearchQueriesMetric.verifyDataIsLoaded();
        await topSearchQueriesMetric.verifyUIDataMatchesWithSnowflakeData(expectedMetricValue);
      }
    );

    test(
      'verify Top search queries with no clickthrough metric data validation with all filters applied (Last 60 days, Departments: Test, Undefined, test, Locations: Gurugram Haryana India, India)',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, '@top-search-queries-with-no-clickthrough'],
      },
      async () => {
        tagTest(test.info(), {
          description:
            'To verify the answer of Top search queries with no clickthrough in Search dashboard with all filters applied',
          zephyrTestId: '',
          storyId: '',
        });

        // Get expected metric value from snowflake with all filters applied
        // Query helper now returns properly transformed data
        const expectedMetricValue =
          await testEnvironment.searchDashboardQueryHelper.getTopSearchQueriesWithNoClickthroughFromDBWithFilters({
            filterBy: testFiltersConfig,
          });

        console.log('Expected Top Search Queries With No Clickthrough Data:', expectedMetricValue);

        // UI validation - component handles transformation internally
        const topSearchQueriesWithNoClickthroughMetric =
          testEnvironment.searchDashboard.topSearchQueriesWithNoClickthrough;
        await topSearchQueriesWithNoClickthroughMetric.verifyDataIsLoaded();
        await topSearchQueriesWithNoClickthroughMetric.verifyUIDataMatchesWithSnowflakeData(expectedMetricValue);
      }
    );

    test(
      'verify Top clickthrough types metric data validation with all filters applied (Last 60 days, Departments: Test, Undefined, test, Locations: Gurugram Haryana India, India)',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, '@top-clickthrough-types'],
      },
      async () => {
        tagTest(test.info(), {
          description: 'To verify the answer of Top clickthrough types in Search dashboard with all filters applied',
          zephyrTestId: '',
          storyId: '',
        });

        // Get expected metric value from snowflake with all filters applied
        // Query helper now returns properly transformed data
        const expectedMetricValue =
          await testEnvironment.searchDashboardQueryHelper.getTopClickthroughTypesFromDBWithFilters({
            filterBy: testFiltersConfig,
          });

        console.log('Expected Top Clickthrough Types Data:', expectedMetricValue);

        // UI validation - component handles transformation internally
        const topClickthroughTypesMetric = testEnvironment.searchDashboard.topClickthroughTypes;
        await topClickthroughTypesMetric.verifyDataIsLoaded();
        await topClickthroughTypesMetric.verifyUIDataMatchesWithSnowflakeData(expectedMetricValue);
      }
    );

    test(
      'verify No result search queries metric data validation with all filters applied (Last 60 days, Departments: Test, Undefined, test, Locations: Gurugram Haryana India, India)',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, '@no-result-search-queries'],
      },
      async () => {
        tagTest(test.info(), {
          description: 'To verify the answer of No result search queries in Search dashboard with all filters applied',
          zephyrTestId: '',
          storyId: '',
        });

        // Get expected metric value from snowflake with all filters applied
        // Query helper now returns properly transformed data
        const expectedMetricValue =
          await testEnvironment.searchDashboardQueryHelper.getNoResultSearchQueriesFromDBWithFilters({
            filterBy: testFiltersConfig,
          });

        console.log('Expected No Result Search Queries Data:', expectedMetricValue);

        // UI validation - component handles transformation internally
        const noResultSearchQueriesMetric = testEnvironment.searchDashboard.noResultSearchQueries;
        await noResultSearchQueriesMetric.verifyDataIsLoaded();
        await noResultSearchQueriesMetric.verifyUIDataMatchesWithSnowflakeData(expectedMetricValue);
      }
    );

    test(
      'verify Most searches performed by Department metric data validation with all filters applied (Last 60 days, Departments: Test, Undefined, test, Locations: Gurugram Haryana India, India)',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, '@most-searches-performed-by-department'],
      },
      async () => {
        tagTest(test.info(), {
          description:
            'To verify the answer of Most searches performed by Department in Search dashboard with all filters applied',
          zephyrTestId: '',
          storyId: '',
        });

        // Get expected metric value from snowflake with all filters applied
        // Query helper now returns properly transformed data
        const expectedMetricValue =
          await testEnvironment.searchDashboardQueryHelper.getMostSearchesPerformedByDepartmentFromDBWithFilters({
            filterBy: testFiltersConfig,
          });

        console.log('Expected Most Searches Performed By Department Data:', expectedMetricValue);

        // UI validation - component handles transformation internally
        const mostSearchesPerformedByDepartmentMetric =
          testEnvironment.searchDashboard.mostSearchesPerformedByDepartment;
        await mostSearchesPerformedByDepartmentMetric.verifyDataIsLoaded();
        await mostSearchesPerformedByDepartmentMetric.verifyUIDataMatchesWithSnowflakeData(expectedMetricValue);
      }
    );

    test(
      'verify Search usage volume and click through rate metric data validation with all filters applied (Last 60 days, Departments: Test, Undefined, test, Locations: Gurugram Haryana India, India)',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, '@search-usage-volume-and-click-through-rate'],
      },
      async () => {
        tagTest(test.info(), {
          description:
            'To verify the answer of Search usage volume and click through rate in Search dashboard with all filters applied',
          zephyrTestId: '',
          storyId: '',
        });

        // Get expected metric value from snowflake with all filters applied
        // Query helper now returns properly transformed data
        const expectedMetricValue =
          await testEnvironment.searchDashboardQueryHelper.getSearchUsageVolumeAndClickThroughRateFromDBWithFilters({
            filterBy: testFiltersConfig,
          });

        console.log('Expected Search Usage Volume and Click Through Rate Data:', expectedMetricValue);

        // UI validation - component handles transformation internally
        const searchUsageVolumeAndClickThroughRateMetric =
          testEnvironment.searchDashboard.searchUsageVolumeAndClickThroughRate;
        await searchUsageVolumeAndClickThroughRateMetric.verifyDataIsLoaded();

        // Verify axis labels (dual Y-axis chart)
        await searchUsageVolumeAndClickThroughRateMetric.verifyAxisLabelsAreAsExpected({
          leftVerticalAxisLabel: 'Total searches',
          rightVerticalAxisLabel: 'Total clickthrough',
          horizontalAxisLabel: 'Search performed date (for 2025)',
        });

        // Verify line chart points with tooltips
        await searchUsageVolumeAndClickThroughRateMetric.verifyLinePointsWithTooltips(expectedMetricValue);
      }
    );
  }
);
