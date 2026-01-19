/* eslint-disable simple-import-sort/imports */
import { TestPriority } from '@core/constants/testPriority';
import { TestGroupType } from '@core/constants/testType';
import { tagTest } from '@core/utils/testDecorator';
import { RecognitionFeatureTags, RecognitionSuitTags } from '@recognition/constants/testTags';
import { recognitionTestFixture as test } from '@recognition/fixtures/recognitionFixture';
import { commonRecognitionTestData, peerToPeerAwardTestData } from '@recognition/test-data/awardTestData';

import { ManageAppSettingsApiService } from '@recognition-api/services/ManageAppSettingsApiService';
import { RecognitionHubPage, UserProfilePage } from '@recognition-pages/index';
import { LoginHelper } from '@/src/core/helpers';

import { getRecognitionTenantConfigFromCache } from '@recognition/config/recognitionConfig';

import { PAGE_ENDPOINTS } from '@/src/core/constants/pageEndpoints';
import { expect } from 'playwright/test';

test.describe('Add comments to non-unified posts - user profile', () => {
  test(
    'Verify add new comments to unified posts when comments are disabled on user profile',
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
        zephyrTestId: 'RC-7246',
        storyId: 'RC-6615',
      });
      const { page: appManagerPage } = appManagerFixture;
      const manageAppSettingsApi = new ManageAppSettingsApiService();
      const recognitionHubPage = new RecognitionHubPage(appManagerPage);
      const userProfilePage = new UserProfilePage(appManagerPage);

      // Pre-req: comments disabled
      await manageAppSettingsApi.enableDisableCommentsSettingViaApi(appManagerPage, 'disable', false);

      // Create a post and share to home + site feed (unified)
      await recognitionHubPage.navigateRecognitionHubViaEndpoint(PAGE_ENDPOINTS.RECOGNITION_HUB);
      await recognitionHubPage.givePeerRecognition(
        getRecognitionTenantConfigFromCache().endUserName,
        peerToPeerAwardTestData.awardName
      );
      await recognitionHubPage.postRecognitionAward({
        shareToHub: false,
        shareToSite: false,
        shareToSlack: false,
        nonUnifiedPost: true,
      });
      const { awardId } = await recognitionHubPage.copyLinkFromPost(0);
      const shareMessage = `Recognition award share message_${Date.now()}`;
      await recognitionHubPage.shareRecognitionPostFromHubToFeed(shareMessage, 'home feed');

      // Navigate via user profile and verify comments are not allowed
      await recognitionHubPage.navigateToAwardRecipientProfileFromHubViaLinkClick();
      await userProfilePage.navigateToReceivedAwardFromUserProfile(
        peerToPeerAwardTestData.awardName,
        'Peer recognition'
      );
      await userProfilePage.navigateToRecognitionPostFromUserProfile();
      await recognitionHubPage.verifyCommentingAllowedForPost(false);
      const commentCountManager = await recognitionHubPage.countTheComments();
      expect(commentCountManager).toBe(0);

      // Standard user should also not be able to comment
      await LoginHelper.logoutByNavigatingToLogoutPage(appManagerFixture.page);
      await LoginHelper.loginWithPassword(appManagerFixture.page, {
        email: getRecognitionTenantConfigFromCache().endUserEmail!,
        password: getRecognitionTenantConfigFromCache().endUserPassword!,
      });
      await userProfilePage.navigateToCurrentUserProfile();
      await userProfilePage.navigateToReceivedAwardFromUserProfile(
        peerToPeerAwardTestData.awardName,
        'Peer recognition'
      );
      await userProfilePage.navigateToRecognitionPostFromUserProfile();
      await recognitionHubPage.verifyCommentingAllowedForPost(false);
      const commentCountEndUser = await recognitionHubPage.countTheComments();
      expect(commentCountEndUser).toBe(0);

      // Cleanup - delete recognition award as an app manager
      await LoginHelper.logoutByNavigatingToLogoutPage(appManagerPage);
      await LoginHelper.loginWithPassword(appManagerPage, {
        email: getRecognitionTenantConfigFromCache().appManagerEmail!,
        password: getRecognitionTenantConfigFromCache().appManagerPassword!,
      });
      await recognitionHubApi.deleteAwardViaApi(appManagerPage, 'Peer recognition', awardId);
    }
  );

  test(
    'Verify add new comments to unified posts when comments are enabled on user profile',
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
        zephyrTestId: 'RC-7248',
        storyId: 'RC-6615',
      });
      const { page: appManagerPage } = appManagerFixture;
      const manageAppSettingsApi = new ManageAppSettingsApiService();
      const recognitionHubPage = new RecognitionHubPage(appManagerPage);
      const userProfilePage = new UserProfilePage(appManagerPage);

      await manageAppSettingsApi.enableDisableCommentsSettingViaApi(appManagerPage, 'enable', true);

      await recognitionHubPage.navigateRecognitionHubViaEndpoint(PAGE_ENDPOINTS.RECOGNITION_HUB);
      await recognitionHubPage.givePeerRecognition(
        getRecognitionTenantConfigFromCache().endUserName,
        peerToPeerAwardTestData.awardName
      );
      await recognitionHubPage.postRecognitionAward({
        shareToHub: false,
        shareToSite: false,
        shareToSlack: false,
        nonUnifiedPost: true,
      });
      const { awardId } = await recognitionHubPage.copyLinkFromPost(0);
      const shareMessage = `Recognition award share message_${Date.now()}`;
      await recognitionHubPage.shareRecognitionPostFromHubToFeed(
        shareMessage,
        'site feed',
        commonRecognitionTestData.siteName
      );

      await recognitionHubPage.navigateToAwardRecipientProfileFromHubViaLinkClick();
      await userProfilePage.navigateToReceivedAwardFromUserProfile(
        peerToPeerAwardTestData.awardName,
        'Peer recognition'
      );
      await userProfilePage.navigateToRecognitionPostFromUserProfile();
      await recognitionHubPage.verifyCommentingAllowedForPost(true);
      const initialCount = await recognitionHubPage.countTheComments();
      const managerComment = `Auto comment manager ${Date.now()}`;
      await recognitionHubPage.commentOnPost(managerComment);
      const countAfterManager = await recognitionHubPage.countTheComments();
      expect(countAfterManager).toBeGreaterThan(initialCount);

      await LoginHelper.logoutByNavigatingToLogoutPage(appManagerFixture.page);
      await LoginHelper.loginWithPassword(appManagerFixture.page, {
        email: getRecognitionTenantConfigFromCache().endUserEmail!,
        password: getRecognitionTenantConfigFromCache().endUserPassword!,
      });
      await userProfilePage.navigateToCurrentUserProfile();
      await userProfilePage.navigateToReceivedAwardFromUserProfile(
        peerToPeerAwardTestData.awardName,
        'Peer recognition'
      );
      await userProfilePage.navigateToRecognitionPostFromUserProfile();
      await recognitionHubPage.verifyCommentingAllowedForPost(true);
      const countVisibleEndUser = await recognitionHubPage.countTheComments();
      expect(countVisibleEndUser).toBeGreaterThan(0);
      const endUserComment = `Auto comment enduser ${Date.now()}`;
      await recognitionHubPage.commentOnPost(endUserComment);
      const countAfterEndUser = await recognitionHubPage.countTheComments();
      expect(countAfterEndUser).toBeGreaterThan(countVisibleEndUser);

      await LoginHelper.logoutByNavigatingToLogoutPage(appManagerPage);
      await LoginHelper.loginWithPassword(appManagerPage, {
        email: getRecognitionTenantConfigFromCache().appManagerEmail!,
        password: getRecognitionTenantConfigFromCache().appManagerPassword!,
      });
      await recognitionHubApi.deleteAwardViaApi(appManagerPage, 'Peer recognition', awardId);
    }
  );

  test(
    'Verify previously made comments to unified posts when comments are disabled on user profile',
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
        zephyrTestId: 'RC-7250',
        storyId: 'RC-6615',
      });
      const { page: appManagerPage } = appManagerFixture;
      const manageAppSettingsApi = new ManageAppSettingsApiService();
      const recognitionHubPage = new RecognitionHubPage(appManagerPage);
      const userProfilePage = new UserProfilePage(appManagerPage);

      // Seed comment while enabled
      await manageAppSettingsApi.enableDisableCommentsSettingViaApi(appManagerPage, 'enable', true);
      await recognitionHubPage.navigateRecognitionHubViaEndpoint(PAGE_ENDPOINTS.RECOGNITION_HUB);
      await recognitionHubPage.givePeerRecognition(
        getRecognitionTenantConfigFromCache().endUserName,
        peerToPeerAwardTestData.awardName
      );
      await recognitionHubPage.postRecognitionAward({
        shareToHub: false,
        shareToSite: false,
        shareToSlack: false,
        nonUnifiedPost: true,
      });
      const { awardId } = await recognitionHubPage.copyLinkFromPost(0);
      const shareMessage = `Recognition award share message_${Date.now()}`;
      await recognitionHubPage.shareRecognitionPostFromHubToFeed(shareMessage, 'home feed');

      await recognitionHubPage.navigateToAwardRecipientProfileFromHubViaLinkClick();
      await userProfilePage.navigateToReceivedAwardFromUserProfile(
        peerToPeerAwardTestData.awardName,
        'Peer recognition'
      );
      await userProfilePage.navigateToRecognitionPostFromUserProfile();
      await recognitionHubPage.verifyCommentingAllowedForPost(true);
      const seededComment = `Seed comment ${Date.now()}`;
      await recognitionHubPage.commentOnPost(seededComment);

      // Disable comments and verify no comments visible/allowed
      await manageAppSettingsApi.enableDisableCommentsSettingViaApi(appManagerPage, 'disable', false);
      await recognitionHubPage.verifyCommentingAllowedForPost(false);
      const countAfterDisableManager = await recognitionHubPage.countTheComments();
      expect(countAfterDisableManager).toBe(0);

      await LoginHelper.logoutByNavigatingToLogoutPage(appManagerPage);
      await LoginHelper.loginWithPassword(appManagerPage, {
        email: getRecognitionTenantConfigFromCache().endUserEmail!,
        password: getRecognitionTenantConfigFromCache().endUserPassword!,
      });
      await userProfilePage.navigateToCurrentUserProfile();
      await userProfilePage.navigateToReceivedAwardFromUserProfile(
        peerToPeerAwardTestData.awardName,
        'Peer recognition'
      );
      await userProfilePage.navigateToRecognitionPostFromUserProfile();
      await recognitionHubPage.verifyCommentingAllowedForPost(false);
      const countAfterDisableEndUser = await recognitionHubPage.countTheComments();
      expect(countAfterDisableEndUser).toBe(0);

      await LoginHelper.logoutByNavigatingToLogoutPage(appManagerPage);
      await LoginHelper.loginWithPassword(appManagerPage, {
        email: getRecognitionTenantConfigFromCache().appManagerEmail!,
        password: getRecognitionTenantConfigFromCache().appManagerPassword!,
      });
      await recognitionHubApi.deleteAwardViaApi(appManagerPage, 'Peer recognition', awardId);
    }
  );

  test(
    'Verify previously made comments to unified posts when comments are enabled on user profile',
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
        zephyrTestId: 'RC-7252',
        storyId: 'RC-6615',
      });
      const { page: appManagerPage } = appManagerFixture;
      const manageAppSettingsApi = new ManageAppSettingsApiService();
      const recognitionHubPage = new RecognitionHubPage(appManagerPage);
      const userProfilePage = new UserProfilePage(appManagerPage);

      await manageAppSettingsApi.enableDisableCommentsSettingViaApi(appManagerPage, 'enable', true);
      await appManagerPage.reload();
      await recognitionHubPage.navigateRecognitionHubViaEndpoint(PAGE_ENDPOINTS.RECOGNITION_HUB);
      await recognitionHubPage.givePeerRecognition(
        getRecognitionTenantConfigFromCache().endUserName,
        peerToPeerAwardTestData.awardName
      );
      await recognitionHubPage.postRecognitionAward({
        shareToHub: false,
        shareToSite: false,
        shareToSlack: false,
        nonUnifiedPost: true,
      });
      const { awardId } = await recognitionHubPage.copyLinkFromPost(0);
      const shareMessage = `Recognition award share message_${Date.now()}`;
      await recognitionHubPage.shareRecognitionPostFromHubToFeed(
        shareMessage,
        'site feed',
        commonRecognitionTestData.siteName
      );

      await recognitionHubPage.navigateToAwardRecipientProfileFromHubViaLinkClick();
      await userProfilePage.navigateToReceivedAwardFromUserProfile(
        peerToPeerAwardTestData.awardName,
        'Peer recognition'
      );

      await userProfilePage.navigateToRecognitionPostFromUserProfile();
      await recognitionHubPage.verifyCommentingAllowedForPost(true);
      const seededComment = `Seed comment ${Date.now()}`;
      await recognitionHubPage.commentOnPost(seededComment);
      const countAfterSeed = await recognitionHubPage.countTheComments();
      expect(countAfterSeed).toBeGreaterThan(0);

      await LoginHelper.logoutByNavigatingToLogoutPage(appManagerPage);
      await LoginHelper.loginWithPassword(appManagerPage, {
        email: getRecognitionTenantConfigFromCache().endUserEmail!,
        password: getRecognitionTenantConfigFromCache().endUserPassword!,
      });
      await userProfilePage.navigateToCurrentUserProfile();
      await userProfilePage.navigateToReceivedAwardFromUserProfile(
        peerToPeerAwardTestData.awardName,
        'Peer recognition'
      );
      await userProfilePage.navigateToRecognitionPostFromUserProfile();
      await recognitionHubPage.verifyCommentingAllowedForPost(true);
      const countVisibleEndUser = await recognitionHubPage.countTheComments();
      expect(countVisibleEndUser).toBeGreaterThan(0);
      const endUserComment = `End user comment ${Date.now()}`;
      await recognitionHubPage.commentOnPost(endUserComment);
      const countAfterEndUser = await recognitionHubPage.countTheComments();
      expect(countAfterEndUser).toBeGreaterThan(countVisibleEndUser);

      await LoginHelper.logoutByNavigatingToLogoutPage(appManagerPage);
      await LoginHelper.loginWithPassword(appManagerPage, {
        email: getRecognitionTenantConfigFromCache().appManagerEmail!,
        password: getRecognitionTenantConfigFromCache().appManagerPassword!,
      });
      await recognitionHubApi.deleteAwardViaApi(appManagerPage, 'Peer recognition', awardId);
    }
  );

  test(
    'Verify disabled/re-enabled comments for unified post on user profile',
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
        zephyrTestId: 'RC-7254',
        storyId: 'RC-6615',
      });
      const { page: appManagerPage } = appManagerFixture;
      const manageAppSettingsApi = new ManageAppSettingsApiService();
      const recognitionHubPage = new RecognitionHubPage(appManagerPage);
      const userProfilePage = new UserProfilePage(appManagerPage);

      await manageAppSettingsApi.enableDisableCommentsSettingViaApi(appManagerPage, 'enable', true);
      await recognitionHubPage.navigateRecognitionHubViaEndpoint(PAGE_ENDPOINTS.RECOGNITION_HUB);
      await recognitionHubPage.givePeerRecognition(
        getRecognitionTenantConfigFromCache().endUserName,
        peerToPeerAwardTestData.awardName
      );
      await recognitionHubPage.postRecognitionAward({
        shareToHub: false,
        shareToSite: false,
        shareToSlack: false,
        nonUnifiedPost: true,
      });
      const { awardId } = await recognitionHubPage.copyLinkFromPost(0);
      const shareMessage = `Recognition award share message_${Date.now()}`;
      await recognitionHubPage.shareRecognitionPostFromHubToFeed(shareMessage, 'home feed');

      // Seed comment while enabled
      await recognitionHubPage.navigateToAwardRecipientProfileFromHubViaLinkClick();
      await userProfilePage.navigateToReceivedAwardFromUserProfile(
        peerToPeerAwardTestData.awardName,
        'Peer recognition'
      );
      await userProfilePage.navigateToRecognitionPostFromUserProfile();
      await recognitionHubPage.verifyCommentingAllowedForPost(true);
      const initialCount = await recognitionHubPage.countTheComments();
      const seededComment = `Auto seeded comment ${Date.now()}`;
      await recognitionHubPage.commentOnPost(seededComment);
      const countAfterSeed = await recognitionHubPage.countTheComments();
      expect(countAfterSeed).toBeGreaterThan(initialCount);

      // Disable comments and verify hidden
      await manageAppSettingsApi.enableDisableCommentsSettingViaApi(appManagerPage, 'disable', false);
      await recognitionHubPage.navigateRecognitionHubViaEndpoint(PAGE_ENDPOINTS.RECOGNITION_HUB);
      await recognitionHubPage.navigateToAwardRecipientProfileFromHubViaLinkClick();
      await userProfilePage.navigateToReceivedAwardFromUserProfile(
        peerToPeerAwardTestData.awardName,
        'Peer recognition'
      );
      await userProfilePage.navigateToRecognitionPostFromUserProfile();
      await recognitionHubPage.verifyCommentingAllowedForPost(false);
      const countAfterDisable = await recognitionHubPage.countTheComments();
      expect(countAfterDisable).toBe(0);

      // Re-enable and verify comments reappear and can add new
      await manageAppSettingsApi.enableDisableCommentsSettingViaApi(appManagerPage, 'enable', true);
      await recognitionHubPage.navigateRecognitionHubViaEndpoint(PAGE_ENDPOINTS.RECOGNITION_HUB);
      await recognitionHubPage.navigateToAwardRecipientProfileFromHubViaLinkClick();
      await userProfilePage.navigateToReceivedAwardFromUserProfile(
        peerToPeerAwardTestData.awardName,
        'Peer recognition'
      );
      await userProfilePage.navigateToRecognitionPostFromUserProfile();
      await recognitionHubPage.verifyCommentingAllowedForPost(true);
      const countAfterReEnable = await recognitionHubPage.countTheComments();
      expect(countAfterReEnable).toBeGreaterThan(0);
      const newComment = `Auto re-enabled comment ${Date.now()}`;
      await recognitionHubPage.commentOnPost(newComment);
      const countAfterNew = await recognitionHubPage.countTheComments();
      expect(countAfterNew).toBeGreaterThan(countAfterReEnable);

      await LoginHelper.logoutByNavigatingToLogoutPage(appManagerPage);
      await LoginHelper.loginWithPassword(appManagerPage, {
        email: getRecognitionTenantConfigFromCache().appManagerEmail!,
        password: getRecognitionTenantConfigFromCache().appManagerPassword!,
      });
      await recognitionHubApi.deleteAwardViaApi(appManagerPage, 'Peer recognition', awardId);
    }
  );
});
