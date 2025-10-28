import { DataEngineeringTestSuite } from '@data-engineering/constants/testSuite';
import { SearchSql } from '@data-engineering/sqlQueries/search';
import { Page, test } from '@playwright/test';

import { TestPriority } from '@core/constants/testPriority';
import { TestGroupType } from '@core/constants/testType';
import { tagTest } from '@core/utils/testDecorator';

import { PeriodFilterTimeRange } from '../../../constants/periodFilterTimeRange';
import { SearchDashboardQueryHelper, SnowflakeHelper } from '../../../helpers';
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

        //get expected metric value from snowflake with default period (Last 30 days)
        const expectedMetricValue = await testEnvironment.searchDashboardQueryHelper.getTotalSearchVolumeFromDB(
          SearchSql.Total_Search_Volume,
          defaultPeriodFilter
        );

        //UI validation
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

        //get expected metric value from snowflake with default period (Last 30 days)
        const expectedMetricValue = await testEnvironment.searchDashboardQueryHelper.getSearchClickThroughRateFromDB(
          SearchSql.Search_Click_Through_Rate,
          defaultPeriodFilter
        );

        //UI validation
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

        //get expected metric value from snowflake with default period (Last 30 days)
        const expectedMetricValue = await testEnvironment.searchDashboardQueryHelper.getNoResultsSearchFromDB(
          SearchSql.No_Results_Search,
          defaultPeriodFilter
        );

        //UI validation
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

        //get expected metric value from snowflake with default period (Last 30 days)
        const expectedMetricValue =
          await testEnvironment.searchDashboardQueryHelper.getAverageSearchesPerLoggedInUserFromDB(
            SearchSql.Average_Searches_Per_Logged_In_User,
            defaultPeriodFilter
          );

        console.log('Expected Average Searches Per Logged In User Value:', expectedMetricValue);

        //UI validation
        const averageSearchesPerLoggedInUserMetric = testEnvironment.searchDashboard.averageSearchesPerLoggedInUser;
        await averageSearchesPerLoggedInUserMetric.verifyMetricUIDataPoints();
        await averageSearchesPerLoggedInUserMetric.verifyMetricValue(Number(expectedMetricValue.toString()));
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
        const expectedMetricValue = await testEnvironment.searchDashboardQueryHelper.getTopSearchQueriesFromDB(
          SearchSql.Top_Search_Queries,
          defaultPeriodFilter
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
        const expectedMetricValue =
          await testEnvironment.searchDashboardQueryHelper.getTopSearchQueriesWithNoClickthroughFromDB(
            SearchSql.Top_Search_Queries_With_No_Clickthrough,
            defaultPeriodFilter
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
        const expectedMetricValue = await testEnvironment.searchDashboardQueryHelper.getTopClickthroughTypesFromDB(
          SearchSql.Top_Clickthrough_Types,
          defaultPeriodFilter
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
        const expectedMetricValue = await testEnvironment.searchDashboardQueryHelper.getNoResultSearchQueriesFromDB(
          SearchSql.No_Result_Search_Queries,
          defaultPeriodFilter
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
        const expectedMetricValue =
          await testEnvironment.searchDashboardQueryHelper.getMostSearchesPerformedByDepartmentFromDB(
            SearchSql.Most_Searches_Performed_By_Department,
            defaultPeriodFilter
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
  }
);
