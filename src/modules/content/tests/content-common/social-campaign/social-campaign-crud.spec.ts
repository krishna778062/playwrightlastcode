import { ContentTestSuite } from '@content/constants/testSuite';
import { contentTestFixture as test } from '@content/fixtures/contentFixture';
import { SOCIAL_CAMPAIGN_TEST_DATA } from '@content/test-data/social-campaign.test-data';
import { FeedPage } from '@content/ui/pages/feedPage';
import { SocialCampaignPage } from '@content/ui/pages/socialCampaignPage';
import { TestPriority } from '@core/constants/testPriority';
import { TestGroupType } from '@core/constants/testType';
import {
  SocialCampaignFilter,
  SocialCampaignNetworkUI,
  SocialCampaignRecipient,
} from '@core/types/social-campaign.types';
import { TestDataGenerator } from '@core/utils/testDataGenerator';
import { tagTest } from '@core/utils/testDecorator';

import { SiteDashboardPage } from '@/src/modules/content/ui/pages/sitePages/siteDashboardPage';

test.describe(
  `social Campaign functionality`,
  {
    tag: [ContentTestSuite.SOCIAL_CAMPAIGN],
  },
  () => {
    let socialCampaignPage: SocialCampaignPage;
    let manualCleanupNeeded: boolean = false;
    let campaignId: string;
    let feedPage: FeedPage;
    let tileId: string;

    test.beforeEach(async ({ appManagerFixture }) => {
      // Reset cleanup flag for each test
      await appManagerFixture.socialCampaignHelper.deleteAllCampaigns(SocialCampaignFilter.LATEST);
      manualCleanupNeeded = false;
    });

    test.afterEach(async ({ appManagerFixture }) => {
      if (manualCleanupNeeded && campaignId) {
        await appManagerFixture.socialCampaignHelper.deleteCampaign(campaignId);
      }

      if (tileId) {
        await appManagerFixture.tileManagementHelper.deleteContentTile(tileId);
      }
    });

    test(
      'zeus | Social Campaign | Verify SC Manager able to create and delete Social Campaign for Everyone',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, '@CONT-33728', '@Social_Campaign_Add_Edit_Delete'],
      },
      async ({ socialCampaignManagerFixture }) => {
        socialCampaignPage = new SocialCampaignPage(socialCampaignManagerFixture.page);
        tagTest(test.info(), {
          description:
            'Zeus | Social Campaign | Verify SC Manager able to create and delete Social Campaign for Everyone',
          zephyrTestId: 'CONT-33728',
          storyId: 'CONT-33728',
        });

        await socialCampaignManagerFixture.navigationHelper.clickOnSocialCampaigns();
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
      'in Zeus Verify SC Manager able to delete the expired Social Campaign(Audience)',
      {
        tag: [TestPriority.P1, TestGroupType.REGRESSION, '@CONT-10526', '@Social_Campaign_Expire'],
      },
      async ({ socialCampaignManagerFixture, appManagerFixture }) => {
        tagTest(test.info(), {
          description: 'Zeus | Social Campaign | Verify End User can view and expire social campaign',
          zephyrTestId: 'CONT-10526',
          storyId: 'CONT-10526',
        });
        socialCampaignPage = new SocialCampaignPage(socialCampaignManagerFixture.page);

        await appManagerFixture.socialCampaignHelper.deleteAllCampaigns(SocialCampaignFilter.EXPIRED);
        const campaignData = {
          message: SOCIAL_CAMPAIGN_TEST_DATA.MESSAGES.BLOG,
          url: SOCIAL_CAMPAIGN_TEST_DATA.URLS.SIMPPLR_BLOG,
          linkText: SOCIAL_CAMPAIGN_TEST_DATA.LINK_TEXT.SIMPPLR_BLOG,
          recipient: SocialCampaignRecipient.AUDIENCE,
        };

        // Create or get a test audience for the campaign
        const audienceId = await appManagerFixture.audienceManagementHelper.getRandomAudienceId();

        // Create campaign via API
        const createdCampaign = await appManagerFixture.socialCampaignHelper.createCampaign({
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
      'verify App Manager able to share Social Campaign(Audience) to Site feed',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, TestGroupType.REGRESSION, '@CONT-10518'],
      },
      async ({ appManagerFixture }) => {
        tagTest(test.info(), {
          description: 'Verify App Manager able to share Social Campaign to Site feed',
          zephyrTestId: 'CONT-10518',
          storyId: 'CONT-10518',
        });

        socialCampaignPage = new SocialCampaignPage(appManagerFixture.page);
        const siteName = 'All Employees';
        const siteId = await appManagerFixture.siteManagementHelper.getSiteIdWithName(siteName);
        // Create campaign with audience
        const campaignOptions = {
          message: SOCIAL_CAMPAIGN_TEST_DATA.MESSAGES.BLOG,
          url: SOCIAL_CAMPAIGN_TEST_DATA.URLS.SIMPPLR_ALL_EMPLOYEES,
          linkText: SOCIAL_CAMPAIGN_TEST_DATA.LINK_TEXT.SIMPPLR_ALL_EMPLOYEES,
          recipient: SocialCampaignRecipient.EVERYONE,
        };

        // Create campaign via API
        const createdCampaign = await appManagerFixture.socialCampaignHelper.createCampaign({
          message: campaignOptions.message,
          url: campaignOptions.url,
          recipient: campaignOptions.recipient,
        });
        campaignId = createdCampaign.campaignId;
        await socialCampaignPage.loadPage();
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

        const siteDashboardPage = new SiteDashboardPage(appManagerFixture.page, siteId);
        await siteDashboardPage.loadPage();
        await siteDashboardPage.actions.clickOnFeedLink();
        await siteDashboardPage.assertions.verifyCampaignLinkDisplayed(campaignOptions.linkText, description);
        manualCleanupNeeded = true;
      }
    );

    test(
      'in Zeus Verify error messages on creating social campaign without required details',
      {
        tag: [TestPriority.P1, TestGroupType.REGRESSION, '@CONT-19603', '@Social_Campaign_Validation'],
      },
      async ({ appManagerFixture }) => {
        tagTest(test.info(), {
          description: 'In Zeus Verify error messages on creating social campaign without required details',
          zephyrTestId: 'CONT-19603',
          storyId: 'CONT-19603',
        });

        // Create social campaign page instance
        const socialCampaignPage = new SocialCampaignPage(appManagerFixture.page);

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
      'in Zeus Verify user able to create social campaign for selected(Twitter) social network',
      {
        tag: [TestPriority.P1, TestGroupType.REGRESSION, '@CONT-19604', '@Social_Campaign_Creation'],
      },
      async ({ appManagerFixture }) => {
        tagTest(test.info(), {
          description: 'In Zeus Verify user able to create social campaign for selected(Twitter) social network',
          zephyrTestId: 'CONT-19604',
          storyId: 'CONT-19604',
        });

        // Create social campaign page instance
        const socialCampaignPage = new SocialCampaignPage(appManagerFixture.page);
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
      'verify Audience Description Is Not Displayed When Not Present',
      {
        tag: [TestPriority.P1, TestGroupType.REGRESSION, '@CONT-33857', '@Social_Campaign_Audience'],
      },
      async ({ appManagerFixture }) => {
        tagTest(test.info(), {
          description: 'Verify Audience Description Is Not Displayed When Not Present',
          zephyrTestId: 'CONT-33857',
          storyId: 'CONT-33857',
        });

        // Create social campaign page instance
        const socialCampaignPage = new SocialCampaignPage(appManagerFixture.page);

        // Navigate to social campaigns and add campaign
        await socialCampaignPage.loadPage();
        await socialCampaignPage.actions.clickAddCampaignButton();

        const audienceDetailsWithDescription =
          await appManagerFixture.audienceManagementHelper.getAudienceWithDescription();
        const audienceDetailsWithNoDescription =
          await appManagerFixture.audienceManagementHelper.getAudienceWithNoDescription();

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
      'verify App Manager able to share Social Campaign to Home Feed',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, TestGroupType.REGRESSION, '@CONT-10515'],
      },
      async ({ appManagerFixture }) => {
        tagTest(test.info(), {
          description: 'Verify App Manager able to share Social Campaign to Home Feed',
          zephyrTestId: 'CONT-10515',
          storyId: 'CONT-10515',
        });

        socialCampaignPage = new SocialCampaignPage(appManagerFixture.page);
        // Create campaign with audience
        const campaignOptions = {
          message: SOCIAL_CAMPAIGN_TEST_DATA.MESSAGES.BLOG,
          url: SOCIAL_CAMPAIGN_TEST_DATA.URLS.SIMPPLR_ALL_EMPLOYEES,
          linkText: SOCIAL_CAMPAIGN_TEST_DATA.LINK_TEXT.SIMPPLR_ALL_EMPLOYEES,
          recipient: SocialCampaignRecipient.EVERYONE,
        };

        // Create campaign via API
        const createdCampaign = await appManagerFixture.socialCampaignHelper.createCampaign({
          message: campaignOptions.message,
          url: campaignOptions.url,
          recipient: campaignOptions.recipient,
        });
        campaignId = createdCampaign.campaignId;
        await socialCampaignPage.loadPage();
        await socialCampaignPage.assertions.verifyCampaignLinkDisplayed(campaignOptions.linkText);

        const description = TestDataGenerator.generateRandomString();
        await socialCampaignPage.actions.clickCampaignOptions();
        await socialCampaignPage.actions.clickShareToFeedButton();
        await socialCampaignPage.actions.enterShareDescription(description);
        await socialCampaignPage.actions.clickShareButton();
        await socialCampaignPage.assertions.verifyToastMessage('Shared social campaign successfully');
        await appManagerFixture.navigationHelper.clickOnGlobalFeed();
        feedPage = new FeedPage(appManagerFixture.page);
        await feedPage.verifyThePageIsLoaded();
        await feedPage.assertions.verifyCampaignLinkDisplayed(campaignOptions.linkText, description);
        manualCleanupNeeded = true;
      }
    );

    test(
      'in Zeus Verify App Manager able to delete the expired Social Campaign(Audience)',
      {
        tag: [TestPriority.P1, TestGroupType.REGRESSION, '@CONT-14899', '@Social_Campaign_Expire'],
      },
      async ({ appManagerFixture }) => {
        tagTest(test.info(), {
          description: 'In Zeus Verify App Manager able to delete the expired Social Campaign',
          zephyrTestId: 'CONT-14899',
          storyId: 'CONT-14899',
        });
        socialCampaignPage = new SocialCampaignPage(appManagerFixture.page);

        await appManagerFixture.socialCampaignHelper.deleteAllCampaigns(SocialCampaignFilter.EXPIRED);
        const campaignData = {
          message: SOCIAL_CAMPAIGN_TEST_DATA.MESSAGES.BLOG,
          url: SOCIAL_CAMPAIGN_TEST_DATA.URLS.SIMPPLR_BLOG,
          linkText: SOCIAL_CAMPAIGN_TEST_DATA.LINK_TEXT.SIMPPLR_BLOG,
          recipient: SocialCampaignRecipient.AUDIENCE,
        };

        // Create or get a test audience for the campaign
        const audienceId = await appManagerFixture.audienceManagementHelper.getRandomAudienceId();

        // Create campaign via API
        const createdCampaign = await appManagerFixture.socialCampaignHelper.createCampaign({
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
      'in Zeus Verify End User should not be able to share Social Campaign to Home Carousel delete and expire Campaign',
      {
        tag: [TestPriority.P1, TestGroupType.REGRESSION, '@CONT-14906', '@Social_Campaign_End_User_Restrictions'],
      },
      async ({ standardUserFixture, appManagerFixture }) => {
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

        await appManagerFixture.socialCampaignHelper.createCampaign({
          message: campaignData.message,
          url: campaignData.url,
          recipient: campaignData.recipient,
        });

        const endUserSocialCampaignPage = new SocialCampaignPage(standardUserFixture.page);
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
      'in Zeus Verify Standard User is able to Share a Social Campaign with a message using Post in HOME FEED option',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, TestGroupType.REGRESSION, '@CONT-26718'],
      },
      async ({ standardUserFixture, appManagerFixture }) => {
        tagTest(test.info(), {
          description: 'Verify App Manager able to share Social Campaign to Home Feed',
          zephyrTestId: 'CONT-26718',
          storyId: 'CONT-26718',
        });

        socialCampaignPage = new SocialCampaignPage(standardUserFixture.page);
        // Create campaign with audience
        const campaignOptions = {
          message: SOCIAL_CAMPAIGN_TEST_DATA.MESSAGES.BLOG,
          url: SOCIAL_CAMPAIGN_TEST_DATA.URLS.SIMPPLR_ALL_EMPLOYEES,
          linkText: SOCIAL_CAMPAIGN_TEST_DATA.LINK_TEXT.SIMPPLR_ALL_EMPLOYEES,
          recipient: SocialCampaignRecipient.EVERYONE,
        };

        // Create campaign via API
        const createdCampaign = await appManagerFixture.socialCampaignHelper.createCampaign({
          message: campaignOptions.message,
          url: campaignOptions.url,
          recipient: campaignOptions.recipient,
        });
        campaignId = createdCampaign.campaignId;
        await socialCampaignPage.loadPage();
        await socialCampaignPage.assertions.verifyCampaignLinkDisplayed(campaignOptions.linkText);

        const description = TestDataGenerator.generateRandomString();
        await socialCampaignPage.actions.clickCampaignOptions();
        await socialCampaignPage.actions.clickShareToFeedButton();
        await socialCampaignPage.actions.enterShareDescription(description);
        await socialCampaignPage.actions.clickShareButton();
        await socialCampaignPage.assertions.verifyToastMessage('Shared social campaign successfully');

        await standardUserFixture.navigationHelper.clickOnGlobalFeed();
        feedPage = new FeedPage(standardUserFixture.page);
        await feedPage.verifyThePageIsLoaded();
        await feedPage.assertions.verifyCampaignLinkDisplayed(campaignOptions.linkText, description);
      }
    );

    test(
      'in Zeus Verify Standard User is able to Share a Social Campaign with a message to a Public Site using Post in SITE FEED option',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, TestGroupType.REGRESSION, '@CONT-26719'],
      },
      async ({ standardUserFixture, appManagerFixture }) => {
        tagTest(test.info(), {
          description:
            'In Zeus Verify Standard User is able to Share a Social Campaign with a message to a Public Site using Post in SITE FEED option',
          zephyrTestId: 'CONT-26719',
          storyId: 'CONT-26719',
        });

        socialCampaignPage = new SocialCampaignPage(standardUserFixture.page);
        const siteName = 'All Employees';
        const siteId = await appManagerFixture.siteManagementHelper.getSiteIdWithName(siteName);
        // Create campaign with audience
        const campaignOptions = {
          message: SOCIAL_CAMPAIGN_TEST_DATA.MESSAGES.BLOG,
          url: SOCIAL_CAMPAIGN_TEST_DATA.URLS.SIMPPLR_ALL_EMPLOYEES,
          linkText: SOCIAL_CAMPAIGN_TEST_DATA.LINK_TEXT.SIMPPLR_ALL_EMPLOYEES,
          recipient: SocialCampaignRecipient.EVERYONE,
        };

        // Create campaign via API
        const createdCampaign = await appManagerFixture.socialCampaignHelper.createCampaign({
          message: campaignOptions.message,
          url: campaignOptions.url,
          recipient: campaignOptions.recipient,
        });
        campaignId = createdCampaign.campaignId;
        await socialCampaignPage.loadPage();
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

        const siteDashboardPage = new SiteDashboardPage(standardUserFixture.page, siteId);
        await siteDashboardPage.loadPage();
        await siteDashboardPage.actions.clickOnFeedLink();
        await siteDashboardPage.assertions.verifyCampaignLinkDisplayed(campaignOptions.linkText, description);
      }
    );

    test(
      'in Zeus Verify User is unable to view Shared SC Feed Post when SC is Deleted',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, TestGroupType.REGRESSION, '@CONT-26800'],
      },
      async ({ socialCampaignManagerFixture, appManagerFixture, standardUserFixture }) => {
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
        const createdCampaign = await appManagerFixture.socialCampaignHelper.createCampaign({
          message: campaignOptions.message,
          url: campaignOptions.url,
          recipient: campaignOptions.recipient,
        });
        campaignId = createdCampaign.campaignId;

        const description = TestDataGenerator.generateRandomString();
        await appManagerFixture.socialCampaignHelper.shareCampaignToFollowersFeed(campaignId, description);
        // Load pages and navigate to feeds in parallel
        await Promise.all([
          appManagerFixture.homePage.loadPage(),
          socialCampaignManagerFixture.homePage.loadPage(),
          standardUserFixture.homePage.loadPage(),
        ]);

        await Promise.all([
          appManagerFixture.navigationHelper.clickOnGlobalFeed(),
          socialCampaignManagerFixture.navigationHelper.clickOnGlobalFeed(),
          standardUserFixture.navigationHelper.clickOnGlobalFeed(),
        ]);

        const appManagerFeedPage = new FeedPage(appManagerFixture.page);
        const socialCampaignManagerFeedPage = new FeedPage(socialCampaignManagerFixture.page);
        const endUserFeedPage = new FeedPage(standardUserFixture.page);

        await Promise.all([
          appManagerFeedPage.verifyThePageIsLoaded(),
          socialCampaignManagerFeedPage.verifyThePageIsLoaded(),
          endUserFeedPage.verifyThePageIsLoaded(),
        ]);

        await Promise.all([
          appManagerFeedPage.actions.clickOnShowOption('all'),
          socialCampaignManagerFeedPage.actions.clickOnShowOption('all'),
          endUserFeedPage.actions.clickOnShowOption('all'),
        ]);

        // Verify campaign is displayed in both feeds
        await Promise.all([
          appManagerFeedPage.assertions.verifyCampaignLinkDisplayed(campaignOptions.linkText, description),
          socialCampaignManagerFeedPage.assertions.verifyCampaignLinkDisplayed(campaignOptions.linkText, description),
          endUserFeedPage.assertions.verifyCampaignLinkDisplayed(campaignOptions.linkText, description),
        ]);

        // Delete campaign
        await appManagerFixture.socialCampaignHelper.deleteCampaign(campaignId);

        // Load pages and navigate to feeds in parallel
        await Promise.all([
          appManagerFixture.homePage.loadPage(),
          socialCampaignManagerFixture.homePage.loadPage(),
          standardUserFixture.homePage.loadPage(),
        ]);

        await Promise.all([
          appManagerFixture.navigationHelper.clickOnGlobalFeed(),
          socialCampaignManagerFixture.navigationHelper.clickOnGlobalFeed(),
          standardUserFixture.navigationHelper.clickOnGlobalFeed(),
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
      'in Zeus Verify User is able to view Shared Expired Social Campaign Feed Post',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, TestGroupType.REGRESSION, '@CONT-26799'],
      },
      async ({ socialCampaignManagerFixture, appManagerFixture, standardUserFixture }) => {
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
        const createdCampaign = await appManagerFixture.socialCampaignHelper.createCampaign({
          message: campaignOptions.message,
          url: campaignOptions.url,
          recipient: campaignOptions.recipient,
        });
        campaignId = createdCampaign.campaignId;

        const description = TestDataGenerator.generateRandomString();
        await appManagerFixture.socialCampaignHelper.shareCampaignToFollowersFeed(campaignId, description);
        // Load pages and navigate to feeds in parallel
        await Promise.all([
          appManagerFixture.homePage.loadPage(),
          socialCampaignManagerFixture.homePage.loadPage(),
          standardUserFixture.homePage.loadPage(),
        ]);

        await Promise.all([
          appManagerFixture.navigationHelper.clickOnGlobalFeed(),
          socialCampaignManagerFixture.navigationHelper.clickOnGlobalFeed(),
          standardUserFixture.navigationHelper.clickOnGlobalFeed(),
        ]);

        const appManagerFeedPage = new FeedPage(appManagerFixture.page);
        const socialCampaignManagerFeedPage = new FeedPage(socialCampaignManagerFixture.page);
        const endUserFeedPage = new FeedPage(standardUserFixture.page);

        await Promise.all([
          appManagerFeedPage.verifyThePageIsLoaded(),
          socialCampaignManagerFeedPage.verifyThePageIsLoaded(),
          endUserFeedPage.verifyThePageIsLoaded(),
        ]);

        await Promise.all([
          appManagerFeedPage.actions.clickOnShowOption('all'),
          socialCampaignManagerFeedPage.actions.clickOnShowOption('all'),
          endUserFeedPage.actions.clickOnShowOption('all'),
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
        await appManagerFixture.socialCampaignHelper.expireCampaign(campaignId);

        // Load pages and navigate to feeds in parallel
        await Promise.all([
          appManagerFixture.homePage.loadPage(),
          socialCampaignManagerFixture.homePage.loadPage(),
          standardUserFixture.homePage.loadPage(),
        ]);

        await Promise.all([
          appManagerFixture.navigationHelper.clickOnGlobalFeed(),
          socialCampaignManagerFixture.navigationHelper.clickOnGlobalFeed(),
          standardUserFixture.navigationHelper.clickOnGlobalFeed(),
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

    test(
      'in Zeus Verify App Manager able to add and remove Social Campaign to Site Carousel and remove when deleted',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, TestGroupType.REGRESSION, '@CONT-14905'],
      },
      async ({ appManagerFixture }) => {
        tagTest(test.info(), {
          description: 'In Zeus Verify App Manager able to share Social Campaign to Home Carousel',
          zephyrTestId: 'CONT-14905',
          storyId: 'CONT-14905',
        });

        const siteName = 'All Employees';
        const siteId = await appManagerFixture.siteManagementHelper.getSiteIdWithName(siteName);
        // Create campaign with audience
        const campaignOptions = {
          message: SOCIAL_CAMPAIGN_TEST_DATA.MESSAGES.YOUTUBE,
          url: SOCIAL_CAMPAIGN_TEST_DATA.URLS.YOUTUBE,
          linkText: SOCIAL_CAMPAIGN_TEST_DATA.LINK_TEXT.YOUTUBE,
          recipient: SocialCampaignRecipient.EVERYONE,
        };

        // Create campaign via API
        const createdCampaign = await appManagerFixture.socialCampaignHelper.createCampaign({
          message: campaignOptions.message,
          url: campaignOptions.url,
          recipient: campaignOptions.recipient,
        });
        campaignId = createdCampaign.campaignId;

        //remove all the carousel items from the site
        await appManagerFixture.siteManagementHelper.getAndRemoveAllCarouselItems(siteId);

        const siteDashboardPage = new SiteDashboardPage(appManagerFixture.page, siteId);
        await siteDashboardPage.loadPage();
        await siteDashboardPage.actions.clickOnEditDashboard();
        await siteDashboardPage.actions.clickOnEditCarousel();
        await siteDashboardPage.actions.enterSearchCarouselInput(campaignOptions.linkText);
        await siteDashboardPage.actions.selectCarouselItem(campaignOptions.linkText);
        await siteDashboardPage.assertions.verifySocalCampaignInCarouselModal(campaignOptions.linkText);
        await siteDashboardPage.actions.clickDoneButton();
        await siteDashboardPage.assertions.verifySocalCampaignInCarouselItem(campaignOptions.linkText);
        // Delete campaign
        await appManagerFixture.socialCampaignHelper.deleteCampaign(campaignId);
        await siteDashboardPage.loadPage();
        await siteDashboardPage.assertions.verifySocalCampaignIsNotInCarouselItem(campaignOptions.linkText);
      }
    );

    test(
      'in Zeus Verify App Manager able to share Social Campaign to Site Feed and unable to share to SN when expired',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, TestGroupType.REGRESSION, '@CONT-14903'],
      },
      async ({ appManagerFixture }) => {
        tagTest(test.info(), {
          description: 'In Zeus Verify App Manager able to share Social Campaign to Home Carousel',
          zephyrTestId: 'CONT-14903',
          storyId: 'CONT-14903',
        });

        const siteName = 'All Employees';
        const siteId = await appManagerFixture.siteManagementHelper.getSiteIdWithName(siteName);
        // Create campaign with audience
        const campaignOptions = {
          message: SOCIAL_CAMPAIGN_TEST_DATA.MESSAGES.BLOG,
          url: SOCIAL_CAMPAIGN_TEST_DATA.URLS.SIMPPLR_ALL_EMPLOYEES,
          linkText: SOCIAL_CAMPAIGN_TEST_DATA.LINK_TEXT.SIMPPLR_ALL_EMPLOYEES,
          recipient: SocialCampaignRecipient.EVERYONE,
        };

        // Create campaign via API
        const createdCampaign = await appManagerFixture.socialCampaignHelper.createCampaign({
          message: campaignOptions.message,
          url: campaignOptions.url,
          recipient: campaignOptions.recipient,
        });
        campaignId = createdCampaign.campaignId;

        const description = TestDataGenerator.generateRandomString();
        await appManagerFixture.socialCampaignHelper.shareCampaignToSiteFeed(campaignId, description, siteId);
        const siteDashboardPage = new SiteDashboardPage(appManagerFixture.page, siteId);
        await siteDashboardPage.loadPage();
        await siteDashboardPage.actions.clickOnFeedLink();
        await siteDashboardPage.assertions.verifyCampaignLinkDisplayed(campaignOptions.linkText, description);

        // Expire campaign
        await appManagerFixture.socialCampaignHelper.expireCampaign(campaignId);
        await siteDashboardPage.loadPage();
        await siteDashboardPage.assertions.verifyCampaignLinkDisplayed(campaignOptions.linkText, description);
        await siteDashboardPage.assertions.verifySocialCampaignShareButtonIsNotVisible(description);
      }
    );

    test(
      'in Zeus Verify App Manager able to add and remove Social Campaign to Home Carousel and remove when expired',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, TestGroupType.REGRESSION, '@CONT-14904'],
      },
      async ({ appManagerFixture }) => {
        tagTest(test.info(), {
          description: 'In Zeus Verify App Manager able to share Social Campaign to Home Carousel',
          zephyrTestId: 'CONT-14904',
          storyId: 'CONT-14904',
        });

        const siteName = 'All Employees';
        const siteId = await appManagerFixture.siteManagementHelper.getSiteIdWithName(siteName);
        // Create campaign with audience
        const campaignOptions = {
          message: SOCIAL_CAMPAIGN_TEST_DATA.MESSAGES.YOUTUBE,
          url: SOCIAL_CAMPAIGN_TEST_DATA.URLS.YOUTUBE,
          linkText: SOCIAL_CAMPAIGN_TEST_DATA.LINK_TEXT.YOUTUBE,
          recipient: SocialCampaignRecipient.EVERYONE,
        };

        // Create campaign via API
        const createdCampaign = await appManagerFixture.socialCampaignHelper.createCampaign({
          message: campaignOptions.message,
          url: campaignOptions.url,
          recipient: campaignOptions.recipient,
        });
        campaignId = createdCampaign.campaignId;

        //remove all the carousel items from the site
        await appManagerFixture.siteManagementHelper.getAndRemoveAllCarouselItems(siteId);

        const siteDashboardPage = new SiteDashboardPage(appManagerFixture.page, siteId);
        await siteDashboardPage.loadPage();
        await siteDashboardPage.actions.clickOnEditDashboard();
        await siteDashboardPage.actions.clickOnEditCarousel();
        await siteDashboardPage.actions.enterSearchCarouselInput(campaignOptions.linkText);
        await siteDashboardPage.actions.selectCarouselItem(campaignOptions.linkText);
        await siteDashboardPage.assertions.verifySocalCampaignInCarouselModal(campaignOptions.linkText);
        await siteDashboardPage.actions.clickDoneButton();
        await siteDashboardPage.assertions.verifySocalCampaignInCarouselItem(campaignOptions.linkText);
        // expire campaign
        await appManagerFixture.socialCampaignHelper.expireCampaign(campaignId);
        await siteDashboardPage.loadPage();
        await siteDashboardPage.assertions.verifySocalCampaignIsNotInCarouselItem(campaignOptions.linkText);
      }
    );

    test(
      'in Zeus Verify App Manager able to create latest and popular Tile on Home Dashboard and SC removed from tile when it is deleted',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, TestGroupType.REGRESSION, '@CONT-14900'],
      },
      async ({ appManagerFixture }) => {
        tagTest(test.info(), {
          description:
            'In Zeus Verify App Manager able to create latest and popular Tile on Home Dashboard and SC removed from tile when it is deleted',
          zephyrTestId: 'CONT-14900',
          storyId: 'CONT-14900',
        });

        const applicationManagerHomePage = appManagerFixture.homePage;

        // Create campaign with audience
        const campaignOptions = {
          message: SOCIAL_CAMPAIGN_TEST_DATA.MESSAGES.YOUTUBE,
          url: SOCIAL_CAMPAIGN_TEST_DATA.URLS.YOUTUBE,
          linkText: SOCIAL_CAMPAIGN_TEST_DATA.LINK_TEXT.YOUTUBE,
          recipient: SocialCampaignRecipient.EVERYONE,
        };

        // Create campaign via API
        const createdCampaign = await appManagerFixture.socialCampaignHelper.createCampaign({
          message: campaignOptions.message,
          url: campaignOptions.url,
          recipient: campaignOptions.recipient,
        });

        const tileTitle = TestDataGenerator.generateRandomString();
        campaignId = createdCampaign.campaignId;
        await applicationManagerHomePage.loadPage();
        await applicationManagerHomePage.actions.clickOnManageDashboardCarousel();
        await applicationManagerHomePage.actions.clickOnAddTile();
        await applicationManagerHomePage.actions.clickOnSocialCampaignTile();
        await applicationManagerHomePage.actions.enterTileTitle(tileTitle);
        tileId = await applicationManagerHomePage.actions.clickAddToHomeButton();
        await applicationManagerHomePage.assertions.verifyTileIsDisplayed(tileTitle);
        await applicationManagerHomePage.assertions.verifySocialCampaignNameInTheDisplayed(campaignOptions.linkText);
        await appManagerFixture.socialCampaignHelper.deleteCampaign(campaignId);
        await applicationManagerHomePage.loadPage();
        await applicationManagerHomePage.assertions.verifySocialCampaignNameNotDisplayed(campaignOptions.linkText);
      }
    );

    test(
      'in Zeus Verify custom user able to create Custom SC Tile on Home Dashboard and SC removed from tile when it is deleted',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, TestGroupType.REGRESSION, '@CONT-21039'],
      },
      async ({ socialCampaignManagerFixture }) => {
        tagTest(test.info(), {
          description:
            'In Zeus Verify custom user able to create Custom SC Tile on Home Dashboard and SC removed from tile when it is deleted',
          zephyrTestId: 'CONT-21039',
          storyId: 'CONT-21039',
        });

        const applicationManagerHomePage = socialCampaignManagerFixture.homePage;

        // Create campaign with audience
        const campaignOptions = {
          message: SOCIAL_CAMPAIGN_TEST_DATA.MESSAGES.YOUTUBE,
          url: SOCIAL_CAMPAIGN_TEST_DATA.URLS.YOUTUBE,
          linkText: SOCIAL_CAMPAIGN_TEST_DATA.LINK_TEXT.YOUTUBE,
          recipient: SocialCampaignRecipient.EVERYONE,
        };

        // Create campaign via API
        const createdCampaign = await socialCampaignManagerFixture.socialCampaignHelper.createCampaign({
          message: campaignOptions.message,
          url: campaignOptions.url,
          recipient: campaignOptions.recipient,
          shouldWaitForSearchIndex: true,
        });

        const tileTitle = TestDataGenerator.generateRandomString();
        campaignId = createdCampaign.campaignId;
        await applicationManagerHomePage.loadPage();
        await applicationManagerHomePage.actions.clickOnManageDashboardCarousel();
        await applicationManagerHomePage.actions.clickOnAddTile();
        await applicationManagerHomePage.actions.clickOnSocialCampaignTile();
        await applicationManagerHomePage.actions.clickOnCustomSCTile();
        await applicationManagerHomePage.actions.enterTileTitle(tileTitle);
        await applicationManagerHomePage.actions.setCustomSCTitle(campaignOptions.linkText);
        tileId = await applicationManagerHomePage.actions.clickAddToHomeButton();
        await applicationManagerHomePage.assertions.verifyTileIsDisplayed(tileTitle);
        await applicationManagerHomePage.assertions.verifySocialCampaignNameInTheDisplayed(campaignOptions.linkText);
        await socialCampaignManagerFixture.socialCampaignHelper.deleteCampaign(campaignId);
        await applicationManagerHomePage.loadPage();
        await applicationManagerHomePage.assertions.verifySocialCampaignNameNotDisplayed(campaignOptions.linkText);
      }
    );

    test(
      'in Zeus Verify custom user able to create latest and popular Tile on Home Dashboard and SC removed from tile when it is deleted',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, TestGroupType.REGRESSION, '@CONT-40602'],
      },
      async ({ socialCampaignManagerFixture }) => {
        tagTest(test.info(), {
          description:
            'In Zeus Verify custom user able to create latest and popular Tile on Home Dashboard and SC removed from tile when it is deleted',
          zephyrTestId: 'CONT-40602',
          storyId: 'CONT-40602',
        });

        const applicationManagerHomePage = socialCampaignManagerFixture.homePage;

        // Create campaign with audience
        const campaignOptions = {
          message: SOCIAL_CAMPAIGN_TEST_DATA.MESSAGES.YOUTUBE,
          url: SOCIAL_CAMPAIGN_TEST_DATA.URLS.YOUTUBE,
          linkText: SOCIAL_CAMPAIGN_TEST_DATA.LINK_TEXT.YOUTUBE,
          recipient: SocialCampaignRecipient.EVERYONE,
        };

        // Create campaign via API
        const createdCampaign = await socialCampaignManagerFixture.socialCampaignHelper.createCampaign({
          message: campaignOptions.message,
          url: campaignOptions.url,
          recipient: campaignOptions.recipient,
          shouldWaitForSearchIndex: true,
        });

        const tileTitle = TestDataGenerator.generateRandomString();
        campaignId = createdCampaign.campaignId;
        await applicationManagerHomePage.loadPage();
        await applicationManagerHomePage.actions.clickOnManageDashboardCarousel();
        await applicationManagerHomePage.actions.clickOnAddTile();
        await applicationManagerHomePage.actions.clickOnSocialCampaignTile();
        await applicationManagerHomePage.actions.enterTileTitle(tileTitle);
        tileId = await applicationManagerHomePage.actions.clickAddToHomeButton();
        await applicationManagerHomePage.assertions.verifyTileIsDisplayed(tileTitle);
        await applicationManagerHomePage.assertions.verifySocialCampaignNameInTheDisplayed(campaignOptions.linkText);
        await socialCampaignManagerFixture.socialCampaignHelper.deleteCampaign(campaignId);
        await applicationManagerHomePage.loadPage();
        await applicationManagerHomePage.assertions.verifySocialCampaignNameNotDisplayed(campaignOptions.linkText);
      }
    );

    test(
      'in Zeus Verify application manager able to create Custom SC Tile on Home Dashboard and SC removed from tile when it is deleted',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, TestGroupType.REGRESSION, '@CONT-40519'],
      },
      async ({ appManagerFixture }) => {
        tagTest(test.info(), {
          description:
            'In Zeus Verify application manager able to create Custom SC Tile on Home Dashboard and SC removed from tile when it is deleted',
          zephyrTestId: 'CONT-40519',
          storyId: 'CONT-40519',
        });

        const applicationManagerHomePage = appManagerFixture.homePage;

        // Create campaign with audience
        const campaignOptions = {
          message: SOCIAL_CAMPAIGN_TEST_DATA.MESSAGES.YOUTUBE,
          url: SOCIAL_CAMPAIGN_TEST_DATA.URLS.YOUTUBE,
          linkText: SOCIAL_CAMPAIGN_TEST_DATA.LINK_TEXT.YOUTUBE,
          recipient: SocialCampaignRecipient.EVERYONE,
        };

        // Create campaign via API
        const createdCampaign = await appManagerFixture.socialCampaignHelper.createCampaign({
          message: campaignOptions.message,
          url: campaignOptions.url,
          recipient: campaignOptions.recipient,
          shouldWaitForSearchIndex: true,
        });

        const tileTitle = TestDataGenerator.generateRandomString();
        campaignId = createdCampaign.campaignId;
        await applicationManagerHomePage.loadPage();
        await applicationManagerHomePage.actions.clickOnManageDashboardCarousel();
        await applicationManagerHomePage.actions.clickOnAddTile();
        await applicationManagerHomePage.actions.clickOnSocialCampaignTile();
        await applicationManagerHomePage.actions.clickOnCustomSCTile();
        await applicationManagerHomePage.actions.enterTileTitle(tileTitle);
        await applicationManagerHomePage.actions.setCustomSCTitle(campaignOptions.linkText);
        tileId = await applicationManagerHomePage.actions.clickAddToHomeButton();
        await applicationManagerHomePage.assertions.verifyTileIsDisplayed(tileTitle);
        await applicationManagerHomePage.assertions.verifySocialCampaignNameInTheDisplayed(campaignOptions.linkText);
        await appManagerFixture.socialCampaignHelper.deleteCampaign(campaignId);
        await applicationManagerHomePage.loadPage();
        await applicationManagerHomePage.assertions.verifySocialCampaignNameNotDisplayed(campaignOptions.linkText);
      }
    );

    test(
      'in Zeus Verify App Manager able to create Custom SC Tile on Site Dashboard and SC removed from tile when it is expired',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, TestGroupType.REGRESSION, '@CONT-40721'],
      },
      async ({ appManagerFixture }) => {
        tagTest(test.info(), {
          description:
            'In Zeus Verify App Manager able to create Custom SC Tile on Site Dashboard and SC removed from tile when it is expired',
          zephyrTestId: 'CONT-40721',
          storyId: 'CONT-40721',
        });

        // Create campaign with audience
        const campaignOptions = {
          message: SOCIAL_CAMPAIGN_TEST_DATA.MESSAGES.YOUTUBE,
          url: SOCIAL_CAMPAIGN_TEST_DATA.URLS.YOUTUBE,
          linkText: SOCIAL_CAMPAIGN_TEST_DATA.LINK_TEXT.YOUTUBE,
          recipient: SocialCampaignRecipient.EVERYONE,
        };

        // Create campaign via API
        const createdCampaign = await appManagerFixture.socialCampaignHelper.createCampaign({
          message: campaignOptions.message,
          url: campaignOptions.url,
          recipient: campaignOptions.recipient,
          shouldWaitForSearchIndex: true,
        });
        const siteName = 'All Employees';
        const siteId = await appManagerFixture.siteManagementHelper.getSiteIdWithName(siteName);
        const tileTitle = TestDataGenerator.generateRandomString();
        const siteDashboardPage = new SiteDashboardPage(appManagerFixture.page, siteId);
        await siteDashboardPage.loadPage();
        await siteDashboardPage.actions.clickOnEditDashboard();
        await siteDashboardPage.actions.clickOnAddTile();
        await siteDashboardPage.actions.clickOnSocialCampaignTile();
        await siteDashboardPage.actions.clickOnCustomSCTile();
        await siteDashboardPage.actions.enterTileTitle(tileTitle);
        await siteDashboardPage.actions.setCustomSCTitle(campaignOptions.linkText);
        tileId = await siteDashboardPage.actions.clickAddToSiteButton();
        await siteDashboardPage.assertions.verifyTileIsDisplayed(tileTitle);
        await siteDashboardPage.assertions.verifySocialCampaignNameInTheDisplayed(campaignOptions.linkText);
        await appManagerFixture.socialCampaignHelper.expireCampaign(campaignId);
        await siteDashboardPage.loadPage();
        await siteDashboardPage.assertions.verifySocialCampaignNameNotDisplayed(campaignOptions.linkText);
      }
    );

    test(
      'in Zeus Verify App Manager able to create latest and popular Tile on Site Dashboard and SC removed from tile when it is expired',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, TestGroupType.REGRESSION, '@CONT-14900'],
      },
      async ({ appManagerFixture }) => {
        tagTest(test.info(), {
          description:
            'In Zeus Verify App Manager able to create latest and popular Tile on Site Dashboard and SC removed from tile when it is expired',
          zephyrTestId: 'CONT-14901',
          storyId: 'CONT-14901',
        });

        // Create campaign with audience
        const campaignOptions = {
          message: SOCIAL_CAMPAIGN_TEST_DATA.MESSAGES.YOUTUBE,
          url: SOCIAL_CAMPAIGN_TEST_DATA.URLS.YOUTUBE,
          linkText: SOCIAL_CAMPAIGN_TEST_DATA.LINK_TEXT.YOUTUBE,
          recipient: SocialCampaignRecipient.EVERYONE,
        };

        // Create campaign via API
        const createdCampaign = await appManagerFixture.socialCampaignHelper.createCampaign({
          message: campaignOptions.message,
          url: campaignOptions.url,
          recipient: campaignOptions.recipient,
        });

        const siteName = 'All Employees';
        const siteId = await appManagerFixture.siteManagementHelper.getSiteIdWithName(siteName);
        const tileTitle = TestDataGenerator.generateRandomString();
        const siteDashboardPage = new SiteDashboardPage(appManagerFixture.page, siteId);
        await siteDashboardPage.loadPage();
        await siteDashboardPage.actions.clickOnEditDashboard();
        await siteDashboardPage.actions.clickOnAddTile();
        await siteDashboardPage.actions.clickOnSocialCampaignTile();
        await siteDashboardPage.actions.enterTileTitle(tileTitle);
        tileId = await siteDashboardPage.actions.clickAddToSiteButton();
        await siteDashboardPage.assertions.verifyTileIsDisplayed(tileTitle);
        await siteDashboardPage.assertions.verifySocialCampaignNameInTheDisplayed(campaignOptions.linkText);
        await appManagerFixture.socialCampaignHelper.expireCampaign(campaignId);
        await siteDashboardPage.loadPage();
        await siteDashboardPage.assertions.verifySocialCampaignNameNotDisplayed(campaignOptions.linkText);
      }
    );

    test(
      'zeus | Social Campaign | Verify App Manager able to create and delete Social Campaign for Everyone',
      {
        tag: [TestPriority.P1, TestGroupType.REGRESSION, '@CONT-14898', '@Social_Campaign_Add_Delete'],
      },
      async ({ appManagerFixture }) => {
        socialCampaignPage = new SocialCampaignPage(appManagerFixture.page);
        tagTest(test.info(), {
          description:
            'Zeus | Social Campaign | Verify App Manager able to create and delete Social Campaign for Everyone',
          zephyrTestId: 'CONT-14898',
          storyId: 'CONT-14898',
        });

        await appManagerFixture.navigationHelper.clickOnSocialCampaigns();
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
  }
);
