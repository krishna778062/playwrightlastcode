import { PAGE_ENDPOINTS } from '@/src/core/constants/pageEndpoints';
import { TestPriority } from '@/src/core/constants/testPriority';
import { TestGroupType } from '@/src/core/constants/testType';
import { SiteMembershipAction, SitePermission } from '@/src/core/types/siteManagement.types';
import { TestDataGenerator } from '@/src/core/utils/testDataGenerator';
import { tagTest } from '@/src/core/utils/testDecorator';
import { ContentType } from '@/src/modules/content/constants/contentType';
import { FeedPostingPermission } from '@/src/modules/content/constants/feedPostingPermission';
import { SITE_TYPES } from '@/src/modules/content/constants/siteTypes';
import { ContentSuiteTags } from '@/src/modules/content/constants/testTags';
import { contentTestFixture as test, users } from '@/src/modules/content/fixtures/contentFixture';
import { CreateFeedPostComponent } from '@/src/modules/content/ui/components/createFeedPostComponent';
import { ShareComponent } from '@/src/modules/content/ui/components/shareComponent';
import { ContentPreviewPage } from '@/src/modules/content/ui/pages/contentPreviewPage';
import { FeedPage } from '@/src/modules/content/ui/pages/feedPage';
import { ManageSitePage } from '@/src/modules/content/ui/pages/manageSitePage';
import { SiteDashboardPage } from '@/src/modules/content/ui/pages/sitePages/siteDashboardPage';

test.describe(
  'sU | Home Feed Post Creation via ACG Permission (ABAC)',
  {
    tag: [ContentSuiteTags.FEED_ABAC],
  },
  () => {
    let feedPage: FeedPage;
    let createdPostId: string = '';
    let standardUserFullName: string;

    test.beforeEach('Setup: Get Standard User full name', async ({ appManagerApiFixture }) => {
      const userInfo = await appManagerApiFixture.identityManagementHelper.getUserInfoByEmail(users.endUser.email);
      standardUserFullName = userInfo.fullName;
    });

    test.afterEach('Cleanup: Delete created post and remove FO if needed', async ({ appManagerApiFixture }) => {
      if (createdPostId) {
        try {
          await appManagerApiFixture.feedManagementHelper.deleteFeed(createdPostId);
        } catch (error) {
          console.log('Error during feed cleanup:', error);
        }
      }
    });

    test(
      'verify FO can share unrestricted Home Feed post to Site Feed with Restricted Viewers (UX audience)',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, '@CONT-42194', '@FO-feed', '@share-restriction'],
      },
      async ({ appManagerFixture, appManagerApiFixture, standardUserFixture, socialCampaignManagerFixture }) => {
        tagTest(test.info(), {
          description:
            'ABAC: Verify FO can share a Home Feed post (created without restrictions) to a Public Site Feed with Restricted Viewers enabled (UX audience). Post should be visible only to UX audience users.',
          zephyrTestId: 'CONT-42194',
          storyId: 'CONT-42194',
        });

        let foPostText: string;
        let sharedPostId: string = '';
        let publicSiteId: string = '';
        let publicSiteName: string = '';

        // ==================== Get or create Public Site ====================
        await test.step('Get or create a Public Site for sharing', async () => {
          const publicSite = await appManagerApiFixture.siteManagementHelper.getSiteByAccessType(SITE_TYPES.PUBLIC, {
            waitForSearchIndex: true,
          });
          publicSiteId = publicSite.siteId;
          publicSiteName = publicSite.name;
        });

        // ==================== FO creates Home Feed post WITHOUT restrictions ====================
        await test.step('FO creates Home Feed post WITHOUT Restricted Viewers (unrestricted)', async () => {
          // Set feed posting permission to everyone
          const manageSitePage = new ManageSitePage(appManagerFixture.page);
          await manageSitePage.goToUrl(PAGE_ENDPOINTS.MANAGE_SITE_SETUP_PAGE(publicSiteId));
          await manageSitePage.setFeedPostingPermission(FeedPostingPermission.EVERYONE);

          await appManagerFixture.navigationHelper.clickOnHomeIconButton();
          await appManagerFixture.navigationHelper.clickOnGlobalFeed();
          feedPage = new FeedPage(appManagerFixture.page);
          await feedPage.reloadPage();
          await feedPage.verifyThePageIsLoaded();

          foPostText = TestDataGenerator.generateRandomText('ABAC Share to Site Feed Test Post', 3, true);
          await feedPage.clickShareThoughtsButton();

          const postResult = await feedPage.postEditor.createAndPost({
            text: foPostText,
          });

          createdPostId = postResult.postId || '';
          await feedPage.feedList.waitForPostToBeVisible(postResult.postText);

          // Verify post does NOT have limit visibility (unrestricted)
          await feedPage.postEditor.verifyPostDoesNotHaveLimitVisibility(foPostText);
        });

        // ==================== FO shares to Site Feed WITH Restricted Viewers (UX audience) ====================
        await test.step('FO shares post to Public Site Feed with Restricted Viewers (UX audience)', async () => {
          await feedPage.feedList.clickShareIcon(foPostText);
          await feedPage.verifyShareModalIsOpen();

          const shareComponent = new ShareComponent(appManagerFixture.page);
          const shareDescription = TestDataGenerator.generateRandomText('Shared with UX restriction', 2, true);

          sharedPostId = await shareComponent.shareToSiteFeedWithLimitVisibility({
            siteName: publicSiteName,
            description: shareDescription,
            audience: 'Engineering',
          });

          // Verify share was successful
          await feedPage.feedList.verifyShareModalIsClosed();
        });

        // ==================== Authorized User (Standard User in Engineering) can see shared post on Site Feed ====================
        await test.step('Standard User (authorized - in Engineering audience) navigates to Site Feed and verifies shared post is visible', async () => {
          const siteDashboardPage = new SiteDashboardPage(standardUserFixture.page, publicSiteId);
          await siteDashboardPage.loadPage();
          await siteDashboardPage.verifyThePageIsLoaded();

          await siteDashboardPage.clickOnFeedLink();

          const standardUserFeedPage = new FeedPage(standardUserFixture.page);
          await standardUserFeedPage.verifyThePageIsLoaded();

          // Verify the shared post is visible to authorized user
          await standardUserFeedPage.feedList.waitForPostToBeVisible(foPostText);
        });

        // ==================== Unauthorized User (Social Campaign Manager NOT in Engineering) cannot see shared post ====================
        await test.step('Social Campaign Manager (unauthorized - NOT in Engineering audience) navigates to Site Feed and verifies shared post is NOT visible', async () => {
          const siteDashboardPage = new SiteDashboardPage(socialCampaignManagerFixture.page, publicSiteId);
          await siteDashboardPage.loadPage();
          await siteDashboardPage.verifyThePageIsLoaded();

          await siteDashboardPage.clickOnFeedLink();

          const socialCampaignManagerFeedPage = new FeedPage(socialCampaignManagerFixture.page);
          await socialCampaignManagerFeedPage.verifyThePageIsLoaded();

          // Verify the shared post is NOT visible to unauthorized user
          await socialCampaignManagerFeedPage.feedList.verifyPostIsNotVisible(foPostText);
        });

        // ==================== Unauthorized User cannot access shared post via direct URL ====================
        await test.step('Social Campaign Manager attempts direct URL access to shared post and verifies Page not found', async () => {
          const directAccessFeedPage = new FeedPage(socialCampaignManagerFixture.page, sharedPostId);
          await socialCampaignManagerFixture.page.goto(directAccessFeedPage.url);

          await directAccessFeedPage.verifyPageNotFoundVisibility({
            stepInfo:
              'Verify unauthorized user sees Page not found when accessing restricted shared post via direct URL',
          });
        });
      }
    );

    test(
      'verify FO can share restricted Home Feed post to Site Feed without restrictions - visible to all users',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, '@CONT-42195', '@FO-feed', '@share-restriction'],
      },
      async ({ appManagerFixture, appManagerApiFixture, standardUserFixture, socialCampaignManagerFixture }) => {
        tagTest(test.info(), {
          description:
            'ABAC: Verify FO can share a Home Feed post (created WITH restrictions - Engineering) to a Public Site Feed WITHOUT restrictions. Post should be visible to ALL users regardless of audience.',
          zephyrTestId: 'CONT-42195',
          storyId: 'CONT-42195',
        });

        let foPostText: string;
        let sharePostText: string;
        let sharedPostId: string = '';
        let publicSiteId: string = '';
        let publicSiteName: string = '';

        // ==================== Get or create Public Site ====================
        await test.step('Get or create a Public Site for sharing', async () => {
          const publicSite = await appManagerApiFixture.siteManagementHelper.getSiteByAccessType(SITE_TYPES.PUBLIC, {
            waitForSearchIndex: true,
          });
          publicSiteId = publicSite.siteId;
          publicSiteName = publicSite.name;
        });

        // ==================== FO creates Home Feed post WITH restrictions (Engineering) ====================
        await test.step('FO creates Home Feed post WITH Restricted Viewers (Engineering audience)', async () => {
          await appManagerFixture.navigationHelper.clickOnHomeIconButton();
          await appManagerFixture.navigationHelper.clickOnGlobalFeed();
          feedPage = new FeedPage(appManagerFixture.page);
          await feedPage.reloadPage();
          await feedPage.verifyThePageIsLoaded();

          foPostText = TestDataGenerator.generateRandomText('ABAC Restricted Share Test Post', 3, true);
          await feedPage.clickShareThoughtsButton();

          const postResult = await feedPage.createAndPostWithLimitVisibility({
            text: foPostText,
            limitVisibility: {
              enabled: true,
              audience: 'Engineering',
            },
          });

          createdPostId = postResult.postId || '';
          await feedPage.feedList.waitForPostToBeVisible(postResult.postText);

          // Verify post HAS limit visibility (restricted to Engineering)
          await feedPage.postEditor.verifyPostHasLimitVisibility(foPostText);
        });

        // ==================== FO shares to Site Feed WITHOUT restrictions ====================
        await test.step('FO shares restricted post to Public Site Feed WITHOUT Restricted Viewers', async () => {
          await feedPage.feedList.clickShareIcon(foPostText);
          await feedPage.verifyShareModalIsOpen();

          const shareComponent = new ShareComponent(appManagerFixture.page);
          sharePostText = TestDataGenerator.generateRandomText('Shared without restriction', 2, true);

          // Share to Site Feed WITHOUT enabling limit visibility
          await shareComponent.selectShareOptionAsSiteFeed();
          await shareComponent.enterSiteName(publicSiteName);
          await shareComponent.enterShareDescription(sharePostText);

          sharedPostId = await shareComponent.clickShareButtonAndGetPostId();

          // Verify share was successful
          await feedPage.feedList.verifyShareModalIsClosed();
        });

        // ==================== Engineering User can see shared post on Site Feed ====================
        await test.step('Standard User (in Engineering audience) navigates to Site Feed and verifies shared post is visible', async () => {
          const siteDashboardPage = new SiteDashboardPage(standardUserFixture.page, publicSiteId);
          await siteDashboardPage.loadPage();
          await siteDashboardPage.verifyThePageIsLoaded();

          await siteDashboardPage.clickOnFeedLink();

          const standardUserFeedPage = new FeedPage(standardUserFixture.page);
          await standardUserFeedPage.verifyThePageIsLoaded();

          // Verify the shared post IS visible to Engineering user
          await standardUserFeedPage.feedList.waitForPostToBeVisible(foPostText);

          await standardUserFeedPage.feedList.waitForPostToBeVisible(sharePostText);
        });

        // ==================== Non-Engineering User can ALSO see shared post on Site Feed ====================
        await test.step('Social Campaign Manager (NOT in Engineering audience) navigates to Site Feed and verifies shared post IS visible', async () => {
          const siteDashboardPage = new SiteDashboardPage(socialCampaignManagerFixture.page, publicSiteId);
          await siteDashboardPage.loadPage();
          await siteDashboardPage.verifyThePageIsLoaded();

          await siteDashboardPage.clickOnFeedLink();

          const socialCampaignManagerFeedPage = new FeedPage(socialCampaignManagerFixture.page);
          await socialCampaignManagerFeedPage.verifyThePageIsLoaded();

          // Verify the shared post IS visible to non-Engineering user (no restriction on Site Feed)
          await socialCampaignManagerFeedPage.feedList.waitForPostToBeVisible(sharePostText);

          await socialCampaignManagerFeedPage.feedList.verifyDeletedPostMessage(sharePostText);
        });

        // ==================== Non-Engineering User can access shared post via direct URL ====================
        await test.step('Social Campaign Manager can access shared post via direct URL', async () => {
          const directAccessFeedPage = new FeedPage(socialCampaignManagerFixture.page, sharedPostId);
          await socialCampaignManagerFixture.page.goto(directAccessFeedPage.url);

          // Verify the shared post is accessible via direct URL (no Page not found)
          await directAccessFeedPage.feedList.waitForPostToBeVisible(sharePostText);

          await directAccessFeedPage.feedList.verifyDeletedPostMessage(sharePostText);
        });
      }
    );

    test(
      'verify FO can share restricted (Engineering) Home Feed post to Site Feed with different restrictions (UX Designs)',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, '@CONT-42196', '@FO-feed', '@share-restriction'],
      },
      async ({ appManagerFixture, appManagerApiFixture, standardUserFixture, socialCampaignManagerFixture }) => {
        tagTest(test.info(), {
          description:
            'ABAC: Verify FO can share a Home Feed post (restricted to Engineering) to a Public Site Feed with different Restricted Viewers (UX Designs). Site Feed post should be visible only to UX Designs users, not Engineering users.',
          zephyrTestId: 'CONT-42196',
          storyId: 'CONT-42196',
        });

        let foPostText: string;
        let sharePostText: string;
        let sharedPostId: string = '';
        let publicSiteId: string = '';
        let publicSiteName: string = '';

        // ==================== Get or create Public Site ====================
        await test.step('Get or create a Public Site for sharing', async () => {
          const publicSite = await appManagerApiFixture.siteManagementHelper.getSiteByAccessType(SITE_TYPES.PUBLIC, {
            waitForSearchIndex: true,
          });
          publicSiteId = publicSite.siteId;
          publicSiteName = publicSite.name;
        });

        // ==================== FO creates Home Feed post WITH restrictions (Engineering) ====================
        await test.step('FO creates Home Feed post WITH Restricted Viewers (Engineering audience)', async () => {
          const manageSitePage = new ManageSitePage(appManagerFixture.page);
          await manageSitePage.goToUrl(PAGE_ENDPOINTS.MANAGE_SITE_SETUP_PAGE(publicSiteId));
          await manageSitePage.setFeedPostingPermission(FeedPostingPermission.EVERYONE);

          await appManagerFixture.navigationHelper.clickOnHomeIconButton();
          await appManagerFixture.navigationHelper.clickOnGlobalFeed();
          feedPage = new FeedPage(appManagerFixture.page);
          await feedPage.reloadPage();
          await feedPage.verifyThePageIsLoaded();

          foPostText = TestDataGenerator.generateRandomText('ABAC Different Audience Share Test', 3, true);
          await feedPage.clickShareThoughtsButton();

          const postResult = await feedPage.createAndPostWithLimitVisibility({
            text: foPostText,
            limitVisibility: {
              enabled: true,
              audience: 'Engineering',
            },
          });

          createdPostId = postResult.postId || '';
          await feedPage.feedList.waitForPostToBeVisible(postResult.postText);

          // Verify post HAS limit visibility (restricted to Engineering)
          await feedPage.postEditor.verifyPostHasLimitVisibility(foPostText);
        });

        // ==================== FO shares to Site Feed WITH Restricted Viewers (UX Designs - different audience) ====================
        await test.step('FO shares restricted post to Public Site Feed WITH Restricted Viewers (UX Designs)', async () => {
          await feedPage.feedList.clickShareIcon(foPostText);
          await feedPage.verifyShareModalIsOpen();

          const shareComponent = new ShareComponent(appManagerFixture.page);
          sharePostText = TestDataGenerator.generateRandomText('Shared with UX restriction', 2, true);

          // Share to Site Feed WITH limit visibility (UX audience - different from Home Feed)
          sharedPostId = await shareComponent.shareToSiteFeedWithLimitVisibility({
            siteName: publicSiteName,
            description: sharePostText,
            audience: 'UX',
          });

          // Verify share was successful
          await feedPage.feedList.verifyShareModalIsClosed();
        });

        // ==================== UX Designs User (socialCampaignManagerFixture) CAN see shared post on Site Feed ====================
        await test.step('Social Campaign Manager (UX Designs audience) navigates to Site Feed and verifies shared post IS visible', async () => {
          const siteDashboardPage = new SiteDashboardPage(socialCampaignManagerFixture.page, publicSiteId);
          await siteDashboardPage.loadPage();
          await siteDashboardPage.verifyThePageIsLoaded();

          await siteDashboardPage.clickOnFeedLink();

          const socialCampaignManagerFeedPage = new FeedPage(socialCampaignManagerFixture.page);
          await socialCampaignManagerFeedPage.verifyThePageIsLoaded();

          // Verify the shared post IS visible to UX Designs user
          await socialCampaignManagerFeedPage.feedList.waitForPostToBeVisible(sharePostText);

          await socialCampaignManagerFeedPage.feedList.verifyDeletedPostMessage(sharePostText);
        });

        // ==================== Engineering User (standardUserFixture) CANNOT see shared post on Site Feed ====================
        await test.step('Standard User (Engineering audience) navigates to Site Feed and verifies shared post is NOT visible', async () => {
          const siteDashboardPage = new SiteDashboardPage(standardUserFixture.page, publicSiteId);
          await siteDashboardPage.loadPage();
          await siteDashboardPage.verifyThePageIsLoaded();

          await siteDashboardPage.clickOnFeedLink();

          const standardUserFeedPage = new FeedPage(standardUserFixture.page);
          await standardUserFeedPage.verifyThePageIsLoaded();

          // Verify the shared post is NOT visible to Engineering user (Site Feed restricted to UX)
          await standardUserFeedPage.feedList.verifyPostIsNotVisible(sharePostText);
        });

        // ==================== Engineering User cannot access shared post via direct URL ====================
        await test.step('Standard User (Engineering) attempts direct URL access to shared post and verifies Page not found', async () => {
          const directAccessFeedPage = new FeedPage(standardUserFixture.page, sharedPostId);
          await standardUserFixture.page.goto(directAccessFeedPage.url);

          await directAccessFeedPage.verifyPageNotFoundVisibility({
            stepInfo:
              'Verify Engineering user sees Page not found when accessing UX-restricted shared post via direct URL',
          });
        });
      }
    );

    test(
      'verify FO can share unrestricted Site Feed post to Home Feed with Restricted Viewers (UX Designs)',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, '@CONT-42197', '@FO-feed', '@share-restriction'],
      },
      async ({ appManagerFixture, appManagerApiFixture, standardUserFixture, socialCampaignManagerFixture }) => {
        tagTest(test.info(), {
          description:
            'ABAC: Verify FO can share an unrestricted Site Feed post to Home Feed with Restricted Viewers (UX Designs). Home Feed post should be visible only to UX Designs users and FO, not to Engineering users.',
          zephyrTestId: 'CONT-42197',
          storyId: 'CONT-42197',
        });

        let siteFeedPostText: string;
        let sharePostText: string;
        let sharedPostId: string = '';
        let publicSiteId: string = '';
        let siteDashboardPage: SiteDashboardPage;
        let siteFeedPage: FeedPage;

        // ==================== Get or create Public Site ====================
        await test.step('Get or create a Public Site', async () => {
          const publicSite = await appManagerApiFixture.siteManagementHelper.getSiteByAccessType(SITE_TYPES.PUBLIC, {
            waitForSearchIndex: true,
          });
          publicSiteId = publicSite.siteId;
        });

        // ==================== FO creates Site Feed post WITHOUT restrictions ====================
        await test.step('FO creates Site Feed post WITHOUT Restricted Viewers (unrestricted)', async () => {
          siteDashboardPage = new SiteDashboardPage(appManagerFixture.page, publicSiteId);
          await siteDashboardPage.loadPage();
          await siteDashboardPage.verifyThePageIsLoaded();

          await siteDashboardPage.clickOnFeedLink();

          siteFeedPage = new FeedPage(appManagerFixture.page);
          await siteFeedPage.verifyThePageIsLoaded();

          siteFeedPostText = TestDataGenerator.generateRandomText('ABAC Site to Home Share Test', 3, true);
          await siteFeedPage.clickShareThoughtsButton();

          const postResult = await siteFeedPage.postEditor.createAndPost({
            text: siteFeedPostText,
          });

          await siteFeedPage.feedList.waitForPostToBeVisible(postResult.postText);

          // Verify post does NOT have limit visibility (unrestricted)
          await siteFeedPage.postEditor.verifyPostDoesNotHaveLimitVisibility(siteFeedPostText);
        });

        // ==================== FO shares Site Feed post to Home Feed WITH Restricted Viewers (UX Designs) ====================
        await test.step('FO shares Site Feed post to Home Feed WITH Restricted Viewers (UX Designs)', async () => {
          await siteFeedPage.feedList.waitForPostToBeVisible(siteFeedPostText);
          await siteFeedPage.feedList.clickShareIcon(siteFeedPostText);
          await siteFeedPage.verifyShareModalIsOpen();

          const shareComponent = new ShareComponent(appManagerFixture.page);
          sharePostText = TestDataGenerator.generateRandomText('Shared to Home Feed with UX restriction', 2, true);

          // Share to Home Feed (default option) WITH limit visibility
          await shareComponent.enterShareDescription(sharePostText);
          await shareComponent.toggleLimitVisibility();
          await shareComponent.selectAudience('UX');

          sharedPostId = await shareComponent.clickShareButtonAndGetPostId();

          // Verify share was successful
          await siteFeedPage.feedList.verifyShareModalIsClosed();
        });

        // ==================== UX Designs User (socialCampaignManagerFixture) CAN see shared post on Home Feed ====================
        await test.step('Social Campaign Manager (UX Designs audience) navigates to Home Feed and verifies shared post IS visible', async () => {
          await socialCampaignManagerFixture.navigationHelper.clickOnGlobalFeed();

          const socialCampaignManagerFeedPage = new FeedPage(socialCampaignManagerFixture.page);
          await socialCampaignManagerFeedPage.reloadPageWithTimelineMode();
          await socialCampaignManagerFeedPage.feedList.verifyThePageIsLoadedWithTimelineMode();

          // Verify the shared post IS visible to UX Designs user
          await socialCampaignManagerFeedPage.feedList.waitForPostToBeVisible(sharePostText);
        });

        // ==================== Engineering User (standardUserFixture) CANNOT see shared post on Home Feed ====================
        await test.step('Standard User (Engineering audience) navigates to Home Feed and verifies shared post is NOT visible', async () => {
          await standardUserFixture.navigationHelper.clickOnGlobalFeed();

          const standardUserFeedPage = new FeedPage(standardUserFixture.page);
          await standardUserFeedPage.reloadPageWithTimelineMode();
          await standardUserFeedPage.feedList.verifyThePageIsLoadedWithTimelineMode();

          // Verify the shared post is NOT visible to Engineering user (Home Feed restricted to UX)
          await standardUserFeedPage.feedList.verifyPostIsNotVisible(sharePostText);
        });

        // ==================== Engineering User cannot access shared post via direct URL ====================
        await test.step('Standard User (Engineering) attempts direct URL access to shared post and verifies Page not found', async () => {
          const directAccessFeedPage = new FeedPage(standardUserFixture.page, sharedPostId);
          await standardUserFixture.page.goto(directAccessFeedPage.url);

          await directAccessFeedPage.verifyPageNotFoundVisibility({
            stepInfo:
              'Verify Engineering user sees Page not found when accessing UX-restricted Home Feed post via direct URL',
          });
        });

        // ==================== FO can see shared post on Home Feed ====================
        await test.step('FO navigates to Home Feed and verifies shared post IS visible', async () => {
          await appManagerFixture.navigationHelper.clickOnGlobalFeed();

          const appManagerFeedPage = new FeedPage(appManagerFixture.page);
          await appManagerFeedPage.reloadPageWithTimelineMode();
          await appManagerFeedPage.feedList.verifyThePageIsLoadedWithTimelineMode();

          // Verify the shared post IS visible to FO (creator/sharer always sees their posts)
          await appManagerFeedPage.feedList.waitForPostToBeVisible(sharePostText);
        });
      }
    );

    test(
      'Verify FO can share a post created for Restricted viewers (Engineering) on Public Site Feed to Home Feed with Restricted viewers (UX Designs)',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, '@CONT-42199', '@FO-feed', '@share-restriction'],
      },
      async ({ appManagerFixture, appManagerApiFixture, standardUserFixture, socialCampaignManagerFixture }) => {
        tagTest(test.info(), {
          description:
            'ABAC: Verify FO can share a restricted Site Feed post (Engineering) to Home Feed with different Restricted Viewers (UX Designs). Validates inverse visibility - Engineering can see Site Feed but NOT Home Feed, UX can see Home Feed but NOT Site Feed.',
          zephyrTestId: 'CONT-42199',
          storyId: 'CONT-42199',
        });

        let siteFeedPostText: string;
        let sharePostText: string;
        let sharedPostId: string = '';
        let publicSiteId: string = '';
        let siteDashboardPage: SiteDashboardPage;
        let siteFeedPage: FeedPage;

        // ==================== Get or create Public Site ====================
        await test.step('Get or create a Public Site', async () => {
          const publicSite = await appManagerApiFixture.siteManagementHelper.getSiteByAccessType(SITE_TYPES.PUBLIC, {
            waitForSearchIndex: true,
          });
          publicSiteId = publicSite.siteId;
        });

        // ==================== FO creates Site Feed post WITH restrictions (Engineering) ====================
        await test.step('FO creates Site Feed post WITH Restricted Viewers (Engineering audience)', async () => {
          siteDashboardPage = new SiteDashboardPage(appManagerFixture.page, publicSiteId);
          await siteDashboardPage.loadPage();
          await siteDashboardPage.verifyThePageIsLoaded();

          await siteDashboardPage.clickOnFeedLink();

          siteFeedPage = new FeedPage(appManagerFixture.page);
          await siteFeedPage.verifyThePageIsLoaded();

          siteFeedPostText = TestDataGenerator.generateRandomText('ABAC Restricted Site Feed Share Test', 3, true);
          await siteFeedPage.clickShareThoughtsButton();

          const postResult = await siteFeedPage.createAndPostWithLimitVisibility({
            text: siteFeedPostText,
            limitVisibility: {
              enabled: true,
              audience: 'Engineering',
            },
          });

          await siteFeedPage.feedList.waitForPostToBeVisible(postResult.postText);

          // Verify post HAS limit visibility (restricted to Engineering)
          await siteFeedPage.postEditor.verifyPostHasLimitVisibility(siteFeedPostText);
        });

        // ==================== Engineering User (standardUserFixture) CAN see Site Feed post ====================
        await test.step('Standard User (Engineering audience) navigates to Site Feed and verifies post IS visible', async () => {
          const standardUserSiteDashboard = new SiteDashboardPage(standardUserFixture.page, publicSiteId);
          await standardUserSiteDashboard.loadPage();
          await standardUserSiteDashboard.verifyThePageIsLoaded();

          await standardUserSiteDashboard.clickOnFeedLink();

          const standardUserSiteFeedPage = new FeedPage(standardUserFixture.page);
          await standardUserSiteFeedPage.verifyThePageIsLoaded();

          // Verify the Site Feed post IS visible to Engineering user
          await standardUserSiteFeedPage.feedList.waitForPostToBeVisible(siteFeedPostText);
        });

        // ==================== UX User (socialCampaignManagerFixture) CANNOT see Site Feed post ====================
        await test.step('Social Campaign Manager (UX audience) navigates to Site Feed and verifies post is NOT visible', async () => {
          const uxUserSiteDashboard = new SiteDashboardPage(socialCampaignManagerFixture.page, publicSiteId);
          await uxUserSiteDashboard.loadPage();
          await uxUserSiteDashboard.verifyThePageIsLoaded();

          await uxUserSiteDashboard.clickOnFeedLink();

          const uxUserSiteFeedPage = new FeedPage(socialCampaignManagerFixture.page);
          await uxUserSiteFeedPage.verifyThePageIsLoaded();

          // Verify the Site Feed post is NOT visible to UX user (restricted to Engineering)
          await uxUserSiteFeedPage.feedList.verifyPostIsNotVisible(siteFeedPostText);
        });

        // ==================== FO shares Site Feed post to Home Feed WITH Restricted Viewers (UX Designs) ====================
        await test.step('FO shares restricted Site Feed post to Home Feed WITH Restricted Viewers (UX Designs)', async () => {
          await siteFeedPage.feedList.waitForPostToBeVisible(siteFeedPostText);
          await siteFeedPage.feedList.clickShareIcon(siteFeedPostText);
          await siteFeedPage.verifyShareModalIsOpen();

          const shareComponent = new ShareComponent(appManagerFixture.page);
          sharePostText = TestDataGenerator.generateRandomText('Shared to Home Feed with UX restriction', 2, true);

          // Share to Home Feed (default option) WITH limit visibility (UX audience)
          await shareComponent.enterShareDescription(sharePostText);
          await shareComponent.toggleLimitVisibility();
          await shareComponent.selectAudience('UX');

          sharedPostId = await shareComponent.clickShareButtonAndGetPostId();

          // Verify share was successful
          await siteFeedPage.feedList.verifyShareModalIsClosed();
        });

        // ==================== UX User (socialCampaignManagerFixture) CAN see shared post on Home Feed ====================
        await test.step('Social Campaign Manager (UX audience) navigates to Home Feed and verifies shared post IS visible', async () => {
          await socialCampaignManagerFixture.navigationHelper.clickOnGlobalFeed();

          const uxUserHomeFeedPage = new FeedPage(socialCampaignManagerFixture.page);
          await uxUserHomeFeedPage.reloadPageWithTimelineMode();
          await uxUserHomeFeedPage.feedList.verifyThePageIsLoadedWithTimelineMode();

          // Verify the shared post IS visible to UX user on Home Feed
          await uxUserHomeFeedPage.feedList.waitForPostToBeVisible(sharePostText);
        });

        // ==================== Engineering User (standardUserFixture) CANNOT see shared post on Home Feed ====================
        await test.step('Standard User (Engineering audience) navigates to Home Feed and verifies shared post is NOT visible', async () => {
          await standardUserFixture.navigationHelper.clickOnGlobalFeed();

          const standardUserHomeFeedPage = new FeedPage(standardUserFixture.page);
          await standardUserHomeFeedPage.reloadPageWithTimelineMode();
          await standardUserHomeFeedPage.feedList.verifyThePageIsLoadedWithTimelineMode();

          // Verify the shared post is NOT visible to Engineering user (Home Feed restricted to UX)
          await standardUserHomeFeedPage.feedList.verifyPostIsNotVisible(sharePostText);
        });

        // ==================== Engineering User cannot access shared Home Feed post via direct URL ====================
        await test.step('Standard User (Engineering) attempts direct URL access to shared Home Feed post and verifies Page not found', async () => {
          const directAccessFeedPage = new FeedPage(standardUserFixture.page, sharedPostId);
          await standardUserFixture.page.goto(directAccessFeedPage.url);

          await directAccessFeedPage.verifyPageNotFoundVisibility({
            stepInfo:
              'Verify Engineering user sees Page not found when accessing UX-restricted Home Feed post via direct URL',
          });
        });

        // ==================== FO can see shared post on Home Feed ====================
        await test.step('FO navigates to Home Feed and verifies shared post IS visible', async () => {
          await appManagerFixture.navigationHelper.clickOnGlobalFeed();

          const appManagerHomeFeedPage = new FeedPage(appManagerFixture.page);
          await appManagerHomeFeedPage.reloadPageWithTimelineMode();
          await appManagerHomeFeedPage.feedList.verifyThePageIsLoadedWithTimelineMode();

          // Verify the shared post IS visible to FO (creator/sharer always sees their posts)
          await appManagerHomeFeedPage.feedList.waitForPostToBeVisible(sharePostText);
        });
      }
    );

    test(
      'Verify FO can share a comment made on a Non-Restricted Content (Public Site) to Home Feed with No Restrictions',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, '@CONT-42200', '@FO-feed', '@share-restriction'],
      },
      async ({ appManagerFixture, appManagerApiFixture, standardUserFixture, socialCampaignManagerFixture }) => {
        tagTest(test.info(), {
          description:
            'ABAC: Verify FO can share a comment from a non-restricted Page to Home Feed without restrictions. The shared comment should be visible to all users.',
          zephyrTestId: 'CONT-42200',
          storyId: 'CONT-42200',
        });

        let pageId: string = '';
        let pageCommentText: string;
        let shareCommentText: string;
        let publicSiteId: string = '';
        let contentPreviewPage: ContentPreviewPage;

        // ==================== Get or create Public Site with Pages ====================
        await test.step('Get or create a Public Site with Pages', async () => {
          const publicSite = await appManagerApiFixture.siteManagementHelper.getSiteByAccessType(SITE_TYPES.PUBLIC, {
            hasPages: true,
            waitForSearchIndex: true,
          });
          publicSiteId = publicSite.siteId;
        });

        // ==================== FO creates a Page with No Restrictions on Public Site ====================
        await test.step('FO creates a Page with No Restrictions on Public Site', async () => {
          const pageInfo = await appManagerApiFixture.contentManagementHelper.createPage({
            siteId: publicSiteId,
            contentInfo: {
              contentType: 'page',
              contentSubType: 'news',
            },
            options: {
              waitForSearchIndex: false,
            },
          });
          pageId = pageInfo.contentId;
        });

        // ==================== FO navigates to Page and creates a comment ====================
        await test.step('FO navigates to Page and creates a comment', async () => {
          contentPreviewPage = new ContentPreviewPage(
            appManagerFixture.page,
            publicSiteId,
            pageId,
            ContentType.PAGE.toLowerCase()
          );
          await contentPreviewPage.loadPage();
          await contentPreviewPage.verifyThePageIsLoaded();

          // Create comment on the Page
          pageCommentText = TestDataGenerator.generateRandomText('Page Comment to share', 2, true);
          await contentPreviewPage.clickShareThoughtsButton();

          const createFeedPostComponent = new CreateFeedPostComponent(appManagerFixture.page);
          await createFeedPostComponent.createAndPost({ text: pageCommentText });

          // Verify comment is visible
          await contentPreviewPage.listFeedComponent.waitForPostToBeVisible(pageCommentText);
        });

        // ==================== FO shares the Page comment to Home Feed (NO restrictions) ====================
        await test.step('FO shares the Page comment to Home Feed WITHOUT Restricted Viewers', async () => {
          const feedPage = new FeedPage(appManagerFixture.page);
          await feedPage.feedList.clickShareIcon(pageCommentText);
          await feedPage.verifyShareModalIsOpen();

          const shareComponent = new ShareComponent(appManagerFixture.page);
          shareCommentText = TestDataGenerator.generateRandomText('Shared Page comment to Home Feed', 2, true);

          // Share to Home Feed (default option) WITHOUT limit visibility
          await shareComponent.enterShareDescription(shareCommentText);

          // Home Feed is the default - just click share
          await shareComponent.clickShareButtonAndGetPostId();

          // Verify share was successful
          await feedPage.feedList.verifyShareModalIsClosed();
        });

        // ==================== FO navigates to Home Feed and verifies shared comment IS visible ====================
        await test.step('FO navigates to Home Feed and verifies shared comment IS visible', async () => {
          await appManagerFixture.navigationHelper.clickOnGlobalFeed();

          const appManagerHomeFeedPage = new FeedPage(appManagerFixture.page);
          await appManagerHomeFeedPage.reloadPage();
          await appManagerHomeFeedPage.feedList.verifyThePageIsLoaded();

          // Verify the shared comment IS visible to FO
          await appManagerHomeFeedPage.feedList.waitForPostToBeVisible(shareCommentText);
        });

        // ==================== Standard User navigates to Home Feed and verifies shared comment IS visible ====================
        await test.step('Standard User navigates to Home Feed and verifies shared comment IS visible', async () => {
          await standardUserFixture.navigationHelper.clickOnGlobalFeed();

          const standardUserHomeFeedPage = new FeedPage(standardUserFixture.page);
          await standardUserHomeFeedPage.reloadPageWithTimelineMode();
          await standardUserHomeFeedPage.feedList.verifyThePageIsLoadedWithTimelineMode();

          // Verify the shared comment IS visible to Standard User
          await standardUserHomeFeedPage.feedList.waitForPostToBeVisible(shareCommentText);
        });

        // ==================== Social Campaign Manager navigates to Home Feed and verifies shared comment IS visible ====================
        await test.step('Social Campaign Manager navigates to Home Feed and verifies shared comment IS visible', async () => {
          await socialCampaignManagerFixture.navigationHelper.clickOnGlobalFeed();

          const scmHomeFeedPage = new FeedPage(socialCampaignManagerFixture.page);
          await scmHomeFeedPage.reloadPageWithTimelineMode();
          await scmHomeFeedPage.feedList.verifyThePageIsLoadedWithTimelineMode();

          // Verify the shared comment IS visible to Social Campaign Manager
          await scmHomeFeedPage.feedList.waitForPostToBeVisible(shareCommentText);
        });
      }
    );

    test(
      'Verify FO can share a comment made on a Non-Restricted Content (Public Site) to Home Feed with Restricted viewers (e.g., UX Designs)',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, '@CONT-42201', '@FO-feed', '@share-restriction'],
      },
      async ({ appManagerFixture, appManagerApiFixture, standardUserFixture, socialCampaignManagerFixture }) => {
        tagTest(test.info(), {
          description:
            'ABAC: Verify FO can share a comment from a non-restricted Page to Home Feed with Restricted Viewers (UX Designs). The shared comment should be visible only to the selected audience and FO.',
          zephyrTestId: 'CONT-42201',
          storyId: 'CONT-42201',
        });

        let pageId: string = '';
        let pageCommentText: string;
        let shareCommentText: string;
        let sharedCommentId: string = '';
        let publicSiteId: string = '';
        let contentPreviewPage: ContentPreviewPage;

        // ==================== Get or create Public Site with Pages ====================
        await test.step('Get or create a Public Site with Pages', async () => {
          const publicSite = await appManagerApiFixture.siteManagementHelper.getSiteByAccessType(SITE_TYPES.PUBLIC, {
            hasPages: true,
            waitForSearchIndex: true,
          });
          publicSiteId = publicSite.siteId;
        });

        // ==================== FO creates a Page with No Restrictions on Public Site ====================
        await test.step('FO creates a Page with No Restrictions on Public Site', async () => {
          const pageInfo = await appManagerApiFixture.contentManagementHelper.createPage({
            siteId: publicSiteId,
            contentInfo: {
              contentType: 'page',
              contentSubType: 'news',
            },
            options: {
              waitForSearchIndex: false,
            },
          });
          pageId = pageInfo.contentId;
        });

        // ==================== FO navigates to Page and creates a comment ====================
        await test.step('FO navigates to Page and creates a comment', async () => {
          contentPreviewPage = new ContentPreviewPage(
            appManagerFixture.page,
            publicSiteId,
            pageId,
            ContentType.PAGE.toLowerCase()
          );
          await contentPreviewPage.loadPage();
          await contentPreviewPage.verifyThePageIsLoaded();

          // Create comment on the Page
          pageCommentText = TestDataGenerator.generateRandomText('Page Comment to share with restriction', 2, true);
          await contentPreviewPage.clickShareThoughtsButton();

          const createFeedPostComponent = new CreateFeedPostComponent(appManagerFixture.page);
          await createFeedPostComponent.createAndPost({ text: pageCommentText });

          // Verify comment is visible
          await contentPreviewPage.listFeedComponent.waitForPostToBeVisible(pageCommentText);
        });

        // ==================== FO shares the Page comment to Home Feed WITH Restricted Viewers (UX Designs) ====================
        await test.step('FO shares the Page comment to Home Feed WITH Restricted Viewers (UX Designs)', async () => {
          const feedPage = new FeedPage(appManagerFixture.page);
          await feedPage.feedList.clickShareIcon(pageCommentText);
          await feedPage.verifyShareModalIsOpen();

          const shareComponent = new ShareComponent(appManagerFixture.page);
          shareCommentText = TestDataGenerator.generateRandomText(
            'Shared restricted Page comment to Home Feed',
            2,
            true
          );

          // Share to Home Feed (default option) WITH limit visibility (UX audience)
          await shareComponent.enterShareDescription(shareCommentText);
          await shareComponent.toggleLimitVisibility();
          await shareComponent.selectAudience('UX');

          sharedCommentId = await shareComponent.clickShareButtonAndGetPostId();

          // Verify share was successful
          await feedPage.feedList.verifyShareModalIsClosed();
        });

        // ==================== UX Designs User (socialCampaignManagerFixture) CAN see shared comment on Home Feed ====================
        await test.step('Social Campaign Manager (UX Designs audience) navigates to Home Feed and verifies shared comment IS visible', async () => {
          await socialCampaignManagerFixture.navigationHelper.clickOnGlobalFeed();

          const scmHomeFeedPage = new FeedPage(socialCampaignManagerFixture.page);
          await scmHomeFeedPage.reloadPageWithTimelineMode();
          await scmHomeFeedPage.feedList.verifyThePageIsLoadedWithTimelineMode();

          // Verify the shared comment IS visible to UX Designs user
          await scmHomeFeedPage.feedList.waitForPostToBeVisible(shareCommentText);
        });

        // ==================== Non-UX User (standardUserFixture) CANNOT see shared comment on Home Feed ====================
        await test.step('Standard User (NOT in UX Designs audience) navigates to Home Feed and verifies shared comment is NOT visible', async () => {
          await standardUserFixture.navigationHelper.clickOnGlobalFeed();

          const standardUserHomeFeedPage = new FeedPage(standardUserFixture.page);
          await standardUserHomeFeedPage.reloadPageWithTimelineMode();
          await standardUserHomeFeedPage.feedList.verifyThePageIsLoadedWithTimelineMode();

          // Verify the shared comment is NOT visible to non-UX user
          await standardUserHomeFeedPage.feedList.verifyPostIsNotVisible(shareCommentText);
        });

        // ==================== Non-UX User cannot access shared comment via direct URL ====================
        await test.step('Standard User (NOT in UX Designs) attempts direct URL access to shared comment and verifies Page not found', async () => {
          const directAccessFeedPage = new FeedPage(standardUserFixture.page, sharedCommentId);
          await standardUserFixture.page.goto(directAccessFeedPage.url);

          await directAccessFeedPage.verifyPageNotFoundVisibility({
            stepInfo:
              'Verify non-UX user sees Page not found when accessing UX-restricted shared comment via direct URL',
          });
        });

        // ==================== FO can see shared comment on Home Feed ====================
        await test.step('FO navigates to Home Feed and verifies shared comment IS visible', async () => {
          await appManagerFixture.navigationHelper.clickOnGlobalFeed();

          const appManagerHomeFeedPage = new FeedPage(appManagerFixture.page);
          await appManagerHomeFeedPage.reloadPage();
          await appManagerHomeFeedPage.feedList.verifyThePageIsLoaded();

          // Verify the shared comment IS visible to FO (creator/sharer always sees their content)
          await appManagerHomeFeedPage.feedList.waitForPostToBeVisible(shareCommentText);
        });
      }
    );

    test(
      'Verify FO can share a comment made on a Restricted Content (Public Site) to Home Feed with No Restrictions',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, '@CONT-42202', '@FO-feed', '@share-restriction'],
      },
      async ({ appManagerFixture, appManagerApiFixture, standardUserFixture, socialCampaignManagerFixture }) => {
        tagTest(test.info(), {
          description:
            'ABAC: Verify FO can share a comment from a restricted Page (Engineering audience) to Home Feed without restrictions. The shared comment should be visible to all users on Home Feed, even those who cannot access the original Page.',
          zephyrTestId: 'CONT-42202',
          storyId: 'CONT-42202',
        });

        let pageId: string = '';
        let pageCommentText: string;
        let shareCommentText: string;
        let publicSiteId: string = '';
        let engineeringAudienceId: string = '';
        let contentPreviewPage: ContentPreviewPage;

        // ==================== Get or create Public Site with Pages ====================
        await test.step('Get or create a Public Site with Pages', async () => {
          const publicSite = await appManagerApiFixture.siteManagementHelper.getSiteByAccessType(SITE_TYPES.PUBLIC, {
            hasPages: true,
            waitForSearchIndex: true,
          });
          publicSiteId = publicSite.siteId;
        });

        // ==================== Get Engineering audience ID ====================
        await test.step('Get Engineering audience ID', async () => {
          engineeringAudienceId =
            await appManagerApiFixture.audienceManagementHelper.getAudienceIdByName('Engineering');
        });

        // ==================== FO creates a Page with Restricted Viewers (Engineering) ====================
        await test.step('FO creates a Page with Restricted Viewers (Engineering audience) on Public Site', async () => {
          const pageInfo = await appManagerApiFixture.contentManagementHelper.createPage({
            siteId: publicSiteId,
            contentInfo: {
              contentType: 'page',
              contentSubType: 'news',
            },
            options: {
              waitForSearchIndex: false,
              targetAudience: [engineeringAudienceId],
              isRestricted: true,
            },
          });
          pageId = pageInfo.contentId;
        });

        // ==================== FO navigates to Page and creates a comment ====================
        await test.step('FO navigates to restricted Page and creates a comment', async () => {
          contentPreviewPage = new ContentPreviewPage(
            appManagerFixture.page,
            publicSiteId,
            pageId,
            ContentType.PAGE.toLowerCase()
          );
          await contentPreviewPage.loadPage();
          await contentPreviewPage.verifyThePageIsLoaded();

          // Create comment on the restricted Page
          pageCommentText = TestDataGenerator.generateRandomText('Comment on restricted Page', 2, true);
          await contentPreviewPage.clickShareThoughtsButton();

          const createFeedPostComponent = new CreateFeedPostComponent(appManagerFixture.page);
          await createFeedPostComponent.createAndPost({ text: pageCommentText });

          // Verify comment is visible
          await contentPreviewPage.listFeedComponent.waitForPostToBeVisible(pageCommentText);
        });

        // ==================== Engineering user (standardUser) CAN see the restricted Page and comment ====================
        await test.step('Engineering user (standardUser) navigates to restricted Page and verifies comment IS visible', async () => {
          const engineeringUserContentPreviewPage = new ContentPreviewPage(
            standardUserFixture.page,
            publicSiteId,
            pageId,
            ContentType.PAGE.toLowerCase()
          );
          await engineeringUserContentPreviewPage.loadPage();
          await engineeringUserContentPreviewPage.verifyThePageIsLoaded();

          // Verify the comment IS visible to Engineering user
          await engineeringUserContentPreviewPage.listFeedComponent.waitForPostToBeVisible(pageCommentText);
        });

        // ==================== Non-Engineering user (socialCampaignManager) CANNOT access the restricted Page ====================
        await test.step('Non-Engineering user (socialCampaignManager) attempts to access restricted Page and verifies Page not found', async () => {
          const nonEngineeringContentPreviewPage = new ContentPreviewPage(
            socialCampaignManagerFixture.page,
            publicSiteId,
            pageId,
            ContentType.PAGE.toLowerCase()
          );
          await socialCampaignManagerFixture.page.goto(nonEngineeringContentPreviewPage.url);

          await nonEngineeringContentPreviewPage.verifyPageNotAvailableVisibility({
            stepInfo: 'Verify non-Engineering user sees Page not available when accessing Engineering-restricted Page',
          });
        });

        // ==================== FO shares the Page comment to Home Feed WITHOUT restrictions ====================
        await test.step('FO shares the Page comment to Home Feed WITHOUT Restricted Viewers', async () => {
          // Navigate back to the Page as FO
          await contentPreviewPage.loadPage();
          await contentPreviewPage.verifyThePageIsLoaded();

          const feedPage = new FeedPage(appManagerFixture.page);
          await feedPage.feedList.clickShareIcon(pageCommentText);
          await feedPage.verifyShareModalIsOpen();

          const shareComponent = new ShareComponent(appManagerFixture.page);
          shareCommentText = TestDataGenerator.generateRandomText('Shared comment from restricted Page', 2, true);

          // Share to Home Feed (default option) WITHOUT limit visibility
          await shareComponent.enterShareDescription(shareCommentText);

          // Home Feed is the default - just click share (NO restrictions applied)
          await shareComponent.clickShareButtonAndGetPostId();

          // Verify share was successful
          await feedPage.feedList.verifyShareModalIsClosed();
        });

        // ==================== Non-Engineering user (socialCampaignManager) CAN see shared comment on Home Feed ====================
        await test.step('Non-Engineering user (socialCampaignManager) navigates to Home Feed and verifies shared comment IS visible', async () => {
          await socialCampaignManagerFixture.navigationHelper.clickOnGlobalFeed();

          const scmHomeFeedPage = new FeedPage(socialCampaignManagerFixture.page);
          await scmHomeFeedPage.reloadPageWithTimelineMode();
          await scmHomeFeedPage.feedList.verifyThePageIsLoadedWithTimelineMode();

          // Verify the shared comment IS visible to non-Engineering user (who couldn't see the original Page)
          await scmHomeFeedPage.feedList.waitForPostToBeVisible(shareCommentText);
        });

        // ==================== Engineering user (standardUser) CAN see shared comment on Home Feed ====================
        await test.step('Engineering user (standardUser) navigates to Home Feed and verifies shared comment IS visible', async () => {
          await standardUserFixture.navigationHelper.clickOnGlobalFeed();

          const standardUserHomeFeedPage = new FeedPage(standardUserFixture.page);
          await standardUserHomeFeedPage.reloadPageWithTimelineMode();
          await standardUserHomeFeedPage.feedList.verifyThePageIsLoadedWithTimelineMode();

          // Verify the shared comment IS visible to Engineering user
          await standardUserHomeFeedPage.feedList.waitForPostToBeVisible(shareCommentText);
        });

        // ==================== FO can see shared comment on Home Feed ====================
        await test.step('FO navigates to Home Feed and verifies shared comment IS visible', async () => {
          await appManagerFixture.navigationHelper.clickOnGlobalFeed();

          const appManagerHomeFeedPage = new FeedPage(appManagerFixture.page);
          await appManagerHomeFeedPage.reloadPageWithTimelineMode();
          await appManagerHomeFeedPage.feedList.verifyThePageIsLoadedWithTimelineMode();

          // Verify the shared comment IS visible to FO
          await appManagerHomeFeedPage.feedList.waitForPostToBeVisible(shareCommentText);
        });
      }
    );

    test(
      'Verify FO can share a comment made on a Restricted Content (Public Site) to Home Feed with Restricted viewers (UX Designs)',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, '@CONT-42203', '@FO-feed', '@share-restriction'],
      },
      async ({ appManagerFixture, appManagerApiFixture, standardUserFixture, socialCampaignManagerFixture }) => {
        tagTest(test.info(), {
          description:
            'ABAC: Verify FO can share a comment from a restricted Page (Engineering audience) to Home Feed with different Restricted Viewers (UX Designs). Validates inverse visibility - Engineering can see Page but NOT Home Feed share, UX can see Home Feed share but NOT Page.',
          zephyrTestId: 'CONT-42203',
          storyId: 'CONT-42203',
        });

        let pageId: string = '';
        let pageCommentText: string;
        let shareCommentText: string;
        let publicSiteId: string = '';
        let engineeringAudienceId: string = '';
        let contentPreviewPage: ContentPreviewPage;

        // ==================== Get or create Public Site with Pages ====================
        await test.step('Get or create a Public Site with Pages', async () => {
          const publicSite = await appManagerApiFixture.siteManagementHelper.getSiteByAccessType(SITE_TYPES.PUBLIC, {
            hasPages: true,
            waitForSearchIndex: true,
          });
          publicSiteId = publicSite.siteId;
        });

        // ==================== Get Engineering audience ID ====================
        await test.step('Get Engineering audience ID', async () => {
          engineeringAudienceId =
            await appManagerApiFixture.audienceManagementHelper.getAudienceIdByName('Engineering');
        });

        // ==================== FO creates a Page with Restricted Viewers (Engineering) ====================
        await test.step('FO creates a Page with Restricted Viewers (Engineering audience) on Public Site', async () => {
          const pageInfo = await appManagerApiFixture.contentManagementHelper.createPage({
            siteId: publicSiteId,
            contentInfo: {
              contentType: 'page',
              contentSubType: 'news',
            },
            options: {
              waitForSearchIndex: false,
              targetAudience: [engineeringAudienceId],
              isRestricted: true,
            },
          });
          pageId = pageInfo.contentId;
        });

        // ==================== FO navigates to Page and creates a comment ====================
        await test.step('FO navigates to restricted Page and creates a comment', async () => {
          contentPreviewPage = new ContentPreviewPage(
            appManagerFixture.page,
            publicSiteId,
            pageId,
            ContentType.PAGE.toLowerCase()
          );
          await contentPreviewPage.loadPage();
          await contentPreviewPage.verifyThePageIsLoaded();

          // Create comment on the restricted Page
          pageCommentText = TestDataGenerator.generateRandomText('Comment on restricted Page for UX share', 2, true);
          await contentPreviewPage.clickShareThoughtsButton();

          const createFeedPostComponent = new CreateFeedPostComponent(appManagerFixture.page);
          await createFeedPostComponent.createAndPost({ text: pageCommentText });

          // Verify comment is visible
          await contentPreviewPage.listFeedComponent.waitForPostToBeVisible(pageCommentText);
        });

        // ==================== Engineering user (standardUser) CAN see the restricted Page and comment ====================
        await test.step('Engineering user (standardUser) navigates to restricted Page and verifies comment IS visible', async () => {
          const engineeringUserContentPreviewPage = new ContentPreviewPage(
            standardUserFixture.page,
            publicSiteId,
            pageId,
            ContentType.PAGE.toLowerCase()
          );
          await engineeringUserContentPreviewPage.loadPage();
          await engineeringUserContentPreviewPage.verifyThePageIsLoaded();

          // Verify the comment IS visible to Engineering user
          await engineeringUserContentPreviewPage.listFeedComponent.waitForPostToBeVisible(pageCommentText);
        });

        // ==================== Non-Engineering user (socialCampaignManager) CANNOT access the restricted Page ====================
        await test.step('Non-Engineering user (socialCampaignManager) attempts to access restricted Page and verifies Page not available', async () => {
          const nonEngineeringContentPreviewPage = new ContentPreviewPage(
            socialCampaignManagerFixture.page,
            publicSiteId,
            pageId,
            ContentType.PAGE.toLowerCase()
          );
          await socialCampaignManagerFixture.page.goto(nonEngineeringContentPreviewPage.url);

          await nonEngineeringContentPreviewPage.verifyPageNotAvailableVisibility({
            stepInfo: 'Verify non-Engineering user sees Page not available when accessing Engineering-restricted Page',
          });
        });

        // ==================== FO shares the Page comment to Home Feed WITH UX Designs restrictions ====================
        await test.step('FO shares the Page comment to Home Feed WITH Restricted Viewers (UX Designs)', async () => {
          // Navigate back to the Page as FO
          await contentPreviewPage.loadPage();
          await contentPreviewPage.verifyThePageIsLoaded();

          const feedPage = new FeedPage(appManagerFixture.page);
          await feedPage.feedList.clickShareIcon(pageCommentText);
          await feedPage.verifyShareModalIsOpen();

          const shareComponent = new ShareComponent(appManagerFixture.page);
          shareCommentText = TestDataGenerator.generateRandomText('Shared restricted Page comment to UX', 2, true);

          // Share to Home Feed with UX Designs restriction
          await shareComponent.enterShareDescription(shareCommentText);
          await shareComponent.toggleLimitVisibility();
          await shareComponent.selectAudience('UX');

          await shareComponent.clickShareButtonAndGetPostId();

          // Verify share was successful
          await feedPage.feedList.verifyShareModalIsClosed();
        });

        // ==================== UX user (socialCampaignManager) CAN see shared comment on Home Feed ====================
        await test.step('UX user (socialCampaignManager) navigates to Home Feed and verifies shared comment IS visible', async () => {
          await socialCampaignManagerFixture.navigationHelper.clickOnGlobalFeed();

          const scmHomeFeedPage = new FeedPage(socialCampaignManagerFixture.page);
          await scmHomeFeedPage.reloadPageWithTimelineMode();
          await scmHomeFeedPage.feedList.verifyThePageIsLoadedWithTimelineMode();

          // Verify the shared comment IS visible to UX user (who couldn't see the original Page)
          await scmHomeFeedPage.feedList.waitForPostToBeVisible(shareCommentText);
        });

        // ==================== Engineering user (standardUser) CANNOT see shared comment on Home Feed (not in UX audience) ====================
        await test.step('Engineering user (standardUser) navigates to Home Feed and verifies shared comment is NOT visible', async () => {
          await standardUserFixture.navigationHelper.clickOnGlobalFeed();

          const standardUserHomeFeedPage = new FeedPage(standardUserFixture.page);
          await standardUserHomeFeedPage.reloadPageWithTimelineMode();
          await standardUserHomeFeedPage.feedList.verifyThePageIsLoadedWithTimelineMode();

          // Verify the shared comment is NOT visible to Engineering user (not in UX audience)
          await standardUserHomeFeedPage.feedList.verifyPostIsNotVisible(shareCommentText);
        });

        // ==================== FO can see shared comment on Home Feed ====================
        await test.step('FO navigates to Home Feed and verifies shared comment IS visible', async () => {
          await appManagerFixture.navigationHelper.clickOnGlobalFeed();

          const appManagerHomeFeedPage = new FeedPage(appManagerFixture.page);
          await appManagerHomeFeedPage.reloadPageWithTimelineMode();
          await appManagerHomeFeedPage.feedList.verifyThePageIsLoadedWithTimelineMode();

          // Verify the shared comment IS visible to FO
          await appManagerHomeFeedPage.feedList.waitForPostToBeVisible(shareCommentText);
        });
      }
    );

    test(
      'verify FO can share restricted (Engineering) Home Feed post to Private Site Feed without restrictions',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, '@CONT-42205', '@FO-feed', '@share-restriction'],
      },
      async ({ appManagerFixture, appManagerApiFixture, standardUserFixture, socialCampaignManagerFixture }) => {
        tagTest(test.info(), {
          description:
            'ABAC: Verify FO can share a Home Feed post (restricted to Engineering) to a Private Site Feed WITHOUT restrictions. Site Feed post should be visible to ALL Private Site members regardless of audience.',
          zephyrTestId: 'CONT-42205',
          storyId: 'CONT-42205',
        });

        let foPostText: string;
        let sharePostText: string;
        let privateSiteId: string = '';
        let privateSiteName: string = '';

        // ==================== Get or create Private Site ====================
        await test.step('Get or create a Private Site for sharing', async () => {
          const privateSite = await appManagerApiFixture.siteManagementHelper.getSiteByAccessType(SITE_TYPES.PRIVATE, {
            waitForSearchIndex: true,
          });
          privateSiteId = privateSite.siteId;
          privateSiteName = privateSite.name;
        });

        // ==================== FO creates Home Feed post WITH restrictions (Engineering) ====================
        await test.step('FO creates Home Feed post WITH Restricted Viewers (Engineering audience)', async () => {
          await appManagerFixture.navigationHelper.clickOnHomeIconButton();
          await appManagerFixture.navigationHelper.clickOnGlobalFeed();
          feedPage = new FeedPage(appManagerFixture.page);
          await feedPage.reloadPage();
          await feedPage.verifyThePageIsLoaded();

          foPostText = TestDataGenerator.generateRandomText('ABAC Restricted to Private Site Test', 3, true);
          await feedPage.clickShareThoughtsButton();

          const postResult = await feedPage.createAndPostWithLimitVisibility({
            text: foPostText,
            limitVisibility: {
              enabled: true,
              audience: 'Engineering',
            },
          });

          createdPostId = postResult.postId || '';
          await feedPage.feedList.waitForPostToBeVisible(postResult.postText);

          // Verify post HAS limit visibility (restricted to Engineering)
          await feedPage.postEditor.verifyPostHasLimitVisibility(foPostText);
        });

        // ==================== Engineering User can see restricted post on Home Feed ====================
        await test.step('Standard User (in Engineering audience) navigates to Home Feed and verifies post is visible', async () => {
          await standardUserFixture.navigationHelper.clickOnGlobalFeed();
          const standardUserFeedPage = new FeedPage(standardUserFixture.page);
          await standardUserFeedPage.reloadPageWithTimelineMode();
          await standardUserFeedPage.feedList.verifyThePageIsLoadedWithTimelineMode();

          // Verify the restricted post IS visible to Engineering user
          await standardUserFeedPage.feedList.waitForPostToBeVisible(foPostText);
        });

        // ==================== Non-Engineering User CANNOT see restricted post on Home Feed ====================
        await test.step('Social Campaign Manager (NOT in Engineering audience) navigates to Home Feed and verifies post is NOT visible', async () => {
          await socialCampaignManagerFixture.navigationHelper.clickOnGlobalFeed();
          const socialCampaignManagerFeedPage = new FeedPage(socialCampaignManagerFixture.page);
          await socialCampaignManagerFeedPage.reloadPageWithTimelineMode();
          await socialCampaignManagerFeedPage.feedList.verifyThePageIsLoadedWithTimelineMode();

          // Verify the restricted post is NOT visible to non-Engineering user on Home Feed
          await socialCampaignManagerFeedPage.feedList.verifyPostIsNotVisible(foPostText);
        });

        // ==================== FO shares to Private Site Feed WITHOUT restrictions ====================
        await test.step('FO shares restricted Home Feed post to Private Site Feed WITHOUT Restricted Viewers', async () => {
          await feedPage.feedList.clickShareIcon(foPostText);
          await feedPage.verifyShareModalIsOpen();

          const shareComponent = new ShareComponent(appManagerFixture.page);
          sharePostText = TestDataGenerator.generateRandomText('Shared to Private Site without restriction', 2, true);

          // Share to Private Site Feed WITHOUT enabling limit visibility
          await shareComponent.selectShareOptionAsSiteFeed();
          await shareComponent.enterSiteName(privateSiteName);
          await shareComponent.enterShareDescription(sharePostText);

          await shareComponent.clickShareButtonAndGetPostId();

          // Verify share was successful
          await feedPage.feedList.verifyShareModalIsClosed();
        });

        // ==================== Engineering User (Site Member) can see shared post on Private Site Feed ====================
        await test.step('Standard User (Engineering - Private Site member) navigates to Private Site Feed and verifies shared post is visible', async () => {
          const siteDashboardPage = new SiteDashboardPage(standardUserFixture.page, privateSiteId);
          await siteDashboardPage.loadPage();
          await siteDashboardPage.verifyThePageIsLoaded();

          await siteDashboardPage.clickOnFeedLink();

          const standardUserFeedPage = new FeedPage(standardUserFixture.page);
          await standardUserFeedPage.verifyThePageIsLoaded();

          // Verify the shared post IS visible to Engineering user on Private Site Feed
          await standardUserFeedPage.feedList.waitForPostToBeVisible(sharePostText);
        });

        // ==================== Non-Engineering User (Site Member) can ALSO see shared post on Private Site Feed ====================
        await test.step('Social Campaign Manager (Non-Engineering - Private Site member) navigates to Private Site Feed and verifies shared post IS visible', async () => {
          const socialCampaignManagerInfo = await appManagerApiFixture.identityManagementHelper.getUserInfoByEmail(
            users.socialCampaignManager.email
          );

          await appManagerApiFixture.siteManagementHelper.makeUserSiteMembership(
            privateSiteId,
            socialCampaignManagerInfo.userId,
            SitePermission.MEMBER,
            SiteMembershipAction.ADD
          );
          const siteDashboardPage = new SiteDashboardPage(socialCampaignManagerFixture.page, privateSiteId);
          await siteDashboardPage.loadPage();
          await siteDashboardPage.verifyThePageIsLoaded();

          await siteDashboardPage.clickOnFeedLink();

          const socialCampaignManagerFeedPage = new FeedPage(socialCampaignManagerFixture.page);
          await socialCampaignManagerFeedPage.verifyThePageIsLoaded();

          // Verify the shared post IS visible to non-Engineering user on Private Site Feed (no restriction on Site Feed)
          await socialCampaignManagerFeedPage.feedList.waitForPostToBeVisible(sharePostText);
          await appManagerApiFixture.siteManagementHelper.makeUserSiteMembership(
            privateSiteId,
            socialCampaignManagerInfo.userId,
            SitePermission.MEMBER,
            SiteMembershipAction.REMOVE
          );
        });

        // ==================== FO can see shared post on Private Site Feed ====================
        await test.step('FO navigates to Private Site Feed and verifies shared post IS visible', async () => {
          const siteDashboardPage = new SiteDashboardPage(appManagerFixture.page, privateSiteId);
          await siteDashboardPage.loadPage();
          await siteDashboardPage.verifyThePageIsLoaded();

          await siteDashboardPage.clickOnFeedLink();

          const foSiteFeedPage = new FeedPage(appManagerFixture.page);
          await foSiteFeedPage.verifyThePageIsLoaded();

          // Verify the shared post IS visible to FO on Private Site Feed
          await foSiteFeedPage.feedList.waitForPostToBeVisible(sharePostText);
        });
      }
    );

    test(
      'verify FO can share unrestricted Private Site Feed post to Home Feed with Restricted Viewers (UX Designs)',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, '@CONT-42207', '@FO-feed', '@share-restriction'],
      },
      async ({ appManagerFixture, appManagerApiFixture, standardUserFixture, socialCampaignManagerFixture }) => {
        tagTest(test.info(), {
          description:
            'ABAC: Verify FO can share an unrestricted Private Site Feed post to Home Feed with Restricted Viewers (UX Designs). Home Feed post should be visible only to UX audience, while Site Feed post remains visible to all members.',
          zephyrTestId: 'CONT-42207',
          storyId: 'CONT-42207',
        });

        let siteFeedPostText: string;
        let sharePostText: string;
        let sharedPostId: string = '';
        let privateSiteId: string = '';
        let siteDashboardPage: SiteDashboardPage;
        let siteFeedPage: FeedPage;

        // ==================== Get or create Private Site ====================
        await test.step('Get or create a Private Site', async () => {
          const privateSite = await appManagerApiFixture.siteManagementHelper.getSiteByAccessType(SITE_TYPES.PRIVATE, {
            waitForSearchIndex: true,
          });
          privateSiteId = privateSite.siteId;
        });

        // ==================== FO creates Private Site Feed post WITHOUT restrictions ====================
        await test.step('FO creates Private Site Feed post WITHOUT Restricted Viewers (unrestricted)', async () => {
          siteDashboardPage = new SiteDashboardPage(appManagerFixture.page, privateSiteId);
          await siteDashboardPage.loadPage();
          await siteDashboardPage.verifyThePageIsLoaded();

          await siteDashboardPage.clickOnFeedLink();

          siteFeedPage = new FeedPage(appManagerFixture.page);
          await siteFeedPage.verifyThePageIsLoaded();

          siteFeedPostText = TestDataGenerator.generateRandomText('ABAC Private Site to Home Share Test', 3, true);
          await siteFeedPage.clickShareThoughtsButton();

          const postResult = await siteFeedPage.postEditor.createAndPost({
            text: siteFeedPostText,
          });

          await siteFeedPage.feedList.waitForPostToBeVisible(postResult.postText);

          // Verify post does NOT have limit visibility (unrestricted)
          await siteFeedPage.postEditor.verifyPostHasLimitVisibility(siteFeedPostText);
        });

        // ==================== Standard User (Site Member) CAN see post on Private Site Feed ====================
        await test.step('Standard User (Site Member) navigates to Private Site Feed and verifies post IS visible', async () => {
          const standardUserInfo = await appManagerApiFixture.identityManagementHelper.getUserInfoByEmail(
            users.endUser.email
          );
          await appManagerApiFixture.siteManagementHelper.makeUserSiteMembership(
            privateSiteId,
            standardUserInfo.userId,
            SitePermission.MEMBER,
            SiteMembershipAction.ADD
          );
          const standardUserSiteDashboard = new SiteDashboardPage(standardUserFixture.page, privateSiteId);
          await standardUserSiteDashboard.loadPage();
          await standardUserSiteDashboard.verifyThePageIsLoaded();

          await standardUserSiteDashboard.clickOnFeedLink();

          const standardUserSiteFeedPage = new FeedPage(standardUserFixture.page);
          await standardUserSiteFeedPage.verifyThePageIsLoaded();

          // Verify the Site Feed post IS visible to member
          await standardUserSiteFeedPage.feedList.waitForPostToBeVisible(siteFeedPostText);
        });

        // ==================== FO shares Private Site Feed post to Home Feed WITH Restricted Viewers (UX Designs) ====================
        await test.step('FO shares Private Site Feed post to Home Feed WITH Restricted Viewers (UX Designs)', async () => {
          await siteFeedPage.feedList.waitForPostToBeVisible(siteFeedPostText);
          await siteFeedPage.feedList.clickShareIcon(siteFeedPostText);
          await siteFeedPage.verifyShareModalIsOpen();

          const shareComponent = new ShareComponent(appManagerFixture.page);
          sharePostText = TestDataGenerator.generateRandomText(
            'Shared Private Site post to Home with UX restriction',
            2,
            true
          );

          // Share to Home Feed (default option) WITH limit visibility
          await shareComponent.enterShareDescription(sharePostText);
          await shareComponent.toggleLimitVisibility();
          await shareComponent.selectAudience('UX');

          sharedPostId = await shareComponent.clickShareButtonAndGetPostId();

          // Verify share was successful
          await siteFeedPage.feedList.verifyShareModalIsClosed();
        });

        // ==================== UX Designs User (socialCampaignManager) CAN see shared post on Home Feed ====================
        await test.step('Social Campaign Manager (UX Designs audience) navigates to Home Feed and verifies shared post IS visible', async () => {
          await socialCampaignManagerFixture.navigationHelper.clickOnGlobalFeed();

          const socialCampaignManagerFeedPage = new FeedPage(socialCampaignManagerFixture.page);
          await socialCampaignManagerFeedPage.reloadPageWithTimelineMode();
          await socialCampaignManagerFeedPage.feedList.verifyThePageIsLoadedWithTimelineMode();

          // Verify the shared post IS visible to UX Designs user
          await socialCampaignManagerFeedPage.feedList.waitForPostToBeVisible(sharePostText);
        });

        // ==================== Non-UX User (standardUser) CANNOT see shared post on Home Feed ====================
        await test.step('Standard User (NOT in UX Designs audience) navigates to Home Feed and verifies shared post is NOT visible', async () => {
          await standardUserFixture.navigationHelper.clickOnGlobalFeed();

          const standardUserFeedPage = new FeedPage(standardUserFixture.page);
          await standardUserFeedPage.reloadPageWithTimelineMode();
          await standardUserFeedPage.feedList.verifyThePageIsLoadedWithTimelineMode();

          // Verify the shared post is NOT visible to non-UX user (Home Feed restricted to UX)
          await standardUserFeedPage.feedList.verifyPostIsNotVisible(sharePostText);
        });

        // ==================== Non-UX User cannot access shared post via direct URL ====================
        await test.step('Standard User (NOT in UX) attempts direct URL access to shared post and verifies Page not found', async () => {
          const directAccessFeedPage = new FeedPage(standardUserFixture.page, sharedPostId);
          await standardUserFixture.page.goto(directAccessFeedPage.url);

          await directAccessFeedPage.verifyPageNotFoundVisibility({
            stepInfo:
              'Verify non-UX user sees Page not found when accessing UX-restricted Home Feed post via direct URL',
          });
        });

        // ==================== FO can see shared post on Home Feed ====================
        await test.step('FO navigates to Home Feed and verifies shared post IS visible', async () => {
          await appManagerFixture.navigationHelper.clickOnGlobalFeed();

          const appManagerFeedPage = new FeedPage(appManagerFixture.page);
          await appManagerFeedPage.reloadPageWithTimelineMode();
          await appManagerFeedPage.feedList.verifyThePageIsLoadedWithTimelineMode();

          // Verify the shared post IS visible to FO (creator/sharer always sees their posts)
          await appManagerFeedPage.feedList.waitForPostToBeVisible(sharePostText);
        });
      }
    );

    test(
      'Verify FO can share a comment made on a Non-Restricted Content (Private Site) to Home Feed with No Restrictions',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, '@CONT-42210', '@FO-feed', '@share-restriction'],
      },
      async ({ appManagerFixture, appManagerApiFixture, standardUserFixture, socialCampaignManagerFixture }) => {
        tagTest(test.info(), {
          description:
            'ABAC: Verify FO can share a comment from a non-restricted Private Site Page to Home Feed without restrictions. The shared comment should be visible to all users on Home Feed, even non-members of the Private Site.',
          zephyrTestId: 'CONT-42210',
          storyId: 'CONT-42210',
        });

        let pageId: string = '';
        let pageCommentText: string;
        let shareCommentText: string;
        let privateSiteId: string = '';
        let contentPreviewPage: ContentPreviewPage;

        // ==================== Get or create Private Site with Pages ====================
        await test.step('Get or create a Private Site with Pages', async () => {
          const privateSite = await appManagerApiFixture.siteManagementHelper.getSiteByAccessType(SITE_TYPES.PRIVATE, {
            hasPages: true,
            waitForSearchIndex: true,
          });
          privateSiteId = privateSite.siteId;
        });

        // ==================== FO creates a Page with No Restrictions on Private Site ====================
        await test.step('FO creates a Page with No Restrictions on Private Site', async () => {
          const pageInfo = await appManagerApiFixture.contentManagementHelper.createPage({
            siteId: privateSiteId,
            contentInfo: {
              contentType: 'page',
              contentSubType: 'news',
            },
            options: {
              waitForSearchIndex: false,
            },
          });
          pageId = pageInfo.contentId;
        });

        // ==================== FO navigates to Page and creates a comment ====================
        await test.step('FO navigates to Private Site Page and creates a comment', async () => {
          contentPreviewPage = new ContentPreviewPage(
            appManagerFixture.page,
            privateSiteId,
            pageId,
            ContentType.PAGE.toLowerCase()
          );
          await contentPreviewPage.loadPage();
          await contentPreviewPage.verifyThePageIsLoaded();

          // Create comment on the Page
          pageCommentText = TestDataGenerator.generateRandomText('Private Site Page Comment', 2, true);
          await contentPreviewPage.clickShareThoughtsButton();

          const createFeedPostComponent = new CreateFeedPostComponent(appManagerFixture.page);
          await createFeedPostComponent.createAndPost({ text: pageCommentText });

          // Verify comment is visible
          await contentPreviewPage.listFeedComponent.waitForPostToBeVisible(pageCommentText);
        });

        // ==================== Member (Standard User) CAN access Private Site Page and see comment ====================
        await test.step('Member (Standard User) navigates to Private Site Page and verifies comment IS visible', async () => {
          const standardUserInfo = await appManagerApiFixture.identityManagementHelper.getUserInfoByEmail(
            users.endUser.email
          );

          await appManagerApiFixture.siteManagementHelper.makeUserSiteMembership(
            privateSiteId,
            standardUserInfo.userId,
            SitePermission.MEMBER,
            SiteMembershipAction.ADD
          );

          const memberContentPreviewPage = new ContentPreviewPage(
            standardUserFixture.page,
            privateSiteId,
            pageId,
            ContentType.PAGE.toLowerCase()
          );
          await memberContentPreviewPage.loadPage();
          await memberContentPreviewPage.verifyThePageIsLoaded();

          // Verify the comment IS visible to member
          await memberContentPreviewPage.listFeedComponent.waitForPostToBeVisible(pageCommentText);
        });

        // ==================== Non-Member (Social Campaign Manager) CANNOT access Private Site Page ====================
        await test.step('Non-Member (Social Campaign Manager) attempts to access Private Site Page and verifies Page not found', async () => {
          const nonMemberContentPreviewPage = new ContentPreviewPage(
            socialCampaignManagerFixture.page,
            privateSiteId,
            pageId,
            ContentType.PAGE.toLowerCase()
          );
          await socialCampaignManagerFixture.page.goto(nonMemberContentPreviewPage.url);

          await nonMemberContentPreviewPage.verifyRequestMembershipPageVisibility();
        });

        // ==================== FO shares the Page comment to Home Feed (NO restrictions) ====================
        await test.step('FO shares the Page comment to Home Feed WITHOUT Restricted Viewers', async () => {
          // Navigate back to the Page as FO
          await contentPreviewPage.loadPage();
          await contentPreviewPage.verifyThePageIsLoaded();

          const feedPage = new FeedPage(appManagerFixture.page);
          await feedPage.feedList.clickShareIcon(pageCommentText);
          await feedPage.verifyShareModalIsOpen();

          const shareComponent = new ShareComponent(appManagerFixture.page);
          shareCommentText = TestDataGenerator.generateRandomText('Shared Private Site comment to Home Feed', 2, true);

          // Share to Home Feed (default option) WITHOUT limit visibility
          await shareComponent.enterShareDescription(shareCommentText);

          // Home Feed is the default - just click share (NO restrictions applied)
          await shareComponent.clickShareButtonAndGetPostId();

          // Verify share was successful
          await feedPage.feedList.verifyShareModalIsClosed();
        });

        // ==================== Non-Member (Social Campaign Manager) CAN see shared comment on Home Feed ====================
        await test.step('Non-Member (Social Campaign Manager) navigates to Home Feed and verifies shared comment IS  visible', async () => {
          await socialCampaignManagerFixture.navigationHelper.clickOnGlobalFeed();

          const scmHomeFeedPage = new FeedPage(socialCampaignManagerFixture.page);
          await scmHomeFeedPage.reloadPageWithTimelineMode();
          await scmHomeFeedPage.feedList.verifyThePageIsLoadedWithTimelineMode();

          // Verify the shared comment IS visible to non-member (who couldn't access the original Private Site Page)
          await scmHomeFeedPage.feedList.waitForPostToBeVisible(shareCommentText);
        });

        // ==================== Member (Standard User) CAN see shared comment on Home Feed ====================
        await test.step('Member (Standard User) navigates to Home Feed and verifies shared comment IS visible', async () => {
          await standardUserFixture.navigationHelper.clickOnGlobalFeed();

          const standardUserHomeFeedPage = new FeedPage(standardUserFixture.page);
          await standardUserHomeFeedPage.reloadPageWithTimelineMode();
          await standardUserHomeFeedPage.feedList.verifyThePageIsLoadedWithTimelineMode();

          // Verify the shared comment IS visible to member
          await standardUserHomeFeedPage.feedList.waitForPostToBeVisible(shareCommentText);
        });

        // ==================== FO can see shared comment on Home Feed ====================
        await test.step('FO navigates to Home Feed and verifies shared comment IS visible', async () => {
          await appManagerFixture.navigationHelper.clickOnGlobalFeed();

          const appManagerHomeFeedPage = new FeedPage(appManagerFixture.page);
          await appManagerHomeFeedPage.reloadPage();
          await appManagerHomeFeedPage.feedList.verifyThePageIsLoaded();

          // Verify the shared comment IS visible to FO
          await appManagerHomeFeedPage.feedList.waitForPostToBeVisible(shareCommentText);
        });
      }
    );
  }
);
