import { faker } from '@faker-js/faker';

import { TestPriority } from '@core/constants/testPriority';
import { TestGroupType } from '@core/constants/testType';
import { tagTest } from '@core/utils/testDecorator';

import { TestDataGenerator } from '@/src/core/utils/testDataGenerator';
import { ContentType } from '@/src/modules/content/constants/contentType';
import { ContentFeatureTags } from '@/src/modules/content/constants/testTags';
import { ContentSuiteTags } from '@/src/modules/content/constants/testTags';
import { contentTestFixture as test } from '@/src/modules/content/fixtures/contentFixture';
import { CONTENT_TEST_DATA } from '@/src/modules/content/test-data/content.test-data';
import { FILE_TEST_DATA } from '@/src/modules/content/test-data/file.test-data';
import { DEFAULT_PUBLIC_SITE_NAME } from '@/src/modules/content/test-data/sites-create.test-data';
import { TOPIC_TEST_DATA } from '@/src/modules/content/test-data/topic.test-data';
import { AlbumCreationPage } from '@/src/modules/content/ui/pages/albumCreationPage';
import { ApplicationScreenPage } from '@/src/modules/content/ui/pages/applicationsScreenPage';
import { ContentPreviewPage } from '@/src/modules/content/ui/pages/contentPreviewPage';
import { ManageTopicsPage } from '@/src/modules/content/ui/pages/manageTopicsPage';
import { ProfileScreenPage } from '@/src/modules/content/ui/pages/profileScreenPage';
import { TopicDetailsPage } from '@/src/modules/content/ui/pages/topicDetailsPage';

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
    'ABAC in Zeus to verify the Edit topic - negative scenario CONT-44955',
    {
      tag: [TestPriority.P0, TestGroupType.SMOKE, ContentFeatureTags.EDIT_TOPICS, '@CONT-44955'],
    },
    async ({ appManagerFixture }) => {
      tagTest(test.info(), {
        description: 'In Zeus to verify the Edit topic - negative scenario',
        zephyrTestId: 'CONT-44955',
        storyId: 'CONT-44955',
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
      await manageTopicsPage.verifyErrorToastMessage();
    }
  );
  test(
    'ABAC to verify search topics CONT-44954',
    {
      tag: [TestPriority.P0, TestGroupType.SMOKE, ContentFeatureTags.SEARCH_TOPICS, '@CONT-44954'],
    },
    async ({ appManagerFixture }) => {
      tagTest(test.info(), {
        description: 'To verify search topics',
        zephyrTestId: 'CONT-44954',
        storyId: 'CONT-44954',
      });
      await appManagerFixture.navigationHelper.openApplicationSettings();
      await applicationScreenPage.clickOnTopics();
      await manageTopicsPage.clickOnAddTopic();
      const topicName = faker.lorem.words(2);
      await manageTopicsPage.fillTopicName(topicName);
      await manageTopicsPage.clickOnAddButton();
      await manageTopicsPage.verifyToastMessage(TOPIC_TEST_DATA.TOAST_MESSAGES.CREATED_SUCCESSFULLY);
      await manageTopicsPage.searchingTopicInSearchBar(topicName);
      await manageTopicsPage.verifyingTheSearchedTopicIsVisible(topicName);
      await manageTopicsPage.searchingTopicInSearchBar(`${topicName}--__`);
      await manageTopicsPage.verifyingNothingToShowHereText();
    }
  );
  test(
    'ABAC to verify topic details page in content CONT-44956',
    {
      tag: [TestPriority.P0, TestGroupType.SMOKE, ContentFeatureTags.TOPIC_DETAILS_CONTENT, '@CONT-44956'],
    },
    async ({ appManagerFixture }) => {
      tagTest(test.info(), {
        description: 'To verify topic details page in content',
        zephyrTestId: 'CONT-44956',
        storyId: 'CONT-44956',
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
        `Created page via API: Test Page Title with ID:
        ${pageInfo.contentId} and name ${pageInfo.pageName} in site: ${siteId}`
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
    'ABAC to verify topic details page in home & site feed CONT-44957',
    {
      tag: [TestPriority.P0, TestGroupType.SMOKE, ContentFeatureTags.TOPIC_DETAILS_FEED, '@CONT-44957'],
    },
    async ({ appManagerFixture }) => {
      tagTest(test.info(), {
        description: 'To verify topic details page incontent',
        zephyrTestId: 'CONT-44957',
        storyId: 'CONT-44957',
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
    'verify cancel behavior of delete topic CONT-44959',
    {
      tag: [TestPriority.P0, TestGroupType.SMOKE, ContentFeatureTags.MANAGE_TOPICS, '@CONT-44959'],
    },
    async ({ appManagerFixture }) => {
      tagTest(test.info(), {
        description: 'Verify cancel behavior of delete topic',
        zephyrTestId: 'CONT-44959',
        storyId: 'CONT-44959',
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
    'managing Topic Follow/Unfollow Status CONT-44960',
    {
      tag: [TestPriority.P0, TestGroupType.SMOKE, ContentFeatureTags.MANAGE_TOPICS, '@CONT-44960'],
    },
    async ({ appManagerFixture }) => {
      tagTest(test.info(), {
        description: 'Managing Topic Follow/Unfollow Status',
        zephyrTestId: 'CONT-44960',
        storyId: 'CONT-44960',
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
    'verify topic gets deleted CONT-44961',
    {
      tag: [TestPriority.P0, TestGroupType.SMOKE, ContentFeatureTags.MANAGE_TOPICS, '@CONT-44961'],
    },
    async ({ appManagerFixture }) => {
      tagTest(test.info(), {
        description: 'Verify topic gets deleted',
        zephyrTestId: 'CONT-44961',
        storyId: 'CONT-44961',
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
      await manageTopicsPage.verifyToastMessage(TOPIC_TEST_DATA.TOAST_MESSAGES.DELETING_TOPIC);
      await manageTopicsPage.verifyTopicIsNotVisible(topicName);
      await manageTopicsPage.loadPage();

      // Step 10: Verify topic is deleted from manage topics page
      await manageTopicsPage.searchingTopicInSearchBar(topicName);
      await manageTopicsPage.verifyingNothingToShowHereText();
    }
  );

  test(
    'to verify on adding multiple topics with same name and spaces in manage topics page correct error message is displayed on UI CONT-44962',
    {
      tag: [TestPriority.P0, TestGroupType.SMOKE, ContentFeatureTags.MANAGE_TOPICS, '@CONT-44962'],
    },
    async ({ appManagerFixture }) => {
      tagTest(test.info(), {
        description:
          'To verify on adding multiple topics with same name and spaces in manage topics page correct error message is displayed on UI',
        zephyrTestId: 'CONT-44962',
        storyId: 'CONT-44962',
      });

      manageTopicsPage = new ManageTopicsPage(appManagerFixture.page);
      await manageTopicsPage.loadPage();
      topicName = faker.lorem.words(2);

      // Click on "Add topic" button
      topicId = await manageTopicsPage.createTopic(topicName);
      await manageTopicsPage.verifyToastMessage(TOPIC_TEST_DATA.TOAST_MESSAGES.CREATED_SUCCESSFULLY);

      await manageTopicsPage.createDuplicateTopic(topicName);

      await manageTopicsPage.verifyToastMessage(TOPIC_TEST_DATA.TOAST_MESSAGES.DUPLICATE_NOT_ALLOWED);
      manualCleanupNeeded = true;
    }
  );

  test(
    'manage Topics View topic list CONT-44963',
    {
      tag: [TestPriority.P0, TestGroupType.SMOKE, ContentFeatureTags.MANAGE_TOPICS, '@CONT-44963'],
    },
    async ({ appManagerFixture }) => {
      tagTest(test.info(), {
        description: 'Manage Topics View topic list',
        zephyrTestId: 'CONT-44963',
        storyId: 'CONT-44963',
      });

      manageTopicsPage = new ManageTopicsPage(appManagerFixture.page);
      await manageTopicsPage.loadPage();
      await manageTopicsPage.verifyTopicListIsVisible();
      topicName = faker.lorem.words(2);
      const existingTopicName = await manageTopicsPage.getTopicNameFromList();
      await manageTopicsPage.searchingTopicInSearchBar(existingTopicName);
      await manageTopicsPage.verifyingTheSearchedTopicIsVisible(existingTopicName);

      topicId = await manageTopicsPage.createTopic(topicName.toLowerCase());
      await manageTopicsPage.verifyToastMessage(TOPIC_TEST_DATA.TOAST_MESSAGES.CREATED_SUCCESSFULLY);
      await manageTopicsPage.verifyTopicIsVisible(topicName.toLowerCase());
      await manageTopicsPage.searchingTopicInSearchBar(topicName.toLowerCase());
      await manageTopicsPage.verifyingTheSearchedTopicIsVisible(topicName.toLowerCase());
      await manageTopicsPage.editTopic(topicName.toUpperCase());
      await manageTopicsPage.verifyToastMessage(TOPIC_TEST_DATA.TOAST_MESSAGES.EDITED_SUCCESSFULLY);
      await manageTopicsPage.verifyTopicIsVisible(topicName.toUpperCase());
      await manageTopicsPage.deleteTopic();
      await manageTopicsPage.verifyToastMessage(TOPIC_TEST_DATA.TOAST_MESSAGES.DELETING_TOPIC);
    }
  );

  test(
    'application should allow to add/edit/delete topic when merge and delete action CONT-44964',
    {
      tag: [TestPriority.P0, TestGroupType.SMOKE, ContentFeatureTags.MANAGE_TOPICS, '@CONT-44964'],
    },
    async ({ appManagerFixture }) => {
      tagTest(test.info(), {
        description: 'Application should allow to add/edit/delete topic when merge and delete action',
        zephyrTestId: 'CONT-44964',
        storyId: 'CONT-44964',
      });

      manageTopicsPage = new ManageTopicsPage(appManagerFixture.page);
      await manageTopicsPage.loadPage();
      const firstTopicName = faker.lorem.words(2);
      await manageTopicsPage.createTopic(firstTopicName);
      await manageTopicsPage.verifyToastMessage(TOPIC_TEST_DATA.TOAST_MESSAGES.CREATED_SUCCESSFULLY);
      const secondTopicName = faker.lorem.words(2);
      await manageTopicsPage.createTopic(secondTopicName);
      await manageTopicsPage.verifyToastMessage(TOPIC_TEST_DATA.TOAST_MESSAGES.CREATED_SUCCESSFULLY);
      await manageTopicsPage.searchingTopicInSearchBar(firstTopicName);
      await manageTopicsPage.mergeTopic(secondTopicName);
      await manageTopicsPage.verifyToastMessage(TOPIC_TEST_DATA.TOAST_MESSAGES.MERGING_TOPICS);
      await manageTopicsPage.verifyingNothingToShowHereText();
      await manageTopicsPage.searchingTopicInSearchBar(secondTopicName);
      await manageTopicsPage.verifyingTheSearchedTopicIsVisible(secondTopicName);
      await manageTopicsPage.deleteTopic();
      await manageTopicsPage.verifyToastMessage(TOPIC_TEST_DATA.TOAST_MESSAGES.DELETING_TOPIC);
    }
  );

  test(
    'verify user should be able to add new topics(with numbers and special characters) and newly added topic should be displayed on Manage Topics Screen for albums CONT-44965',
    {
      tag: [TestPriority.P0, TestGroupType.SMOKE, ContentFeatureTags.MANAGE_TOPICS, '@CONT-44965'],
    },
    async ({ appManagerFixture }) => {
      tagTest(test.info(), {
        description:
          'Verify user should be able to add new topics(with numbers and special characters) and newly added topic should be displayed on Manage Topics Screen for albums',
        zephyrTestId: 'CONT-44965',
        storyId: 'CONT-44965',
      });

      // Generate random alphanumeric string with special characters
      const topicNameWithSpecialChars = TestDataGenerator.generateRandomAlphanumericWithSpecialChars();
      const albumCreationPage = (await appManagerFixture.navigationHelper.openCreateContentPageForContentType(
        ContentType.ALBUM
      )) as AlbumCreationPage;
      await albumCreationPage.verifyThePageIsLoaded();

      const imagePath = FILE_TEST_DATA.IMAGES.IMAGE3.getPath(__dirname);

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
    'verify App Managers should be able to perform edit, delete, merge and follow actions on existing topic CONT-44966',
    {
      tag: [TestPriority.P0, TestGroupType.SMOKE, ContentFeatureTags.MANAGE_TOPICS, '@CONT-44966'],
    },
    async ({ appManagerFixture }) => {
      tagTest(test.info(), {
        description:
          'Verify App Managers should be able to perform edit, delete, merge and follow actions on existing topic',
        zephyrTestId: 'CONT-44966',
        storyId: 'CONT-44966',
      });

      // Navigate to manage/topics page
      await appManagerFixture.navigationHelper.openApplicationSettings();
      await applicationScreenPage.clickOnTopics();
      await manageTopicsPage.loadPage();

      // Create first topic with random alphabetic string
      const firstTopicName = faker.string.alpha({ length: 5 });
      topicId = await manageTopicsPage.createTopic(firstTopicName);
      await manageTopicsPage.verifyToastMessage(TOPIC_TEST_DATA.TOAST_MESSAGES.CREATED_SUCCESSFULLY);
      const editedTopicName = `${firstTopicName.slice(0, 2)} ${firstTopicName.slice(2)}`;
      await manageTopicsPage.editTopic(editedTopicName);
      await manageTopicsPage.verifyToastMessage(TOPIC_TEST_DATA.TOAST_MESSAGES.EDITED_SUCCESSFULLY);

      // Follow the topic
      await manageTopicsPage.openTopicOptionsDropdown();
      await manageTopicsPage.clickOnFollowTopic();

      // Create second topic "UI-test"
      const secondTopicName = faker.string.alpha({ length: 5 });
      await manageTopicsPage.createTopic(secondTopicName);
      await manageTopicsPage.verifyToastMessage(TOPIC_TEST_DATA.TOAST_MESSAGES.CREATED_SUCCESSFULLY);

      // Search for the edited topic "me rge"
      await manageTopicsPage.searchingTopicInSearchBar(editedTopicName);
      await manageTopicsPage.verifyingTheSearchedTopicIsVisible(editedTopicName);

      // Merge "me rge" into "UI-test"
      await manageTopicsPage.openTopicOptionsDropdown();
      await manageTopicsPage.mergeTopic(secondTopicName);
      await manageTopicsPage.verifyToastMessage(TOPIC_TEST_DATA.TOAST_MESSAGES.MERGING_TOPICS);

      // Reload page to see merged topic
      await manageTopicsPage.loadPage();

      // Search for "UI-test" topic
      await manageTopicsPage.searchingTopicInSearchBar(secondTopicName);
      await manageTopicsPage.verifyingTheSearchedTopicIsVisible(secondTopicName);

      // Delete "UI-test" topic
      await manageTopicsPage.openTopicOptionsDropdown();
      await manageTopicsPage.clickOnDeleteTopic();
      await manageTopicsPage.verifyDeleteTopicPopupIsVisible();
      await manageTopicsPage.clickDeleteConfirmButton();
      await manageTopicsPage.verifyToastMessage(TOPIC_TEST_DATA.TOAST_MESSAGES.DELETING_TOPIC);

      // Cleanup is not needed as topics are deleted in the test
      manualCleanupNeeded = false;
    }
  );
  test(
    'Create Album with new and existing topic',
    {
      tag: [TestPriority.P0, TestGroupType.SMOKE, ContentFeatureTags.MANAGE_TOPICS, '@CONT-42592'],
    },
    async ({ appManagerFixture }) => {
      tagTest(test.info(), {
        description: 'Create Album with new and existing topic',
        zephyrTestId: 'CONT-42592',
        storyId: 'CONT-42592',
      });
      // Generate album data using TestDataGenerator
      const imagePath = FILE_TEST_DATA.IMAGES.RATIO_TEXT.getPath(__dirname);
      const attachmentPath = FILE_TEST_DATA.EXCEL.SAMPLE_DOCX.getPath(__dirname);
      const albumCreationOptions = TestDataGenerator.generateAlbum({
        fileName: imagePath,
        attachmentFileName: attachmentPath,
        videoUrl: CONTENT_TEST_DATA.DEFAULT_ALBUM_CONTENT.videoUrls[0],
        openAlbum: true,
        topics: [faker.lorem.words(2)],
      });

      const topicsSection = [faker.lorem.words(2)];
      const albumCreationPage = (await appManagerFixture.navigationHelper.openCreateContentPageForContentType(
        ContentType.ALBUM
      )) as AlbumCreationPage;
      await albumCreationPage.verifyThePageIsLoaded();
      // Create and publish the album
      const { albumId, siteId } = await albumCreationPage.createWithTopicInDescriptionAndInTopicSectionAndPublish({
        ...albumCreationOptions,
        topicsSection: topicsSection,
      });

      const contentPreviewPage = new ContentPreviewPage(appManagerFixture.page, siteId, albumId, ContentType.ALBUM);
      // Handle promotion step
      await contentPreviewPage.handlePromotionPageStep();

      // Verify content was published successfully
      await contentPreviewPage.verifyContentPublishedSuccessfully(
        albumCreationOptions.title,
        "Created album successfully - it's published"
      );

      // Verify both topics are created:
      // 1. Topic added in description (from albumCreationOptions.topics)
      // 2. Topic added in topics section (from topicsSection)
      const topics = [...topicsSection, ...(albumCreationOptions.topics || [])];
      await manageTopicsPage.loadPage();
      await manageTopicsPage.searchAndVerifyMultipleTopics(topics);
    }
  );
});
