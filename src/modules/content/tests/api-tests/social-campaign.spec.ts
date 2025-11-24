import { ContentTestSuite } from '@content/constants/testSuite';
import { contentTestFixture as test } from '@content/fixtures/contentFixture';
import { SOCIAL_CAMPAIGN_TEST_DATA } from '@content/test-data/social-campaign.test-data';
import { TestPriority } from '@core/constants/testPriority';
import { TestGroupType } from '@core/constants/testType';
import { tagTest } from '@core/utils/testDecorator';

import { SocialCampaignApiHelper } from '@/src/modules/content/apis/apiValidation/socialCampaignApiHelper';

test.describe(
  '@Social Campaign API',
  {
    tag: [ContentTestSuite.API],
  },
  () => {
    let socialCampaignApiHelper: SocialCampaignApiHelper;
    let createdCampaignIds: string[] = [];

    test.beforeEach(async () => {
      socialCampaignApiHelper = new SocialCampaignApiHelper();
    });

    test.afterEach(async ({ appManagerApiFixture }) => {
      // Cleanup: Delete all created campaigns
      for (const campaignId of createdCampaignIds) {
        try {
          await appManagerApiFixture.socialCampaignHelper.deleteCampaign(campaignId);
        } catch (error) {
          console.warn(`Failed to delete campaign ${campaignId}:`, error);
        }
      }
      createdCampaignIds = [];
    });

    test(
      'validate App manager is able to create social campaign using API',
      {
        tag: [
          TestPriority.P0,
          TestGroupType.SMOKE,
          ContentTestSuite.SOCIAL_CAMPAIGN,
          '@CONT-42059',
          ContentTestSuite.API,
        ],
      },
      async ({ appManagerApiFixture }) => {
        tagTest(test.info(), {
          description: 'Validate App manager is able to create social campaign using API',
          zephyrTestId: 'CONT-42059',
          storyId: 'CONT-42059',
        });

        // Step 1: Enable social campaign integrations
        await test.step('Enable social campaign integrations', async () => {
          await appManagerApiFixture.socialCampaignHelper.enableSocialCampaign();
        });

        // Step 2: Create a social campaign
        await test.step('Create social campaign', async () => {
          const timestamp = Date.now().toString().slice(-4);
          const randomId = Math.random().toString(36).substring(2, 6);
          const campaignMessage = `Test Campaign API ${timestamp}_${randomId}`;

          const campaignData = {
            message: campaignMessage,
            url: SOCIAL_CAMPAIGN_TEST_DATA.URLS.YOUTUBE,
            recipient: SOCIAL_CAMPAIGN_TEST_DATA.RECIPIENTS.EVERYONE,
            networks: [...SOCIAL_CAMPAIGN_TEST_DATA.NETWORKS.ALL],
          };

          // Create campaign using the service to get full API response
          const response =
            await appManagerApiFixture.socialCampaignHelper.socialCampaignService.createCampaign(campaignData);

          // Validate the campaign creation response
          await socialCampaignApiHelper.validateCampaignCreation(response);
          await socialCampaignApiHelper.validateCampaignDetails(
            response.result,
            campaignMessage,
            SOCIAL_CAMPAIGN_TEST_DATA.RECIPIENTS.EVERYONE,
            SOCIAL_CAMPAIGN_TEST_DATA.NETWORKS.ALL.map(n => n)
          );

          createdCampaignIds.push(response.result.campaignId);
        });

        // Step 3: Verify campaign is in the list
        await test.step('Verify campaign is in the list', async () => {
          const campaignsList = await appManagerApiFixture.socialCampaignHelper.getAllCampaignsFromAPI();
          const campaignId = createdCampaignIds[createdCampaignIds.length - 1];
          await socialCampaignApiHelper.validateCampaignInList(campaignsList, campaignId);
        });
      }
    );
  }
);
