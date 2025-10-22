import { DataEngineeringTestSuite } from '@data-engineering/constants/testSuite';
import { SocialInteractionSql } from '@data-engineering/sqlQueries/social-interaction';
import { Page, test } from '@playwright/test';

import { TestPriority } from '@core/constants/testPriority';
import { TestGroupType } from '@core/constants/testType';
import { tagTest } from '@core/utils/testDecorator';

import { PeriodFilterTimeRange } from '../../../constants/periodFilterTimeRange';
import { SnowflakeHelper, SocialInteractionDashboardQueryHelper } from '../../../helpers';
import { SocialInteractionDashboard } from '../../../ui/dashboards';

import {
  cleanupDashboardTesting,
  setupSocialInteractionDashboardForTest,
  UserRole,
} from '@/src/modules/data-engineering/helpers/dashboardSetupHelper';

test.describe(
  'social Interaction Dashboard - Default State Validation',
  {
    tag: [DataEngineeringTestSuite.SOCIAL_INTERACTION, '@default-state'],
  },
  () => {
    let testEnvironment: {
      page: Page;
      socialInteractionDashboard: SocialInteractionDashboard;
      socialInteractionQueryHelper: SocialInteractionDashboardQueryHelper;
      snowflakeHelper: SnowflakeHelper;
    };

    const defaultPeriodFilter = PeriodFilterTimeRange.LAST_30_DAYS;

    test.beforeAll('Setup Social Interaction Dashboard', async ({ browser }) => {
      // Setup dashboard using dedicated method
      // No filters applied - testing default state (Last 30 days)
      testEnvironment = await setupSocialInteractionDashboardForTest(browser, UserRole.APP_MANAGER);
    });

    test.afterAll('Cleanup Social Interaction Dashboard', async () => {
      // Cleanup using helper
      await cleanupDashboardTesting(testEnvironment);
    });

    test(
      'verify Reaction/Like metric data validation with default period filter (Last 30 days)',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, '@reactions-or-likes'],
      },
      async () => {
        tagTest(test.info(), {
          description: 'To verify the answer of Reactions / Likes in Social Interaction dashboard with default filter',
          zephyrTestId: 'DE-26105',
          storyId: 'DE-25753',
        });

        //get expected metric value from snowflake with default period (Last 30 days)
        const expectedMetricValue = await testEnvironment.socialInteractionQueryHelper.getHeroMetricDataFromDB(
          SocialInteractionSql.Reaction_Count,
          defaultPeriodFilter
        );

        //UI validation
        const reactionsOrLikesMetric = testEnvironment.socialInteractionDashboard.reactionsOrLikesMetrics;
        await reactionsOrLikesMetric.verifyMetricUIDataPoints();
        await reactionsOrLikesMetric.verifyMetricValue(expectedMetricValue);
      }
    );

    test(
      'verify Feed posts and comments metric data validation with default period filter (Last 30 days)',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, '@feed-posts-and-comments'],
      },
      async () => {
        tagTest(test.info(), {
          description:
            'To verify the answer of Feed posts and comments in Social Interaction dashboard with default filter',
          zephyrTestId: 'DE-26020',
          storyId: 'DE-25754',
        });

        //get expected metric value from snowflake with default period (Last 30 days)
        const expectedMetricValue = await testEnvironment.socialInteractionQueryHelper.getHeroMetricDataFromDB(
          SocialInteractionSql.Feed_Posts_Comments_Count,
          defaultPeriodFilter
        );

        //UI validation
        const feedPostsAndCommentsMetric = testEnvironment.socialInteractionDashboard.feedPostsAndComments;
        await feedPostsAndCommentsMetric.verifyMetricIsLoaded();
        await feedPostsAndCommentsMetric.verifyMetricValueIsLoadedForHeroMetric(expectedMetricValue);
      }
    );

    test(
      'verify Replies metric data validation with default period filter (Last 30 days)',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, '@replies'],
      },
      async () => {
        tagTest(test.info(), {
          description: 'To verify the answer of Replies in Social Interaction dashboard with default filter',
          zephyrTestId: 'DE-26107',
          storyId: 'DE-25754',
        });

        //get expected metric value from snowflake with default period (Last 30 days)
        const expectedMetricValue = await testEnvironment.socialInteractionQueryHelper.getHeroMetricDataFromDB(
          SocialInteractionSql.Replies_Count,
          defaultPeriodFilter
        );

        //UI validation
        const repliesMetric = testEnvironment.socialInteractionDashboard.replies;
        await repliesMetric.verifyMetricIsLoaded();
        await repliesMetric.verifyMetricValueIsLoadedForHeroMetric(expectedMetricValue);
      }
    );

    test(
      'verify Shares metric data validation with default period filter (Last 30 days)',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, '@shares'],
      },
      async () => {
        tagTest(test.info(), {
          description: 'To verify the answer of Shares in Social Interaction dashboard with default filter',
          zephyrTestId: 'DE-26037',
          storyId: 'DE-25769',
        });

        //get expected metric value from snowflake with default period (Last 30 days)
        const expectedMetricValue = await testEnvironment.socialInteractionQueryHelper.getHeroMetricDataFromDB(
          SocialInteractionSql.Shares_Count,
          defaultPeriodFilter
        );

        //UI validation
        const sharesMetric = testEnvironment.socialInteractionDashboard.shares;
        await sharesMetric.verifyMetricIsLoaded();
        await sharesMetric.verifyMetricValueIsLoadedForHeroMetric(expectedMetricValue);
      }
    );

    test(
      'verify Favorites metric data validation with default period filter (Last 30 days)',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, '@favorites'],
      },
      async () => {
        tagTest(test.info(), {
          description: 'To verify the answer of Favorites in Social Interaction dashboard with default filter',
          zephyrTestId: 'DE-26018',
          storyId: 'DE-25756',
        });

        //get expected metric value from snowflake with default period (Last 30 days)
        const expectedMetricValue = await testEnvironment.socialInteractionQueryHelper.getHeroMetricDataFromDB(
          SocialInteractionSql.Favorites_Count,
          defaultPeriodFilter
        );

        //UI validation
        const favoritesMetric = testEnvironment.socialInteractionDashboard.favorites;
        await favoritesMetric.verifyMetricIsLoaded();
        await favoritesMetric.verifyMetricValueIsLoadedForHeroMetric(expectedMetricValue);
      }
    );

    //tabular data validations
    test(
      'verify social campaign shares tabular data validation with default period filter (Last 30 days)',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, '@social-campaign-shares'],
      },
      async () => {
        tagTest(test.info(), {
          description:
            'To verify the answer of Social campaign shares in Social Interaction dashboard with default filter',
          zephyrTestId: 'DE-26016',
          storyId: 'DE-25757',
        });

        const socialCampaignShareData = await testEnvironment.socialInteractionQueryHelper.getCampaignShareDataFromDB(
          SocialInteractionSql.Social_Campaign_Shares,
          defaultPeriodFilter
        );

        //verify the same data is displayed in the dashboard
        const socialCampaignShareDistribution =
          testEnvironment.socialInteractionDashboard.socialCampaignShareDistribution;
        await socialCampaignShareDistribution.verifyDataMatchesWithSnowflakeData(socialCampaignShareData);
      }
    );

    //TODO: Implement the query - here
    test.fixme(
      'verify Least engaged by Department tabular data validation with default period filter (Last 30 days)',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, '@least-engaged-by-department'],
      },
      async () => {
        tagTest(test.info(), {
          description:
            'To verify the answer of Least engaged by Department in Social Interaction dashboard with default filter',
          zephyrTestId: 'DE-26017',
          storyId: 'DE-25757',
        });
      }
    );

    //TODO: Implement the query - here
    test.fixme(
      'verify Most engaged by Department tabular data validation with default period filter (Last 30 days)',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, '@most-engaged-by-department'],
      },
      async () => {
        tagTest(test.info(), {
          description:
            'To verify the answer of Most engaged by Department in Social Interaction dashboard with default filter',
          zephyrTestId: 'DE-26018',
          storyId: 'DE-25757',
        });
      }
    );
  }
);
