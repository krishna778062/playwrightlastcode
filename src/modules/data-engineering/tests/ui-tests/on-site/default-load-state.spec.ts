import { TestCaseType } from '@data-engineering/constants/testCaseType';
import { DataEngineeringTestSuite } from '@data-engineering/constants/testSuite';
import { Page, test } from '@playwright/test';

import { TestPriority } from '@core/constants/testPriority';
import { TestGroupType } from '@core/constants/testType';
import { tagTest } from '@core/utils/testDecorator';

import { PeriodFilterTimeRange } from '../../../constants/periodFilterTimeRange';
import { OnSiteQueryHelper, SnowflakeHelper } from '../../../helpers';
import { OnSiteFilterOptions } from '../../../helpers/onSiteQueryHelper';
import { OnSitePage } from '../../../ui/dashboards/on-site/onSitePage';

import { getDataEngineeringConfigFromCache } from '@/src/modules/data-engineering/config/dataEngineeringConfig';
import {
  cleanupDashboardTesting,
  setupOnSitePageForTest,
  UserRole,
} from '@/src/modules/data-engineering/helpers/dashboardSetupHelper';

test.describe(
  'on-site analytics - default state validation',
  {
    tag: [DataEngineeringTestSuite.ON_SITE, '@default-state'],
  },
  () => {
    let testEnvironment: {
      page: Page;
      onSitePage: OnSitePage;
      onSiteQueryHelper: OnSiteQueryHelper;
      snowflakeHelper: SnowflakeHelper;
    };
    let testFiltersConfig: OnSiteFilterOptions;
    let siteCode: string;

    test.beforeAll('Setup On-Site Analytics Page with default filters', async ({ browser }) => {
      // Setup page using dedicated method
      testEnvironment = await setupOnSitePageForTest(browser, UserRole.APP_MANAGER);

      // Extract site code from URL
      siteCode = testEnvironment.onSitePage.getSiteCodeFromUrl();

      // Define unified filter configuration for default state (Last 30 days)
      testFiltersConfig = {
        tenantCode: getDataEngineeringConfigFromCache().orgId,
        timePeriod: PeriodFilterTimeRange.LAST_90_DAYS,
        siteCode: siteCode,
        interactionTypeCode: 'IT002', // Reactions made uses IT002
      };

      const { analyticsFiltersComponent } = testEnvironment.onSitePage;

      // Apply filters using unified configuration
      await analyticsFiltersComponent.applyFiltersFromConfig(testFiltersConfig);
    });

    test.afterAll('Cleanup On-Site Analytics Page', async () => {
      // Cleanup using helper
      await cleanupDashboardTesting(testEnvironment);
    });

    test(
      'verify Reactions Made metric data validation with default period filter (Last 30 days)',
      {
        tag: [
          TestPriority.P0,
          TestGroupType.SMOKE,
          TestGroupType.HEALTHCHECK,
          TestCaseType.TABULAR_METRIC,
          '@reactions-made',
        ],
      },
      async () => {
        tagTest(test.info(), {
          description: 'TS To verify the answer Reactions made in On-Site Analytics Page',
          zephyrTestId: 'DE-',
          storyId: 'DE-',
        });

        const { onSiteQueryHelper } = testEnvironment;

        // Get expected metric data from Snowflake with filters applied
        const expectedData = await onSiteQueryHelper.getReactionsMadeDataFromDBWithFilters({
          filterBy: testFiltersConfig,
        });

        // UI validation
        const reactionsMadeMetric = testEnvironment.onSitePage.reactionsMade;
        await reactionsMadeMetric.scrollToComponent();
        await reactionsMadeMetric.verifyUIDataMatchesWithSnowflakeData(expectedData);
      }
    );

    test(
      'verify Reactions Made CSV download and validation with default period filter (Last 90 days)',
      {
        tag: [
          TestPriority.P0,
          TestGroupType.SMOKE,
          TestGroupType.HEALTHCHECK,
          TestCaseType.CSV_VALIDATION,
          '@reactions-made-csv',
        ],
      },
      async () => {
        tagTest(test.info(), {
          description: 'TS To verify CSV download and validation for Reactions made in On-Site Analytics Page',
          zephyrTestId: 'DE-',
          storyId: 'DE-',
        });

        const { onSiteQueryHelper } = testEnvironment;

        // Get expected data from Snowflake with filters applied
        const reactionsMadeData = await onSiteQueryHelper.getReactionsMadeDataFromDBWithFilters({
          filterBy: testFiltersConfig,
        });

        // Download CSV and validate against Snowflake data (skip UI validation)
        const reactionsMadeMetric = testEnvironment.onSitePage.reactionsMade;
        await reactionsMadeMetric.scrollToComponent();
        const { filePath, fileName } = await reactionsMadeMetric.downloadAndValidateReactionsMadeCSV(
          reactionsMadeData,
          testFiltersConfig.timePeriod
        );

        console.log(`CSV downloaded successfully: ${fileName} at ${filePath}`);
      }
    );

    test(
      'verify Reactions Received metric data validation with default period filter (Last 90 days)',
      {
        tag: [
          TestPriority.P0,
          TestGroupType.SMOKE,
          TestGroupType.HEALTHCHECK,
          TestCaseType.TABULAR_METRIC,
          '@reactions-received',
        ],
      },
      async () => {
        tagTest(test.info(), {
          description: 'TS To verify the answer Reactions received in On-Site Analytics Page',
          zephyrTestId: 'DE-',
          storyId: 'DE-',
        });

        const { onSiteQueryHelper } = testEnvironment;

        // Create filter config for Reactions Received (uses IT002)
        const reactionsReceivedFiltersConfig: OnSiteFilterOptions = {
          ...testFiltersConfig,
          interactionTypeCode: 'IT002',
        };

        // Get expected metric data from Snowflake with filters applied
        const expectedData = await onSiteQueryHelper.getReactionsReceivedDataFromDBWithFilters({
          filterBy: reactionsReceivedFiltersConfig,
        });

        // UI validation
        const reactionsReceivedMetric = testEnvironment.onSitePage.reactionsReceived;
        await reactionsReceivedMetric.scrollToComponent();
        await reactionsReceivedMetric.verifyUIDataMatchesWithSnowflakeData(expectedData);
      }
    );

    test(
      'verify Reactions Received CSV download and validation with default period filter (Last 90 days)',
      {
        tag: [
          TestPriority.P0,
          TestGroupType.SMOKE,
          TestGroupType.HEALTHCHECK,
          TestCaseType.CSV_VALIDATION,
          '@reactions-received-csv',
        ],
      },
      async () => {
        tagTest(test.info(), {
          description: 'TS To verify CSV download and validation for Reactions received in On-Site Analytics Page',
          zephyrTestId: 'DE-',
          storyId: 'DE-',
        });

        const { onSiteQueryHelper } = testEnvironment;

        // Create filter config for Reactions Received (uses IT002)
        const reactionsReceivedFiltersConfig: OnSiteFilterOptions = {
          ...testFiltersConfig,
          interactionTypeCode: 'IT002',
        };

        // Get expected data from Snowflake with filters applied
        const reactionsReceivedData = await onSiteQueryHelper.getReactionsReceivedDataFromDBWithFilters({
          filterBy: reactionsReceivedFiltersConfig,
        });

        const reactionsReceivedMetric = testEnvironment.onSitePage.reactionsReceived;
        await reactionsReceivedMetric.scrollToComponent();
        const { filePath, fileName } = await reactionsReceivedMetric.downloadAndValidateReactionsReceivedCSV(
          reactionsReceivedData,
          testFiltersConfig.timePeriod
        );

        console.log(`CSV downloaded successfully: ${fileName} at ${filePath}`);
      }
    );

    test(
      'verify Favorites Received metric data validation with default period filter (Last 90 days)',
      {
        tag: [
          TestPriority.P0,
          TestGroupType.SMOKE,
          TestGroupType.HEALTHCHECK,
          TestCaseType.TABULAR_METRIC,
          '@favorites-received',
        ],
      },
      async () => {
        tagTest(test.info(), {
          description: 'TS To verify the answer Favorites received in On-Site Analytics Page',
          zephyrTestId: 'DE-',
          storyId: 'DE-',
        });

        const { onSiteQueryHelper } = testEnvironment;

        // Create filter config for Favorites Received (uses IT006)
        const favoritesReceivedFiltersConfig: OnSiteFilterOptions = {
          ...testFiltersConfig,
          interactionTypeCode: 'IT006',
        };

        // Get expected metric data from Snowflake with filters applied
        // Uses REACTIONS_RECEIVED query with IT006 interactionTypeCode
        const expectedData = await onSiteQueryHelper.getReactionsReceivedDataFromDBWithFilters({
          filterBy: favoritesReceivedFiltersConfig,
        });

        // UI validation
        const favoritesReceivedMetric = testEnvironment.onSitePage.favoritesReceived;
        await favoritesReceivedMetric.scrollToComponent();
        await favoritesReceivedMetric.verifyUIDataMatchesWithSnowflakeData(expectedData);
      }
    );

    test(
      'verify Favorites Received CSV download and validation with default period filter (Last 90 days)',
      {
        tag: [
          TestPriority.P0,
          TestGroupType.SMOKE,
          TestGroupType.HEALTHCHECK,
          TestCaseType.CSV_VALIDATION,
          '@favorites-received-csv',
        ],
      },
      async () => {
        tagTest(test.info(), {
          description: 'TS To verify CSV download and validation for Favorites received in On-Site Analytics Page',
          zephyrTestId: 'DE-',
          storyId: 'DE-',
        });

        const { onSiteQueryHelper } = testEnvironment;

        // Create filter config for Favorites Received (uses IT006)
        const favoritesReceivedFiltersConfig: OnSiteFilterOptions = {
          ...testFiltersConfig,
          interactionTypeCode: 'IT006',
        };

        // Get expected data from Snowflake with filters applied
        const favoritesReceivedData = await onSiteQueryHelper.getReactionsReceivedDataFromDBWithFilters({
          filterBy: favoritesReceivedFiltersConfig,
        });

        const favoritesReceivedMetric = testEnvironment.onSitePage.favoritesReceived;
        await favoritesReceivedMetric.scrollToComponent();
        const { filePath, fileName } = await favoritesReceivedMetric.downloadAndValidateFavoritesReceivedCSV(
          favoritesReceivedData,
          testFiltersConfig.timePeriod
        );

        console.log(`CSV downloaded successfully: ${fileName} at ${filePath}`);
      }
    );

    test(
      'verify Shares Received metric data validation with default period filter (Last 90 days)',
      {
        tag: [
          TestPriority.P0,
          TestGroupType.SMOKE,
          TestGroupType.HEALTHCHECK,
          TestCaseType.TABULAR_METRIC,
          '@shares-received',
        ],
      },
      async () => {
        tagTest(test.info(), {
          description: 'TS To verify the answer Shares received in On-Site Analytics Page',
          zephyrTestId: 'DE-',
          storyId: 'DE-',
        });

        const { onSiteQueryHelper } = testEnvironment;

        // Create filter config for Shares Received (uses IT003)
        const sharesReceivedFiltersConfig: OnSiteFilterOptions = {
          ...testFiltersConfig,
          interactionTypeCode: 'IT003',
        };

        // Get expected metric data from Snowflake with filters applied
        const expectedData = await onSiteQueryHelper.getReactionsReceivedDataFromDBWithFilters({
          filterBy: sharesReceivedFiltersConfig,
        });

        // UI validation
        const sharesReceivedMetric = testEnvironment.onSitePage.sharesReceived;
        await sharesReceivedMetric.scrollToComponent();
        await sharesReceivedMetric.verifyUIDataMatchesWithSnowflakeData(expectedData);
      }
    );

    test(
      'verify Shares Received CSV download and validation with default period filter (Last 90 days)',
      {
        tag: [
          TestPriority.P0,
          TestGroupType.SMOKE,
          TestGroupType.HEALTHCHECK,
          TestCaseType.CSV_VALIDATION,
          '@shares-received-csv',
        ],
      },
      async () => {
        tagTest(test.info(), {
          description: 'TS To verify CSV download and validation for Shares received in On-Site Analytics Page',
          zephyrTestId: 'DE-',
          storyId: 'DE-',
        });

        const { onSiteQueryHelper } = testEnvironment;

        // Create filter config for Shares Received (uses IT003)
        const sharesReceivedFiltersConfig: OnSiteFilterOptions = {
          ...testFiltersConfig,
          interactionTypeCode: 'IT003',
        };

        // Get expected data from Snowflake with filters applied
        const sharesReceivedData = await onSiteQueryHelper.getReactionsReceivedDataFromDBWithFilters({
          filterBy: sharesReceivedFiltersConfig,
        });

        const sharesReceivedMetric = testEnvironment.onSitePage.sharesReceived;
        await sharesReceivedMetric.scrollToComponent();
        const { filePath, fileName } = await sharesReceivedMetric.downloadAndValidateSharesReceivedCSV(
          sharesReceivedData,
          testFiltersConfig.timePeriod
        );

        console.log(`CSV downloaded successfully: ${fileName} at ${filePath}`);
      }
    );

    test(
      'verify Feed Posts and Content Comments metric data validation with default period filter (Last 90 days)',
      {
        tag: [
          TestPriority.P0,
          TestGroupType.SMOKE,
          TestGroupType.HEALTHCHECK,
          TestCaseType.TABULAR_METRIC,
          '@feed-posts-content-comments',
        ],
      },
      async () => {
        tagTest(test.info(), {
          description: 'TS To verify the answer Feed posts and content comments in On-Site Analytics Page',
          zephyrTestId: 'DE-',
          storyId: 'DE-',
        });

        const { onSiteQueryHelper } = testEnvironment;

        // Create filter config for Feed Posts and Content Comments (uses IT004, IT008)
        const feedPostsFiltersConfig: OnSiteFilterOptions = {
          ...testFiltersConfig,
          interactionTypeCode: ['IT004', 'IT008'],
        };

        // Get expected metric data from Snowflake with filters applied
        const expectedData = await onSiteQueryHelper.getReactionsMadeDataFromDBWithFilters({
          filterBy: feedPostsFiltersConfig,
        });

        // UI validation
        const feedPostsMetric = testEnvironment.onSitePage.feedPostsAndContentComments;
        await feedPostsMetric.scrollToComponent();
        await feedPostsMetric.verifyUIDataMatchesWithSnowflakeData(expectedData);
      }
    );

    test(
      'verify Feed Posts and Content Comments CSV download and validation with default period filter (Last 90 days)',
      {
        tag: [
          TestPriority.P0,
          TestGroupType.SMOKE,
          TestGroupType.HEALTHCHECK,
          TestCaseType.CSV_VALIDATION,
          '@feed-posts-content-comments-csv',
        ],
      },
      async () => {
        tagTest(test.info(), {
          description:
            'TS To verify CSV download and validation for Feed posts and content comments in On-Site Analytics Page',
          zephyrTestId: 'DE-',
          storyId: 'DE-',
        });

        const { onSiteQueryHelper } = testEnvironment;

        // Create filter config for Feed Posts and Content Comments (uses IT004, IT008)
        const feedPostsFiltersConfig: OnSiteFilterOptions = {
          ...testFiltersConfig,
          interactionTypeCode: ['IT004', 'IT008'],
        };

        // Get expected data from Snowflake with filters applied
        const feedPostsData = await onSiteQueryHelper.getReactionsMadeDataFromDBWithFilters({
          filterBy: feedPostsFiltersConfig,
        });

        const feedPostsMetric = testEnvironment.onSitePage.feedPostsAndContentComments;
        await feedPostsMetric.scrollToComponent();
        const { filePath, fileName } = await feedPostsMetric.downloadAndValidateFeedPostsAndContentCommentsCSV(
          feedPostsData,
          testFiltersConfig.timePeriod
        );

        console.log(`CSV downloaded successfully: ${fileName} at ${filePath}`);
      }
    );

    test(
      'verify Replies to Others metric data validation with default period filter (Last 90 days)',
      {
        tag: [
          TestPriority.P0,
          TestGroupType.SMOKE,
          TestGroupType.HEALTHCHECK,
          TestCaseType.TABULAR_METRIC,
          '@replies-to-others',
        ],
      },
      async () => {
        tagTest(test.info(), {
          description: 'TS To verify the answer Replies to others in On-Site Analytics Page',
          zephyrTestId: 'DE-',
          storyId: 'DE-',
        });

        const { onSiteQueryHelper } = testEnvironment;

        // Create filter config for Replies to Others (uses IT007)
        const repliesToOthersFiltersConfig: OnSiteFilterOptions = {
          ...testFiltersConfig,
          interactionTypeCode: 'IT007',
        };

        // Get expected metric data from Snowflake with filters applied
        const expectedData = await onSiteQueryHelper.getReactionsReceivedDataFromDBWithFilters({
          filterBy: repliesToOthersFiltersConfig,
        });

        // UI validation
        const repliesToOthersMetric = testEnvironment.onSitePage.repliesToOthers;
        await repliesToOthersMetric.scrollToComponent();
        await repliesToOthersMetric.verifyUIDataMatchesWithSnowflakeData(expectedData);
      }
    );

    test(
      'verify Replies to Others CSV download and validation with default period filter (Last 90 days)',
      {
        tag: [
          TestPriority.P0,
          TestGroupType.SMOKE,
          TestGroupType.HEALTHCHECK,
          TestCaseType.CSV_VALIDATION,
          '@replies-to-others-csv',
        ],
      },
      async () => {
        tagTest(test.info(), {
          description: 'TS To verify CSV download and validation for Replies to others in On-Site Analytics Page',
          zephyrTestId: 'DE-',
          storyId: 'DE-',
        });

        const { onSiteQueryHelper } = testEnvironment;

        // Create filter config for Replies to Others (uses IT007)
        const repliesToOthersFiltersConfig: OnSiteFilterOptions = {
          ...testFiltersConfig,
          interactionTypeCode: 'IT007',
        };

        // Get expected data from Snowflake with filters applied
        const repliesToOthersData = await onSiteQueryHelper.getReactionsReceivedDataFromDBWithFilters({
          filterBy: repliesToOthersFiltersConfig,
        });

        const repliesToOthersMetric = testEnvironment.onSitePage.repliesToOthers;
        await repliesToOthersMetric.scrollToComponent();
        const { filePath, fileName } = await repliesToOthersMetric.downloadAndValidateRepliesToOthersCSV(
          repliesToOthersData,
          testFiltersConfig.timePeriod
        );

        console.log(`CSV downloaded successfully: ${fileName} at ${filePath}`);
      }
    );

    test(
      'verify Replies from Other Users metric data validation with default period filter (Last 90 days)',
      {
        tag: [
          TestPriority.P0,
          TestGroupType.SMOKE,
          TestGroupType.HEALTHCHECK,
          TestCaseType.TABULAR_METRIC,
          '@replies-from-other-users',
        ],
      },
      async () => {
        tagTest(test.info(), {
          description: 'TS To verify the answer Replies from other users in On-Site Analytics Page',
          zephyrTestId: 'DE-',
          storyId: 'DE-',
        });

        const { onSiteQueryHelper } = testEnvironment;

        // Create filter config for Replies from Other Users (uses IT007)
        const repliesFromOtherUsersFiltersConfig: OnSiteFilterOptions = {
          ...testFiltersConfig,
          interactionTypeCode: 'IT007',
        };

        // Get expected metric data from Snowflake with filters applied
        const expectedData = await onSiteQueryHelper.getReactionsMadeDataFromDBWithFilters({
          filterBy: repliesFromOtherUsersFiltersConfig,
        });

        // UI validation
        const repliesFromOtherUsersMetric = testEnvironment.onSitePage.repliesFromOtherUsers;
        await repliesFromOtherUsersMetric.scrollToComponent();
        await repliesFromOtherUsersMetric.verifyUIDataMatchesWithSnowflakeData(expectedData);
      }
    );

    test(
      'verify Replies from Other Users CSV download and validation with default period filter (Last 90 days)',
      {
        tag: [
          TestPriority.P0,
          TestGroupType.SMOKE,
          TestGroupType.HEALTHCHECK,
          TestCaseType.CSV_VALIDATION,
          '@replies-from-other-users-csv',
        ],
      },
      async () => {
        tagTest(test.info(), {
          description:
            'TS To verify CSV download and validation for Replies from other users in On-Site Analytics Page',
          zephyrTestId: 'DE-',
          storyId: 'DE-',
        });

        const { onSiteQueryHelper } = testEnvironment;

        // Create filter config for Replies from Other Users (uses IT007)
        const repliesFromOtherUsersFiltersConfig: OnSiteFilterOptions = {
          ...testFiltersConfig,
          interactionTypeCode: 'IT007',
        };

        // Get expected data from Snowflake with filters applied
        const repliesFromOtherUsersData = await onSiteQueryHelper.getReactionsMadeDataFromDBWithFilters({
          filterBy: repliesFromOtherUsersFiltersConfig,
        });

        const repliesFromOtherUsersMetric = testEnvironment.onSitePage.repliesFromOtherUsers;
        await repliesFromOtherUsersMetric.scrollToComponent();
        const { filePath, fileName } = await repliesFromOtherUsersMetric.downloadAndValidateRepliesFromOtherUsersCSV(
          repliesFromOtherUsersData,
          testFiltersConfig.timePeriod
        );

        console.log(`CSV downloaded successfully: ${fileName} at ${filePath}`);
      }
    );

    test(
      'verify Most Popular metric data validation with default period filter (Last 90 days)',
      {
        tag: [
          TestPriority.P0,
          TestGroupType.SMOKE,
          TestGroupType.HEALTHCHECK,
          TestCaseType.TABULAR_METRIC,
          '@most-popular',
        ],
      },
      async () => {
        tagTest(test.info(), {
          description: 'TS To verify the answer Most popular in On-Site Analytics Page',
          zephyrTestId: 'DE-',
          storyId: 'DE-',
        });

        const { onSiteQueryHelper } = testEnvironment;

        // Get expected metric data from Snowflake with filters applied
        // MOST_POPULAR query doesn't use interactionTypeCode
        const expectedData = await onSiteQueryHelper.getMostPopularDataFromDBWithFilters({
          filterBy: testFiltersConfig,
        });

        // UI validation
        const mostPopularMetric = testEnvironment.onSitePage.mostPopular;
        await mostPopularMetric.scrollToComponent();
        await mostPopularMetric.verifyUIDataMatchesWithSnowflakeData(expectedData);
      }
    );

    test(
      'verify Content Referrals metric data validation with default period filter (Last 90 days)',
      {
        tag: [
          TestPriority.P0,
          TestGroupType.SMOKE,
          TestGroupType.HEALTHCHECK,
          TestCaseType.TABULAR_METRIC,
          '@content-referrals',
        ],
      },
      async () => {
        tagTest(test.info(), {
          description: 'TS To verify the answer Content referrals in On-Site Analytics Page',
          zephyrTestId: 'DE-',
          storyId: 'DE-',
        });

        const { onSiteQueryHelper } = testEnvironment;

        // Get expected metric data from Snowflake with filters applied
        const expectedData = await onSiteQueryHelper.getContentReferralsDataFromDBWithFilters({
          filterBy: testFiltersConfig,
        });

        // UI validation
        const contentReferralsMetric = testEnvironment.onSitePage.contentReferrals;
        await contentReferralsMetric.scrollToComponent();
        await contentReferralsMetric.verifyUIDataMatchesWithSnowflakeData(expectedData);
      }
    );

    test(
      'verify Most Content Published metric data validation with default period filter (Last 90 days)',
      {
        tag: [
          TestPriority.P0,
          TestGroupType.SMOKE,
          TestGroupType.HEALTHCHECK,
          TestCaseType.TABULAR_METRIC,
          '@most-content-published',
        ],
      },
      async () => {
        tagTest(test.info(), {
          description: 'TS To verify the answer Most content published in On-Site Analytics Page',
          zephyrTestId: 'DE-',
          storyId: 'DE-',
        });

        const { onSiteQueryHelper } = testEnvironment;

        // Get expected metric data from Snowflake with filters applied
        const expectedData = await onSiteQueryHelper.getMostContentPublishedDataFromDBWithFilters({
          filterBy: testFiltersConfig,
        });

        // UI validation
        const mostContentPublishedMetric = testEnvironment.onSitePage.mostContentPublished;
        await mostContentPublishedMetric.scrollToComponent();
        await mostContentPublishedMetric.verifyUIDataMatchesWithSnowflakeData(expectedData);
      }
    );

    test(
      'verify Most Viewed Content metric data validation with default period filter (Last 90 days)',
      {
        tag: [
          TestPriority.P0,
          TestGroupType.SMOKE,
          TestGroupType.HEALTHCHECK,
          TestCaseType.TABULAR_METRIC,
          '@most-viewed-content',
        ],
      },
      async () => {
        tagTest(test.info(), {
          description: 'TS To verify the answer Most viewed content in On-Site Analytics Page',
          zephyrTestId: 'DE-',
          storyId: 'DE-',
        });

        const { onSiteQueryHelper } = testEnvironment;

        // Get expected metric data from Snowflake with filters applied
        const expectedData = await onSiteQueryHelper.getMostViewedContentDataFromDBWithFilters({
          filterBy: testFiltersConfig,
        });

        // UI validation
        const mostViewedContentMetric = testEnvironment.onSitePage.mostViewedContent;
        await mostViewedContentMetric.scrollToComponent();
        await mostViewedContentMetric.verifyUIDataMatchesWithSnowflakeData(expectedData);
      }
    );
  }
);
