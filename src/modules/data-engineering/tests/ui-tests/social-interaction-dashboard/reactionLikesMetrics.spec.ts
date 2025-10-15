import { PeriodFilterTimeRange } from '@data-engineering/constants/periodFilterTimeRange';
import { DataEngineeringTestSuite } from '@data-engineering/constants/testSuite';
import { analyticsTestFixture as test } from '@data-engineering/fixtures/analyticsFixture';
import { SocialInteractionSql } from '@data-engineering/sqlQueries/social-interaction';
import { createCustomDateRange } from '@data-engineering/utils/dateUtils';

import { TestPriority } from '@core/constants/testPriority';
import { TestGroupType } from '@core/constants/testType';
import { tagTest } from '@core/utils/testDecorator';

/**
 * This test suite validates the Social Interaction dashboard
 * by verifying the data in the UI and the DB for various interaction metrics and social campaign share distribution
 */

// const HERO_METRICS_DATA = [
//   {
//     title: 'Reactions / Likes',
//     subTitle: 'Total user reactions/likes to posts, comments, and replies',
//     query: SocialInteractionSql.Reaction_Count,
//     zephyrTestId: 'DE-26105',
//     storyId: 'DE-25753',
//     description: 'TS To verify the answer of Reactions in Social Interaction dashboard',
//   },
//   // {
//   //   title: 'Feed posts and comments',
//   //   subTitle: 'Total number of posts and comments added to the platform feed',
//   //   query: SocialInteractionSql.Feed_Posts_Comments_Count,
//   //   zephyrTestId: 'DE-26020',
//   //   storyId: 'DE-25754',
//   //   description: 'TS To verify the answer of Feed posts and comments in Social Interaction dashboard',
//   // },
//   // {
//   //   title: 'Replies',
//   //   subTitle: 'Number of responses or direct replies to posts or comments',
//   //   query: SocialInteractionSql.Replies_Count,
//   //   zephyrTestId: 'DE-26107',
//   //   storyId: 'DE-25755',
//   //   description: 'TS To verify the answer of Replies in Social Interaction dashboard',
//   // },
//   // {
//   //   title: 'Shares',
//   //   subTitle: 'Number of times content has been shared by users',
//   //   query: SocialInteractionSql.Shares_Count,
//   //   zephyrTestId: 'DE-26037',
//   //   storyId: 'DE-25769',
//   //   description: 'TS To verify the answer of Shares in Social Interaction dashboard',
//   // },
//   // {
//   //   title: 'Favorites',
//   //   subTitle: 'Number of times content was marked as a favorite by users',
//   //   query: SocialInteractionSql.Favorites_Count,
//   //   zephyrTestId: 'DE-26018',
//   //   storyId: 'DE-25756',
//   //   description: 'TS To verify the answer of Favorites in Social Interaction dashboard',
//   // },
//   // {
//   //   title: 'Social campaigns',
//   //   subTitle: 'Number of active social campaigns over the selected time period',
//   //   query: SocialInteractionSql.Active_Campaign_Count,
//   //   zephyrTestId: 'DE-26016',
//   //   storyId: 'DE-25757',
//   //   description: 'TS To verify the answer of Active social campaign in Social Interaction dashboard',
//   // },
// ] as const;

test.describe(
  'social Interaction Dashboard - Reaction Likes Metrics',
  {
    tag: [DataEngineeringTestSuite.SOCIAL_INTERACTION],
  },
  () => {
    test(
      `verify Reactions / Likes metric data validation for period as Last 36 months`,
      {
        tag: [TestPriority.P0, TestGroupType.REGRESSION],
      },
      async ({ appManagerFixture }) => {
        tagTest(test.info(), {
          description: 'To verify the answer of Reactions / Likes in Social Interaction dashboard',
          zephyrTestId: 'DE-26105',
          storyId: 'DE-25753',
        });

        const { socialInteractionDashboard, socialInteractionQueryHelper } = appManagerFixture;
        await socialInteractionDashboard.loadPage();
        await socialInteractionDashboard.analyticsFiltersComponent.applyPeriodFilter(
          PeriodFilterTimeRange.LAST_36_MONTHS
        );

        //get expected metric value from snowflake
        const expectedMetricValue = await socialInteractionQueryHelper.getHeroMetricDataFromDB(
          SocialInteractionSql.Reaction_Count,
          PeriodFilterTimeRange.LAST_36_MONTHS
        );

        //UI validation
        const reactionsOrLikesMetric = socialInteractionDashboard.reactionsOrLikesMetrics;
        await reactionsOrLikesMetric.verifyMetricUIDataPoints();
        await reactionsOrLikesMetric.verifyMetricValue(expectedMetricValue);
      }
    );

    test(
      `verify Reactions / Likes metric data validation - custom date range`,
      {
        tag: [TestPriority.P0, TestGroupType.REGRESSION],
      },
      async ({ appManagerFixture }) => {
        tagTest(test.info(), {
          description: 'To verify the answer of Reactions / Likes in Social Interaction dashboard',
          zephyrTestId: 'DE-26105',
          storyId: 'DE-25753',
        });

        const { socialInteractionDashboard, socialInteractionQueryHelper } = appManagerFixture;
        await socialInteractionDashboard.loadPage();
        //apply period filter
        await socialInteractionDashboard.analyticsFiltersComponent.applyPeriodFilter(
          PeriodFilterTimeRange.CUSTOM,
          createCustomDateRange({
            startYear: '2024',
            startMonth: '01',
            startDay: '1',
            endYear: '2025',
            endMonth: '08',
            endDay: '1',
          })
        );

        //get expected metric value from snowflake
        const expectedMetricValue = await socialInteractionQueryHelper.getHeroMetricDataFromDB(
          SocialInteractionSql.Reaction_Count,
          PeriodFilterTimeRange.CUSTOM,
          '2024-01-1',
          '2025-08-1'
        );
        console.log(`Reactions / Likes - Expected metric value: ${expectedMetricValue}`);

        //UI validation
        const reactionsOrLikesMetric = socialInteractionDashboard.reactionsOrLikesMetrics;
        await reactionsOrLikesMetric.verifyMetricUIDataPoints();
        await reactionsOrLikesMetric.verifyMetricValue(expectedMetricValue);
      }
    );
  }
);
