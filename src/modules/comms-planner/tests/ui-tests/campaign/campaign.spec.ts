import { Campaign, CAMPAIGNS } from '@modules/comms-planner/constants/campaign';
import { test } from '@modules/comms-planner/fixtures/loginFixture';
import { CampaignPage } from '@modules/comms-planner/pages/campaign/campaignPage';

import { TestPriority } from '@/src/core/constants/testPriority';
import { TestGroupType } from '@/src/core/constants/testType';
import { tagTest } from '@/src/core/utils/testDecorator';

test.describe('campaigns', () => {
  let campaignPage: CampaignPage;

  test.beforeEach(async ({ appManagersPage }) => {
    campaignPage = new CampaignPage(appManagersPage);

    await campaignPage.loadPage({ stepInfo: 'Loading comms planner - campaign page' });
    await campaignPage.verifyThePageIsLoaded();
  });

  test(
    'verify campaign modal',
    {
      tag: [
        TestPriority.P0,
        TestGroupType.SMOKE,
        '@COMMS-PLANNER',
        '@ACTIVITY_COMMS-PLANNER',
        TestGroupType.HEALTHCHECK,
      ],
    },
    async () => {
      tagTest(test.info(), {
        description: 'Verify campaign modal',
        zephyrTestId: '',
        storyId: '',
      });

      await campaignPage.clickAddCampaignButton();
      await campaignPage.verifyOpenedCampaignModal();
    }
  );

  test(
    'create a new campaign',
    {
      tag: [
        TestPriority.P0,
        TestGroupType.SMOKE,
        '@COMMS-PLANNER',
        '@CAMPAIGN_COMMS-PLANNER',
        TestGroupType.HEALTHCHECK,
      ],
    },
    async () => {
      tagTest(test.info(), {
        description: 'Create a new campaign',
        zephyrTestId: '',
        storyId: '',
      });

      const campaign: Campaign = CAMPAIGNS[0];

      await campaignPage.clickAddCampaignButton();
      await campaignPage.verifyOpenedCampaignModal();

      await campaignPage.addCampaignName(campaign.title);
      await campaignPage.addCampaignDescription(campaign.description);
    }
  );
});
