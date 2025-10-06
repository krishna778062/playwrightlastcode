import { expect } from '@playwright/test';

import { ContentTestSuite } from '@content/constants/testSuite';
import { ContentFeatureTags, ContentSuiteTags } from '@content/constants/testTags';
import { contentTestFixture as test } from '@content/fixtures/contentFixture';
import { ApplicationScreenPage } from '@content/pages/applicationscreenPage';
import { GovernanceScreenPage } from '@content/pages/governanceScreenPage';
import { ManageApplicationPage } from '@content/pages/manageApplicationPage';
import { SocialCampaignPage } from '@content/pages/socialCampaignPage';
import { SOCIAL_CAMPAIGN_TEST_DATA } from '@content/test-data/social-campaign.test-data';
import { TestPriority } from '@core/constants/testPriority';
import { TestGroupType } from '@core/constants/testType';
import { NewUxHomePage } from '@core/pages/homePage/newUxHomePage';
import { SocialCampaignFilter, SocialCampaignRecipient, SocialCampaignStatus } from '@core/types/social-campaign.types';
import { TestDataGenerator } from '@core/utils/testDataGenerator';
import { tagTest } from '@core/utils/testDecorator';

test.describe(
  `Social Campaign functionality`,
  {
    tag: [ContentTestSuite.SOCIAL_CAMPAIGN],
  },
  () => {
    let socialCampaignPage: SocialCampaignPage;
    let manualCleanupNeeded: boolean = false;
    let campaignId: string;

    test.beforeEach(async ({ socialCampaignManagerHomePage, socialCampaignHelper }) => {
      socialCampaignPage = new SocialCampaignPage(socialCampaignManagerHomePage.page);
      // Reset cleanup flag for each test
      manualCleanupNeeded = false;
    });

    test.afterEach(async ({ socialCampaignHelper }) => {
      if (manualCleanupNeeded && campaignId) {
        await socialCampaignHelper.deleteCampaign(campaignId);
      }
    });

    test(
      'Zeus | Social Campaign | Verify SC Manager able to create and delete Social Campaign for Everyone',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, '@CONT-33728', '@Social_Campaign_Add_Edit_Delete'],
      },
      async ({ socialCampaignManagerHomePage, socialCampaignHelper }) => {
        tagTest(test.info(), {
          description:
            'Zeus | Social Campaign | Verify SC Manager able to create and delete Social Campaign for Everyone',
          zephyrTestId: 'CONT-33728',
          storyId: 'CONT-33728',
        });

        //clean up all the campaigns
        await socialCampaignHelper.deleteAllCampaigns(SocialCampaignFilter.LATEST);

        await socialCampaignManagerHomePage.actions.clickOnSocialCampaigns();
        await socialCampaignPage.actions.clickAddCampaignButton();

        // Create and post social campaign using wrapper function
        const campaignOptions = {
          message: SOCIAL_CAMPAIGN_TEST_DATA.MESSAGES.YOUTUBE,
          url: SOCIAL_CAMPAIGN_TEST_DATA.URLS.YOUTUBE,
          linkText: SOCIAL_CAMPAIGN_TEST_DATA.LINK_TEXT.YOUTUBE,
          recipient: SocialCampaignRecipient.EVERYONE,
        };

        // When Add Campaign and Create
        campaignId = await socialCampaignPage.actions.AddCampaignAndCreate(campaignOptions);
        await socialCampaignPage.assertions.verifyToastMessage('Created social campaign successfully');
        await socialCampaignPage.assertions.verifyCampaignLinkDisplayed(campaignOptions.linkText);
        await socialCampaignPage.actions.clickPopularLink();
        await socialCampaignPage.assertions.verifyCampaignLinkDisplayed(campaignOptions.linkText);

        manualCleanupNeeded = true;
      }
    );

    test(
      'In Zeus Verify SC Manager able to delete the expired Social Campaign(Audience)',
      {
        tag: [TestPriority.P1, TestGroupType.REGRESSION, '@CONT-10526', '@Social_Campaign_Expire'],
      },
      async ({ socialCampaignManagerHomePage, socialCampaignHelper, audienceManagementHelper }) => {
        tagTest(test.info(), {
          description: 'Zeus | Social Campaign | Verify End User can view and expire social campaign',
          zephyrTestId: 'CONT-10526',
          storyId: 'CONT-10526',
        });

        await socialCampaignHelper.deleteAllCampaigns(SocialCampaignFilter.EXPIRED);
        const campaignData = {
          message: SOCIAL_CAMPAIGN_TEST_DATA.MESSAGES.BLOG,
          url: SOCIAL_CAMPAIGN_TEST_DATA.URLS.SIMPPLR_BLOG,
          linkText: SOCIAL_CAMPAIGN_TEST_DATA.LINK_TEXT.SIMPPLR_BLOG,
          recipient: SocialCampaignRecipient.AUDIENCE,
        };

        // Create or get a test audience for the campaign
        const audienceId = await audienceManagementHelper.getRandomAudienceId();

        // Create campaign via API
        const createdCampaign = await socialCampaignHelper.createCampaign({
          message: campaignData.message,
          url: campaignData.url,
          recipient: campaignData.recipient,
          audienceId: audienceId,
        });

        await socialCampaignPage.loadPage();

        await socialCampaignPage.assertions.verifyCampaignLinkDisplayed(campaignData.linkText);
        await socialCampaignPage.actions.clickCampaignOptions();

        await socialCampaignPage.actions.clickExpireCampaignButton();

        await socialCampaignPage.actions.confirmExpireCampaign();
        await socialCampaignPage.assertions.verifyToastMessage('Expired social campaign successfully');
        await socialCampaignPage.assertions.verifyCampaignNotInLatest(campaignData.linkText);

        await socialCampaignPage.actions.clickExpiredLink();

        await socialCampaignPage.assertions.verifyCampaignInExpired(campaignData.linkText);

        await socialCampaignPage.actions.clickCampaignOptions();
        await socialCampaignPage.actions.clickDeleteCampaignButton();
        await socialCampaignPage.actions.confirmDeleteCampaign();
        await socialCampaignPage.assertions.verifyToastMessage('Deleted social campaign successfully');
        await socialCampaignPage.assertions.verifyCampaignNotInExpired(campaignData.linkText);
      }
    );
  }
);
