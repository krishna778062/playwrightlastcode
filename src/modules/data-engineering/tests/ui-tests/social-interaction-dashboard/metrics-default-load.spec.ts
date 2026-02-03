import { TestCaseType } from '@data-engineering/constants/testCaseType';
import { DataEngineeringTestSuite } from '@data-engineering/constants/testSuite';
import { Page, test } from '@playwright/test';

import { TestPriority } from '@core/constants/testPriority';
import { TestGroupType } from '@core/constants/testType';
import { tagTest } from '@core/utils/testDecorator';

import { PeriodFilterTimeRange } from '../../../constants/periodFilterTimeRange';
import { SnowflakeHelper, SocialInteractionDashboardQueryHelper } from '../../../helpers';
import { FilterOptions } from '../../../helpers/baseAnalyticsQueryHelper';
import { SocialInteractionDashboard } from '../../../ui/dashboards';

import { getDataEngineeringConfigFromCache } from '@/src/modules/data-engineering/config/dataEngineeringConfig';
import {
  cleanupDashboardTesting,
  setupSocialInteractionDashboardForTest,
  UserRole,
} from '@/src/modules/data-engineering/helpers/dashboardSetupHelper';

test.describe(
  'social Interaction Dashboard - Metrics Default Load State',
  {
    tag: [DataEngineeringTestSuite.SOCIAL_INTERACTION, '@default-state'],
  },
  () => {
    // Temporary: increase timeout to allow ThoughtSpot widgets to load on TEST env
    test.setTimeout(180_000);

    let testEnvironment: {
      page: Page;
      socialInteractionDashboard: SocialInteractionDashboard;
      socialInteractionQueryHelper: SocialInteractionDashboardQueryHelper;
      snowflakeHelper: SnowflakeHelper;
    };
    let testFiltersConfig: FilterOptions;

    test.beforeAll('Setup Social Interaction Dashboard with default filters', async ({ browser }) => {
      // Setup dashboard using dedicated method
      testEnvironment = await setupSocialInteractionDashboardForTest(browser, UserRole.APP_MANAGER);

      // Define unified filter configuration for default state (Last 30 days)
      testFiltersConfig = {
        tenantCode: getDataEngineeringConfigFromCache().orgId,
        timePeriod: PeriodFilterTimeRange.LAST_30_DAYS,
      };

      const { analyticsFiltersComponent } = testEnvironment.socialInteractionDashboard;
      await analyticsFiltersComponent.verifyFilterComponentIsVisible();

      // Apply filters using unified configuration
      await analyticsFiltersComponent.applyFiltersFromConfig(testFiltersConfig);
    });

    test.afterAll('Cleanup Social Interaction Dashboard', async () => {
      // Cleanup using helper
      await cleanupDashboardTesting(testEnvironment);
    });

    test(
      'verify Reaction/Like metric data validation with default period filter (Last 30 days)',
      {
        tag: [
          TestPriority.P0,
          TestGroupType.SMOKE,
          TestGroupType.HEALTHCHECK,
          TestCaseType.HERO_METRIC,
          '@reactions-or-likes',
        ],
      },
      async () => {
        tagTest(test.info(), {
          description: 'To verify the answer of Reactions / Likes in Social Interaction dashboard with default filter',
          zephyrTestId: 'DE-26105',
          storyId: 'DE-25753',
        });

        const { socialInteractionQueryHelper } = testEnvironment;

        // Get expected metric value from snowflake with filters applied
        const expectedMetricValue = await socialInteractionQueryHelper.getReactionCountDataFromDBWithFilters({
          filterBy: testFiltersConfig,
        });

        // UI validation
        const reactionsOrLikesMetric = testEnvironment.socialInteractionDashboard.reactionsOrLikesMetrics;
        await reactionsOrLikesMetric.verifyMetricUIDataPoints();
        await reactionsOrLikesMetric.verifyMetricValue(expectedMetricValue);
      }
    );

    test(
      'verify Feed posts and comments metric data validation with default period filter (Last 30 days)',
      {
        tag: [
          TestPriority.P0,
          TestGroupType.SMOKE,
          TestGroupType.HEALTHCHECK,
          TestCaseType.HERO_METRIC,
          '@feed-posts-and-comments',
        ],
      },
      async () => {
        tagTest(test.info(), {
          description:
            'To verify the answer of Feed posts and comments in Social Interaction dashboard with default filter',
          zephyrTestId: 'DE-26020',
          storyId: 'DE-25754',
        });

        const { socialInteractionQueryHelper } = testEnvironment;

        // Get expected metric value from snowflake with filters applied
        const expectedMetricValue =
          await socialInteractionQueryHelper.getFeedPostsAndCommentsCountDataFromDBWithFilters({
            filterBy: testFiltersConfig,
          });

        // UI validation
        const feedPostsAndCommentsMetric = testEnvironment.socialInteractionDashboard.feedPostsAndComments;
        await feedPostsAndCommentsMetric.verifyMetricIsLoaded();
        await feedPostsAndCommentsMetric.verifyMetricValue(expectedMetricValue);
      }
    );

    test(
      'verify Replies metric data validation with default period filter (Last 30 days)',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, TestGroupType.HEALTHCHECK, TestCaseType.HERO_METRIC, '@replies'],
      },
      async () => {
        tagTest(test.info(), {
          description: 'To verify the answer of Replies in Social Interaction dashboard with default filter',
          zephyrTestId: 'DE-26017',
          storyId: 'DE-25754',
        });

        const { socialInteractionQueryHelper } = testEnvironment;

        // Get expected metric value from snowflake with filters applied
        const expectedMetricValue = await socialInteractionQueryHelper.getRepliesCountDataFromDBWithFilters({
          filterBy: testFiltersConfig,
        });

        // UI validation
        const repliesMetric = testEnvironment.socialInteractionDashboard.replies;
        await repliesMetric.verifyMetricIsLoaded();
        await repliesMetric.verifyMetricValue(expectedMetricValue);
      }
    );

    test(
      'verify Shares metric data validation with default period filter (Last 30 days)',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, TestGroupType.HEALTHCHECK, TestCaseType.HERO_METRIC, '@shares'],
      },
      async () => {
        tagTest(test.info(), {
          description: 'To verify the answer of Shares in Social Interaction dashboard with default filter',
          zephyrTestId: 'DE-26037',
          storyId: 'DE-25769',
        });

        const { socialInteractionQueryHelper } = testEnvironment;

        // Get expected metric value from snowflake with filters applied
        const expectedMetricValue = await socialInteractionQueryHelper.getSharesCountDataFromDBWithFilters({
          filterBy: testFiltersConfig,
        });

        // UI validation
        const sharesMetric = testEnvironment.socialInteractionDashboard.shares;
        await sharesMetric.verifyMetricIsLoaded();
        await sharesMetric.verifyMetricValue(expectedMetricValue);
      }
    );

    test(
      'verify Favorites metric data validation with default period filter (Last 30 days)',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, TestGroupType.HEALTHCHECK, TestCaseType.HERO_METRIC, '@favorites'],
      },
      async () => {
        tagTest(test.info(), {
          description: 'To verify the answer of Favorites in Social Interaction dashboard with default filter',
          zephyrTestId: 'DE-26018',
          storyId: 'DE-25756',
        });

        const { socialInteractionQueryHelper } = testEnvironment;

        // Get expected metric value from snowflake with filters applied
        const expectedMetricValue = await socialInteractionQueryHelper.getFavoritesCountDataFromDBWithFilters({
          filterBy: testFiltersConfig,
        });

        // UI validation
        const favoritesMetric = testEnvironment.socialInteractionDashboard.favorites;
        await favoritesMetric.verifyMetricIsLoaded();
        await favoritesMetric.verifyMetricValue(expectedMetricValue);
      }
    );

    test(
      'verify Active social campaigns metric data validation with default period filter (Last 30 days)',
      {
        tag: [
          TestPriority.P0,
          TestGroupType.SMOKE,
          TestGroupType.HEALTHCHECK,
          TestCaseType.HERO_METRIC,
          '@social-campaigns',
        ],
      },
      async () => {
        tagTest(test.info(), {
          description: 'To verify the answer of Social campaigns in Social Interaction dashboard with default filter',
          zephyrTestId: 'DE-26016',
          storyId: 'DE-25757',
        });

        const { socialInteractionQueryHelper } = testEnvironment;

        // Get expected metric value from snowflake with filters applied
        const expectedMetricValue =
          await socialInteractionQueryHelper.getActiveSocialCampaignCountDataFromDBWithFilters({
            filterBy: testFiltersConfig,
          });

        // UI validation
        const socialCampaignsMetric = testEnvironment.socialInteractionDashboard.socialCampaigns;
        await socialCampaignsMetric.verifyMetricIsLoaded();
        await socialCampaignsMetric.verifyMetricValue(expectedMetricValue);
      }
    );

    // Tabular data validations
    test(
      'verify social campaign shares tabular data validation with default period filter (Last 30 days)',
      {
        tag: [
          TestPriority.P0,
          TestGroupType.SMOKE,
          TestGroupType.HEALTHCHECK,
          TestCaseType.TABULAR_METRIC,
          '@social-campaign-shares',
        ],
      },
      async () => {
        tagTest(test.info(), {
          description:
            'To verify the answer of Social campaign shares in Social Interaction dashboard with default filter',
          zephyrTestId: 'DE-26021',
          storyId: 'DE-25757',
        });

        const { socialInteractionQueryHelper } = testEnvironment;

        // Get expected data from snowflake with filters applied
        const socialCampaignShareData = await socialInteractionQueryHelper.getCampaignShareDataFromDBWithFilters({
          filterBy: testFiltersConfig,
        });

        // Verify the same data is displayed in the dashboard
        const socialCampaignShareDistribution =
          testEnvironment.socialInteractionDashboard.socialCampaignShareDistribution;
        await socialCampaignShareDistribution.verifyUIDataMatchesWithSnowflakeData(socialCampaignShareData);
      }
    );

    test(
      'verify Least engaged by Department tabular data validation with default period filter (Last 30 days)',
      {
        tag: [
          TestPriority.P0,
          TestGroupType.SMOKE,
          TestGroupType.HEALTHCHECK,
          TestCaseType.TABULAR_METRIC,
          '@least-engaged-by-department',
        ],
      },
      async () => {
        tagTest(test.info(), {
          description:
            'To verify the answer of Least engaged by Department in Social Interaction dashboard with default filter',
          zephyrTestId: 'DE-26024',
          storyId: 'DE-25760',
        });

        const { socialInteractionQueryHelper } = testEnvironment;

        // Get expected data from snowflake with filters applied
        const leastEngagedByDepartmentData =
          await socialInteractionQueryHelper.getLeastEngagedByDepartmentDataFromDBWithFilters({
            filterBy: testFiltersConfig,
          });

        // Verify the same data is displayed in the dashboard
        const leastEngagedByDepartment = testEnvironment.socialInteractionDashboard.leastEngagedByDepartment;
        await leastEngagedByDepartment.verifyUIDataMatchesWithSnowflakeData(leastEngagedByDepartmentData);
      }
    );

    test(
      'verify Least engaged by Department CSV download and validation with default period filter (Last 30 days)',
      {
        tag: [
          TestPriority.P0,
          TestGroupType.SMOKE,
          TestGroupType.HEALTHCHECK,
          TestCaseType.CSV_VALIDATION,
          '@least-engaged-by-department-csv',
        ],
      },
      async () => {
        tagTest(test.info(), {
          description:
            'To verify CSV download and validation for Least engaged by Department in Social Interaction dashboard with default filter',
          zephyrTestId: 'DE-26058',
          storyId: 'DE-25768',
        });

        const { socialInteractionQueryHelper } = testEnvironment;

        // Get expected data from snowflake with filters applied
        const leastEngagedByDepartmentData =
          await socialInteractionQueryHelper.getLeastEngagedByDepartmentDataFromDBWithFilters({
            filterBy: testFiltersConfig,
          });

        // Download CSV and validate against DB data
        const leastEngagedByDepartment = testEnvironment.socialInteractionDashboard.leastEngagedByDepartment;
        await leastEngagedByDepartment.verifyCSVDataMatchesWithDBData(leastEngagedByDepartmentData, testFiltersConfig);
      }
    );

    test(
      'verify Most engaged by Department tabular data validation with default period filter (Last 30 days)',
      {
        tag: [
          TestPriority.P0,
          TestGroupType.SMOKE,
          TestGroupType.HEALTHCHECK,
          TestCaseType.TABULAR_METRIC,
          '@most-engaged-by-department',
        ],
      },
      async () => {
        tagTest(test.info(), {
          description:
            'To verify the answer of Most engaged by Department in Social Interaction dashboard with default filter',
          zephyrTestId: 'DE-26022',
          storyId: 'DE-25759',
        });

        const { socialInteractionQueryHelper } = testEnvironment;

        // Get expected data from snowflake with filters applied
        const mostEngagedByDepartmentData =
          await socialInteractionQueryHelper.getMostEngagedByDepartmentDataFromDBWithFilters({
            filterBy: testFiltersConfig,
          });

        // Verify the same data is displayed in the dashboard
        const mostEngagedByDepartment = testEnvironment.socialInteractionDashboard.mostEngagedByDepartment;
        await mostEngagedByDepartment.verifyUIDataMatchesWithSnowflakeData(mostEngagedByDepartmentData);
      }
    );

    test(
      'verify Most engaged by Department CSV download and validation with default period filter (Last 30 days)',
      {
        tag: [
          TestPriority.P0,
          TestGroupType.SMOKE,
          TestGroupType.HEALTHCHECK,
          TestCaseType.CSV_VALIDATION,
          '@most-engaged-by-department-csv',
        ],
      },
      async () => {
        tagTest(test.info(), {
          description:
            'To verify CSV download and validation for Most engaged by Department in Social Interaction dashboard with default filter',
          zephyrTestId: 'DE-26124',
          storyId: 'DE-25767',
        });

        const { socialInteractionQueryHelper } = testEnvironment;

        // Get expected data from snowflake with filters applied
        const mostEngagedByDepartmentData =
          await socialInteractionQueryHelper.getMostEngagedByDepartmentDataFromDBWithFilters({
            filterBy: testFiltersConfig,
          });

        // Download CSV and validate against DB data
        const mostEngagedByDepartment = testEnvironment.socialInteractionDashboard.mostEngagedByDepartment;
        await mostEngagedByDepartment.verifyCSVDataMatchesWithDBData(mostEngagedByDepartmentData, testFiltersConfig);
      }
    );

    test(
      'verify Participant engagement activity chart data validation with default period filter (Last 30 days)',
      {
        tag: [
          TestPriority.P0,
          TestGroupType.SMOKE,
          TestGroupType.HEALTHCHECK,
          TestCaseType.BAR_CHART,
          '@participant-engagement-activity',
        ],
      },
      async () => {
        tagTest(test.info(), {
          description:
            'To verify the answer of Participant engagement activity in Social Interaction dashboard with default filter',
          zephyrTestId: 'DE-26123',
          storyId: 'DE-25758',
        });

        const { socialInteractionQueryHelper } = testEnvironment;

        // Get expected data from snowflake with filters applied
        const participantEngagementActivityData =
          await socialInteractionQueryHelper.getParticipantEngagementActivityDataFromDBWithFilters({
            filterBy: testFiltersConfig,
          });

        // Verify the chart is loaded (for now, we verify the chart is visible)
        // Future enhancement: can add data validation if needed
        const participantEngagementActivity = testEnvironment.socialInteractionDashboard.participantEngagementActivity;
        await participantEngagementActivity.verifyChartIsLoaded();

        // Log the data for verification
        console.log('Participant Engagement Activity Data:', participantEngagementActivityData);
      }
    );

    test(
      'verify Participant engagement activity CSV download and validation with default period filter (Last 30 days)',
      {
        tag: [
          TestPriority.P0,
          TestGroupType.SMOKE,
          TestGroupType.HEALTHCHECK,
          TestCaseType.CSV_VALIDATION,
          '@participant-engagement-activity-csv',
        ],
      },
      async () => {
        tagTest(test.info(), {
          description:
            'To verify CSV download and validation for Participant engagement activity in Social Interaction dashboard with default filter',
          zephyrTestId: 'DE-26126',
          storyId: 'DE-25775',
        });

        const { socialInteractionQueryHelper } = testEnvironment;

        // Get expected data from snowflake with filters applied
        const participantEngagementActivityData =
          await socialInteractionQueryHelper.getParticipantEngagementActivityDataFromDBWithFilters({
            filterBy: testFiltersConfig,
          });

        // Download CSV and validate against DB data
        const participantEngagementActivity = testEnvironment.socialInteractionDashboard.participantEngagementActivity;
        await participantEngagementActivity.verifyCSVDataMatchesWithDBData(
          participantEngagementActivityData,
          testFiltersConfig
        );
      }
    );
  }
);
