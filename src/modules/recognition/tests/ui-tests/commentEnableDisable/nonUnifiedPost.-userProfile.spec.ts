/* eslint-disable simple-import-sort/imports */
import { TestPriority } from '@core/constants/testPriority';
import { TestGroupType } from '@core/constants/testType';
import { tagTest } from '@core/utils/testDecorator';
import { RecognitionFeatureTags, RecognitionSuitTags } from '@recognition/constants/testTags';
import { recognitionTestFixture as test } from '@recognition/fixtures/recognitionFixture';
import { peerToPeerAwardTestData } from '@recognition/test-data/awardTestData';

import { ManageAppSettingsApiService } from '@recognition-api/services/ManageAppSettingsApiService';
import { RecognitionHubPage, UserProfilePage } from '@recognition-pages/index';
import { LoginHelper } from '@/src/core/helpers';

import { getRecognitionTenantConfigFromCache } from '@recognition/config/recognitionConfig';

import { PAGE_ENDPOINTS } from '@/src/core/constants/pageEndpoints';
import { expect } from 'playwright/test';

test.describe('Add comments to non-unified posts - user profile', () => {
  test(
    'Verify add new comments to non-unified posts when comments are enabled on user profile',
    {
      tag: [
        RecognitionSuitTags.REGRESSION_TEST,
        RecognitionFeatureTags.COMMENT_ENABLE_DISABLE,
        TestPriority.P1,
        TestGroupType.SANITY,
      ],
    },
    async ({ appManagerFixture, recognitionHubApi }) => {
      tagTest(test.info(), {
        zephyrTestId: 'RC-7249',
        storyId: 'RC-6615',
      });
      const { page: appManagerPage } = appManagerFixture;
      const manageAppSettingsApi = new ManageAppSettingsApiService();
      const recognitionHubPage = new RecognitionHubPage(appManagerPage);
      const userProfilePage = new UserProfilePage(appManagerPage);

      // Pre-req: comments enabled
      await manageAppSettingsApi.enableDisableCommentsSettingViaApi(appManagerPage, 'enable', true);
      // Create non-unified post (no feed/site/slack share)
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
      await recognitionHubPage.navigateToAwardRecipientProfileFromHubViaLinkClick();
      await userProfilePage.navigateToReceivedAwardFromUserProfile(
        peerToPeerAwardTestData.awardName,
        'Peer recognition'
      );
      await userProfilePage.navigateToRecognitionPostFromUserProfile();
      await recognitionHubPage.verifyCommentingAllowedForPost(true);
      const commentCountBefore = await recognitionHubPage.countTheComments();
      // Add comment as app manager and validate increment
      const commentText = `Auto comment ${Date.now()}`;
      await recognitionHubPage.commentOnPost(commentText);
      const commentCountAfterManager = await recognitionHubPage.countTheComments();
      expect(commentCountAfterManager).toBeGreaterThan(commentCountBefore);

      //standard user login
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
      // Add another comment as standard user and validate increment again
      const commentTextStd = `Auto comment std ${Date.now()}`;
      await recognitionHubPage.commentOnPost(commentTextStd);
      const commentCountAfter = await recognitionHubPage.countTheComments();
      expect(commentCountAfter).toBeGreaterThan(commentCountAfterManager);

      //clean up now delete recognition award as an app manager
      await LoginHelper.logoutByNavigatingToLogoutPage(appManagerPage);
      await LoginHelper.loginWithPassword(appManagerPage, {
        email: getRecognitionTenantConfigFromCache().appManagerEmail!,
        password: getRecognitionTenantConfigFromCache().appManagerPassword!,
      });
      await recognitionHubApi.deleteAwardViaApi(appManagerPage, 'Peer recognition', awardId);
    }
  );

  test(
    'Verify add new comments to non-unified posts when comments are disabled on user profile',
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
        zephyrTestId: 'RC-7247',
        storyId: 'RC-6615',
      });
      const { page: appManagerPage } = appManagerFixture;
      const manageAppSettingsApi = new ManageAppSettingsApiService();
      const recognitionHubPage = new RecognitionHubPage(appManagerPage);
      const userProfilePage = new UserProfilePage(appManagerPage);

      // Pre-req: comments disabled
      await manageAppSettingsApi.enableDisableCommentsSettingViaApi(appManagerPage, 'disable', false);

      // Create non-unified post (no feed/site/slack share)
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

      // Navigate via profile path and verify commenting is blocked for app manager
      await recognitionHubPage.navigateToAwardRecipientProfileFromHubViaLinkClick();
      await userProfilePage.navigateToReceivedAwardFromUserProfile(
        peerToPeerAwardTestData.awardName,
        'Peer recognition'
      );
      await userProfilePage.navigateToRecognitionPostFromUserProfile();
      await recognitionHubPage.verifyCommentingAllowedForPost(false);
      const commentCountBefore = await recognitionHubPage.countTheComments();

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
      const commentCountAfter = await recognitionHubPage.countTheComments();
      expect(commentCountAfter).toBe(commentCountBefore);

      // Cleanup - delete recognition award as app manager
      await LoginHelper.logoutByNavigatingToLogoutPage(appManagerPage);
      await LoginHelper.loginWithPassword(appManagerPage, {
        email: getRecognitionTenantConfigFromCache().appManagerEmail!,
        password: getRecognitionTenantConfigFromCache().appManagerPassword!,
      });
      await recognitionHubApi.deleteAwardViaApi(appManagerPage, 'Peer recognition', awardId);
    }
  );

  test(
    'Verify previously made comments to non-unified posts when comments are disabled on user profile',
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
        zephyrTestId: 'RC-7251',
        storyId: 'RC-6615',
      });
      const { page: appManagerPage } = appManagerFixture;
      const manageAppSettingsApi = new ManageAppSettingsApiService();
      const recognitionHubPage = new RecognitionHubPage(appManagerPage);
      const userProfilePage = new UserProfilePage(appManagerPage);

      // Step 1: Enable comments and create a non-unified post with an initial comment
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
      const { postUrl, awardId } = await recognitionHubPage.copyLinkFromPost(0);
      await recognitionHubPage.navigateToAwardPostViaUrl(postUrl);
      await recognitionHubPage.verifyCommentingAllowedForPost(true);
      const seededCommentText = `Auto seeded comment ${Date.now()}`;
      await recognitionHubPage.commentOnPost(seededCommentText);
      const seededCommentCount = await recognitionHubPage.countTheComments();
      expect(seededCommentCount).toBeGreaterThan(0);

      // Step 2: Disable comments and ensure previous comments are not visible and new ones cannot be added (app manager)
      await manageAppSettingsApi.enableDisableCommentsSettingViaApi(appManagerPage, 'disable', false);
      await recognitionHubPage.navigateToAwardRecipientProfileFromHubViaLinkClick();
      await userProfilePage.navigateToReceivedAwardFromUserProfile(
        peerToPeerAwardTestData.awardName,
        'Peer recognition'
      );
      await appManagerPage.reload();
      await userProfilePage.navigateToRecognitionPostFromUserProfile();
      await recognitionHubPage.verifyCommentingAllowedForPost(false);
      const commentsAfterDisableManager = await recognitionHubPage.countTheComments();
      expect(commentsAfterDisableManager).toBe(0);

      // Step 3: Standard user should also not see or add comments
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
      const commentsAfterDisableStd = await recognitionHubPage.countTheComments();
      expect(commentsAfterDisableStd).toBe(0);

      // Cleanup - delete recognition award as app manager
      await LoginHelper.logoutByNavigatingToLogoutPage(appManagerPage);
      await LoginHelper.loginWithPassword(appManagerPage, {
        email: getRecognitionTenantConfigFromCache().appManagerEmail!,
        password: getRecognitionTenantConfigFromCache().appManagerPassword!,
      });
      await recognitionHubApi.deleteAwardViaApi(appManagerPage, 'Peer recognition', awardId);
    }
  );

  test(
    'Verify previously made comments to non-unified posts when comments are enabled on user profile',
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
        zephyrTestId: 'RC-7253',
        storyId: 'RC-6615',
      });
      const { page: appManagerPage } = appManagerFixture;
      const manageAppSettingsApi = new ManageAppSettingsApiService();
      const recognitionHubPage = new RecognitionHubPage(appManagerPage);
      const userProfilePage = new UserProfilePage(appManagerPage);

      // Enable comments and create a non-unified post with a seeded comment
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
      const { postUrl, awardId } = await recognitionHubPage.copyLinkFromPost(0);
      await recognitionHubPage.navigateToAwardPostViaUrl(postUrl);
      await recognitionHubPage.verifyCommentingAllowedForPost(true);
      const seededComment = `Auto seeded comment ${Date.now()}`;
      await recognitionHubPage.commentOnPost(seededComment);
      const commentsAfterSeed = await recognitionHubPage.countTheComments();
      expect(commentsAfterSeed).toBeGreaterThan(0);

      // App manager should see seeded comments and can add another
      await recognitionHubPage.navigateToAwardRecipientProfileFromHubViaLinkClick();
      await userProfilePage.navigateToReceivedAwardFromUserProfile(
        peerToPeerAwardTestData.awardName,
        'Peer recognition'
      );
      await userProfilePage.navigateToRecognitionPostFromUserProfile();
      await recognitionHubPage.verifyCommentingAllowedForPost(true);
      const commentTextManager = `Auto comment manager ${Date.now()}`;
      await recognitionHubPage.commentOnPost(commentTextManager);
      const commentsAfterManager = await recognitionHubPage.countTheComments();
      expect(commentsAfterManager).toBeGreaterThan(commentsAfterSeed);

      // Standard user should also see existing comments and can add new ones
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
      const commentsBeforeStd = await recognitionHubPage.countTheComments();
      const commentTextStd = `Auto comment std ${Date.now()}`;
      await recognitionHubPage.commentOnPost(commentTextStd);
      const commentsAfterStd = await recognitionHubPage.countTheComments();
      expect(commentsAfterStd).toBeGreaterThan(commentsBeforeStd);

      // Cleanup - delete recognition award as app manager
      await LoginHelper.logoutByNavigatingToLogoutPage(appManagerPage);
      await LoginHelper.loginWithPassword(appManagerPage, {
        email: getRecognitionTenantConfigFromCache().appManagerEmail!,
        password: getRecognitionTenantConfigFromCache().appManagerPassword!,
      });
      await recognitionHubApi.deleteAwardViaApi(appManagerPage, 'Peer recognition', awardId);
    }
  );

  test(
    'Verify disabled/re-enabled comments for non-unified post on user profile',
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
        zephyrTestId: 'RC-7255',
        storyId: 'RC-6615',
      });
      const { page: appManagerPage } = appManagerFixture;
      const manageAppSettingsApi = new ManageAppSettingsApiService();
      const recognitionHubPage = new RecognitionHubPage(appManagerPage);
      const userProfilePage = new UserProfilePage(appManagerPage);

      // Enable comments and create a non-unified post with an initial comment
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

      // Disable comments and verify they are hidden / cannot be added
      await manageAppSettingsApi.enableDisableCommentsSettingViaApi(appManagerPage, 'disable', false);
      await recognitionHubPage.navigateRecognitionHubViaEndpoint(PAGE_ENDPOINTS.RECOGNITION_HUB);
      await recognitionHubPage.navigateToAwardRecipientProfileFromHubViaLinkClick();
      await userProfilePage.navigateToReceivedAwardFromUserProfile(
        peerToPeerAwardTestData.awardName,
        'Peer recognition'
      );
      await appManagerPage.reload();
      await userProfilePage.navigateToRecognitionPostFromUserProfile();
      await recognitionHubPage.verifyCommentingAllowedForPost(false);
      const countWhileDisabled = await recognitionHubPage.countTheComments();
      expect(countWhileDisabled).toBe(0);

      // Re-enable comments and verify existing + new comments are visible/allowed
      await manageAppSettingsApi.enableDisableCommentsSettingViaApi(appManagerPage, 'enable', true);
      await recognitionHubPage.navigateRecognitionHubViaEndpoint(PAGE_ENDPOINTS.RECOGNITION_HUB);
      await recognitionHubPage.navigateToAwardRecipientProfileFromHubViaLinkClick();
      await userProfilePage.navigateToReceivedAwardFromUserProfile(
        peerToPeerAwardTestData.awardName,
        'Peer recognition'
      );
      await appManagerPage.reload();
      await userProfilePage.navigateToRecognitionPostFromUserProfile();
      await recognitionHubPage.verifyCommentingAllowedForPost(true);
      const countAfterReEnable = await recognitionHubPage.countTheComments();
      expect(countAfterReEnable).toBeGreaterThan(0);
      const newComment = `Auto comment re-enabled ${Date.now()}`;
      await recognitionHubPage.commentOnPost(newComment);
      const countAfterNew = await recognitionHubPage.countTheComments();
      expect(countAfterNew).toBeGreaterThan(countAfterReEnable);

      // Cleanup - delete recognition award as app manager
      await LoginHelper.logoutByNavigatingToLogoutPage(appManagerPage);
      await LoginHelper.loginWithPassword(appManagerPage, {
        email: getRecognitionTenantConfigFromCache().appManagerEmail!,
        password: getRecognitionTenantConfigFromCache().appManagerPassword!,
      });
      await recognitionHubApi.deleteAwardViaApi(appManagerPage, 'Peer recognition', awardId);
    }
  );
});
