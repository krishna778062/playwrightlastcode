import { faker } from '@faker-js/faker';
import path from 'path';

import { TestPriority } from '@core/constants/testPriority';
import { TestGroupType } from '@core/constants/testType';
import { TestDataGenerator } from '@core/utils/testDataGenerator';
import { tagTest } from '@core/utils/testDecorator';

import { ContentType } from '@/src/modules/content/constants/contentType';
import { ContentFeatureTags } from '@/src/modules/content/constants/testTags';
import { ContentSuiteTags } from '@/src/modules/content/constants/testTags';
import { contentTestFixture as test } from '@/src/modules/content/fixtures/contentFixture';
import { FEED_TEST_DATA } from '@/src/modules/content/test-data/feed.test-data';
import { DEFAULT_PUBLIC_SITE_NAME } from '@/src/modules/content/test-data/sites-create.test-data';
import { TOPIC_TEST_DATA } from '@/src/modules/content/test-data/topic.test-data';
import { AlbumCreationPage } from '@/src/modules/content/ui/pages/albumCreationPage';
import { ApplicationScreenPage } from '@/src/modules/content/ui/pages/applicationsScreenPage';
import { ContentPreviewPage } from '@/src/modules/content/ui/pages/contentPreviewPage';
import { FeedPage } from '@/src/modules/content/ui/pages/feedPage';
import { ManageTopicsPage } from '@/src/modules/content/ui/pages/manageTopicsPage';
import { ProfileScreenPage } from '@/src/modules/content/ui/pages/profileScreenPage';
import { TopicDetailsPage } from '@/src/modules/content/ui/pages/topicDetailsPage';
import { SITE_TYPES } from '@/src/modules/global-search/constants/siteTypes';

test.describe(ContentSuiteTags.TOPIC_MANAGEMENT, () => {
  let applicationScreenPage: ApplicationScreenPage;
  let manageTopicsPage: ManageTopicsPage;
  let topicDetailsPage: TopicDetailsPage;
  let profileScreenPage: ProfileScreenPage;
  let manualCleanupNeeded: boolean = false;
  let topicId: string;
  let topicName: string;

  test.beforeEach('Setup for topic test', async ({ appManagerFixture }) => {
    applicationScreenPage = new ApplicationScreenPage(appManagerFixture.page);
    manageTopicsPage = new ManageTopicsPage(appManagerFixture.page);
    topicDetailsPage = new TopicDetailsPage(appManagerFixture.page, '');
    profileScreenPage = new ProfileScreenPage(appManagerFixture.page, '');
    manualCleanupNeeded = false;
  });

  test.afterEach(async ({ appManagerFixture }) => {
    if (manualCleanupNeeded && topicId) {
      await appManagerFixture.contentManagementHelper.deleteTopic([topicId]);
    }
  });

  test(
    'in Zeus to verify the Edit topic - negative scenario CONT-38095',
    {
      tag: [TestPriority.P0, TestGroupType.SMOKE, ContentFeatureTags.EDIT_TOPICS, '@CONT-38095'],
    },
    async ({ appManagerFixture }) => {
      tagTest(test.info(), {
        description: 'In Zeus to verify the Edit topic - negative scenario',
        zephyrTestId: 'CONT-38095',
        storyId: 'CONT-38095',
      });
      await appManagerFixture.navigationHelper.openApplicationSettings();
      await applicationScreenPage.clickOnTopics();
      await manageTopicsPage.clickOnAddTopic();
      const topicName = faker.lorem.words(2);
      await manageTopicsPage.fillTopicName(topicName);
      await manageTopicsPage.clickOnAddButton();
      await manageTopicsPage.clickOnEditTopic();
      await manageTopicsPage.editTopicName(`${topicName}--__`);
      await manageTopicsPage.clickOnUpdateButton();
      await manageTopicsPage.verifyErroToastMessage();
    }
  );
  test(
    'to verify search topics CONT-21059',
    {
      tag: [TestPriority.P0, TestGroupType.SMOKE, ContentFeatureTags.SEARCH_TOPICS, '@CONT-21059'],
    },
    async ({ appManagerFixture }) => {
      tagTest(test.info(), {
        description: 'To verify search topics',
        zephyrTestId: 'CONT-21059',
        storyId: 'CONT-21059',
      });
      await appManagerFixture.navigationHelper.openApplicationSettings();
      await applicationScreenPage.clickOnTopics();
      await manageTopicsPage.clickOnAddTopic();
      const topicName = faker.lorem.words(2);
      await manageTopicsPage.fillTopicName(topicName);
      await manageTopicsPage.clickOnAddButton();
      await manageTopicsPage.verifyToastMessageIsVisibleWithText(TOPIC_TEST_DATA.TOAST_MESSAGES.CREATED_SUCCESSFULLY);
      await manageTopicsPage.searchingTopicInSearchBar(topicName);
      await manageTopicsPage.verifyingTheSearhcedTopicIsVisible(topicName);
      await manageTopicsPage.searchingTopicInSearchBar(`${topicName}--__`);
      await manageTopicsPage.verifyingNothingToShowHereText();
    }
  );
  test(
    'to verify topic details page in content CONT-21076',
    {
      tag: [TestPriority.P0, TestGroupType.SMOKE, ContentFeatureTags.TOPIC_DETAILS_CONTENT, '@CONT-21076'],
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

      const siteId =
        await appManagerFixture.siteManagementHelper.searchSiteAndActivateIfNeeded(DEFAULT_PUBLIC_SITE_NAME);

      // Generate random page name using faker
      const randomPageName = `${faker.company.buzzAdjective()} ${faker.company.buzzNoun()} Page`;

      // Create page using API with the topic
      const pageInfo = await appManagerFixture.contentManagementHelper.createPage({
        siteId: siteId,
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
        `Created page via API: Test Page Title with ID: ${pageInfo.contentId} and name ${pageInfo.pageName} in site: ${siteId}`
      );

      // Create event using API with the same topic
      const eventName = `${faker.company.buzzAdjective()} ${faker.company.buzzNoun()} Event`;
      const eventInfo = await appManagerFixture.contentManagementHelper.createEvent({
        siteId: siteId,
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

      console.log(`Created event via API: ${eventName} with ID: ${eventInfo.contentId} in site: ${siteId}`);

      // Create album using API with the same topic
      const albumName = `${faker.company.buzzAdjective()} ${faker.company.buzzNoun()} Album`;
      const albumInfo = await appManagerFixture.contentManagementHelper.createAlbum({
        siteId: siteId,
        imageName: 'beach.jpg', // Use existing image file
        options: {
          albumName: albumName,
          contentDescription: 'This is a test album description',
          listOfTopics: [topicName],
        },
      });

      console.log(`Created album via API: ${albumName} with ID: ${albumInfo.contentId} in site: ${siteId}`);
      await appManagerFixture.navigationHelper.openApplicationSettings();
      await applicationScreenPage.clickOnTopics();
      await manageTopicsPage.searchingTopicInSearchBar(topicName);
      await manageTopicsPage.openingSearchedTopic(topicName);
      await topicDetailsPage.verifyingCreatedContentInTopicDetailsPage(albumName, eventName, randomPageName);
      await topicDetailsPage.clickAndVerifyTheCreatedAlbum(albumName);
    }
  );
  test(
    'to verify topic details page in home & site feed CONT-40817',
    {
      tag: [TestPriority.P0, TestGroupType.SMOKE, ContentFeatureTags.TOPIC_DETAILS_FEED, '@CONT-40817'],
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
          waitForSearchIndex: false,
        },
      });

      console.log(`Created home feed via API: ${feedText} with ID: ${feedInfo.result.feedId}`);

      await appManagerFixture.navigationHelper.openApplicationSettings();
      await applicationScreenPage.clickOnTopics();
      await manageTopicsPage.searchingTopicInSearchBar(topicName);
      await manageTopicsPage.openingSearchedTopic(topicName);
      await topicDetailsPage.clickOnFeedTab();

      // Verify the created feed is visible in the feed tab
      await topicDetailsPage.verifyingCreatedFeedInTopicDetailsPage(feedText);
      await topicDetailsPage.clickingOnUsername();
      await profileScreenPage.verifyingUserNameOnProfileScreenPage();
      await appManagerFixture.navigationHelper.openApplicationSettings();
      await applicationScreenPage.clickOnTopics();
      await manageTopicsPage.searchingTopicInSearchBar(topicName);
      await manageTopicsPage.openingSearchedTopic(topicName);
      await topicDetailsPage.clickOnFeedTab();
      await topicDetailsPage.hoveringOnFeed();
      await topicDetailsPage.verifyingEllipsesOptions();
      await topicDetailsPage.verifyingFavoriteOption();
      await topicDetailsPage.likingTheFeed();
      await topicDetailsPage.replyingToTheFeed();
      await topicDetailsPage.clickingOnShareButton();
      await topicDetailsPage.clickingOnSharePostButton();
      await topicDetailsPage.verifyingSharePostToastMessage('Shared post successfully');
    }
  );

  test(
    'verify cancel behaviour of delete topic CONT-40977',
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
      await manageTopicsPage.clickOnDeleteTopic();
      await manageTopicsPage.verifyDeleteTopicPopupIsVisible();
      await manageTopicsPage.clickCancelButton();
      await manageTopicsPage.verifyTopicIsVisible(topicName);
    }
  );
  test(
    'verify standard user is able to add/list topic in Content CONT-25968',
    {
      tag: [TestPriority.P0, TestGroupType.SMOKE, '@CONT-25968'],
    },
    async ({ appManagerFixture }) => {
      tagTest(test.info(), {
        description: 'Verify standard user is able to add/list topic in Content',
        zephyrTestId: 'CONT-25968',
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
      await contentPage.clickShareThoughtsButton();
      const feedPage = new FeedPage(appManagerFixture.page);
      const postResultPage = await feedPage.postEditor.createAndPostWithTopic(
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
      await contentAlbumPage.clickShareThoughtsButton();
      const feedAlbumPage = new FeedPage(appManagerFixture.page);
      const postResultAlbum = await feedAlbumPage.postEditor.createAndPostWithTopic(
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
      await contentEventPage.clickShareThoughtsButton();
      const feedEventPage = new FeedPage(appManagerFixture.page);
      const postResultEvent = await feedEventPage.postEditor.createAndPostWithTopic(
        `test topic ${topicNames[2]}`,
        topicNames[2]
      );
      console.log('Created feed via API for Event:', postResultEvent);

      await appManagerFixture.navigationHelper.openApplicationSettings();
      await applicationScreenPage.clickOnTopics();
      await manageTopicsPage.searchAndVerifyMultipleTopics(topicNames);
    }
  );

  test(
    'managing Topic Follow/Unfollow Status CONT-41028',
    {
      tag: [TestPriority.P0, TestGroupType.SMOKE, ContentFeatureTags.MANAGE_TOPICS, '@CONT-41028'],
    },
    async ({ appManagerFixture }) => {
      tagTest(test.info(), {
        description: 'Managing Topic Follow/Unfollow Status',
        zephyrTestId: 'CONT-41028',
        storyId: 'CONT-41028',
      });

      manageTopicsPage = new ManageTopicsPage(appManagerFixture.page);
      await manageTopicsPage.loadPage();

      // Open topic options dropdown and verify Follow option is visible
      await manageTopicsPage.openTopicOptionsDropdown();
      await manageTopicsPage.verifyFollowOptionIsVisible();

      // Click on Follow option
      await manageTopicsPage.clickOnFollowTopic();
      await manageTopicsPage.verifyUnfollowOptionIsVisible();

      // Click on Unfollow option
      await manageTopicsPage.clickOnUnfollowTopic();
      await manageTopicsPage.verifyFollowOptionIsVisible();
    }
  );

  test(
    'verify topic gets deleted CONT-21066',
    {
      tag: [TestPriority.P0, TestGroupType.SMOKE, ContentFeatureTags.MANAGE_TOPICS, '@CONT-21066'],
    },
    async ({ appManagerFixture }) => {
      tagTest(test.info(), {
        description: 'Verify topic gets deleted',
        zephyrTestId: 'CONT-21066',
        storyId: 'CONT-21066',
      });

      // Step 3: Click on Add topic
      manageTopicsPage = new ManageTopicsPage(appManagerFixture.page);
      await manageTopicsPage.loadPage();
      const topicName = await manageTopicsPage.getTopicNameFromList();

      // Step 7: Click on option menu dropdown and click on Delete
      await manageTopicsPage.searchingTopicInSearchBar(topicName);
      await manageTopicsPage.openTopicOptionsDropdown();
      await manageTopicsPage.clickOnDeleteTopic();
      await manageTopicsPage.verifyDeleteTopicPopupIsVisible();

      // Step 8: Click Delete confirm button
      await manageTopicsPage.clickDeleteConfirmButton();

      // Step 9: Verify the toast message
      await manageTopicsPage.verifyToastMessageIsVisibleWithText(TOPIC_TEST_DATA.TOAST_MESSAGES.DELETING_TOPIC);
      await manageTopicsPage.verifyTopicIsNotVisible(topicName);
      await manageTopicsPage.loadPage();

      // Step 10: Verify topic is deleted from manage topics page
      await manageTopicsPage.searchingTopicInSearchBar(topicName);
      await manageTopicsPage.verifyingNothingToShowHereText();
    }
  );

  test(
    'to verify on adding multiple topics with same name and spaces in manage topics page correct error message is displayed on UI CONT-31145',
    {
      tag: [TestPriority.P0, TestGroupType.SMOKE, ContentFeatureTags.MANAGE_TOPICS, '@CONT-31145'],
    },
    async ({ appManagerFixture }) => {
      tagTest(test.info(), {
        description:
          'To verify on adding multiple topics with same name and spaces in manage topics page correct error message is displayed on UI',
        zephyrTestId: 'CONT-31145',
        storyId: 'CONT-31145',
      });

      manageTopicsPage = new ManageTopicsPage(appManagerFixture.page);
      await manageTopicsPage.loadPage();
      topicName = faker.lorem.words(2);

      // Click on "Add topic" button
      topicId = await manageTopicsPage.createTopic(topicName);
      await manageTopicsPage.verifyToastMessageIsVisibleWithText(TOPIC_TEST_DATA.TOAST_MESSAGES.CREATED_SUCCESSFULLY);

      await manageTopicsPage.createDuplicateTopic(topicName);

      await manageTopicsPage.verifyToastMessageIsVisibleWithText(TOPIC_TEST_DATA.TOAST_MESSAGES.DUPLICATE_NOT_ALLOWED);
      manualCleanupNeeded = true;
    }
  );

  test(
    'manage Topics View topic list CONT-20590',
    {
      tag: [TestPriority.P0, TestGroupType.SMOKE, ContentFeatureTags.MANAGE_TOPICS, '@CONT-20590'],
    },
    async ({ appManagerFixture }) => {
      tagTest(test.info(), {
        description: 'Manage Topics View topic list',
        zephyrTestId: 'CONT-20590',
        storyId: 'CONT-20590',
      });

      manageTopicsPage = new ManageTopicsPage(appManagerFixture.page);
      await manageTopicsPage.loadPage();
      await manageTopicsPage.verifyTopicListIsVisible();
      topicName = faker.lorem.words(2);
      const existingTopicName = await manageTopicsPage.getTopicNameFromList();
      await manageTopicsPage.searchingTopicInSearchBar(existingTopicName);
      await manageTopicsPage.verifyingTheSearhcedTopicIsVisible(existingTopicName);

      topicId = await manageTopicsPage.createTopic(topicName.toLowerCase());
      await manageTopicsPage.verifyToastMessageIsVisibleWithText(TOPIC_TEST_DATA.TOAST_MESSAGES.CREATED_SUCCESSFULLY);
      await manageTopicsPage.verifyTopicIsVisible(topicName.toLowerCase());
      await manageTopicsPage.searchingTopicInSearchBar(topicName.toLowerCase());
      await manageTopicsPage.verifyingTheSearhcedTopicIsVisible(topicName.toLowerCase());
      await manageTopicsPage.editTopic(topicName.toUpperCase());
      await manageTopicsPage.verifyToastMessageIsVisibleWithText(TOPIC_TEST_DATA.TOAST_MESSAGES.EDITED_SUCCESSFULLY);
      await manageTopicsPage.verifyTopicIsVisible(topicName.toUpperCase());
      await manageTopicsPage.deleteTopic();
      await manageTopicsPage.verifyToastMessageIsVisibleWithText(TOPIC_TEST_DATA.TOAST_MESSAGES.DELETING_TOPIC);
    }
  );

  test(
    'application should allow to add/edit/delete topic when merge and delete action CONT-20591',
    {
      tag: [TestPriority.P0, TestGroupType.SMOKE, ContentFeatureTags.MANAGE_TOPICS, '@CONT-20591'],
    },
    async ({ appManagerFixture }) => {
      tagTest(test.info(), {
        description: 'Application should allow to add/edit/delete topic when merge and delete action',
        zephyrTestId: 'CONT-20591',
        storyId: 'CONT-20591',
      });

      manageTopicsPage = new ManageTopicsPage(appManagerFixture.page);
      await manageTopicsPage.loadPage();
      const firstTopicName = faker.lorem.words(2);
      await manageTopicsPage.createTopic(firstTopicName);
      await manageTopicsPage.verifyToastMessageIsVisibleWithText(TOPIC_TEST_DATA.TOAST_MESSAGES.CREATED_SUCCESSFULLY);
      const secondTopicName = faker.lorem.words(2);
      await manageTopicsPage.createTopic(secondTopicName);
      await manageTopicsPage.verifyToastMessageIsVisibleWithText(TOPIC_TEST_DATA.TOAST_MESSAGES.CREATED_SUCCESSFULLY);
      await manageTopicsPage.searchingTopicInSearchBar(firstTopicName);
      await manageTopicsPage.mergeTopic(secondTopicName);
      await manageTopicsPage.verifyToastMessageIsVisibleWithText(TOPIC_TEST_DATA.TOAST_MESSAGES.MERGING_TOPICS);
      await manageTopicsPage.verifyingNothingToShowHereText();
      await manageTopicsPage.searchingTopicInSearchBar(secondTopicName);
      await manageTopicsPage.verifyingTheSearhcedTopicIsVisible(secondTopicName);
      await manageTopicsPage.deleteTopic();
      await manageTopicsPage.verifyToastMessageIsVisibleWithText(TOPIC_TEST_DATA.TOAST_MESSAGES.DELETING_TOPIC);
    }
  );

  test(
    'verify user should be able to add new topics(with numbers and special characters) and newly added topic should be displayed on Manage Topics Screen for albums CONT-24165',
    {
      tag: [TestPriority.P0, TestGroupType.SMOKE, ContentFeatureTags.MANAGE_TOPICS, '@CONT-24165'],
    },
    async ({ appManagerFixture }) => {
      tagTest(test.info(), {
        description:
          'Verify user should be able to add new topics(with numbers and special characters) and newly added topic should be displayed on Manage Topics Screen for albums',
        zephyrTestId: 'CONT-24165',
        storyId: 'CONT-24165',
        isKnownFailure: true,
        bugTicket: 'CONT-43081',
      });

      // Generate random alphanumeric string with special characters
      const topicNameWithSpecialChars = TestDataGenerator.generateRandomAlphanumericWithSpecialChars();
      const albumCreationPage = (await appManagerFixture.navigationHelper.openCreateContentPageForContentType(
        ContentType.ALBUM
      )) as AlbumCreationPage;
      await albumCreationPage.verifyThePageIsLoaded();

      // Generate data for album

      // Upload file "image3.jpg" under content and create album with topic
      // Use path.resolve to ensure absolute path resolution
      const imagePath = path.resolve(
        __dirname,
        '..',
        '..',
        '..',
        '..',
        'test-data',
        'static-files',
        'images',
        'image3.jpg'
      );

      const albumCreationOptions = TestDataGenerator.generateAlbum({
        fileName: imagePath,
        videoUrl: TestDataGenerator.minionVideoUrl(),
        openAlbum: true,
        overrides: { topics: [topicNameWithSpecialChars] },
      });

      // Create and publish the album
      const { albumId, siteId } = await albumCreationPage.createWithTopicInDescriptionAndPublish(albumCreationOptions);

      const contentPreviewPage = new ContentPreviewPage(appManagerFixture.page, siteId, albumId, ContentType.ALBUM);
      await contentPreviewPage.verifyContentPublishedSuccessfully(
        albumCreationOptions.title,
        "Created album successfully - it's published"
      );
      await contentPreviewPage.handlePromotionPageStep();

      // Navigate to "manage/topics" page
      manageTopicsPage = new ManageTopicsPage(appManagerFixture.page);
      await manageTopicsPage.loadPage();
      await manageTopicsPage.searchingTopicInSearchBar(topicNameWithSpecialChars);
      await manageTopicsPage.verifyTopicAppearsAtTop(topicNameWithSpecialChars);
      await appManagerFixture.contentManagementHelper.deleteContent(siteId, albumId);
    }
  );

  test(
    'verify App Managers should be able to perform edit, delete, merge and follow actions on existing topic CONT-25971',
    {
      tag: [TestPriority.P0, TestGroupType.SMOKE, ContentFeatureTags.MANAGE_TOPICS, '@CONT-25971'],
    },
    async ({ appManagerFixture }) => {
      tagTest(test.info(), {
        description:
          'Verify App Managers should be able to perform edit, delete, merge and follow actions on existing topic',
        zephyrTestId: 'CONT-25971',
        storyId: 'CONT-25971',
      });

      // Navigate to manage/topics page
      await appManagerFixture.navigationHelper.openApplicationSettings();
      await applicationScreenPage.clickOnTopics();
      await manageTopicsPage.loadPage();

      // Create first topic with random alphabetic string
      const firstTopicName = faker.string.alpha({ length: 5 });
      topicId = await manageTopicsPage.createTopic(firstTopicName);
      await manageTopicsPage.verifyToastMessageIsVisibleWithText(TOPIC_TEST_DATA.TOAST_MESSAGES.CREATED_SUCCESSFULLY);
      const editedTopicName = `${firstTopicName.slice(0, 2)} ${firstTopicName.slice(2)}`;
      await manageTopicsPage.editTopic(editedTopicName);
      await manageTopicsPage.verifyToastMessageIsVisibleWithText(TOPIC_TEST_DATA.TOAST_MESSAGES.EDITED_SUCCESSFULLY);

      // Follow the topic
      await manageTopicsPage.openTopicOptionsDropdown();
      await manageTopicsPage.clickOnFollowTopic();

      // Create second topic "UI-test"
      const secondTopicName = faker.string.alpha({ length: 5 });
      const secondTopicId = await manageTopicsPage.createTopic(secondTopicName);
      await manageTopicsPage.verifyToastMessageIsVisibleWithText(TOPIC_TEST_DATA.TOAST_MESSAGES.CREATED_SUCCESSFULLY);

      // Search for the edited topic "me rge"
      await manageTopicsPage.searchingTopicInSearchBar(editedTopicName);
      await manageTopicsPage.verifyingTheSearhcedTopicIsVisible(editedTopicName);

      // Merge "me rge" into "UI-test"
      await manageTopicsPage.openTopicOptionsDropdown();
      await manageTopicsPage.mergeTopic(secondTopicName);
      await manageTopicsPage.verifyToastMessageIsVisibleWithText(TOPIC_TEST_DATA.TOAST_MESSAGES.MERGING_TOPICS);

      // Reload page to see merged topic
      await manageTopicsPage.loadPage();

      // Search for "UI-test" topic
      await manageTopicsPage.searchingTopicInSearchBar(secondTopicName);
      await manageTopicsPage.verifyingTheSearhcedTopicIsVisible(secondTopicName);

      // Delete "UI-test" topic
      await manageTopicsPage.openTopicOptionsDropdown();
      await manageTopicsPage.clickOnDeleteTopic();
      await manageTopicsPage.verifyDeleteTopicPopupIsVisible();
      await manageTopicsPage.clickDeleteConfirmButton();
      await manageTopicsPage.verifyToastMessageIsVisibleWithText(TOPIC_TEST_DATA.TOAST_MESSAGES.DELETING_TOPIC);

      // Cleanup is not needed as topics are deleted in the test
      manualCleanupNeeded = false;
    }
  );
});
