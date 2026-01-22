import { getRecognitionTenantConfigFromCache } from '@recognition/config/recognitionConfig';
import { RecognitionFeatureTags } from '@recognition/constants/testTags';
import { recognitionTestFixture as test } from '@recognition/fixtures/recognitionFixture';
import { DialogContainerForm } from '@recognition/ui/components/common/dialog-container-form';
import { RecognitionHubPage } from '@recognition-pages/recognitionHubPage';

import { PAGE_ENDPOINTS } from '@core/constants/pageEndpoints';
import { TestPriority } from '@core/constants/testPriority';
import { tagTest } from '@core/utils/testDecorator';

import { LoginHelper } from '@/src/core/helpers/loginHelper';

test.describe('Share peer recognition from hub - ABAC enabled mode', () => {
  test(
    'Verify share to home feed in Recognition Hub when user have permission via the Manage Home Feed ACG - Admin',
    {
      tag: [RecognitionFeatureTags.ABAC_RECOGNITION_SHARE, TestPriority.P3],
    },
    async ({ appManagerFixture, recognitionHubApi }) => {
      tagTest(test.info(), {
        zephyrTestId: 'RC-7217',
        storyId: 'RC-6755',
      });
      const { page: appManagerPage } = appManagerFixture;
      const recognitionHubPage = new RecognitionHubPage(appManagerPage);
      const dialogContainerForm = new DialogContainerForm(appManagerPage);
      await recognitionHubPage.setupCanCreateHomeFeedPostMock(true);
      await recognitionHubPage.navigateRecognitionHubViaEndpoint(PAGE_ENDPOINTS.RECOGNITION_HUB);
      await recognitionHubPage.givePeerRecognition(0, 0);
      await dialogContainerForm.checkShareOnFeedOptionVisibility('Home Feed', true);
      await dialogContainerForm.checkShareOnFeedOptionVisibility('Site Feed', true);
      await recognitionHubPage.validateCanCreateHomeFeedPostMock(true);
      await recognitionHubPage.clickOnElement(dialogContainerForm.crossButton, {
        stepInfo: 'Clicking on cross button',
      });
      const { awardId: recognitionAwardId } = await recognitionHubPage.copyLinkFromPost(0);
      await recognitionHubApi.deleteRecognitionAwardPostViaApi(appManagerPage, 'Peer recognition', recognitionAwardId);
    }
  );

  test(
    'Verify share to home feed in Recognition Hub when user have permission via Post in Home Feed ACG - standard user',
    {
      tag: [RecognitionFeatureTags.ABAC_RECOGNITION_SHARE, TestPriority.P2],
    },
    async ({ appManagerFixture }) => {
      tagTest(test.info(), {
        zephyrTestId: 'RC-7218',
        storyId: 'RC-6755',
      });
      const { page: appManagerPage } = appManagerFixture;
      const recognitionHubPage = new RecognitionHubPage(appManagerPage);
      const dialogContainerForm = new DialogContainerForm(appManagerPage);
      await recognitionHubPage.navigateRecognitionHubViaEndpoint(PAGE_ENDPOINTS.RECOGNITION_HUB);
      await recognitionHubPage.givePeerRecognition(0, 0);
      await LoginHelper.logoutByNavigatingToLogoutPage(appManagerPage);
      await LoginHelper.loginWithPassword(appManagerPage, {
        email: getRecognitionTenantConfigFromCache().endUserEmail!,
        password: getRecognitionTenantConfigFromCache().appManagerPassword!,
      });
      await recognitionHubPage.setupCanCreateHomeFeedPostMock(false);
      await recognitionHubPage.navigateRecognitionHubViaEndpoint(PAGE_ENDPOINTS.RECOGNITION_HUB);
      await recognitionHubPage.clickOnElement(recognitionHubPage.sharePostButton, {
        stepInfo: 'Clicking on share post button',
      });
      await dialogContainerForm.checkShareOnFeedOptionVisibility('Home Feed', false);
      await dialogContainerForm.checkShareOnFeedOptionVisibility('Site Feed', true);
      await recognitionHubPage.validateCanCreateHomeFeedPostMock(false);
    }
  );

  test(
    'Verify share to home feed in Recognition Hub when user have permission to create feed post via the ACGs - Admin',
    {
      tag: [RecognitionFeatureTags.ABAC_RECOGNITION_SHARE, TestPriority.P2],
    },
    async ({ appManagerFixture, recognitionHubApi }) => {
      tagTest(test.info(), {
        zephyrTestId: 'RC-7216',
        storyId: 'RC-6755',
      });
      const { page: appManagerPage } = appManagerFixture;
      const recognitionHubPage = new RecognitionHubPage(appManagerPage);
      const dialogContainerForm = new DialogContainerForm(appManagerPage);
      await recognitionHubPage.setupCanCreateHomeFeedPostMock(true);
      await recognitionHubPage.navigateRecognitionHubViaEndpoint(PAGE_ENDPOINTS.RECOGNITION_HUB);
      await recognitionHubPage.givePeerRecognition(0, 0);
      await recognitionHubPage.clickOnElement(dialogContainerForm.crossButton, {
        stepInfo: 'Clicking on cross button',
      });
      const { awardId: recognitionAwardId } = await recognitionHubPage.copyLinkFromPost(0);
      await recognitionHubPage.shareRecognitionPostFromHubToFeed(
        `Recognition award share message_${Date.now()}`,
        'home feed'
      );
      await recognitionHubPage.clickOnElement(recognitionHubPage.sharePostButton, {
        stepInfo: 'Clicking on share post button',
      });
      await dialogContainerForm.checkShareOnFeedOptionVisibility('Site Feed', true);
      await recognitionHubPage.validateCanCreateHomeFeedPostMock(true);
      await recognitionHubApi.deleteRecognitionAwardPostViaApi(appManagerPage, 'Peer recognition', recognitionAwardId);
    }
  );

  test(
    'Verify share to home feed in Recognition Hub when user does not permission to create feed post via the ACGs - standard user',
    {
      tag: [RecognitionFeatureTags.ABAC_RECOGNITION_SHARE, TestPriority.P3],
    },
    async ({ appManagerFixture }) => {
      tagTest(test.info(), {
        zephyrTestId: 'RC-7204',
        storyId: 'RC-6755',
      });
      const { page: appManagerPage } = appManagerFixture;
      const recognitionHubPage = new RecognitionHubPage(appManagerPage);
      const dialogContainerForm = new DialogContainerForm(appManagerPage);
      await recognitionHubPage.navigateRecognitionHubViaEndpoint(PAGE_ENDPOINTS.RECOGNITION_HUB);
      await recognitionHubPage.givePeerRecognition(0, 0);
      await LoginHelper.logoutByNavigatingToLogoutPage(appManagerPage);
      await LoginHelper.loginWithPassword(appManagerPage, {
        email: getRecognitionTenantConfigFromCache().endUserEmail!,
        password: getRecognitionTenantConfigFromCache().appManagerPassword!,
      });
      await recognitionHubPage.setupCanCreateHomeFeedPostMock(false);
      await recognitionHubPage.navigateRecognitionHubViaEndpoint(PAGE_ENDPOINTS.RECOGNITION_HUB);
      await recognitionHubPage.clickOnElement(recognitionHubPage.sharePostButton, {
        stepInfo: 'Clicking on share post button',
      });
      await dialogContainerForm.checkShareOnFeedOptionVisibility('Home Feed', false);
      await recognitionHubPage.validateCanCreateHomeFeedPostMock(false);
    }
  );
});
