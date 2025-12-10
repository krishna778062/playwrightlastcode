import { FeedPostingPermission } from '@content/constants/feedPostingPermission';
import { SitePageTab } from '@content/constants/sitePageEnums';
import { SITE_TYPES } from '@content/constants/siteTypes';
import { ContentTestSuite } from '@content/constants/testSuite';
import { contentTestFixture as test, users } from '@content/fixtures/contentFixture';
import { ManageSitePage } from '@content/ui/pages/manageSitePage';
import { SiteDashboardPage } from '@content/ui/pages/sitePages/siteDashboardPage';
import { TestPriority } from '@core/constants/testPriority';
import { TestGroupType } from '@core/constants/testType';
import { SitePermission } from '@core/types/siteManagement.types';
import { NewHomePage } from '@core/ui/pages/newHomePage';
import { TestDataGenerator } from '@core/utils/testDataGenerator';
import { tagTest } from '@core/utils/testDecorator';

import { PAGE_ENDPOINTS } from '@/src/core/constants/pageEndpoints';
import { FEED_TEST_DATA } from '@/src/modules/content/test-data/feed.test-data';

test.describe(
  '@FeedPost - Restrict feed posting permission to managers only',
  {
    tag: [ContentTestSuite.FEED_STANDARD_USER, '@feed-permission-restriction'],
  },
  () => {
    const verifyRestrictionForUser = async (siteId: string, page: any) => {
      const siteDashboard = new SiteDashboardPage(page, siteId);
      await siteDashboard.navigateToTab(SitePageTab.DashboardTab);
      // Verify that restriction message is visible on dashboard
      await siteDashboard.assertions.verifyFeedRestrictionMessageVisible(FEED_TEST_DATA.RESTRICTION_MESSAGE);
    };
    const createdPostIds: string[] = [];

    test.afterEach(async ({ appManagerFixture }) => {
      // Cleanup: Delete all posts using API if test failed and posts still exist
      for (const postId of createdPostIds) {
        if (postId) {
          try {
            await appManagerFixture.feedManagementHelper.deleteFeed(postId);
          } catch (error) {
            console.log(`Failed to cleanup feed ${postId} via API:`, error);
          }
        }
      }
      createdPostIds.length = 0; // Clear the array
    });

    test(
      'public | private | unlisted | SCM and Member see restriction message on dashboard',
      {
        tag: [
          TestPriority.P1,
          TestGroupType.REGRESSION,
          '@Public_Site_Permission_Restriction @Private_Site_Permission_Restriction @Unlisted_Site_Permission_Restriction',
        ],
      },
      async ({ appManagerApiFixture, appManagerFixture, standardUserFixture }) => {
        tagTest(test.info(), {
          description: 'SCM and Member see restriction message on dashboard for public',
          zephyrTestId: 'CONT-37172',
          storyId: 'CONT-37172',
        });

        const { userId } = await appManagerApiFixture.identityManagementHelper.getUserInfoByEmail(users.endUser.email);

        const publicSite = await appManagerApiFixture.siteManagementHelper.getSiteByAccessType(SITE_TYPES.PUBLIC, {
          waitForSearchIndex: false,
        });
        const publicSiteId = publicSite.siteId;

        // Use UI automation to set feed posting permission
        const manageSitePage = new ManageSitePage(appManagerFixture.page, publicSiteId);
        await manageSitePage.goToUrl(PAGE_ENDPOINTS.MANAGE_SITE_SETUP_PAGE(publicSiteId));
        await manageSitePage.clickDashboardAndFeedTab();
        await manageSitePage.setFeedPostingPermission(FeedPostingPermission.MANAGERS_ONLY);

        // As Site Content Manager
        await appManagerApiFixture.siteManagementHelper.updateUserSiteMembershipWithRole({
          siteId: publicSiteId,
          userId,
          role: SitePermission.CONTENT_MANAGER,
        });
        await verifyRestrictionForUser(publicSiteId, standardUserFixture.page);

        // As Member
        await appManagerApiFixture.siteManagementHelper.updateUserSiteMembershipWithRole({
          siteId: publicSiteId,
          userId,
          role: SitePermission.MEMBER,
        });
        await verifyRestrictionForUser(publicSiteId, standardUserFixture.page);

        const privateSite = await appManagerApiFixture.siteManagementHelper.getSiteByAccessType(SITE_TYPES.PRIVATE, {
          waitForSearchIndex: false,
        });
        const privateSiteId = privateSite.siteId;

        // Use UI automation to set feed posting permission
        const managePrivateSitePage = new ManageSitePage(appManagerFixture.page, privateSiteId);
        await managePrivateSitePage.goToUrl(PAGE_ENDPOINTS.MANAGE_SITE_SETUP_PAGE(privateSiteId));
        await managePrivateSitePage.clickDashboardAndFeedTab();
        await managePrivateSitePage.setFeedPostingPermission(FeedPostingPermission.MANAGERS_ONLY);

        // As Site Content Manager
        await appManagerApiFixture.siteManagementHelper.updateUserSiteMembershipWithRole({
          siteId: privateSiteId,
          userId,
          role: SitePermission.CONTENT_MANAGER,
        });
        await verifyRestrictionForUser(privateSiteId, standardUserFixture.page);

        //As Member
        await appManagerApiFixture.siteManagementHelper.updateUserSiteMembershipWithRole({
          siteId: privateSiteId,
          userId,
          role: SitePermission.MEMBER,
        });
        await verifyRestrictionForUser(privateSiteId, standardUserFixture.page);

        // Unlisted sites don't appear in public search, so skip waitForSearchIndex to avoid timeout
        const unlistedSite = await appManagerApiFixture.siteManagementHelper.getSiteByAccessType(SITE_TYPES.UNLISTED, {
          waitForSearchIndex: false,
        });
        const unlistedSiteId = unlistedSite.siteId;

        // Use UI automation to set feed posting permission
        const manageUnlistedSitePage = new ManageSitePage(appManagerFixture.page, unlistedSiteId);
        await manageUnlistedSitePage.goToUrl(PAGE_ENDPOINTS.MANAGE_SITE_SETUP_PAGE(unlistedSiteId));
        await manageUnlistedSitePage.clickDashboardAndFeedTab();
        await manageUnlistedSitePage.setFeedPostingPermission(FeedPostingPermission.MANAGERS_ONLY);

        // As Site Content Manager
        await appManagerApiFixture.siteManagementHelper.updateUserSiteMembershipWithRole({
          siteId: unlistedSiteId,
          userId,
          role: SitePermission.CONTENT_MANAGER,
        });
        await verifyRestrictionForUser(unlistedSiteId, standardUserFixture.page);

        // As Member
        await appManagerApiFixture.siteManagementHelper.updateUserSiteMembershipWithRole({
          siteId: unlistedSiteId,
          userId,
          role: SitePermission.MEMBER,
        });
        await verifyRestrictionForUser(unlistedSiteId, standardUserFixture.page);
      }
    );

    test(
      'verify Site Owner and Site Manager can create feed post on Public Site Dashboard when feed permission is set to managersOnly',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, '@CONT-41198'],
      },
      async ({ appManagerApiFixture, appManagerFixture, standardUserFixture }) => {
        tagTest(test.info(), {
          description:
            'Verify Site Owner and Site Manager can create feed post on Public Site Dashboard when feed permission is set to "Only site owners and site managers can make feed posts"',
          zephyrTestId: 'CONT-37170',
          storyId: 'CONT-37170',
        });

        // Get user ID for the end user
        const { userId } = await appManagerApiFixture.identityManagementHelper.getUserInfoByEmail(users.endUser.email);

        // Create Public Site
        const publicSite = await appManagerApiFixture.siteManagementHelper.createPublicSite({
          waitForSearchIndex: false,
        });
        const publicSiteId = publicSite.siteId;

        // Set feed posting permission to 'managersOnly' using UI automation
        const manageSitePage = new ManageSitePage(appManagerFixture.page, publicSiteId);
        await manageSitePage.goToUrl(PAGE_ENDPOINTS.MANAGE_SITE_SETUP_PAGE(publicSiteId));
        await manageSitePage.clickDashboardAndFeedTab();
        await manageSitePage.setFeedPostingPermission(FeedPostingPermission.MANAGERS_ONLY);

        // ==================== SCENARIO 1: Site Manager can create feed post ====================
        // Reset page to home before navigation to ensure clean state
        await new NewHomePage(appManagerFixture.page).loadPage();
        await new NewHomePage(standardUserFixture.page).loadPage();

        // Assign user as Site Manager
        await appManagerApiFixture.siteManagementHelper.updateUserSiteMembershipWithRole({
          siteId: publicSiteId,
          userId,
          role: SitePermission.MANAGER,
        });

        // Navigate to Public Site Dashboard as Site Manager
        let siteDashboard = new SiteDashboardPage(standardUserFixture.page, publicSiteId);
        await siteDashboard.navigateToTab(SitePageTab.DashboardTab);
        await siteDashboard.verifyThePageIsLoaded();

        // Verify "Share your thoughts" button is visible
        await siteDashboard.assertions.verifyFeedSectionIsVisible();

        // Click "Share your thoughts" button
        await siteDashboard.actions.clickShareThoughtsButton();

        // Generate post text
        const siteManagerPostText = TestDataGenerator.generateRandomText('Site Manager Post', 3, true);

        // Create feed post
        const siteManagerCreateFeedPostComponent = siteDashboard['createFeedPostComponent'];
        const siteManagerPostResult = await siteManagerCreateFeedPostComponent.createAndPost({
          text: siteManagerPostText,
        });

        // Store post ID for cleanup
        if (siteManagerPostResult.postId) {
          createdPostIds.push(siteManagerPostResult.postId);
        }

        // Verify post is successfully created and visible on dashboard
        await siteDashboard.assertions.validatePostText(siteManagerPostResult.postText);
        await siteDashboard['listFeedComponent'].waitForPostToBeVisible(siteManagerPostResult.postText);

        // ==================== SCENARIO 2: Site Owner can create feed post ====================
        // Make the user a Site Owner in last because once the user role is set to Site Owner, the after that we cannot change the role of the user
        // Assign user as Site Owner
        await appManagerApiFixture.siteManagementHelper.updateUserSiteMembershipWithRole({
          siteId: publicSiteId,
          userId,
          role: SitePermission.OWNER,
        });

        // Navigate to Public Site Dashboard as Site Owner
        siteDashboard = new SiteDashboardPage(standardUserFixture.page, publicSiteId);
        await siteDashboard.navigateToTab(SitePageTab.DashboardTab);
        await siteDashboard.verifyThePageIsLoaded();

        // Verify "Share your thoughts" button is visible
        await siteDashboard.assertions.verifyFeedSectionIsVisible();

        // Click "Share your thoughts" button
        await siteDashboard.actions.clickShareThoughtsButton();

        // Generate post text
        const siteOwnerPostText = TestDataGenerator.generateRandomText('Site Owner Post', 3, true);

        // Create feed post
        const createFeedPostComponent = siteDashboard['createFeedPostComponent'];
        const siteOwnerPostResult = await createFeedPostComponent.createAndPost({
          text: siteOwnerPostText,
        });

        // Store post ID for cleanup
        if (siteOwnerPostResult.postId) {
          createdPostIds.push(siteOwnerPostResult.postId);
        }

        // Verify post is successfully created and visible on dashboard
        await siteDashboard.assertions.validatePostText(siteOwnerPostResult.postText);
        await siteDashboard['listFeedComponent'].waitForPostToBeVisible(siteOwnerPostResult.postText);
      }
    );
  }
);
