import { ContentTestSuite } from '@content/constants/testSuite';
import { contentTestFixture as test, users } from '@content/fixtures/contentFixture';
import { SOCIAL_CAMPAIGN_TEST_DATA } from '@content/test-data/social-campaign.test-data';
import { FeedPage } from '@content/ui/pages/feedPage';
import { SocialCampaignPage } from '@content/ui/pages/socialCampaignPage';
import { TestPriority } from '@core/constants/testPriority';
import { TestGroupType } from '@core/constants/testType';
import { SocialCampaignFilter, SocialCampaignRecipient } from '@core/types/social-campaign.types';
import { TestDataGenerator } from '@core/utils/testDataGenerator';
import { tagTest } from '@core/utils/testDecorator';

import { FEED_ACG_CONFIGS } from '@/src/modules/platforms/apis/helpers/identityManagementHelper';

// Feature code for API-based Feature Owner operations
const ADD_HOME_FEED_FEATURE_CODE = FEED_ACG_CONFIGS[0].featureCode!; // 'ADD_HOME_FEED'

test.describe(
  `Social Campaign Sharing - ABAC Tests`,
  {
    tag: [ContentTestSuite.SOCIAL_CAMPAIGN, '@social-campaign-share'],
  },
  () => {
    let socialCampaignPage: SocialCampaignPage;
    let feedPage: FeedPage;
    let manualCleanupNeeded: boolean = false;
    let campaignId: string;
    let standardUserUserId: string;
    let socialCampaignManagerUserId: string;

    test.beforeEach(async ({ appManagerFixture, appManagerApiFixture }) => {
      // Reset cleanup flag for each test
      await appManagerFixture.socialCampaignHelper.deleteAllCampaigns(SocialCampaignFilter.LATEST);
      manualCleanupNeeded = false;

      // Get Standard User info
      const suInfo = await appManagerApiFixture.identityManagementHelper.getUserInfoByEmail(users.endUser.email);
      standardUserUserId = suInfo.userId;

      // Get Social Campaign Manager info
      const scmInfo = await appManagerApiFixture.identityManagementHelper.getUserInfoByEmail(
        users.socialCampaignManager.email
      );
      socialCampaignManagerUserId = scmInfo.userId;

      // Clean up: Remove both users from all ACG roles (Manager, Admin, FO) in parallel
      await Promise.all([
        appManagerApiFixture.identityManagementHelper.cleanupUserFromAllACGRoles(standardUserUserId),
        appManagerApiFixture.identityManagementHelper.cleanupUserFromAllACGRoles(socialCampaignManagerUserId),
      ]);
    });

    test.afterEach(async ({ appManagerFixture }) => {
      if (manualCleanupNeeded && campaignId) {
        await appManagerFixture.socialCampaignHelper.deleteCampaign(campaignId);
      }
    });

    test(
      'verify FO can share Social Campaign to Home Feed with No Restrictions (Limit Visibility OFF) - Multi-User Validation',
      {
        tag: [
          TestPriority.P0,
          TestGroupType.SMOKE,
          '@CONT-42249',
          '@FO-social-campaign',
          '@social-campaign-share-restriction',
        ],
      },
      async ({ appManagerFixture, standardUserFixture }) => {
        tagTest(test.info(), {
          description:
            'ABAC: Verify FO can share a Social Campaign to Home Feed without restrictions (Limit Visibility OFF). The shared campaign should be visible to ALL users on Home Feed, including Standard User.',
          zephyrTestId: 'CONT-42249',
          storyId: 'CONT-42249',
        });

        socialCampaignPage = new SocialCampaignPage(appManagerFixture.page);

        // Create campaign with recipient: EVERYONE (available to all users)
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

        // ==================== FO navigates to Social Campaign page ====================
        await test.step('FO navigates to Social Campaign page and verifies campaign is displayed', async () => {
          await socialCampaignPage.loadPage();
          await socialCampaignPage.verifyCampaignLinkDisplayed(campaignOptions.linkText);
        });

        // ==================== FO shares Social Campaign to Home Feed WITHOUT restrictions ====================
        const shareDescription = TestDataGenerator.generateRandomString();
        await test.step('FO shares Social Campaign to Home Feed WITHOUT Restricted Viewers (Limit Visibility OFF)', async () => {
          await socialCampaignPage.clickCampaignOptions();
          await socialCampaignPage.clickShareToFeedButton();
          await socialCampaignPage.enterShareDescription(shareDescription);

          // Share to Home Feed (default option) - NO limit visibility toggle
          await socialCampaignPage.clickShareButton();

          await socialCampaignPage.verifyToastMessageIsVisibleWithText(
            SOCIAL_CAMPAIGN_TEST_DATA.TOAST_MESSAGES.SHARED_SUCCESSFULLY
          );
        });

        // ==================== FO navigates to Home Feed and verifies shared campaign IS visible ====================
        await test.step('FO navigates to Home Feed and verifies shared campaign IS visible', async () => {
          await appManagerFixture.navigationHelper.clickOnGlobalFeed();
          feedPage = new FeedPage(appManagerFixture.page);
          await feedPage.verifyThePageIsLoaded();

          // Verify FO can see the shared campaign
          await feedPage.feedList.verifyCampaignLinkDisplayed(campaignOptions.linkText, shareDescription);
        });

        // ==================== Standard User navigates to Home Feed and verifies shared campaign IS visible ====================
        await test.step('Standard User navigates to Home Feed and verifies shared campaign IS visible', async () => {
          await standardUserFixture.navigationHelper.clickOnGlobalFeed();
          const standardUserFeedPage = new FeedPage(standardUserFixture.page);
          await standardUserFeedPage.reloadPageWithTimelineMode();
          await standardUserFeedPage.feedList.verifyThePageIsLoadedWithTimelineMode();

          // Verify Standard User can see the shared campaign (unrestricted - visible to all)
          await standardUserFeedPage.feedList.verifyCampaignLinkDisplayed(campaignOptions.linkText, shareDescription);
        });

        manualCleanupNeeded = true;
      }
    );

    test(
      'verify FO can share Social Campaign to Home Feed with Restricted Viewers (Limit Visibility ON + Engineering)',
      {
        tag: [
          TestPriority.P0,
          TestGroupType.SMOKE,
          '@CONT-42250',
          '@FO-social-campaign',
          '@social-campaign-share-restriction',
        ],
      },
      async ({ appManagerFixture, standardUserFixture, socialCampaignManagerFixture }) => {
        tagTest(test.info(), {
          description:
            'ABAC: Verify FO can share a Social Campaign to Home Feed with Restricted Viewers (Limit Visibility ON + Engineering audience). Engineering users CAN see the shared campaign, Non-Engineering users CANNOT see it.',
          zephyrTestId: 'CONT-42250',
          storyId: 'CONT-42250',
          isKnownFailure: true,
          bugTicket: 'CONT-44631',
        });

        socialCampaignPage = new SocialCampaignPage(appManagerFixture.page);

        // Create campaign with recipient: EVERYONE (available to all users)
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

        // ==================== FO navigates to Social Campaign page ====================
        await test.step('FO navigates to Social Campaign page and verifies campaign is displayed', async () => {
          await socialCampaignPage.loadPage();
          await socialCampaignPage.verifyCampaignLinkDisplayed(campaignOptions.linkText);
        });

        // ==================== FO shares Social Campaign to Home Feed WITH restrictions (Engineering) ====================
        const shareDescription = TestDataGenerator.generateRandomString();
        await test.step('FO shares Social Campaign to Home Feed WITH Restricted Viewers (Limit Visibility ON + Engineering)', async () => {
          await socialCampaignPage.clickCampaignOptions();
          await socialCampaignPage.clickShareToFeedButton();
          await socialCampaignPage.enterShareDescription(shareDescription);

          // Enable Limit Visibility and select Engineering audience
          await socialCampaignPage.toggleLimitVisibility();
          await socialCampaignPage.selectAudience('Engineering');

          // Share to Home Feed (default option)
          await socialCampaignPage.clickShareButton();

          await socialCampaignPage.verifyToastMessageIsVisibleWithText(
            SOCIAL_CAMPAIGN_TEST_DATA.TOAST_MESSAGES.SHARED_SUCCESSFULLY
          );
        });

        // ==================== FO navigates to Home Feed and verifies shared campaign IS visible ====================
        await test.step('FO navigates to Home Feed and verifies shared campaign IS visible', async () => {
          await appManagerFixture.navigationHelper.clickOnGlobalFeed();
          feedPage = new FeedPage(appManagerFixture.page);
          await feedPage.verifyThePageIsLoaded();

          // Verify FO (creator) can see the shared campaign
          await feedPage.feedList.verifyCampaignLinkDisplayed(campaignOptions.linkText, shareDescription);
        });

        // ==================== Standard User (Engineering) navigates to Home Feed and verifies shared campaign IS visible ====================
        await test.step('Standard User (Engineering audience) navigates to Home Feed and verifies shared campaign IS visible', async () => {
          await standardUserFixture.navigationHelper.clickOnGlobalFeed();
          const standardUserFeedPage = new FeedPage(standardUserFixture.page);
          await standardUserFeedPage.reloadPageWithTimelineMode();
          await standardUserFeedPage.feedList.verifyThePageIsLoadedWithTimelineMode();

          // Verify Standard User (in Engineering audience) can see the shared campaign
          await standardUserFeedPage.feedList.verifyCampaignLinkDisplayed(campaignOptions.linkText, shareDescription);
        });

        // ==================== Social Campaign Manager (Non-Engineering) navigates to Home Feed and verifies shared campaign is NOT visible ====================
        await test.step('Social Campaign Manager (NOT in Engineering audience) navigates to Home Feed and verifies shared campaign is NOT visible', async () => {
          await socialCampaignManagerFixture.navigationHelper.clickOnGlobalFeed();
          const socialCampaignManagerFeedPage = new FeedPage(socialCampaignManagerFixture.page);
          await socialCampaignManagerFeedPage.reloadPageWithTimelineMode();
          await socialCampaignManagerFeedPage.feedList.verifyThePageIsLoadedWithTimelineMode();

          // Verify Social Campaign Manager (NOT in Engineering audience) CANNOT see the shared campaign
          await socialCampaignManagerFeedPage.feedList.verifyPostIsNotVisible(shareDescription);
        });

        manualCleanupNeeded = true;
      }
    );

    test(
      'verify FO can mention valid UX Designs user while sharing Social Campaign to Home Feed with Restricted Viewers',
      {
        tag: [
          TestPriority.P0,
          TestGroupType.SMOKE,
          '@CONT-42253',
          '@FO-social-campaign',
          '@social-campaign-share-restriction',
        ],
      },
      async ({ appManagerFixture, appManagerApiFixture, socialCampaignManagerFixture }) => {
        tagTest(test.info(), {
          description:
            'ABAC: Verify FO can mention a valid user (in UX Designs audience) while sharing a Social Campaign to Home Feed with Restricted Viewers. The mention should resolve correctly and be visible to the mentioned user.',
          zephyrTestId: 'CONT-42253',
          storyId: 'CONT-42253',
        });

        socialCampaignPage = new SocialCampaignPage(appManagerFixture.page);

        // Get UX Designs user (socialCampaignManager) full name for mention
        let uxUserFullName: string;
        await test.step('Get UX Designs user full name for mention', async () => {
          const uxUserInfo = await appManagerApiFixture.identityManagementHelper.getUserInfoByEmail(
            users.socialCampaignManager.email
          );
          uxUserFullName = uxUserInfo.fullName;
        });

        // Create campaign with recipient: EVERYONE (available to all users)
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

        // ==================== FO navigates to Social Campaign page ====================
        await test.step('FO navigates to Social Campaign page and verifies campaign is displayed', async () => {
          await socialCampaignPage.loadPage();
          await socialCampaignPage.verifyCampaignLinkDisplayed(campaignOptions.linkText);
        });

        // ==================== FO shares Social Campaign to Home Feed WITH restrictions (UX Designs) and mentions UX user ====================
        const shareDescription = TestDataGenerator.generateRandomString();
        await test.step('FO shares Social Campaign to Home Feed WITH Restricted Viewers (UX Designs) and mentions UX user', async () => {
          await socialCampaignPage.clickCampaignOptions();
          await socialCampaignPage.clickShareToFeedButton();
          await socialCampaignPage.enterShareDescription(shareDescription);

          // Add mention of UX Designs user
          await socialCampaignPage.addUserNameMentionInShareDialog(uxUserFullName!);

          // Enable Limit Visibility and select UX Designs audience
          await socialCampaignPage.toggleLimitVisibility();
          await socialCampaignPage.selectAudience('UX');

          // Share to Home Feed (default option)
          await socialCampaignPage.clickShareButton();

          await socialCampaignPage.verifyToastMessageIsVisibleWithText(
            SOCIAL_CAMPAIGN_TEST_DATA.TOAST_MESSAGES.SHARED_SUCCESSFULLY
          );
        });

        // ==================== FO navigates to Home Feed and verifies shared campaign IS visible with mention ====================
        await test.step('FO navigates to Home Feed and verifies shared campaign IS visible with mention rendered correctly', async () => {
          await appManagerFixture.navigationHelper.clickOnGlobalFeed();
          feedPage = new FeedPage(appManagerFixture.page);
          await feedPage.verifyThePageIsLoaded();

          // Verify FO (creator) can see the shared campaign
          await feedPage.feedList.verifyCampaignLinkDisplayed(campaignOptions.linkText, shareDescription);

          // Verify mention is rendered correctly (as clickable link)
          await feedPage.feedList.verifyUserNameMentionIsVisible(shareDescription, uxUserFullName!);
        });

        // ==================== Mentioned User (Social Campaign Manager in UX Designs) navigates to Home Feed and verifies shared campaign with their mention IS visible ====================
        await test.step('Mentioned User (UX Designs) navigates to Home Feed and verifies shared campaign with their mention IS visible', async () => {
          await socialCampaignManagerFixture.navigationHelper.clickOnGlobalFeed();
          const uxUserFeedPage = new FeedPage(socialCampaignManagerFixture.page);
          await uxUserFeedPage.reloadPageWithTimelineMode();
          await uxUserFeedPage.feedList.verifyThePageIsLoadedWithTimelineMode();

          // Verify Mentioned User (in UX Designs audience) CAN see the shared campaign
          await uxUserFeedPage.feedList.verifyCampaignLinkDisplayed(campaignOptions.linkText, shareDescription);

          // Verify their mention is visible on the shared post
          await uxUserFeedPage.feedList.verifyUserNameMentionIsVisible(shareDescription, uxUserFullName!);
        });

        manualCleanupNeeded = true;
      }
    );

    test(
      'verify FO can share Social Campaign to Home Feed with Limit Visibility ON and Share button not visible after expiration',
      {
        tag: [
          TestPriority.P0,
          TestGroupType.SMOKE,
          '@CONT-42254',
          '@FO-social-campaign',
          '@social-campaign-share-restriction',
          '@social-campaign-expiration',
        ],
      },
      async ({ appManagerFixture, socialCampaignManagerFixture }) => {
        tagTest(test.info(), {
          description:
            'ABAC: Verify FO can share a Social Campaign to Home Feed with Limit Visibility ON (UX Designs audience). After expiration, the shared campaign should still be visible in Home Feed for the target audience, but the Share button should NOT be visible.',
          zephyrTestId: 'CONT-42254',
          storyId: 'CONT-42254',
        });

        socialCampaignPage = new SocialCampaignPage(appManagerFixture.page);

        // Create campaign with recipient: EVERYONE (available to all users)
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

        // ==================== FO navigates to Social Campaign page ====================
        await test.step('FO navigates to Social Campaign page and verifies campaign is displayed', async () => {
          await socialCampaignPage.loadPage();
          await socialCampaignPage.verifyCampaignLinkDisplayed(campaignOptions.linkText);
        });

        // ==================== FO shares Social Campaign to Home Feed WITH Limit Visibility (UX Designs) ====================
        const shareDescription = TestDataGenerator.generateRandomString();
        await test.step('FO shares Social Campaign to Home Feed WITH Limit Visibility (UX Designs audience)', async () => {
          await socialCampaignPage.clickCampaignOptions();
          await socialCampaignPage.clickShareToFeedButton();
          await socialCampaignPage.enterShareDescription(shareDescription);

          // Enable Limit Visibility and select UX Designs audience
          await socialCampaignPage.toggleLimitVisibility();
          await socialCampaignPage.selectAudience('UX');

          // Share to Home Feed (default option)
          await socialCampaignPage.clickShareButton();

          await socialCampaignPage.verifyToastMessageIsVisibleWithText(
            SOCIAL_CAMPAIGN_TEST_DATA.TOAST_MESSAGES.SHARED_SUCCESSFULLY
          );
        });

        // ==================== User B (UX Designs) verifies shared campaign IS visible in Home Feed ====================
        await test.step('User B (UX Designs) navigates to Home Feed and verifies shared campaign IS visible', async () => {
          await socialCampaignManagerFixture.navigationHelper.clickOnGlobalFeed();
          const userBFeedPage = new FeedPage(socialCampaignManagerFixture.page);
          await userBFeedPage.reloadPageWithTimelineMode();
          await userBFeedPage.feedList.verifyThePageIsLoadedWithTimelineMode();

          // Verify User B (in UX Designs audience) CAN see the shared campaign
          await userBFeedPage.feedList.verifyCampaignLinkDisplayed(campaignOptions.linkText, shareDescription);

          // Verify Share button IS visible before expiration
          await userBFeedPage.feedList.verifySocialCampaignShareButtonIsVisible(shareDescription);
        });

        // ==================== FO expires the Social Campaign ====================
        await test.step('FO expires the Social Campaign', async () => {
          await appManagerFixture.socialCampaignHelper.expireCampaign(campaignId);
        });

        // ==================== User B verifies campaign still visible but Share button NOT visible after expiration ====================
        await test.step('User B verifies campaign is still visible in Home Feed but Share button is NOT visible after expiration', async () => {
          await socialCampaignManagerFixture.navigationHelper.clickOnGlobalFeed();
          const userBFeedPage = new FeedPage(socialCampaignManagerFixture.page);
          await userBFeedPage.reloadPageWithTimelineMode();
          await userBFeedPage.feedList.verifyThePageIsLoadedWithTimelineMode();

          // Verify campaign is STILL visible in Home Feed after expiration
          await userBFeedPage.feedList.verifyCampaignLinkDisplayed(campaignOptions.linkText, shareDescription);

          // Verify Share button is NOT visible after expiration
          await userBFeedPage.feedList.verifySocialCampaignShareButtonIsNotVisible(shareDescription);
        });

        manualCleanupNeeded = true;
      }
    );

    test(
      'verify SU with Feature Owner permission can share Social Campaign to Home Feed with No Restrictions',
      {
        tag: [
          TestPriority.P0,
          TestGroupType.SMOKE,
          '@CONT-42255',
          '@SU-social-campaign',
          '@social-campaign-share-restriction',
        ],
      },
      async ({ appManagerFixture, appManagerApiFixture, standardUserFixture }) => {
        tagTest(test.info(), {
          description:
            'ABAC: Verify Standard User who is granted Feature Owner permission for "Post in Home Feed" can share a Social Campaign to Home Feed without restrictions (Limit Visibility OFF). The shared campaign should be visible on Home Feed.',
          zephyrTestId: 'CONT-42255',
          storyId: 'CONT-42255',
        });

        // ==================== App Manager creates Social Campaign via API ====================
        const campaignOptions = {
          message: SOCIAL_CAMPAIGN_TEST_DATA.MESSAGES.BLOG,
          url: SOCIAL_CAMPAIGN_TEST_DATA.URLS.SIMPPLR_ALL_EMPLOYEES,
          linkText: SOCIAL_CAMPAIGN_TEST_DATA.LINK_TEXT.SIMPPLR_ALL_EMPLOYEES,
          recipient: SocialCampaignRecipient.EVERYONE,
        };

        const createdCampaign = await appManagerFixture.socialCampaignHelper.createCampaign({
          message: campaignOptions.message,
          url: campaignOptions.url,
          recipient: campaignOptions.recipient,
        });
        campaignId = createdCampaign.campaignId;

        // ==================== App Manager adds SU as Feature Owner of "Post in Home Feed" via API ====================
        await test.step('App Manager adds SU as Feature Owner of "Post in Home Feed" via API', async () => {
          await appManagerApiFixture.identityManagementHelper.addUserAsFeatureOwner(
            ADD_HOME_FEED_FEATURE_CODE,
            standardUserUserId
          );
        });

        // ==================== SU navigates to Social Campaign and shares to Home Feed ====================
        const shareDescription = TestDataGenerator.generateRandomString();
        await test.step('SU navigates to Social Campaign page and shares to Home Feed WITHOUT restrictions', async () => {
          socialCampaignPage = new SocialCampaignPage(standardUserFixture.page);
          await socialCampaignPage.loadPage();
          await socialCampaignPage.verifyCampaignLinkDisplayed(campaignOptions.linkText);

          await socialCampaignPage.clickCampaignOptions();
          await socialCampaignPage.clickShareToFeedButton();
          await socialCampaignPage.enterShareDescription(shareDescription);

          // Share to Home Feed (default option) - NO limit visibility toggle
          await socialCampaignPage.clickShareButton();

          await socialCampaignPage.verifyToastMessageIsVisibleWithText(
            SOCIAL_CAMPAIGN_TEST_DATA.TOAST_MESSAGES.SHARED_SUCCESSFULLY
          );
        });

        // ==================== SU navigates to Home Feed and verifies shared campaign IS visible ====================
        await test.step('SU navigates to Home Feed and verifies shared campaign IS visible', async () => {
          await standardUserFixture.navigationHelper.clickOnGlobalFeed();
          feedPage = new FeedPage(standardUserFixture.page);
          await feedPage.verifyThePageIsLoaded();

          // Verify SU can see the shared campaign
          await feedPage.feedList.verifyCampaignLinkDisplayed(campaignOptions.linkText, shareDescription);
        });

        // ==================== App Manager navigates to Home Feed and verifies shared campaign IS visible ====================
        await test.step('App Manager navigates to Home Feed and verifies shared campaign IS visible', async () => {
          await appManagerFixture.navigationHelper.clickOnHomeIconButton();
          await appManagerFixture.navigationHelper.clickOnGlobalFeed();
          const appManagerHomeFeedPage = new FeedPage(appManagerFixture.page);
          await appManagerHomeFeedPage.reloadPage();
          await appManagerHomeFeedPage.feedList.verifyThePageIsLoaded();
          await feedPage.verifyThePageIsLoaded();

          // Verify SU can see the shared campaign
          await feedPage.feedList.verifyCampaignLinkDisplayed(campaignOptions.linkText, shareDescription);
        });

        manualCleanupNeeded = true;
      }
    );

    test(
      'verify SU with Feature Owner permission can share Social Campaign to Home Feed with Restricted Viewers (Limit Visibility ON)',
      {
        tag: [
          TestPriority.P0,
          TestGroupType.SMOKE,
          '@CONT-42256',
          '@SU-social-campaign',
          '@social-campaign-share-restriction',
        ],
      },
      async ({ appManagerFixture, appManagerApiFixture, standardUserFixture, socialCampaignManagerFixture }) => {
        tagTest(test.info(), {
          description:
            'ABAC: Verify Standard User who is granted Feature Owner permission for "Post in Home Feed" can share a Social Campaign to Home Feed with Restricted Viewers (Limit Visibility ON + UX Designs audience). Users in selected audience CAN see the campaign, users NOT in audience CANNOT see it.',
          zephyrTestId: 'CONT-42256',
          storyId: 'CONT-42256',
        });

        // ==================== App Manager creates Social Campaign via API ====================
        const campaignOptions = {
          message: SOCIAL_CAMPAIGN_TEST_DATA.MESSAGES.BLOG,
          url: SOCIAL_CAMPAIGN_TEST_DATA.URLS.SIMPPLR_ALL_EMPLOYEES,
          linkText: SOCIAL_CAMPAIGN_TEST_DATA.LINK_TEXT.SIMPPLR_ALL_EMPLOYEES,
          recipient: SocialCampaignRecipient.EVERYONE,
        };

        const createdCampaign = await appManagerFixture.socialCampaignHelper.createCampaign({
          message: campaignOptions.message,
          url: campaignOptions.url,
          recipient: campaignOptions.recipient,
        });
        campaignId = createdCampaign.campaignId;

        // ==================== App Manager adds SU as Feature Owner of "Post in Home Feed" via API ====================
        await test.step('App Manager adds SU as Feature Owner of "Post in Home Feed" via API', async () => {
          await appManagerApiFixture.identityManagementHelper.addUserAsFeatureOwner(
            ADD_HOME_FEED_FEATURE_CODE,
            standardUserUserId
          );
        });

        // ==================== SU shares Social Campaign to Home Feed WITH Restricted Viewers (UX Designs) ====================
        const shareDescription = TestDataGenerator.generateRandomString();
        await test.step('SU shares Social Campaign to Home Feed WITH Restricted Viewers (Limit Visibility ON + UX Designs)', async () => {
          socialCampaignPage = new SocialCampaignPage(standardUserFixture.page);
          await socialCampaignPage.loadPage();
          await socialCampaignPage.verifyCampaignLinkDisplayed(campaignOptions.linkText);

          await socialCampaignPage.clickCampaignOptions();
          await socialCampaignPage.clickShareToFeedButton();
          await socialCampaignPage.enterShareDescription(shareDescription);

          // Enable Limit Visibility and select UX Designs audience
          await socialCampaignPage.toggleLimitVisibility();
          await socialCampaignPage.selectAudience('UX');

          // Share to Home Feed (default option)
          await socialCampaignPage.clickShareButton();

          await socialCampaignPage.verifyToastMessageIsVisibleWithText(
            SOCIAL_CAMPAIGN_TEST_DATA.TOAST_MESSAGES.SHARED_SUCCESSFULLY
          );
        });

        // ==================== Social Campaign Manager (UX Designs audience) CAN see the shared campaign ====================
        await test.step('Social Campaign Manager (UX Designs audience) navigates to Home Feed and verifies shared campaign IS visible', async () => {
          await socialCampaignManagerFixture.navigationHelper.clickOnGlobalFeed();
          const uxUserFeedPage = new FeedPage(socialCampaignManagerFixture.page);
          await uxUserFeedPage.reloadPageWithTimelineMode();
          await uxUserFeedPage.feedList.verifyThePageIsLoadedWithTimelineMode();

          // Verify User in UX Designs audience CAN see the shared campaign
          await uxUserFeedPage.feedList.verifyCampaignLinkDisplayed(campaignOptions.linkText, shareDescription);
        });

        // ==================== Standard User (NOT in UX Designs audience) CANNOT see the shared campaign ====================
        await test.step('Standard User (NOT in UX Designs audience) navigates to Home Feed and verifies shared campaign is NOT visible', async () => {
          await standardUserFixture.navigationHelper.clickOnHomeIconButton();
          await standardUserFixture.navigationHelper.clickOnGlobalFeed();
          feedPage = new FeedPage(standardUserFixture.page);
          await feedPage.verifyThePageIsLoaded();

          // Verify Standard User (NOT in UX Designs audience) CANNOT see the shared campaign
          await feedPage.feedList.verifyPostIsNotVisible(shareDescription);
        });

        manualCleanupNeeded = true;
      }
    );

    test(
      'verify SU can share Social Campaign to Home Feed only to audience groups SU belongs to (Limit Visibility ON)',
      {
        tag: [
          TestPriority.P0,
          TestGroupType.SMOKE,
          '@CONT-42257',
          '@SU-social-campaign',
          '@social-campaign-share-restriction',
        ],
      },
      async ({ appManagerFixture, appManagerApiFixture, standardUserFixture, socialCampaignManagerFixture }) => {
        tagTest(test.info(), {
          description:
            'ABAC: Verify Standard User can share a Social Campaign to Home Feed with Restricted Viewers only to audience groups they belong to. SU (in UX Designs audience) shares to UX Designs - users in UX CAN see, users NOT in UX CANNOT see.',
          zephyrTestId: 'CONT-42257',
          storyId: 'CONT-42257',
        });

        // ==================== App Manager creates Social Campaign via API ====================
        const campaignOptions = {
          message: SOCIAL_CAMPAIGN_TEST_DATA.MESSAGES.BLOG,
          url: SOCIAL_CAMPAIGN_TEST_DATA.URLS.SIMPPLR_ALL_EMPLOYEES,
          linkText: SOCIAL_CAMPAIGN_TEST_DATA.LINK_TEXT.SIMPPLR_ALL_EMPLOYEES,
          recipient: SocialCampaignRecipient.EVERYONE,
        };

        const createdCampaign = await appManagerFixture.socialCampaignHelper.createCampaign({
          message: campaignOptions.message,
          url: campaignOptions.url,
          recipient: campaignOptions.recipient,
        });
        campaignId = createdCampaign.campaignId;

        // ==================== App Manager adds Social Campaign Manager as Feature Owner of "Post in Home Feed" via API ====================
        await test.step('App Manager adds Social Campaign Manager as Feature Owner of "Post in Home Feed" via API', async () => {
          await appManagerApiFixture.identityManagementHelper.addUserAsFeatureOwner(
            ADD_HOME_FEED_FEATURE_CODE,
            socialCampaignManagerUserId
          );
        });

        // ==================== Social Campaign Manager (in UX Designs) shares to UX Designs audience ====================
        const shareDescription = TestDataGenerator.generateRandomString();
        await test.step('Social Campaign Manager shares Social Campaign to Home Feed WITH Restricted Viewers (UX Designs - audience they belong to)', async () => {
          socialCampaignPage = new SocialCampaignPage(socialCampaignManagerFixture.page);
          await socialCampaignPage.loadPage();
          await socialCampaignPage.verifyCampaignLinkDisplayed(campaignOptions.linkText);

          await socialCampaignPage.clickCampaignOptions();
          await socialCampaignPage.clickShareToFeedButton();
          await socialCampaignPage.enterShareDescription(shareDescription);

          // Enable Limit Visibility and select UX Designs audience (audience SU belongs to)
          await socialCampaignPage.toggleLimitVisibility();
          await socialCampaignPage.selectAudience('UX');

          // Share to Home Feed (default option)
          await socialCampaignPage.clickShareButton();

          await socialCampaignPage.verifyToastMessageIsVisibleWithText(
            SOCIAL_CAMPAIGN_TEST_DATA.TOAST_MESSAGES.SHARED_SUCCESSFULLY
          );
        });

        // ==================== Social Campaign Manager (sharer, in UX Designs) CAN see the shared campaign ====================
        await test.step('Social Campaign Manager (sharer, in UX Designs audience) navigates to Home Feed and verifies shared campaign IS visible', async () => {
          await socialCampaignManagerFixture.navigationHelper.clickOnGlobalFeed();
          const sharerFeedPage = new FeedPage(socialCampaignManagerFixture.page);
          await sharerFeedPage.verifyThePageIsLoaded();

          // Verify Social Campaign Manager (sharer) can see their shared campaign
          await sharerFeedPage.feedList.verifyCampaignLinkDisplayed(campaignOptions.linkText, shareDescription);
        });

        // ==================== Standard User (NOT in UX Designs audience) CANNOT see the shared campaign ====================
        await test.step('Standard User (NOT in UX Designs audience) navigates to Home Feed and verifies shared campaign is NOT visible', async () => {
          await standardUserFixture.navigationHelper.clickOnGlobalFeed();
          const nonUxUserFeedPage = new FeedPage(standardUserFixture.page);
          await nonUxUserFeedPage.reloadPageWithTimelineMode();
          await nonUxUserFeedPage.feedList.verifyThePageIsLoadedWithTimelineMode();

          // Verify Standard User (NOT in UX Designs audience) CANNOT see the shared campaign
          await nonUxUserFeedPage.feedList.verifyPostIsNotVisible(shareDescription);
        });

        manualCleanupNeeded = true;
      }
    );

    test(
      'verify SU with FO permission can mention valid user while sharing Social Campaign with Restricted Viewers and validate notification',
      {
        tag: [
          TestPriority.P0,
          TestGroupType.SMOKE,
          '@CONT-42258',
          '@SU-social-campaign',
          '@social-campaign-share-restriction',
        ],
      },
      async ({ appManagerFixture, appManagerApiFixture, standardUserFixture, socialCampaignManagerFixture }) => {
        tagTest(test.info(), {
          description:
            'ABAC: Verify Standard User (granted FO permission) can share a Social Campaign to Home Feed with Restricted Viewers and @mention a valid user in the same audience. The mentioned user should see the campaign, highlighted mention, and receive a mention notification.',
          zephyrTestId: 'CONT-42258',
          storyId: 'CONT-42258',
        });

        // Get UX Designs user (socialCampaignManager) full name for mention
        let uxUserFullName: string;
        let standardUserFullName: string;
        await test.step('Get user full names for mention and notification verification', async () => {
          const uxUserInfo = await appManagerApiFixture.identityManagementHelper.getUserInfoByEmail(
            users.socialCampaignManager.email
          );
          uxUserFullName = uxUserInfo.fullName;

          const suInfo = await appManagerApiFixture.identityManagementHelper.getUserInfoByEmail(users.endUser.email);
          standardUserFullName = suInfo.fullName;
        });

        // ==================== App Manager creates Social Campaign via API ====================
        const campaignOptions = {
          message: SOCIAL_CAMPAIGN_TEST_DATA.MESSAGES.BLOG,
          url: SOCIAL_CAMPAIGN_TEST_DATA.URLS.SIMPPLR_ALL_EMPLOYEES,
          linkText: SOCIAL_CAMPAIGN_TEST_DATA.LINK_TEXT.SIMPPLR_ALL_EMPLOYEES,
          recipient: SocialCampaignRecipient.EVERYONE,
        };

        const createdCampaign = await appManagerFixture.socialCampaignHelper.createCampaign({
          message: campaignOptions.message,
          url: campaignOptions.url,
          recipient: campaignOptions.recipient,
        });
        campaignId = createdCampaign.campaignId;

        // ==================== App Manager adds SU as Feature Owner of "Post in Home Feed" via API ====================
        await test.step('App Manager adds SU as Feature Owner of "Post in Home Feed" via API', async () => {
          await appManagerApiFixture.identityManagementHelper.addUserAsFeatureOwner(
            ADD_HOME_FEED_FEATURE_CODE,
            standardUserUserId
          );
        });

        // ==================== SU shares Social Campaign with Restricted Viewers (UX) and @mentions UX user ====================
        const shareDescription = TestDataGenerator.generateRandomString();
        await test.step('SU shares Social Campaign to Home Feed WITH Restricted Viewers (UX Designs) and @mentions UX user', async () => {
          socialCampaignPage = new SocialCampaignPage(standardUserFixture.page);
          await socialCampaignPage.loadPage();
          await socialCampaignPage.verifyCampaignLinkDisplayed(campaignOptions.linkText);

          await socialCampaignPage.clickCampaignOptions();
          await socialCampaignPage.clickShareToFeedButton();
          await socialCampaignPage.enterShareDescription(shareDescription);

          // Add mention of UX Designs user
          await socialCampaignPage.addUserNameMentionInShareDialog(uxUserFullName);

          // Enable Limit Visibility and select UX Designs audience
          await socialCampaignPage.toggleLimitVisibility();
          await socialCampaignPage.selectAudience('UX');

          // Share to Home Feed (default option)
          await socialCampaignPage.clickShareButton();

          await socialCampaignPage.verifyToastMessageIsVisibleWithText(
            SOCIAL_CAMPAIGN_TEST_DATA.TOAST_MESSAGES.SHARED_SUCCESSFULLY
          );
        });

        // ==================== Mentioned User (UX Designs) verifies campaign visible with highlighted mention ====================
        await test.step('Mentioned User (UX Designs) navigates to Home Feed and verifies shared campaign with mention IS visible', async () => {
          await socialCampaignManagerFixture.navigationHelper.clickOnGlobalFeed();
          const uxUserFeedPage = new FeedPage(socialCampaignManagerFixture.page);
          await uxUserFeedPage.reloadPageWithTimelineMode();
          await uxUserFeedPage.feedList.verifyThePageIsLoadedWithTimelineMode();

          // Verify Mentioned User (in UX Designs audience) CAN see the shared campaign
          await uxUserFeedPage.feedList.verifyCampaignLinkDisplayed(campaignOptions.linkText, shareDescription);

          // Verify their mention is highlighted/visible on the shared post
          await uxUserFeedPage.feedList.verifyUserNameMentionIsVisible(shareDescription, uxUserFullName);
        });

        // ==================== Mentioned User verifies notification received for mention ====================
        await test.step('Mentioned User verifies notification received for @mention', async () => {
          const notificationComponent = await socialCampaignManagerFixture.navigationHelper.clickOnBellIcon({
            stepInfo: 'Mentioned User clicking on bell icon to view notifications',
          });
          const activityNotificationPage = await notificationComponent.clickOnViewAllNotifications();

          // Verify notification message contains "mentioned you"
          const expectedNotificationMessage = `${standardUserFullName} mentioned you`;
          await activityNotificationPage.verifyNotificationExists(expectedNotificationMessage);
        });

        // ==================== Standard User (NOT in UX Designs, sharer) verifies campaign is NOT visible ====================
        await test.step('Standard User (NOT in UX Designs audience) navigates to Home Feed and verifies shared campaign is NOT visible', async () => {
          await standardUserFixture.navigationHelper.clickOnHomeIconButton();
          await standardUserFixture.navigationHelper.clickOnGlobalFeed();
          feedPage = new FeedPage(standardUserFixture.page);
          await feedPage.verifyThePageIsLoaded();

          // Verify Standard User (NOT in UX Designs audience) CANNOT see the shared campaign
          await feedPage.feedList.verifyPostIsNotVisible(shareDescription);
        });

        manualCleanupNeeded = true;
      }
    );

    test(
      'verify SU can see Limit Visibility toggle while sharing Social Campaign to Home Feed',
      {
        tag: [
          TestPriority.P0,
          TestGroupType.SMOKE,
          '@CONT-42259',
          '@SU-social-campaign',
          '@social-campaign-share-restriction',
        ],
      },
      async ({ appManagerFixture, appManagerApiFixture, standardUserFixture }) => {
        tagTest(test.info(), {
          description:
            'ABAC: Verify Standard User (granted FO permission) can see the Limit Visibility toggle in the Share to Home Feed modal. The toggle should be visible and enabled. Verify Cancel button closes the modal without sharing.',
          zephyrTestId: 'CONT-42259',
          storyId: 'CONT-42259',
        });

        // ==================== App Manager creates Social Campaign via API ====================
        const campaignOptions = {
          message: SOCIAL_CAMPAIGN_TEST_DATA.MESSAGES.BLOG,
          url: SOCIAL_CAMPAIGN_TEST_DATA.URLS.SIMPPLR_ALL_EMPLOYEES,
          linkText: SOCIAL_CAMPAIGN_TEST_DATA.LINK_TEXT.SIMPPLR_ALL_EMPLOYEES,
          recipient: SocialCampaignRecipient.EVERYONE,
        };

        const createdCampaign = await appManagerFixture.socialCampaignHelper.createCampaign({
          message: campaignOptions.message,
          url: campaignOptions.url,
          recipient: campaignOptions.recipient,
        });
        campaignId = createdCampaign.campaignId;

        // ==================== App Manager adds SU as Feature Owner of "Post in Home Feed" via API ====================
        await test.step('App Manager adds SU as Feature Owner of "Post in Home Feed" via API', async () => {
          await appManagerApiFixture.identityManagementHelper.addUserAsFeatureOwner(
            ADD_HOME_FEED_FEATURE_CODE,
            standardUserUserId
          );
        });

        // ==================== SU navigates to Social Campaign page ====================
        await test.step('SU navigates to Social Campaign page and verifies campaign is displayed', async () => {
          socialCampaignPage = new SocialCampaignPage(standardUserFixture.page);
          await socialCampaignPage.loadPage();
          await socialCampaignPage.verifyCampaignLinkDisplayed(campaignOptions.linkText);
        });

        // ==================== SU opens Share to Home Feed modal ====================
        await test.step('SU clicks Share option and opens Share to Home Feed modal', async () => {
          await socialCampaignPage.clickCampaignOptions();
          await socialCampaignPage.clickShareToFeedButton();
          await socialCampaignPage.verifyShareDialogIsOpen();
        });

        // ==================== Verify Limit Visibility toggle is VISIBLE ====================
        await test.step('Verify Limit Visibility toggle is visible in Share to Home Feed modal', async () => {
          await socialCampaignPage.verifyLimitVisibilityToggleIsVisible();
        });

        // ==================== Verify Limit Visibility toggle is ENABLED/INTERACTIVE ====================
        await test.step('Verify Limit Visibility toggle is enabled and interactive', async () => {
          await socialCampaignPage.verifyLimitVisibilityToggleIsEnabled();
        });

        // ==================== SU clicks Cancel - verify modal closes without sharing ====================
        await test.step('SU clicks Cancel and verifies share modal is closed', async () => {
          await socialCampaignPage.clickCancelShareButton();
          await socialCampaignPage.verifyShareDialogIsClosed();
        });

        // ==================== Verify campaign is NOT shared to Home Feed ====================
        await test.step('SU navigates to Home Feed and verifies campaign is NOT shared', async () => {
          await standardUserFixture.navigationHelper.clickOnGlobalFeed();
          feedPage = new FeedPage(standardUserFixture.page);
          await feedPage.verifyThePageIsLoaded();

          // Verify the campaign link is NOT visible on Home Feed (was not shared)
          await feedPage.feedList.verifyPostIsNotVisible(campaignOptions.linkText);
        });

        manualCleanupNeeded = true;
      }
    );
  }
);
