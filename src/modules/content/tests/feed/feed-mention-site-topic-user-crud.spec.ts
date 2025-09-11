import { faker } from '@faker-js/faker';

import { TestPriority } from '@core/constants/testPriority';
import { TestGroupType } from '@core/constants/testType';
import { tagTest } from '@core/utils/testDecorator';

import { ContentType } from '../../constants/contentType';
import { SiteDashboardPage } from '../../pages/siteDashboardPage';

import { IdentityManagementHelper } from '@/src/core/helpers/identityManagementHelper';
import { TestDataGenerator } from '@/src/core/utils/testDataGenerator';
import { ContentTestSuite } from '@/src/modules/content/constants/testSuite';
import { contentTestFixture as test, users } from '@/src/modules/content/fixtures/contentFixture';
import { ContentPreviewPage } from '@/src/modules/content/pages/contentPreviewPage';
import { FeedPage } from '@/src/modules/content/pages/feedPage';
import { CONTENT_TEST_DATA } from '@/src/modules/content/test-data/content.test-data';
import { SiteType } from '@/src/modules/content-abac/constants/siteType';

test.describe(
  '@FeedCRUD - Feed Post Mention Site Topic User CRUD Operations',
  {
    tag: [ContentTestSuite.FEED_MENTION_SITE_TOPIC_USER_APP_MANAGER],
  },
  () => {
    let appManagerFeedPage: FeedPage;
    let createdSite: any;
    let siteDashboardPage: SiteDashboardPage;
    let siteDetails: any;
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
          async ({ appManagerHomePage, appManagerApiClient, contentManagementHelper, siteManagementHelper }) => {
            // Initialize feed page
            appManagerFeedPage = new FeedPage(appManagerHomePage.page);

            // Parallel data fetching for better performance
            identityManagementHelper = new IdentityManagementHelper(appManagerApiClient);

            const [userFullName, publicSite, privateSite, topicListResponse] = await Promise.all([
              identityManagementHelper.getUserNameByEmail(users.endUser.email),
              siteManagementHelper.getSiteByAccessType(SiteType.PUBLIC),
              siteManagementHelper.getSiteByAccessType(SiteType.PRIVATE),
              contentManagementHelper.getTopicList(),
            ]);

            // Set data for test use
            fullName = userFullName;
            publicSiteName = publicSite.name;
            privateSiteName = privateSite.name;

            console.log(`Found ${topicListResponse.result.listOfItems.length} topics`);

            // Get random topic name from the response list
            randomTopic =
              topicListResponse.result.listOfItems[
                Math.floor(Math.random() * topicListResponse.result.listOfItems.length)
              ];

            // Create required data based on feed type
            switch (testData.feedType) {
              case 'Site Feed': {
                const siteResult = await siteManagementHelper.createPublicSite({ waitForSearchIndex: false });
                siteDetails = siteResult;
                siteDashboardPage = new SiteDashboardPage(
                  appManagerHomePage.page,
                  siteResult.siteId,
                  siteManagementHelper
                );
                break;
              }

              case 'Content Feed': {
                const siteResult = await siteManagementHelper.createPublicSite({ waitForSearchIndex: false });

                const pageResult = await contentManagementHelper.createPage({
                  siteId: siteResult.siteId,
                  contentInfo: {
                    contentType: CONTENT_TEST_DATA.DEFAULT_PAGE_CONTENT.content,
                    contentSubType: CONTENT_TEST_DATA.DEFAULT_PAGE_CONTENT.contentType,
                  },
                  options: {
                    contentDescription: testData.description,
                    waitForSearchIndex: false,
                  },
                });

                siteDetails = siteResult;
                contentPreviewPage = new ContentPreviewPage(
                  appManagerHomePage.page,
                  siteResult.siteId,
                  pageResult.contentId,
                  'page'
                );
                break;
              }
            }

            // Setup navigation based on feed type
            switch (testData.feedType) {
              case 'Home Feed': {
                await appManagerHomePage.actions.clickOnGlobalFeed();
                break;
              }

              case 'Site Feed': {
                await siteDashboardPage.loadPage();
                break;
              }

              case 'Content Feed': {
                await contentPreviewPage.loadPage();
                break;
              }

              default:
                throw new Error(`Unknown feed type: ${testData.feedType}`);
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
            const siteManagerFullName = await identityManagementHelper.getUserNameByEmail(users.siteManager.email);

            const updatedPostText = TestDataGenerator.generateRandomText('Updated Test Post');

            // Step 4: Edit the post
            await appManagerFeedPage.actions.editPostWithTopicAndUserName({
              currentText: postResult.postText,
              newText: updatedPostText,
              topicName: randomTopic.name,
              userName: siteManagerFullName,
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
