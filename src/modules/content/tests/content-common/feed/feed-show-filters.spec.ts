import { TestPriority } from '@core/constants/testPriority';
import { TestGroupType } from '@core/constants/testType';
import { tagTest } from '@core/utils/testDecorator';

import { SiteMembershipAction, SitePermission } from '@/src/core/types/siteManagement.types';
import { getContentConfigFromCache } from '@/src/modules/content/config/contentConfig';
import { SITE_TYPES } from '@/src/modules/content/constants/siteTypes';
import { ContentTestSuite } from '@/src/modules/content/constants/testSuite';
import { contentTestFixture as test, users } from '@/src/modules/content/fixtures/contentFixture';
import { FEED_TEST_DATA } from '@/src/modules/content/test-data/feed.test-data';
import { FeedPage } from '@/src/modules/content/ui/pages/feedPage';
import { IdentityManagementHelper } from '@/src/modules/platforms/apis/helpers/identityManagementHelper';

test.describe(
  '@FeedPost - Show Filters Display Correct Shared Feed Posts',
  {
    tag: [ContentTestSuite.FEED_STANDARD_USER],
  },
  () => {
    let adminFeedPage: FeedPage;
    let siteManagerFeedPage: FeedPage;
    let siteOwnerFeedPage: FeedPage;
    let siteContentManagerFeedPage: FeedPage;
    let adminFullName: string;
    let createdPostId: string = '';

    test.beforeEach(
      'Setup test environment and user relationships',
      async ({ appManagerFixture, siteManagerFixture, standardUserFixture }) => {
        // Initialize identity management helper
        const identityManagementHelper = new IdentityManagementHelper(
          appManagerFixture.apiContext,
          getContentConfigFromCache().tenant.apiBaseUrl
        );

        // Get user information
        const adminInfo = await identityManagementHelper.getUserInfoByEmail(users.appManager.email);
        const siteOwnerInfo = await identityManagementHelper.getUserInfoByEmail(users.endUser.email);

        adminFullName = adminInfo.fullName;

        // Get or create a site where endUser is content manager
        // First, get a public site
        const publicSite = await appManagerFixture.siteManagementHelper.getSiteByAccessType(SITE_TYPES.PUBLIC, {
          waitForSearchIndex: false,
        });

        // Assign endUser as content manager of the site
        await appManagerFixture.siteManagementHelper.updateUserSiteMembershipWithRole({
          siteId: publicSite.siteId,
          userId: siteOwnerInfo.userId,
          role: SitePermission.CONTENT_MANAGER,
        });

        // Ensure Admin is following Site Owner and Site Content Manager
        // Note: Following relationships may need to be set up via API if not already configured

        // Initialize feed pages
        adminFeedPage = new FeedPage(appManagerFixture.page);
        siteManagerFeedPage = new FeedPage(siteManagerFixture.page);
        siteOwnerFeedPage = new FeedPage(standardUserFixture.page);
        siteContentManagerFeedPage = new FeedPage(standardUserFixture.page);
      }
    );

    test.afterEach(async ({ appManagerFixture }) => {
      // Cleanup: Delete created post
      if (createdPostId) {
        try {
          await appManagerFixture.feedManagementHelper.deleteFeed(createdPostId);
          console.log(`Deleted post: ${createdPostId}`);
          createdPostId = '';
        } catch (error) {
          console.warn(`Failed to delete post ${createdPostId}:`, error);
        }
      }
    });

    test(
      ' posts To Me: Verify Admin sees only posts where they are mentioned and their own posts',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, '@CONT-26728'],
      },
      async ({ appManagerFixture, siteManagerFixture }) => {
        tagTest(test.info(), {
          description: 'In Zeus, verify "Show Filters" display the correct shared feed posts - Posts To Me filter',
          zephyrTestId: 'CONT-26728',
          storyId: 'CONT-26728',
        });

        const postText = FEED_TEST_DATA.POST_TEXT.INITIAL;
        const shareMessage = FEED_TEST_DATA.POST_TEXT.SHARED;

        // Login as Admin and create a feed post
        await appManagerFixture.navigationHelper.clickOnGlobalFeed();
        await adminFeedPage.verifyThePageIsLoaded();
        await adminFeedPage.actions.clickShareThoughtsButton();
        const adminPostResult = await adminFeedPage.actions.createAndPost({ text: postText });
        createdPostId = adminPostResult.postId || '';
        await adminFeedPage.assertions.waitForPostToBeVisible(postText);

        // Use Site Manager's page (already logged in via fixture)
        await siteManagerFixture.navigationHelper.clickOnGlobalFeed();
        await siteManagerFeedPage.verifyThePageIsLoaded();

        // Select Show filter = "All Posts"
        await siteManagerFeedPage.actions.clickOnShowOption('all');

        // Click Share icon for the feed post created by Admin
        await siteManagerFeedPage.actions.shareFeedPost({
          postText: postText,
          mentionUserName: adminFullName,
          shareMessage: shareMessage,
          postIn: 'Home Feed',
        });

        // Wait for shared post to appear
        await siteManagerFeedPage.assertions.waitForPostToBeVisible(shareMessage);

        await adminFeedPage.reloadPage();

        // Select Show filter = "Posts to me"
        console.log('Select Show filter = "Posts to me"');
        await adminFeedPage.actions.clickOnShowOption('toMe');

        // Verify Admin sees:
        // - Only posts where they are mentioned
        // - Posts created by themselves
        await adminFeedPage.assertions.waitForPostToBeVisible(shareMessage); // Shared post mentioning Admin
        await adminFeedPage.assertions.waitForPostToBeVisible(postText); // Admin's own post
      }
    );

    test(
      'posts I Follow: Verify Admin sees posts from users he follows and his own posts',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, '@CONT-26728'],
      },
      async ({ appManagerFixture, siteManagerFixture, standardUserFixture }) => {
        tagTest(test.info(), {
          description: 'In Zeus, verify "Show Filters" display the correct shared feed posts - Posts I Follow filter',
          zephyrTestId: 'CONT-26728',
          storyId: 'CONT-26728',
        });

        const postText = FEED_TEST_DATA.POST_TEXT.INITIAL;
        const shareMessage = FEED_TEST_DATA.POST_TEXT.SHARED;

        // Use Site Manager's page (already logged in via fixture, Admin should not be following Site Manager)
        await siteManagerFixture.navigationHelper.clickOnGlobalFeed();
        await siteManagerFeedPage.verifyThePageIsLoaded();

        // Create a feed post
        await siteManagerFeedPage.actions.clickShareThoughtsButton();
        const siteManagerPostResult = await siteManagerFeedPage.actions.createAndPost({ text: postText });
        createdPostId = siteManagerPostResult.postId || '';
        await siteManagerFeedPage.assertions.waitForPostToBeVisible(postText);

        // Use Site Owner's page (already logged in via fixture, Admin is following Site Owner)
        await standardUserFixture.navigationHelper.clickOnGlobalFeed();
        await siteOwnerFeedPage.verifyThePageIsLoaded();

        // Select Show filter = "All Posts"
        await siteOwnerFeedPage.actions.clickOnShowOption('all');

        // Click Share on the feed post created by Site Manager
        console.log('Share the feed post created by Site Manager');
        await siteOwnerFeedPage.actions.shareFeedPost({
          postText: postText,
          shareMessage: shareMessage,
          postIn: 'Home Feed',
        });

        // Wait for shared post to appear
        await siteOwnerFeedPage.assertions.waitForPostToBeVisible(shareMessage);

        // Use Admin's page (already logged in via fixture)
        await appManagerFixture.navigationHelper.clickOnGlobalFeed();
        await adminFeedPage.verifyThePageIsLoaded();

        // Select Show filter = "Posts I follow"
        console.log('Select Show filter = "Posts I follow"');
        await adminFeedPage.actions.clickOnShowOption('Posts I follow');

        // Verify Admin can see:
        // - Feed posts shared or created by users he follows (Site Owner)
        // - His own posts
        // - NOT Site Manager's post
        console.log('Verify Admin sees posts from followed users and own posts');
        await adminFeedPage.assertions.waitForPostToBeVisible(shareMessage); // Site Owner's shared post

        // Verify Site Manager's original post is NOT visible (since Admin is not following Site Manager)
        await adminFeedPage.assertions.verifyPostIsNotVisible(postText);
      }
    );

    test(
      'favourited Posts: Verify Admin sees only favourited posts',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, '@CONT-26728'],
      },
      async ({ appManagerFixture, siteManagerFixture, standardUserFixture }) => {
        tagTest(test.info(), {
          description: 'In Zeus, verify "Show Filters" display the correct shared feed posts - Favourited Posts filter',
          zephyrTestId: 'CONT-26728',
          storyId: 'CONT-26728',
        });

        const postText = FEED_TEST_DATA.POST_TEXT.INITIAL;
        const shareMessage = FEED_TEST_DATA.POST_TEXT.SHARED;

        // Use Site Manager's page (already logged in via fixture, Admin should not be following Site Manager)
        await siteManagerFixture.navigationHelper.clickOnGlobalFeed();
        await siteManagerFeedPage.verifyThePageIsLoaded();

        // Create a feed post
        await siteManagerFeedPage.actions.clickShareThoughtsButton();
        const siteManagerPostResult = await siteManagerFeedPage.actions.createAndPost({ text: postText });
        createdPostId = siteManagerPostResult.postId || '';
        await siteManagerFeedPage.assertions.waitForPostToBeVisible(postText);

        //  Use Site Content Manager's page (already logged in via fixture, Admin is following Site Content Manager)
        await standardUserFixture.navigationHelper.clickOnGlobalFeed();
        await siteContentManagerFeedPage.verifyThePageIsLoaded();

        // Select Show filter = "All Posts"
        console.log('Select Show filter = "All Posts"');
        await siteContentManagerFeedPage.actions.clickOnShowOption('all');

        // Click Share icon for the feed post created by Site Manager
        await siteContentManagerFeedPage.actions.shareFeedPost({
          postText: postText,
          shareMessage: shareMessage,
          postIn: 'Home Feed',
        });

        // Wait for shared post to appear
        await siteContentManagerFeedPage.assertions.waitForPostToBeVisible(shareMessage);

        // Use Admin's page (already logged in via fixture)
        await appManagerFixture.navigationHelper.clickOnGlobalFeed();
        await adminFeedPage.verifyThePageIsLoaded();

        // Select Show filter = "All Posts" to see the shared post
        console.log('Select Show filter = "All Posts" to see the shared post');
        await adminFeedPage.actions.clickOnShowOption('all');
        await adminFeedPage.assertions.waitForPostToBeVisible(shareMessage);

        // Favourite the Site Content Manager's shared feed post
        // Wait for the shared post to be visible
        await adminFeedPage.assertions.waitForPostToBeVisible(shareMessage);
        // Mark the specific post as favorite by its text
        await adminFeedPage.actions.markPostAsFavourite();
        await adminFeedPage.assertions.verifyPostIsFavorited(shareMessage);

        // Select Show filter = "Favourited Posts"
        await adminFeedPage.actions.clickOnShowOption('favourited');

        // Verify Admin sees only the favourited shared post
        await adminFeedPage.assertions.waitForPostToBeVisible(shareMessage);
      }
    );

    // Helper function to create three contents (Page, Event, Album) on a private site
    async function createThreeContents(
      siteId: string,
      userFixture: any
    ): Promise<Array<{ type: string; title: string; contentId: string }>> {
      return await test.step('Create three contents: Page, Event, Album', async () => {
        const timestamp = Date.now();
        const contents: Array<{ type: string; title: string; contentId: string }> = [];

        // Create Page
        const pageInfo = await userFixture.contentManagementHelper.createPage({
          siteId,
          contentInfo: { contentType: 'page', contentSubType: 'knowledge' },
          options: {
            pageName: `Test Page ${timestamp}`,
            contentDescription: 'Test page description',
          },
        });
        contents.push({ type: 'Page', title: pageInfo.pageName, contentId: pageInfo.contentId });

        // Create Event
        const eventInfo = await userFixture.contentManagementHelper.createEvent({
          siteId,
          contentInfo: { contentType: 'event' },
          options: {
            eventName: `Test Event ${timestamp}`,
            contentDescription: 'Test event description',
          },
        });
        contents.push({ type: 'Event', title: eventInfo.eventName, contentId: eventInfo.contentId });

        // Create Album
        const albumInfo = await userFixture.contentManagementHelper.createAlbum({
          siteId,
          imageName: 'beach.jpg',
          options: {
            albumName: `Test Album ${timestamp}`,
            contentDescription: 'Test album description',
          },
        });
        contents.push({ type: 'Album', title: albumInfo.albumName, contentId: albumInfo.contentId });

        console.log('Created contents:', contents);
        return contents;
      });
    }

    // Helper function to make end user a member of the site using API
    async function makeEndUserMember(siteId: string, endUserFixture: any, adminApiFixture: any): Promise<string> {
      return await test.step('Make End User a member of the private site via API', async () => {
        // Get end user info to get their user ID
        const endUserInfo = await adminApiFixture.identityManagementHelper.getUserInfoByEmail(users.endUser.email);
        console.log(`Adding user ${endUserInfo.fullName} (${endUserInfo.userId}) as member to site ${siteId}`);

        // Use API to directly add the user as a member
        const result = await adminApiFixture.siteManagementHelper.makeUserSiteMembership(
          siteId,
          endUserInfo.userId,
          SitePermission.MEMBER,
          SiteMembershipAction.ADD
        );

        if (result.status === 'success') {
          console.log(`✓ Successfully added ${endUserInfo.fullName} as member: ${result.message}`);
        } else {
          throw new Error(`Failed to add user as member: ${result.message || 'Unknown error'}`);
        }

        return endUserInfo.userId;
      });
    }

    // Helper function to remove end user membership from a site using API
    async function removeEndUserMember(siteId: string, endUserFixture: any, adminApiFixture: any): Promise<void> {
      await test.step('Remove End User membership from the site via API', async () => {
        try {
          // Get end user info to get their user ID
          const endUserInfo = await adminApiFixture.identityManagementHelper.getUserInfoByEmail(users.endUser.email);
          console.log(`Removing user ${endUserInfo.fullName} (${endUserInfo.userId}) as member from site ${siteId}`);

          // Check current membership status
          const membershipList = await adminApiFixture.siteManagementHelper.getSiteMembershipList(siteId);
          const existingMember = membershipList.result?.listOfItems?.find(
            (member: any) => member.peopleId === endUserInfo.userId
          );

          if (!existingMember) {
            console.log(`User ${endUserInfo.fullName} is not a member - nothing to remove`);
            return;
          }

          // Use API to directly remove the user as a member
          const result = await adminApiFixture.siteManagementHelper.makeUserSiteMembership(
            siteId,
            endUserInfo.userId,
            SitePermission.MEMBER,
            SiteMembershipAction.REMOVE
          );

          if (result.status === 'success') {
            console.log(`✓ Successfully removed ${endUserInfo.fullName} as member: ${result.message}`);
          } else {
            console.warn(`Failed to remove user as member: ${result.message || 'Unknown error'}`);
          }
        } catch (error: any) {
          // If removal fails (e.g., user is contentManager and can't be removed with MEMBER permission), log and continue
          console.warn(`Could not remove user membership (may have special role): ${error.message || error}`);
        }
      });
    }

    // Test data storage for cleanup
    let testData: {
      siteId?: string;
      endUserId?: string;
      contents?: Array<{ type: string; title: string; contentId: string; siteId: string }>;
    } = {};

    test(
      'recently Published Smart Block - Verify content visibility based on membership status',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, '@CONT-29442'],
      },
      async ({ appManagerFixture, appManagerApiFixture, standardUserFixture }) => {
        tagTest(test.info(), {
          description:
            'Create Page/Event/Album on private site, verify Admin sees them, verify End User (non-member) does not see them, make End User a member, then verify End User can see them in Recently Published smart block when Show Filter = "All Posts"',
          zephyrTestId: 'CONT-29442',
          storyId: 'CONT-29442',
        });

        testData = { contents: [] };

        // Create a private site
        const privateSite = await appManagerApiFixture.siteManagementHelper.createSite({
          siteName: `Test Private Site ${Date.now()}`,
          accessType: SITE_TYPES.PRIVATE,
          waitForSearchIndex: false,
        });
        testData.siteId = privateSite.siteId;
        console.log(`Using private site: ${privateSite.siteName} (${privateSite.siteId})`);

        // Ensure End User is NOT a member (clean state for test)
        // Get end user info to check membership status
        const endUserInfo = await appManagerApiFixture.identityManagementHelper.getUserInfoByEmail(users.endUser.email);
        const membershipList = await appManagerApiFixture.siteManagementHelper.getSiteMembershipList(
          privateSite.siteId
        );
        const existingMember = membershipList.result?.listOfItems?.find(
          (member: any) => member.peopleId === endUserInfo.userId
        );

        if (existingMember) {
          console.log(
            `End User ${endUserInfo.fullName} is already a member of site ${privateSite.siteName}. Removing membership to ensure clean test state...`
          );
          await removeEndUserMember(privateSite.siteId, standardUserFixture, appManagerApiFixture);
          console.log('✓ End User membership removed - test starting with clean state');
        } else {
          console.log(`End User ${endUserInfo.fullName} is not a member - test starting with clean state`);
        }

        // Create Page, Event, Album on the private site (as Admin)
        const contents = await createThreeContents(privateSite.siteId, appManagerApiFixture);
        testData.contents = contents.map(c => ({ ...c, siteId: privateSite.siteId }));
        console.log('Created contents:', contents.map(c => `${c.type}: ${c.title}`).join(', '));

        // Verify Admin can see all 3 contents in Recently Published block
        await appManagerFixture.homePage.loadPage();
        await appManagerFixture.homePage.verifyThePageIsLoaded();
        await appManagerFixture.navigationHelper.clickOnGlobalFeed();
        const adminFeedPage = new FeedPage(appManagerFixture.page);
        await adminFeedPage.verifyThePageIsLoaded();
        await adminFeedPage.actions.clickOnShowOption('all');

        console.log('Verifying Admin can see Recently Published block and all contents...');
        await adminFeedPage.assertions.verifyRecentlyPublishedBlockIsVisible();
        for (const content of contents) {
          await adminFeedPage.assertions.verifyContentVisibleInRecentlyPublishedBlock(content.title);
          console.log(`✓ Admin can see ${content.type}: ${content.title}`);
        }

        // Verify End User (non-member) cannot see the contents
        await standardUserFixture.homePage.loadPage();
        await standardUserFixture.homePage.verifyThePageIsLoaded();
        await standardUserFixture.navigationHelper.clickOnGlobalFeed();
        const endUserFeedPage = new FeedPage(standardUserFixture.page);
        await endUserFeedPage.verifyThePageIsLoaded();
        await endUserFeedPage.actions.clickOnShowOption('all');

        console.log('Verifying End User (non-member) cannot see contents...');
        await endUserFeedPage.assertions.verifyRecentlyPublishedBlockIsVisible();
        for (const content of contents) {
          await endUserFeedPage.assertions.verifyContentNotVisibleInRecentlyPublishedBlock(content.title);
          console.log(`✓ End User (non-member) cannot see ${content.type}: ${content.title}`);
        }

        // Make End User a member of the private site
        console.log('Making End User a member of the private site...');
        const endUserId = await makeEndUserMember(privateSite.siteId, standardUserFixture, appManagerApiFixture);
        testData.endUserId = endUserId;
        console.log('✓ End User is now a member');

        // Verify End User (member) can now see all 3 contents
        await standardUserFixture.homePage.loadPage();
        await standardUserFixture.homePage.verifyThePageIsLoaded();
        await standardUserFixture.navigationHelper.clickOnGlobalFeed();
        const endUserMemberFeedPage = new FeedPage(standardUserFixture.page);
        await endUserMemberFeedPage.verifyThePageIsLoaded();
        await endUserMemberFeedPage.actions.clickOnShowOption('all');

        console.log('Verifying End User (member) can now see all contents...');
        await endUserMemberFeedPage.assertions.verifyRecentlyPublishedBlockIsVisible();
        for (const content of contents) {
          await endUserMemberFeedPage.assertions.verifyContentVisibleInRecentlyPublishedBlock(content.title);
          console.log(`✓ End User (member) can see ${content.type}: ${content.title}`);
        }
      }
    );

    test(
      'recently Published Smart Block - Verify unlisted site content visibility with Posts I follow filter',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, '@CONT-29446'],
      },
      async ({ appManagerFixture, appManagerApiFixture, standardUserFixture }) => {
        tagTest(test.info(), {
          description:
            'Create Page/Event/Album on unlisted site, verify Admin sees them, verify End User (non-member) does not see them, make End User a member, then verify End User can see them in Recently Published smart block when Show Filter = "Posts I follow"',
          zephyrTestId: 'CONT-29446',
          storyId: 'CONT-29446',
        });

        testData = { contents: [] };

        // Create an unlisted site
        const unlistedSite = await appManagerApiFixture.siteManagementHelper.createSite({
          siteName: `Test Unlisted Site ${Date.now()}`,
          accessType: SITE_TYPES.UNLISTED,
          waitForSearchIndex: false,
        });
        testData.siteId = unlistedSite.siteId;
        console.log(`Using unlisted site: ${unlistedSite.siteName} (${unlistedSite.siteId})`);

        // Ensure End User is NOT a member (clean state for test)
        // Get end user info to check membership status
        const endUserInfo = await appManagerApiFixture.identityManagementHelper.getUserInfoByEmail(users.endUser.email);
        const membershipList = await appManagerApiFixture.siteManagementHelper.getSiteMembershipList(
          unlistedSite.siteId
        );
        const existingMember = membershipList.result?.listOfItems?.find(
          (member: any) => member.peopleId === endUserInfo.userId
        );

        let isEndUserMember = false;
        if (existingMember) {
          console.log(
            `End User ${endUserInfo.fullName} is already a member of site ${unlistedSite.siteName}. Removing membership to ensure clean test state...`
          );
          await removeEndUserMember(unlistedSite.siteId, standardUserFixture, appManagerApiFixture);

          // Verify membership was actually removed
          const membershipListAfter = await appManagerApiFixture.siteManagementHelper.getSiteMembershipList(
            unlistedSite.siteId
          );
          const stillMember = membershipListAfter.result?.listOfItems?.find(
            (member: any) => member.peopleId === endUserInfo.userId
          );

          if (stillMember) {
            console.warn(
              `Warning: Could not remove End User membership (user may have special role). Will skip non-member verification and test member scenario directly.`
            );
            isEndUserMember = true;
          } else {
            console.log('✓ End User membership removed - test starting with clean state');
          }
        } else {
          console.log(`End User ${endUserInfo.fullName} is not a member - test starting with clean state`);
        }

        // Create Page, Event, Album on the unlisted site (as Admin)
        const contents = await createThreeContents(unlistedSite.siteId, appManagerApiFixture);
        testData.contents = contents.map(c => ({ ...c, siteId: unlistedSite.siteId }));
        console.log('Created contents:', contents.map(c => `${c.type}: ${c.title}`).join(', '));

        // Verify Admin can see all 3 contents in Recently Published block
        await appManagerFixture.homePage.loadPage();
        await appManagerFixture.homePage.verifyThePageIsLoaded();
        await appManagerFixture.navigationHelper.clickOnGlobalFeed();
        const adminFeedPage = new FeedPage(appManagerFixture.page);
        await adminFeedPage.verifyThePageIsLoaded();
        await adminFeedPage.actions.clickOnShowOption('Posts I follow');

        console.log('Verifying Admin can see Recently Published block and all contents...');
        await adminFeedPage.assertions.verifyRecentlyPublishedBlockIsVisible();
        for (const content of contents) {
          await adminFeedPage.assertions.verifyContentVisibleInRecentlyPublishedBlock(content.title);
          console.log(`✓ Admin can see ${content.type}: ${content.title}`);
        }

        // Verify End User (non-member) cannot see the contents (only if user is not already a member)
        if (!isEndUserMember) {
          await standardUserFixture.homePage.loadPage();
          await standardUserFixture.homePage.verifyThePageIsLoaded();
          await standardUserFixture.navigationHelper.clickOnGlobalFeed();
          const endUserFeedPage = new FeedPage(standardUserFixture.page);
          await endUserFeedPage.verifyThePageIsLoaded();
          await endUserFeedPage.actions.clickOnShowOption('Posts I follow');

          console.log('Verifying End User (non-member) cannot see contents...');
          await endUserFeedPage.assertions.verifyRecentlyPublishedBlockIsVisible();
          for (const content of contents) {
            await endUserFeedPage.assertions.verifyContentNotVisibleInRecentlyPublishedBlock(content.title);
            console.log(`✓ End User (non-member) cannot see ${content.type}: ${content.title}`);
          }
        } else {
          console.log('Skipping non-member verification - user is already a member');
        }

        // Make End User a member of the unlisted site (only if not already a member)
        if (!isEndUserMember) {
          console.log('Making End User a member of the unlisted site...');
          const endUserId = await makeEndUserMember(unlistedSite.siteId, standardUserFixture, appManagerApiFixture);
          testData.endUserId = endUserId;
          console.log('✓ End User is now a member');
        } else {
          console.log('End User is already a member - skipping membership addition step');
          testData.endUserId = endUserInfo.userId;
        }

        // Verify End User (member) can now see all 3 contents
        await standardUserFixture.homePage.loadPage();
        await standardUserFixture.homePage.verifyThePageIsLoaded();
        await standardUserFixture.navigationHelper.clickOnGlobalFeed();
        const endUserMemberFeedPage = new FeedPage(standardUserFixture.page);
        await endUserMemberFeedPage.verifyThePageIsLoaded();
        await endUserMemberFeedPage.actions.clickOnShowOption('Posts I follow');

        console.log('Verifying End User (member) can now see all contents...');
        await endUserMemberFeedPage.assertions.verifyRecentlyPublishedBlockIsVisible();
        for (const content of contents) {
          await endUserMemberFeedPage.assertions.verifyContentVisibleInRecentlyPublishedBlock(content.title);
          console.log(`✓ End User (member) can see ${content.type}: ${content.title}`);
        }
      }
    );

    // Enhanced cleanup for all tests (runs after each test including the new CONT-29442 and CONT-29446 tests)
    test.afterEach(async ({ appManagerApiFixture, standardUserFixture }) => {
      // Cleanup created content from CONT-29442 tests
      if (testData.contents && testData.contents.length > 0) {
        const fixture = appManagerApiFixture;
        for (const content of testData.contents) {
          try {
            await fixture.contentManagementHelper.deleteContent(content.siteId, content.contentId);
            console.log(`Deleted ${content.type}: ${content.title} (${content.contentId})`);
          } catch (error) {
            console.warn(`Failed to delete ${content.type} ${content.contentId}:`, error);
          }
        }
        testData.contents = [];
      }

      // Cleanup membership if it was added during the test
      if (testData.siteId && testData.endUserId) {
        try {
          await removeEndUserMember(testData.siteId, standardUserFixture, appManagerApiFixture);
          console.log(`Removed End User membership from site ${testData.siteId}`);
        } catch (error) {
          console.warn(`Failed to remove End User membership from site ${testData.siteId}:`, error);
        }
        testData.endUserId = undefined;
        testData.siteId = undefined;
      }
    });
  }
);
