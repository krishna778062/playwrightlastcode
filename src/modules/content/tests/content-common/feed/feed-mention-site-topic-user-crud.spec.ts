import { TestPriority } from '@core/constants/testPriority';
import { TestGroupType } from '@core/constants/testType';
import { tagTest } from '@core/utils/testDecorator';

import { getContentConfigFromCache } from '../../../config/contentConfig';

import { TestDataGenerator } from '@/src/core/utils/testDataGenerator';
import { ContentType } from '@/src/modules/content/constants/contentType';
import { SITE_TYPES } from '@/src/modules/content/constants/siteTypes';
import { ContentTestSuite } from '@/src/modules/content/constants/testSuite';
import { contentTestFixture as test, users } from '@/src/modules/content/fixtures/contentFixture';
import { FEED_TEST_DATA } from '@/src/modules/content/test-data/feed.test-data';
import { ContentPreviewPage } from '@/src/modules/content/ui/pages/contentPreviewPage';
import { FeedPage } from '@/src/modules/content/ui/pages/feedPage';
import { SiteDashboardPage } from '@/src/modules/content/ui/pages/siteDashboardPage';
import { IdentityManagementHelper } from '@/src/modules/platforms/apis/helpers/identityManagementHelper';

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
    requests.push(helpers.siteManagementHelper.getSiteByAccessType(SITE_TYPES.PUBLIC));
    dataKeys.push('publicSite');
  }

  if (options.fetchPrivateSite) {
    requests.push(helpers.siteManagementHelper.getSiteByAccessType(SITE_TYPES.PRIVATE));
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
 * @param helpers - Required helper instances
 * @param testData - Test data configuration
 * @returns Promise with created resources
 */
async function getPrerequisiteData(
  helpers: {
    siteManagementHelper: any;
    contentManagementHelper: any;
  },
  testData: any
) {
  const resources: any = {};

  // Create site only once, even if both createSite and createPage are true
  if (testData.feedType === 'Site Feed') {
    const siteResult = await helpers.siteManagementHelper.getSiteWithAccessType({ accessType: 'public' });
    resources.siteId = siteResult;
  }

  if (testData.feedType === 'Content Feed') {
    const response = await helpers.contentManagementHelper.getContentId();
    resources.contentId = response.contentId;
    resources.siteId = response.siteId;
  }

  return resources;
}

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
  test.describe(
    `${testData.feedType} Tests`,
    {
      tag: [ContentTestSuite.FEED_MENTION_SITE_TOPIC_USER_APP_MANAGER],
    },
    () => {
      let appManagerFeedPage: FeedPage;
      let createdPostId: any;
      let fullName: string;
      let publicSiteName: string;
      let privateSiteName: string;
      let randomTopic: any;
      let identityManagementHelper: IdentityManagementHelper;

      test.beforeEach(
        'Setup test environment and data creation',
        async ({
          appManagerHomePage,
          appManagerApiContext,
          contentManagementHelper,
          siteManagementHelper,
          feedManagementHelper,
        }) => {
          // Configure app governance settings and enable timeline comment post(feed)
          await feedManagementHelper.configureAppGovernance({ feedMode: FEED_TEST_DATA.DEFAULT_FEED_MODE });

          // Initialize feed page
          appManagerFeedPage = new FeedPage(appManagerHomePage.page);
          identityManagementHelper = new IdentityManagementHelper(
            appManagerApiContext,
            getContentConfigFromCache().tenant.apiBaseUrl
          );

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

          // Get prerequisite data based on feed type
          const resources = await getPrerequisiteData({ siteManagementHelper, contentManagementHelper }, testData);

          // Navigate to appropriate feed type
          if (testData.feedType === 'Home Feed') {
            await appManagerHomePage.actions.clickOnGlobalFeed();
          } else if (testData.feedType === 'Site Feed') {
            const siteDashboardPage = new SiteDashboardPage(appManagerHomePage.page, resources.siteId);
            await siteDashboardPage.loadPage();
            await siteDashboardPage.actions.clickOnFeedLink();
          } else if (testData.feedType === 'Content Feed') {
            const contentPreviewPage = new ContentPreviewPage(
              appManagerHomePage.page,
              resources.siteId,
              resources.contentId,
              ContentType.PAGE.toLowerCase()
            );
            await contentPreviewPage.loadPage();
          }
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
    }
  );
}
