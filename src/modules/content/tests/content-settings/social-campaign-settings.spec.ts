import { ContentTestSuite } from '@content/constants/testSuite';
import { contentTestFixture as test } from '@content/fixtures/contentFixture';
import { SocialCampaignSettingPage } from '@content/ui/pages/socialCampaignSettingPage';
import { TestPriority } from '@core/constants/testPriority';
import { TestGroupType } from '@core/constants/testType';
import { tagTest } from '@core/utils/testDecorator';

import { ManageApplicationPage } from '@/src/modules/content/ui/pages/manageApplicationPage';

test.describe(
  `social Campaign Settings functionality`,
  {
    tag: [ContentTestSuite.SOCIAL_CAMPAIGN],
  },
  () => {
    let socialCampaignSettingPage: SocialCampaignSettingPage;
    let manageApplicationPage: ManageApplicationPage;

    test.beforeEach(async ({ appManagerFixture }) => {
      socialCampaignSettingPage = new SocialCampaignSettingPage(appManagerFixture.page);
      manageApplicationPage = new ManageApplicationPage(appManagerFixture.page);
    });

    test(
      'verify App Manager can access Social Campaign Settings page',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, '@SOCIAL_CAMPAIGN_SETTINGS', '@CONT-14897'],
      },
      async ({ appManagerFixture }) => {
        tagTest(test.info(), {
          description: 'Verify App Manager can access Social Campaign Settings page',
          zephyrTestId: 'CONT-14897',
          storyId: 'CONT-14897',
        });
        await appManagerFixture.homePage.verifyThePageIsLoaded();
        await socialCampaignSettingPage.loadPage();
        await socialCampaignSettingPage.actions.uncheckSocialCampaignCheckOutbox();
        await appManagerFixture.homePage.loadPage();
        await appManagerFixture.navigationHelper.verifySocialCampaignsOptionIsNotVisible();
        await socialCampaignSettingPage.loadPage();
        await socialCampaignSettingPage.actions.checkSocialCampaignCheckOutbox();
        await appManagerFixture.homePage.loadPage();
        await appManagerFixture.navigationHelper.verifySocialCampaignsOptionIsVisible();
      }
    );
  }
);
