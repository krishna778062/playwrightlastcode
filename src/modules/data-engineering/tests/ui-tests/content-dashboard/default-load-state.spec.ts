import { DataEngineeringTestSuite } from '@data-engineering/constants/testSuite';
import { Page, test } from '@playwright/test';

import { PeriodFilterTimeRange } from '../../../constants/periodFilterTimeRange';
import { ContentDashboardQueryHelper, SnowflakeHelper } from '../../../helpers';
import { FilterOptions } from '../../../helpers/baseAnalyticsQueryHelper';
import { ContentDashboard } from '../../../ui/dashboards';

import { TestGroupType } from '@/src/core';
import { TestPriority } from '@/src/core/constants/testPriority';
import { tagTest } from '@/src/core/utils/testDecorator';
import {
  cleanupDashboardTesting,
  setupContentDashboardForTest,
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
  'content Dashboard - Default Load State',
  {
    tag: [DataEngineeringTestSuite.ANALYTICS, '@content-dashboard-default-state'],
  },
  () => {
    test.slow();

    let testEnvironment: {
      page: Page;
      contentDashboard: ContentDashboard;
      snowflakeHelper: SnowflakeHelper;
      contentDashboardQueryHelper: ContentDashboardQueryHelper;
    };
    let testFiltersConfig: FilterOptions;

    test.beforeAll(
      'Setting up the content dashboard without making any changes to the filters',
      async ({ browser }) => {
        // Setup dashboard using dedicated method
        testEnvironment = await setupContentDashboardForTest(browser, UserRole.APP_MANAGER);

        testFiltersConfig = {
          tenantCode: process.env.ORG_ID!,
          timePeriod: PeriodFilterTimeRange.LAST_30_DAYS, // default period filter
        };

        const { analyticsFiltersComponent } = testEnvironment.contentDashboard;
        // Content dashboard only has Period filter
        await test.step('Verify Period filter is visible', async () => {
          await analyticsFiltersComponent.filterGroup('Period').waitFor({ state: 'visible', timeout: 40_000 });
        });
        await analyticsFiltersComponent.applyFiltersFromConfig(testFiltersConfig);
      }
    );

    test.afterAll('Cleaning up the test environment', async () => {
      await cleanupDashboardTesting(testEnvironment);
    });

    test(
      'verify Total content views metric data validation with default period filter (Last 30 days)',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, '@total-content-views'],
      },
      async () => {
        tagTest(test.info(), {
          description: 'To verify the answer of Total content views in Content dashboard with default filter',
          zephyrTestId: '',
          storyId: '',
        });

        const { contentDashboardQueryHelper } = testEnvironment;

        // Get expected metric value from snowflake with default period (Last 30 days)
        const expectedMetricValue = await contentDashboardQueryHelper.getTotalContentViewsDataFromDBWithFilters({
          filterBy: testFiltersConfig,
        });

        // UI validation
        const totalContentViewsMetric = testEnvironment.contentDashboard.totalContentViewsMetric;
        await totalContentViewsMetric.verifyMetricIsLoaded();
        // Verify the absolute value (the metric shows just a number, not a percentage)
        await totalContentViewsMetric.verifyAbsoluteMetricValueIs(expectedMetricValue.toString());
      }
    );

    test(
      'verify Total content published metric data validation with default period filter (Last 30 days)',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, '@total-content-published'],
      },
      async () => {
        tagTest(test.info(), {
          description: 'To verify the answer of Total content published in Content dashboard with default filter',
          zephyrTestId: '',
          storyId: '',
        });

        const { contentDashboardQueryHelper } = testEnvironment;

        // Get expected metric value from snowflake with default period (Last 30 days)
        const expectedMetricValue = await contentDashboardQueryHelper.getTotalContentPublishedDataFromDBWithFilters({
          filterBy: testFiltersConfig,
        });

        // UI validation
        const totalContentPublishedMetric = testEnvironment.contentDashboard.totalContentPublishedMetric;
        await totalContentPublishedMetric.verifyMetricIsLoaded();
        // Verify the absolute value (the metric shows just a number, not a percentage)
        await totalContentPublishedMetric.verifyAbsoluteMetricValueIs(expectedMetricValue.toString());
      }
    );

    test(
      'verify Unique content view metric data validation with default period filter (Last 30 days)',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, '@unique-content-view'],
      },
      async () => {
        tagTest(test.info(), {
          description: 'To verify the answer of Unique content view in Content dashboard with default filter',
          zephyrTestId: '',
          storyId: '',
        });

        const { contentDashboardQueryHelper } = testEnvironment;

        // Get expected metric value from snowflake with default period (Last 30 days)
        const expectedMetricValue = await contentDashboardQueryHelper.getUniqueContentViewDataFromDBWithFilters({
          filterBy: testFiltersConfig,
        });

        // UI validation
        const uniqueContentViewMetric = testEnvironment.contentDashboard.uniqueContentViewMetric;
        await uniqueContentViewMetric.verifyMetricIsLoaded();
        // Verify the absolute value (the metric shows just a number, not a percentage)
        await uniqueContentViewMetric.verifyAbsoluteMetricValueIs(expectedMetricValue.toString());
      }
    );

    test(
      'verify Currently published chart data validation with default period filter (Last 30 days)',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, '@currently-published'],
      },
      async () => {
        tagTest(test.info(), {
          description: 'To verify the answer of Currently published chart in Content dashboard with default filter',
          zephyrTestId: '',
          storyId: '',
        });

        const { contentDashboardQueryHelper } = testEnvironment;

        // Get expected chart data from snowflake
        const expectedChartData = await contentDashboardQueryHelper.getCurrentlyPublishedDataFromDBWithFilters({
          filterBy: testFiltersConfig,
        });

        // UI validation
        const currentlyPublishedMetric = testEnvironment.contentDashboard.currentlyPublishedMetric;
        await currentlyPublishedMetric.verifyChartIsLoaded();
        await currentlyPublishedMetric.verifyAxisLabels();

        // Extract content type names in the order they appear in DB (sorted DESC by count)
        const expectedContentTypes = expectedChartData.map(data => data.contentTypeName);
        await currentlyPublishedMetric.verifyXAxisLabelsMatchContentTypes(expectedContentTypes);
        await currentlyPublishedMetric.verifyBarsAreSortedByCountDescending(expectedChartData);
        await currentlyPublishedMetric.verifyBarsWithTooltips(expectedChartData);
      }
    );

    test(
      'verify Users who viewed content metric data validation with default period filter (Last 30 days)',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, '@users-who-viewed-content'],
      },
      async () => {
        tagTest(test.info(), {
          description: 'To verify the answer of Users who viewed content in Content dashboard with default filter',
          zephyrTestId: '',
          storyId: '',
        });

        const { contentDashboardQueryHelper } = testEnvironment;

        // Get expected metric value from snowflake with default period (Last 30 days)
        const expectedMetricValue =
          await contentDashboardQueryHelper.getUsersWhoViewedContentPercentageFromDBWithFilters({
            filterBy: testFiltersConfig,
          });

        // UI validation
        const usersWhoViewedContentMetric = testEnvironment.contentDashboard.usersWhoViewedContentMetric;
        await usersWhoViewedContentMetric.verifyMetricIsLoaded();
        // Verify the percentage value (e.g., 14.1 for 14.1%)
        await usersWhoViewedContentMetric.verifyMetricValue(expectedMetricValue);
      }
    );

    test(
      'verify Comments metric data validation with default period filter (Last 30 days)',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, '@comments'],
      },
      async () => {
        tagTest(test.info(), {
          description: 'To verify the answer of Comments in Content dashboard with default filter',
          zephyrTestId: '',
          storyId: '',
        });

        const { contentDashboardQueryHelper } = testEnvironment;

        // Get expected metric value from snowflake with default period (Last 30 days)
        const expectedMetricValue = await contentDashboardQueryHelper.getCommentsDataFromDBWithFilters({
          filterBy: testFiltersConfig,
        });

        // UI validation
        const commentsMetric = testEnvironment.contentDashboard.commentsMetric;
        await commentsMetric.verifyMetricIsLoaded();
        // Verify the metric value (HeroMetricsComponent accepts number or string)
        await commentsMetric.verifyMetricValue(expectedMetricValue);
      }
    );

    test(
      'verify Replies metric data validation with default period filter (Last 30 days)',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, '@replies'],
      },
      async () => {
        tagTest(test.info(), {
          description: 'To verify the answer of Replies in Content dashboard with default filter',
          zephyrTestId: '',
          storyId: '',
        });

        const { contentDashboardQueryHelper } = testEnvironment;

        // Get expected metric value from snowflake with default period (Last 30 days)
        const expectedMetricValue = await contentDashboardQueryHelper.getRepliesDataFromDBWithFilters({
          filterBy: testFiltersConfig,
        });

        // UI validation
        const repliesMetric = testEnvironment.contentDashboard.repliesMetric;
        await repliesMetric.verifyMetricIsLoaded();
        // Verify the metric value (HeroMetricsComponent accepts number or string)
        await repliesMetric.verifyMetricValue(expectedMetricValue);
      }
    );

    test(
      'verify Shares metric data validation with default period filter (Last 30 days)',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, '@shares'],
      },
      async () => {
        tagTest(test.info(), {
          description: 'To verify the answer of Shares in Content dashboard with default filter',
          zephyrTestId: '',
          storyId: '',
        });

        const { contentDashboardQueryHelper } = testEnvironment;

        // Get expected metric value from snowflake with default period (Last 30 days)
        const expectedMetricValue = await contentDashboardQueryHelper.getSharesDataFromDBWithFilters({
          filterBy: testFiltersConfig,
        });

        // UI validation
        const sharesMetric = testEnvironment.contentDashboard.sharesMetric;
        await sharesMetric.verifyMetricIsLoaded();
        // Verify the metric value (HeroMetricsComponent accepts number or string)
        await sharesMetric.verifyMetricValue(expectedMetricValue);
      }
    );

    test(
      'verify Favorites metric data validation with default period filter (Last 30 days)',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, '@favorites'],
      },
      async () => {
        tagTest(test.info(), {
          description: 'To verify the answer of Favorites in Content dashboard with default filter',
          zephyrTestId: '',
          storyId: '',
        });

        const { contentDashboardQueryHelper } = testEnvironment;

        // Get expected metric value from snowflake with default period (Last 30 days)
        const expectedMetricValue = await contentDashboardQueryHelper.getFavoritesDataFromDBWithFilters({
          filterBy: testFiltersConfig,
        });

        // UI validation
        const favoritesMetric = testEnvironment.contentDashboard.favoritesMetric;
        await favoritesMetric.verifyMetricIsLoaded();
        // Verify the metric value (HeroMetricsComponent accepts number or string)
        await favoritesMetric.verifyMetricValue(expectedMetricValue);
      }
    );

    test(
      'verify Reactions metric data validation with default period filter (Last 30 days)',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, '@reactions'],
      },
      async () => {
        tagTest(test.info(), {
          description: 'To verify the answer of Reactions in Content dashboard with default filter',
          zephyrTestId: '',
          storyId: '',
        });

        const { contentDashboardQueryHelper } = testEnvironment;

        // Get expected metric value from snowflake with default period (Last 30 days)
        const expectedMetricValue = await contentDashboardQueryHelper.getReactionsDataFromDBWithFilters({
          filterBy: testFiltersConfig,
        });

        // UI validation
        const reactionsMetric = testEnvironment.contentDashboard.reactionsMetric;
        await reactionsMetric.verifyMetricIsLoaded();
        // Verify the metric value (HeroMetricsComponent accepts number or string)
        await reactionsMetric.verifyMetricValue(expectedMetricValue);
      }
    );

    test(
      'verify Knowledge pages metric data validation with default period filter (Last 30 days)',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, '@knowledge-pages'],
      },
      async () => {
        tagTest(test.info(), {
          description: 'To verify the answer of Knowledge pages in Content dashboard with default filter',
          zephyrTestId: '',
          storyId: '',
        });

        const { contentDashboardQueryHelper } = testEnvironment;

        // Get expected metric value from snowflake with default period (Last 30 days)
        const expectedMetricValue = await contentDashboardQueryHelper.getKnowledgePagesDataFromDBWithFilters({
          filterBy: testFiltersConfig,
        });

        // UI validation
        const knowledgePagesMetric = testEnvironment.contentDashboard.knowledgePagesMetric;
        await knowledgePagesMetric.verifyMetricIsLoaded();
        // Verify the metric value (HeroMetricsComponent accepts number or string)
        await knowledgePagesMetric.verifyMetricValue(expectedMetricValue);
      }
    );

    test(
      'verify Content referral sources metric data validation with default period filter (Last 30 days)',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, '@content-referral-sources'],
      },
      async () => {
        tagTest(test.info(), {
          description: 'To verify the answer of Content referral sources in Content dashboard with default filter',
          zephyrTestId: '',
          storyId: '',
        });

        const { contentDashboardQueryHelper } = testEnvironment;

        // Get expected metric data from snowflake with default period (Last 30 days)
        const expectedMetricData = await contentDashboardQueryHelper.getContentReferralSourcesDataFromDBWithFilters({
          filterBy: testFiltersConfig,
        });

        // UI validation
        const contentReferralSourcesMetric = testEnvironment.contentDashboard.contentReferralSourcesMetric;
        await contentReferralSourcesMetric.verifyDataIsLoaded();
        await contentReferralSourcesMetric.scrollToComponent();
        await contentReferralSourcesMetric.verifyUIDataMatchesWithSnowflakeData(expectedMetricData);
      }
    );

    test(
      'verify Content referral sources CSV download and validation with default period filter (Last 30 days)',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, '@content-referral-sources-csv'],
      },
      async () => {
        tagTest(test.info(), {
          description:
            'To verify the CSV download and validation of Content referral sources in Content dashboard with default filter',
          zephyrTestId: '',
          storyId: '',
        });

        const { contentDashboardQueryHelper } = testEnvironment;

        // Get expected metric data from snowflake with default period (Last 30 days)
        const expectedMetricData = await contentDashboardQueryHelper.getContentReferralSourcesDataFromDBWithFilters({
          filterBy: testFiltersConfig,
        });

        // CSV validation
        const contentReferralSourcesMetric = testEnvironment.contentDashboard.contentReferralSourcesMetric;
        await contentReferralSourcesMetric.verifyDataIsLoaded();
        await contentReferralSourcesMetric.scrollToComponent();
        await contentReferralSourcesMetric.downloadAndValidateContentReferralSourcesCSV(
          expectedMetricData,
          testFiltersConfig.timePeriod
        );
      }
    );
  }
);
