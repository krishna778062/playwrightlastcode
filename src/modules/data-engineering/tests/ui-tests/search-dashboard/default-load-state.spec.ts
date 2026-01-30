import { TestCaseType } from '@data-engineering/constants/testCaseType';
import { DataEngineeringTestSuite } from '@data-engineering/constants/testSuite';
import { Page, test } from '@playwright/test';

import { TestPriority } from '@core/constants/testPriority';
import { TestGroupType } from '@core/constants/testType';
import { tagTest } from '@core/utils/testDecorator';

import { PeriodFilterTimeRange } from '../../../constants/periodFilterTimeRange';
import { FilterOptions, PeriodFilterOption, SearchDashboardQueryHelper, SnowflakeHelper } from '../../../helpers';
import { SearchDashboard } from '../../../ui/dashboards';

import { getDataEngineeringConfigFromCache } from '@/src/modules/data-engineering/config/dataEngineeringConfig';
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
        tenantCode: getDataEngineeringConfigFromCache().orgId,
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

    // 1. Total search volume
    test(
      'TS To verify the answer of Total search volume in Search Dashboard default period last 30 days',
      {
        tag: [
          TestPriority.P0,
          TestGroupType.SMOKE,
          TestGroupType.HEALTHCHECK,
          TestCaseType.HERO_METRIC,
          '@total-search-volume',
        ],
      },
      async () => {
        tagTest(test.info(), {
          description: 'TS To verify the answer of Total search volume in Search Dashboard default period last 30 days',
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

    // 2. Search click through rate
    test(
      'TS To verify the answer of Search click through rate in Search Dashboard default filter last 30 days',
      {
        tag: [
          TestPriority.P0,
          TestGroupType.SMOKE,
          TestGroupType.HEALTHCHECK,
          TestCaseType.HERO_METRIC,
          '@search-click-through-rate',
        ],
      },
      async () => {
        tagTest(test.info(), {
          description:
            'TS To verify the answer of Search click through rate in Search Dashboard default filter last 30 days',
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

    // 3. No results search
    test(
      'TS To verify the answer of No results search in Search Dashboard default filter with last 30 days',
      {
        tag: [
          TestPriority.P0,
          TestGroupType.SMOKE,
          TestGroupType.HEALTHCHECK,
          TestCaseType.HERO_METRIC,
          '@no-results-search',
        ],
      },
      async () => {
        tagTest(test.info(), {
          description:
            'TS To verify the answer of No results search in Search Dashboard default filter with last 30 days',
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

    // 4. Average searches per logged-in user
    test(
      'TS To verify the answer of Average searches per logged-in user in Search Dashboard default filter with last 30 days',
      {
        tag: [
          TestPriority.P0,
          TestGroupType.SMOKE,
          TestGroupType.HEALTHCHECK,
          TestCaseType.HERO_METRIC,
          '@average-searches-per-logged-in-user',
        ],
      },
      async () => {
        tagTest(test.info(), {
          description:
            'TS To verify the answer of Average searches per logged-in user in Search Dashboard default filter with last 30 days',
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

    // 5. Search usage volume and click through rate metric
    test(
      'TS To verify the answer of Search usage volume and click through rate  in Search Dashboard default period last 30 days',
      {
        tag: [
          TestPriority.P0,
          TestGroupType.SMOKE,
          TestGroupType.HEALTHCHECK,
          TestCaseType.LINE_CHART,
          '@search-usage-volume-and-click-through-rate',
        ],
      },
      async () => {
        tagTest(test.info(), {
          description:
            'TS To verify the answer of Search usage volume and click through rate  in Search Dashboard default period last 30 days',
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
        // Note: horizontal axis label may or may not include year suffix depending on UI rendering
        await searchUsageVolumeAndClickThroughRateMetric.verifyAxisLabelsAreAsExpected({
          leftVerticalAxisLabel: 'Total searches',
          rightVerticalAxisLabel: 'Total clickthrough',
          horizontalAxisLabel: 'Search performed date',
        });

        // Verify line chart points with tooltips
        await searchUsageVolumeAndClickThroughRateMetric.verifyLinePointsWithTooltips(expectedMetricValue);
      }
    );

    // 6. Search usage volume and click through rate CSV
    test.fail(
      'TS To verify the CSV of answer search usage volume and click through rate in Search Dashboard default filter last 30 days',
      {
        tag: [
          TestPriority.P0,
          TestGroupType.SMOKE,
          TestGroupType.HEALTHCHECK,
          TestCaseType.CSV_VALIDATION,
          '@search-usage-volume-and-click-through-rate-csv',
        ],
        annotation: { type: 'known_failure', description: 'DE-28405' },
      },
      async () => {
        tagTest(test.info(), {
          description:
            'TS To verify the CSV of answer search usage volume and click through rate in Search Dashboard default filter last 30 days',
          zephyrTestId: 'DE-25549',
          storyId: 'DE-25924',
          isKnownFailure: true,
          bugTicket: 'DE-28405',
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

    // 7. Top search queries metric
    test(
      'TS To verify the answer of Top search queries in Search Dashboard default load last 30 days',
      {
        tag: [
          TestPriority.P0,
          TestGroupType.SMOKE,
          TestGroupType.HEALTHCHECK,
          TestCaseType.TABULAR_METRIC,
          '@top-search-queries',
        ],
      },
      async () => {
        tagTest(test.info(), {
          description: 'TS To verify the answer of Top search queries in Search Dashboard default load last 30 days',
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

    // 8. Top search queries CSV
    test(
      'TS To verify the CSV of answer top search queries in Search Dashboard default load last 30 days',
      {
        tag: [
          TestPriority.P0,
          TestGroupType.SMOKE,
          TestGroupType.HEALTHCHECK,
          TestCaseType.CSV_VALIDATION,
          '@top-search-queries-csv',
        ],
      },
      async () => {
        tagTest(test.info(), {
          description:
            'TS To verify the CSV of answer top search queries in Search Dashboard default load last 30 days',
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

    // 9. Most searches performed by Department metric
    test(
      'TS To verify the answer of Most searches performed by User Parameter in Search Dashboard default load last 30 days',
      {
        tag: [
          TestPriority.P0,
          TestGroupType.SMOKE,
          TestGroupType.HEALTHCHECK,
          TestCaseType.TABULAR_METRIC,
          '@most-searches-performed-by-department',
        ],
      },
      async () => {
        tagTest(test.info(), {
          description:
            'TS To verify the answer of Most searches performed by User Parameter in Search Dashboard default load last 30 days',
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

    // 10. Most searches performed by Department CSV
    test(
      'TS To verify the CSV of answer most searches performed by department in Search Dashboard default load last 30 days',
      {
        tag: [
          TestPriority.P0,
          TestGroupType.SMOKE,
          TestGroupType.HEALTHCHECK,
          TestCaseType.CSV_VALIDATION,
          '@most-searches-performed-by-department-csv',
        ],
      },
      async () => {
        tagTest(test.info(), {
          description:
            'TS To verify the CSV of answer most searches performed by department in Search Dashboard default load last 30 days',
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

    // 11. No result search queries metric
    test(
      'TS To verify the answer of No result search queries in Search Dashboard default load last 30 days',
      {
        tag: [
          TestPriority.P0,
          TestGroupType.SMOKE,
          TestGroupType.HEALTHCHECK,
          TestCaseType.TABULAR_METRIC,
          '@no-result-search-queries',
        ],
      },
      async () => {
        tagTest(test.info(), {
          description:
            'TS To verify the answer of No result search queries in Search Dashboard default load last 30 days',
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

    // 12. No result search queries CSV
    test(
      'TS To verify the CSV of answer No result search queries in Search Dashboard default load last 30 days',
      {
        tag: [
          TestPriority.P0,
          TestGroupType.SMOKE,
          TestGroupType.HEALTHCHECK,
          TestCaseType.CSV_VALIDATION,
          '@no-result-search-queries-csv',
        ],
      },
      async () => {
        tagTest(test.info(), {
          description:
            'TS To verify the CSV of answer No result search queries in Search Dashboard default load last 30 days',
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

    // 13. Top search queries with no clickthrough metric
    test(
      'TS To verify the answer of Top search queries with no clickthrough in Search Dashboard default load last 30 days',
      {
        tag: [
          TestPriority.P0,
          TestGroupType.SMOKE,
          TestGroupType.HEALTHCHECK,
          TestCaseType.TABULAR_METRIC,
          '@top-search-queries-with-no-clickthrough',
        ],
      },
      async () => {
        tagTest(test.info(), {
          description:
            'TS To verify the answer of Top search queries with no clickthrough in Search Dashboard default load last 30 days',
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

    // 14. Top search queries with no clickthrough CSV
    test(
      'TS To verify the CSV of answer top search queries with no clickthrough in Search Dashboard Default load last 30 days',
      {
        tag: [
          TestPriority.P0,
          TestGroupType.SMOKE,
          TestGroupType.HEALTHCHECK,
          TestCaseType.CSV_VALIDATION,
          '@top-search-queries-with-no-clickthrough-csv',
        ],
      },
      async () => {
        tagTest(test.info(), {
          description:
            'TS To verify the CSV of answer top search queries with no clickthrough in Search Dashboard Default load last 30 days',
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

    // 15. Top clickthrough types metric
    test(
      'TS To verify the answer of Top clickthrough types in Search Dashboard default load last 30 days',
      {
        tag: [
          TestPriority.P0,
          TestGroupType.SMOKE,
          TestGroupType.HEALTHCHECK,
          TestCaseType.TABULAR_METRIC,
          '@top-clickthrough-types',
        ],
      },
      async () => {
        tagTest(test.info(), {
          description:
            'TS To verify the answer of Top clickthrough types in Search Dashboard default load last 30 days',
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

    // 16. Top clickthrough types CSV
    test(
      'TS To verify the CSV of answer top clickthrough types in Search Dashboard default load last 30 days',
      {
        tag: [
          TestPriority.P0,
          TestGroupType.SMOKE,
          TestGroupType.HEALTHCHECK,
          TestCaseType.CSV_VALIDATION,
          '@top-clickthrough-types-csv',
        ],
      },
      async () => {
        tagTest(test.info(), {
          description:
            'TS To verify the CSV of answer top clickthrough types in Search Dashboard default load last 30 days',
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
  }
);
