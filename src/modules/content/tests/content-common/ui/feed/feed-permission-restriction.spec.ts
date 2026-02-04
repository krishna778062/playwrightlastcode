import { FeedPostingPermission } from '@content/constants/feedPostingPermission';
import { SitePageTab } from '@content/constants/sitePageEnums';
import { SITE_TYPES } from '@content/constants/siteTypes';
import { ContentTestSuite } from '@content/constants/testSuite';
import { contentTestFixture as test, users } from '@content/fixtures/contentFixture';
import { ManageSitePage } from '@content/ui/pages/manageSitePage';
import { SiteDashboardPage } from '@content/ui/pages/sitePages/siteDashboardPage';
import { TestPriority } from '@core/constants/testPriority';
import { TestGroupType } from '@core/constants/testType';
import { SiteMembershipAction, SitePermission } from '@core/types/siteManagement.types';
import { NewHomePage } from '@core/ui/pages/newHomePage';
import { TestDataGenerator } from '@core/utils/testDataGenerator';
import { tagTest } from '@core/utils/testDecorator';

import { PAGE_ENDPOINTS } from '@/src/core/constants/pageEndpoints';
import { FEED_TEST_DATA } from '@/src/modules/content/test-data/feed.test-data';

test.describe(
  '@FeedPost - Restrict feed posting permission to managers only',
  {
    tag: [ContentTestSuite.FEED_STANDARD_USER, '@feed-permission-restriction', ContentTestSuite.FEED],
  },
  () => {
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
        tag: [TestPriority.P1, TestGroupType.REGRESSION, '@CONT-37172'],
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

        // Remove user as from the site
        await appManagerApiFixture.siteManagementHelper.makeUserSiteMembership(
          publicSiteId,
          userId,
          SitePermission.MEMBER,
          SiteMembershipAction.REMOVE
        );

        // As Site Content Manager
        await appManagerApiFixture.siteManagementHelper.makeUserSiteMembership(
          publicSiteId,
          userId,
          SitePermission.MEMBER,
          SiteMembershipAction.ADD
        );
        const publicSiteDashboard = new SiteDashboardPage(standardUserFixture.page, publicSiteId);
        await publicSiteDashboard.loadPage();
        await publicSiteDashboard.verifyFeedRestrictionMessageVisible(FEED_TEST_DATA.RESTRICTION_MESSAGE);

        // As Member
        await appManagerApiFixture.siteManagementHelper.makeUserSiteMembership(
          publicSiteId,
          userId,
          SitePermission.CONTENT_MANAGER,
          SiteMembershipAction.SET_PERMISSION
        );

        await publicSiteDashboard.reloadPage();
        await publicSiteDashboard.verifyFeedRestrictionMessageVisible(FEED_TEST_DATA.RESTRICTION_MESSAGE);

        const privateSite = await appManagerApiFixture.siteManagementHelper.getSiteByAccessType(SITE_TYPES.PRIVATE, {
          waitForSearchIndex: false,
        });
        const privateSiteId = privateSite.siteId;

        // Use UI automation to set feed posting permission
        const managePrivateSitePage = new ManageSitePage(appManagerFixture.page, privateSiteId);
        await managePrivateSitePage.goToUrl(PAGE_ENDPOINTS.MANAGE_SITE_SETUP_PAGE(privateSiteId));
        await managePrivateSitePage.clickDashboardAndFeedTab();
        await managePrivateSitePage.setFeedPostingPermission(FeedPostingPermission.MANAGERS_ONLY);

        // Remove user as from the site
        await appManagerApiFixture.siteManagementHelper.makeUserSiteMembership(
          privateSiteId,
          userId,
          SitePermission.MEMBER,
          SiteMembershipAction.REMOVE
        );

        // As Site Content Manager
        await appManagerApiFixture.siteManagementHelper.makeUserSiteMembership(
          privateSiteId,
          userId,
          SitePermission.MEMBER,
          SiteMembershipAction.ADD
        );
        const privateSiteDashboard = new SiteDashboardPage(standardUserFixture.page, privateSiteId);
        await privateSiteDashboard.loadPage();
        await privateSiteDashboard.verifyFeedRestrictionMessageVisible(FEED_TEST_DATA.RESTRICTION_MESSAGE);

        //As Member
        await appManagerApiFixture.siteManagementHelper.makeUserSiteMembership(
          privateSiteId,
          userId,
          SitePermission.CONTENT_MANAGER,
          SiteMembershipAction.SET_PERMISSION
        );
        await privateSiteDashboard.reloadPage();
        await privateSiteDashboard.verifyFeedRestrictionMessageVisible(FEED_TEST_DATA.RESTRICTION_MESSAGE);

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

        // Remove user as from the site
        await appManagerApiFixture.siteManagementHelper.makeUserSiteMembership(
          unlistedSiteId,
          userId,
          SitePermission.MEMBER,
          SiteMembershipAction.REMOVE
        );

        // As Site Content Manager
        await appManagerApiFixture.siteManagementHelper.makeUserSiteMembership(
          unlistedSiteId,
          userId,
          SitePermission.MEMBER,
          SiteMembershipAction.ADD
        );
        const unlistedSiteDashboard = new SiteDashboardPage(standardUserFixture.page, unlistedSiteId);
        await unlistedSiteDashboard.loadPage();
        await unlistedSiteDashboard.verifyFeedRestrictionMessageVisible(FEED_TEST_DATA.RESTRICTION_MESSAGE);

        // As Member
        await appManagerApiFixture.siteManagementHelper.makeUserSiteMembership(
          unlistedSiteId,
          userId,
          SitePermission.CONTENT_MANAGER,
          SiteMembershipAction.SET_PERMISSION
        );
        await unlistedSiteDashboard.reloadPage();
        await unlistedSiteDashboard.verifyFeedRestrictionMessageVisible(FEED_TEST_DATA.RESTRICTION_MESSAGE);
      }
    );

    test(
      'verify Site Owner and Site Manager can create feed post on Public Site Dashboard when feed permission is set to managersOnly CONT-41198',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, '@CONT-37170'],
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
        await siteDashboard.verifyFeedSectionIsVisible();

        // Click "Share your thoughts" button
        await siteDashboard.clickShareThoughtsButton();

        // Generate post text
        const siteManagerPostText = TestDataGenerator.generateRandomText('Site Manager Post', 3, true);

        // Create feed post
        const siteManagerCreateFeedPostComponent = siteDashboard.createFeedPostComponent;
        const siteManagerPostResult = await siteManagerCreateFeedPostComponent.createAndPost({
          text: siteManagerPostText,
        });

        // Store post ID for cleanup
        if (siteManagerPostResult.postId) {
          createdPostIds.push(siteManagerPostResult.postId);
        }

        // Verify post is successfully created and visible on dashboard
        await siteDashboard.validatePostText(siteManagerPostResult.postText);
        await siteDashboard.listFeedComponent.waitForPostToBeVisible(siteManagerPostResult.postText);

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
        await siteDashboard.verifyFeedSectionIsVisible();

        // Click "Share your thoughts" button
        await siteDashboard.clickShareThoughtsButton();

        // Generate post text
        const siteOwnerPostText = TestDataGenerator.generateRandomText('Site Owner Post', 3, true);

        // Create feed post
        const createFeedPostComponent = siteDashboard.createFeedPostComponent;
        const siteOwnerPostResult = await createFeedPostComponent.createAndPost({
          text: siteOwnerPostText,
        });

        // Store post ID for cleanup
        if (siteOwnerPostResult.postId) {
          createdPostIds.push(siteOwnerPostResult.postId);
        }

        // Verify post is successfully created and visible on dashboard
        await siteDashboard.validatePostText(siteOwnerPostResult.postText);
        await siteDashboard.listFeedComponent.waitForPostToBeVisible(siteOwnerPostResult.postText);
      }
    );
  }
);
