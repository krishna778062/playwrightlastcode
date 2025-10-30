import { ContentTestSuite } from '@content/constants/testSuite';
import { contentTestFixture as test } from '@content/fixtures/contentFixture';
import { FEED_TEST_DATA } from '@content/test-data/feed.test-data';
import { FeedPage } from '@content/ui/pages/feedPage';
import { TestPriority } from '@core/constants/testPriority';
import { TestGroupType } from '@core/constants/testType';
import { tagTest } from '@core/utils/testDecorator';

import { FileUtil } from '@/src/core/utils/fileUtil';
import { TestDataGenerator } from '@/src/core/utils/testDataGenerator';

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
      await appManagerFixture.feedManagementHelper.configureAppGovernance({
        feedMode: FEED_TEST_DATA.DEFAULT_FEED_MODE,
      });

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
      'in Zeus Verify user is able to upload Max of 10 Files on Home Feed Post',
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

        const image1Path = FileUtil.getFilePath(
          __dirname,
          '..',
          '..',
          '..',
          'test-data',
          'static-files',
          'images',
          'image1.jpg'
        );
        const image3Path = FileUtil.getFilePath(
          __dirname,
          '..',
          '..',
          '..',
          'test-data',
          'static-files',
          'images',
          'image3.jpg'
        );
        const image4Path = FileUtil.getFilePath(
          __dirname,
          '..',
          '..',
          '..',
          'test-data',
          'static-files',
          'images',
          'image4.jpg'
        );
        const image786Path = FileUtil.getFilePath(
          __dirname,
          '..',
          '..',
          '..',
          'test-data',
          'static-files',
          'images',
          'image786.jpg'
        );
        const faviconPath = FileUtil.getFilePath(
          __dirname,
          '..',
          '..',
          '..',
          'test-data',
          'static-files',
          'images',
          'favicon.png'
        );
        const ratioTextPath = FileUtil.getFilePath(
          __dirname,
          '..',
          '..',
          '..',
          'test-data',
          'static-files',
          'images',
          '300x300 RATIO_Text.png'
        );

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

        await feedPage.actions.clickShareThoughtsButton();

        await feedPage.actions.createPost(postText);

        await test.step('Upload 11 files and verify warning message', async () => {
          await feedPage.actions.uploadFiles(elevenFiles);
          await feedPage.actions.waitForFileToAppear();

          await feedPage.assertions.verifyToastMessage(FEED_TEST_DATA.FILE_UPLOAD_WARNING_MESSAGE);

          await feedPage.assertions.verifyAttachedFileCount(10);
        });

        await test.step('Attempt to drag and drop another file', async () => {
          await feedPage.actions.addFileToPost(image1Path);
          await feedPage.actions.waitForFileToAppear();

          await feedPage.assertions.verifyToastMessage(FEED_TEST_DATA.FILE_UPLOAD_WARNING_MESSAGE);

          // Verify still only 10 files
          await feedPage.assertions.verifyAttachedFileCount(10);
        });

        const postResult = await feedPage.actions.createAndPost({
          text: postText,
          attachments: {
            files: elevenFiles.slice(0, 10),
          },
        });

        // Store created post text and postId for cleanup
        createdPostText = postResult.postText;
        createdPostId = postResult.postId || '';

        // Wait for post to be visible
        await feedPage.assertions.waitForPostToBeVisible(postResult.postText);

        // Part 2: Edit Feed Post
        await feedPage.actions.openPostOptionsMenu(createdPostText);

        // Click on "Edit"
        await feedPage.actions.clickEditOption();

        // Verify "Update" button is disabled initially
        await feedPage.assertions.verifyUpdateButtonDisabled();

        // Remove any file to enable the Update button
        await feedPage.actions.removeAttachedFile(0);

        // Verify 9 files remain
        await feedPage.assertions.verifyAttachedFileCount(9);

        // Drag and drop a file from computer (add one more file to get back to 10)
        await test.step('Add one more file to get back to 10', async () => {
          await feedPage.actions.addFileToPost(image3Path);
          await feedPage.actions.waitForFileToAppear();
        });

        // Verify file added successfully (total 10 files)
        await feedPage.assertions.verifyAttachedFileCount(FEED_TEST_DATA.MAX_FILE_UPLOAD_LIMIT);

        // Drag and drop another file from computer (attempt to add 11th file)
        await test.step('Attempt to add 11th file in edit mode', async () => {
          await feedPage.actions.addFileToPost(image4Path);
          await feedPage.actions.waitForFileToAppear();

          await feedPage.assertions.verifyAttachedFileCount(FEED_TEST_DATA.MAX_FILE_UPLOAD_LIMIT);
        });

        // Enter text as "10 files" in the Edit Text box
        const updatedText = '10 files';
        await feedPage.actions.updatePostText(updatedText);

        // Click on "Update" button with exactly 10 files
        await feedPage.actions.clickUpdateButton();

        // Wait for post to update successfully
        await feedPage.assertions.waitForPostToBeVisible(updatedText);

        // Part 3: Delete Feed Post
        await feedPage.actions.deletePost(createdPostText);

        // Clear post ID as post is already deleted
        createdPostId = '';
      }
    );
  }
);
