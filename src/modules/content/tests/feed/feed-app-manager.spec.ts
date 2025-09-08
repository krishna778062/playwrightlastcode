import { faker } from '@faker-js/faker';

import { TestPriority } from '@core/constants/testPriority';
import { TestGroupType } from '@core/constants/testType';
import { getEnvConfig } from '@core/utils/getEnvConfig';
import { tagTest } from '@core/utils/testDecorator';

import { API_ENDPOINTS } from '@/src/core/constants/apiEndpoints';
import { IdentityManagementHelper } from '@/src/core/helpers/identityManagementHelper';
import { SiteManagementHelper } from '@/src/core/helpers/siteManagementHelper';
import { SiteMembershipAction, SitePermission } from '@/src/core/types/siteManagement.types';
import { ContentTestSuite } from '@/src/modules/content/constants/testSuite';
import { contentTestFixture as test, users } from '@/src/modules/content/fixtures/contentFixture';
import { FeedPage } from '@/src/modules/content/pages/feedPage';
import { FEED_TEST_DATA } from '@/src/modules/content/test-data/feed.test-data';
import { SITE_TEST_DATA } from '@/src/modules/content/test-data/sites-create.test-data';
import { SiteType } from '@/src/modules/content-abac/constants/siteType';

test.describe(
  '@FeedAM - Site Owner, Manager and Content Manager Feed Post Favorite/Unfavorite Tests',
  {
    tag: [ContentTestSuite.FEED_APP_MANAGER],
  },
  () => {
    let appManagerFeedPage: FeedPage;
    let standardUserFeedPage: FeedPage;
    let siteManagerFeedPage: FeedPage;
    let createdPostText: string;
    let createdPostId: string = '';
    let createdSite: any;

    // Test data for data-driven testing
    const favoriteTestData = [
      {
        testName: 'without file attachment',
        description:
          'Verify Site Owner, Manager and Content Manager is able to favorite and unfavorite Feed post without File Attachment on Content Feed',
        hasAttachment: false,
        createFeedMethod: 'createFeed' as const,
        storyId: 'CONT-39249',
      },
      {
        testName: 'with file attachment',
        description:
          'Verify Site Owner, Manager and Content Manager is able to favorite and unfavorite Feed post with File Attachment',
        hasAttachment: true,
        createFeedMethod: 'createFeedWithAttachments' as const,
        storyId: 'CONT-39249',
      },
    ];

    test.beforeEach('Login with Application Manager and navigate to feed', async ({ appManagerHomePage }) => {
      appManagerFeedPage = new FeedPage(appManagerHomePage.page);
      await appManagerHomePage.actions.clickOnGlobalFeed();
      await appManagerFeedPage.verifyThePageIsLoaded();
    });

    // Data-driven test for favorite/unfavorite functionality
    favoriteTestData.forEach(testData => {
      test(
        `Verify Site Owner/Manager/Content Manager can favorite and unfavorite feed post ${testData.testName}`,
        {
          tag: [TestPriority.P0, TestGroupType.SMOKE, '@favorite-unfavorite'],
        },
        async ({
          appManagerApiClient,
          siteManagementHelper,
          feedManagementHelper,
          standardUserHomePage,
          siteManagerHomePage,
        }) => {
          tagTest(test.info(), {
            description: testData.description,
            zephyrTestId: testData.storyId,
            storyId: testData.storyId,
          });

          // Setup user and site (only for site-based tests)
          if (!testData.hasAttachment) {
            const identityManagementHelper = new IdentityManagementHelper(appManagerApiClient);
            const endUser = await identityManagementHelper.getUserByEmail(users.endUser.email);
            if (!endUser) {
              throw new Error('Failed to get user ID');
            }
            const endUserPeopleId = endUser.user_id;
            console.log(`End user people ID: ${endUserPeopleId}`);
            const category = await appManagerApiClient
              .getSiteManagementService()
              .getCategoryId(SITE_TEST_DATA[0].category);
            createdSite = await siteManagementHelper.createPublicSite({
              category,
              waitForSearchIndex: false,
            });
            console.log(`Created site: ${createdSite.siteName} with ID: ${createdSite.siteId}`);

            // Ensure user is a content manager of the site
            await siteManagementHelper.ensureUserSiteMembershipWithRole({
              siteId: createdSite.siteId,
              userId: endUserPeopleId,
              role: SitePermission.CONTENT_MANAGER,
            });
          }

          // Generate test data for post
          const postText = `Automated Test Post ${faker.company.name()} - ${faker.commerce.productName()}`;

          // Create feed based on test data
          let feedResponse;
          if (testData.createFeedMethod === 'createFeed') {
            feedResponse = await feedManagementHelper.createFeed({
              scope: 'site',
              siteId: createdSite.siteId,
              text: postText,
              options: { waitForSearchIndex: false },
            });
          } else {
            feedResponse = await feedManagementHelper.createFeedWithAttachments({
              scope: 'site',
              siteId: createdSite.siteId,
              text: postText,
              options: { waitForSearchIndex: false },
            });
          }

          console.log(`Created feed via Helper: ${feedResponse.result.feedId}`);

          // Store created post details for cleanup
          const postResult = {
            postText: postText,
            postId: feedResponse.result.feedId,
          };

          // Store created post text and postId for cleanup
          createdPostText = postResult.postText;
          createdPostId = postResult.postId;

          // Initialize feed pages for different user roles
          standardUserFeedPage = new FeedPage(standardUserHomePage.page);
          siteManagerFeedPage = new FeedPage(siteManagerHomePage.page);

          // Navigate all pages to the feed URL in parallel
          await Promise.all([
            appManagerFeedPage.page.goto(API_ENDPOINTS.feed.feedURL(createdPostId)),
            standardUserFeedPage.page.goto(API_ENDPOINTS.feed.feedURL(createdPostId)),
            siteManagerFeedPage.page.goto(API_ENDPOINTS.feed.feedURL(createdPostId)),
          ]);

          // Wait for posts to be visible on all pages in parallel
          await Promise.all([
            appManagerFeedPage.assertions.waitForPostToBeVisible(createdPostText),
            standardUserFeedPage.assertions.waitForPostToBeVisible(createdPostText),
            siteManagerFeedPage.assertions.waitForPostToBeVisible(createdPostText),
          ]);

          // Test favorite/unfavorite operations in parallel for all user roles
          await Promise.all([
            // App Manager favorite/unfavorite
            (async () => {
              await appManagerFeedPage.actions.markPostAsFavourite();
              await appManagerFeedPage.assertions.verifyPostIsFavorited(createdPostText);
              await appManagerFeedPage.actions.removePostFromFavourite(createdPostText);
              await appManagerFeedPage.assertions.verifyPostIsNotFavorited(createdPostText);
            })(),
            // Standard User favorite/unfavorite
            (async () => {
              await standardUserFeedPage.actions.markPostAsFavourite();
              await standardUserFeedPage.assertions.verifyPostIsFavorited(createdPostText);
              await standardUserFeedPage.actions.removePostFromFavourite(createdPostText);
              await standardUserFeedPage.assertions.verifyPostIsNotFavorited(createdPostText);
            })(),
            // Site Manager favorite/unfavorite
            (async () => {
              await siteManagerFeedPage.actions.markPostAsFavourite();
              await siteManagerFeedPage.assertions.verifyPostIsFavorited(createdPostText);
              await siteManagerFeedPage.actions.removePostFromFavourite(createdPostText);
              await siteManagerFeedPage.assertions.verifyPostIsNotFavorited(createdPostText);
            })(),
          ]);
        }
      );
    });

    test(
      'In Zeus Verify user is able to Add Edit Delete Text Topic Mention user Mention Site Embedded URL on Home Feed',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, '@CONT-24125'],
      },
      async ({ appManagerHomePage, appManagerApiClient, contentManagementHelper }) => {
        tagTest(test.info(), {
          description:
            'Verify user is able to Add Edit Delete Text Topic Mention user Mention Site Embedded URL on Home Feed',
          zephyrTestId: 'CONT-24125',
          storyId: 'CONT-24125',
        });

        const identityManagementHelper = new IdentityManagementHelper(appManagerApiClient);
        const endUser = await identityManagementHelper.getUserByEmail(users.endUser.email);

        if (!endUser) {
          throw new Error('Failed to get user details');
        }

        const fullName = `${endUser.first_name || ''} ${endUser.last_name || ''}`.trim();
        console.log('fullName', fullName);

        const siteManagementHelper = new SiteManagementHelper(appManagerApiClient);
        const publicSite = await siteManagementHelper.getSiteByAccessType(SiteType.PUBLIC);

        if (!publicSite) {
          throw new Error('No public site found in the list');
        }

        const publicSiteName = publicSite.name;
        // Get list of topics
        const topicListResponse = await contentManagementHelper.getTopicList();

        console.log(`Found ${topicListResponse.result.listOfItems.length} topics`);

        // Get random topic name from the response list
        const randomTopic =
          topicListResponse.result.listOfItems[Math.floor(Math.random() * topicListResponse.result.listOfItems.length)];

        const initialPostText = `Automated Test Post ${faker.company.name()}`;

        const postResult = await appManagerFeedPage.actions.createfeedWithMentionUserNameAndTopic({
          text: initialPostText,
          userName: fullName,
          topicName: randomTopic.name,
          siteName: publicSiteName,
        });

        await appManagerFeedPage.assertions.validatePostText(postResult.postText);

        const updatedPostText = `Updated Test Post ${faker.company.buzzPhrase()}`;
        const siteManagerUser = await identityManagementHelper.getUserByEmail(users.siteManager.email);

        if (!siteManagerUser) {
          throw new Error('Failed to get user details');
        }

        const siteManagerFullName = `${siteManagerUser.first_name} ${siteManagerUser.last_name}`.trim();
        console.log('siteManagerFullName:  ', siteManagerFullName);
        // Step 3: Edit the post
        await appManagerFeedPage.actions.editPostWithTopicAndUserName({
          currentText: postResult.postText,
          newText: updatedPostText,
          topicName: randomTopic.name,
          userName: siteManagerFullName,
        });
        await appManagerFeedPage.assertions.validatePostText(updatedPostText);

        // Step 4: Delete the post
        await appManagerFeedPage.actions.deletePost(updatedPostText);
        createdPostId = '';
      }
    );
  }
);
