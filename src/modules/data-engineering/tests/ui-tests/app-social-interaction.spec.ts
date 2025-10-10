import { AnalyticsFiltersComponent } from '@data-engineering/components/analyticsFiltersComponent';
import { DataEngineeringTestSuite } from '@data-engineering/constants/testSuite';
import { expect, test } from '@data-engineering/fixtures/analyticsFixture';
import { PageHelper } from '@data-engineering/helpers/pageHelper';
import { SocialInteractionPage } from '@data-engineering/pages/socialInteractionPage';

import { TestPriority } from '@core/constants/testPriority';
import { TestGroupType } from '@core/constants/testType';
import { tagTest } from '@core/utils/testDecorator';

/**
 * This test suite validates the Social Interaction dashboard
 * by verifying the data in the UI and the DB for various interaction metrics and social campaign share distribution
 */

const orgId: string = process.env.ORG_ID || '';

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
  'social Interaction Dashboard',
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
          tagTest(test.info(), {
            description: metricData.description,
            zephyrTestId: metricData.zephyrTestId,
            storyId: metricData.storyId,
          });

          const socialInteractionPage = new SocialInteractionPage(page);
          const analyticsFiltersComponent = new AnalyticsFiltersComponent(page);
          const timePeriod = 'Last 36 months';

          await openAppAnalytics();
          await socialInteractionPage.navigateToSocialInteraction();
          await PageHelper.waitForLoadingToComplete(page);

          await analyticsFiltersComponent.openFilter('Period');
          await analyticsFiltersComponent.selectOption(timePeriod);

          //UI validation
          await socialInteractionPage.verifyAnswerTitleIsVisible(metricData.title);
          await socialInteractionPage.verifyAnswerSubTitleIsVisible(metricData.subTitle);

          //Data sanity validation
          const metricValue = await socialInteractionPage.getHeroMetricValue(metricData.title);
          console.log(`${metricData.title}: ${metricValue}`);
          await socialInteractionPage.verifyHeroMetricHasValidValue(metricData.title);

          //DB validation
          const dbCount = await socialInteractionPage.getHeroMetricDataFromDB(metricData.query, orgId, timePeriod);
          console.log(`DB ${metricData.title}: ${dbCount}`);
          const numericValue = parseInt(metricValue.replace(/,/g, ''));
          expect(numericValue, `${metricData.title} UI (${numericValue}) should equal DB (${dbCount})`).toBe(dbCount);
        }
      );
    }

    test(
      'tS To verify the answer of Social campaign shares in Social Interaction dashboard',
      {
        tag: [TestPriority.P0, TestGroupType.REGRESSION],
      },
      async ({ openAppAnalytics, page }) => {
        tagTest(test.info(), {
          description: 'This verifies the answer of Social campaign shares in Social Interaction dashboard',
          zephyrTestId: 'DE-26021',
          storyId: 'DE-25761',
        });

        const socialInteractionPage = new SocialInteractionPage(page);
        const analyticsFiltersComponent = new AnalyticsFiltersComponent(page);
        const timePeriod = 'Last 36 months';

        await openAppAnalytics();
        await socialInteractionPage.navigateToSocialInteraction();
        await PageHelper.waitForLoadingToComplete(page);

        await analyticsFiltersComponent.openFilter('Period');
        await analyticsFiltersComponent.selectOption(timePeriod);
        await socialInteractionPage.scrollToAnswer('Social campaign share distribution');
        await PageHelper.pause(page, 10000);
        await socialInteractionPage.verifyAnswerTitleIsVisible('Social campaign share distribution');
        await socialInteractionPage.verifyAnswerSubTitleIsVisible(
          'Breakdown of social campaign shares across different platforms'
        );

        const dbResult = await socialInteractionPage.getSocialCampaignShareData(
          'SocialInteractionSql.Social_Campaign_Shares',
          orgId,
          timePeriod
        );
        if (!(await socialInteractionPage.isCampaignShareDataAvailable(dbResult))) {
          await socialInteractionPage.verifyLowFilterResultMessageIsVisible('Social campaign share distribution');
        } else {
          await socialInteractionPage.verifySocialCampaignShareNumberOfColumnsIsCorrect();
          await socialInteractionPage.verifyTableColumnHeaderTextIsVisible('Social campaign share distribution', [
            'Social platform',
            'Share count',
            'Platform share contribution (%)',
          ]);

          await socialInteractionPage.verifySocialCampaignShareDataMatchesWithUDL(dbResult);
        }
      }
    );
  }
);
