import { TestCaseType } from '@data-engineering/constants/testCaseType';
import { DataEngineeringTestSuite } from '@data-engineering/constants/testSuite';
import { Page, test } from '@playwright/test';

import { TestPriority } from '@core/constants/testPriority';
import { TestGroupType } from '@core/constants/testType';
import { tagTest } from '@core/utils/testDecorator';

import { GroupByOnUserParameter } from '../../../constants/filters';
import { PeriodFilterTimeRange } from '../../../constants/periodFilterTimeRange';
import { TEST_FILTER_VALUES } from '../../../constants/testFilterValues';
import { DateHelper, SearchDashboardQueryHelper, SnowflakeHelper } from '../../../helpers';
import { FilterOptions } from '../../../helpers/baseAnalyticsQueryHelper';
import { SearchDashboard } from '../../../ui/dashboards';

import { getDataEngineeringConfigFromCache } from '@/src/modules/data-engineering/config/dataEngineeringConfig';
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
  'search Dashboard - All Filters Applied + Group by Applied',
  {
    tag: [DataEngineeringTestSuite.SEARCH, '@filters-n-groupby'],
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

    test.beforeAll(
      'Setting up the search dashboard + applying all the filters (including group by)',
      async ({ browser }) => {
        // Setup dashboard using dedicated method
        testEnvironment = await setupSearchDashboardForTest(browser, UserRole.APP_MANAGER);

        // Calculate dates for "Last 60 days" using CUSTOM period
        const endDate = DateHelper.getCurrentUTCDate();
        const startDate = new Date(endDate);
        startDate.setDate(startDate.getDate() - 59); // 60 days ago (including today)

        testFiltersConfig = {
          tenantCode: getDataEngineeringConfigFromCache().orgId,
          timePeriod: PeriodFilterTimeRange.CUSTOM,
          customStartDate: startDate.toISOString().split('T')[0], // YYYY-MM-DD format
          customEndDate: endDate.toISOString().split('T')[0], // YYYY-MM-DD format
          segments: [...TEST_FILTER_VALUES.SEARCH.SEGMENTS],
          departments: [...TEST_FILTER_VALUES.SEARCH.DEPARTMENTS],
          locations: [...TEST_FILTER_VALUES.SEARCH.LOCATIONS],
          groupBy: GroupByOnUserParameter.LOCATION,
        };

        const { analyticsFiltersComponent } = testEnvironment.searchDashboard;
        await analyticsFiltersComponent.verifyFilterComponentIsVisible();

        // Apply filters using unified configuration
        await analyticsFiltersComponent.applyFiltersFromConfig(testFiltersConfig);
      }
    );

    test.afterAll('Cleaning up the test environment', async () => {
      await cleanupDashboardTesting(testEnvironment);
    });

    // 1. Total search volume
    test(
      'TS To verify the answer of Total search volume in Search Dashboard with group by filters applied',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, TestCaseType.HERO_METRIC, '@total-search-volume'],
      },
      async () => {
        tagTest(test.info(), {
          description:
            'TS To verify the answer of Total search volume in Search Dashboard with group by filters applied',
          zephyrTestId: 'DE-27747',
          storyId: 'DE-25920',
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

    // 2. Search click through rate
    test(
      'TS To verify the answer of Search click through rate in Search Dashboard with group by filters applied',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, TestCaseType.HERO_METRIC, '@search-click-through-rate'],
      },
      async () => {
        tagTest(test.info(), {
          description:
            'TS To verify the answer of Search click through rate in Search Dashboard with group by filters applied',
          zephyrTestId: 'DE-27763',
          storyId: 'DE-25921',
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

    // 3. No results search
    test(
      'TS To verify the answer of No results search in Search Dashboard with group by filter applied',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, TestCaseType.HERO_METRIC, '@no-results-search'],
      },
      async () => {
        tagTest(test.info(), {
          description: 'TS To verify the answer of No results search in Search Dashboard with group by filter applied',
          zephyrTestId: 'DE-27766',
          storyId: 'DE-25922',
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

    // 4. Average searches per logged-in user
    test(
      'TS To verify the answer of Average searches per logged-in user in Search Dashboard with group by filter applied',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, TestCaseType.HERO_METRIC, '@average-searches-per-logged-in-user'],
      },
      async () => {
        tagTest(test.info(), {
          description:
            'TS To verify the answer of Average searches per logged-in user in Search Dashboard with group by filter applied',
          zephyrTestId: 'DE-27769',
          storyId: 'DE-25923',
        });

        // Get expected metric value from snowflake with all filters applied
        const expectedMetricValue =
          await testEnvironment.searchDashboardQueryHelper.getAverageSearchesPerLoggedInUserFromDBWithFilters({
            filterBy: testFiltersConfig,
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
      'TS To verify the answer of Search usage volume and click through rate in Search Dashboard with group by filters applied',
      {
        tag: [
          TestPriority.P0,
          TestGroupType.SMOKE,
          TestCaseType.LINE_CHART,
          '@search-usage-volume-and-click-through-rate',
        ],
      },
      async () => {
        tagTest(test.info(), {
          description:
            'TS To verify the answer of Search usage volume and click through rate in Search Dashboard with group by filters applied',
          zephyrTestId: 'DE-27772',
          storyId: 'DE-25924',
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
    test(
      'TS To verify the CSV of answer search usage volume and click through rate in Search Dashboard with group by filters applied',
      {
        tag: [
          TestPriority.P0,
          TestGroupType.SMOKE,
          TestCaseType.CSV_VALIDATION,
          '@search-usage-volume-and-click-through-rate-csv',
        ],
      },
      async () => {
        tagTest(test.info(), {
          description:
            'TS To verify the CSV of answer search usage volume and click through rate in Search Dashboard with group by filters applied',
          zephyrTestId: 'DE-27776',
          storyId: 'DE-25924',
        });

        // Get expected metric value from snowflake with all filters applied
        const dbData =
          await testEnvironment.searchDashboardQueryHelper.getSearchUsageVolumeAndClickThroughRateFromDBWithFilters({
            filterBy: testFiltersConfig,
          });

        // Component handles CSV validation internally
        const searchUsageVolumeAndClickThroughRateMetric =
          testEnvironment.searchDashboard.searchUsageVolumeAndClickThroughRate;
        await searchUsageVolumeAndClickThroughRateMetric.verifyCSVDataMatchesWithSnowflakeData(
          dbData,
          testFiltersConfig.timePeriod,
          testFiltersConfig.customStartDate,
          testFiltersConfig.customEndDate
        );
      }
    );

    // 7. Top search queries metric
    test(
      'verify Top search queries metric data validation with all filters and group by applied',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, TestCaseType.TABULAR_METRIC, '@top-search-queries'],
      },
      async () => {
        tagTest(test.info(), {
          description:
            'To verify the answer of Top search queries in Search dashboard with all filters and group by applied',
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

    // 8. Top search queries CSV
    test(
      'verify Top search queries CSV download and data validation with all filters and group by applied',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, TestCaseType.CSV_VALIDATION, '@top-search-queries-csv'],
      },
      async () => {
        tagTest(test.info(), {
          description:
            'To verify CSV download and data validation for Top search queries in Search dashboard with all filters and group by applied',
          zephyrTestId: '',
          storyId: '',
        });

        // Get expected metric value from snowflake with all filters applied
        const dbData = await testEnvironment.searchDashboardQueryHelper.getTopSearchQueriesFromDBWithFilters({
          filterBy: testFiltersConfig,
        });

        // Component handles CSV validation internally
        const topSearchQueriesMetric = testEnvironment.searchDashboard.topSearchQueries;
        await topSearchQueriesMetric.verifyCSVDataMatchesWithSnowflakeData(
          dbData,
          testFiltersConfig.timePeriod,
          testFiltersConfig.customStartDate,
          testFiltersConfig.customEndDate
        );
      }
    );

    // 9. Most searches performed by Location metric
    test(
      'verify Most searches performed by Location metric data validation with all filters and group by applied',
      {
        tag: [
          TestPriority.P0,
          TestGroupType.SMOKE,
          TestCaseType.TABULAR_METRIC,
          '@most-searches-performed-by-location',
        ],
      },
      async () => {
        tagTest(test.info(), {
          description:
            'To verify the answer of Most searches performed by Location in Search dashboard with all filters and group by applied',
          zephyrTestId: '',
          storyId: '',
        });

        // Get expected metric value from snowflake with all filters applied
        // Query helper now returns properly transformed data
        const expectedMetricValue =
          await testEnvironment.searchDashboardQueryHelper.getMostSearchesPerformedByLocationFromDBWithFilters({
            filterBy: testFiltersConfig,
          });

        console.log('Expected Most Searches Performed By Location Data:', expectedMetricValue);

        // UI validation - component handles transformation internally
        const mostSearchesPerformedByLocationMetric = testEnvironment.searchDashboard.mostSearchesPerformedByLocation;
        await mostSearchesPerformedByLocationMetric.verifyDataIsLoaded();
        await mostSearchesPerformedByLocationMetric.verifyUIDataMatchesWithSnowflakeData(expectedMetricValue);
      }
    );

    // 10. Most searches performed by Location CSV
    test(
      'verify Most searches performed by Location CSV download and data validation with all filters and group by applied',
      {
        tag: [
          TestPriority.P0,
          TestGroupType.SMOKE,
          TestCaseType.CSV_VALIDATION,
          '@most-searches-performed-by-location-csv',
        ],
      },
      async () => {
        tagTest(test.info(), {
          description:
            'To verify CSV download and data validation for Most searches performed by Location in Search dashboard with all filters and group by applied',
          zephyrTestId: '',
          storyId: '',
        });

        // Get expected metric value from snowflake with all filters applied
        const transformedData =
          await testEnvironment.searchDashboardQueryHelper.getMostSearchesPerformedByLocationFromDBWithFilters({
            filterBy: testFiltersConfig,
          });

        // Component handles CSV validation internally
        const mostSearchesPerformedByLocationMetric = testEnvironment.searchDashboard.mostSearchesPerformedByLocation;
        await mostSearchesPerformedByLocationMetric.verifyCSVDataMatchesWithSnowflakeData(
          transformedData,
          testFiltersConfig.timePeriod,
          testFiltersConfig.customStartDate,
          testFiltersConfig.customEndDate
        );
      }
    );

    // 11. No result search queries metric
    test(
      'verify No result search queries metric data validation with all filters and group by applied',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, TestCaseType.TABULAR_METRIC, '@no-result-search-queries'],
      },
      async () => {
        tagTest(test.info(), {
          description:
            'To verify the answer of No result search queries in Search dashboard with all filters and group by applied',
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

    // 12. No result search queries CSV
    test(
      'verify No result search queries CSV download and data validation with all filters and group by applied',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, TestCaseType.CSV_VALIDATION, '@no-result-search-queries-csv'],
      },
      async () => {
        tagTest(test.info(), {
          description:
            'To verify CSV download and data validation for No result search queries in Search dashboard with all filters and group by applied',
          zephyrTestId: '',
          storyId: '',
        });

        // Get expected metric value from snowflake with all filters applied
        // Pass forCSVValidation=true to convert failure_percentage to decimal format to match CSV format
        const transformedData =
          await testEnvironment.searchDashboardQueryHelper.getNoResultSearchQueriesFromDBWithFilters({
            filterBy: testFiltersConfig,
            forCSVValidation: true, // converts failure_percentage to decimal
          });

        // Component handles CSV validation internally
        const noResultSearchQueriesMetric = testEnvironment.searchDashboard.noResultSearchQueries;
        await noResultSearchQueriesMetric.verifyCSVDataMatchesWithSnowflakeData(
          transformedData,
          testFiltersConfig.timePeriod,
          testFiltersConfig.customStartDate,
          testFiltersConfig.customEndDate
        );
      }
    );

    // 13. Top search queries with no clickthrough metric
    test(
      'verify Top search queries with no clickthrough metric data validation with all filters and group by applied',
      {
        tag: [
          TestPriority.P0,
          TestGroupType.SMOKE,
          TestCaseType.TABULAR_METRIC,
          '@top-search-queries-with-no-clickthrough',
        ],
      },
      async () => {
        tagTest(test.info(), {
          description:
            'To verify the answer of Top search queries with no clickthrough in Search dashboard with all filters and group by applied',
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

    // 14. Top search queries with no clickthrough CSV
    test(
      'verify Top search queries with no clickthrough CSV download and data validation with all filters and group by applied',
      {
        tag: [
          TestPriority.P0,
          TestGroupType.SMOKE,
          TestCaseType.CSV_VALIDATION,
          '@top-search-queries-with-no-clickthrough-csv',
        ],
      },
      async () => {
        tagTest(test.info(), {
          description:
            'To verify CSV download and data validation for Top search queries with no clickthrough in Search dashboard with all filters and group by applied',
          zephyrTestId: '',
          storyId: '',
        });

        // Get expected metric value from snowflake with all filters applied
        // Pass forCSVValidation=true to convert percentage to decimal format to match CSV format
        const transformedData =
          await testEnvironment.searchDashboardQueryHelper.getTopSearchQueriesWithNoClickthroughFromDBWithFilters({
            filterBy: testFiltersConfig,
            forCSVValidation: true, // converts no_click_rate from percentage to decimal
          });

        // Component handles CSV validation internally
        const topSearchQueriesWithNoClickthroughMetric =
          testEnvironment.searchDashboard.topSearchQueriesWithNoClickthrough;
        await topSearchQueriesWithNoClickthroughMetric.verifyCSVDataMatchesWithSnowflakeData(
          transformedData,
          testFiltersConfig.timePeriod,
          testFiltersConfig.customStartDate,
          testFiltersConfig.customEndDate
        );
      }
    );

    // 15. Top clickthrough types metric
    test(
      'verify Top clickthrough types metric data validation with all filters and group by applied',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, TestCaseType.TABULAR_METRIC, '@top-clickthrough-types'],
      },
      async () => {
        tagTest(test.info(), {
          description:
            'To verify the answer of Top clickthrough types in Search dashboard with all filters and group by applied',
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

    // 16. Top clickthrough types CSV
    test(
      'verify Top clickthrough types CSV download and data validation with all filters and group by applied',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, TestCaseType.CSV_VALIDATION, '@top-clickthrough-types-csv'],
      },
      async () => {
        tagTest(test.info(), {
          description:
            'To verify CSV download and data validation for Top clickthrough types in Search dashboard with all filters and group by applied',
          zephyrTestId: '',
          storyId: '',
        });

        // Get expected metric value from snowflake with all filters applied
        // Pass forCSVValidation=true to convert percentage to decimal format to match CSV format
        const dbData = await testEnvironment.searchDashboardQueryHelper.getTopClickthroughTypesFromDBWithFilters({
          filterBy: testFiltersConfig,
          forCSVValidation: true, // converts percentage to decimal
        });

        // Component handles CSV validation internally
        const topClickthroughTypesMetric = testEnvironment.searchDashboard.topClickthroughTypes;
        await topClickthroughTypesMetric.verifyCSVDataMatchesWithSnowflakeData(
          dbData,
          testFiltersConfig.timePeriod,
          testFiltersConfig.customStartDate,
          testFiltersConfig.customEndDate
        );
      }
    );
  }
);
