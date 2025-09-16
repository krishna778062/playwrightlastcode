import { faker } from '@faker-js/faker';

import { TestPriority } from '@core/constants/testPriority';
import { TestGroupType } from '@core/constants/testType';
import { tagTest } from '@core/utils/testDecorator';

import { ContentType } from '../../constants/contentType';
import { SiteDashboardPage } from '../../pages/siteDashboardPage';
import { FEED_TEST_DATA } from '../../test-data/feed.test-data';

import { IdentityManagementHelper } from '@/src/core/helpers/identityManagementHelper';
import { TestDataGenerator } from '@/src/core/utils/testDataGenerator';
import { ContentTestSuite } from '@/src/modules/content/constants/testSuite';
import { contentTestFixture as test, users } from '@/src/modules/content/fixtures/contentFixture';
import { ContentPreviewPage } from '@/src/modules/content/pages/contentPreviewPage';
import { FeedPage } from '@/src/modules/content/pages/feedPage';
import { CONTENT_TEST_DATA } from '@/src/modules/content/test-data/content.test-data';
import { SiteType } from '@/src/modules/content-abac/constants/siteType';

// ==================== HELPER FUNCTIONS ====================

/**
 * Fetches common test data based on flags
 * @param options - Configuration for which data to fetch
 * @param helpers - Required helper instances
 * @returns Promise with requested data
 */
async function fetchUserSiteAndTopicByOptions(
  options: {
    fetchUsers?: boolean;
    fetchTopics?: boolean;
    fetchPublicSite?: boolean;
    fetchPrivateSite?: boolean;
  },
  helpers: {
    identityManagementHelper: IdentityManagementHelper;
    siteManagementHelper: any;
    contentManagementHelper: any;
  }
) {
  const requests: Promise<any>[] = [];
  const dataKeys: string[] = [];

  if (options.fetchUsers) {
    requests.push(helpers.identityManagementHelper.getUserInfoByEmail(users.endUser.email));
    dataKeys.push('endUserInfo');
  }

  if (options.fetchTopics) {
    requests.push(helpers.contentManagementHelper.getTopicList());
    dataKeys.push('topicList');
  }

  if (options.fetchPublicSite) {
    requests.push(helpers.siteManagementHelper.getSiteByAccessType(SiteType.PUBLIC));
    dataKeys.push('publicSite');
  }

  if (options.fetchPrivateSite) {
    requests.push(helpers.siteManagementHelper.getSiteByAccessType(SiteType.PRIVATE));
    dataKeys.push('privateSite');
  }

  const results = await Promise.all(requests);
  const data: any = {};

  results.forEach((result, index) => {
    data[dataKeys[index]] = result;
  });

  // Handle private site creation if none exists
  if (options.fetchPrivateSite && !data.privateSite) {
    console.log('No private site found, creating one for test...');
    const privateTestSite = await helpers.siteManagementHelper.createPrivateSite({ waitForSearchIndex: false });
    data.privateSite = { name: privateTestSite.siteName, siteId: privateTestSite.siteId };
  }

  return data;
}

/**
 * Creates required resources based on feed type
 * @param feedType - Type of feed (Home Feed, Site Feed, Content Feed)
 * @param helpers - Required helper instances
 * @param testDescription - Test description for content creation
 * @returns Promise with created resources
 */
async function createSiteAndContentByOptions(
  helpers: {
    siteManagementHelper: any;
    contentManagementHelper: any;
    appManagerHomePage: any;
  },
  options: {
    createSite?: boolean;
    createPage?: boolean;
  }
) {
  const resources: any = {};

  if (options.createSite) {
    const siteResult = await helpers.siteManagementHelper.createPublicSite({ waitForSearchIndex: false });
    resources.siteDashboardPage = new SiteDashboardPage(helpers.appManagerHomePage.page, siteResult.siteId);
  }

  if (options.createPage) {
    const siteResult = await helpers.siteManagementHelper.createPublicSite({ waitForSearchIndex: false });
    const pageResult = await helpers.contentManagementHelper.createPage({
      siteId: siteResult.siteId,
      contentInfo: {
        contentType: CONTENT_TEST_DATA.DEFAULT_PAGE_CONTENT.content,
        contentSubType: CONTENT_TEST_DATA.DEFAULT_PAGE_CONTENT.contentType,
      },
      waitForSearchIndex: false,
    });
    resources.contentPreviewPage = new ContentPreviewPage(
      helpers.appManagerHomePage.page,
      siteResult.siteId,
      pageResult.contentId,
      ContentType.PAGE.toLowerCase()
    );
  }

  return resources;
}

/**
 * Handles navigation based on feed type
 * @param feedType - Type of feed (Home Feed, Site Feed, Content Feed)
 * @param resources - Created resources from createFeedResources
 * @param appManagerHomePage - Home page instance for navigation
 */
async function navigateToFeedType(feedType: string, resources: any, appManagerHomePage: any) {
  switch (feedType) {
    case 'Home Feed': {
      await appManagerHomePage.actions.clickOnGlobalFeed();
      break;
    }

    case 'Site Feed': {
      await resources.siteDashboardPage.loadPage();
      break;
    }

    case 'Content Feed': {
      await resources.contentPreviewPage.loadPage();
      break;
    }

    default:
      throw new Error(`Unknown feed type: ${feedType}`);
  }
}

test.describe(
  '@FeedCRUD - Feed Post Mention Site Topic User CRUD Operations',
  {
    tag: [ContentTestSuite.FEED_MENTION_SITE_TOPIC_USER_APP_MANAGER],
  },
  () => {
    let appManagerFeedPage: FeedPage;
    let siteDashboardPage: SiteDashboardPage;
    let contentPreviewPage: ContentPreviewPage;
    let createdPostId: any;

    // Test data for different feed types
    const feedTestData = [
      {
        feedType: 'Home Feed',
        scope: 'public',
        description:
          'Verify user is able to Add Edit Delete Text Topic Mention user Mention Site Embedded URL on Home Feed',
        storyId: 'CONT-24125',
      },
      {
        feedType: 'Site Feed',
        scope: 'site',
        description:
          'Verify user is able to Add Edit Delete Text Topic Mention user Mention Site Embedded URL on Site Feed',
        storyId: 'CONT-39353',
      },
      {
        feedType: 'Content Feed',
        scope: 'site',
        description:
          'Verify user is able to Add Edit Delete Text Topic Mention user Mention Site Embedded URL on Content Feed',
        storyId: 'CONT-24910',
      },
    ];

    // Data-driven test for different feed types
    for (const testData of feedTestData) {
      test.describe(`${testData.feedType} Tests`, () => {
        let fullName: string;
        let publicSiteName: string;
        let privateSiteName: string;
        let randomTopic: any;
        let identityManagementHelper: IdentityManagementHelper;

        test.beforeEach(
          'Setup test environment and data creation',
          async ({
            appManagerHomePage,
            appManagerApiClient,
            contentManagementHelper,
            siteManagementHelper,
            feedManagementHelper,
          }) => {
            // Configure app governance settings and enable timeline comment post(feed)
            await feedManagementHelper.configureAppGovernance({ feedMode: FEED_TEST_DATA.DEFAULT_FEED_MODE });

            // Initialize feed page
            appManagerFeedPage = new FeedPage(appManagerHomePage.page);
            identityManagementHelper = new IdentityManagementHelper(appManagerApiClient);

            // Fetch common test data via API calls
            const testDataResults = await fetchUserSiteAndTopicByOptions(
              {
                fetchUsers: true,
                fetchTopics: true,
                fetchPublicSite: true,
                fetchPrivateSite: true,
              },
              { identityManagementHelper, siteManagementHelper, contentManagementHelper }
            );

            // Set data for test use via API calls
            fullName = testDataResults.endUserInfo.fullName;
            publicSiteName = testDataResults.publicSite.name;
            privateSiteName = testDataResults.privateSite.name;

            console.log(`Found ${testDataResults.topicList.result.listOfItems.length} topics`);

            // Get random topic name from the response list
            randomTopic =
              testDataResults.topicList.result.listOfItems[
                Math.floor(Math.random() * testDataResults.topicList.result.listOfItems.length)
              ];

            // Create site and content resources based on feed type via API calls
            const resources = await createSiteAndContentByOptions(
              { siteManagementHelper, contentManagementHelper, appManagerHomePage },
              {
                createSite: testData.feedType === 'Site Feed' || testData.feedType === 'Content Feed',
                createPage: testData.feedType === 'Content Feed',
              }
            );

            // Navigate to appropriate feed type
            await navigateToFeedType(testData.feedType, resources, appManagerHomePage);
          }
        );

        test(
          `Verify user is able to Add Edit Delete Text Topic Mention user Mention Site Embedded URL on ${testData.feedType}`,
          {
            tag: [TestPriority.P0, TestGroupType.SMOKE, `@${testData.storyId}`],
          },
          async () => {
            tagTest(test.info(), {
              description: testData.description,
              zephyrTestId: testData.storyId,
              storyId: testData.storyId,
            });

            const initialPostText = TestDataGenerator.generateRandomText();
            const embeedUrl = `https://www.youtube.com/watch?v=F_77M3ZZ1z8`;

            // Step 1: Create post with mentions
            const postResult = await appManagerFeedPage.actions.createfeedWithMentionUserNameAndTopic({
              text: initialPostText,
              userName: fullName,
              topicName: randomTopic.name,
              siteName: [publicSiteName, privateSiteName],
              embedUrl: embeedUrl,
            });
            createdPostId = postResult.postId;

            // Step 2: Validate post creation
            await appManagerFeedPage.assertions.validatePostText(postResult.postText);

            // Step 3: Prepare for edit - get another user's name
            const siteManagerInfo = await identityManagementHelper.getUserInfoByEmail(users.siteManager.email);

            const updatedPostText = TestDataGenerator.generateRandomText('Updated Test Post');

            // Step 4: Edit the post
            await appManagerFeedPage.actions.editPostWithTopicAndUserName({
              currentText: postResult.postText,
              newText: updatedPostText,
              topicName: randomTopic.name,
              userName: siteManagerInfo.fullName,
            });

            // Step 5: Validate post edit
            await appManagerFeedPage.assertions.validatePostText(updatedPostText);

            // Step 6: Delete the post
            await appManagerFeedPage.actions.deletePost(updatedPostText);
            createdPostId = '';
          }
        );
      });
    }
  }
);
