import { DataEngineeringTestSuite } from '@data-engineering/constants/testSuite';
import { Page, test } from '@playwright/test';

import { TestPriority } from '@core/constants/testPriority';
import { TestGroupType } from '@core/constants/testType';
import { tagTest } from '@core/utils/testDecorator';

import { PeriodFilterTimeRange } from '../../../constants/periodFilterTimeRange';
import { PeopleDashboardQueryHelper, SnowflakeHelper } from '../../../helpers';
import { FilterOptions } from '../../../helpers/baseAnalyticsQueryHelper';
import { PeopleDashboard } from '../../../ui/dashboards/people/peopleDashboard';

import {
  cleanupDashboardTesting,
  setupPeopleDashboardForTest,
  UserRole,
} from '@/src/modules/data-engineering/helpers/dashboardSetupHelper';

test.describe(
  'people dashboard - default state validation',
  {
    tag: [DataEngineeringTestSuite.PEOPLE, '@default-state'],
  },
  () => {
    let testEnvironment: {
      page: Page;
      peopleDashboard: PeopleDashboard;
      peopleQueryHelper: PeopleDashboardQueryHelper;
      snowflakeHelper: SnowflakeHelper;
    };
    let testFiltersConfig: FilterOptions;

    test.beforeAll('Setup People Dashboard with default filters', async ({ browser }) => {
      // Setup dashboard using dedicated method
      testEnvironment = await setupPeopleDashboardForTest(browser, UserRole.APP_MANAGER);

      // Define unified filter configuration for default state (Last 30 days)
      testFiltersConfig = {
        tenantCode: process.env.ORG_ID!,
        timePeriod: PeriodFilterTimeRange.LAST_30_DAYS,
      };

      const { analyticsFiltersComponent } = testEnvironment.peopleDashboard;

      // Apply filters using unified configuration (People dashboard only has period filter)
      await analyticsFiltersComponent.applyFiltersFromConfig(testFiltersConfig);
    });

    test.afterAll('Cleanup People Dashboard', async () => {
      // Cleanup using helper
      await cleanupDashboardTesting(testEnvironment);
    });

    test(
      'verify Total Users metric data validation with default period filter (Last 30 days)',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, '@total-users'],
      },
      async () => {
        tagTest(test.info(), {
          description: 'TS To verify the answer Total users in People Dashboard',
          zephyrTestId: 'DE-25869',
          storyId: 'DE-24673',
        });

        const { peopleQueryHelper } = testEnvironment;

        // Get expected metric value from Snowflake with filters applied
        const expectedMetricValue = await peopleQueryHelper.getTotalUsersDataFromDBWithFilters({
          filterBy: testFiltersConfig,
        });

        // UI validation
        const totalUsersMetric = testEnvironment.peopleDashboard.totalUsers;
        await totalUsersMetric.verifyMetricValue(expectedMetricValue);
      }
    );

    test(
      'verify Departments metric data validation with default period filter (Last 30 days)',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, '@departments'],
      },
      async () => {
        tagTest(test.info(), {
          description: 'TS To verify the answer Departments in People Dashboard',
          zephyrTestId: 'DE-25870',
          storyId: 'DE-24669',
        });

        const { peopleQueryHelper } = testEnvironment;

        // Get expected metric value from Snowflake with filters applied
        const expectedMetricValue = await peopleQueryHelper.getDepartmentsCountDataFromDBWithFilters({
          filterBy: testFiltersConfig,
        });

        // UI validation
        const departmentsMetric = testEnvironment.peopleDashboard.totalDepartments;
        await departmentsMetric.verifyMetricIsLoaded();
        await departmentsMetric.verifyMetricValue(expectedMetricValue);
      }
    );

    test(
      'verify Locations metric data validation with default period filter (Last 30 days)',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, '@locations'],
      },
      async () => {
        tagTest(test.info(), {
          description: 'TS To verify the answer Location in People Dashboard',
          zephyrTestId: 'DE-25871',
          storyId: 'DE-25569',
        });

        const { peopleQueryHelper } = testEnvironment;

        // Get expected metric value from Snowflake with filters applied
        const expectedMetricValue = await peopleQueryHelper.getLocationsCountDataFromDBWithFilters({
          filterBy: testFiltersConfig,
        });

        // UI validation
        const locationsMetric = testEnvironment.peopleDashboard.totalLocations;
        await locationsMetric.verifyMetricIsLoaded();
        await locationsMetric.verifyMetricValue(expectedMetricValue);
      }
    );

    test(
      'verify User Category metric data validation with default period filter (Last 30 days)',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, '@user-category'],
      },
      async () => {
        tagTest(test.info(), {
          description: 'TS To verify the answer User Category in People Dashboard',
          zephyrTestId: 'DE-25872',
          storyId: 'DE-25560',
        });

        const { peopleQueryHelper } = testEnvironment;

        // Get expected metric value from Snowflake with filters applied
        const expectedMetricValue = await peopleQueryHelper.getUserCategoryCountDataFromDBWithFilters({
          filterBy: testFiltersConfig,
        });

        // UI validation
        const userCategoryMetric = testEnvironment.peopleDashboard.totalUserCategories;
        await userCategoryMetric.verifyMetricIsLoaded();
        await userCategoryMetric.verifyMetricValue(expectedMetricValue);
      }
    );

    // Tabular data validations
    test(
      'verify Content Published tabular data validation with default period filter (Last 30 days)',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, '@content-published'],
      },
      async () => {
        tagTest(test.info(), {
          description: 'TS To verify the answer Content published in People Dashboard',
          zephyrTestId: 'DE-25873',
          storyId: 'DE-25561',
        });

        const { peopleQueryHelper } = testEnvironment;

        // Get expected data from Snowflake with filters applied
        const contentPublishedData = await peopleQueryHelper.getContentPublishedDataFromDBWithFilters({
          filterBy: testFiltersConfig,
        });

        // Verify the same data is displayed in the dashboard
        const contentPublishedMetric = testEnvironment.peopleDashboard.contentPublished;
        await contentPublishedMetric.verifyUIDataMatchesWithSnowflakeData(contentPublishedData);
      }
    );

    test(
      'verify Content Published CSV download and validation with default period filter (Last 30 days)',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, '@content-published-csv'],
      },
      async () => {
        tagTest(test.info(), {
          description: 'TS To verify CSV download and validation for Content published in People Dashboard',
          zephyrTestId: 'DE-25883',
          storyId: 'DE-25908',
        });

        const { peopleQueryHelper } = testEnvironment;

        // Get expected data from Snowflake with filters applied
        const contentPublishedData = await peopleQueryHelper.getContentPublishedDataFromDBWithFilters({
          filterBy: testFiltersConfig,
        });

        // Verify the same data is displayed in the dashboard
        const contentPublishedMetric = testEnvironment.peopleDashboard.contentPublished;
        await contentPublishedMetric.verifyUIDataMatchesWithSnowflakeData(contentPublishedData);

        // Download CSV and validate against Snowflake data
        const { filePath, fileName } = await contentPublishedMetric.downloadAndValidateContentPublishedCSV(
          contentPublishedData,
          testFiltersConfig.timePeriod
        );

        console.log(`CSV downloaded successfully: ${fileName} at ${filePath}`);
      }
    );

    test(
      'verify Favorites Received tabular data validation with default period filter (Last 30 days)',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, '@favorites-received'],
      },
      async () => {
        tagTest(test.info(), {
          description: 'TS To verify the answer Favorites received in People Dashboard',
          zephyrTestId: 'DE-25874',
          storyId: 'DE-25568',
        });

        const { peopleQueryHelper } = testEnvironment;

        // Get expected data from Snowflake with filters applied
        const favoritesReceivedData = await peopleQueryHelper.getFavoritesReceivedDataFromDBWithFilters({
          filterBy: testFiltersConfig,
        });

        // Verify the same data is displayed in the dashboard
        const favoritesReceivedMetric = testEnvironment.peopleDashboard.favoritesReceived;
        await favoritesReceivedMetric.verifyUIDataMatchesWithSnowflakeData(favoritesReceivedData);
      }
    );

    test(
      'verify Favorites Received CSV download and validation with default period filter (Last 30 days)',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, '@favorites-received-csv'],
      },
      async () => {
        tagTest(test.info(), {
          description: 'TS To verify CSV download and validation for Favorites received in People Dashboard',
          zephyrTestId: 'DE-25884',
          storyId: 'DE-25911',
        });

        const { peopleQueryHelper } = testEnvironment;

        // Get expected data from Snowflake with filters applied
        const favoritesReceivedData = await peopleQueryHelper.getFavoritesReceivedDataFromDBWithFilters({
          filterBy: testFiltersConfig,
        });

        // Verify the same data is displayed in the dashboard
        const favoritesReceivedMetric = testEnvironment.peopleDashboard.favoritesReceived;
        await favoritesReceivedMetric.verifyUIDataMatchesWithSnowflakeData(favoritesReceivedData);

        // Download CSV and validate against Snowflake data
        const { filePath, fileName } = await favoritesReceivedMetric.downloadAndValidateFavoritesReceivedCSV(
          favoritesReceivedData,
          testFiltersConfig.timePeriod
        );

        console.log(`CSV downloaded successfully: ${fileName} at ${filePath}`);
      }
    );

    test(
      'verify Reactions Made tabular data validation with default period filter (Last 30 days)',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, '@reactions-made'],
      },
      async () => {
        tagTest(test.info(), {
          description: 'TS To verify the answer Reactions made in People Dashboard',
          zephyrTestId: 'DE-25875',
          storyId: 'DE-25762',
        });

        const { peopleQueryHelper } = testEnvironment;

        // Get expected data from Snowflake with filters applied
        const reactionsMadeData = await peopleQueryHelper.getReactionsMadeDataFromDBWithFilters({
          filterBy: testFiltersConfig,
        });

        // Verify the same data is displayed in the dashboard
        const reactionsMadeMetric = testEnvironment.peopleDashboard.reactionsMade;
        await reactionsMadeMetric.verifyUIDataMatchesWithSnowflakeData(reactionsMadeData);
      }
    );

    test(
      'verify Reactions Made CSV download and validation with default period filter (Last 30 days)',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, '@reactions-made-csv'],
      },
      async () => {
        tagTest(test.info(), {
          description: 'TS To verify CSV download and validation for Reactions made in People Dashboard',
          zephyrTestId: 'DE-25885',
          storyId: 'DE-25909',
        });

        const { peopleQueryHelper } = testEnvironment;

        // Get expected data from Snowflake with filters applied
        const reactionsMadeData = await peopleQueryHelper.getReactionsMadeDataFromDBWithFilters({
          filterBy: testFiltersConfig,
        });

        // Verify the same data is displayed in the dashboard
        const reactionsMadeMetric = testEnvironment.peopleDashboard.reactionsMade;
        await reactionsMadeMetric.verifyUIDataMatchesWithSnowflakeData(reactionsMadeData);

        // Download CSV and validate against Snowflake data
        const { filePath, fileName } = await reactionsMadeMetric.downloadAndValidateReactionsMadeCSV(
          reactionsMadeData,
          testFiltersConfig.timePeriod
        );

        console.log(`CSV downloaded successfully: ${fileName} at ${filePath}`);
      }
    );

    test(
      'verify Reactions Received tabular data validation with default period filter (Last 30 days)',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, '@reactions-received'],
      },
      async () => {
        tagTest(test.info(), {
          description: 'TS To verify the answer Reactions received in People Dashboard',
          zephyrTestId: 'DE-25876',
          storyId: 'DE-25763',
        });

        const { peopleQueryHelper } = testEnvironment;

        // Get expected data from Snowflake with filters applied
        const reactionsReceivedData = await peopleQueryHelper.getReactionsReceivedDataFromDBWithFilters({
          filterBy: testFiltersConfig,
        });

        // Verify the same data is displayed in the dashboard
        const reactionsReceivedMetric = testEnvironment.peopleDashboard.reactionsReceived;
        await reactionsReceivedMetric.verifyUIDataMatchesWithSnowflakeData(reactionsReceivedData);
      }
    );

    test(
      'verify Reactions Received CSV download and validation with default period filter (Last 30 days)',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, '@reactions-received-csv'],
      },
      async () => {
        tagTest(test.info(), {
          description: 'TS To verify CSV download and validation for Reactions received in People Dashboard',
          zephyrTestId: 'DE-25886',
          storyId: 'DE-25914',
        });

        const { peopleQueryHelper } = testEnvironment;

        // Get expected data from Snowflake with filters applied
        const reactionsReceivedData = await peopleQueryHelper.getReactionsReceivedDataFromDBWithFilters({
          filterBy: testFiltersConfig,
        });

        // Verify the same data is displayed in the dashboard
        const reactionsReceivedMetric = testEnvironment.peopleDashboard.reactionsReceived;
        await reactionsReceivedMetric.verifyUIDataMatchesWithSnowflakeData(reactionsReceivedData);

        // Download CSV and validate against Snowflake data
        const { filePath, fileName } = await reactionsReceivedMetric.downloadAndValidateReactionsReceivedCSV(
          reactionsReceivedData,
          testFiltersConfig.timePeriod
        );

        console.log(`CSV downloaded successfully: ${fileName} at ${filePath}`);
      }
    );

    test(
      'verify Feed Posts and Content Comments tabular data validation with default period filter (Last 30 days)',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, '@feed-posts-comments'],
      },
      async () => {
        tagTest(test.info(), {
          description: 'TS To verify the answer Feed posts and content comments in People Dashboard',
          zephyrTestId: 'DE-25877',
          storyId: 'DE-25764',
        });

        const { peopleQueryHelper } = testEnvironment;

        // Get expected data from Snowflake with filters applied
        const feedPostsAndCommentsData = await peopleQueryHelper.getFeedPostsAndCommentsDataFromDBWithFilters({
          filterBy: testFiltersConfig,
        });

        // Verify the same data is displayed in the dashboard
        const feedPostsAndCommentsMetric = testEnvironment.peopleDashboard.feedPostsAndComments;
        await feedPostsAndCommentsMetric.verifyUIDataMatchesWithSnowflakeData(feedPostsAndCommentsData);
      }
    );

    test(
      'verify Feed Posts and Content Comments CSV download and validation with default period filter (Last 30 days)',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, '@feed-posts-comments-csv'],
      },
      async () => {
        tagTest(test.info(), {
          description:
            'TS To verify CSV download and validation for Feed posts and content comments in People Dashboard',
          zephyrTestId: 'DE-25887',
          storyId: 'DE-25910',
        });

        const { peopleQueryHelper } = testEnvironment;

        // Get expected data from Snowflake with filters applied
        const feedPostsAndCommentsData = await peopleQueryHelper.getFeedPostsAndCommentsDataFromDBWithFilters({
          filterBy: testFiltersConfig,
        });

        // Verify the same data is displayed in the dashboard
        const feedPostsAndCommentsMetric = testEnvironment.peopleDashboard.feedPostsAndComments;
        await feedPostsAndCommentsMetric.verifyUIDataMatchesWithSnowflakeData(feedPostsAndCommentsData);

        // Download CSV and validate against Snowflake data
        const { filePath, fileName } = await feedPostsAndCommentsMetric.downloadAndValidateFeedPostsAndCommentsCSV(
          feedPostsAndCommentsData,
          testFiltersConfig.timePeriod
        );

        console.log(`CSV downloaded successfully: ${fileName} at ${filePath}`);
      }
    );

    test(
      'verify Replies tabular data validation with default period filter (Last 30 days)',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, '@replies'],
      },
      async () => {
        tagTest(test.info(), {
          description: 'TS To verify the answer Replies in People Dashboard',
          zephyrTestId: 'DE-25878',
          storyId: 'DE-25765',
        });

        const { peopleQueryHelper } = testEnvironment;

        // Get expected data from Snowflake with filters applied
        const repliesData = await peopleQueryHelper.getRepliesDataFromDBWithFilters({
          filterBy: testFiltersConfig,
        });

        // Verify the same data is displayed in the dashboard
        const repliesMetric = testEnvironment.peopleDashboard.replies;
        await repliesMetric.verifyUIDataMatchesWithSnowflakeData(repliesData);
      }
    );

    test(
      'verify Replies CSV download and validation with default period filter (Last 30 days)',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, '@replies-csv'],
      },
      async () => {
        tagTest(test.info(), {
          description: 'TS To verify CSV download and validation for Replies in People Dashboard',
          zephyrTestId: 'DE-25889',
          storyId: 'DE-25915',
        });

        const { peopleQueryHelper } = testEnvironment;

        // Get expected data from Snowflake with filters applied
        const repliesData = await peopleQueryHelper.getRepliesDataFromDBWithFilters({
          filterBy: testFiltersConfig,
        });

        // Verify the same data is displayed in the dashboard
        const repliesMetric = testEnvironment.peopleDashboard.replies;
        await repliesMetric.verifyUIDataMatchesWithSnowflakeData(repliesData);

        // Download CSV and validate against Snowflake data
        const { filePath, fileName } = await repliesMetric.downloadAndValidateRepliesCSV(
          repliesData,
          testFiltersConfig.timePeriod
        );

        console.log(`CSV downloaded successfully: ${fileName} at ${filePath}`);
      }
    );

    test(
      'verify Replies from Other Users tabular data validation with default period filter (Last 30 days)',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, '@replies-from-other-users'],
      },
      async () => {
        tagTest(test.info(), {
          description: 'TS To verify the answer Replies from other users in People Dashboard',
          zephyrTestId: 'DE-25879',
          storyId: 'DE-25770',
        });

        const { peopleQueryHelper } = testEnvironment;

        // Get expected data from Snowflake with filters applied
        const repliesFromOtherUsersData = await peopleQueryHelper.getRepliesFromOtherUsersDataFromDBWithFilters({
          filterBy: testFiltersConfig,
        });

        // Verify the same data is displayed in the dashboard
        const repliesFromOtherUsersMetric = testEnvironment.peopleDashboard.repliesFromOtherUsers;
        await repliesFromOtherUsersMetric.verifyUIDataMatchesWithSnowflakeData(repliesFromOtherUsersData);
      }
    );

    test(
      'verify Replies from Other Users CSV download and validation with default period filter (Last 30 days)',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, '@replies-from-other-users-csv'],
      },
      async () => {
        tagTest(test.info(), {
          description: 'TS To verify CSV download and validation for Replies from other users in People Dashboard',
          zephyrTestId: 'DE-25891',
          storyId: 'DE-25913',
        });

        const { peopleQueryHelper } = testEnvironment;

        // Get expected data from Snowflake with filters applied
        const repliesFromOtherUsersData = await peopleQueryHelper.getRepliesFromOtherUsersDataFromDBWithFilters({
          filterBy: testFiltersConfig,
        });

        // Verify the same data is displayed in the dashboard
        const repliesFromOtherUsersMetric = testEnvironment.peopleDashboard.repliesFromOtherUsers;
        await repliesFromOtherUsersMetric.verifyUIDataMatchesWithSnowflakeData(repliesFromOtherUsersData);

        // Download CSV and validate against Snowflake data
        const { filePath, fileName } = await repliesFromOtherUsersMetric.downloadAndValidateRepliesFromOtherUsersCSV(
          repliesFromOtherUsersData,
          testFiltersConfig.timePeriod
        );

        console.log(`CSV downloaded successfully: ${fileName} at ${filePath}`);
      }
    );

    test(
      'verify Shares Received tabular data validation with default period filter (Last 30 days)',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, '@shares-received'],
      },
      async () => {
        tagTest(test.info(), {
          description: 'TS To verify the answer Shares received in People Dashboard',
          zephyrTestId: 'DE-25880',
          storyId: 'DE-25771',
        });

        const { peopleQueryHelper } = testEnvironment;

        // Get expected data from Snowflake with filters applied
        const sharesReceivedData = await peopleQueryHelper.getSharesReceivedDataFromDBWithFilters({
          filterBy: testFiltersConfig,
        });

        // Verify the same data is displayed in the dashboard
        const sharesReceivedMetric = testEnvironment.peopleDashboard.sharesReceived;
        await sharesReceivedMetric.verifyUIDataMatchesWithSnowflakeData(sharesReceivedData);
      }
    );

    test(
      'verify Shares Received CSV download and validation with default period filter (Last 30 days)',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, '@shares-received-csv'],
      },
      async () => {
        tagTest(test.info(), {
          description: 'TS To verify CSV download and validation for Shares received in People Dashboard',
          zephyrTestId: 'DE-25892',
          storyId: 'DE-25916',
        });

        const { peopleQueryHelper } = testEnvironment;

        // Get expected data from Snowflake with filters applied
        const sharesReceivedData = await peopleQueryHelper.getSharesReceivedDataFromDBWithFilters({
          filterBy: testFiltersConfig,
        });

        // Verify the same data is displayed in the dashboard
        const sharesReceivedMetric = testEnvironment.peopleDashboard.sharesReceived;
        await sharesReceivedMetric.verifyUIDataMatchesWithSnowflakeData(sharesReceivedData);

        // Download CSV and validate against Snowflake data
        const { filePath, fileName } = await sharesReceivedMetric.downloadAndValidateSharesReceivedCSV(
          sharesReceivedData,
          testFiltersConfig.timePeriod
        );

        console.log(`CSV downloaded successfully: ${fileName} at ${filePath}`);
      }
    );

    test(
      'verify Profile Views tabular data validation with default period filter (Last 30 days)',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, '@profile-views'],
      },
      async () => {
        tagTest(test.info(), {
          description: 'TS To verify the answer Profile views in People Dashboard',
          zephyrTestId: 'DE-25881',
          storyId: 'DE-25772',
        });

        const { peopleQueryHelper } = testEnvironment;

        // Get expected data from Snowflake with filters applied
        const profileViewsData = await peopleQueryHelper.getProfileViewsDataFromDBWithFilters({
          filterBy: testFiltersConfig,
        });

        // Verify the same data is displayed in the dashboard
        const profileViewsMetric = testEnvironment.peopleDashboard.profileViews;
        await profileViewsMetric.verifyUIDataMatchesWithSnowflakeData(profileViewsData);
      }
    );

    test(
      'verify Profile Views CSV download and validation with default period filter (Last 30 days)',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, '@profile-views-csv'],
      },
      async () => {
        tagTest(test.info(), {
          description: 'TS To verify CSV download and validation for Profile views in People Dashboard',
          zephyrTestId: 'DE-25893',
          storyId: 'DE-25912',
        });

        const { peopleQueryHelper } = testEnvironment;

        // Get expected data from Snowflake with filters applied
        const profileViewsData = await peopleQueryHelper.getProfileViewsDataFromDBWithFilters({
          filterBy: testFiltersConfig,
        });

        // Verify the same data is displayed in the dashboard
        const profileViewsMetric = testEnvironment.peopleDashboard.profileViews;
        await profileViewsMetric.verifyUIDataMatchesWithSnowflakeData(profileViewsData);

        // Download CSV and validate against Snowflake data
        const { filePath, fileName } = await profileViewsMetric.downloadAndValidateProfileViewsCSV(
          profileViewsData,
          testFiltersConfig.timePeriod
        );

        console.log(`CSV downloaded successfully: ${fileName} at ${filePath}`);
      }
    );

    test(
      'verify Profile Completeness tabular data validation (time-independent)',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, '@profile-completeness'],
      },
      async () => {
        tagTest(test.info(), {
          description: 'TS To verify the answer Profile completeness in People Dashboard',
          zephyrTestId: 'DE-25882',
          storyId: 'DE-25907',
        });

        const { peopleQueryHelper } = testEnvironment;

        // Get expected data from Snowflake (no time filter for this metric)
        const profileCompletenessData = await peopleQueryHelper.getProfileCompletenessDataFromDB();

        // Verify the same data is displayed in the dashboard
        const profileCompletenessMetric = testEnvironment.peopleDashboard.profileCompleteness;
        await profileCompletenessMetric.verifyUIDataMatchesWithSnowflakeData(profileCompletenessData);
      }
    );

    test(
      'verify Profile Completeness CSV download and validation (time-independent)',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, '@profile-completeness-csv'],
      },
      async () => {
        // Skip execution via env flag to satisfy linter
        if (process.env.SKIP_PROFILE_COMPLETENESS_CSV === '1') return;

        tagTest(test.info(), {
          description: 'TS To verify CSV download and validation for Profile completeness in People Dashboard',
          zephyrTestId: 'DE-25894',
          storyId: 'DE-25917',
        });

        const { peopleQueryHelper } = testEnvironment;

        const profileCompletenessUserLevelData = await peopleQueryHelper.getProfileCompletenessUserLevelDataFromDB();
        const tenantDetails = await peopleQueryHelper.getTenantDetails();

        const profileCompletenessMetric = testEnvironment.peopleDashboard.profileCompleteness;
        const { filePath, fileName } = await profileCompletenessMetric.downloadAndValidateProfileCompletenessCSV(
          profileCompletenessUserLevelData,
          testFiltersConfig.timePeriod,
          tenantDetails
        );

        console.log(`CSV downloaded successfully: ${fileName} at ${filePath}`);
      }
    );
  }
);
