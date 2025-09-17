import { faker } from '@faker-js/faker';

import { TestPriority } from '@core/constants/testPriority';
import { TestGroupType } from '@core/constants/testType';
import { tagTest } from '@core/utils/testDecorator';

import { SiteDashboardPage } from '../../pages/sitePages/siteDashboardPage';

import { API_ENDPOINTS } from '@/src/core/constants/apiEndpoints';
import { IdentityManagementHelper } from '@/src/core/helpers/identityManagementHelper';
import { SiteManagementHelper } from '@/src/core/helpers/siteManagementHelper';
import { ContentTestSuite } from '@/src/modules/content/constants/testSuite';
import { contentTestFixture as test, users } from '@/src/modules/content/fixtures/contentFixture';
import { FeedPage } from '@/src/modules/content/pages/feedPage';
import { SITE_TEST_DATA } from '@/src/modules/content/test-data/sites-create.test-data';
import { SiteType } from '@/src/modules/content-abac/constants/siteType';

test.describe(
  '@FeedCRUD - Feed Post Add, Edit, Delete Operations',
  {
    tag: [ContentTestSuite.FEED_APP_MANAGER],
  },
  () => {
    let appManagerFeedPage: FeedPage;
    let createdPostText: string;
    let createdPostId: string = '';
    let createdSite: any;
    let siteDashboardPage: SiteDashboardPage;

    test.beforeEach('Login with Application Manager and navigate to feed', async ({ appManagerHomePage }) => {
      appManagerFeedPage = new FeedPage(appManagerHomePage.page);
      await appManagerHomePage.actions.clickOnGlobalFeed();
      await appManagerFeedPage.verifyThePageIsLoaded();
    });

    test(
      'In Zeus Verify user is able to Add Edit Delete Text Topic Mention user Mention Site Embedded URL on Home Feed',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, '@CONT-24125'],
      },
      async ({ appManagerHomePage, appManagerApiClient, contentManagementHelper, siteManagementHelper }) => {
        tagTest(test.info(), {
          description:
            'Verify user is able to Add Edit Delete Text Topic Mention user Mention Site Embedded URL on Home Feed',
          zephyrTestId: 'CONT-24125',
          storyId: 'CONT-24125',
        });

        const identityManagementHelper = new IdentityManagementHelper(appManagerApiClient);
        const userInfo = await identityManagementHelper.getUserInfoByEmail(users.endUser.email);

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
          topicListResponse.result.listOfItems[Math.floor(Math.random() * topicListResponse.result.listOfItems.length)];

        const initialPostText = `Automated Test Post ${faker.company.name()}`;
        const embeedUrl = `https://www.youtube.com/watch?v=F_77M3ZZ1z8`;

        const postResult = await appManagerFeedPage.actions.createfeedWithMentionUserNameAndTopic({
          text: initialPostText,
          userName: userInfo.fullName,
          topicName: randomTopic.name,
          siteName: [publicSiteName, privateSiteName],
          embedUrl: embeedUrl,
        });

        await appManagerFeedPage.assertions.validatePostText(postResult.postText);

        const updatedPostText = `Updated Test Post ${faker.company.buzzPhrase()}`;
        const siteManagerInfo = await identityManagementHelper.getUserInfoByEmail(users.siteManager.email);
        // Step 3: Edit the post
        await appManagerFeedPage.actions.editPostWithTopicAndUserName({
          currentText: postResult.postText,
          newText: updatedPostText,
          topicName: randomTopic.name,
          userName: siteManagerInfo.fullName,
        });
        await appManagerFeedPage.assertions.validatePostText(updatedPostText);

        // Step 4: Delete the post
        await appManagerFeedPage.actions.deletePost(updatedPostText);
        createdPostId = '';
      }
    );

    test(
      'Verify user is able to Add Edit Delete Text Topic Mention user Mention Site Embedded URL on Site Feed',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, '@CONT-39353'],
      },
      async ({ appManagerHomePage, appManagerApiClient, contentManagementHelper, siteManagementHelper }) => {
        tagTest(test.info(), {
          description:
            'Verify user is able to Add Edit Delete Text Topic Mention user Mention Site Embedded URL on Site Feed',
          zephyrTestId: 'CONT-39353',
          storyId: 'CONT-39353',
        });

        const category = await appManagerApiClient.getSiteManagementService().getCategoryId(SITE_TEST_DATA[0].category);
        createdSite = await siteManagementHelper.createPublicSite({
          category,
          waitForSearchIndex: false,
        });

        // Store the site ID for page publishing
        const siteIdToPublishPage = createdSite.siteId;
        // Navigate from site dashboard to page creation
        siteDashboardPage = new SiteDashboardPage(appManagerHomePage.page, siteIdToPublishPage);
        console.log(`Created site: ${createdSite.siteName} with ID: ${createdSite.siteId}`);
        //flow
        await siteDashboardPage.loadPage();

        const identityManagementHelper = new IdentityManagementHelper(appManagerApiClient);
        const userInfo = await identityManagementHelper.getUserInfoByEmail(users.endUser.email);

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
          topicListResponse.result.listOfItems[Math.floor(Math.random() * topicListResponse.result.listOfItems.length)];

        const initialPostText = `Automated Test Post ${faker.company.name()}`;
        const embeedUrl = `https://www.youtube.com/watch?v=F_77M3ZZ1z8`;

        const postResult = await appManagerFeedPage.actions.createfeedWithMentionUserNameAndTopic({
          text: initialPostText,
          userName: userInfo.fullName,
          topicName: randomTopic.name,
          siteName: [publicSiteName, privateSiteName],
          embedUrl: embeedUrl,
        });

        await appManagerFeedPage.assertions.validatePostText(postResult.postText);

        const updatedPostText = `Updated Test Post ${faker.company.buzzPhrase()}`;
        const siteManagerInfo = await identityManagementHelper.getUserInfoByEmail(users.siteManager.email);
        // Step 3: Edit the post
        await appManagerFeedPage.actions.editPostWithTopicAndUserName({
          currentText: postResult.postText,
          newText: updatedPostText,
          topicName: randomTopic.name,
          userName: siteManagerInfo.fullName,
        });
        await appManagerFeedPage.assertions.validatePostText(updatedPostText);

        // Step 4: Delete the post
        await appManagerFeedPage.actions.deletePost(updatedPostText);
        createdPostId = '';
      }
    );
  }
);
