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
import {
  SocialCampaignFilter,
  SocialCampaignNetwork,
  SocialCampaignNetworkUI,
  SocialCampaignOptions,
  SocialCampaignRecipient,
  SocialCampaignSharedWith,
  SocialCampaignStatus,
} from '@core/types/social-campaign.types';
import { TestDataGenerator } from '@core/utils/testDataGenerator';
import { tagTest } from '@core/utils/testDecorator';

import { FeedPage } from '../../pages/feedPage';
import { SiteDashboardPage } from '../../pages/siteDashboardPage';

test.describe(
  `Social Campaign functionality`,
  {
    tag: [ContentTestSuite.SOCIAL_CAMPAIGN],
  },
  () => {
    let socialCampaignPage: SocialCampaignPage;
    let manualCleanupNeeded: boolean = false;
    let campaignId: string;
    let feedPage: FeedPage;

    test.beforeEach(async ({ socialCampaignHelper }) => {
      // Reset cleanup flag for each test
      //clean up all the campaigns
      await socialCampaignHelper.deleteAllCampaigns(SocialCampaignFilter.LATEST);
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
      async ({ socialCampaignManagerHomePage, socialCampaignHelper, socialCampaignManagerPage }) => {
        socialCampaignPage = new SocialCampaignPage(socialCampaignManagerPage);
        tagTest(test.info(), {
          description:
            'Zeus | Social Campaign | Verify SC Manager able to create and delete Social Campaign for Everyone',
          zephyrTestId: 'CONT-33728',
          storyId: 'CONT-33728',
        });

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
        socialCampaignPage = new SocialCampaignPage(socialCampaignManagerHomePage.page);

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

        campaignId = createdCampaign.campaignId;

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

    test(
      'Verify App Manager able to share Social Campaign(Audience) to Site feed',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, TestGroupType.REGRESSION, '@CONT-10518'],
      },
      async ({ appManagerHomePage, socialCampaignHelper, siteManagementHelper }) => {
        tagTest(test.info(), {
          description: 'Verify App Manager able to share Social Campaign to Site feed',
          zephyrTestId: 'CONT-10518',
          storyId: 'CONT-10518',
        });

        socialCampaignPage = new SocialCampaignPage(appManagerHomePage.page);
        const siteName = 'All Employees';
        const siteId = await siteManagementHelper.getSiteIdWithName(siteName);
        // Create campaign with audience
        const campaignOptions = {
          message: SOCIAL_CAMPAIGN_TEST_DATA.MESSAGES.BLOG,
          url: SOCIAL_CAMPAIGN_TEST_DATA.URLS.SIMPPLR_ALL_EMPLOYEES,
          linkText: SOCIAL_CAMPAIGN_TEST_DATA.LINK_TEXT.SIMPPLR_ALL_EMPLOYEES,
          recipient: SocialCampaignRecipient.EVERYONE,
        };

        // Create campaign via API
        const createdCampaign = await socialCampaignHelper.createCampaign({
          message: campaignOptions.message,
          url: campaignOptions.url,
          recipient: campaignOptions.recipient,
        });
        campaignId = createdCampaign.campaignId;
        socialCampaignPage.loadPage();
        await socialCampaignPage.assertions.verifyCampaignLinkDisplayed(campaignOptions.linkText);

        const description = TestDataGenerator.generateRandomString();
        // Share campaign to site feed
        await socialCampaignPage.actions.clickCampaignOptions();
        await socialCampaignPage.actions.clickShareToFeedButton();
        await socialCampaignPage.actions.enterShareDescription(description);
        await socialCampaignPage.actions.selectShareOptionAsSiteFeed();
        await socialCampaignPage.actions.enterSiteName(siteName);
        await socialCampaignPage.actions.clickShareButton();
        await socialCampaignPage.assertions.verifyToastMessage('Shared social campaign successfully');

        const siteDashboardPage = new SiteDashboardPage(appManagerHomePage.page, siteId);
        await siteDashboardPage.loadPage();
        await siteDashboardPage.actions.clickOnFeedLink();
        await siteDashboardPage.assertions.verifyCampaignLinkDisplayed(campaignOptions.linkText, description);
        manualCleanupNeeded = true;
      }
    );

    test(
      'In Zeus Verify error messages on creating social campaign without required details',
      {
        tag: [TestPriority.P1, TestGroupType.REGRESSION, '@CONT-19603', '@Social_Campaign_Validation'],
      },
      async ({ appManagersPage }) => {
        tagTest(test.info(), {
          description: 'In Zeus Verify error messages on creating social campaign without required details',
          zephyrTestId: 'CONT-19603',
          storyId: 'CONT-19603',
        });

        // Create social campaign page instance
        const socialCampaignPage = new SocialCampaignPage(appManagersPage);

        // Navigate to social campaigns and add campaign
        await socialCampaignPage.loadPage();
        await socialCampaignPage.actions.clickAddCampaignButton();
        await socialCampaignPage.actions.enterCampaignUrl(SOCIAL_CAMPAIGN_TEST_DATA.URLS.YOUTUBE_2);
        await socialCampaignPage.actions.uncheckNetwork('X');
        await socialCampaignPage.actions.uncheckNetwork('Facebook');
        await socialCampaignPage.actions.uncheckNetwork('LinkedIn');
        await socialCampaignPage.actions.clickCreateCampaignButton();
        await socialCampaignPage.assertions.verifyErrorMessagePresence('You must select at least one social network');
        await socialCampaignPage.assertions.verifyErrorMessagePresence(
          'Suggested campaign message is a required field is a required field'
        );
      }
    );

    test(
      'In Zeus Verify user able to create social campaign for selected(Twitter) social network',
      {
        tag: [TestPriority.P1, TestGroupType.REGRESSION, '@CONT-19604', '@Social_Campaign_Creation'],
      },
      async ({ appManagersPage }) => {
        tagTest(test.info(), {
          description: 'In Zeus Verify user able to create social campaign for selected(Twitter) social network',
          zephyrTestId: 'CONT-19604',
          storyId: 'CONT-19604',
        });

        // Create social campaign page instance
        const socialCampaignPage = new SocialCampaignPage(appManagersPage);
        await socialCampaignPage.loadPage();
        await socialCampaignPage.actions.clickAddCampaignButton();

        const campaignOptions = {
          message: SOCIAL_CAMPAIGN_TEST_DATA.MESSAGES.YOUTUBE,
          url: SOCIAL_CAMPAIGN_TEST_DATA.URLS.YOUTUBE,
          linkText: SOCIAL_CAMPAIGN_TEST_DATA.LINK_TEXT.YOUTUBE,
          recipient: SocialCampaignRecipient.EVERYONE,
          networks: [SocialCampaignNetworkUI.TWITTER],
        };

        campaignId = await socialCampaignPage.actions.AddCampaignAndCreate(campaignOptions);
        await socialCampaignPage.assertions.verifyToastMessage('Created social campaign successfully');
        await socialCampaignPage.assertions.verifyCampaignLinkDisplayed(campaignOptions.linkText);

        manualCleanupNeeded = true;
      }
    );

    test(
      'Verify Audience Description Is Not Displayed When Not Present',
      {
        tag: [TestPriority.P1, TestGroupType.REGRESSION, '@CONT-33857', '@Social_Campaign_Audience'],
      },
      async ({ appManagersPage, audienceManagementHelper }) => {
        tagTest(test.info(), {
          description: 'Verify Audience Description Is Not Displayed When Not Present',
          zephyrTestId: 'CONT-33857',
          storyId: 'CONT-33857',
        });

        // Create social campaign page instance
        const socialCampaignPage = new SocialCampaignPage(appManagersPage);

        // Navigate to social campaigns and add campaign
        await socialCampaignPage.loadPage();
        await socialCampaignPage.actions.clickAddCampaignButton();

        const audienceDetailsWithDescription = await audienceManagementHelper.getAudienceWithDescription();
        const audienceDetailsWithNoDescription = await audienceManagementHelper.getAudienceWithNoDescription();

        await socialCampaignPage.actions.selectMemberAsAudience();
        await socialCampaignPage.actions.enterAudienceName(audienceDetailsWithDescription.name);
        await socialCampaignPage.assertions.verifyAudienceNameAndDescription(
          audienceDetailsWithDescription.audienceCount,
          audienceDetailsWithDescription.description,
          audienceDetailsWithDescription.name
        );
        await socialCampaignPage.actions.enterAudienceName(audienceDetailsWithNoDescription.name);
        await socialCampaignPage.assertions.verifyAudienceNameAndNoDescription(
          audienceDetailsWithNoDescription.audienceCount,
          audienceDetailsWithNoDescription.description,
          audienceDetailsWithNoDescription.name
        );
      }
    );

    test(
      'Verify App Manager able to share Social Campaign to Home Feed',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, TestGroupType.REGRESSION, '@CONT-10515'],
      },
      async ({ appManagerHomePage, socialCampaignHelper }) => {
        tagTest(test.info(), {
          description: 'Verify App Manager able to share Social Campaign to Home Feed',
          zephyrTestId: 'CONT-10515',
          storyId: 'CONT-10515',
        });

        socialCampaignPage = new SocialCampaignPage(appManagerHomePage.page);
        // Create campaign with audience
        const campaignOptions = {
          message: SOCIAL_CAMPAIGN_TEST_DATA.MESSAGES.BLOG,
          url: SOCIAL_CAMPAIGN_TEST_DATA.URLS.SIMPPLR_ALL_EMPLOYEES,
          linkText: SOCIAL_CAMPAIGN_TEST_DATA.LINK_TEXT.SIMPPLR_ALL_EMPLOYEES,
          recipient: SocialCampaignRecipient.EVERYONE,
        };

        // Create campaign via API
        const createdCampaign = await socialCampaignHelper.createCampaign({
          message: campaignOptions.message,
          url: campaignOptions.url,
          recipient: campaignOptions.recipient,
        });
        campaignId = createdCampaign.campaignId;
        socialCampaignPage.loadPage();
        await socialCampaignPage.assertions.verifyCampaignLinkDisplayed(campaignOptions.linkText);

        const description = TestDataGenerator.generateRandomString();
        await socialCampaignPage.actions.clickCampaignOptions();
        await socialCampaignPage.actions.clickShareToFeedButton();
        await socialCampaignPage.actions.enterShareDescription(description);
        await socialCampaignPage.actions.clickShareButton();
        await socialCampaignPage.assertions.verifyToastMessage('Shared social campaign successfully');
        await appManagerHomePage.actions.clickOnGlobalFeed();
        feedPage = new FeedPage(appManagerHomePage.page);
        await feedPage.verifyThePageIsLoaded();
        await feedPage.assertions.verifyCampaignLinkDisplayed(campaignOptions.linkText, description);
        manualCleanupNeeded = true;
      }
    );

    test(
      'In Zeus Verify App Manager able to delete the expired Social Campaign(Audience)',
      {
        tag: [TestPriority.P1, TestGroupType.REGRESSION, '@CONT-14899', '@Social_Campaign_Expire'],
      },
      async ({ appManagerHomePage, socialCampaignHelper, audienceManagementHelper }) => {
        tagTest(test.info(), {
          description: 'In Zeus Verify App Manager able to delete the expired Social Campaign',
          zephyrTestId: 'CONT-14899',
          storyId: 'CONT-14899',
        });
        socialCampaignPage = new SocialCampaignPage(appManagerHomePage.page);

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

        campaignId = createdCampaign.campaignId;

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

    test(
      'In Zeus Verify End User should not be able to share Social Campaign to Home Carousel delete and expire Campaign',
      {
        tag: [TestPriority.P1, TestGroupType.REGRESSION, '@CONT-14906', '@Social_Campaign_End_User_Restrictions'],
      },
      async ({ endUserHomePage, socialCampaignHelper }) => {
        tagTest(test.info(), {
          description:
            'In Zeus Verify End User should not be able to share Social Campaign to Home Carousel delete and expire Campaign',
          zephyrTestId: 'CONT-14906',
          storyId: 'CONT-14906',
        });

        // Create social campaign using App Manager via API
        const campaignData = {
          message: SOCIAL_CAMPAIGN_TEST_DATA.MESSAGES.BLOG,
          url: SOCIAL_CAMPAIGN_TEST_DATA.URLS.SIMPPLR_BLOG,
          linkText: SOCIAL_CAMPAIGN_TEST_DATA.LINK_TEXT.SIMPPLR_BLOG,
          recipient: SocialCampaignRecipient.EVERYONE,
        };

        await socialCampaignHelper.createCampaign({
          message: campaignData.message,
          url: campaignData.url,
          recipient: campaignData.recipient,
        });

        const endUserSocialCampaignPage = new SocialCampaignPage(endUserHomePage.page);
        await endUserSocialCampaignPage.loadPage();

        // Verify campaign is visible to end user
        await endUserSocialCampaignPage.assertions.verifyCampaignLinkDisplayed(campaignData.linkText);
        await endUserSocialCampaignPage.assertions.verifyAddCampaignButtonIsNotVisible();
        await endUserSocialCampaignPage.assertions.verifyExpireTabNotVisible();
        await endUserSocialCampaignPage.actions.clickCampaignOptions();
        await endUserSocialCampaignPage.assertions.verifyExpireCampaignButtonIsNotVisible();
        await endUserSocialCampaignPage.assertions.verifyDeleteCampaignButtonIsNotVisible();
      }
    );

    test(
      'In Zeus Verify Standard User is able to Share a Social Campaign with a message using Post in HOME FEED option',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, TestGroupType.REGRESSION, '@CONT-26718'],
      },
      async ({ standardUserHomePage, socialCampaignHelper }) => {
        tagTest(test.info(), {
          description: 'Verify App Manager able to share Social Campaign to Home Feed',
          zephyrTestId: 'CONT-26718',
          storyId: 'CONT-26718',
        });

        socialCampaignPage = new SocialCampaignPage(standardUserHomePage.page);
        // Create campaign with audience
        const campaignOptions = {
          message: SOCIAL_CAMPAIGN_TEST_DATA.MESSAGES.BLOG,
          url: SOCIAL_CAMPAIGN_TEST_DATA.URLS.SIMPPLR_ALL_EMPLOYEES,
          linkText: SOCIAL_CAMPAIGN_TEST_DATA.LINK_TEXT.SIMPPLR_ALL_EMPLOYEES,
          recipient: SocialCampaignRecipient.EVERYONE,
        };

        // Create campaign via API
        const createdCampaign = await socialCampaignHelper.createCampaign({
          message: campaignOptions.message,
          url: campaignOptions.url,
          recipient: campaignOptions.recipient,
        });
        campaignId = createdCampaign.campaignId;
        socialCampaignPage.loadPage();
        await socialCampaignPage.assertions.verifyCampaignLinkDisplayed(campaignOptions.linkText);

        const description = TestDataGenerator.generateRandomString();
        await socialCampaignPage.actions.clickCampaignOptions();
        await socialCampaignPage.actions.clickShareToFeedButton();
        await socialCampaignPage.actions.enterShareDescription(description);
        await socialCampaignPage.actions.clickShareButton();
        await socialCampaignPage.assertions.verifyToastMessage('Shared social campaign successfully');

        await standardUserHomePage.actions.clickOnGlobalFeed();
        feedPage = new FeedPage(standardUserHomePage.page);
        await feedPage.verifyThePageIsLoaded();
        await feedPage.assertions.verifyCampaignLinkDisplayed(campaignOptions.linkText, description);
      }
    );

    test(
      'In Zeus Verify Standard User is able to Share a Social Campaign with a message to a Public Site using Post in SITE FEED option',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, TestGroupType.REGRESSION, '@CONT-26719'],
      },
      async ({ endUserHomePage, socialCampaignHelper, siteManagementHelper }) => {
        tagTest(test.info(), {
          description:
            'In Zeus Verify Standard User is able to Share a Social Campaign with a message to a Public Site using Post in SITE FEED option',
          zephyrTestId: 'CONT-26719',
          storyId: 'CONT-26719',
        });

        socialCampaignPage = new SocialCampaignPage(endUserHomePage.page);
        const siteName = 'All Employees';
        const siteId = await siteManagementHelper.getSiteIdWithName(siteName);
        // Create campaign with audience
        const campaignOptions = {
          message: SOCIAL_CAMPAIGN_TEST_DATA.MESSAGES.BLOG,
          url: SOCIAL_CAMPAIGN_TEST_DATA.URLS.SIMPPLR_ALL_EMPLOYEES,
          linkText: SOCIAL_CAMPAIGN_TEST_DATA.LINK_TEXT.SIMPPLR_ALL_EMPLOYEES,
          recipient: SocialCampaignRecipient.EVERYONE,
        };

        // Create campaign via API
        const createdCampaign = await socialCampaignHelper.createCampaign({
          message: campaignOptions.message,
          url: campaignOptions.url,
          recipient: campaignOptions.recipient,
        });
        campaignId = createdCampaign.campaignId;
        socialCampaignPage.loadPage();
        await socialCampaignPage.assertions.verifyCampaignLinkDisplayed(campaignOptions.linkText);

        const description = TestDataGenerator.generateRandomString();
        // Share campaign to site feed
        await socialCampaignPage.actions.clickCampaignOptions();
        await socialCampaignPage.actions.clickShareToFeedButton();
        await socialCampaignPage.actions.enterShareDescription(description);
        await socialCampaignPage.actions.selectShareOptionAsSiteFeed();
        await socialCampaignPage.actions.enterSiteName(siteName);
        await socialCampaignPage.actions.clickShareButton();
        await socialCampaignPage.assertions.verifyToastMessage('Shared social campaign successfully');

        const siteDashboardPage = new SiteDashboardPage(endUserHomePage.page, siteId);
        await siteDashboardPage.loadPage();
        await siteDashboardPage.actions.clickOnFeedLink();
        await siteDashboardPage.assertions.verifyCampaignLinkDisplayed(campaignOptions.linkText, description);
      }
    );

    test(
      'In Zeus Verify User is unable to view Shared SC Feed Post when SC is Deleted',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, TestGroupType.REGRESSION, '@CONT-26800'],
      },
      async ({ socialCampaignManagerHomePage, socialCampaignHelper, appManagerHomePage, endUserHomePage }) => {
        tagTest(test.info(), {
          description: 'In Zeus Verify User is unable to view Shared SC Feed Post when SC is Deleted',
          zephyrTestId: 'CONT-26800',
          storyId: 'CONT-26800',
        });

        // Create campaign with audience
        const campaignOptions = {
          message: SOCIAL_CAMPAIGN_TEST_DATA.MESSAGES.BLOG,
          url: SOCIAL_CAMPAIGN_TEST_DATA.URLS.SIMPPLR_ALL_EMPLOYEES,
          linkText: SOCIAL_CAMPAIGN_TEST_DATA.LINK_TEXT.SIMPPLR_ALL_EMPLOYEES,
          recipient: SocialCampaignRecipient.EVERYONE,
        };

        // Create campaign via API
        const createdCampaign = await socialCampaignHelper.createCampaign({
          message: campaignOptions.message,
          url: campaignOptions.url,
          recipient: campaignOptions.recipient,
        });
        campaignId = createdCampaign.campaignId;

        const description = TestDataGenerator.generateRandomString();
        await socialCampaignHelper.shareCampaignToFollowersFeed(campaignId, description);
        // Load pages and navigate to feeds in parallel
        await Promise.all([
          appManagerHomePage.loadPage(),
          socialCampaignManagerHomePage.loadPage(),
          endUserHomePage.loadPage(),
        ]);

        await Promise.all([
          appManagerHomePage.actions.clickOnGlobalFeed(),
          socialCampaignManagerHomePage.actions.clickOnGlobalFeed(),
          endUserHomePage.actions.clickOnGlobalFeed(),
        ]);

        const appManagerFeedPage = new FeedPage(appManagerHomePage.page);
        const socialCampaignManagerFeedPage = new FeedPage(socialCampaignManagerHomePage.page);
        const endUserFeedPage = new FeedPage(endUserHomePage.page);

        await Promise.all([
          appManagerFeedPage.verifyThePageIsLoaded(),
          socialCampaignManagerFeedPage.verifyThePageIsLoaded(),
          endUserFeedPage.verifyThePageIsLoaded(),
        ]);

        // Verify campaign is displayed in both feeds
        await Promise.all([
          appManagerFeedPage.assertions.verifyCampaignLinkDisplayed(campaignOptions.linkText, description),
          socialCampaignManagerFeedPage.assertions.verifyCampaignLinkDisplayed(campaignOptions.linkText, description),
          endUserFeedPage.assertions.verifyCampaignLinkDisplayed(campaignOptions.linkText, description),
        ]);

        // Delete campaign
        await socialCampaignHelper.deleteCampaign(campaignId);

        // Load pages and navigate to feeds in parallel
        await Promise.all([
          appManagerHomePage.loadPage(),
          socialCampaignManagerHomePage.loadPage(),
          endUserHomePage.loadPage(),
        ]);

        await Promise.all([
          appManagerHomePage.actions.clickOnGlobalFeed(),
          socialCampaignManagerHomePage.actions.clickOnGlobalFeed(),
          endUserHomePage.actions.clickOnGlobalFeed(),
        ]);

        // Verify campaign is no longer displayed in both feeds
        await Promise.all([
          appManagerFeedPage.assertions.verifyCampaignLinkNotDisplayed(campaignOptions.linkText, description),
          socialCampaignManagerFeedPage.assertions.verifyCampaignLinkNotDisplayed(
            campaignOptions.linkText,
            description
          ),
          endUserFeedPage.assertions.verifyCampaignLinkNotDisplayed(campaignOptions.linkText, description),
        ]);
      }
    );

    test(
      'In Zeus Verify User is able to view Shared Expired Social Campaign Feed Post',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, TestGroupType.REGRESSION, '@CONT-26799'],
      },
      async ({ socialCampaignManagerHomePage, socialCampaignHelper, appManagerHomePage, endUserHomePage }) => {
        tagTest(test.info(), {
          description: 'In Zeus Verify User is able to view Shared Expired Social Campaign Feed Post',
          zephyrTestId: 'CONT-26799',
          storyId: 'CONT-26799',
        });

        // Create campaign with audience
        const campaignOptions = {
          message: SOCIAL_CAMPAIGN_TEST_DATA.MESSAGES.BLOG,
          url: SOCIAL_CAMPAIGN_TEST_DATA.URLS.SIMPPLR_ALL_EMPLOYEES,
          linkText: SOCIAL_CAMPAIGN_TEST_DATA.LINK_TEXT.SIMPPLR_ALL_EMPLOYEES,
          recipient: SocialCampaignRecipient.EVERYONE,
        };

        // Create campaign via API
        const createdCampaign = await socialCampaignHelper.createCampaign({
          message: campaignOptions.message,
          url: campaignOptions.url,
          recipient: campaignOptions.recipient,
        });
        campaignId = createdCampaign.campaignId;

        const description = TestDataGenerator.generateRandomString();
        await socialCampaignHelper.shareCampaignToFollowersFeed(campaignId, description);
        // Load pages and navigate to feeds in parallel
        await Promise.all([
          appManagerHomePage.loadPage(),
          socialCampaignManagerHomePage.loadPage(),
          endUserHomePage.loadPage(),
        ]);

        await Promise.all([
          appManagerHomePage.actions.clickOnGlobalFeed(),
          socialCampaignManagerHomePage.actions.clickOnGlobalFeed(),
          endUserHomePage.actions.clickOnGlobalFeed(),
        ]);

        const appManagerFeedPage = new FeedPage(appManagerHomePage.page);
        const socialCampaignManagerFeedPage = new FeedPage(socialCampaignManagerHomePage.page);
        const endUserFeedPage = new FeedPage(endUserHomePage.page);

        await Promise.all([
          appManagerFeedPage.verifyThePageIsLoaded(),
          socialCampaignManagerFeedPage.verifyThePageIsLoaded(),
          endUserFeedPage.verifyThePageIsLoaded(),
        ]);

        // Verify campaign is displayed in both feeds
        await Promise.all([
          appManagerFeedPage.assertions.verifyCampaignLinkDisplayed(campaignOptions.linkText, description),
          appManagerFeedPage.assertions.verifySocialCampaignShareButtonIsVisible(description),
          socialCampaignManagerFeedPage.assertions.verifyCampaignLinkDisplayed(campaignOptions.linkText, description),
          socialCampaignManagerFeedPage.assertions.verifySocialCampaignShareButtonIsVisible(description),
          endUserFeedPage.assertions.verifyCampaignLinkDisplayed(campaignOptions.linkText, description),
          endUserFeedPage.assertions.verifySocialCampaignShareButtonIsVisible(description),
        ]);

        // Delete campaign
        await socialCampaignHelper.expireCampaign(campaignId);

        // Load pages and navigate to feeds in parallel
        await Promise.all([
          appManagerHomePage.loadPage(),
          socialCampaignManagerHomePage.loadPage(),
          endUserHomePage.loadPage(),
        ]);

        await Promise.all([
          appManagerHomePage.actions.clickOnGlobalFeed(),
          socialCampaignManagerHomePage.actions.clickOnGlobalFeed(),
          endUserHomePage.actions.clickOnGlobalFeed(),
        ]);

        // Verify campaign is no longer displayed in both feeds
        await Promise.all([
          appManagerFeedPage.assertions.verifyCampaignLinkDisplayed(campaignOptions.linkText, description),
          appManagerFeedPage.assertions.verifySocialCampaignShareButtonIsNotVisible(description),
          socialCampaignManagerFeedPage.assertions.verifyCampaignLinkDisplayed(campaignOptions.linkText, description),
          socialCampaignManagerFeedPage.assertions.verifySocialCampaignShareButtonIsNotVisible(description),
          endUserFeedPage.assertions.verifyCampaignLinkDisplayed(campaignOptions.linkText, description),
          endUserFeedPage.assertions.verifySocialCampaignShareButtonIsNotVisible(description),
        ]);
      }
    );
  }
);
