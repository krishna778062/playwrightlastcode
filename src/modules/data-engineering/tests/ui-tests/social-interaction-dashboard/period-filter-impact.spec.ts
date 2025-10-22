import { PeriodFilterTimeRange } from '@data-engineering/constants/periodFilterTimeRange';
import { DataEngineeringTestSuite } from '@data-engineering/constants/testSuite';
import { SocialInteractionSql } from '@data-engineering/sqlQueries/social-interaction';
import { Page, test } from '@playwright/test';

import { TestPriority } from '@core/constants/testPriority';
import { TestGroupType } from '@core/constants/testType';
import { tagTest } from '@core/utils/testDecorator';

import { SnowflakeHelper, SocialInteractionDashboardQueryHelper } from '../../../helpers';
import { DateHelper } from '../../../helpers/dateHelper';
import { SocialInteractionDashboard } from '../../../ui/dashboards';

import {
  cleanupDashboardTesting,
  setupSocialInteractionDashboardForTest,
  UserRole,
} from '@/src/modules/data-engineering/helpers/dashboardSetupHelper';

test.describe(
  'social Interaction Dashboard - Custom Period Filter Impact Validation',
  {
    tag: [DataEngineeringTestSuite.SOCIAL_INTERACTION, '@period-filter-impact', '@custom-period'],
  },
  () => {
    // Generate dynamic custom date range
    const customDateRange = DateHelper.createTestCustomDateRange();

    let testEnvironment: {
      page: Page;
      socialInteractionDashboard: SocialInteractionDashboard;
      socialInteractionQueryHelper: SocialInteractionDashboardQueryHelper;
      snowflakeHelper: SnowflakeHelper;
    };

    test.beforeAll(async ({ browser }) => {
      // Setup dashboard using dedicated method
      testEnvironment = await setupSocialInteractionDashboardForTest(browser, UserRole.APP_MANAGER);

      // Apply custom period filter once (now using ISO format)
      await testEnvironment.socialInteractionDashboard.analyticsFiltersComponent.applyPeriodFilter(
        PeriodFilterTimeRange.CUSTOM,
        {
          customStartDate: customDateRange.startDate,
          customEndDate: customDateRange.endDate,
        }
      );
    });

    test.afterAll(async () => {
      // Cleanup using helper
      await cleanupDashboardTesting(testEnvironment);
    });

    test(
      `verify Reaction/Like metric data validation - custom date range`,
      {
        tag: [TestPriority.P0, TestGroupType.REGRESSION, '@reactions-or-likes'],
      },
      async () => {
        tagTest(test.info(), {
          description: 'To verify the answer of Reactions / Likes in Social Interaction dashboard',
          zephyrTestId: 'DE-26105',
          storyId: 'DE-25753',
        });

        //get expected metric value from snowflake
        const expectedMetricValue = await testEnvironment.socialInteractionQueryHelper.getHeroMetricDataFromDB(
          SocialInteractionSql.Reaction_Count,
          PeriodFilterTimeRange.CUSTOM,
          customDateRange.startDate,
          customDateRange.endDate
        );

        //UI validation
        const reactionsOrLikesMetric = testEnvironment.socialInteractionDashboard.reactionsOrLikesMetrics;
        await reactionsOrLikesMetric.verifyMetricUIDataPoints();
        await reactionsOrLikesMetric.verifyMetricValue(expectedMetricValue);
      }
    );

    test(
      `verify Feed posts and comments metric data validation - custom date range`,
      {
        tag: [TestPriority.P0, TestGroupType.REGRESSION, '@feed-posts-and-comments'],
      },
      async () => {
        tagTest(test.info(), {
          description: 'To verify the answer of Feed posts and comments in Social Interaction dashboard',
          zephyrTestId: 'DE-26020',
          storyId: 'DE-25754',
        });

        //get expected metric value from snowflake
        const expectedMetricValue = await testEnvironment.socialInteractionQueryHelper.getHeroMetricDataFromDB(
          SocialInteractionSql.Feed_Posts_Comments_Count,
          PeriodFilterTimeRange.CUSTOM,
          customDateRange.startDate,
          customDateRange.endDate
        );

        //UI validation
        const feedPostsAndCommentsMetric = testEnvironment.socialInteractionDashboard.feedPostsAndComments;
        await feedPostsAndCommentsMetric.verifyMetricIsLoaded();
        await feedPostsAndCommentsMetric.verifyMetricValueIsLoadedForHeroMetric(expectedMetricValue);
      }
    );

    test(
      `verify Replies metric data validation - custom date range`,
      {
        tag: [TestPriority.P0, TestGroupType.REGRESSION, '@replies'],
      },
      async () => {
        tagTest(test.info(), {
          description: 'To verify the answer of Replies in Social Interaction dashboard',
          zephyrTestId: 'DE-26107',
          storyId: 'DE-25754',
        });

        //get expected metric value from snowflake
        const expectedMetricValue = await testEnvironment.socialInteractionQueryHelper.getHeroMetricDataFromDB(
          SocialInteractionSql.Replies_Count,
          PeriodFilterTimeRange.CUSTOM,
          customDateRange.startDate,
          customDateRange.endDate
        );

        //UI validation
        const repliesMetric = testEnvironment.socialInteractionDashboard.replies;
        await repliesMetric.verifyMetricIsLoaded();
        await repliesMetric.verifyMetricValueIsLoadedForHeroMetric(expectedMetricValue);
      }
    );

    test(
      `verify Shares metric data validation - custom date range`,
      {
        tag: [TestPriority.P0, TestGroupType.REGRESSION, '@shares'],
      },
      async () => {
        tagTest(test.info(), {
          description: 'To verify the answer of Shares in Social Interaction dashboard',
          zephyrTestId: 'DE-26037',
          storyId: 'DE-25769',
        });

        //get expected metric value from snowflake
        const expectedMetricValue = await testEnvironment.socialInteractionQueryHelper.getHeroMetricDataFromDB(
          SocialInteractionSql.Shares_Count,
          PeriodFilterTimeRange.CUSTOM,
          customDateRange.startDate,
          customDateRange.endDate
        );

        //UI validation
        const sharesMetric = testEnvironment.socialInteractionDashboard.shares;
        await sharesMetric.verifyMetricIsLoaded();
        await sharesMetric.verifyMetricValueIsLoadedForHeroMetric(expectedMetricValue);
      }
    );

    test(
      `verify Favorites metric data validation - custom date range`,
      {
        tag: [TestPriority.P0, TestGroupType.REGRESSION, '@favorites'],
      },
      async () => {
        tagTest(test.info(), {
          description: 'To verify the answer of Favorites in Social Interaction dashboard',
          zephyrTestId: 'DE-26018',
          storyId: 'DE-25756',
        });

        //get expected metric value from snowflake
        const expectedMetricValue = await testEnvironment.socialInteractionQueryHelper.getHeroMetricDataFromDB(
          SocialInteractionSql.Favorites_Count,
          PeriodFilterTimeRange.CUSTOM,
          customDateRange.startDate,
          customDateRange.endDate
        );

        //UI validation
        const favoritesMetric = testEnvironment.socialInteractionDashboard.favorites;
        await favoritesMetric.verifyMetricIsLoaded();
        await favoritesMetric.verifyMetricValueIsLoadedForHeroMetric(expectedMetricValue);
      }
    );

    //tabular data validations
    test(
      `verify social campaign shares tabular data validation - custom date range`,
      {
        tag: [TestPriority.P0, TestGroupType.REGRESSION, '@social-campaign-shares'],
      },
      async () => {
        tagTest(test.info(), {
          description: 'To verify the answer of Social campaign shares in Social Interaction dashboard',
          zephyrTestId: 'DE-26016',
          storyId: 'DE-25757',
        });
        const socialCampaignShareData = await testEnvironment.socialInteractionQueryHelper.getCampaignShareDataFromDB(
          SocialInteractionSql.Social_Campaign_Shares,
          PeriodFilterTimeRange.CUSTOM,
          customDateRange.startDate,
          customDateRange.endDate
        );
        //verify the same data is displayed in the dashboard
        const socialCampaignShareDistribution =
          testEnvironment.socialInteractionDashboard.socialCampaignShareDistribution;
        await socialCampaignShareDistribution.verifyDataMatchesWithSnowflakeData(socialCampaignShareData);
      }
    );

    //TODO: Implement the query - here
    test.fixme(
      `verify Least engaged by Department tabular data validation - custom date range`,
      {
        tag: [TestPriority.P0, TestGroupType.REGRESSION, '@least-engaged-by-department'],
      },
      async () => {
        tagTest(test.info(), {
          description: 'To verify the answer of Least engaged by Department in Social Interaction dashboard',
          zephyrTestId: 'DE-26017',
          storyId: 'DE-25757',
        });
      }
    );

    //TODO: Implement the query - here
    test.fixme(
      `verify Most engaged by Department tabular data validation - custom date range`,
      {
        tag: [TestPriority.P0, TestGroupType.REGRESSION, '@most-engaged-by-department'],
      },
      async () => {
        tagTest(test.info(), {
          description: 'To verify the answer of Most engaged by Department in Social Interaction dashboard',
          zephyrTestId: 'DE-26018',
          storyId: 'DE-25757',
        });
      }
    );
  }
);
