import { TestPriority } from '@core/constants/testPriority';
import { TestGroupType } from '@core/constants/testType';
import { tagTest } from '@core/utils/testDecorator';

import { SiteMembershipAction, SitePermission } from '@/src/core/types/siteManagement.types';
import { TestDataGenerator } from '@/src/core/utils/testDataGenerator';
import { ContentType } from '@/src/modules/content/constants/contentType';
import { PageContentType } from '@/src/modules/content/constants/pageContentType';
import { SITE_TYPES } from '@/src/modules/content/constants/siteTypes';
import { ContentTestSuite } from '@/src/modules/content/constants/testSuite';
import { contentTestFixture as test, users } from '@/src/modules/content/fixtures/contentFixture';
import { FEED_TEST_DATA } from '@/src/modules/content/test-data/feed.test-data';
import { FILE_TEST_DATA } from '@/src/modules/content/test-data/file.test-data';
import { DEFAULT_PUBLIC_SITE_NAME } from '@/src/modules/content/test-data/sites-create.test-data';
import { ContentPreviewPage } from '@/src/modules/content/ui/pages/contentPreviewPage';
import { FeedPage } from '@/src/modules/content/ui/pages/feedPage';
import { PageCreationPage } from '@/src/modules/content/ui/pages/pageCreationPage';
import { SiteDashboardPage } from '@/src/modules/content/ui/pages/sitePages';

test.describe(
  '@FeedPost - Show Filters Display Correct Shared Feed Posts',
  {
    tag: [ContentTestSuite.FEED_STANDARD_USER],
  },
  () => {
    let createdPostId: string = '';

    test.beforeEach(async () => {
      createdPostId = '';
    });

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
      async ({ appManagerFixture, appManagerApiFixture, siteManagerFixture }) => {
        tagTest(test.info(), {
          description: 'In Zeus, verify "Show Filters" display the correct shared feed posts - Posts To Me filter',
          zephyrTestId: 'CONT-26728',
          storyId: 'CONT-26728',
        });

        // Get admin full name only when needed for this test
        const adminInfo = await appManagerApiFixture.identityManagementHelper.getUserInfoByEmail(
          users.appManager.email
        );
        const adminFullName = adminInfo.fullName;

        const postText = FEED_TEST_DATA.POST_TEXT.INITIAL;
        const shareMessage = FEED_TEST_DATA.POST_TEXT.SHARED;

        // Login as Admin and create a feed post
        await appManagerFixture.navigationHelper.clickOnGlobalFeed();
        const adminFeedPage = new FeedPage(appManagerFixture.page);
        await adminFeedPage.verifyThePageIsLoaded();
        await adminFeedPage.actions.clickShareThoughtsButton();
        const adminPostResult = await adminFeedPage.actions.createAndPost({ text: postText });
        createdPostId = adminPostResult.postId || '';
        await adminFeedPage.assertions.waitForPostToBeVisible(postText);

        // Use Site Manager's page (already logged in via fixture)
        await siteManagerFixture.navigationHelper.clickOnGlobalFeed();
        const siteManagerFeedPage = new FeedPage(siteManagerFixture.page);
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
        const siteManagerFeedPage = new FeedPage(siteManagerFixture.page);
        await siteManagerFeedPage.verifyThePageIsLoaded();

        // Create a feed post
        await siteManagerFeedPage.actions.clickShareThoughtsButton();
        const siteManagerPostResult = await siteManagerFeedPage.actions.createAndPost({ text: postText });
        createdPostId = siteManagerPostResult.postId || '';
        await siteManagerFeedPage.assertions.waitForPostToBeVisible(postText);

        // Use Site Owner's page (already logged in via fixture, Admin is following Site Owner)
        await standardUserFixture.navigationHelper.clickOnGlobalFeed();
        const siteOwnerFeedPage = new FeedPage(standardUserFixture.page);
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
        const adminFeedPage = new FeedPage(appManagerFixture.page);
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
        const siteManagerFeedPage = new FeedPage(siteManagerFixture.page);
        await siteManagerFeedPage.verifyThePageIsLoaded();

        // Create a feed post
        await siteManagerFeedPage.actions.clickShareThoughtsButton();
        const siteManagerPostResult = await siteManagerFeedPage.actions.createAndPost({ text: postText });
        createdPostId = siteManagerPostResult.postId || '';
        await siteManagerFeedPage.assertions.waitForPostToBeVisible(postText);

        // Use Standard User's page (already logged in via fixture, Admin is following Standard User)
        await standardUserFixture.navigationHelper.clickOnGlobalFeed();
        const standardUserFeedPage = new FeedPage(standardUserFixture.page);
        await standardUserFeedPage.verifyThePageIsLoaded();

        // Select Show filter = "All Posts"
        console.log('Select Show filter = "All Posts"');
        await standardUserFeedPage.actions.clickOnShowOption('all');

        // Click Share icon for the feed post created by Site Manager
        await standardUserFeedPage.actions.shareFeedPost({
          postText: postText,
          shareMessage: shareMessage,
          postIn: 'Home Feed',
        });

        // Wait for shared post to appear
        await standardUserFeedPage.assertions.waitForPostToBeVisible(shareMessage);

        // Use Admin's page (already logged in via fixture)
        await appManagerFixture.navigationHelper.clickOnGlobalFeed();
        const adminFeedPage = new FeedPage(appManagerFixture.page);
        await adminFeedPage.verifyThePageIsLoaded();

        // Select Show filter = "All Posts" to see the shared post
        console.log('Select Show filter = "All Posts" to see the shared post');
        await adminFeedPage.actions.clickOnShowOption('all');
        await adminFeedPage.assertions.waitForPostToBeVisible(shareMessage);

        // Favourite the Standard User's shared feed post
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

        // Create Page, Event, Album on the private site (as Admin)
        const contents = await createThreeContents(privateSite.siteId, appManagerApiFixture);
        testData.contents = contents.map(c => ({ ...c, siteId: privateSite.siteId }));

        // Verify Admin can see all 3 contents in Recently Published block
        await appManagerFixture.homePage.loadPage();
        await appManagerFixture.navigationHelper.clickOnGlobalFeed();
        const adminFeedPage = new FeedPage(appManagerFixture.page);
        await adminFeedPage.verifyThePageIsLoaded();
        await adminFeedPage.actions.clickOnShowOption('all');

        await adminFeedPage.assertions.verifyRecentlyPublishedBlockIsVisible();
        for (const content of contents) {
          await adminFeedPage.assertions.verifyContentVisibleInRecentlyPublishedBlock(content.title);
        }

        // Verify End User (non-member) cannot see the contents
        await standardUserFixture.homePage.loadPage();
        await standardUserFixture.navigationHelper.clickOnGlobalFeed();
        const endUserFeedPage = new FeedPage(standardUserFixture.page);
        await endUserFeedPage.verifyThePageIsLoaded();
        await endUserFeedPage.actions.clickOnShowOption('all');

        await endUserFeedPage.assertions.verifyRecentlyPublishedBlockIsVisible();
        for (const content of contents) {
          await endUserFeedPage.assertions.verifyContentNotVisibleInRecentlyPublishedBlock(content.title);
        }

        // Make End User a member of the private site
        const endUserInfo = await appManagerApiFixture.identityManagementHelper.getUserInfoByEmail(users.endUser.email);
        const result = await appManagerApiFixture.siteManagementHelper.makeUserSiteMembership(
          privateSite.siteId,
          endUserInfo.userId,
          SitePermission.MEMBER,
          SiteMembershipAction.ADD
        );
        if (result.status === 'success') {
          testData.endUserId = result.result.userId;
        } else {
          throw new Error(`Failed to add user as member: ${result.message || 'Unknown error'}`);
        }

        // Verify End User (member) can now see all 3 contents
        await standardUserFixture.homePage.loadPage();
        await standardUserFixture.navigationHelper.clickOnGlobalFeed();
        const endUserMemberFeedPage = new FeedPage(standardUserFixture.page);
        await endUserMemberFeedPage.verifyThePageIsLoaded();
        await endUserMemberFeedPage.actions.clickOnShowOption('all');

        await endUserMemberFeedPage.assertions.verifyRecentlyPublishedBlockIsVisible();
        for (const content of contents) {
          await endUserMemberFeedPage.assertions.verifyContentVisibleInRecentlyPublishedBlock(content.title);
        }
        await endUserMemberFeedPage.reloadPage();
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
          await appManagerApiFixture.siteManagementHelper.makeUserSiteMembership(
            unlistedSite.siteId,
            endUserInfo.userId,
            SitePermission.MEMBER,
            SiteMembershipAction.REMOVE
          );

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
          }
        }

        // Create Page, Event, Album on the unlisted site (as Admin)
        const contents = await createThreeContents(unlistedSite.siteId, appManagerApiFixture);
        testData.contents = contents.map(c => ({ ...c, siteId: unlistedSite.siteId }));

        // Verify Admin can see all 3 contents in Recently Published block
        await appManagerFixture.navigationHelper.clickOnGlobalFeed();
        const adminFeedPage = new FeedPage(appManagerFixture.page);
        await adminFeedPage.verifyThePageIsLoaded();
        await adminFeedPage.actions.clickOnShowOption('Posts I follow');

        await adminFeedPage.assertions.verifyRecentlyPublishedBlockIsVisible();
        for (const content of contents) {
          await adminFeedPage.assertions.verifyContentVisibleInRecentlyPublishedBlock(content.title);
        }

        // Verify End User (non-member) cannot see the contents (only if user is not already a member)
        if (!isEndUserMember) {
          await standardUserFixture.navigationHelper.clickOnGlobalFeed();
          const endUserFeedPage = new FeedPage(standardUserFixture.page);
          await endUserFeedPage.verifyThePageIsLoaded();
          await endUserFeedPage.actions.clickOnShowOption('Posts I follow');

          await endUserFeedPage.assertions.verifyRecentlyPublishedBlockIsVisible();
          for (const content of contents) {
            await endUserFeedPage.assertions.verifyContentNotVisibleInRecentlyPublishedBlock(content.title);
          }
        }

        // Make End User a member of the unlisted site (only if not already a member)
        if (!isEndUserMember) {
          const result = await appManagerApiFixture.siteManagementHelper.makeUserSiteMembership(
            unlistedSite.siteId,
            endUserInfo.userId,
            SitePermission.MEMBER,
            SiteMembershipAction.ADD
          );
          testData.endUserId = result.result.userId;
        } else {
          testData.endUserId = endUserInfo.userId;
        }

        // Verify End User (member) can now see all 3 contents
        const endUserMemberFeedPage = new FeedPage(standardUserFixture.page);
        await standardUserFixture.navigationHelper.clickOnGlobalFeed();
        await endUserMemberFeedPage.reloadPage();
        await endUserMemberFeedPage.verifyThePageIsLoaded();
        await endUserMemberFeedPage.actions.clickOnShowOption('Posts I follow');

        await endUserMemberFeedPage.assertions.verifyRecentlyPublishedBlockIsVisible();
        for (const content of contents) {
          await endUserMemberFeedPage.assertions.verifyContentVisibleInRecentlyPublishedBlock(content.title);
        }
      }
    );

    test(
      'recently Published Smart Block - Verify content from deactivated site is not visible',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, '@CONT-19575'],
      },
      async ({ standardUserFixture, appManagerApiFixture }) => {
        tagTest(test.info(), {
          description:
            'Verify content from a deactivated site is not shown on Recently Published block on Home & Site Feed',
          zephyrTestId: 'CONT-19575',
          storyId: 'CONT-19575',
        });

        // Test data storage for cleanup
        let albumContentId: string | null = null;
        let allEmployeesSiteId: string | null = null;
        let albumTitle: string | null = null;

        try {
          allEmployeesSiteId =
            await appManagerApiFixture.siteManagementHelper.getSiteIdWithName(DEFAULT_PUBLIC_SITE_NAME);

          const albumName = TestDataGenerator.generateRandomText('Automated Test Album');

          await test.step('As EndUser: Create album', async () => {
            albumTitle = albumName;

            const albumInfo = await standardUserFixture.contentManagementHelper.createAlbum({
              siteId: allEmployeesSiteId!,
              imageName: 'beach.jpg',
              options: {
                albumName: albumTitle,
                contentDescription: 'Test album description for deactivated site test',
              },
            });

            albumContentId = albumInfo.contentId;
            albumTitle = albumInfo.albumName;
          });

          await test.step('Verify album is visible in Recently Published block', async () => {
            await standardUserFixture.navigationHelper.clickOnGlobalFeed();
            const endUserFeedPage = new FeedPage(standardUserFixture.page);
            await endUserFeedPage.verifyThePageIsLoaded();
            await endUserFeedPage.actions.clickOnShowOption('all');

            await endUserFeedPage.assertions.verifyRecentlyPublishedBlockIsVisible();
            await endUserFeedPage.assertions.verifyContentVisibleInRecentlyPublishedBlock(albumTitle!);
          });

          await test.step('As Admin: Deactivate "All Employees" site', async () => {
            await appManagerApiFixture.siteManagementHelper.siteManagementService.deactivateSite(allEmployeesSiteId!);
          });
          await test.step('Verify album is NOT visible after site deactivation', async () => {
            await standardUserFixture.navigationHelper.clickOnGlobalFeed();
            const adminFeedPage = new FeedPage(standardUserFixture.page);
            await adminFeedPage.reloadPage();
            await adminFeedPage.verifyThePageIsLoaded();
            await adminFeedPage.actions.clickOnShowOption('all');

            await adminFeedPage.assertions.verifyRecentlyPublishedBlockIsVisible();
            await adminFeedPage.assertions.verifyContentNotVisibleInRecentlyPublishedBlock(albumTitle!);
          });
        } finally {
          // Cleanup: Reactivate site and delete content
          await test.step('Cleanup: Reactivate site and delete content', async () => {
            if (allEmployeesSiteId) {
              try {
                await appManagerApiFixture.siteManagementHelper.siteManagementService.activateSite(allEmployeesSiteId);
              } catch (error) {
                console.warn(`Failed to reactivate site ${allEmployeesSiteId}:`, error);
              }
            }

            if (allEmployeesSiteId && albumContentId) {
              try {
                await appManagerApiFixture.contentManagementHelper.deleteContent(allEmployeesSiteId, albumContentId);
              } catch (error) {
                console.warn(`Failed to delete album ${albumContentId}:`, error);
              }
            }
          });
        }
      }
    );

    // Enhanced cleanup for all tests (runs after each test including the new CONT-29442 and CONT-29446 tests)
    test.afterEach(async ({ appManagerApiFixture }) => {
      // Cleanup created content from CONT-29442 tests
      if (testData.contents && testData.contents.length > 0) {
        const fixture = appManagerApiFixture;
        for (const content of testData.contents) {
          try {
            await fixture.contentManagementHelper.deleteContent(content.siteId, content.contentId);
          } catch (error) {
            console.warn(`Failed to delete content ${content.contentId}:`, error);
          }
        }
        testData.contents = [];
      }
    });
  }
);

test.describe(
  '@CONT-19574 - Recently Published Smart Block',
  {
    tag: [TestPriority.P0, TestGroupType.SMOKE, '@CONT-19574'],
  },
  () => {
    test('verify published, unpublished and deleted content visibility on Home and Site Feed', async ({
      standardUserFixture,
      appManagerApiFixture,
    }) => {
      tagTest(test.info(), {
        description:
          'In Zeus verify published, unpublished and deleted contents on Recently Published block on Home and Site Feed',
        zephyrTestId: 'CONT-19574',
        storyId: 'CONT-19574',
      });

      // Test data storage for cleanup
      let pageContentId: string | null = null;
      let allEmployeesSiteId: string | null = null;
      let pageTitle: string | null = null;

      try {
        allEmployeesSiteId =
          await appManagerApiFixture.siteManagementHelper.getSiteIdWithName(DEFAULT_PUBLIC_SITE_NAME);

        await standardUserFixture.homePage.loadPage();
        await standardUserFixture.homePage.verifyThePageIsLoaded();

        // Initialize page objects once for reuse
        const siteDashboardPage = new SiteDashboardPage(standardUserFixture.page, allEmployeesSiteId!);
        const homeFeedPage = new FeedPage(standardUserFixture.page);
        const siteFeedPage = new FeedPage(standardUserFixture.page);

        await siteDashboardPage.loadPage();
        await siteDashboardPage.verifyThePageIsLoaded();

        await siteDashboardPage.clickAddContent();
        const pageCreationPage = (await siteDashboardPage.addContentModal.completeContentCreationForm(
          ContentType.PAGE
        )) as PageCreationPage;

        const imagePath = FILE_TEST_DATA.IMAGES.IMAGE1.getPath(__dirname);
        const pageCreationOptions = TestDataGenerator.generatePage(PageContentType.NEWS, imagePath);
        pageCreationOptions.category = 'uncategorized';

        await pageCreationPage.actions.fillPageDetails({
          category: pageCreationOptions.category,
          contentType: pageCreationOptions.contentType,
          title: pageCreationOptions.title,
          description: pageCreationOptions.description,
        });

        const { pageId } = await pageCreationPage.actions.createAndPublishPage(pageCreationOptions);
        pageContentId = pageId;
        pageTitle = pageCreationOptions.title;

        // Initialize contentPreviewPage after we have the pageContentId
        const contentPreviewPage = new ContentPreviewPage(
          standardUserFixture.page,
          allEmployeesSiteId,
          pageContentId,
          ContentType.PAGE.toLowerCase()
        );

        await contentPreviewPage.actions.handlePromotionPageStep();
        await standardUserFixture.navigationHelper.clickOnGlobalFeed();

        await homeFeedPage.verifyThePageIsLoaded();
        await homeFeedPage.actions.clickOnShowOption('all');
        await homeFeedPage.assertions.verifyRecentlyPublishedBlockIsVisible();
        await homeFeedPage.assertions.verifyContentVisibleInRecentlyPublishedBlock(pageTitle!);

        // Navigate to site feed
        await siteDashboardPage.loadPage();
        await siteDashboardPage.actions.clickOnFeedLink();
        await siteFeedPage.verifyThePageIsLoaded();
        await siteFeedPage.assertions.verifyRecentlyPublishedBlockIsVisible();
        await siteFeedPage.assertions.verifyContentVisibleInRecentlyPublishedBlock(pageTitle!);

        // Unpublish content from option menu
        await test.step('Unpublish content from option menu', async () => {
          await contentPreviewPage.loadPage();
          await contentPreviewPage.verifyThePageIsLoaded();
          await contentPreviewPage.actions.skipPromotionDialogIfVisible('page');
          await contentPreviewPage.actions.clickOnOptionMenuButton();
          await contentPreviewPage.actions.unpublishingTheContent();
          await contentPreviewPage.assertions.verifyUnpublishedContentToastMessage(
            FEED_TEST_DATA.TOAST_MESSAGES.CONTENT_UNPUBLISHED
          );
        });

        // Verify unpublished content is not visible in Home Feed
        await test.step('Verify unpublished content is not visible in Home Feed', async () => {
          await standardUserFixture.navigationHelper.clickOnGlobalFeed();
          await homeFeedPage.reloadPage();
          await homeFeedPage.actions.clickOnShowOption('all');
          await homeFeedPage.assertions.verifyRecentlyPublishedBlockIsVisible();
          await homeFeedPage.assertions.verifyContentNotVisibleInRecentlyPublishedBlock(pageTitle!);
        });

        // Republish content from option menu
        await test.step('Republish content from option menu', async () => {
          await contentPreviewPage.loadPage();
          await contentPreviewPage.verifyThePageIsLoaded();
          await contentPreviewPage.actions.publishingTheContent();
          await contentPreviewPage.assertions.verifyPublishedContentToasteMessage(
            FEED_TEST_DATA.TOAST_MESSAGES.PUBLISHED_CONTENT
          );
        });

        // Verify content is visible again in Home Feed after republish
        await test.step('Verify content is visible again in Home Feed after republish', async () => {
          await standardUserFixture.navigationHelper.clickOnGlobalFeed();
          await homeFeedPage.reloadPage();
          await homeFeedPage.actions.clickOnShowOption('all');
          await homeFeedPage.assertions.verifyRecentlyPublishedBlockIsVisible();
          await homeFeedPage.assertions.verifyContentVisibleInRecentlyPublishedBlock(pageTitle!);
        });
      } finally {
        // Cleanup: Delete content if it still exists
        await test.step('Cleanup: Delete content if it still exists', async () => {
          if (allEmployeesSiteId && pageContentId) {
            try {
              await appManagerApiFixture.contentManagementHelper.deleteContent(allEmployeesSiteId, pageContentId);
              console.log(`Deleted page ${pageContentId} during cleanup`);
            } catch (error) {
              console.warn(`Failed to delete page ${pageContentId} during cleanup:`, error);
            }
          }
        });
      }
    });
  }
);

test.describe(
  '@CONT-19571 - Upcoming Events Smart Block',
  {
    tag: [TestPriority.P0, TestGroupType.SMOKE, '@CONT-19571'],
  },
  () => {
    test('verify published, unpublished and deleted events visibility on Home and Site Feed', async ({
      standardUserFixture,
      appManagerApiFixture,
    }) => {
      tagTest(test.info(), {
        description:
          'In Zeus verify published, unpublished and deleted events on Upcoming Events block on Home and Site Feed',
        zephyrTestId: 'CONT-19571',
        storyId: 'CONT-19571',
      });

      let eventContentId: string | null = null;
      let allEmployeesSiteId: string | null = null;
      let eventTitle: string | null = null;

      try {
        allEmployeesSiteId =
          await appManagerApiFixture.siteManagementHelper.getSiteIdWithName(DEFAULT_PUBLIC_SITE_NAME);

        // Create event with future date and location "GGN"
        const futureDate = new Date();
        futureDate.setDate(futureDate.getDate() + 7);
        const futureEndDate = new Date(futureDate);
        futureEndDate.setHours(futureEndDate.getHours() + 2);

        const eventData = TestDataGenerator.generateEvent(
          undefined,
          futureDate.toISOString(),
          futureEndDate.toISOString()
        );

        const eventInfo = await appManagerApiFixture.contentManagementHelper.createEventWithCompleteResponse({
          siteId: allEmployeesSiteId,
          contentInfo: {
            contentType: 'event',
          },
          options: {
            eventName: eventData.title,
            contentDescription: eventData.description,
            location: eventData.location,
          },
        });

        eventContentId = eventInfo.result.id;
        eventTitle = eventData.title;

        // Initialize page objects once for reuse
        const contentPreviewPage = new ContentPreviewPage(
          standardUserFixture.page,
          allEmployeesSiteId,
          eventContentId!,
          ContentType.EVENT.toLowerCase()
        );
        const homeFeedPage = new FeedPage(standardUserFixture.page);
        const siteDashboardPage = new SiteDashboardPage(standardUserFixture.page, allEmployeesSiteId);
        const siteFeedPage = new FeedPage(standardUserFixture.page);

        // Verify event is visible in Home Feed upcoming events block
        await standardUserFixture.navigationHelper.clickOnGlobalFeed();
        await homeFeedPage.verifyThePageIsLoaded();
        await homeFeedPage.actions.clickOnShowOption('all');
        await homeFeedPage.assertions.verifyUpcomingEventsBlockIsVisible();
        await homeFeedPage.assertions.verifyEventVisibleInUpcomingEventsBlock(eventTitle);

        // Verify event is visible in Site Feed upcoming events block
        await siteDashboardPage.loadPage();
        await siteDashboardPage.actions.clickOnFeedLink();
        await siteFeedPage.verifyThePageIsLoaded();
        await siteFeedPage.assertions.verifyUpcomingEventsBlockIsVisible();
        await siteFeedPage.assertions.verifyEventVisibleInUpcomingEventsBlock(eventTitle);

        // Unpublish event and verify it's not visible
        await contentPreviewPage.loadPage();
        await contentPreviewPage.verifyThePageIsLoaded();
        await contentPreviewPage.actions.skipPromotionDialogIfVisible('event');
        await contentPreviewPage.actions.clickOnOptionMenuButton();
        await contentPreviewPage.actions.unpublishingTheContent();
        await contentPreviewPage.assertions.verifyUnpublishedContentToastMessage(
          FEED_TEST_DATA.TOAST_MESSAGES.CONTENT_UNPUBLISHED
        );

        await standardUserFixture.navigationHelper.clickOnGlobalFeed();
        await homeFeedPage.reloadPage();
        await homeFeedPage.actions.clickOnShowOption('all');
        await homeFeedPage.assertions.verifyUpcomingEventsBlockIsVisible();
        await homeFeedPage.assertions.verifyEventNotVisibleInUpcomingEventsBlock(eventTitle);

        // Republish event and verify it's visible again
        await contentPreviewPage.loadPage();
        await contentPreviewPage.verifyThePageIsLoaded();
        await contentPreviewPage.actions.publishingTheContent();

        await standardUserFixture.navigationHelper.clickOnGlobalFeed();
        await homeFeedPage.reloadPage();
        await homeFeedPage.actions.clickOnShowOption('all');
        await homeFeedPage.assertions.verifyUpcomingEventsBlockIsVisible();
        await homeFeedPage.assertions.verifyEventVisibleInUpcomingEventsBlock(eventTitle);

        // Delete event and verify it's not visible
        await contentPreviewPage.loadPage();
        await contentPreviewPage.verifyThePageIsLoaded();
        await contentPreviewPage.actions.deleteTheContent();

        await standardUserFixture.navigationHelper.clickOnGlobalFeed();
        await homeFeedPage.reloadPage();
        await homeFeedPage.actions.clickOnShowOption('all');
        await homeFeedPage.assertions.verifyUpcomingEventsBlockIsVisible();
        await homeFeedPage.assertions.verifyEventNotVisibleInUpcomingEventsBlock(eventTitle);
      } finally {
        if (allEmployeesSiteId && eventContentId) {
          try {
            await appManagerApiFixture.contentManagementHelper.deleteContent(allEmployeesSiteId, eventContentId);
          } catch (error) {
            console.warn(`Failed to delete event ${eventContentId} during cleanup:`, error);
          }
        }
      }
    });
  }
);
