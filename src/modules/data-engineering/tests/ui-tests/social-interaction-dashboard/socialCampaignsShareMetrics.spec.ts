import { PeriodFilterTimeRange } from '@data-engineering/constants/periodFilterTimeRange';
import { DataEngineeringTestSuite } from '@data-engineering/constants/testSuite';
import { analyticsTestFixture as test } from '@data-engineering/fixtures/analyticsFixture';
import { SocialInteractionSql } from '@data-engineering/sqlQueries/social-interaction';

test.describe(
  'social Interaction Dashboard - Social Campaigns Share Metrics',
  {
    tag: [DataEngineeringTestSuite.SOCIAL_INTERACTION],
  },
  () => {
    test('verify social campaigns share metrics when applied with period filter -  last 36 months', async ({
      appManagerFixture,
    }) => {
      const { socialInteractionDashboard, socialInteractionQueryHelper } = appManagerFixture;
      await socialInteractionDashboard.loadPage();
      await socialInteractionDashboard.analyticsFiltersComponent.applyPeriodFilter(
        PeriodFilterTimeRange.LAST_36_MONTHS
      );

      const socialCampaignShareData = await socialInteractionQueryHelper.getCampaignShareDataFromDB(
        SocialInteractionSql.Social_Campaign_Shares,
        PeriodFilterTimeRange.LAST_36_MONTHS
      );
      console.log('Social Campaign Share Data:', socialCampaignShareData);

      //verify the same data is displayed in the dashboard
      const socialCampaignShareDistribution = socialInteractionDashboard.socialCampaignShareDistribution;
      await socialCampaignShareDistribution.verifyDataMatchesWithSnowflakeData(socialCampaignShareData);
      await socialCampaignShareDistribution.sortByColumn('Social platform', 'Ascending');
      //since its just one record, wont have any impact on the data validation
      await socialCampaignShareDistribution.verifyDataMatchesWithSnowflakeData(socialCampaignShareData);
      //verify you are able to drill down on a specific cell
      await socialCampaignShareDistribution.drillDownOnPlatform('Twitter', 'Share count');
    });

    test('verify social campaigns share metrics when applied with period filter -  last 12 months', async ({
      appManagerFixture,
    }) => {
      const { socialInteractionDashboard, socialInteractionQueryHelper } = appManagerFixture;
      await socialInteractionDashboard.loadPage();
      await socialInteractionDashboard.analyticsFiltersComponent.applyPeriodFilter(
        PeriodFilterTimeRange.LAST_12_MONTHS
      );

      const socialCampaignShareData = await socialInteractionQueryHelper.getCampaignShareDataFromDB(
        SocialInteractionSql.Social_Campaign_Shares,
        PeriodFilterTimeRange.LAST_12_MONTHS
      );
      console.log('Social Campaign Share Data:', socialCampaignShareData);

      //verify the same data is displayed in the dashboard
      const socialCampaignShareDistribution = socialInteractionDashboard.socialCampaignShareDistribution;
      await socialCampaignShareDistribution.verifyDataMatchesWithSnowflakeData(socialCampaignShareData);
      await socialCampaignShareDistribution.sortByColumn('Social platform', 'Ascending');
      //since its just one record, wont have any impact on the data validation
      await socialCampaignShareDistribution.verifyDataMatchesWithSnowflakeData(socialCampaignShareData);
      //verify you are able to drill down on a specific cell
      await socialCampaignShareDistribution.drillDownOnPlatform('Twitter', 'Share count');
    });
  }
);
