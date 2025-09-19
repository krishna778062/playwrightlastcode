import { DataEngineeringTestSuite } from '@data-engineering/constants/testSuite';
import { expect, test } from '@data-engineering/fixtures/analyticsFixture';
import { SnowflakeHelper } from '@data-engineering/helpers/snowflakeHelper';
import { SocialInteractionPage } from '@data-engineering/pages/socialInteractionPage';

import { TestPriority } from '@core/constants/testPriority';
import { TestGroupType } from '@core/constants/testType';
import { tagTest } from '@core/utils/testDecorator';

import { SocialInteractionSql } from '../../sql/social-interaction';

/**
 * This test suite validates the Social Interaction dashboard
 * using a data-driven approach
 */

const HERO_METRICS_DATA = [
  {
    title: 'Reactions',
    query: 'SocialInteractionSql.Reaction_Count',
    zephyrTestId: 'DE-26105',
    storyId: 'DE-25753',
    description: 'TS To verify the answer of Reactions in Social Interaction dashboard',
    min: 0,
  },
  {
    title: 'Feed posts and comments',
    query: 'SocialInteractionSql.Feed_Posts_Comments_Count',
    zephyrTestId: 'DE-26020',
    storyId: 'DE-25754',
    description: 'TS To verify the answer of Feed posts and comments in Social Interaction dashboard',
    min: 0,
  },
  {
    title: 'Replies',
    query: 'SocialInteractionSql.Replies_Count',
    zephyrTestId: 'DE-26107',
    storyId: 'DE-25755',
    description: 'TS To verify the answer of Replies in Social Interaction dashboard',
    min: 0,
  },
  {
    title: 'Shares',
    query: 'SocialInteractionSql.Shares_Count',
    zephyrTestId: 'DE-26037',
    storyId: 'DE-25769',
    description: 'TS To verify the answer of Shares in Social Interaction dashboard',
    min: 0,
  },
  {
    title: 'Favorites',
    query: 'SocialInteractionSql.Favorites_Count',
    zephyrTestId: 'DE-26018',
    storyId: 'DE-25756',
    description: 'TS To verify the answer of Favorites in Social Interaction dashboard',
    min: 0,
  },
  {
    title: 'Active social campaign',
    query: 'SocialInteractionSql.Active_Campaign_Count',
    zephyrTestId: 'DE-26016',
    storyId: 'DE-25757',
    description: 'TS To verify the answer of Active social campaign in Social Interaction dashboard',
    min: 0,
  },
] as const;

test.describe(
  'Social Interaction Dashboard',
  {
    tag: [DataEngineeringTestSuite.SOCIAL_INTERACTION],
  },
  () => {
    for (const metricData of HERO_METRICS_DATA) {
      test(
        `Verify ${metricData.title} metric data validation`,
        {
          tag: [TestPriority.P0, TestGroupType.REGRESSION],
        },
        async ({ openAppAnalytics, page }) => {
          await openAppAnalytics();

          const socialInteractionPage = new SocialInteractionPage(page);

          await socialInteractionPage.navigateToSocialInteraction();

          tagTest(test.info(), {
            description: metricData.description,
            zephyrTestId: metricData.zephyrTestId,
            storyId: metricData.storyId,
          });

          //UI validation
          await socialInteractionPage.verifyMetricTitleIsVisible(metricData.title);
          const metricValue = await socialInteractionPage.getMetricValue(metricData.title);
          console.log(`${metricData.title}: ${metricValue}`);

          //Data sanity validation
          await socialInteractionPage.verifyMetricHasValidValue(metricData.title);

          const numericValue = parseInt(metricValue.replace(/,/g, ''));
          expect(numericValue, `${metricData.title} should be >= ${metricData.min}`).toBeGreaterThanOrEqual(
            metricData.min
          );

          //DB validation
          const sqlKey = metricData.query.split('.').pop() as keyof typeof SocialInteractionSql;
          const rawSql = SocialInteractionSql[sqlKey];
          if (!rawSql) {
            throw new Error(`SQL not found for key: ${String(sqlKey)}`);
          }

          const dbCountRaw = await SnowflakeHelper.getDataForSqlQuery(rawSql);
          const dbCount = typeof dbCountRaw === 'string' ? parseInt(dbCountRaw, 10) : Number(dbCountRaw);

          console.log(`DB ${metricData.title}: ${dbCount}`);
          expect(numericValue, `${metricData.title} UI (${numericValue}) should equal DB (${dbCount})`).toBe(dbCount);
        }
      );
    }
  }
);
