import { ContentTestSuite } from '@content/constants/testSuite';
import { contentTestFixture as test } from '@content/fixtures/contentFixture';
import { FEED_TEST_DATA } from '@content/test-data/feed.test-data';
import { FeedPage } from '@content/ui/pages/feedPage';
import { TestPriority } from '@core/constants/testPriority';
import { TestGroupType } from '@core/constants/testType';
import { tagTest } from '@core/utils/testDecorator';

import { TestDataGenerator } from '@/src/core/utils/testDataGenerator';
import { FILE_TEST_DATA } from '@/src/modules/content/test-data/file.test-data';

test.describe(
  '@FeedPost - Home Feed Maximum File Upload Limit',
  {
    tag: [ContentTestSuite.FEED_STANDARD_USER, ContentTestSuite.ATTACHMENTS],
  },
  () => {
    let feedPage: FeedPage;
    let createdPostText: string;
    let createdPostId: string = '';

    test.beforeEach(async ({ appManagerFixture }) => {
      /** await appManagerFixture.feedManagementHelper.configureAppGovernance({
        feedMode: FEED_TEST_DATA.DEFAULT_FEED_MODE,
      });
      */

      await appManagerFixture.homePage.verifyThePageIsLoaded();
      await appManagerFixture.navigationHelper.clickOnGlobalFeed();

      feedPage = new FeedPage(appManagerFixture.page);
      await feedPage.verifyThePageIsLoaded();
    });

    test.afterEach(async ({ appManagerFixture }) => {
      if (createdPostId) {
        try {
          await appManagerFixture.feedManagementHelper.deleteFeed(createdPostId);
        } catch (error) {
          console.log('Failed to cleanup feed via API:', error);
        }
      } else {
        console.log('No feed was published or feed already deleted, hence skipping the deletion');
      }
    });

    test(
      'in Zeus Verify user is able to upload Max of 10 Files on Home Feed Post CONT-24132',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, '@CONT-24132', '@Feed_Max_File_Upload_Limit'],
      },
      async () => {
        tagTest(test.info(), {
          description: 'In Zeus Verify user is able to upload Max of 10 Files on Home Feed Post',
          zephyrTestId: 'CONT-24132',
          storyId: 'CONT-24132',
        });

        const postText = TestDataGenerator.generateRandomText('Feed Post with 10 Files', 3, true);

        const image1Path = FILE_TEST_DATA.IMAGES.IMAGE1.getPath(__dirname);
        const image3Path = FILE_TEST_DATA.IMAGES.IMAGE3.getPath(__dirname);
        const image4Path = FILE_TEST_DATA.IMAGES.IMAGE4.getPath(__dirname);
        const image786Path = FILE_TEST_DATA.IMAGES.IMAGE786.getPath(__dirname);
        const faviconPath = FILE_TEST_DATA.IMAGES.FAVICON.getPath(__dirname);
        const ratioTextPath = FILE_TEST_DATA.IMAGES.RATIO_TEXT.getPath(__dirname);

        const elevenFiles = [
          image1Path,
          image3Path,
          image4Path,
          image786Path,
          faviconPath,
          ratioTextPath,
          image1Path,
          image3Path,
          image4Path,
          image786Path,
          faviconPath,
        ];

        await feedPage.clickShareThoughtsButton();

        await feedPage.postEditor.createPost(postText);

        await test.step('Upload 11 files and verify warning message', async () => {
          await feedPage.postEditor.uploadFiles(elevenFiles);
          await feedPage.postEditor.waitForFileToAppear();

          await feedPage.feedList.verifyToastMessageIsVisibleWithText(FEED_TEST_DATA.FILE_UPLOAD_WARNING_MESSAGE);

          await feedPage.postEditor.verifyAttachedFileCount(10);
        });

        await test.step('Attempt to drag and drop another file', async () => {
          await feedPage.postEditor.addFileToPost(image1Path);

          await feedPage.feedList.verifyToastMessageIsVisibleWithText(FEED_TEST_DATA.FILE_UPLOAD_WARNING_MESSAGE);

          await feedPage.postEditor.waitForFileToAppear();

          // Verify still only 10 files
          await feedPage.postEditor.verifyAttachedFileCount(10);
        });

        const postResult = await feedPage.postEditor.createAndPost({
          text: postText,
          attachments: {
            files: elevenFiles.slice(0, 10),
          },
        });

        // Store created post text and postId for cleanup
        createdPostText = postResult.postText;
        createdPostId = postResult.postId || '';

        // Wait for post to be visible
        await feedPage.feedList.waitForPostToBeVisible(postResult.postText);

        // Part 2: Edit Feed Post
        await feedPage.postEditor.openPostOptionsMenu(createdPostText);

        // Click on "Edit"
        await feedPage.postEditor.clickEditOption();

        // Verify "Update" button is disabled initially
        await feedPage.postEditor.verifyUpdateButtonDisabled();

        // Remove any file to enable the Update button
        await feedPage.postEditor.removeAttachedFile(0);

        // Verify 9 files remain
        await feedPage.postEditor.verifyAttachedFileCount(9);

        // Drag and drop a file from computer (add one more file to get back to 10)
        await test.step('Add one more file to get back to 10', async () => {
          await feedPage.postEditor.addFileToPost(image3Path);
          await feedPage.postEditor.waitForFileToAppear();
        });

        // Verify file added successfully (total 10 files)
        await feedPage.postEditor.verifyAttachedFileCount(FEED_TEST_DATA.MAX_FILE_UPLOAD_LIMIT);

        // Drag and drop another file from computer (attempt to add 11th file)
        await test.step('Attempt to add 11th file in edit mode', async () => {
          await feedPage.postEditor.addFileToPost(image4Path);
          await feedPage.postEditor.waitForFileToAppear();

          await feedPage.postEditor.verifyAttachedFileCount(FEED_TEST_DATA.MAX_FILE_UPLOAD_LIMIT);
        });

        // Enter text as "10 files" in the Edit Text box
        const updatedText = '10 files';
        await feedPage.postEditor.updatePostText(updatedText);

        // Click on "Update" button with exactly 10 files
        await feedPage.postEditor.clickUpdateButton();

        // Wait for post to update successfully
        await feedPage.feedList.waitForPostToBeVisible(updatedText);

        // Part 3: Delete Feed Post
        await feedPage.deletePost(createdPostText);

        // Clear post ID as post is already deleted
        createdPostId = '';
      }
    );
  }
);
