import { contentTestFixture as test } from '@/src/modules/content/fixtures/contentFixture';
import { tagTest } from '@core/utils/testDecorator';
import { TestPriority } from '@core/constants/testPriority';
import { TestGroupType } from '@core/constants/testType';
import { ContentTestSuite } from '@/src/modules/content/constants/testSuite';
import { getEnvConfig } from '@core/utils/getEnvConfig';
import { HomePage as NewUxHomePage } from '@/src/core/pages/newUx/homePage';
import { HomePage as OldUxHomePage } from '@/src/core/pages/oldUx/homePage';
import { FeedComponent } from '@/src/modules/content/components/feedComponent';
import { LoginHelper } from '@core/helpers/loginHelper';
import { FEED_TEST_DATA } from '@/src/modules/content/test-data/feed.test-data';
import path from 'path';

test.describe('@FeedPost', { tag: [ContentTestSuite.FEED] }, () => {
  let feedComponent: FeedComponent;

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
    feedComponent = new FeedComponent(page);
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
    await feedComponent.clickShareThoughtsButton();
    const postText = FEED_TEST_DATA.POST_TEXT.INITIAL;
    await feedComponent.createPost(postText);
    await feedComponent.uploadFiles([image1Path, docxPath, faviconPath]);
    await feedComponent.verifyFilesAttached();
    await feedComponent.removeAttachedFile();
    await feedComponent.clickPostButton();
    await feedComponent.verifyPostCreated(postText);

    // Verify post details
    await feedComponent.verifyTimestampDisplayed(postText);
    await feedComponent.verifyFileAttachmentsCount(postText, 2);
    await feedComponent.verifyInlineImage(postText,2);
    await feedComponent.verifyInlineImagePerview(postText);

    // Edit post
    await feedComponent.openPostOptionsMenu(postText);
    await feedComponent.clickEditOption();
    await feedComponent.verifyEditorVisible();
    const updatedPostText = FEED_TEST_DATA.POST_TEXT.UPDATED;
    await feedComponent.updatePostText(updatedPostText);
    await feedComponent.clickUpdateButton();

    // Delete post
    await feedComponent.openPostOptionsMenu(updatedPostText);
    await feedComponent.clickDeleteOption();
    await feedComponent.verifyDeleteConfirmDialog('Are you sure you want to delete this post?');
    await feedComponent.confirmDelete();
    await feedComponent.verifyPostDeleted();
  });
}); 