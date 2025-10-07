import { DataEngineeringTestSuite } from '@data-engineering/constants/testSuite';
import { expect, test } from '@data-engineering/fixtures/analyticsFixture';
import { DateHelper } from '@data-engineering/helpers/dateHelper';
import { PageHelper } from '@data-engineering/helpers/pageHelper';
import { SnowflakeHelper } from '@data-engineering/helpers/snowflakeHelper';
import { SocialInteractionPage } from '@data-engineering/pages/socialInteractionPage';
import { SocialInteractionSql } from '@data-engineering/sql/social-interaction';

import { TestPriority } from '@core/constants/testPriority';
import { TestGroupType } from '@core/constants/testType';
import { tagTest } from '@core/utils/testDecorator';

/**
 * This test suite validates the Social Interaction dashboard
 * using a data-driven approach
 */

const HERO_METRICS_DATA = [
  {
    title: 'Reactions / Likes',
    subTitle: 'Total user reactions/likes to posts, comments, and replies',
    query: 'SocialInteractionSql.Reaction_Count',
    zephyrTestId: 'DE-26105',
    storyId: 'DE-25753',
    description: 'TS To verify the answer of Reactions in Social Interaction dashboard',
  },
  {
    title: 'Feed posts and comments',
    subTitle: 'Total number of posts and comments added to the platform feed',
    query: 'SocialInteractionSql.Feed_Posts_Comments_Count',
    zephyrTestId: 'DE-26020',
    storyId: 'DE-25754',
    description: 'TS To verify the answer of Feed posts and comments in Social Interaction dashboard',
  },
  {
    title: 'Replies',
    subTitle: 'Number of responses or direct replies to posts or comments',
    query: 'SocialInteractionSql.Replies_Count',
    zephyrTestId: 'DE-26107',
    storyId: 'DE-25755',
    description: 'TS To verify the answer of Replies in Social Interaction dashboard',
  },
  {
    title: 'Shares',
    subTitle: 'Number of times content has been shared by users',
    query: 'SocialInteractionSql.Shares_Count',
    zephyrTestId: 'DE-26037',
    storyId: 'DE-25769',
    description: 'TS To verify the answer of Shares in Social Interaction dashboard',
  },
  {
    title: 'Favorites',
    subTitle: 'Number of times content was marked as a favorite by users',
    query: 'SocialInteractionSql.Favorites_Count',
    zephyrTestId: 'DE-26018',
    storyId: 'DE-25756',
    description: 'TS To verify the answer of Favorites in Social Interaction dashboard',
  },
  {
    title: 'Social campaigns',
    subTitle: 'Number of active social campaigns over the selected time period',
    query: 'SocialInteractionSql.Active_Campaign_Count',
    zephyrTestId: 'DE-26016',
    storyId: 'DE-25757',
    description: 'TS To verify the answer of Active social campaign in Social Interaction dashboard',
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

          // Wait for the loading state to disappear before proceeding
          await PageHelper.waitForLoadingToComplete(page);
          //UI validation
          await socialInteractionPage.verifyMetricTitleIsVisible(metricData.title);
          await socialInteractionPage.verifyMetricSubTitleIsVisible(metricData.subTitle);

          //Data sanity validation
          const metricValue = await socialInteractionPage.getMetricValue(metricData.title);
          console.log(`${metricData.title}: ${metricValue}`);
          await socialInteractionPage.verifyMetricHasValidValue(metricData.title);

          //DB validation
          const dbCount = await getMetricData(metricData.query);
          console.log(`DB ${metricData.title}: ${dbCount}`);
          const numericValue = parseInt(metricValue.replace(/,/g, ''));
          expect(numericValue, `${metricData.title} UI (${numericValue}) should equal DB (${dbCount})`).toBe(dbCount);
        }
      );
    }
  }
);

async function getMetricData(query: string) {
  const sqlKey = query.split('.').pop() as keyof typeof SocialInteractionSql;
  const rawSql = SocialInteractionSql[sqlKey];
  if (!rawSql) {
    throw new Error(`SQL not found for key: ${String(sqlKey)}`);
  }

  const orgId = process.env.ORG_ID;
  if (!orgId) {
    throw new Error('ORG_ID env variable must be defined for DB validation');
  }

  const sql = rawSql
    .replace(/'orgId'/g, `'${orgId}'`)
    .replace(/daysToSubtract/g, String(DateHelper.getPeriodDays('Last 30 days')));

  const dbCountRaw = await SnowflakeHelper.runQuery(sql);
  const dbRaw = Object.values(dbCountRaw[0])[0];
  const dbCount = typeof dbRaw === 'string' ? parseInt(dbRaw, 10) : Number(dbRaw);

  return dbCount;
}
