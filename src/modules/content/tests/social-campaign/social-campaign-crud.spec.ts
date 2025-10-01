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
import { TestDataGenerator } from '@core/utils/testDataGenerator';
import { tagTest } from '@core/utils/testDecorator';

test.describe(
  `Social Campaign functionality`,
  {
    tag: [ContentTestSuite.SOCIAL_CAMPAIGN],
  },
  () => {
    let homePage: NewUxHomePage;
    let applicationscreen: ApplicationScreenPage;
    let manageApplicationPage: ManageApplicationPage;
    let governanceScreenPage: GovernanceScreenPage;
    let socialCampaignPage: SocialCampaignPage;
    let manualCleanupNeeded: boolean = false;
    let campaignId: string;

    test.beforeEach(async ({ socialCampaignManagerHomePage, socialCampaignHelper }) => {
      homePage = new NewUxHomePage(socialCampaignManagerHomePage.page);
      applicationscreen = new ApplicationScreenPage(socialCampaignManagerHomePage.page);
      manageApplicationPage = new ManageApplicationPage(socialCampaignManagerHomePage.page);
      governanceScreenPage = new GovernanceScreenPage(socialCampaignManagerHomePage.page);
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
          recipient: 'everyone' as const,
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
  }
);
