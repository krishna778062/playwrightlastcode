import { faker } from '@faker-js/faker';

import { TestPriority } from '@core/constants/testPriority';
import { TestGroupType } from '@core/constants/testType';
import { tagTest } from '@core/utils/testDecorator';

import { FEED_TEST_DATA } from '../../../test-data/feed.test-data';

import { NewHomePage } from '@/src/core';
import { ContentFeatureTags } from '@/src/modules/content/constants/testTags';
import { contentTestFixture as test } from '@/src/modules/content/fixtures/contentFixture';
import { ApplicationScreenPage } from '@/src/modules/content/ui/pages/applicationsScreenPage';
import { ContentPreviewPage } from '@/src/modules/content/ui/pages/contentPreviewPage';
import { FeedPage } from '@/src/modules/content/ui/pages/feedPage';
import { ManageTopicsPage } from '@/src/modules/content/ui/pages/manageTopicsPage';
import { ProfileScreenPage } from '@/src/modules/content/ui/pages/profileScreenPage';
import { TopicDetailsPage } from '@/src/modules/content/ui/pages/topicDetailsPage';
import { SITE_TYPES } from '@/src/modules/global-search/constants/siteTypes';

test.describe('edit Topic', () => {
  let homePage: NewHomePage;
  let applicationScreenPage: ApplicationScreenPage;
  let manageTopicsPage: ManageTopicsPage;
  let topicDetailsPage: TopicDetailsPage;
  let profileScreenPage: ProfileScreenPage;

  test.beforeEach('Setup for edit topic test', async ({ appManagerFixture }) => {
    applicationScreenPage = new ApplicationScreenPage(appManagerFixture.page);
    manageTopicsPage = new ManageTopicsPage(appManagerFixture.page);
    topicDetailsPage = new TopicDetailsPage(appManagerFixture.page, '');
    profileScreenPage = new ProfileScreenPage(appManagerFixture.page, '');
  });

  test.afterEach(async ({}) => {});

  test(
    'in Zeus to verify the Edit topic - negative scenario',
    {
      tag: [TestPriority.P0, TestGroupType.SMOKE, ContentFeatureTags.EDIT_TOPICS],
    },
    async ({ appManagerFixture }) => {
      tagTest(test.info(), {
        description: 'In Zeus to verify the Edit topic - negative scenario',
        zephyrTestId: 'CONT-38095',
        storyId: 'CONT-38095',
      });
      await appManagerFixture.navigationHelper.openApplicationSettings();
      await applicationScreenPage.actions.clickOnTopics();
      await manageTopicsPage.actions.clickOnAddTopic();
      const topicName = faker.lorem.words(2);
      await manageTopicsPage.actions.fillTopicName(topicName);
      await manageTopicsPage.actions.clickOnAddButton();
      await manageTopicsPage.actions.clickOnEditTopic();
      await manageTopicsPage.actions.editTopicName(`${topicName}--__`);
      await manageTopicsPage.actions.clickOnUpdateButton();
      await manageTopicsPage.assertions.verifyErroToastMessage();
    }
  );
  test(
    'to verify search topics',
    {
      tag: [TestPriority.P0, TestGroupType.SMOKE, ContentFeatureTags.SEARCH_TOPICS],
    },
    async ({ appManagerFixture }) => {
      tagTest(test.info(), {
        description: 'To verify search topics',
        zephyrTestId: 'CONT-21059',
        storyId: 'CONT-21059',
      });
      await appManagerFixture.navigationHelper.openApplicationSettings();
      await applicationScreenPage.actions.clickOnTopics();
      await manageTopicsPage.actions.clickOnAddTopic();
      const topicName = faker.lorem.words(2);
      await manageTopicsPage.actions.fillTopicName(topicName);
      await manageTopicsPage.actions.clickOnAddButton();
      await manageTopicsPage.assertions.verifyToastMessage('Created topic successfully');
      await manageTopicsPage.actions.searchingTopicInSearchBar(topicName);
      await manageTopicsPage.assertions.verifyingTheSearhcedTopicIsVisible(topicName);
      await manageTopicsPage.actions.searchingTopicInSearchBar(`${topicName}--__`);
      await manageTopicsPage.assertions.verifyingNothingToShowHereText();
    }
  );
  test(
    'to verify topic details page in content',
    {
      tag: [TestPriority.P0, TestGroupType.SMOKE, ContentFeatureTags.TOPIC_DETAILS_CONTENT],
    },
    async ({ appManagerFixture }) => {
      tagTest(test.info(), {
        description: 'To verify topic details page in content',
        zephyrTestId: 'CONT-21076',
        storyId: 'CONT-21076',
      });
      // Create topic via API
      const topicName = faker.lorem.words(2);
      const topicInfo = await appManagerFixture.contentManagementHelper.createTopic(topicName);
      console.log('Created topic via API:', topicInfo);

      // Wait a moment for topic to be indexed
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Get the "All Employees" site ID for API page creation
      const allEmployeesSiteId = await appManagerFixture.siteManagementHelper.getSiteIdWithName('All Employees');

      // Generate random page name using faker
      const randomPageName = `${faker.company.buzzAdjective()} ${faker.company.buzzNoun()} Page`;

      // Create page using API with the topic
      const pageInfo = await appManagerFixture.contentManagementHelper.createPage({
        siteId: allEmployeesSiteId,
        contentInfo: {
          contentType: 'page',
          contentSubType: 'knowledge',
        },
        options: {
          pageName: randomPageName,
          contentDescription: 'This is a test page description',
          waitForSearchIndex: false,
          listOfTopics: [topicName],
        },
      });

      console.log(
        `Created page via API: Test Page Title with ID: ${pageInfo.contentId} and name ${pageInfo.pageName} in All Employees site: ${allEmployeesSiteId}`
      );

      // Create event using API with the same topic
      const eventName = `${faker.company.buzzAdjective()} ${faker.company.buzzNoun()} Event`;
      const eventInfo = await appManagerFixture.contentManagementHelper.createEvent({
        siteId: allEmployeesSiteId,
        contentInfo: {
          contentType: 'event',
        },
        options: {
          eventName: eventName,
          contentDescription: 'This is a test event description',
          location: 'Delhi, India',
          listOfTopics: [topicName],
        },
      });

      console.log(
        `Created event via API: ${eventName} with ID: ${eventInfo.contentId} in All Employees site: ${allEmployeesSiteId}`
      );

      // Create album using API with the same topic
      const albumName = `${faker.company.buzzAdjective()} ${faker.company.buzzNoun()} Album`;
      const albumInfo = await appManagerFixture.contentManagementHelper.createAlbum({
        siteId: allEmployeesSiteId,
        imageName: 'beach.jpg', // Use existing image file
        options: {
          albumName: albumName,
          contentDescription: 'This is a test album description',
          listOfTopics: [topicName],
        },
      });

      console.log(
        `Created album via API: ${albumName} with ID: ${albumInfo.contentId} in All Employees site: ${allEmployeesSiteId}`
      );
      await appManagerFixture.navigationHelper.openApplicationSettings();
      await applicationScreenPage.actions.clickOnTopics();
      await manageTopicsPage.actions.searchingTopicInSearchBar(topicName);
      await manageTopicsPage.actions.openingSearchedTopic(topicName);
      await topicDetailsPage.assertions.verifyingCreatedContentInTopicDetailsPage(albumName, eventName, randomPageName);
      await topicDetailsPage.actions.clickAndVerifyTheCreatedAlbum(albumName);
    }
  );
  test(
    'to verify topic details page in home & site feed',
    {
      tag: [TestPriority.P0, TestGroupType.SMOKE, ContentFeatureTags.TOPIC_DETAILS_FEED],
    },
    async ({ appManagerFixture }) => {
      tagTest(test.info(), {
        description: 'To verify topic details page incontent',
        zephyrTestId: 'CONT-40817',
        storyId: 'CONT-40817',
      });
      const topicName = faker.lorem.words(2);
      const topicInfo = await appManagerFixture.contentManagementHelper.createTopic(topicName);
      console.log('Created topic via API:', topicInfo);

      // Wait a moment for topic to be indexed
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Create home feed using API with the topic
      const feedText = `${faker.company.buzzAdjective()} ${faker.company.buzzNoun()} Home Feed Post`;
      const feedInfo = await appManagerFixture.feedManagementHelper.createFeed({
        scope: 'public', // Home feed scope
        text: feedText,
        listOfTopics: [topicName], // Pass topic name for proper mention formatting
        options: {
          waitForSearchIndex: true,
        },
      });

      console.log(`Created home feed via API: ${feedText} with ID: ${feedInfo.result.feedId}`);

      await appManagerFixture.navigationHelper.openApplicationSettings();
      await applicationScreenPage.actions.clickOnTopics();
      await manageTopicsPage.actions.searchingTopicInSearchBar(topicName);
      await manageTopicsPage.actions.openingSearchedTopic(topicName);
      await topicDetailsPage.actions.clickOnFeedTab();

      // Verify the created feed is visible in the feed tab
      await topicDetailsPage.assertions.verifyingCreatedFeedInTopicDetailsPage(feedText);
      await topicDetailsPage.actions.clickingOnUsername();
      await profileScreenPage.assertions.verifyingUserNameOnProfileScreenPage();
      await appManagerFixture.navigationHelper.openApplicationSettings();
      await applicationScreenPage.actions.clickOnTopics();
      await manageTopicsPage.actions.searchingTopicInSearchBar(topicName);
      await manageTopicsPage.actions.openingSearchedTopic(topicName);
      await topicDetailsPage.actions.clickOnFeedTab();
      await topicDetailsPage.actions.hoveringOnFeed();
      await topicDetailsPage.assertions.verifyingEllipsesOptions();
      await topicDetailsPage.assertions.verifyingFavoriteOption();
      await topicDetailsPage.actions.likingTheFeed();
      await topicDetailsPage.actions.replyingToTheFeed();
      await topicDetailsPage.actions.clickingOnShareButton();
      await topicDetailsPage.actions.clickingOnSharePostButton();
      await topicDetailsPage.assertions.verifyingSharePostToastMessage('Shared post successfully');
    }
  );

  test(
    'verify cancel behaviour of delete topic',
    {
      tag: [TestPriority.P0, TestGroupType.SMOKE, ContentFeatureTags.MANAGE_TOPICS, '@CONT-40977'],
    },
    async ({ appManagerFixture, appManagerApiFixture }) => {
      tagTest(test.info(), {
        description: 'Verify cancel behaviour of delete topic',
        zephyrTestId: 'CONT-40977',
        storyId: 'CONT-40977',
      });

      manageTopicsPage = new ManageTopicsPage(appManagerFixture.page);
      await manageTopicsPage.loadPage();
      const topicName = await manageTopicsPage.getTopicNameFromList();
      await manageTopicsPage.actions.clickOnDeleteTopic();
      await manageTopicsPage.assertions.verifyDeleteTopicPopupIsVisible();
      await manageTopicsPage.actions.clickCancelButton();
      await manageTopicsPage.assertions.verifyTopicIsVisible(topicName);
    }
  );
  test(
    'verify standard user is able to add topic in Content page/Album/Event',
    {
      tag: [TestPriority.P0, TestGroupType.SMOKE, '@CONT-25969'],
    },
    async ({ appManagerFixture }) => {
      tagTest(test.info(), {
        description: 'verify standard user is able to add topic in Content page/Album/Event',
        zephyrTestId: 'CONT-25969',
        storyId: 'CONT-25969',
      });
      const siteInfo = await appManagerFixture.siteManagementHelper.getSiteByAccessType(SITE_TYPES.PUBLIC);
      // Store topic names in array for later use
      const topicNames: string[] = [
        FEED_TEST_DATA.TOPIC_NAME_PAGE,
        FEED_TEST_DATA.TOPIC_NAME_ALBUM,
        FEED_TEST_DATA.TOPIC_NAME_EVENT,
      ];
      const pageInfo = await appManagerFixture.contentManagementHelper.createPage({
        siteId: siteInfo.siteId,
        contentInfo: { contentType: 'page', contentSubType: 'news' },
      });
      const contentPage = new ContentPreviewPage(appManagerFixture.page, siteInfo.siteId, pageInfo.contentId, 'page');
      await contentPage.loadPage();
      await contentPage.actions.clickShareThoughtsButton();
      const feedPage = new FeedPage(appManagerFixture.page);
      const postResultPage = await feedPage.actions.createAndPostWithTopic(
        `test topic ${topicNames[0]}`,
        topicNames[0]
      );
      console.log('Created feed via API for Page:', postResultPage);
      const contentAlbum = await appManagerFixture.contentManagementHelper.createAlbum({
        siteId: siteInfo.siteId,
        imageName: 'beach.jpg',
      });
      const contentAlbumPage = new ContentPreviewPage(
        appManagerFixture.page,
        siteInfo.siteId,
        contentAlbum.contentId,
        'album'
      );
      await contentAlbumPage.loadPage();
      await contentAlbumPage.actions.clickShareThoughtsButton();
      const feedAlbumPage = new FeedPage(appManagerFixture.page);
      const postResultAlbum = await feedAlbumPage.actions.createAndPostWithTopic(
        `test topic ${topicNames[1]}`,
        topicNames[1]
      );
      console.log('Created feed via API for Album:', postResultAlbum);
      const contentEvent = await appManagerFixture.contentManagementHelper.createEvent({
        siteId: siteInfo.siteId,
        contentInfo: { contentType: 'event' },
        options: {
          eventName: `test topic ${topicNames[2]}`,
        },
      });
      const contentEventPage = new ContentPreviewPage(
        appManagerFixture.page,
        siteInfo.siteId,
        contentEvent.contentId,
        'event'
      );
      await contentEventPage.loadPage();
      await contentEventPage.actions.clickShareThoughtsButton();
      const feedEventPage = new FeedPage(appManagerFixture.page);
      const postResultEvent = await feedEventPage.actions.createAndPostWithTopic(
        `test topic ${topicNames[2]}`,
        topicNames[2]
      );
      console.log('Created feed via API for Event:', postResultEvent);

      await appManagerFixture.navigationHelper.openApplicationSettings();
      await applicationScreenPage.actions.clickOnTopics();
      await manageTopicsPage.actions.searchAndVerifyMultipleTopics(topicNames);
    }
  );
});
