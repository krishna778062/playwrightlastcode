import { DataEngineeringTestSuite } from '@data-engineering/constants/testSuite';
import { SearchSql } from '@data-engineering/sqlQueries/search';
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
  'search Dashboard - Custom Period Filter Applied',
  {
    tag: [DataEngineeringTestSuite.SEARCH, '@custom-period-filter'],
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

    test.beforeAll('Setting up the search dashboard + applying custom period filter', async ({ browser }) => {
      // Setup dashboard using dedicated method
      testEnvironment = await setupSearchDashboardForTest(browser, UserRole.APP_MANAGER);

      // Set custom period: Start date July 1, 2025, End date: Current date
      const endDate = DateHelper.getCurrentUTCDate();
      const customStartDate = '2025-09-01';

      testFiltersConfig = {
        tenantCode: process.env.ORG_ID!,
        timePeriod: PeriodFilterTimeRange.CUSTOM,
        customStartDate: customStartDate,
        customEndDate: endDate.toISOString().split('T')[0], // YYYY-MM-DD format
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
      'verify Total search volume metric data validation with custom period filter applied (July 1, 2025 to Current Date)',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, '@total-search-volume'],
      },
      async () => {
        tagTest(test.info(), {
          description:
            'To verify the answer of Total search volume in Search dashboard with custom period filter applied',
          zephyrTestId: '',
          storyId: '',
        });

        // Get expected metric value from snowflake with custom period filter applied
        const expectedMetricValue =
          await testEnvironment.searchDashboardQueryHelper.getTotalSearchVolumeFromDBWithFilters(
            SearchSql.Total_Search_Volume,
            testFiltersConfig
          );

        // UI validation
        const totalSearchVolumeMetric = testEnvironment.searchDashboard.totalSearchVolume;
        await totalSearchVolumeMetric.verifyMetricUIDataPoints();
        await totalSearchVolumeMetric.verifyMetricValue(expectedMetricValue);
      }
    );

    test(
      'verify Search click through rate metric data validation with custom period filter applied (July 1, 2025 to Current Date)',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, '@search-click-through-rate'],
      },
      async () => {
        tagTest(test.info(), {
          description:
            'To verify the answer of Search click through rate in Search dashboard with custom period filter applied',
          zephyrTestId: '',
          storyId: '',
        });

        // Get expected metric value from snowflake with custom period filter applied
        const expectedMetricValue =
          await testEnvironment.searchDashboardQueryHelper.getSearchClickThroughRateFromDBWithFilters(
            SearchSql.Search_Click_Through_Rate,
            testFiltersConfig
          );

        // UI validation
        const searchClickThroughRateMetric = testEnvironment.searchDashboard.searchClickThroughRate;
        await searchClickThroughRateMetric.verifyMetricUIDataPoints();
        await searchClickThroughRateMetric.verifyMetricValue(expectedMetricValue);
      }
    );

    test(
      'verify No results search metric data validation with custom period filter applied (July 1, 2025 to Current Date)',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, '@no-results-search'],
      },
      async () => {
        tagTest(test.info(), {
          description:
            'To verify the answer of No results search in Search dashboard with custom period filter applied',
          zephyrTestId: '',
          storyId: '',
        });

        // Get expected metric value from snowflake with custom period filter applied
        const expectedMetricValue =
          await testEnvironment.searchDashboardQueryHelper.getNoResultsSearchFromDBWithFilters(
            SearchSql.No_Results_Search,
            testFiltersConfig
          );

        // UI validation
        const noResultsSearchMetric = testEnvironment.searchDashboard.noResultSearch;
        await noResultsSearchMetric.verifyMetricUIDataPoints();
        await noResultsSearchMetric.verifyMetricValue(expectedMetricValue);
      }
    );

    test(
      'verify Average searches per logged in user metric data validation with custom period filter applied (July 1, 2025 to Current Date)',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, '@average-searches-per-logged-in-user'],
      },
      async () => {
        tagTest(test.info(), {
          description:
            'To verify the answer of Average searches per logged in user in Search dashboard with custom period filter applied',
          zephyrTestId: '',
          storyId: '',
        });

        // Get expected metric value from snowflake with custom period filter applied
        const expectedMetricValue =
          await testEnvironment.searchDashboardQueryHelper.getAverageSearchesPerLoggedInUserFromDBWithFilters(
            SearchSql.Average_Searches_Per_Logged_In_User,
            testFiltersConfig
          );

        console.log('Expected Average Searches Per Logged In User Value:', expectedMetricValue);

        // UI validation
        const averageSearchesPerLoggedInUserMetric = testEnvironment.searchDashboard.averageSearchesPerLoggedInUser;
        await averageSearchesPerLoggedInUserMetric.verifyMetricUIDataPoints();
        await averageSearchesPerLoggedInUserMetric.verifyMetricValue(Number(expectedMetricValue.toString()));
      }
    );

    test(
      'verify Top search queries metric data validation with custom period filter applied (July 1, 2025 to Current Date)',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, '@top-search-queries'],
      },
      async () => {
        tagTest(test.info(), {
          description:
            'To verify the answer of Top search queries in Search dashboard with custom period filter applied',
          zephyrTestId: '',
          storyId: '',
        });

        // Get expected metric value from snowflake with custom period filter applied
        const expectedMetricValue =
          await testEnvironment.searchDashboardQueryHelper.getTopSearchQueriesFromDBWithFilters(
            SearchSql.Top_Search_Queries,
            testFiltersConfig
          );

        console.log('Expected Top Search Queries Data:', expectedMetricValue);

        // Transform the database results to match the expected format
        const transformedData = expectedMetricValue.map((item: any) => {
          const clickthroughValue = Number(item.CLICKTHROUGH || item.clickthrough);
          return {
            search_query: item.SEARCH_TERM || item.search_term,
            total_search: Number(item.TOTAL_SEARCH || item.total_search),
            clickthrough: isNaN(clickthroughValue) ? 0 : clickthroughValue,
            success_rate: item.SUCCESS_RATE || item.success_rate,
          };
        });

        // UI validation
        const topSearchQueriesMetric = testEnvironment.searchDashboard.topSearchQueries;
        await topSearchQueriesMetric.verifyDataIsLoaded();
        await topSearchQueriesMetric.verifyUIDataMatchesWithSnowflakeData(transformedData);
      }
    );

    test(
      'verify Top search queries with no clickthrough metric data validation with custom period filter applied (July 1, 2025 to Current Date)',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, '@top-search-queries-with-no-clickthrough'],
      },
      async () => {
        tagTest(test.info(), {
          description:
            'To verify the answer of Top search queries with no clickthrough in Search dashboard with custom period filter applied',
          zephyrTestId: '',
          storyId: '',
        });

        // Get expected metric value from snowflake with custom period filter applied
        const expectedMetricValue =
          await testEnvironment.searchDashboardQueryHelper.getTopSearchQueriesWithNoClickthroughFromDBWithFilters(
            SearchSql.Top_Search_Queries_With_No_Clickthrough,
            testFiltersConfig
          );

        console.log('Expected Top Search Queries With No Clickthrough Data:', expectedMetricValue);

        // Transform the database results to match the expected format
        const transformedData = expectedMetricValue.map((item: any) => {
          const noClickCountValue = Number(item.NO_CLICK_COUNT || item.no_click_count);
          return {
            search_query: item.SEARCH_TERM || item.search_term,
            total_search: Number(item.TOTAL_SEARCH || item.total_search),
            no_click_count: isNaN(noClickCountValue) ? 0 : noClickCountValue,
            no_click_rate: item.NO_CLICK_RATE || item.no_click_rate,
          };
        });

        // UI validation
        const topSearchQueriesWithNoClickthroughMetric =
          testEnvironment.searchDashboard.topSearchQueriesWithNoClickthrough;
        await topSearchQueriesWithNoClickthroughMetric.verifyDataIsLoaded();
        await topSearchQueriesWithNoClickthroughMetric.verifyUIDataMatchesWithSnowflakeData(transformedData);
      }
    );

    test(
      'verify Top clickthrough types metric data validation with custom period filter applied (July 1, 2025 to Current Date)',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, '@top-clickthrough-types'],
      },
      async () => {
        tagTest(test.info(), {
          description:
            'To verify the answer of Top clickthrough types in Search dashboard with custom period filter applied',
          zephyrTestId: '',
          storyId: '',
        });

        // Get expected metric value from snowflake with custom period filter applied
        const expectedMetricValue =
          await testEnvironment.searchDashboardQueryHelper.getTopClickthroughTypesFromDBWithFilters(
            SearchSql.Top_Clickthrough_Types,
            testFiltersConfig
          );

        console.log('Expected Top Clickthrough Types Data:', expectedMetricValue);

        // Transform the database results to match the expected format
        const transformedData = expectedMetricValue.map((item: any) => ({
          item_type: item.ITEM_TYPE || item.item_type,
          click_count: Number(item.CLICK_COUNT || item.click_count),
          total_clickthrough: Number(item.TOTAL_CLICKTHROUGH || item.total_clickthrough),
          percentage: item.PERCENTAGE || item.percentage,
        }));

        // UI validation
        const topClickthroughTypesMetric = testEnvironment.searchDashboard.topClickthroughTypes;
        await topClickthroughTypesMetric.verifyDataIsLoaded();
        await topClickthroughTypesMetric.verifyUIDataMatchesWithSnowflakeData(transformedData);
      }
    );

    test(
      'verify No result search queries metric data validation with custom period filter applied (July 1, 2025 to Current Date)',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, '@no-result-search-queries'],
      },
      async () => {
        tagTest(test.info(), {
          description:
            'To verify the answer of No result search queries in Search dashboard with custom period filter applied',
          zephyrTestId: '',
          storyId: '',
        });

        // Get expected metric value from snowflake with custom period filter applied
        const expectedMetricValue =
          await testEnvironment.searchDashboardQueryHelper.getNoResultSearchQueriesFromDBWithFilters(
            SearchSql.No_Result_Search_Queries,
            testFiltersConfig
          );

        console.log('Expected No Result Search Queries Data:', expectedMetricValue);

        // Transform the database results to match the expected format
        const transformedData = expectedMetricValue.map((item: any) => ({
          search_term: item.SEARCH_TERM || item.search_term,
          failed_search_count: Number(item.FAILED_SEARCH_COUNT || item.failed_search_count),
          total_search_count: Number(item.TOTAL_SEARCH_COUNT || item.total_search_count),
          failure_percentage: Number(item.FAILURE_PERCENTAGE || item.failure_percentage),
        }));

        // UI validation
        const noResultSearchQueriesMetric = testEnvironment.searchDashboard.noResultSearchQueries;
        await noResultSearchQueriesMetric.verifyDataIsLoaded();
        await noResultSearchQueriesMetric.verifyUIDataMatchesWithSnowflakeData(transformedData);
      }
    );

    test(
      'verify Most searches performed by Department metric data validation with custom period filter applied (July 1, 2025 to Current Date)',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, '@most-searches-performed-by-department'],
      },
      async () => {
        tagTest(test.info(), {
          description:
            'To verify the answer of Most searches performed by Department in Search dashboard with custom period filter applied',
          zephyrTestId: '',
          storyId: '',
        });

        // Get expected metric value from snowflake with custom period filter applied
        const expectedMetricValue =
          await testEnvironment.searchDashboardQueryHelper.getMostSearchesPerformedByDepartmentFromDBWithFilters(
            SearchSql.Most_Searches_Performed_By_Department,
            testFiltersConfig
          );

        console.log('Expected Most Searches Performed By Department Data:', expectedMetricValue);

        // Transform the database results to match the expected format
        const transformedData = expectedMetricValue.map((item: any) => {
          const avgSearchesPerUser = Number(item.AVG_SEARCHES_PER_USER || item.avg_searches_per_user);
          return {
            department: item.DEPARTMENT || item.department,
            total_searches: Number(item.TOTAL_SEARCHES || item.total_searches),
            distinct_users: Number(item.DISTINCT_USERS || item.distinct_users),
            // Keep the value as-is from DB, let the component handle formatting
            avg_searches_per_user: isNaN(avgSearchesPerUser) ? 0 : avgSearchesPerUser,
          };
        });

        // UI validation
        const mostSearchesPerformedByDepartmentMetric =
          testEnvironment.searchDashboard.mostSearchesPerformedByDepartment;
        await mostSearchesPerformedByDepartmentMetric.verifyDataIsLoaded();
        await mostSearchesPerformedByDepartmentMetric.verifyUIDataMatchesWithSnowflakeData(transformedData);
      }
    );

    test(
      'verify Search usage volume and click through rate metric data validation with custom period filter applied (July 1, 2025 to Current Date)',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, '@search-usage-volume-and-click-through-rate'],
      },
      async () => {
        tagTest(test.info(), {
          description:
            'To verify the answer of Search usage volume and click through rate in Search dashboard with custom period filter applied',
          zephyrTestId: '',
          storyId: '',
        });

        // Get expected metric value from snowflake with custom period filter applied
        const expectedMetricValue =
          await testEnvironment.searchDashboardQueryHelper.getSearchUsageVolumeAndClickThroughRateFromDBWithFilters(
            SearchSql.Search_Usage_Volume_And_Click_Through_Rate,
            testFiltersConfig
          );

        console.log('Expected Search Usage Volume and Click Through Rate Data:', expectedMetricValue);

        // Transform the database results to match the expected format
        const transformedData = expectedMetricValue.map((item: any) => {
          const searchDate = item.SEARCH_DATE || item.search_date;
          const totalSearchCount =
            item.TOTAL_SEARCH_COUNT !== undefined && item.TOTAL_SEARCH_COUNT !== null
              ? Number(item.TOTAL_SEARCH_COUNT)
              : item.total_search_count !== undefined && item.total_search_count !== null
                ? Number(item.total_search_count)
                : 0;
          const totalClickCount =
            item.TOTAL_CLICK_COUNT !== undefined && item.TOTAL_CLICK_COUNT !== null
              ? Number(item.TOTAL_CLICK_COUNT)
              : item.total_click_count !== undefined && item.total_click_count !== null
                ? Number(item.total_click_count)
                : 0;

          return {
            search_date: searchDate,
            total_search_count: isNaN(totalSearchCount) ? 0 : totalSearchCount,
            total_click_count: isNaN(totalClickCount) ? 0 : totalClickCount,
          };
        });

        // UI validation
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
        await searchUsageVolumeAndClickThroughRateMetric.verifyLinePointsWithTooltips(transformedData);
      }
    );
  }
);
