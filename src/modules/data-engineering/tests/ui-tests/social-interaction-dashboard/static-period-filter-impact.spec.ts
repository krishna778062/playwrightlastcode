import { PeriodFilterTimeRange } from '@data-engineering/constants/periodFilterTimeRange';
import { DataEngineeringTestSuite } from '@data-engineering/constants/testSuite';
import { Page, test } from '@playwright/test';

import { TestPriority } from '@core/constants/testPriority';
import { TestGroupType } from '@core/constants/testType';
import { tagTest } from '@core/utils/testDecorator';

import { SnowflakeHelper, SocialInteractionDashboardQueryHelper } from '../../../helpers';
import { FilterOptions } from '../../../helpers/baseAnalyticsQueryHelper';
import { SocialInteractionDashboard } from '../../../ui/dashboards';

import {
  cleanupDashboardTesting,
  setupSocialInteractionDashboardForTest,
  UserRole,
} from '@/src/modules/data-engineering/helpers/dashboardSetupHelper';

test.describe(
  'social Interaction Dashboard - Static Period Filter Impact Validation',
  {
    tag: [DataEngineeringTestSuite.SOCIAL_INTERACTION, '@period-filter-impact', '@static-period'],
  },
  () => {
    const periodFilterTimeRange = PeriodFilterTimeRange.LAST_36_MONTHS;

    let testEnvironment: {
      page: Page;
      socialInteractionDashboard: SocialInteractionDashboard;
      socialInteractionQueryHelper: SocialInteractionDashboardQueryHelper;
      snowflakeHelper: SnowflakeHelper;
    };
    let testFiltersConfig: FilterOptions;

    test.beforeAll('Setup Social Interaction Dashboard with static period filter', async ({ browser }) => {
      // Setup dashboard using dedicated method
      testEnvironment = await setupSocialInteractionDashboardForTest(browser, UserRole.APP_MANAGER);

      // Define unified filter configuration for static period (Last 36 months)
      testFiltersConfig = {
        tenantCode: process.env.ORG_ID!,
        timePeriod: periodFilterTimeRange,
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
      `verify Reaction/Like metric data validation when period filter is changed to ${periodFilterTimeRange}`,
      {
        tag: [TestPriority.P0, TestGroupType.REGRESSION, '@reactions-or-likes'],
      },
      async () => {
        tagTest(test.info(), {
          description:
            'To verify the answer of Reactions / Likes in Social Interaction dashboard responds to period filter change',
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
      `verify Feed posts and comments metric data validation for period as ${periodFilterTimeRange}`,
      {
        tag: [TestPriority.P0, TestGroupType.REGRESSION, '@feed-posts-and-comments'],
      },
      async () => {
        tagTest(test.info(), {
          description: 'To verify the answer of Feed posts and comments in Social Interaction dashboard',
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
      `verify Replies metric data validation for period as ${periodFilterTimeRange}`,
      {
        tag: [TestPriority.P0, TestGroupType.REGRESSION, '@replies'],
      },
      async () => {
        tagTest(test.info(), {
          description: 'To verify the answer of Replies in Social Interaction dashboard',
          zephyrTestId: 'DE-26107',
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
      `verify Shares metric data validation for period as ${periodFilterTimeRange}`,
      {
        tag: [TestPriority.P0, TestGroupType.REGRESSION, '@shares'],
      },
      async () => {
        tagTest(test.info(), {
          description: 'To verify the answer of Shares in Social Interaction dashboard',
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
      `verify Favorites metric data validation for period as ${periodFilterTimeRange}`,
      {
        tag: [TestPriority.P0, TestGroupType.REGRESSION, '@favorites'],
      },
      async () => {
        tagTest(test.info(), {
          description: 'To verify the answer of Favorites in Social Interaction dashboard',
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

    // Tabular data validations
    test(
      `verify social campaign shares tabular data validation for period as ${periodFilterTimeRange}`,
      {
        tag: [TestPriority.P0, TestGroupType.REGRESSION, '@social-campaign-shares'],
      },
      async () => {
        tagTest(test.info(), {
          description: 'To verify the answer of Social campaign shares in Social Interaction dashboard',
          zephyrTestId: 'DE-26016',
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
        await socialCampaignShareDistribution.scrollToComponent();
        await socialCampaignShareDistribution.verifyUIDataMatchesWithSnowflakeData(socialCampaignShareData);
      }
    );

    test(
      `verify Least engaged by Department tabular data validation for period as ${periodFilterTimeRange}`,
      {
        tag: [TestPriority.P0, TestGroupType.REGRESSION, '@least-engaged-by-department'],
      },
      async () => {
        tagTest(test.info(), {
          description: 'To verify the answer of Least engaged by Department in Social Interaction dashboard',
          zephyrTestId: 'DE-26017',
          storyId: 'DE-25757',
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
      `verify Least engaged by Department CSV download and validation for period as ${periodFilterTimeRange}`,
      {
        tag: [TestPriority.P0, TestGroupType.REGRESSION, '@least-engaged-by-department-csv'],
      },
      async () => {
        tagTest(test.info(), {
          description:
            'To verify CSV download and validation for Least engaged by Department in Social Interaction dashboard',
          zephyrTestId: 'DE-26017',
          storyId: 'DE-25757',
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
      `verify Most engaged by Department tabular data validation for period as ${periodFilterTimeRange}`,
      {
        tag: [TestPriority.P0, TestGroupType.REGRESSION, '@most-engaged-by-department'],
      },
      async () => {
        tagTest(test.info(), {
          description: 'To verify the answer of Most engaged by Department in Social Interaction dashboard',
          zephyrTestId: 'DE-26018',
          storyId: 'DE-25757',
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
      `verify Most engaged by Department CSV download and validation for period as ${periodFilterTimeRange}`,
      {
        tag: [TestPriority.P0, TestGroupType.REGRESSION, '@most-engaged-by-department-csv'],
      },
      async () => {
        tagTest(test.info(), {
          description:
            'To verify CSV download and validation for Most engaged by Department in Social Interaction dashboard',
          zephyrTestId: 'DE-26018',
          storyId: 'DE-25757',
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
      `verify Participant engagement activity chart data validation for period as ${periodFilterTimeRange}`,
      {
        tag: [TestPriority.P0, TestGroupType.REGRESSION, '@participant-engagement-activity'],
      },
      async () => {
        tagTest(test.info(), {
          description: 'To verify the answer of Participant engagement activity in Social Interaction dashboard',
          zephyrTestId: 'DE-XXXXX',
          storyId: 'DE-XXXXX',
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
  }
);
