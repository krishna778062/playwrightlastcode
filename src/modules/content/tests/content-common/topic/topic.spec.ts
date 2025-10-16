import { faker } from '@faker-js/faker';

import { TestPriority } from '@core/constants/testPriority';
import { TestGroupType } from '@core/constants/testType';
import { tagTest } from '@core/utils/testDecorator';

import { NewHomePage } from '@/src/core';
import { ContentFeatureTags } from '@/src/modules/content/constants/testTags';
import { contentTestFixture as test } from '@/src/modules/content/fixtures/contentFixture';
import { ApplicationScreenPage } from '@/src/modules/content/ui/pages/applicationscreenPage';
import { ManageTopicsPage } from '@/src/modules/content/ui/pages/manageTopicsPage';
import { TopicDetailsPage } from '@/src/modules/content/ui/pages/topicDetailsPage';

test.describe('edit Topic', () => {
  let homePage: NewHomePage;
  let applicationScreenPage: ApplicationScreenPage;
  let manageTopicsPage: ManageTopicsPage;
  let topicDetailsPage: TopicDetailsPage;

  test.beforeEach('Setup for edit topic test', async ({ appManagerFixture }) => {
    applicationScreenPage = new ApplicationScreenPage(appManagerFixture.page);
    manageTopicsPage = new ManageTopicsPage(appManagerFixture.page);
    topicDetailsPage = new TopicDetailsPage(appManagerFixture.page, '');
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
    'to verify topic details content',
    {
      tag: [TestPriority.P0, TestGroupType.SMOKE, ContentFeatureTags.TOPIC_DETAILS_CONTENT],
    },
    async ({ appManagerFixture }) => {
      tagTest(test.info(), {
        description: 'To verify topic details content',
        zephyrTestId: 'CONT-21076',
        storyId: 'CONT-21076',
      });
      // await appManagerFixture.navigationHelper.openApplicationSettings();
      // await applicationScreenPage.actions.clickOnTopics();
      // await manageTopicsPage.actions.clickOnAddTopic();
      // const topicName = faker.lorem.words(2);
      // await manageTopicsPage.actions.fillTopicName(topicName);
      // await manageTopicsPage.actions.clickOnAddButton();
      // console.log('topicName :   ', topicName);
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
      await manageTopicsPage.actions.openingSearchedTopic();
      await topicDetailsPage.assertions.verifyingCreatedContentInTopicDetailsPage(albumName, eventName, randomPageName);
      await topicDetailsPage.actions.clickAndVerifyTheCreatedAlbum(albumName);
    }
  );
});
