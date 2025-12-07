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

      const siteId = await appManagerFixture.siteManagementHelper.getSiteIdWithName('All Employees');

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
          waitForSearchIndex: false,
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
    'verify standard user is able to add/list topic in Content',
    {
      tag: [TestPriority.P0, TestGroupType.SMOKE, '@CONT-25969'],
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
      await manageTopicsPage.assertions.searchAndVerifyMultipleTopics(topicNames);
    }
  );

  test(
    'managing Topic Follow/Unfollow Status',
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
      await manageTopicsPage.actions.openTopicOptionsDropdown();
      await manageTopicsPage.assertions.verifyFollowOptionIsVisible();

      // Click on Follow option
      await manageTopicsPage.actions.clickOnFollowTopic();
      await manageTopicsPage.assertions.verifyUnfollowOptionIsVisible();

      // Click on Unfollow option
      await manageTopicsPage.actions.clickOnUnfollowTopic();
      await manageTopicsPage.assertions.verifyFollowOptionIsVisible();
    }
  );

  test(
    'verify topic gets deleted',
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
      await manageTopicsPage.actions.searchingTopicInSearchBar(topicName);
      await manageTopicsPage.actions.openTopicOptionsDropdown();
      await manageTopicsPage.actions.clickOnDeleteTopic();
      await manageTopicsPage.assertions.verifyDeleteTopicPopupIsVisible();

      // Step 8: Click Delete confirm button
      await manageTopicsPage.actions.clickDeleteConfirmButton();

      // Step 9: Verify the toast message
      await manageTopicsPage.assertions.verifyToastMessage('Deleting topic… this may take some time');
      await manageTopicsPage.assertions.verifyTopicIsNotVisible(topicName);
      await manageTopicsPage.loadPage();

      // Step 10: Verify topic is deleted from manage topics page
      await manageTopicsPage.actions.searchingTopicInSearchBar(topicName);
      await manageTopicsPage.assertions.verifyingNothingToShowHereText();
    }
  );

  test(
    'to verify on adding multiple topics with same name and spaces in manage topics page correct error message is displayed on UI',
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
      topicId = await manageTopicsPage.actions.createTopic(topicName);
      await manageTopicsPage.assertions.verifyToastMessage('Created topic successfully');

      await manageTopicsPage.actions.createDuplicateTopic(topicName);

      await manageTopicsPage.assertions.verifyToastMessage('Duplicate topics are not allowed.');
      manualCleanupNeeded = true;
    }
  );

  test(
    'manage Topics View topic list',
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
      await manageTopicsPage.assertions.verifyTopicListIsVisible();
      topicName = faker.lorem.words(2);
      const existingTopicName = await manageTopicsPage.actions.getTopicNameFromList();
      await manageTopicsPage.actions.searchingTopicInSearchBar(existingTopicName);
      await manageTopicsPage.assertions.verifyingTheSearhcedTopicIsVisible(existingTopicName);

      topicId = await manageTopicsPage.actions.createTopic(topicName.toLowerCase());
      await manageTopicsPage.assertions.verifyToastMessage('Created topic successfully');
      await manageTopicsPage.assertions.verifyTopicIsVisible(topicName.toLowerCase());
      await manageTopicsPage.actions.searchingTopicInSearchBar(topicName.toLowerCase());
      await manageTopicsPage.assertions.verifyingTheSearhcedTopicIsVisible(topicName.toLowerCase());
      await manageTopicsPage.actions.editTopic(topicName.toUpperCase());
      await manageTopicsPage.assertions.verifyToastMessage('Edited topic successfully');
      await manageTopicsPage.assertions.verifyTopicIsVisible(topicName.toUpperCase());
      await manageTopicsPage.actions.deleteTopic();
      await manageTopicsPage.assertions.verifyToastMessage('Deleting topic… this may take some time');
    }
  );

  test(
    'application should allow to add/edit/delete topic when merge and delete action',
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
      await manageTopicsPage.actions.createTopic(firstTopicName);
      await manageTopicsPage.assertions.verifyToastMessage('Created topic successfully');
      const secondTopicName = faker.lorem.words(2);
      await manageTopicsPage.actions.createTopic(secondTopicName);
      await manageTopicsPage.assertions.verifyToastMessage('Created topic successfully');
      await manageTopicsPage.actions.searchingTopicInSearchBar(firstTopicName);
      await manageTopicsPage.actions.mergeTopic(secondTopicName);
      await manageTopicsPage.assertions.verifyToastMessage('Merging topics… this may take some time');
      await manageTopicsPage.assertions.verifyingNothingToShowHereText();
      await manageTopicsPage.actions.searchingTopicInSearchBar(secondTopicName);
      await manageTopicsPage.assertions.verifyingTheSearhcedTopicIsVisible(secondTopicName);
      await manageTopicsPage.actions.deleteTopic();
      await manageTopicsPage.assertions.verifyToastMessage('Deleting topic… this may take some time');
    }
  );

  test(
    'verify user should be able to add new topics(with numbers and special characters) and newly added topic should be displayed on Manage Topics Screen for albums',
    {
      tag: [TestPriority.P0, TestGroupType.SMOKE, ContentFeatureTags.MANAGE_TOPICS, '@CONT-24165'],
    },
    async ({ appManagerFixture }) => {
      tagTest(test.info(), {
        description:
          'Verify user should be able to add new topics(with numbers and special characters) and newly added topic should be displayed on Manage Topics Screen for albums',
        zephyrTestId: 'CONT-24165',
        storyId: 'CONT-24165',
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
      const { albumId, siteId } =
        await albumCreationPage.actions.createWithTopicInDescriptionAndPublish(albumCreationOptions);

      const contentPreviewPage = new ContentPreviewPage(appManagerFixture.page, siteId, albumId, ContentType.ALBUM);
      await contentPreviewPage.assertions.verifyContentPublishedSuccessfully(
        albumCreationOptions.title,
        "Created album successfully - it's published"
      );
      await contentPreviewPage.actions.handlePromotionPageStep();

      // Navigate to "manage/topics" page
      manageTopicsPage = new ManageTopicsPage(appManagerFixture.page);
      await manageTopicsPage.loadPage();
      await manageTopicsPage.actions.searchingTopicInSearchBar(topicNameWithSpecialChars);
      await manageTopicsPage.assertions.verifyTopicAppearsAtTop(topicNameWithSpecialChars);
      await appManagerFixture.contentManagementHelper.deleteContent(siteId, albumId);
    }
  );

  test(
    'verify App Managers should be able to perform edit, delete, merge and follow actions on existing topic',
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
      await applicationScreenPage.actions.clickOnTopics();
      await manageTopicsPage.loadPage();

      // Create first topic with random alphabetic string
      const firstTopicName = faker.string.alpha({ length: 5 });
      topicId = await manageTopicsPage.actions.createTopic(firstTopicName);
      await manageTopicsPage.assertions.verifyToastMessage('Created topic successfully');
      const editedTopicName = `${firstTopicName.slice(0, 2)} ${firstTopicName.slice(2)}`;
      await manageTopicsPage.actions.editTopic(editedTopicName);
      await manageTopicsPage.assertions.verifyToastMessage('Edited topic successfully');

      // Follow the topic
      await manageTopicsPage.actions.openTopicOptionsDropdown();
      await manageTopicsPage.actions.clickOnFollowTopic();

      // Create second topic "UI-test"
      const secondTopicName = faker.string.alpha({ length: 5 });
      const secondTopicId = await manageTopicsPage.actions.createTopic(secondTopicName);
      await manageTopicsPage.assertions.verifyToastMessage('Created topic successfully');

      // Search for the edited topic "me rge"
      await manageTopicsPage.actions.searchingTopicInSearchBar(editedTopicName);
      await manageTopicsPage.assertions.verifyingTheSearhcedTopicIsVisible(editedTopicName);

      // Merge "me rge" into "UI-test"
      await manageTopicsPage.actions.openTopicOptionsDropdown();
      await manageTopicsPage.actions.mergeTopic(secondTopicName);
      await manageTopicsPage.assertions.verifyToastMessage('Merging topics… this may take some time');

      // Reload page to see merged topic
      await manageTopicsPage.loadPage();

      // Search for "UI-test" topic
      await manageTopicsPage.actions.searchingTopicInSearchBar(secondTopicName);
      await manageTopicsPage.assertions.verifyingTheSearhcedTopicIsVisible(secondTopicName);

      // Delete "UI-test" topic
      await manageTopicsPage.actions.openTopicOptionsDropdown();
      await manageTopicsPage.actions.clickOnDeleteTopic();
      await manageTopicsPage.assertions.verifyDeleteTopicPopupIsVisible();
      await manageTopicsPage.actions.clickDeleteConfirmButton();
      await manageTopicsPage.assertions.verifyToastMessage('Deleting topic… this may take some time');

      // Cleanup is not needed as topics are deleted in the test
      manualCleanupNeeded = false;
    }
  );
});
