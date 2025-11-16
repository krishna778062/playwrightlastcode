import { DataEngineeringTestSuite } from '@data-engineering/constants/testSuite';
import { Page, test } from '@playwright/test';

import { TestPriority } from '@core/constants/testPriority';
import { TestGroupType } from '@core/constants/testType';
import { tagTest } from '@core/utils/testDecorator';

import { PeriodFilterTimeRange } from '../../../constants/periodFilterTimeRange';
import { PeopleDashboardQueryHelper, SnowflakeHelper } from '../../../helpers';
import { FilterOptions } from '../../../helpers/baseAnalyticsQueryHelper';
import { DateHelper } from '../../../helpers/dateHelper';
import { PeopleDashboard } from '../../../ui/dashboards/people/peopleDashboard';

import {
  cleanupDashboardTesting,
  setupPeopleDashboardForTest,
  UserRole,
} from '@/src/modules/data-engineering/helpers/dashboardSetupHelper';

test.describe(
  'people dashboard - Custom Period Filter Impact Validation',
  {
    tag: [DataEngineeringTestSuite.PEOPLE, '@period-filter-impact', '@custom-period'],
  },
  () => {
    // Dynamic custom date range
    const customDateRange = DateHelper.createTestCustomDateRange();

    let testEnvironment: {
      page: Page;
      peopleDashboard: PeopleDashboard;
      peopleQueryHelper: PeopleDashboardQueryHelper;
      snowflakeHelper: SnowflakeHelper;
    };
    let testFiltersConfig: FilterOptions;

    test.beforeAll('Setup People Dashboard with custom period filter', async ({ browser }) => {
      testEnvironment = await setupPeopleDashboardForTest(browser, UserRole.APP_MANAGER);

      testFiltersConfig = {
        tenantCode: process.env.ORG_ID!,
        timePeriod: PeriodFilterTimeRange.CUSTOM,
        customStartDate: customDateRange.startDate,
        customEndDate: customDateRange.endDate,
      };

      const { analyticsFiltersComponent } = testEnvironment.peopleDashboard;
      await analyticsFiltersComponent.applyFiltersFromConfig(testFiltersConfig);
    });

    test.afterAll('Cleanup People Dashboard', async () => {
      await cleanupDashboardTesting(testEnvironment);
    });

    test(
      'verify Total Users metric data validation - custom date range',
      { tag: [TestPriority.P0, TestGroupType.SMOKE, '@total-users', '@custom-period'] },
      async () => {
        tagTest(test.info(), {
          description: 'To verify the answer Total users in People dashboard responds to custom period',
          zephyrTestId: 'DE-25869',
          storyId: 'DE-24673',
        });

        const { peopleQueryHelper } = testEnvironment;
        const expectedMetricValue = await peopleQueryHelper.getTotalUsersDataFromDBWithFilters({
          filterBy: testFiltersConfig,
        });

        const totalUsersMetric = testEnvironment.peopleDashboard.totalUsers;
        await totalUsersMetric.verifyMetricValue(expectedMetricValue);
      }
    );

    test(
      'verify Departments metric data validation - custom date range',
      { tag: [TestPriority.P0, TestGroupType.SMOKE, '@departments', '@custom-period'] },
      async () => {
        tagTest(test.info(), {
          description: 'To verify the answer Departments in People dashboard',
          zephyrTestId: 'DE-25870',
          storyId: 'DE-24669',
        });

        const { peopleQueryHelper } = testEnvironment;
        const expectedMetricValue = await peopleQueryHelper.getDepartmentsCountDataFromDBWithFilters({
          filterBy: testFiltersConfig,
        });

        const departmentsMetric = testEnvironment.peopleDashboard.totalDepartments;
        await departmentsMetric.verifyMetricIsLoaded();
        await departmentsMetric.verifyMetricValue(expectedMetricValue);
      }
    );

    test(
      'verify Locations metric data validation - custom date range',
      { tag: [TestPriority.P0, TestGroupType.SMOKE, '@locations', '@custom-period'] },
      async () => {
        tagTest(test.info(), {
          description: 'To verify the answer Location in People dashboard',
          zephyrTestId: 'DE-25871',
          storyId: 'DE-25569',
        });

        const { peopleQueryHelper } = testEnvironment;
        const expectedMetricValue = await peopleQueryHelper.getLocationsCountDataFromDBWithFilters({
          filterBy: testFiltersConfig,
        });

        const locationsMetric = testEnvironment.peopleDashboard.totalLocations;
        await locationsMetric.verifyMetricIsLoaded();
        await locationsMetric.verifyMetricValue(expectedMetricValue);
      }
    );

    test(
      'verify User Category metric data validation - custom date range',
      { tag: [TestPriority.P0, TestGroupType.SMOKE, '@user-category', '@custom-period'] },
      async () => {
        tagTest(test.info(), {
          description: 'To verify the answer User Category in People dashboard',
          zephyrTestId: 'DE-25872',
          storyId: 'DE-25560',
        });

        const { peopleQueryHelper } = testEnvironment;
        const expectedMetricValue = await peopleQueryHelper.getUserCategoryCountDataFromDBWithFilters({
          filterBy: testFiltersConfig,
        });

        const userCategoryMetric = testEnvironment.peopleDashboard.totalUserCategories;
        await userCategoryMetric.verifyMetricIsLoaded();
        await userCategoryMetric.verifyMetricValue(expectedMetricValue);
      }
    );

    test(
      'verify Content Published tabular data validation - custom date range',
      { tag: [TestPriority.P0, TestGroupType.SMOKE, '@content-published', '@custom-period'] },
      async () => {
        tagTest(test.info(), {
          description: 'To verify the answer Content published in People dashboard',
          zephyrTestId: 'DE-25873',
          storyId: 'DE-25561',
        });

        const { peopleQueryHelper } = testEnvironment;

        const contentPublishedData = await peopleQueryHelper.getContentPublishedDataFromDBWithFilters({
          filterBy: testFiltersConfig,
        });

        const contentPublishedMetric = testEnvironment.peopleDashboard.contentPublished;
        await contentPublishedMetric.verifyUIDataMatchesWithSnowflakeData(contentPublishedData);
      }
    );

    test(
      'verify Favorites Received tabular data validation - custom date range',
      { tag: [TestPriority.P0, TestGroupType.SMOKE, '@favorites-received', '@custom-period'] },
      async () => {
        tagTest(test.info(), {
          description: 'To verify the answer Favorites received in People dashboard',
          zephyrTestId: 'DE-25874',
          storyId: 'DE-25568',
        });

        const { peopleQueryHelper } = testEnvironment;
        const favoritesReceivedData = await peopleQueryHelper.getFavoritesReceivedDataFromDBWithFilters({
          filterBy: testFiltersConfig,
        });

        const favoritesReceivedMetric = testEnvironment.peopleDashboard.favoritesReceived;
        await favoritesReceivedMetric.verifyUIDataMatchesWithSnowflakeData(favoritesReceivedData);
      }
    );

    test(
      'verify Favorites Received CSV download and validation - custom date range',
      { tag: [TestPriority.P0, TestGroupType.SMOKE, '@favorites-received-csv', '@custom-period'] },
      async () => {
        tagTest(test.info(), {
          description: 'TS To verify CSV download and validation for Favorites received in People Dashboard',
          zephyrTestId: 'DE-25884',
          storyId: 'DE-25911',
        });

        const { peopleQueryHelper } = testEnvironment;
        const favoritesReceivedData = await peopleQueryHelper.getFavoritesReceivedDataFromDBWithFilters({
          filterBy: testFiltersConfig,
        });

        const favoritesReceivedMetric = testEnvironment.peopleDashboard.favoritesReceived;
        const { filePath, fileName } = await favoritesReceivedMetric.downloadAndValidateFavoritesReceivedCSV(
          favoritesReceivedData,
          PeriodFilterTimeRange.CUSTOM,
          { customStartDate: customDateRange.startDate, customEndDate: customDateRange.endDate }
        );
        console.log(`CSV downloaded successfully: ${fileName} at ${filePath}`);
      }
    );

    test(
      'verify Reactions Made tabular data validation - custom date range',
      { tag: [TestPriority.P0, TestGroupType.SMOKE, '@reactions-made', '@custom-period'] },
      async () => {
        tagTest(test.info(), {
          description: 'To verify the answer Reactions made in People dashboard',
          zephyrTestId: 'DE-25875',
          storyId: 'DE-25762',
        });

        const { peopleQueryHelper } = testEnvironment;
        const reactionsMadeData = await peopleQueryHelper.getReactionsMadeDataFromDBWithFilters({
          filterBy: testFiltersConfig,
        });

        const reactionsMadeMetric = testEnvironment.peopleDashboard.reactionsMade;
        await reactionsMadeMetric.verifyUIDataMatchesWithSnowflakeData(reactionsMadeData);
      }
    );

    test(
      'verify Reactions Made CSV download and validation - custom date range',
      { tag: [TestPriority.P0, TestGroupType.SMOKE, '@reactions-made-csv', '@custom-period'] },
      async () => {
        tagTest(test.info(), {
          description: 'TS To verify CSV download and validation for Reactions made in People Dashboard',
          zephyrTestId: 'DE-25885',
          storyId: 'DE-25909',
        });

        const { peopleQueryHelper } = testEnvironment;
        const reactionsMadeData = await peopleQueryHelper.getReactionsMadeDataFromDBWithFilters({
          filterBy: testFiltersConfig,
        });

        const reactionsMadeMetric = testEnvironment.peopleDashboard.reactionsMade;
        const { filePath, fileName } = await reactionsMadeMetric.downloadAndValidateReactionsMadeCSV(
          reactionsMadeData,
          PeriodFilterTimeRange.CUSTOM,
          { customStartDate: customDateRange.startDate, customEndDate: customDateRange.endDate }
        );
        console.log(`CSV downloaded successfully: ${fileName} at ${filePath}`);
      }
    );

    test(
      'verify Reactions Received tabular data validation - custom date range',
      { tag: [TestPriority.P0, TestGroupType.SMOKE, '@reactions-received', '@custom-period'] },
      async () => {
        tagTest(test.info(), {
          description: 'To verify the answer Reactions received in People dashboard',
          zephyrTestId: 'DE-25876',
          storyId: 'DE-25763',
        });

        const { peopleQueryHelper } = testEnvironment;
        const reactionsReceivedData = await peopleQueryHelper.getReactionsReceivedDataFromDBWithFilters({
          filterBy: testFiltersConfig,
        });

        const reactionsReceivedMetric = testEnvironment.peopleDashboard.reactionsReceived;
        await reactionsReceivedMetric.verifyUIDataMatchesWithSnowflakeData(reactionsReceivedData);
      }
    );

    test(
      'verify Reactions Received CSV download and validation - custom date range',
      { tag: [TestPriority.P0, TestGroupType.SMOKE, '@reactions-received-csv', '@custom-period'] },
      async () => {
        tagTest(test.info(), {
          description: 'TS To verify CSV download and validation for Reactions received in People Dashboard',
          zephyrTestId: 'DE-25886',
          storyId: 'DE-25914',
        });

        const { peopleQueryHelper } = testEnvironment;
        const reactionsReceivedData = await peopleQueryHelper.getReactionsReceivedDataFromDBWithFilters({
          filterBy: testFiltersConfig,
        });

        const reactionsReceivedMetric = testEnvironment.peopleDashboard.reactionsReceived;
        const { filePath, fileName } = await reactionsReceivedMetric.downloadAndValidateReactionsReceivedCSV(
          reactionsReceivedData,
          PeriodFilterTimeRange.CUSTOM,
          { customStartDate: customDateRange.startDate, customEndDate: customDateRange.endDate }
        );
        console.log(`CSV downloaded successfully: ${fileName} at ${filePath}`);
      }
    );

    test(
      'verify Feed Posts and Content Comments tabular data validation - custom date range',
      { tag: [TestPriority.P0, TestGroupType.SMOKE, '@feed-posts-comments', '@custom-period'] },
      async () => {
        tagTest(test.info(), {
          description: 'To verify the answer Feed posts and content comments in People dashboard',
          zephyrTestId: 'DE-25877',
          storyId: 'DE-25764',
        });

        const { peopleQueryHelper } = testEnvironment;
        const feedPostsAndCommentsData = await peopleQueryHelper.getFeedPostsAndCommentsDataFromDBWithFilters({
          filterBy: testFiltersConfig,
        });

        const feedPostsAndCommentsMetric = testEnvironment.peopleDashboard.feedPostsAndComments;
        await feedPostsAndCommentsMetric.verifyUIDataMatchesWithSnowflakeData(feedPostsAndCommentsData);
      }
    );

    test(
      'verify Feed Posts and Content Comments CSV download and validation - custom date range',
      { tag: [TestPriority.P0, TestGroupType.SMOKE, '@feed-posts-comments-csv', '@custom-period'] },
      async () => {
        tagTest(test.info(), {
          description:
            'TS To verify CSV download and validation for Feed posts and content comments in People Dashboard',
          zephyrTestId: 'DE-25887',
          storyId: 'DE-25910',
        });

        const { peopleQueryHelper } = testEnvironment;
        const feedPostsAndCommentsData = await peopleQueryHelper.getFeedPostsAndCommentsDataFromDBWithFilters({
          filterBy: testFiltersConfig,
        });

        const feedPostsAndCommentsMetric = testEnvironment.peopleDashboard.feedPostsAndComments;
        const { filePath, fileName } = await feedPostsAndCommentsMetric.downloadAndValidateFeedPostsAndCommentsCSV(
          feedPostsAndCommentsData,
          PeriodFilterTimeRange.CUSTOM,
          { customStartDate: customDateRange.startDate, customEndDate: customDateRange.endDate }
        );
        console.log(`CSV downloaded successfully: ${fileName} at ${filePath}`);
      }
    );

    test(
      'verify Replies tabular data validation - custom date range',
      { tag: [TestPriority.P0, TestGroupType.SMOKE, '@replies', '@custom-period'] },
      async () => {
        tagTest(test.info(), {
          description: 'To verify the answer Replies in People dashboard',
          zephyrTestId: 'DE-25878',
          storyId: 'DE-25765',
        });

        const { peopleQueryHelper } = testEnvironment;
        const repliesData = await peopleQueryHelper.getRepliesDataFromDBWithFilters({
          filterBy: testFiltersConfig,
        });

        const repliesMetric = testEnvironment.peopleDashboard.replies;
        await repliesMetric.verifyUIDataMatchesWithSnowflakeData(repliesData);
      }
    );

    test(
      'verify Replies CSV download and validation - custom date range',
      { tag: [TestPriority.P0, TestGroupType.SMOKE, '@replies-csv', '@custom-period'] },
      async () => {
        tagTest(test.info(), {
          description: 'TS To verify CSV download and validation for Replies in People Dashboard',
          zephyrTestId: 'DE-25889',
          storyId: 'DE-25915',
        });

        const { peopleQueryHelper } = testEnvironment;
        const repliesData = await peopleQueryHelper.getRepliesDataFromDBWithFilters({
          filterBy: testFiltersConfig,
        });

        const repliesMetric = testEnvironment.peopleDashboard.replies;
        const { filePath, fileName } = await repliesMetric.downloadAndValidateRepliesCSV(
          repliesData,
          PeriodFilterTimeRange.CUSTOM,
          { customStartDate: customDateRange.startDate, customEndDate: customDateRange.endDate }
        );
        console.log(`CSV downloaded successfully: ${fileName} at ${filePath}`);
      }
    );

    test(
      'verify Replies from Other Users tabular data validation - custom date range',
      { tag: [TestPriority.P0, TestGroupType.SMOKE, '@replies-from-other-users', '@custom-period'] },
      async () => {
        tagTest(test.info(), {
          description: 'To verify the answer Replies from other users in People dashboard',
          zephyrTestId: 'DE-25879',
          storyId: 'DE-25770',
        });

        const { peopleQueryHelper } = testEnvironment;
        const repliesFromOtherUsersData = await peopleQueryHelper.getRepliesFromOtherUsersDataFromDBWithFilters({
          filterBy: testFiltersConfig,
        });

        const repliesFromOtherUsersMetric = testEnvironment.peopleDashboard.repliesFromOtherUsers;
        await repliesFromOtherUsersMetric.verifyUIDataMatchesWithSnowflakeData(repliesFromOtherUsersData);
      }
    );

    test(
      'verify Replies from Other Users CSV download and validation - custom date range',
      { tag: [TestPriority.P0, TestGroupType.SMOKE, '@replies-from-other-users-csv', '@custom-period'] },
      async () => {
        tagTest(test.info(), {
          description: 'TS To verify CSV download and validation for Replies from other users in People Dashboard',
          zephyrTestId: 'DE-25891',
          storyId: 'DE-25913',
        });

        const { peopleQueryHelper } = testEnvironment;
        const repliesFromOtherUsersData = await peopleQueryHelper.getRepliesFromOtherUsersDataFromDBWithFilters({
          filterBy: testFiltersConfig,
        });

        const metric = testEnvironment.peopleDashboard.repliesFromOtherUsers;
        const { filePath, fileName } = await metric.downloadAndValidateRepliesFromOtherUsersCSV(
          repliesFromOtherUsersData,
          PeriodFilterTimeRange.CUSTOM,
          { customStartDate: customDateRange.startDate, customEndDate: customDateRange.endDate }
        );
        console.log(`CSV downloaded successfully: ${fileName} at ${filePath}`);
      }
    );

    test(
      'verify Shares Received tabular data validation - custom date range',
      { tag: [TestPriority.P0, TestGroupType.SMOKE, '@shares-received', '@custom-period'] },
      async () => {
        tagTest(test.info(), {
          description: 'To verify the answer Shares received in People dashboard',
          zephyrTestId: 'DE-25880',
          storyId: 'DE-25771',
        });

        const { peopleQueryHelper } = testEnvironment;
        const sharesReceivedData = await peopleQueryHelper.getSharesReceivedDataFromDBWithFilters({
          filterBy: testFiltersConfig,
        });

        const sharesReceivedMetric = testEnvironment.peopleDashboard.sharesReceived;
        await sharesReceivedMetric.verifyUIDataMatchesWithSnowflakeData(sharesReceivedData);
      }
    );

    test(
      'verify Profile Views tabular data validation - custom date range',
      { tag: [TestPriority.P0, TestGroupType.SMOKE, '@profile-views', '@custom-period'] },
      async () => {
        tagTest(test.info(), {
          description: 'To verify the answer Profile views in People dashboard',
          zephyrTestId: 'DE-25881',
          storyId: 'DE-25772',
        });

        const { peopleQueryHelper } = testEnvironment;
        const profileViewsData = await peopleQueryHelper.getProfileViewsDataFromDBWithFilters({
          filterBy: testFiltersConfig,
        });

        const profileViewsMetric = testEnvironment.peopleDashboard.profileViews;
        await profileViewsMetric.verifyUIDataMatchesWithSnowflakeData(profileViewsData);
      }
    );

    test(
      'verify Profile Views CSV download and validation - custom date range',
      { tag: [TestPriority.P0, TestGroupType.SMOKE, '@profile-views-csv', '@custom-period'] },
      async () => {
        tagTest(test.info(), {
          description: 'TS To verify CSV download and validation for Profile views in People Dashboard',
          zephyrTestId: 'DE-25893',
          storyId: 'DE-25912',
        });

        const { peopleQueryHelper } = testEnvironment;
        const profileViewsData = await peopleQueryHelper.getProfileViewsDataFromDBWithFilters({
          filterBy: testFiltersConfig,
        });

        const profileViewsMetric = testEnvironment.peopleDashboard.profileViews;
        const { filePath, fileName } = await profileViewsMetric.downloadAndValidateProfileViewsCSV(
          profileViewsData,
          PeriodFilterTimeRange.CUSTOM,
          { customStartDate: customDateRange.startDate, customEndDate: customDateRange.endDate }
        );
        console.log(`CSV downloaded successfully: ${fileName} at ${filePath}`);
      }
    );
    test(
      'verify Content Published CSV download and validation - custom date range',
      { tag: [TestPriority.P0, TestGroupType.SMOKE, '@content-published-csv', '@custom-period'] },
      async () => {
        tagTest(test.info(), {
          description: 'TS To verify CSV download and validation for Content published in People Dashboard',
          zephyrTestId: 'DE-25883',
          storyId: 'DE-25908',
        });

        const { peopleQueryHelper } = testEnvironment;

        const contentPublishedData = await peopleQueryHelper.getContentPublishedDataFromDBWithFilters({
          filterBy: testFiltersConfig,
        });

        const contentPublishedMetric = testEnvironment.peopleDashboard.contentPublished;
        const { filePath, fileName } = await contentPublishedMetric.downloadAndValidateContentPublishedCSV(
          contentPublishedData,
          PeriodFilterTimeRange.CUSTOM,
          { customStartDate: customDateRange.startDate, customEndDate: customDateRange.endDate }
        );

        console.log(`CSV downloaded successfully: ${fileName} at ${filePath}`);
      }
    );
  }
);
