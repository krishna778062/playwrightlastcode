import { ContentTestSuite } from '@content/constants/testSuite';
import { contentTestFixture as test } from '@content/fixtures/contentFixture';
import { SOCIAL_CAMPAIGN_TEST_DATA } from '@content/test-data/social-campaign.test-data';
import { AddCampaignPage } from '@content/ui/pages/addCampaignPage';
import { FeedPage } from '@content/ui/pages/feedPage';
import { SocialCampaignPage } from '@content/ui/pages/socialCampaignPage';
import { TestPriority } from '@core/constants/testPriority';
import { TestGroupType } from '@core/constants/testType';
import {
  SocialCampaignFilter,
  SocialCampaignNetwork,
  SocialCampaignNetworkUI,
  SocialCampaignRecipient,
} from '@core/types/social-campaign.types';
import { TestDataGenerator } from '@core/utils/testDataGenerator';
import { tagTest } from '@core/utils/testDecorator';

import { getContentTenantConfigFromCache } from '@/src/modules/content/config/contentConfig';
import { DEFAULT_PUBLIC_SITE_NAME } from '@/src/modules/content/test-data/sites-create.test-data';
import { ManageFeaturesPage } from '@/src/modules/content/ui/pages/manageFeaturesPage';
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
    let addCampaignPage: AddCampaignPage;

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
      'zeus | Social Campaign | Verify SC Manager able to create and delete Social Campaign for Everyone CONT-44794',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, '@CONT-44794', '@Social_Campaign_Add_Edit_Delete'],
      },
      async ({ socialCampaignManagerFixture }) => {
        socialCampaignPage = new SocialCampaignPage(socialCampaignManagerFixture.page);
        tagTest(test.info(), {
          description:
            'Zeus | Social Campaign | Verify SC Manager able to create and delete Social Campaign for Everyone',
          zephyrTestId: 'CONT-44794',
          storyId: 'CONT-44794',
        });

        await socialCampaignManagerFixture.navigationHelper.clickOnSocialCampaigns();
        await socialCampaignPage.clickAddCampaignButton();

        // Create and post social campaign using wrapper function
        const campaignOptions = {
          message: SOCIAL_CAMPAIGN_TEST_DATA.MESSAGES.YOUTUBE,
          url: SOCIAL_CAMPAIGN_TEST_DATA.URLS.YOUTUBE,
          linkText: SOCIAL_CAMPAIGN_TEST_DATA.LINK_TEXT.YOUTUBE,
          recipient: SocialCampaignRecipient.EVERYONE,
        };

        addCampaignPage = new AddCampaignPage(socialCampaignManagerFixture.page);
        // When Add Campaign and Create
        campaignId = await addCampaignPage.AddCampaignAndCreate(campaignOptions);
        await socialCampaignPage.verifyToastMessageIsVisibleWithText(
          SOCIAL_CAMPAIGN_TEST_DATA.TOAST_MESSAGES.CREATED_SUCCESSFULLY
        );
        await socialCampaignPage.verifyCampaignLinkDisplayed(campaignOptions.linkText);
        await socialCampaignPage.clickPopularLink();
        await socialCampaignPage.verifyCampaignLinkDisplayed(campaignOptions.linkText);

        manualCleanupNeeded = true;
      }
    );

    test(
      'in Zeus Verify SC Manager able to delete the expired Social Campaign(Audience) CONT-44793',
      {
        tag: [TestPriority.P1, TestGroupType.REGRESSION, '@CONT-44793', '@Social_Campaign_Expire'],
      },
      async ({ socialCampaignManagerFixture, appManagerFixture }) => {
        tagTest(test.info(), {
          description: 'Zeus | Social Campaign | Verify End User can view and expire social campaign',
          zephyrTestId: 'CONT-44793',
          storyId: 'CONT-44793',
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
        const audienceDetails = await appManagerFixture.audienceManagementHelper.getRandomAudienceId();

        // Create campaign via API
        const createdCampaign = await appManagerFixture.socialCampaignHelper.createCampaign({
          message: campaignData.message,
          url: campaignData.url,
          recipient: campaignData.recipient,
          audienceId: audienceDetails.audienceId,
        });

        campaignId = createdCampaign.campaignId;

        await socialCampaignPage.loadPage();

        await socialCampaignPage.verifyCampaignLinkDisplayed(campaignData.linkText);
        await socialCampaignPage.clickCampaignOptions();

        await socialCampaignPage.clickExpireCampaignButton();

        await socialCampaignPage.confirmExpireCampaign();
        await socialCampaignPage.verifyToastMessageIsVisibleWithText(
          SOCIAL_CAMPAIGN_TEST_DATA.TOAST_MESSAGES.EXPIRED_SUCCESSFULLY
        );
        await socialCampaignPage.verifyCampaignNotInLatest(campaignData.linkText);

        await socialCampaignPage.clickExpiredLink();

        await socialCampaignPage.verifyCampaignInExpired(campaignData.linkText);

        await socialCampaignPage.clickCampaignOptions();
        await socialCampaignPage.clickDeleteCampaignButton();
        await socialCampaignPage.confirmDeleteCampaign();
        await socialCampaignPage.verifyToastMessageIsVisibleWithText(
          SOCIAL_CAMPAIGN_TEST_DATA.TOAST_MESSAGES.DELETED_SUCCESSFULLY
        );
        await socialCampaignPage.verifyCampaignNotInExpired(campaignData.linkText);
      }
    );

    test(
      'verify App Manager able to share Social Campaign(Audience) to Site feed CONT-44792',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, TestGroupType.REGRESSION, '@CONT-44792'],
      },
      async ({ appManagerFixture }) => {
        tagTest(test.info(), {
          description: 'Verify App Manager able to share Social Campaign to Site feed',
          zephyrTestId: 'CONT-44792',
          storyId: 'CONT-44792',
        });

        socialCampaignPage = new SocialCampaignPage(appManagerFixture.page);
        const siteId =
          await appManagerFixture.abacSiteManagementHelper.searchSiteAndActivateIfNeeded(DEFAULT_PUBLIC_SITE_NAME);
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
        await socialCampaignPage.verifyCampaignLinkDisplayed(campaignOptions.linkText);

        const description = TestDataGenerator.generateRandomString('Social Campaign Share Description');
        // Share campaign to site feed
        await socialCampaignPage.clickCampaignOptions();
        await socialCampaignPage.clickShareToFeedButton();
        await socialCampaignPage.enterShareDescription(description);
        await socialCampaignPage.selectShareOptionAsSiteFeed();
        await socialCampaignPage.enterSiteName(DEFAULT_PUBLIC_SITE_NAME);
        await socialCampaignPage.clickShareButton();
        await socialCampaignPage.verifyToastMessageIsVisibleWithText(
          SOCIAL_CAMPAIGN_TEST_DATA.TOAST_MESSAGES.SHARED_SUCCESSFULLY
        );

        const siteDashboardPage = new SiteDashboardPage(appManagerFixture.page, siteId);
        await siteDashboardPage.loadPage();
        await siteDashboardPage.clickOnFeedLink();
        await siteDashboardPage.verifyCampaignLinkDisplayed(campaignOptions.linkText, description);
        manualCleanupNeeded = true;
      }
    );

    test(
      'in Zeus Verify error messages on creating social campaign without required details CONT-44791',
      {
        tag: [TestPriority.P1, TestGroupType.REGRESSION, '@CONT-44791', '@Social_Campaign_Validation'],
      },
      async ({ appManagerFixture }) => {
        tagTest(test.info(), {
          description: 'In Zeus Verify error messages on creating social campaign without required details',
          zephyrTestId: 'CONT-44791',
          storyId: 'CONT-44791',
        });

        // Create social campaign page instance
        const socialCampaignPage = new SocialCampaignPage(appManagerFixture.page);

        // Navigate to social campaigns and add campaign
        await socialCampaignPage.loadPage();
        await socialCampaignPage.clickAddCampaignButton();
        addCampaignPage = new AddCampaignPage(appManagerFixture.page);
        await addCampaignPage.enterCampaignUrl(SOCIAL_CAMPAIGN_TEST_DATA.URLS.YOUTUBE_2);
        await addCampaignPage.uncheckNetwork('X');
        await addCampaignPage.uncheckNetwork('Facebook');
        await addCampaignPage.uncheckNetwork('LinkedIn');
        await addCampaignPage.clickCreateCampaignButton();
        await addCampaignPage.verifyErrorMessagePresence('You must select at least one social network');
        await addCampaignPage.verifyErrorMessagePresence(
          'Suggested campaign message is a required field is a required field'
        );
      }
    );

    test(
      'in Zeus Verify user able to create social campaign for selected(Twitter) social network CONT-44790',
      {
        tag: [TestPriority.P1, TestGroupType.REGRESSION, '@CONT-44790', '@Social_Campaign_Creation'],
      },
      async ({ appManagerFixture }) => {
        tagTest(test.info(), {
          description: 'In Zeus Verify user able to create social campaign for selected(Twitter) social network',
          zephyrTestId: 'CONT-44790',
          storyId: 'CONT-44790',
        });

        // Create social campaign page instance
        const socialCampaignPage = new SocialCampaignPage(appManagerFixture.page);
        await socialCampaignPage.loadPage();
        await socialCampaignPage.clickAddCampaignButton();

        const campaignOptions = {
          message: SOCIAL_CAMPAIGN_TEST_DATA.MESSAGES.YOUTUBE,
          url: SOCIAL_CAMPAIGN_TEST_DATA.URLS.YOUTUBE,
          linkText: SOCIAL_CAMPAIGN_TEST_DATA.LINK_TEXT.YOUTUBE,
          recipient: SocialCampaignRecipient.EVERYONE,
          networks: [SocialCampaignNetworkUI.TWITTER],
        };
        addCampaignPage = new AddCampaignPage(appManagerFixture.page);

        campaignId = await addCampaignPage.AddCampaignAndCreate(campaignOptions);
        await socialCampaignPage.verifyToastMessageIsVisibleWithText(
          SOCIAL_CAMPAIGN_TEST_DATA.TOAST_MESSAGES.CREATED_SUCCESSFULLY
        );
        await socialCampaignPage.verifyCampaignLinkDisplayed(campaignOptions.linkText);

        manualCleanupNeeded = true;
      }
    );

    test(
      'verify App Manager able to share Social Campaign to Home Feed CONT-44789',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, TestGroupType.REGRESSION, '@CONT-44789'],
      },
      async ({ appManagerFixture }) => {
        tagTest(test.info(), {
          description: 'Verify App Manager able to share Social Campaign to Home Feed',
          zephyrTestId: 'CONT-44789',
          storyId: 'CONT-44789',
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
        await socialCampaignPage.verifyCampaignLinkDisplayed(campaignOptions.linkText);

        const description = TestDataGenerator.generateRandomString();
        await socialCampaignPage.clickCampaignOptions();
        await socialCampaignPage.clickShareToFeedButton();
        await socialCampaignPage.enterShareDescription(description);
        await socialCampaignPage.clickShareButton();
        await socialCampaignPage.verifyToastMessageIsVisibleWithText(
          SOCIAL_CAMPAIGN_TEST_DATA.TOAST_MESSAGES.SHARED_SUCCESSFULLY
        );
        await appManagerFixture.navigationHelper.clickOnGlobalFeed();
        feedPage = new FeedPage(appManagerFixture.page);
        await feedPage.verifyThePageIsLoaded();
        await feedPage.feedList.verifyCampaignLinkDisplayed(campaignOptions.linkText, description);
        manualCleanupNeeded = true;
      }
    );

    test(
      'in Zeus Verify App Manager able to delete the expired Social Campaign(Audience) CONT-44788',
      {
        tag: [TestPriority.P1, TestGroupType.REGRESSION, '@CONT-44788', '@Social_Campaign_Expire'],
      },
      async ({ appManagerFixture }) => {
        tagTest(test.info(), {
          description: 'In Zeus Verify App Manager able to delete the expired Social Campaign',
          zephyrTestId: 'CONT-44788',
          storyId: 'CONT-44788',
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
        const audienceDetails = await appManagerFixture.abacAudienceHelper.getRandomAudienceIdABAC();

        // Create campaign via API
        const createdCampaign = await appManagerFixture.socialCampaignHelper.createCampaign({
          message: campaignData.message,
          url: campaignData.url,
          recipient: campaignData.recipient,
          audienceId: audienceDetails.audienceId,
        });

        campaignId = createdCampaign.campaignId;

        await socialCampaignPage.loadPage();

        await socialCampaignPage.verifyCampaignLinkDisplayed(campaignData.linkText);
        await socialCampaignPage.clickCampaignOptions();

        await socialCampaignPage.clickExpireCampaignButton();

        await socialCampaignPage.confirmExpireCampaign();
        await socialCampaignPage.verifyToastMessageIsVisibleWithText(
          SOCIAL_CAMPAIGN_TEST_DATA.TOAST_MESSAGES.EXPIRED_SUCCESSFULLY
        );
        await socialCampaignPage.verifyCampaignNotInLatest(campaignData.linkText);

        await socialCampaignPage.clickExpiredLink();

        await socialCampaignPage.verifyCampaignInExpired(campaignData.linkText);

        await socialCampaignPage.clickCampaignOptions();
        await socialCampaignPage.clickDeleteCampaignButton();
        await socialCampaignPage.confirmDeleteCampaign();
        await socialCampaignPage.verifyToastMessageIsVisibleWithText(
          SOCIAL_CAMPAIGN_TEST_DATA.TOAST_MESSAGES.DELETED_SUCCESSFULLY
        );
        await socialCampaignPage.verifyCampaignNotInExpired(campaignData.linkText);
      }
    );

    test(
      'in Zeus Verify End User should not be able to share Social Campaign to Home Carousel delete and expire Campaign CONT-44787',
      {
        tag: [TestPriority.P1, TestGroupType.REGRESSION, '@CONT-44787', '@Social_Campaign_End_User_Restrictions'],
      },
      async ({ standardUserFixture, appManagerFixture }) => {
        tagTest(test.info(), {
          description:
            'In Zeus Verify End User should not be able to share Social Campaign to Home Carousel delete and expire Campaign',
          zephyrTestId: 'CONT-44787',
          storyId: 'CONT-44787',
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
        await endUserSocialCampaignPage.verifyCampaignLinkDisplayed(campaignData.linkText);
        await endUserSocialCampaignPage.verifyAddCampaignButtonIsNotVisible();
        await endUserSocialCampaignPage.verifyExpireTabNotVisible();
        await endUserSocialCampaignPage.clickCampaignOptions();
        await endUserSocialCampaignPage.verifyExpireCampaignButtonIsNotVisible();
        await endUserSocialCampaignPage.verifyDeleteCampaignButtonIsNotVisible();
      }
    );

    test(
      'ABAC - In Zeus Verify Standard User is not able see HOME FEED option on Social Campaign share modal(no acg) CONT-44786',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, TestGroupType.REGRESSION, '@CONT-44786'],
      },
      async ({ standardUserFixture, appManagerFixture }) => {
        tagTest(test.info(), {
          description:
            'ABAC - In Zeus Verify Standard User is not able see option Home Feed on Social Campaign share modal(no acg)',
          zephyrTestId: 'CONT-44786',
          storyId: 'CONT-44786',
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
        await socialCampaignPage.verifyCampaignLinkDisplayed(campaignOptions.linkText);

        await socialCampaignPage.clickCampaignOptions();
        await socialCampaignPage.clickShareToFeedButton();
        await socialCampaignPage.selectShareOptionNotVisible('followers');
        await socialCampaignPage.selectShareOptionVisible('site');
      }
    );

    test(
      'in Zeus Verify Standard User is able to Share a Social Campaign with a message to a Public Site using Post in SITE FEED option CONT-44785',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, TestGroupType.REGRESSION, '@CONT-44785'],
      },
      async ({ standardUserFixture, appManagerFixture }) => {
        tagTest(test.info(), {
          description:
            'In Zeus Verify Standard User is able to Share a Social Campaign with a message to a Public Site using Post in SITE FEED option',
          zephyrTestId: 'CONT-44785',
          storyId: 'CONT-44785',
        });

        socialCampaignPage = new SocialCampaignPage(standardUserFixture.page);

        const siteId =
          await appManagerFixture.abacSiteManagementHelper.searchSiteAndActivateIfNeeded(DEFAULT_PUBLIC_SITE_NAME);
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
        await socialCampaignPage.verifyCampaignLinkDisplayed(campaignOptions.linkText);

        const description = TestDataGenerator.generateRandomString();
        // Share campaign to site feed
        await socialCampaignPage.clickCampaignOptions();
        await socialCampaignPage.clickShareToFeedButton();
        await socialCampaignPage.enterShareDescription(description);
        await socialCampaignPage.selectShareOptionAsSiteFeed();
        await socialCampaignPage.enterSiteName(DEFAULT_PUBLIC_SITE_NAME);
        await socialCampaignPage.clickShareButton();
        await socialCampaignPage.verifyToastMessageIsVisibleWithText(
          SOCIAL_CAMPAIGN_TEST_DATA.TOAST_MESSAGES.SHARED_SUCCESSFULLY
        );

        const siteDashboardPage = new SiteDashboardPage(standardUserFixture.page, siteId);
        await siteDashboardPage.loadPage();
        await siteDashboardPage.clickOnFeedLink();
        await siteDashboardPage.verifyCampaignLinkDisplayed(campaignOptions.linkText, description);
      }
    );

    // TODO: Fix this test- Need to know how it works in ABAC

    test.fixme(
      'in Zeus Verify User is unable to view Shared SC Feed Post when SC is Deleted CONT-44784',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, TestGroupType.REGRESSION, '@CONT-44784'],
      },
      async ({ socialCampaignManagerFixture, appManagerFixture, standardUserFixture }) => {
        tagTest(test.info(), {
          description: 'In Zeus Verify User is unable to view Shared SC Feed Post when SC is Deleted',
          zephyrTestId: 'CONT-44784',
          storyId: 'CONT-44784',
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

        await Promise.all([appManagerFeedPage.verifyThePageIsLoaded()]);

        await Promise.all([
          appManagerFeedPage.clickOnShowOption('all'),
          socialCampaignManagerFeedPage.clickOnShowOption('all'),
          endUserFeedPage.clickOnShowOption('all'),
        ]);

        // Verify campaign is displayed in both feeds
        await Promise.all([
          appManagerFeedPage.feedList.verifyCampaignLinkDisplayed(campaignOptions.linkText, description),
          socialCampaignManagerFeedPage.feedList.verifyCampaignLinkDisplayed(campaignOptions.linkText, description),
          endUserFeedPage.feedList.verifyCampaignLinkDisplayed(campaignOptions.linkText, description),
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
          appManagerFeedPage.feedList.verifyCampaignLinkNotDisplayed(campaignOptions.linkText, description),
          socialCampaignManagerFeedPage.feedList.verifyCampaignLinkNotDisplayed(campaignOptions.linkText, description),
          endUserFeedPage.feedList.verifyCampaignLinkNotDisplayed(campaignOptions.linkText, description),
        ]);
      }
    );

    test(
      'in Zeus Verify User is able to view Shared Expired Social Campaign Feed Post CONT-44783',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, TestGroupType.REGRESSION, '@CONT-44783'],
      },
      async ({ socialCampaignManagerFixture, appManagerFixture, standardUserFixture }) => {
        tagTest(test.info(), {
          description: 'In Zeus Verify User is able to view Shared Expired Social Campaign Feed Post',
          zephyrTestId: 'CONT-44783',
          storyId: 'CONT-44783',
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
          appManagerFeedPage.clickOnShowOption('all'),
          socialCampaignManagerFeedPage.clickOnShowOption('all'),
          endUserFeedPage.clickOnShowOption('all'),
        ]);

        // Verify campaign is displayed in both feeds
        await Promise.all([
          appManagerFeedPage.feedList.verifyCampaignLinkDisplayed(campaignOptions.linkText, description),
          appManagerFeedPage.feedList.verifySocialCampaignShareButtonIsVisible(description),
          socialCampaignManagerFeedPage.feedList.verifyCampaignLinkDisplayed(campaignOptions.linkText, description),
          socialCampaignManagerFeedPage.feedList.verifySocialCampaignShareButtonIsVisible(description),
          endUserFeedPage.feedList.verifyCampaignLinkDisplayed(campaignOptions.linkText, description),
          endUserFeedPage.feedList.verifySocialCampaignShareButtonIsVisible(description),
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
          appManagerFeedPage.feedList.verifyCampaignLinkDisplayed(campaignOptions.linkText, description),
          appManagerFeedPage.feedList.verifySocialCampaignShareButtonIsNotVisible(description),
          socialCampaignManagerFeedPage.feedList.verifyCampaignLinkDisplayed(campaignOptions.linkText, description),
          socialCampaignManagerFeedPage.feedList.verifySocialCampaignShareButtonIsNotVisible(description),
          endUserFeedPage.feedList.verifyCampaignLinkDisplayed(campaignOptions.linkText, description),
          endUserFeedPage.feedList.verifySocialCampaignShareButtonIsNotVisible(description),
        ]);
      }
    );

    test(
      'in Zeus Verify App Manager able to add and remove Social Campaign to Site Carousel and remove when deleted CONT-44782',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, TestGroupType.REGRESSION, '@CONT-44782'],
      },
      async ({ appManagerFixture }) => {
        tagTest(test.info(), {
          description: 'In Zeus Verify App Manager able to share Social Campaign to Home Carousel',
          zephyrTestId: 'CONT-44782',
          storyId: 'CONT-44782',
          isKnownFailure: true,
          bugTicket: 'SEN-19493',
        });
        const siteId =
          await appManagerFixture.abacSiteManagementHelper.searchSiteAndActivateIfNeeded(DEFAULT_PUBLIC_SITE_NAME);
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
        await appManagerFixture.carouselHelper.getAndRemoveAllCarouselItems(siteId);

        const siteDashboardPage = new SiteDashboardPage(appManagerFixture.page, siteId);
        await siteDashboardPage.loadPage();
        await siteDashboardPage.clickOnEditDashboard();
        await siteDashboardPage.clickOnEditCarousel();
        await siteDashboardPage.enterSearchCarouselInput(campaignOptions.linkText);
        await siteDashboardPage.selectCarouselItem(campaignOptions.linkText);
        await siteDashboardPage.verifySocalCampaignInCarouselModal(campaignOptions.linkText);
        await siteDashboardPage.clickDoneButton();
        await siteDashboardPage.verifySocalCampaignInCarouselItem(campaignOptions.linkText);
        // Delete campaign
        await appManagerFixture.socialCampaignHelper.deleteCampaign(campaignId);
        await siteDashboardPage.loadPage();
        await siteDashboardPage.verifySocalCampaignIsNotInCarouselItem(campaignOptions.linkText);
      }
    );

    test(
      'in Zeus Verify App Manager able to share Social Campaign to Site Feed and unable to share to SN when expired CONT-44781',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, TestGroupType.REGRESSION, '@CONT-44781'],
      },
      async ({ appManagerFixture }) => {
        tagTest(test.info(), {
          description: 'In Zeus Verify App Manager able to share Social Campaign to Home Carousel',
          zephyrTestId: 'CONT-44781',
          storyId: 'CONT-44781',
        });

        const siteId =
          await appManagerFixture.abacSiteManagementHelper.searchSiteAndActivateIfNeeded(DEFAULT_PUBLIC_SITE_NAME);
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
        await siteDashboardPage.clickOnFeedLink();
        await siteDashboardPage.verifyCampaignLinkDisplayed(campaignOptions.linkText, description);

        // Expire campaign
        await appManagerFixture.socialCampaignHelper.expireCampaign(campaignId);
        await siteDashboardPage.loadPage();
        await siteDashboardPage.verifyCampaignLinkDisplayed(campaignOptions.linkText, description);
        await siteDashboardPage.listFeedComponent.verifySocialCampaignShareButtonIsNotVisible(description);
      }
    );

    test(
      'in Zeus Verify App Manager able to add and remove Social Campaign to Home Carousel and remove when expired CONT-44780',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, TestGroupType.REGRESSION, '@CONT-44780'],
      },
      async ({ appManagerFixture }) => {
        tagTest(test.info(), {
          description: 'In Zeus Verify App Manager able to share Social Campaign to Home Carousel',
          zephyrTestId: 'CONT-44780',
          storyId: 'CONT-44780',
          isKnownFailure: true,
          bugTicket: 'SEN-19493',
        });

        const siteId =
          await appManagerFixture.abacSiteManagementHelper.searchSiteAndActivateIfNeeded(DEFAULT_PUBLIC_SITE_NAME);
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
        await appManagerFixture.carouselHelper.getAndRemoveAllCarouselItems(siteId);

        const siteDashboardPage = new SiteDashboardPage(appManagerFixture.page, siteId);
        await siteDashboardPage.loadPage();
        await siteDashboardPage.clickOnEditDashboard();
        await siteDashboardPage.clickOnEditCarousel();
        await siteDashboardPage.enterSearchCarouselInput(campaignOptions.linkText);
        await siteDashboardPage.selectCarouselItem(campaignOptions.linkText);
        await siteDashboardPage.verifySocalCampaignInCarouselModal(campaignOptions.linkText);
        await siteDashboardPage.clickDoneButton();
        await siteDashboardPage.verifySocalCampaignInCarouselItem(campaignOptions.linkText);
        // expire campaign
        await appManagerFixture.socialCampaignHelper.expireCampaign(campaignId);
        await siteDashboardPage.loadPage();
        await siteDashboardPage.verifySocalCampaignIsNotInCarouselItem(campaignOptions.linkText);
      }
    );

    test(
      'in Zeus Verify App Manager able to create latest and popular Tile on Home Dashboard and SC removed from tile when it is deleted CONT-44775',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, TestGroupType.REGRESSION, '@CONT-44775'],
      },
      async ({ appManagerFixture }) => {
        tagTest(test.info(), {
          description:
            'In Zeus Verify App Manager able to create latest and popular Tile on Home Dashboard and SC removed from tile when it is deleted',
          zephyrTestId: 'CONT-44775',
          storyId: 'CONT-44775',
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
        await applicationManagerHomePage.clickOnManageDashboardCarousel();
        await applicationManagerHomePage.clickOnAddTile();
        await applicationManagerHomePage.clickOnSocialCampaignTile();
        await applicationManagerHomePage.enterTileTitle(tileTitle);
        tileId = await applicationManagerHomePage.clickAddToHomeButton();
        await applicationManagerHomePage.verifyTileIsDisplayed(tileTitle);
        await applicationManagerHomePage.verifySocialCampaignNameInTheDisplayed(campaignOptions.linkText);
        await appManagerFixture.socialCampaignHelper.deleteCampaign(campaignId);
        await applicationManagerHomePage.loadPage();
        await applicationManagerHomePage.verifySocialCampaignNameNotDisplayed(campaignOptions.linkText);
      }
    );

    test(
      'in Zeus Verify custom user able to create Custom SC Tile on Home Dashboard and SC removed from tile when it is deleted CONT-44779',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, TestGroupType.REGRESSION, '@CONT-44779'],
      },
      async ({ socialCampaignManagerFixture }) => {
        tagTest(test.info(), {
          description:
            'In Zeus Verify custom user able to create Custom SC Tile on Home Dashboard and SC removed from tile when it is deleted',
          zephyrTestId: 'CONT-44779',
          storyId: 'CONT-44779',
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
        await applicationManagerHomePage.clickOnManageDashboardCarousel();
        await applicationManagerHomePage.clickOnAddTile();
        await applicationManagerHomePage.clickOnSocialCampaignTile();
        await applicationManagerHomePage.clickOnCustomSCTile();
        await applicationManagerHomePage.enterTileTitle(tileTitle);
        await applicationManagerHomePage.setCustomSCTitle(campaignOptions.linkText);
        tileId = await applicationManagerHomePage.clickAddToHomeButton();
        await applicationManagerHomePage.verifyTileIsDisplayed(tileTitle);
        await applicationManagerHomePage.verifySocialCampaignNameInTheDisplayed(campaignOptions.linkText);
        await socialCampaignManagerFixture.socialCampaignHelper.deleteCampaign(campaignId);
        await applicationManagerHomePage.loadPage();
        await applicationManagerHomePage.verifySocialCampaignNameNotDisplayed(campaignOptions.linkText);
      }
    );

    test(
      'in Zeus Verify custom user able to create latest and popular Tile on Home Dashboard and SC removed from tile when it is deleted CONT-40602',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, TestGroupType.REGRESSION, '@CONT-44778'],
      },
      async ({ socialCampaignManagerFixture }) => {
        tagTest(test.info(), {
          description:
            'In Zeus Verify custom user able to create latest and popular Tile on Home Dashboard and SC removed from tile when it is deleted',
          zephyrTestId: 'CONT-44778',
          storyId: 'CONT-44778',
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
        await applicationManagerHomePage.clickOnManageDashboardCarousel();
        await applicationManagerHomePage.clickOnAddTile();
        await applicationManagerHomePage.clickOnSocialCampaignTile();
        await applicationManagerHomePage.enterTileTitle(tileTitle);
        tileId = await applicationManagerHomePage.clickAddToHomeButton();
        await applicationManagerHomePage.verifyTileIsDisplayed(tileTitle);
        await applicationManagerHomePage.verifySocialCampaignNameInTheDisplayed(campaignOptions.linkText);
        await socialCampaignManagerFixture.socialCampaignHelper.deleteCampaign(campaignId);
        await applicationManagerHomePage.loadPage();
        await applicationManagerHomePage.verifySocialCampaignNameNotDisplayed(campaignOptions.linkText);
      }
    );

    test(
      'in Zeus Verify application manager able to create Custom SC Tile on Home Dashboard and SC removed from tile when it is deleted CONT-44777',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, TestGroupType.REGRESSION, '@CONT-44777'],
      },
      async ({ appManagerFixture }) => {
        tagTest(test.info(), {
          description:
            'In Zeus Verify application manager able to create Custom SC Tile on Home Dashboard and SC removed from tile when it is deleted',
          zephyrTestId: 'CONT-44777',
          storyId: 'CONT-44777',
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
        await applicationManagerHomePage.clickOnManageDashboardCarousel();
        await applicationManagerHomePage.clickOnAddTile();
        await applicationManagerHomePage.clickOnSocialCampaignTile();
        await applicationManagerHomePage.clickOnCustomSCTile();
        await applicationManagerHomePage.enterTileTitle(tileTitle);
        await applicationManagerHomePage.setCustomSCTitle(campaignOptions.linkText);
        tileId = await applicationManagerHomePage.clickAddToHomeButton();
        await applicationManagerHomePage.verifyTileIsDisplayed(tileTitle);
        await applicationManagerHomePage.verifySocialCampaignNameInTheDisplayed(campaignOptions.linkText);
        await appManagerFixture.socialCampaignHelper.deleteCampaign(campaignId);
        await applicationManagerHomePage.loadPage();
        await applicationManagerHomePage.verifySocialCampaignNameNotDisplayed(campaignOptions.linkText);
      }
    );

    test(
      'in Zeus Verify App Manager able to create Custom SC Tile on Site Dashboard and SC removed from tile when it is expired CONT-44776',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, TestGroupType.REGRESSION, '@CONT-44776'],
      },
      async ({ appManagerFixture }) => {
        tagTest(test.info(), {
          description:
            'In Zeus Verify App Manager able to create Custom SC Tile on Site Dashboard and SC removed from tile when it is expired',
          zephyrTestId: 'CONT-44776',
          storyId: 'CONT-44776',
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
        const siteId =
          await appManagerFixture.abacSiteManagementHelper.searchSiteAndActivateIfNeeded(DEFAULT_PUBLIC_SITE_NAME);
        const tileTitle = TestDataGenerator.generateRandomString();
        const siteDashboardPage = new SiteDashboardPage(appManagerFixture.page, siteId);
        await siteDashboardPage.loadPage();
        await siteDashboardPage.clickOnEditDashboard();
        await siteDashboardPage.clickOnAddTile();
        await siteDashboardPage.clickOnSocialCampaignTile();
        await siteDashboardPage.clickOnCustomSCTile();
        await siteDashboardPage.enterTileTitle(tileTitle);
        await siteDashboardPage.setCustomSCTitle(campaignOptions.linkText);
        tileId = await siteDashboardPage.clickAddToSiteButton(siteId);
        await siteDashboardPage.verifyTileIsDisplayed(tileTitle);
        await siteDashboardPage.verifySocialCampaignNameInTheDisplayed(campaignOptions.linkText);
        await appManagerFixture.socialCampaignHelper.expireCampaign(campaignId);
        await siteDashboardPage.loadPage();
        await siteDashboardPage.verifySocialCampaignNameNotDisplayed(campaignOptions.linkText);
      }
    );

    test(
      'in Zeus Verify App Manager able to create latest and popular Tile on Site Dashboard and SC removed from tile when it is expired CONT-44779',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, TestGroupType.REGRESSION, '@CONT-44779'],
      },
      async ({ appManagerFixture }) => {
        tagTest(test.info(), {
          description:
            'In Zeus Verify App Manager able to create latest and popular Tile on Site Dashboard and SC removed from tile when it is expired',
          zephyrTestId: 'CONT-44779',
          storyId: 'CONT-44779',
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

        const siteId =
          await appManagerFixture.abacSiteManagementHelper.searchSiteAndActivateIfNeeded(DEFAULT_PUBLIC_SITE_NAME);
        const tileTitle = TestDataGenerator.generateRandomString();
        const siteDashboardPage = new SiteDashboardPage(appManagerFixture.page, siteId);
        await siteDashboardPage.loadPage();
        await siteDashboardPage.clickOnEditDashboard();
        await siteDashboardPage.clickOnAddTile();
        await siteDashboardPage.clickOnSocialCampaignTile();
        await siteDashboardPage.enterTileTitle(tileTitle);
        tileId = await siteDashboardPage.clickAddToSiteButton(siteId);
        await siteDashboardPage.verifySocialCampaignNameInTheDisplayed(campaignOptions.linkText);
        await appManagerFixture.socialCampaignHelper.expireCampaign(campaignId);
        await siteDashboardPage.loadPage();
        await siteDashboardPage.verifySocialCampaignNameNotDisplayed(campaignOptions.linkText);
      }
    );

    test(
      'zeus | Social Campaign | Verify App Manager able to create and delete Social Campaign for Everyone CONT-44774',
      {
        tag: [TestPriority.P1, TestGroupType.REGRESSION, '@CONT-44774', '@Social_Campaign_Add_Delete'],
      },
      async ({ appManagerFixture }) => {
        socialCampaignPage = new SocialCampaignPage(appManagerFixture.page);
        tagTest(test.info(), {
          description:
            'Zeus | Social Campaign | Verify App Manager able to create and delete Social Campaign for Everyone',
          zephyrTestId: 'CONT-44774',
          storyId: 'CONT-44774',
        });

        await appManagerFixture.navigationHelper.clickOnSocialCampaigns();
        await socialCampaignPage.clickAddCampaignButton();

        // Create and post social campaign using wrapper function
        const campaignOptions = {
          message: SOCIAL_CAMPAIGN_TEST_DATA.MESSAGES.YOUTUBE,
          url: SOCIAL_CAMPAIGN_TEST_DATA.URLS.YOUTUBE,
          linkText: SOCIAL_CAMPAIGN_TEST_DATA.LINK_TEXT.YOUTUBE,
          recipient: SocialCampaignRecipient.EVERYONE,
        };

        addCampaignPage = new AddCampaignPage(appManagerFixture.page);
        // When Add Campaign and Create
        campaignId = await addCampaignPage.AddCampaignAndCreate(campaignOptions);
        await socialCampaignPage.verifyToastMessageIsVisibleWithText(
          SOCIAL_CAMPAIGN_TEST_DATA.TOAST_MESSAGES.CREATED_SUCCESSFULLY
        );
        await socialCampaignPage.verifyCampaignLinkDisplayed(campaignOptions.linkText);
        await socialCampaignPage.clickPopularLink();
        await socialCampaignPage.verifyCampaignLinkDisplayed(campaignOptions.linkText);

        manualCleanupNeeded = true;
      }
    );

    test(
      'verify Updates to Audiences Reflect in Social Campaigns CONT-44773',
      {
        tag: [TestPriority.P1, TestGroupType.REGRESSION, '@CONT-44773', '@Social_Campaign_Audience'],
      },
      async ({ appManagerFixture }) => {
        tagTest(test.info(), {
          description: 'Verify Updates to Audiences Reflect in Social Campaigns',
          zephyrTestId: 'CONT-44773',
          storyId: 'CONT-44773',
        });

        addCampaignPage = new AddCampaignPage(appManagerFixture.page);
        await addCampaignPage.loadPage();

        const audienceDetails = await appManagerFixture.audienceManagementHelper.getRandomAudienceId();
        await addCampaignPage.selectMemberAsAudience();
        await addCampaignPage.enterAudienceName(audienceDetails.name);
        await addCampaignPage.verifyAudienceNameAndCount(audienceDetails.count, audienceDetails.name);
        //update the audience name
        const updatedAudienceName = TestDataGenerator.generateRandomString();
        await appManagerFixture.audienceManagementHelper.updateAudience(audienceDetails.audienceId, {
          name: updatedAudienceName,
          description: audienceDetails.description,
          type: audienceDetails.type,
          audienceRule: audienceDetails.audienceRule,
        });

        await addCampaignPage.loadPage();
        await addCampaignPage.selectMemberAsAudience();
        await addCampaignPage.enterAudienceName(audienceDetails.name);
        await addCampaignPage.verifyAudienceNameAndCountNotVisible(audienceDetails.count, audienceDetails.name);
        await addCampaignPage.loadPage();
        await addCampaignPage.selectMemberAsAudience();
        await addCampaignPage.enterAudienceName(updatedAudienceName);
        await addCampaignPage.verifyAudienceNameAndCount(audienceDetails.count, updatedAudienceName);
      }
    );

    test(
      'ABAC Verify Social Campaign navigation when redirected via Manage feature CONT-44772',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, '@CONT-44772', '@Social_Campaign_Navigation'],
      },
      async ({ appManagerFixture }) => {
        tagTest(test.info(), {
          description: 'Verify Social Campaign navigation via side nav redirects to /campaigns/latest',
          zephyrTestId: 'CONT-44772',
          storyId: 'CONT-44772',
        });
        await appManagerFixture.navigationHelper.openManageFeatureSectionInSideBar();
        await appManagerFixture.navigationHelper.clickOnSocialCampaignsUnderManageFeature();

        const manageFeaturesPage = new ManageFeaturesPage(appManagerFixture.page);
        await manageFeaturesPage.verifyUrlContains('campaigns/latest');

        await appManagerFixture.navigationHelper.openManageFeatureSectionInSideBar();
        await manageFeaturesPage.clickOnSocialCampaignCard();
        await manageFeaturesPage.verifyUrlContains('campaigns/latest');
      }
    );

    test(
      'ABAC Verify user can connect LinkedIn account and share social campaign CONT-44585',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, '@CONT-44585', '@Social_Campaign_LinkedIn'],
      },
      async ({ appManagerFixture }) => {
        tagTest(test.info(), {
          description: 'ABAC: Verify user can connect LinkedIn account and share social campaign',
          zephyrTestId: 'CONT-44585',
          storyId: 'CONT-44585',
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
          networks: [SocialCampaignNetwork.LINKEDIN],
        });
        campaignId = createdCampaign.campaignId;

        // Get LinkedIn credentials from config
        const config = getContentTenantConfigFromCache();
        const linkedInEmail = config.linkedInEmail;
        const linkedInPassword = config.linkedInPassword;

        // Step 1: Navigate to Social campaigns page
        await appManagerFixture.navigationHelper.clickOnSocialCampaigns();
        socialCampaignPage = new SocialCampaignPage(appManagerFixture.page);
        await socialCampaignPage.verifyThePageIsLoaded();

        // Step 2: Click the first Share button
        await socialCampaignPage.clickFirstShareButton();

        // Step 3: Click Connect LinkedIn button and complete LinkedIn login
        await socialCampaignPage.connectLinkedIn(linkedInEmail, linkedInPassword);

        // Step 4: Verify LinkedIn connection success message
        await socialCampaignPage.verifyLinkedInConnectionSuccess();
      }
    );
  }
);
