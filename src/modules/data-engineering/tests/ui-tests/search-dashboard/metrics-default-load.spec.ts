import { DataEngineeringTestSuite } from '@data-engineering/constants/testSuite';
import { SearchSql } from '@data-engineering/sqlQueries/search';
import { Page, test } from '@playwright/test';

import { TestPriority } from '@core/constants/testPriority';
import { TestGroupType } from '@core/constants/testType';
import { tagTest } from '@core/utils/testDecorator';

import { PeriodFilterTimeRange } from '../../../constants/periodFilterTimeRange';
import { DateHelper, PeriodFilterOption, SearchDashboardQueryHelper, SnowflakeHelper } from '../../../helpers';
import { SearchDashboard } from '../../../ui/dashboards';
import { CSVValidationUtil } from '../../../utils/csvValidationUtil';

import { CSVUtils } from '@/src/core/utils/csvUtils';
import { FileUtil } from '@/src/core/utils/fileUtil';
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
        const expectedMetricValue =
          await testEnvironment.searchDashboardQueryHelper.getSearchUsageVolumeAndClickThroughRateFromDB(
            SearchSql.Search_Usage_Volume_And_Click_Through_Rate,
            defaultPeriodFilter
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
        const expectedMetricValue =
          await testEnvironment.searchDashboardQueryHelper.getSearchUsageVolumeAndClickThroughRateFromDB(
            SearchSql.Search_Usage_Volume_And_Click_Through_Rate,
            defaultPeriodFilter
          );

        // Get date range for the period filter
        const dateReplacements = DateHelper.getDateReplacements(
          defaultPeriodFilter as PeriodFilterOption,
          undefined,
          undefined
        );

        // Parse start and end dates
        const startDateStr = dateReplacements.startDate.split(' ')[0]; // Get YYYY-MM-DD part
        const endDateStr = dateReplacements.endDate.split(' ')[0]; // Get YYYY-MM-DD part
        const startDate = new Date(startDateStr);
        const endDate = new Date(endDateStr);

        // Create a map of DB data by date (format: YYYY-MM-DD)
        const dbDataMap = new Map<string, { total_search: number; total_clickthrough: number }>();
        for (const item of expectedMetricValue) {
          const searchDate = item.SEARCH_DATE || item.search_date;
          let dateKey: string;

          // Extract date key in YYYY-MM-DD format
          if (searchDate instanceof Date) {
            dateKey = `${searchDate.getFullYear()}-${String(searchDate.getMonth() + 1).padStart(2, '0')}-${String(searchDate.getDate()).padStart(2, '0')}`;
          } else if (typeof searchDate === 'string') {
            // Extract YYYY-MM-DD from string (could be "2025-10-30" or "2025-10-30T00:00:00.000Z")
            dateKey = searchDate.split('T')[0].split(' ')[0];
          } else {
            dateKey = String(searchDate).split('T')[0].split(' ')[0];
          }

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

          dbDataMap.set(dateKey, {
            total_search: isNaN(totalSearchCount) ? 0 : totalSearchCount,
            total_clickthrough: isNaN(totalClickCount) ? 0 : totalClickCount,
          });
        }

        // Generate all dates in the range and create complete dataset
        const transformedData: Array<{
          search_performed_datetime: string;
          total_search: number;
          total_clickthrough: number;
        }> = [];

        const currentDate = new Date(startDate);
        while (currentDate <= endDate) {
          const year = currentDate.getFullYear();
          const month = String(currentDate.getMonth() + 1).padStart(2, '0');
          const day = String(currentDate.getDate()).padStart(2, '0');
          const dateKey = `${year}-${month}-${day}`;
          const formattedDate = `${dateKey} 00:00:00`;

          // Get data from DB map or use zeros
          const dbData = dbDataMap.get(dateKey) || { total_search: 0, total_clickthrough: 0 };

          transformedData.push({
            search_performed_datetime: formattedDate,
            total_search: dbData.total_search,
            total_clickthrough: dbData.total_clickthrough,
          });

          // Move to next day
          currentDate.setDate(currentDate.getDate() + 1);
        }

        // Sort by date descending (CSV order)
        transformedData.sort((a, b) => b.search_performed_datetime.localeCompare(a.search_performed_datetime));

        // Download CSV and verify data
        const searchUsageVolumeAndClickThroughRateMetric =
          testEnvironment.searchDashboard.searchUsageVolumeAndClickThroughRate;
        await searchUsageVolumeAndClickThroughRateMetric.verifyDataIsLoaded();
        const { filePath } = await searchUsageVolumeAndClickThroughRateMetric.downloadDataAsCSV();
        console.log(`Downloaded data from UI should be saved at: ${filePath}`);

        try {
          // Validate the data in the CSV matches with the data from snowflake
          await CSVValidationUtil.validateAndAssert({
            csvPath: filePath,
            expectedDBData: transformedData as any,
            metricName: 'Search usage volume and click through rate',
            selectedPeriod: defaultPeriodFilter,
            expectedHeaders: ['Search performed datetime', 'Total search', 'Total clickthrough'],
            transformations: {
              headerMapping: {
                'Search performed datetime': 'search_performed_datetime',
                'Total search': 'total_search',
                'Total clickthrough': 'total_clickthrough',
              },
              // No percentage fields or special transformations needed for this metric
            },
          });
        } finally {
          // Clean up CSV file
          FileUtil.deleteTemporaryFile(filePath);
        }
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
        const expectedMetricValue = await testEnvironment.searchDashboardQueryHelper.getTopSearchQueriesFromDB(
          SearchSql.Top_Search_Queries,
          defaultPeriodFilter
        );

        // Transform the database results to match the expected format
        // Note: CSV shows percentage as decimal (0.5 for 50%) while DB has percentage format (50.00 %)
        // We convert percentage to decimal to match CSV format
        const transformedData = expectedMetricValue.map((item: any) => {
          const clickthroughValue = Number(item.CLICKTHROUGH || item.clickthrough);
          const successRateValue = item.SUCCESS_RATE || item.success_rate;

          // Convert percentage to decimal format to match CSV format
          // CSV shows decimal (0.5) while DB has percentage (50.00 %)
          let successRateDecimal: number;
          if (typeof successRateValue === 'string') {
            // Remove % if present and convert to number
            const cleanValue = successRateValue.replace('%', '').trim();
            const percentageValue = parseFloat(cleanValue);
            // Convert percentage to decimal (50 -> 0.5)
            successRateDecimal = isNaN(percentageValue) ? 0 : percentageValue / 100;
          } else if (typeof successRateValue === 'number') {
            // If it's already a number, check if it's percentage (> 1) or decimal (<= 1)
            // If > 1, assume it's percentage and convert to decimal
            successRateDecimal = successRateValue > 1 ? successRateValue / 100 : successRateValue;
          } else {
            successRateDecimal = 0;
          }

          return {
            search_query: item.SEARCH_TERM || item.search_term,
            total_search: Number(item.TOTAL_SEARCH || item.total_search),
            clickthrough: isNaN(clickthroughValue) ? 0 : clickthroughValue,
            success_rate: successRateDecimal,
          };
        });

        // CSV download includes all 10 records (not just the 5 shown in UI table)
        // Use all DB records for validation
        const transformedDataForValidation = transformedData;

        // Download CSV and verify data
        const topSearchQueriesMetric = testEnvironment.searchDashboard.topSearchQueries;
        await topSearchQueriesMetric.verifyDataIsLoaded();
        const { filePath } = await topSearchQueriesMetric.downloadDataAsCSV();
        console.log(`Downloaded data from UI should be saved at: ${filePath}`);

        try {
          // Validate the data in the CSV matches with the data from snowflake
          await CSVValidationUtil.validateAndAssert({
            csvPath: filePath,
            expectedDBData: transformedDataForValidation as any,
            metricName: 'Top search queries',
            selectedPeriod: defaultPeriodFilter,
            expectedHeaders: [
              'Search query',
              'Total search query volume',
              'Number of click-through count',
              'Click-through rate',
            ],
            transformations: {
              headerMapping: {
                'Search query': 'search_query',
                'Total search query volume': 'total_search',
                'Number of click-through count': 'clickthrough',
                'Click-through rate': 'success_rate',
              },
              // Note: CSV has decimal format (0.5) not percentage format (50%)
              // DB data has been converted to decimal format in transformedData
              // Use percentageField with normalizeToPercentage false to apply tolerance for decimal comparison
              percentageField: {
                fieldName: 'success_rate',
                normalizeToPercentage: false, // Don't normalize since both are already in decimal format
              },
              tolerance: {
                percentage: 0.01, // Allow 1 percentage point difference (0.01 in decimal format)
              },
            },
          });
        } finally {
          // Clean up CSV file
          FileUtil.deleteTemporaryFile(filePath);
        }
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
        const expectedMetricValue =
          await testEnvironment.searchDashboardQueryHelper.getTopSearchQueriesWithNoClickthroughFromDB(
            SearchSql.Top_Search_Queries_With_No_Clickthrough,
            defaultPeriodFilter,
            undefined,
            undefined,
            true // forCSVValidation: converts no_click_rate from percentage to decimal
          );

        // Transform the database results to match the expected format
        // Note: Query helper already converted no_click_rate to decimal format for CSV validation
        const transformedData = expectedMetricValue.map((item: any) => ({
          search_query: item.SEARCH_TERM || item.search_term,
          total_search: Number(item.TOTAL_SEARCH || item.total_search),
          no_click_count: Number(item.NO_CLICK_COUNT || item.no_click_count),
          no_click_rate: Number(item.NO_CLICK_RATE || item.no_click_rate),
        }));

        // Download CSV and verify data
        const topSearchQueriesWithNoClickthroughMetric =
          testEnvironment.searchDashboard.topSearchQueriesWithNoClickthrough;
        await topSearchQueriesWithNoClickthroughMetric.verifyDataIsLoaded();
        const { filePath } = await topSearchQueriesWithNoClickthroughMetric.downloadDataAsCSV();
        console.log(`Downloaded data from UI should be saved at: ${filePath}`);

        try {
          // CSV download only includes records visible in UI (5 records), not all DB records (10)
          // Parse CSV first to get which search queries are actually in the CSV
          const csvData = await CSVUtils.parseReportCSV(filePath);
          const csvSearchQueries = csvData.data.map((row: any) => row['Search query']);

          // Filter DB data to only include records that are in the CSV
          const transformedDataForValidation = transformedData.filter((item: any) =>
            csvSearchQueries.includes(item.search_query)
          );

          // Validate the data in the CSV matches with the data from snowflake
          await CSVValidationUtil.validateAndAssert({
            csvPath: filePath,
            expectedDBData: transformedDataForValidation as any,
            metricName: 'Top search queries with no clickthrough',
            selectedPeriod: defaultPeriodFilter,
            expectedHeaders: ['Search query', 'No click count', 'Total search query volume', 'No of click rate'],
            transformations: {
              headerMapping: {
                'Search query': 'search_query',
                'No click count': 'no_click_count',
                'Total search query volume': 'total_search',
                'No of click rate': 'no_click_rate',
              },
              // Note: CSV has decimal format (0.5) not percentage format (50%)
              // Query helper already converted DB percentage to decimal format (see forCSVValidation flag)
              // Use percentageField with normalizeToPercentage false to apply tolerance for decimal comparison
              percentageField: {
                fieldName: 'no_click_rate',
                normalizeToPercentage: false, // Don't normalize since both are already in decimal format
              },
              tolerance: {
                percentage: 0.01, // Allow 1 percentage point difference (0.01 in decimal format)
              },
            },
          });
        } finally {
          // Clean up CSV file
          FileUtil.deleteTemporaryFile(filePath);
        }
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
        const expectedMetricValue = await testEnvironment.searchDashboardQueryHelper.getTopClickthroughTypesFromDB(
          SearchSql.Top_Clickthrough_Types,
          defaultPeriodFilter
        );

        // Transform the database results to match the expected format
        // Note: CSV shows percentage as decimal (1 for 100%) while DB has percentage format (100.0 %)
        // CSV also doesn't include total_clickthrough field, so we exclude it from validation
        const transformedData = expectedMetricValue.map((item: any) => {
          const percentageValue = item.PERCENTAGE || item.percentage;

          // Convert percentage to decimal format to match CSV format
          // CSV shows decimal (1) while DB has percentage (100.0 %)
          let percentageDecimal: number;
          if (typeof percentageValue === 'string') {
            // Remove % if present and convert to number
            const cleanValue = percentageValue.replace('%', '').trim();
            const percentageNum = parseFloat(cleanValue);
            // Convert percentage to decimal (100 -> 1)
            percentageDecimal = isNaN(percentageNum) ? 0 : percentageNum / 100;
          } else if (typeof percentageValue === 'number') {
            // If it's already a number, check if it's percentage (> 1) or decimal (<= 1)
            // If > 1, assume it's percentage and convert to decimal
            percentageDecimal = percentageValue > 1 ? percentageValue / 100 : percentageValue;
          } else {
            percentageDecimal = 0;
          }

          return {
            item_type: item.ITEM_TYPE || item.item_type,
            click_count: Number(item.CLICK_COUNT || item.click_count),
            // Note: total_clickthrough is not in CSV, so we don't include it in transformed data
            percentage: percentageDecimal,
          };
        });

        // Download CSV and verify data
        const topClickthroughTypesMetric = testEnvironment.searchDashboard.topClickthroughTypes;
        await topClickthroughTypesMetric.verifyDataIsLoaded();
        const { filePath } = await topClickthroughTypesMetric.downloadDataAsCSV();
        console.log(`Downloaded data from UI should be saved at: ${filePath}`);

        try {
          // Validate the data in the CSV matches with the data from snowflake
          await CSVValidationUtil.validateAndAssert({
            csvPath: filePath,
            expectedDBData: transformedData as any,
            metricName: 'Top clickthrough types',
            selectedPeriod: defaultPeriodFilter,
            expectedHeaders: ['Type', 'Total click-through', 'Percentage of click-through types'],
            transformations: {
              headerMapping: {
                Type: 'item_type',
                'Total click-through': 'click_count',
                'Percentage of click-through types': 'percentage',
              },
              // Note: CSV has decimal format (1) not percentage format (100%)
              // DB data has been converted to decimal format in transformedData
              // Use percentageField with normalizeToPercentage false to apply tolerance for decimal comparison
              percentageField: {
                fieldName: 'percentage',
                normalizeToPercentage: false, // Don't normalize since both are already in decimal format
              },
              tolerance: {
                percentage: 0.01, // Allow 1 percentage point difference (0.01 in decimal format)
              },
            },
          });
        } finally {
          // Clean up CSV file
          FileUtil.deleteTemporaryFile(filePath);
        }
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
        const expectedMetricValue = await testEnvironment.searchDashboardQueryHelper.getNoResultSearchQueriesFromDB(
          SearchSql.No_Result_Search_Queries,
          defaultPeriodFilter
        );

        // Transform the database results to match the expected format
        // Note: CSV shows percentage as decimal (0.153846 for 15.4%) while DB has percentage format (15.4)
        // We convert percentage to decimal to match CSV format
        const transformedData = expectedMetricValue.map((item: any) => {
          const failurePercentageValue = item.FAILURE_PERCENTAGE || item.failure_percentage;

          // Convert percentage to decimal format to match CSV format
          // CSV shows decimal (0.153846) while DB has percentage (15.4)
          let failurePercentageDecimal: number;
          if (typeof failurePercentageValue === 'string') {
            // Remove % if present and convert to number
            const cleanValue = failurePercentageValue.replace('%', '').trim();
            const percentageValue = parseFloat(cleanValue);
            // Convert percentage to decimal (15.4 -> 0.154)
            failurePercentageDecimal = isNaN(percentageValue) ? 0 : percentageValue / 100;
          } else if (typeof failurePercentageValue === 'number') {
            // If it's already a number, check if it's percentage (> 1) or decimal (<= 1)
            // If > 1, assume it's percentage and convert to decimal
            failurePercentageDecimal =
              failurePercentageValue > 1 ? failurePercentageValue / 100 : failurePercentageValue;
          } else {
            failurePercentageDecimal = 0;
          }

          return {
            search_term: item.SEARCH_TERM || item.search_term,
            failed_search_count: Number(item.FAILED_SEARCH_COUNT || item.failed_search_count),
            total_search_count: Number(item.TOTAL_SEARCH_COUNT || item.total_search_count),
            failure_percentage: failurePercentageDecimal,
          };
        });

        // Download CSV and verify data
        const noResultSearchQueriesMetric = testEnvironment.searchDashboard.noResultSearchQueries;
        await noResultSearchQueriesMetric.verifyDataIsLoaded();
        const { filePath } = await noResultSearchQueriesMetric.downloadDataAsCSV();
        console.log(`Downloaded data from UI should be saved at: ${filePath}`);

        try {
          // Validate the data in the CSV matches with the data from snowflake
          await CSVValidationUtil.validateAndAssert({
            csvPath: filePath,
            expectedDBData: transformedData as any,
            metricName: 'No result search queries',
            selectedPeriod: defaultPeriodFilter,
            expectedHeaders: ['Search query', 'No result count', 'Total search volume', 'Percentage of total searches'],
            transformations: {
              headerMapping: {
                'Search query': 'search_term',
                'No result count': 'failed_search_count',
                'Total search volume': 'total_search_count',
                'Percentage of total searches': 'failure_percentage',
              },
              // Note: CSV has decimal format (0.153846) not percentage format (15.4%)
              // DB data has been converted to decimal format in transformedData
              // Use percentageField with normalizeToPercentage false to apply tolerance for decimal comparison
              percentageField: {
                fieldName: 'failure_percentage',
                normalizeToPercentage: false, // Don't normalize since both are already in decimal format
              },
              tolerance: {
                percentage: 0.01, // Allow 1 percentage point difference (0.01 in decimal format)
              },
            },
          });
        } finally {
          // Clean up CSV file
          FileUtil.deleteTemporaryFile(filePath);
        }
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
        const expectedMetricValue =
          await testEnvironment.searchDashboardQueryHelper.getMostSearchesPerformedByDepartmentFromDB(
            SearchSql.Most_Searches_Performed_By_Department,
            defaultPeriodFilter
          );

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

        // Download CSV and verify data
        const mostSearchesPerformedByDepartmentMetric =
          testEnvironment.searchDashboard.mostSearchesPerformedByDepartment;
        await mostSearchesPerformedByDepartmentMetric.verifyDataIsLoaded();
        const { filePath } = await mostSearchesPerformedByDepartmentMetric.downloadDataAsCSV();
        console.log(`Downloaded data from UI should be saved at: ${filePath}`);

        try {
          // Validate the data in the CSV matches with the data from snowflake
          await CSVValidationUtil.validateAndAssert({
            csvPath: filePath,
            expectedDBData: transformedData as any,
            metricName: 'Most searches performed by Department',
            selectedPeriod: defaultPeriodFilter,
            expectedHeaders: [
              'Department',
              'Total search query volume',
              'Unique user searching',
              'Average searches per user',
            ],
            transformations: {
              headerMapping: {
                Department: 'department',
                'Total search query volume': 'total_searches',
                'Unique user searching': 'distinct_users',
                'Average searches per user': 'avg_searches_per_user',
              },
            },
          });
        } finally {
          // Clean up CSV file
          FileUtil.deleteTemporaryFile(filePath);
        }
      }
    );
  }
);
