import { contentTestFixture as test } from '@/src/modules/content/fixtures/contentFixture';
import { tagTest } from '@core/utils/testDecorator';
import { TestPriority } from '@core/constants/testPriority';
import { TestGroupType } from '@core/constants/testType';
import { ContentTestSuite } from '@/src/modules/content/constants/testSuite';
import { getEnvConfig } from '@core/utils/getEnvConfig';
import { HomePage as NewUxHomePage } from '@/src/core/pages/newUx/homePage';
import { HomePage as OldUxHomePage } from '@/src/core/pages/oldUx/homePage';
import { FeedPage } from '@/src/modules/content/pages/feedPage';
import { LoginHelper } from '@core/helpers/loginHelper';
import { FEED_TEST_DATA } from '@/src/modules/content/test-data/feed.test-data';
import path from 'path';

test.describe('@FeedPost', { tag: [ContentTestSuite.FEED] }, () => {
  let feedPage: FeedPage;

  test.beforeEach(async ({ page }) => {
    // Login as EndUser1
    await LoginHelper.loginWithPassword(page, {
      email: getEnvConfig().endUserEmail,
      password: getEnvConfig().endUserPassword,
    });

    // Initialize and navigate to feed page
    const HomePage = getEnvConfig().newUxEnabled ? NewUxHomePage : OldUxHomePage;
    const homePage = new HomePage(page);
    await homePage.actions.clickOnGlobalFeed();
    feedPage = new FeedPage(page);
    await feedPage.verifyThePageIsLoaded();
  });

  test('Verify user can create, edit and delete a feed post with attachments', {
    tag: [TestPriority.P0, TestGroupType.SMOKE],
  }, async ({ page }) => {
    tagTest(test.info(), {
      description: 'Test feed post creation, editing and deletion with file attachments',
      zephyrTestId: 'CONT-19533',
      storyId: 'CONT-19533',
    });

    // Setup test data - prepare file paths for attachments
    const image1Path = path.join(process.cwd(), 'src/modules/content/test-data/static-files/images', FEED_TEST_DATA.ATTACHMENTS.IMAGE);
    const docxPath = path.join(process.cwd(), 'src/modules/content/test-data/static-files/excel', FEED_TEST_DATA.ATTACHMENTS.DOCUMENT);
    const faviconPath = path.join(process.cwd(), 'src/modules/content/test-data/static-files/images', FEED_TEST_DATA.ATTACHMENTS.FAVICON);

    // Step 1: Create a new post with multiple attachments
    // - Click share thoughts button to open editor
    await feedPage.actions.clickShareThoughtsButton();
    const postText = FEED_TEST_DATA.POST_TEXT.INITIAL;
    // - Enter post content
    await feedPage.actions.createPost(postText);
    // - Upload multiple files (image, document, favicon)
    await feedPage.actions.uploadFiles([image1Path, docxPath, faviconPath]);
    // - Verify all files are attached
    await feedPage.assertions.verifyFilesAttached();
    // - Remove one file to test attachment removal
    await feedPage.actions.removeAttachedFile();
    // - Submit the post
    await feedPage.actions.clickPostButton();
    // - Verify post appears in feed
    await feedPage.assertions.verifyPostCreated(postText);

    // Step 2: Verify post details and attachments
    // - Check timestamp is correct
    await feedPage.assertions.verifyTimestampDisplayed(postText);
    // - Verify remaining attachments count (2 after removing 1)
    await feedPage.assertions.verifyFileAttachmentsCount(postText, 2);
    // - Verify inline images are displayed correctly
    await feedPage.assertions.verifyInlineImage(postText, 2);
    // - Test image preview functionality
    await feedPage.verifyInlineImagePerview(postText);

    // Step 3: Edit the post
    // - Open post options menu
    await feedPage.actions.openPostOptionsMenu(postText);
    // - Select edit option
    await feedPage.actions.clickEditOption();
    // - Verify editor is visible for editing
    await feedPage.assertions.verifyEditorVisible();
    // - Update post content
    const updatedPostText = FEED_TEST_DATA.POST_TEXT.UPDATED;
    await feedPage.actions.updatePostText(updatedPostText);
    // - Save changes
    await feedPage.actions.clickUpdateButton();

    // Step 4: Delete the post
    // - Open post options menu (using updated text)
    await feedPage.actions.openPostOptionsMenu(updatedPostText);
    // - Select delete option
    await feedPage.actions.clickDeleteOption();
    // - Verify delete confirmation dialog
    await feedPage.assertions.verifyDeleteConfirmDialog('Are you sure you want to delete this post?');
    // - Confirm deletion
    await feedPage.actions.confirmDelete();
    // - Verify post is removed from feed
    await feedPage.assertions.verifyPostDeleted();
  });
}); 