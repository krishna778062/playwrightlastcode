import { DataEngineeringTestSuite } from '@data-engineering/constants/testSuite';
import { Page, test } from '@playwright/test';

import { TestPriority } from '@core/constants/testPriority';
import { TestGroupType } from '@core/constants/testType';
import { tagTest } from '@core/utils/testDecorator';

import { PeriodFilterTimeRange } from '../../../constants/periodFilterTimeRange';
import { FilterOptions, PeriodFilterOption, SearchDashboardQueryHelper, SnowflakeHelper } from '../../../helpers';
import { SearchDashboard } from '../../../ui/dashboards';

import {
  cleanupDashboardTesting,
  setupSearchDashboardForTest,
  UserRole,
} from '@/src/modules/data-engineering/helpers/dashboardSetupHelper';

test.describe(
  'search Dashboard - Default State Validation',
  {
    tag: [DataEngineeringTestSuite.SEARCH, '@default-state'],
  },
  () => {
    let testEnvironment: {
      page: Page;
      searchDashboard: SearchDashboard;
      searchDashboardQueryHelper: SearchDashboardQueryHelper;
      snowflakeHelper: SnowflakeHelper;
    };

    const defaultPeriodFilter = PeriodFilterTimeRange.LAST_30_DAYS;

    // Helper function to create FilterOptions from period filter
    const createFilterOptions = (timePeriod: string): FilterOptions => {
      return {
        tenantCode: process.env.ORG_ID!,
        timePeriod: timePeriod as PeriodFilterOption,
      };
    };

    test.beforeAll('Setup Search Dashboard', async ({ browser }) => {
      // Setup dashboard using dedicated method
      // No filters applied - testing default state (Last 30 days)
      testEnvironment = await setupSearchDashboardForTest(browser, UserRole.APP_MANAGER);
    });

    test.afterAll('Cleanup Search Dashboard', async () => {
      // Cleanup using helper
      await cleanupDashboardTesting(testEnvironment);
    });

    test(
      'verify Total search volume metric data validation with default period filter (Last 30 days)',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, '@total-search-volume'],
      },
      async () => {
        tagTest(test.info(), {
          description: 'To verify the answer of Total search volume in Search dashboard with default filter',
          zephyrTestId: 'DE-25989',
          storyId: 'DE-25920',
        });

        // Get expected metric value from snowflake with default period (Last 30 days)
        const filterBy = createFilterOptions(defaultPeriodFilter);
        const expectedMetricValue =
          await testEnvironment.searchDashboardQueryHelper.getTotalSearchVolumeFromDBWithFilters({ filterBy });

        // UI validation
        const totalSearchVolumeMetric = testEnvironment.searchDashboard.totalSearchVolume;
        await totalSearchVolumeMetric.verifyMetricUIDataPoints();
        await totalSearchVolumeMetric.verifyMetricValue(expectedMetricValue);
      }
    );

    test(
      'verify Search click through rate metric data validation with default period filter (Last 30 days)',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, '@search-click-through-rate'],
      },
      async () => {
        tagTest(test.info(), {
          description: 'To verify the answer of Search click through rate in Search dashboard with default filter',
          zephyrTestId: 'DE-25990',
          storyId: 'DE-25921',
        });

        // Get expected metric value from snowflake with default period (Last 30 days)
        const filterBy = createFilterOptions(defaultPeriodFilter);
        const expectedMetricValue =
          await testEnvironment.searchDashboardQueryHelper.getSearchClickThroughRateFromDBWithFilters({ filterBy });

        // UI validation
        const searchClickThroughRateMetric = testEnvironment.searchDashboard.searchClickThroughRate;
        await searchClickThroughRateMetric.verifyMetricUIDataPoints();
        await searchClickThroughRateMetric.verifyMetricValue(expectedMetricValue);
      }
    );

    test(
      'verify No results search metric data validation with default period filter (Last 30 days)',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, '@no-results-search'],
      },
      async () => {
        tagTest(test.info(), {
          description: 'To verify the answer of No results search in Search dashboard with default filter',
          zephyrTestId: 'DE-25991',
          storyId: 'DE-25922',
        });

        // Get expected metric value from snowflake with default period (Last 30 days)
        const filterBy = createFilterOptions(defaultPeriodFilter);
        const expectedMetricValue =
          await testEnvironment.searchDashboardQueryHelper.getNoResultsSearchFromDBWithFilters({ filterBy });

        // UI validation
        const noResultsSearchMetric = testEnvironment.searchDashboard.noResultSearch;
        await noResultsSearchMetric.verifyMetricUIDataPoints();
        await noResultsSearchMetric.verifyMetricValue(expectedMetricValue);
      }
    );

    test(
      'verify Average searches per logged in user metric data validation with default period filter (Last 30 days)',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, '@average-searches-per-logged-in-user'],
      },
      async () => {
        tagTest(test.info(), {
          description:
            'To verify the answer of Average searches per logged in user in Search dashboard with default filter',
          zephyrTestId: 'DE-25992',
          storyId: 'DE-25923',
        });

        // Get expected metric value from snowflake with default period (Last 30 days)
        const filterBy = createFilterOptions(defaultPeriodFilter);
        const expectedMetricValue =
          await testEnvironment.searchDashboardQueryHelper.getAverageSearchesPerLoggedInUserFromDBWithFilters({
            filterBy,
          });

        console.log('Expected Average Searches Per Logged In User Value:', expectedMetricValue);

        // UI validation
        const averageSearchesPerLoggedInUserMetric = testEnvironment.searchDashboard.averageSearchesPerLoggedInUser;
        await averageSearchesPerLoggedInUserMetric.verifyMetricUIDataPoints();
        await averageSearchesPerLoggedInUserMetric.verifyMetricValue(expectedMetricValue);
      }
    );

    test(
      'verify Top search queries metric data validation with default period filter (Last 30 days)',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, '@top-search-queries'],
      },
      async () => {
        tagTest(test.info(), {
          description: 'To verify the answer of Top search queries in Search dashboard with default filter',
          zephyrTestId: 'DE-25995',
          storyId: 'DE-25926',
        });

        // Get expected metric value from snowflake with default period (Last 30 days)
        // Query helper now returns properly transformed data
        const filterBy = createFilterOptions(defaultPeriodFilter);
        const expectedMetricValue =
          await testEnvironment.searchDashboardQueryHelper.getTopSearchQueriesFromDBWithFilters({ filterBy });

        console.log('Expected Top Search Queries Data:', expectedMetricValue);

        // UI validation - component handles transformation internally
        const topSearchQueriesMetric = testEnvironment.searchDashboard.topSearchQueries;
        await topSearchQueriesMetric.verifyDataIsLoaded();
        await topSearchQueriesMetric.verifyUIDataMatchesWithSnowflakeData(expectedMetricValue);
      }
    );

    test(
      'verify Top search queries with no clickthrough metric data validation with default period filter (Last 30 days)',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, '@top-search-queries-with-no-clickthrough'],
      },
      async () => {
        tagTest(test.info(), {
          description:
            'To verify the answer of Top search queries with no clickthrough in Search dashboard with default filter',
          zephyrTestId: 'DE-26002',
          storyId: 'DE-25928',
        });

        // Get expected metric value from snowflake with default period (Last 30 days)
        // Query helper now returns properly transformed data
        const filterBy = createFilterOptions(defaultPeriodFilter);
        const expectedMetricValue =
          await testEnvironment.searchDashboardQueryHelper.getTopSearchQueriesWithNoClickthroughFromDBWithFilters({
            filterBy,
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
      'verify Top clickthrough types metric data validation with default period filter (Last 30 days)',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, '@top-clickthrough-types'],
      },
      async () => {
        tagTest(test.info(), {
          description: 'To verify the answer of Top clickthrough types in Search dashboard with default filter',
          zephyrTestId: 'DE-26006',
          storyId: 'DE-25929',
        });

        // Get expected metric value from snowflake with default period (Last 30 days)
        // Query helper now returns properly transformed data
        const filterBy = createFilterOptions(defaultPeriodFilter);
        const expectedMetricValue =
          await testEnvironment.searchDashboardQueryHelper.getTopClickthroughTypesFromDBWithFilters({ filterBy });

        console.log('Expected Top Clickthrough Types Data:', expectedMetricValue);

        // UI validation - component handles transformation internally
        const topClickthroughTypesMetric = testEnvironment.searchDashboard.topClickthroughTypes;
        await topClickthroughTypesMetric.verifyDataIsLoaded();
        await topClickthroughTypesMetric.verifyUIDataMatchesWithSnowflakeData(expectedMetricValue);
      }
    );

    test(
      'verify No result search queries metric data validation with default period filter (Last 30 days)',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, '@no-result-search-queries'],
      },
      async () => {
        tagTest(test.info(), {
          description: 'To verify the answer of No result search queries in Search dashboard with default filter',
          zephyrTestId: 'DE-25999',
          storyId: 'DE-25927',
        });

        // Get expected metric value from snowflake with default period (Last 30 days)
        // Query helper now returns properly transformed data
        const filterBy = createFilterOptions(defaultPeriodFilter);
        const expectedMetricValue =
          await testEnvironment.searchDashboardQueryHelper.getNoResultSearchQueriesFromDBWithFilters({ filterBy });

        console.log('Expected No Result Search Queries Data:', expectedMetricValue);

        // UI validation - component handles transformation internally
        const noResultSearchQueriesMetric = testEnvironment.searchDashboard.noResultSearchQueries;
        await noResultSearchQueriesMetric.verifyDataIsLoaded();
        await noResultSearchQueriesMetric.verifyUIDataMatchesWithSnowflakeData(expectedMetricValue);
      }
    );

    test(
      'verify Most searches performed by Department metric data validation with default period filter (Last 30 days)',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, '@most-searches-performed-by-department'],
      },
      async () => {
        tagTest(test.info(), {
          description:
            'To verify the answer of Most searches performed by Department in Search dashboard with default filter',
          zephyrTestId: 'DE-25994',
          storyId: 'DE-25925',
        });

        // Get expected metric value from snowflake with default period (Last 30 days)
        // Query helper now returns properly transformed data
        const filterBy = createFilterOptions(defaultPeriodFilter);
        const expectedMetricValue =
          await testEnvironment.searchDashboardQueryHelper.getMostSearchesPerformedByDepartmentFromDBWithFilters({
            filterBy,
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
      'verify Search usage volume and click through rate metric data validation with default period filter (Last 30 days)',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, '@search-usage-volume-and-click-through-rate'],
      },
      async () => {
        tagTest(test.info(), {
          description:
            'To verify the answer of Search usage volume and click through rate in Search dashboard with default filter',
          zephyrTestId: 'DE-25993',
          storyId: 'DE-25924',
        });

        // Get expected metric value from snowflake with default period (Last 30 days)
        // Query helper now returns properly transformed data
        const filterBy = createFilterOptions(defaultPeriodFilter);
        const expectedMetricValue =
          await testEnvironment.searchDashboardQueryHelper.getSearchUsageVolumeAndClickThroughRateFromDBWithFilters({
            filterBy,
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

    test(
      'verify Search usage volume and click through rate CSV download and data validation with default period filter (Last 30 days)',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, '@search-usage-volume-and-click-through-rate-csv'],
      },
      async () => {
        tagTest(test.info(), {
          description:
            'To verify CSV download and data validation for Search usage volume and click through rate in Search dashboard with default filter',
          zephyrTestId: 'DE-25993',
          storyId: 'DE-25924',
        });

        // Get expected metric value from snowflake with default period (Last 30 days)
        // Query helper now returns properly transformed data
        const filterBy = createFilterOptions(defaultPeriodFilter);
        const dbData =
          await testEnvironment.searchDashboardQueryHelper.getSearchUsageVolumeAndClickThroughRateFromDBWithFilters({
            filterBy,
          });

        // Component handles CSV validation internally
        const searchUsageVolumeAndClickThroughRateMetric =
          testEnvironment.searchDashboard.searchUsageVolumeAndClickThroughRate;
        await searchUsageVolumeAndClickThroughRateMetric.verifyCSVDataMatchesWithSnowflakeData(
          dbData,
          defaultPeriodFilter
        );
      }
    );

    test(
      'verify Top search queries CSV download and data validation with default period filter (Last 30 days)',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, '@top-search-queries-csv'],
      },
      async () => {
        tagTest(test.info(), {
          description:
            'To verify CSV download and data validation for Top search queries in Search dashboard with default filter',
          zephyrTestId: 'DE-25525',
          storyId: 'DE-25933',
        });

        // Get expected metric value from snowflake with default period (Last 30 days)
        // Query helper now returns properly transformed data
        const filterBy = createFilterOptions(defaultPeriodFilter);
        const dbData = await testEnvironment.searchDashboardQueryHelper.getTopSearchQueriesFromDBWithFilters({
          filterBy,
        });

        // Component handles CSV validation internally
        const topSearchQueriesMetric = testEnvironment.searchDashboard.topSearchQueries;
        await topSearchQueriesMetric.verifyCSVDataMatchesWithSnowflakeData(dbData, defaultPeriodFilter);
      }
    );

    test(
      'verify Top search queries with no clickthrough CSV download and data validation with default period filter (Last 30 days)',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, '@top-search-queries-with-no-clickthrough-csv'],
      },
      async () => {
        tagTest(test.info(), {
          description:
            'To verify CSV download and data validation for Top search queries with no clickthrough in Search dashboard with default filter',
          zephyrTestId: 'DE-26547',
          storyId: 'DE-25933',
        });

        // Get expected metric value from snowflake with default period (Last 30 days)
        // Pass forCSVValidation=true to convert percentage to decimal format to match CSV format
        const filterBy = createFilterOptions(defaultPeriodFilter);
        const transformedData =
          await testEnvironment.searchDashboardQueryHelper.getTopSearchQueriesWithNoClickthroughFromDBWithFilters({
            filterBy,
            forCSVValidation: true, // converts no_click_rate from percentage to decimal
          });

        // Component handles CSV validation internally
        const topSearchQueriesWithNoClickthroughMetric =
          testEnvironment.searchDashboard.topSearchQueriesWithNoClickthrough;
        await topSearchQueriesWithNoClickthroughMetric.verifyCSVDataMatchesWithSnowflakeData(
          transformedData,
          defaultPeriodFilter
        );
      }
    );

    test(
      'verify Top clickthrough types CSV download and data validation with default period filter (Last 30 days)',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, '@top-clickthrough-types-csv'],
      },
      async () => {
        tagTest(test.info(), {
          description:
            'To verify CSV download and data validation for Top clickthrough types in Search dashboard with default filter',
          zephyrTestId: 'DE-26548',
          storyId: 'DE-25933',
        });

        // Get expected metric value from snowflake with default period (Last 30 days)
        // Pass forCSVValidation=true to convert percentage to decimal format to match CSV format
        const filterBy = createFilterOptions(defaultPeriodFilter);
        const dbData = await testEnvironment.searchDashboardQueryHelper.getTopClickthroughTypesFromDBWithFilters({
          filterBy,
          forCSVValidation: true, // converts percentage to decimal
        });

        // Component handles CSV validation internally
        const topClickthroughTypesMetric = testEnvironment.searchDashboard.topClickthroughTypes;
        await topClickthroughTypesMetric.verifyCSVDataMatchesWithSnowflakeData(dbData, defaultPeriodFilter);
      }
    );

    test(
      'verify No result search queries CSV download and data validation with default period filter (Last 30 days)',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, '@no-result-search-queries-csv'],
      },
      async () => {
        tagTest(test.info(), {
          description:
            'To verify CSV download and data validation for No result search queries in Search dashboard with default filter',
          zephyrTestId: 'DE-26078',
          storyId: 'DE-25933',
        });

        // Get expected metric value from snowflake with default period (Last 30 days)
        // Pass forCSVValidation=true to convert failure_percentage to decimal format to match CSV format
        const filterBy = createFilterOptions(defaultPeriodFilter);
        const transformedData =
          await testEnvironment.searchDashboardQueryHelper.getNoResultSearchQueriesFromDBWithFilters({
            filterBy,
            forCSVValidation: true, // converts failure_percentage to decimal
          });

        // Component handles CSV validation internally
        const noResultSearchQueriesMetric = testEnvironment.searchDashboard.noResultSearchQueries;
        await noResultSearchQueriesMetric.verifyCSVDataMatchesWithSnowflakeData(transformedData, defaultPeriodFilter);
      }
    );

    test(
      'verify Most searches performed by Department CSV download and data validation with default period filter (Last 30 days)',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, '@most-searches-performed-by-department-csv'],
      },
      async () => {
        tagTest(test.info(), {
          description:
            'To verify CSV download and data validation for Most searches performed by Department in Search dashboard with default filter',
          zephyrTestId: 'DE-26546',
          storyId: 'DE-25933',
        });

        // Get expected metric value from snowflake with default period (Last 30 days)
        // Query helper now returns properly transformed data
        const filterBy = createFilterOptions(defaultPeriodFilter);
        const transformedData =
          await testEnvironment.searchDashboardQueryHelper.getMostSearchesPerformedByDepartmentFromDBWithFilters({
            filterBy,
          });

        // Component handles CSV validation internally
        const mostSearchesPerformedByDepartmentMetric =
          testEnvironment.searchDashboard.mostSearchesPerformedByDepartment;
        await mostSearchesPerformedByDepartmentMetric.verifyCSVDataMatchesWithSnowflakeData(
          transformedData,
          defaultPeriodFilter
        );
      }
    );
  }
);
