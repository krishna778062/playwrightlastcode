import { getRecognitionTenantConfigFromCache } from '@recognition/config/recognitionConfig';
import { RecognitionFeatureTags, RecognitionSuitTags } from '@recognition/constants/testTags';
import { recognitionTestFixture as test } from '@recognition/fixtures/recognitionFixture';
import { commonRecognitionTestData, peerToPeerAwardTestData } from '@recognition/test-data/awardTestData';
import { ManageAppSettingsApiService } from '@recognition-api/services/ManageAppSettingsApiService';
import { RecognitionHubPage } from '@recognition-pages/recognitionHubPage';

import { TestPriority } from '@core/constants/testPriority';
import { TestGroupType } from '@core/constants/testType';
import { tagTest } from '@core/utils/testDecorator';

import { PAGE_ENDPOINTS } from '@/src/core/constants/pageEndpoints';
import { LoginHelper } from '@/src/core/helpers/loginHelper';

test.describe('Reaction check for comments to recognition posts - hub', () => {
  test(
    'Validate any change in cheer/like and share when comments are enabled',
    {
      tag: [
        RecognitionSuitTags.REGRESSION_TEST,
        RecognitionFeatureTags.COMMENT_ENABLE_DISABLE,
        TestPriority.P2,
        TestGroupType.REGRESSION,
      ],
    },
    async ({ appManagerFixture, recognitionHubApi }) => {
      tagTest(test.info(), {
        zephyrTestId: 'RC-7259',
        storyId: 'RC-6615',
      });
      const { page: appManagerPage } = appManagerFixture;
      const manageAppSettingsApi = new ManageAppSettingsApiService();
      const recognitionHubPage = new RecognitionHubPage(appManagerPage);
      await manageAppSettingsApi.enableDisableCommentsSettingViaApi(appManagerPage, 'enable', true);
      // Create recognition and post
      await recognitionHubPage.navigateRecognitionHubViaEndpoint(PAGE_ENDPOINTS.RECOGNITION_HUB);
      await recognitionHubPage.givePeerRecognition(
        getRecognitionTenantConfigFromCache().endUserName,
        peerToPeerAwardTestData.awardName
      );
      await recognitionHubPage.postRecognitionAward({
        shareToHub: false,
        shareToSite: false,
        shareToSlack: false,
        nonUnifiedPost: false,
      });
      const { awardId, postUrl } = await recognitionHubPage.copyLinkFromPost(0);
      // Verify comment entry is allowed (comments enabled) and reaction work on hub
      await recognitionHubPage.navigateToAwardPostViaUrl(postUrl);
      await recognitionHubPage.verifyCommentingAllowedForPost(true);
      await recognitionHubPage.toggleCheerOnCard(recognitionHubPage.feedPost.first());
      // Share from hub to verify share still works when comments enabled
      const shareMessage = `Recognition award share message_${Date.now()}`;
      await recognitionHubPage.shareRecognitionPostFromHubToFeed(
        shareMessage,
        'site feed',
        commonRecognitionTestData.siteName
      );
      // Cleanup
      await recognitionHubApi.deleteAwardViaApi(appManagerPage, 'Peer recognition', awardId);
    }
  );

  test(
    'Validate any change in cheer and share when comments are disabled',
    {
      tag: [
        RecognitionSuitTags.REGRESSION_TEST,
        RecognitionFeatureTags.COMMENT_ENABLE_DISABLE,
        TestPriority.P1,
        TestGroupType.REGRESSION,
      ],
    },
    async ({ appManagerFixture, recognitionHubApi }) => {
      tagTest(test.info(), {
        zephyrTestId: 'RC-7258',
        storyId: 'RC-6615',
      });
      const { page: appManagerPage } = appManagerFixture;
      const manageAppSettingsApi = new ManageAppSettingsApiService();
      const recognitionHubPage = new RecognitionHubPage(appManagerPage);
      await manageAppSettingsApi.enableDisableCommentsSettingViaApi(appManagerPage, 'disable', false);
      // Create recognition and post
      await recognitionHubPage.navigateRecognitionHubViaEndpoint(PAGE_ENDPOINTS.RECOGNITION_HUB);
      await recognitionHubPage.givePeerRecognition(
        getRecognitionTenantConfigFromCache().endUserName,
        peerToPeerAwardTestData.awardName
      );
      await recognitionHubPage.postRecognitionAward({
        shareToHub: false,
        shareToSite: false,
        shareToSlack: false,
        nonUnifiedPost: false,
      });
      const { awardId, postUrl } = await recognitionHubPage.copyLinkFromPost(0);
      await recognitionHubPage.navigateToAwardPostViaUrl(postUrl);
      await recognitionHubPage.verifyCommentingAllowedForPost(false);
      await recognitionHubPage.toggleCheerOnCard(recognitionHubPage.feedPost.first());
      // Share from hub to verify share still works when comments are disabled
      const shareMessage = `Recognition award share message_${Date.now()}`;
      await recognitionHubPage.shareRecognitionPostFromHubToFeed(
        shareMessage,
        'site feed',
        commonRecognitionTestData.siteName
      );

      //standard user login and verify reaction still works when comments are disabled
      await LoginHelper.logoutByNavigatingToLogoutPage(appManagerFixture.page);
      await LoginHelper.loginWithPassword(appManagerFixture.page, {
        email: getRecognitionTenantConfigFromCache().endUserEmail!,
        password: getRecognitionTenantConfigFromCache().endUserPassword!,
      });
      await appManagerPage.goto(postUrl);
      await recognitionHubPage.verifyCommentingAllowedForPost(false);
      await recognitionHubPage.toggleCheerOnCard(recognitionHubPage.feedPost.first());
      await recognitionHubPage.shareRecognitionPostFromHubToFeed(
        `Recognition award share message std_${Date.now()}`,
        'home feed'
      );
      // Cleanup
      await LoginHelper.logoutByNavigatingToLogoutPage(appManagerPage);
      await LoginHelper.loginWithPassword(appManagerPage, {
        email: getRecognitionTenantConfigFromCache().appManagerEmail!,
        password: getRecognitionTenantConfigFromCache().appManagerPassword!,
      });
      await recognitionHubApi.deleteAwardViaApi(appManagerPage, 'Peer recognition', awardId);
    }
  );
});
