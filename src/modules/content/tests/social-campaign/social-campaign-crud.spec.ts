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
import { SocialCampaignRecipient, SocialCampaignStatus } from '@core/types/social-campaign.types';
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
      //clean up all the campaigns
      await socialCampaignHelper.deleteAllCampaigns();
      // Reset cleanup flag for each test
      manualCleanupNeeded = false;
    });

    test.afterEach(async ({ socialCampaignHelper }) => {
      if (manualCleanupNeeded && campaignId) {
        await socialCampaignHelper.deleteAllCampaigns();
      }
    });

    test(
      'Zeus | Social Campaign | Verify SC Manager able to create and delete Social Campaign for Everyone',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, '@CONT-33728', '@Social_Campaign_Add_Edit_Delete'],
      },
      async ({ socialCampaignManagerHomePage }) => {
        tagTest(test.info(), {
          description:
            'Zeus | Social Campaign | Verify SC Manager able to create and delete Social Campaign for Everyone',
          zephyrTestId: 'CONT-33728',
          storyId: 'CONT-33728',
        });

        // And Click on Social campaigns section
        await socialCampaignManagerHomePage.actions.clickOnSocialCampaigns();

        // Click on Add campaign button
        await socialCampaignPage.actions.clickAddCampaignButton();

        // When Create and post social campaign using wrapper function
        const campaignOptions = {
          message: SOCIAL_CAMPAIGN_TEST_DATA.MESSAGES.YOUTUBE,
          url: SOCIAL_CAMPAIGN_TEST_DATA.URLS.YOUTUBE,
          linkText: SOCIAL_CAMPAIGN_TEST_DATA.LINK_TEXT.YOUTUBE,
          recipient: SocialCampaignRecipient.EVERYONE,
        };

        // When Add Campaign and Create
        campaignId = await socialCampaignPage.actions.AddCampaignAndCreate(campaignOptions);

        // And Verify link is displayed using the returned link text
        await socialCampaignPage.assertions.verifyCampaignLinkDisplayed(campaignOptions.linkText);

        // And Click on "Popular" link
        await socialCampaignPage.actions.clickPopularLink();

        // Then Verify link is displayed using the campaign result
        await socialCampaignPage.assertions.verifyCampaignLinkDisplayed(campaignOptions.linkText);

        manualCleanupNeeded = true;
      }
    );

    test(
      'Zeus | Social Campaign | Verify End User can view and expire social campaign',
      {
        tag: [TestPriority.P1, TestGroupType.REGRESSION, '@CONT-33729', '@Social_Campaign_Expire'],
      },
      async ({ socialCampaignManagerHomePage, socialCampaignHelper, audienceManagementHelper }) => {
        tagTest(test.info(), {
          description: 'Zeus | Social Campaign | Verify End User can view and expire social campaign',
          zephyrTestId: 'CONT-33729',
          storyId: 'CONT-33729',
        });

        // Given Login as "EndUser1" - using socialCampaignManagerHomePage
        // And create campaign using API
        const campaignData = {
          message: SOCIAL_CAMPAIGN_TEST_DATA.MESSAGES.BLOG,
          url: SOCIAL_CAMPAIGN_TEST_DATA.URLS.SIMPPLR_BLOG,
          linkText: SOCIAL_CAMPAIGN_TEST_DATA.LINK_TEXT.SIMPPLR_BLOG,
          recipient: SocialCampaignRecipient.AUDIENCE,
        };

        // Create or get a test audience for the campaign
        const audienceId = await audienceManagementHelper.createOrGetTestAudience(
          'Social Campaign Test Audience',
          'Test audience for social campaign testing',
          'India'
        );

        // Create campaign via API
        const createdCampaign = await socialCampaignHelper.createCampaign({
          message: campaignData.message,
          url: campaignData.url,
          recipient: campaignData.recipient,
          audienceId: audienceId,
        });

        // And Click on Social campaigns section
        await socialCampaignManagerHomePage.actions.clickOnSocialCampaigns();

        // And Verify link "Building Transparent Leadership and Trust" is displayed
        await socialCampaignPage.assertions.verifyCampaignLinkDisplayed(campaignData.linkText);

        // And Get the link of Social Campaign
        const campaignLink = await socialCampaignPage.actions.getSocialCampaignLink();
        console.log('Campaign link retrieved:', campaignLink);

        // And Click on options on social campaign
        await socialCampaignPage.actions.clickCampaignOptions(createdCampaign.campaignId);

        // And Click on button "Expire campaign"
        await socialCampaignPage.actions.clickExpireCampaignButton();

        // When Click on "Expire" button
        await socialCampaignPage.actions.confirmExpireCampaign();

        // And Check the created social campaign should not present in latest
        await socialCampaignPage.assertions.verifyCampaignNotInLatest(campaignData.linkText);

        // And Click on "Expired" link
        await socialCampaignPage.actions.clickExpiredLink();

        // And Check the created social campaign should expire
        await socialCampaignPage.assertions.verifyCampaignInExpired(campaignData.linkText);

        // And Get the social campaign count on social Campaign page
        const campaignCount = await socialCampaignPage.actions.getSocialCampaignCount();
        console.log('Total social campaign count:', campaignCount);

        // Verify the campaign is expired via API
        const expiredCampaign = await socialCampaignHelper.getCampaignById(createdCampaign.campaignId);
        expect(expiredCampaign.status).toBe(SocialCampaignStatus.EXPIRED);

        manualCleanupNeeded = true;
        campaignId = createdCampaign.campaignId;
      }
    );
  }
);
