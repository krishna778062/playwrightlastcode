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

    // Initialize components based on UX flag
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

    // Get file paths
    const image1Path = path.join(process.cwd(), 'src/modules/content/test-data/static-files/images', FEED_TEST_DATA.ATTACHMENTS.IMAGE);
    const docxPath = path.join(process.cwd(), 'src/modules/content/test-data/static-files/excel', FEED_TEST_DATA.ATTACHMENTS.DOCUMENT);
    const faviconPath = path.join(process.cwd(), 'src/modules/content/test-data/static-files/images', FEED_TEST_DATA.ATTACHMENTS.FAVICON);

    // Create post with attachments
    await feedPage.actions.clickShareThoughtsButton();
    const postText = FEED_TEST_DATA.POST_TEXT.INITIAL;
    await feedPage.actions.createPost(postText);
    await feedPage.actions.uploadFiles([image1Path, docxPath, faviconPath]);
    await feedPage.assertions.verifyFilesAttached();
    await feedPage.actions.removeAttachedFile();
    await feedPage.actions.clickPostButton();
    await feedPage.assertions.verifyPostCreated(postText);

    // Verify post details
    await feedPage.assertions.verifyTimestampDisplayed(postText);
    await feedPage.assertions.verifyFileAttachmentsCount(postText, 2);
    await feedPage.assertions.verifyInlineImage(postText, 2);
    await feedPage.verifyInlineImagePerview(postText);

    // Edit post
    await feedPage.actions.openPostOptionsMenu(postText);
    await feedPage.actions.clickEditOption();
    await feedPage.assertions.verifyEditorVisible();
    const updatedPostText = FEED_TEST_DATA.POST_TEXT.UPDATED;
    await feedPage.actions.updatePostText(updatedPostText);
    await feedPage.actions.clickUpdateButton();

    // Delete post
    await feedPage.actions.openPostOptionsMenu(updatedPostText);
    await feedPage.actions.clickDeleteOption();
    await feedPage.assertions.verifyDeleteConfirmDialog('Are you sure you want to delete this post?');
    await feedPage.actions.confirmDelete();
    await feedPage.assertions.verifyPostDeleted();
  });
}); 