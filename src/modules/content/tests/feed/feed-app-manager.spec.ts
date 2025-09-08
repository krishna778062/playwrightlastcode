import { faker } from '@faker-js/faker';

import { TestPriority } from '@core/constants/testPriority';
import { TestGroupType } from '@core/constants/testType';
import { getEnvConfig } from '@core/utils/getEnvConfig';
import { tagTest } from '@core/utils/testDecorator';

import { API_ENDPOINTS } from '@/src/core/constants/apiEndpoints';
import { ContentManagementHelper } from '@/src/core/helpers/contentManagementHelper';
import { IdentityManagementHelper } from '@/src/core/helpers/identityManagementHelper';
import { SiteManagementHelper } from '@/src/core/helpers/siteManagementHelper';
import { SiteMembershipAction, SitePermission } from '@/src/core/types/siteManagement.types';
import { ContentTestSuite } from '@/src/modules/content/constants/testSuite';
import { contentTestFixture as test, users } from '@/src/modules/content/fixtures/contentFixture';
import { FeedPage } from '@/src/modules/content/pages/feedPage';
import { FEED_TEST_DATA } from '@/src/modules/content/test-data/feed.test-data';
import { SITE_TEST_DATA } from '@/src/modules/content/test-data/sites-create.test-data';
import { SiteType } from '@/src/modules/content-abac/constants/siteType';
import { SITE_TYPES } from '@/src/modules/global-search/constants/siteTypes';

test.describe(
  '@FeedAM - Site Owner, Manager and Content Manager Feed Post Favorite/Unfavorite Tests',
  {
    tag: [ContentTestSuite.FEED_APP_MANAGER, ContentTestSuite.ATTACHMENTS],
  },
  () => {
    let feedPage: FeedPage;
    let createdPostText: string;
    let createdPostId: string = '';
    let createdSite: any;

    test.beforeEach('Login with Application Manager and navigate to feed', async ({ appManagerHomePage }) => {
      feedPage = new FeedPage(appManagerHomePage.page);
    });

    test(
      'Verify Site Owner/Manager/Content Manager can favorite and unfavorite feed post without file attachment',
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
          description:
            'Verify Site Owner, Manager and Content Manager is able to favorite and unfavorite Feed post without File Attachment on Content Feed',
          zephyrTestId: 'CONT-39249',
          storyId: 'CONT-39249',
        });

        const identityManagementHelper = new IdentityManagementHelper(appManagerApiClient);
        const peopleListResponse = await identityManagementHelper.getListOfPeople(users.endUser.email);

        const user = peopleListResponse.result.listOfItems.find(item => item.email === users.endUser.email)?.peopleId;

        if (!user) {
          throw new Error('Failed to get user ID');
        }

        const category = await appManagerApiClient.getSiteManagementService().getCategoryId(SITE_TEST_DATA[0].category);
        createdSite = await siteManagementHelper.createPublicSite({
          category,
        });
        console.log(`Created site: ${createdSite.siteName} with ID: ${createdSite.siteId}`);
        // Make user a member of the site
        await siteManagementHelper.makeUserSiteMembership(
          createdSite.siteId,
          user,
          SitePermission.MEMBER,
          SiteMembershipAction.ADD
        );
        // Make user a content manager of the site
        await siteManagementHelper.makeUserSiteMembership(
          createdSite.siteId,
          user,
          SitePermission.CONTENT_MANAGER,
          SiteMembershipAction.SET_PERMISSION
        );
        console.log(`Made user ${user} a content manager for site ${createdSite.siteId}`);

        // Generate test data for post without attachments
        const postText = `Automated Test Post ${faker.company.name()} - ${faker.commerce.productName()}`;

        // Step 3: Create a new post using FeedManagementHelper
        const feedResponse = await feedManagementHelper.createFeed('site', createdSite.siteId, postText, {
          waitForSearchIndex: false,
        });

        console.log(`Created feed via Helper: ${feedResponse.result.feedId}`);

        // Store created post details for cleanup
        const postResult = {
          postText: postText,
          postId: feedResponse.result.feedId,
        };

        // Store created post text and postId for cleanup
        createdPostText = postResult.postText;
        createdPostId = postResult.postId;

        // Navigate to feed URL
        await feedPage.page.goto(API_ENDPOINTS.feed.feedURL(createdPostId));
        // Step 4: Wait for post to be visible
        await feedPage.assertions.waitForPostToBeVisible(createdPostText);

        // Step 5: Favorite the post as App Manager
        await feedPage.actions.markPostAsFavourite();
        await feedPage.assertions.verifyPostIsFavorited(createdPostText);

        // Step 6: Unfavorite the post as App Manager
        await feedPage.actions.removePostFromFavourite(createdPostText);
        await feedPage.assertions.verifyPostIsNotFavorited(createdPostText);

        feedPage = new FeedPage(standardUserHomePage.page);

        // Navigate to feed URL
        await feedPage.page.goto(API_ENDPOINTS.feed.feedURL(createdPostId));
        // Step 7: Wait for post to be visible as Standard User
        await feedPage.assertions.waitForPostToBeVisible(createdPostText);

        // Step 8: Favorite the post as Standard User
        await feedPage.actions.markPostAsFavourite();
        await feedPage.assertions.verifyPostIsFavorited(createdPostText);

        // Step 9: Unfavorite the post as Standard User
        await feedPage.actions.removePostFromFavourite(createdPostText);
        await feedPage.assertions.verifyPostIsNotFavorited(createdPostText);

        feedPage = new FeedPage(siteManagerHomePage.page);

        // Navigate to feed URL
        await feedPage.page.goto(API_ENDPOINTS.feed.feedURL(createdPostId));
        // Step 10: Wait for post to be visible as Site Manager
        await feedPage.assertions.waitForPostToBeVisible(createdPostText);

        // Step 11: Favorite the post as Site Manager
        await feedPage.actions.markPostAsFavourite();
        await feedPage.assertions.verifyPostIsFavorited(createdPostText);

        // Step 12: Unfavorite the post as Site Manager
        await feedPage.actions.removePostFromFavourite(createdPostText);
        await feedPage.assertions.verifyPostIsNotFavorited(createdPostText);
      }
    );

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

        await appManagerHomePage.actions.clickOnGlobalFeed();
        await feedPage.verifyThePageIsLoaded();

        const identityManagementHelper = new IdentityManagementHelper(appManagerApiClient);
        const peopleListResponse = await identityManagementHelper.getListOfPeople(users.endUser.email);

        console.log('peopleListResponse', peopleListResponse);
        const endUser = peopleListResponse.result.listOfItems.find(item => item.email === users.endUser.email);

        if (!endUser) {
          throw new Error('Failed to get user details');
        }

        const fullName = `${endUser.first_name || ''} ${endUser.last_name || ''}`.trim();
        const userId = endUser.peopleId;
        console.log('fullName', fullName);

        const siteManagementHelper = new SiteManagementHelper(appManagerApiClient);
        const siteListResponse = await siteManagementHelper.getListOfSites();
        // Get any public site from the list
        const publicSiteName = siteListResponse.result.listOfItems.find(
          site => site.access.toLowerCase() === SiteType.PUBLIC
        )?.name;

        if (!publicSiteName) {
          console.log('No public site found. Available access types:', [
            ...new Set(siteListResponse.result.listOfItems.map(site => site.access)),
          ]);
          throw new Error('No public site found in the list');
        }
        // Get list of topics
        const topicListResponse = await contentManagementHelper.getTopicList();

        console.log(`Found ${topicListResponse.result.listOfItems.length} topics`);

        // Get random topic name from the response list
        const randomTopic =
          topicListResponse.result.listOfItems[Math.floor(Math.random() * topicListResponse.result.listOfItems.length)];
        const existingTopicName = randomTopic.name;
        const initialPostText = `Automated Test Post ${faker.company.name()}`;
        const postResult = await feedPage.actions.createfeedWithMentionUserNameAndTopic(
          initialPostText,
          fullName,
          existingTopicName,
          publicSiteName
        );

        await feedPage.assertions.validatePostText(postResult.postText);

        const updatedPostText = `Updated Test Post ${faker.company.buzzPhrase()}`;
        const peopleListResponseUpdated = await identityManagementHelper.getListOfPeople(users.siteManager.email);

        console.log('peopleListResponse', peopleListResponseUpdated);
        const siteManagerUser = peopleListResponseUpdated.result.listOfItems.find(
          item => item.email === users.siteManager.email
        );

        if (!siteManagerUser) {
          throw new Error('Failed to get user details');
        }

        const siteManagerFullName = `${siteManagerUser.first_name} ${siteManagerUser.last_name}`.trim();
        console.log('siteManagerFullName:  ', siteManagerFullName);
        // Step 3: Edit the post
        await feedPage.actions.editPostWithTopicAndUserName(
          postResult.postText,
          updatedPostText,
          existingTopicName,
          siteManagerFullName
        );
        await feedPage.assertions.validatePostText(updatedPostText);

        // Step 4: Delete the post
        await feedPage.actions.deletePost(updatedPostText);
        createdPostId = '';
      }
    );
  }
);
