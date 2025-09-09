import { faker } from '@faker-js/faker';

import { TestPriority } from '@core/constants/testPriority';
import { TestGroupType } from '@core/constants/testType';
import { tagTest } from '@core/utils/testDecorator';

import { ContentType } from '../../constants/contentType';
import { SiteDashboardPage } from '../../pages/siteDashboardPage';

import { IdentityManagementHelper } from '@/src/core/helpers/identityManagementHelper';
import { ContentTestSuite } from '@/src/modules/content/constants/testSuite';
import { contentTestFixture as test, users } from '@/src/modules/content/fixtures/contentFixture';
import { ContentPreviewPage } from '@/src/modules/content/pages/contentPreviewPage';
import { FeedPage } from '@/src/modules/content/pages/feedPage';
import { CONTENT_TEST_DATA } from '@/src/modules/content/test-data/content.test-data';
import { SiteType } from '@/src/modules/content-abac/constants/siteType';

test.describe(
  '@FeedCRUD - Feed Post Mention Site Topic User CRUD Operations',
  {
    tag: [ContentTestSuite.FEED_APP_MANAGER],
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

    test.beforeEach('Setup test environment', async ({ appManagerHomePage, siteManagementHelper }) => {
      appManagerFeedPage = new FeedPage(appManagerHomePage.page);

      // Create site for site/content feed tests
      createdSite = await siteManagementHelper.createPublicSite({
        waitForSearchIndex: false,
      });
    });

    // Data-driven test for different feed types
    for (const testData of feedTestData) {
      test(
        `Verify user is able to Add Edit Delete Text Topic Mention user Mention Site Embedded URL on ${testData.feedType}`,
        {
          tag: [TestPriority.P0, TestGroupType.SMOKE, `@${testData.storyId}`],
        },
        async ({ appManagerHomePage, appManagerApiClient, contentManagementHelper, siteManagementHelper }) => {
          tagTest(test.info(), {
            description: testData.description,
            zephyrTestId: testData.storyId,
            storyId: testData.storyId,
          });

          // Setup navigation based on feed type
          if (testData.feedType === 'Home Feed') {
            await appManagerHomePage.actions.clickOnGlobalFeed();
            await appManagerFeedPage.verifyThePageIsLoaded();
          } else if (testData.feedType === 'Site Feed' || testData.feedType === 'Content Feed') {
            siteDetails = await siteManagementHelper.createPublicSite({
              waitForSearchIndex: false,
            });
            siteDashboardPage = new SiteDashboardPage(
              appManagerHomePage.page,
              siteDetails.siteId,
              siteManagementHelper
            );
            await siteDashboardPage.loadPage();
          } else if (testData.feedType === 'Content Feed') {
            const pageDetails = await contentManagementHelper.createSiteAndPage({
              siteId: siteDetails.siteId,
              contentInfo: {
                contentType: CONTENT_TEST_DATA.DEFAULT_PAGE_CONTENT.content,
                contentSubType: CONTENT_TEST_DATA.DEFAULT_PAGE_CONTENT.contentType,
              },
              options: {
                contentDescription: CONTENT_TEST_DATA.DEFAULT_PAGE_CONTENT.description,
                accessType: CONTENT_TEST_DATA.DEFAULT_PAGE_CONTENT.accessType,
              },
            });
            contentPreviewPage = new ContentPreviewPage(
              appManagerHomePage.page,
              siteDetails.siteId,
              pageDetails.contentId,
              ContentType.PAGE
            );
            await contentPreviewPage.loadPage();
          }
          await appManagerFeedPage.verifyThePageIsLoaded();

          const identityManagementHelper = new IdentityManagementHelper(appManagerApiClient);
          const fullName = await identityManagementHelper.getUserNameByEmail(users.endUser.email);

          const publicSite = await siteManagementHelper.getSiteByAccessType(SiteType.PUBLIC);
          const privateSite = await siteManagementHelper.getSiteByAccessType(SiteType.PRIVATE);

          if (!publicSite) {
            throw new Error('No public site found in the list');
          }

          const publicSiteName = publicSite.name;
          const privateSiteName = privateSite?.name || '';

          // Get list of topics
          const topicListResponse = await contentManagementHelper.getTopicList();

          console.log(`Found ${topicListResponse.result.listOfItems.length} topics`);

          // Get random topic name from the response list
          const randomTopic =
            topicListResponse.result.listOfItems[
              Math.floor(Math.random() * topicListResponse.result.listOfItems.length)
            ];

          const initialPostText = `Automated Test Post ${faker.company.name()}`;
          const embeedUrl = `https://www.youtube.com/watch?v=F_77M3ZZ1z8`;

          const postResult = await appManagerFeedPage.actions.createfeedWithMentionUserNameAndTopic({
            text: initialPostText,
            userName: fullName,
            topicName: randomTopic.name,
            siteName: [publicSiteName, privateSiteName],
            embedUrl: embeedUrl,
          });
          createdPostId = postResult.postId;

          await appManagerFeedPage.assertions.validatePostText(postResult.postText);

          const updatedPostText = `Updated Test Post ${faker.company.buzzPhrase()}`;
          const siteManagerFullName = await identityManagementHelper.getUserNameByEmail(users.siteManager.email);
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
  }
);
