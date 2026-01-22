/* eslint-disable simple-import-sort/imports */
import { TestPriority } from '@core/constants/testPriority';
import { TestGroupType } from '@core/constants/testType';
import { tagTest } from '@core/utils/testDecorator';
import { RecognitionFeatureTags, RecognitionSuitTags } from '@recognition/constants/testTags';
import { recognitionTestFixture as test } from '@recognition/fixtures/recognitionFixture';

import { ManageAppSettingsApiService } from '@recognition-api/services/ManageAppSettingsApiService';
import { RecognitionHubPage } from '@recognition-pages/recognitionHubPage';
import { FeedPage } from '@recognition-pages/feedPage';
import { LoginHelper } from '@/src/core/helpers';

import { getRecognitionTenantConfigFromCache } from '@recognition/config/recognitionConfig';

import { PAGE_ENDPOINTS } from '@/src/core/constants/pageEndpoints';
import { expect } from 'playwright/test';
import { commonRecognitionTestData } from '@recognition/test-data/awardTestData';
import { DialogContainerForm } from '@recognition/ui/components/common/dialog-container-form';

test.describe('Add comments to unified posts - hub/feed', () => {
  test(
    'Verify add new comments to unified posts when comments are enabled on home feed',
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
        zephyrTestId: 'RC-7238',
        storyId: 'RC-6615',
      });
      const { page: appManagerPage } = appManagerFixture;
      const manageAppSettingsApi = new ManageAppSettingsApiService();
      const recognitionHubPage = new RecognitionHubPage(appManagerPage);
      const feedPage = new FeedPage(appManagerPage);

      // Pre-req: comments enable
      await manageAppSettingsApi.enableDisableCommentsSettingViaApi(appManagerPage, 'enable', true);
      // Create non-unified post (no feed/site/slack share)
      await recognitionHubPage.navigateRecognitionHubViaEndpoint(PAGE_ENDPOINTS.RECOGNITION_HUB);
      await recognitionHubPage.givePeerRecognition(0, 0);
      await recognitionHubPage.postRecognitionAward({
        shareToHub: false,
        shareToSite: false,
        shareToSlack: false,
        nonUnifiedPost: true,
      });
      const { postUrl, awardId } = await recognitionHubPage.copyLinkFromPost(0);
      const shareMessage = 'Recognition award share message'.concat(`_${Date.now()}`);
      await recognitionHubPage.shareRecognitionPostFromHubToFeed(shareMessage, 'home feed');

      // Navigate to the feed page and view the recognition post before adding a comment
      await feedPage.navigateFeedPageViaEndpoint(PAGE_ENDPOINTS.FEED, 'home feed');
      await feedPage.clickViewRecognitionLinkOnFeedPage(0, 'home feed');
      await recognitionHubPage.verifyCommentingAllowedForPost(true);
      // Add comment as app manager and validate increment
      const commentCountBefore = await recognitionHubPage.countTheComments();
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
      await appManagerPage.goto(postUrl);
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
      await recognitionHubApi.deleteRecognitionAwardPostViaApi(appManagerPage, 'Peer recognition', awardId);
    }
  );

  test(
    'Verify add new comments to unified posts when comments are disabled on site feed',
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
        zephyrTestId: 'RC-7236',
        storyId: 'RC-6615',
      });
      const { page: appManagerPage } = appManagerFixture;
      const manageAppSettingsApi = new ManageAppSettingsApiService();
      const recognitionHubPage = new RecognitionHubPage(appManagerPage);
      const feedPage = new FeedPage(appManagerPage);

      // Pre-req: comments disable
      await manageAppSettingsApi.enableDisableCommentsSettingViaApi(appManagerPage, 'disable', false);

      // Create non-unified post (no feed/site/slack share)
      await recognitionHubPage.navigateRecognitionHubViaEndpoint(PAGE_ENDPOINTS.RECOGNITION_HUB);
      await recognitionHubPage.givePeerRecognition(0, 0);
      await recognitionHubPage.postRecognitionAward({
        shareToHub: false,
        shareToSite: false,
        shareToSlack: false,
        nonUnifiedPost: true,
      });
      const { postUrl, awardId } = await recognitionHubPage.copyLinkFromPost(0);
      const shareMessage = 'Recognition award share message'.concat(`_${Date.now()}`);
      await recognitionHubPage.shareRecognitionPostFromHubToFeed(
        shareMessage,
        'site feed',
        commonRecognitionTestData.siteName
      );

      // Navigate to the feed page and view the recognition post before adding a comment
      await feedPage.navigateFeedPageViaEndpoint(
        PAGE_ENDPOINTS.SEARCH_SITE_FEED + commonRecognitionTestData.siteName,
        'site feed'
      );
      await feedPage.clickViewRecognitionLinkOnFeedPage(0, 'site feed');
      await recognitionHubPage.verifyCommentingAllowedForPost(false);
      const commentsAfterDisableSite = await recognitionHubPage.countTheComments();
      expect(commentsAfterDisableSite).toBe(0);

      //standard user login
      await LoginHelper.logoutByNavigatingToLogoutPage(appManagerFixture.page);
      await LoginHelper.loginWithPassword(appManagerFixture.page, {
        email: getRecognitionTenantConfigFromCache().endUserEmail!,
        password: getRecognitionTenantConfigFromCache().endUserPassword!,
      });
      await appManagerPage.goto(postUrl);
      await recognitionHubPage.verifyCommentingAllowedForPost(false);
      const commentsAfterDisableEndUser = await recognitionHubPage.countTheComments();
      expect(commentsAfterDisableEndUser).toBe(0);

      //clean up now delete recognition award as an app manager
      await LoginHelper.logoutByNavigatingToLogoutPage(appManagerPage);
      await LoginHelper.loginWithPassword(appManagerPage, {
        email: getRecognitionTenantConfigFromCache().appManagerEmail!,
        password: getRecognitionTenantConfigFromCache().appManagerPassword!,
      });
      await recognitionHubApi.deleteRecognitionAwardPostViaApi(appManagerPage, 'Peer recognition', awardId);
    }
  );

  test(
    'Verify previously made comments to unified posts when comments are disabled on home feed',
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
        zephyrTestId: 'RC-7240',
        storyId: 'RC-6615',
      });
      const { page: appManagerPage } = appManagerFixture;
      const manageAppSettingsApi = new ManageAppSettingsApiService();
      const recognitionHubPage = new RecognitionHubPage(appManagerPage);
      const feedPage = new FeedPage(appManagerPage);

      // Enable to seed comment, then disable
      await manageAppSettingsApi.enableDisableCommentsSettingViaApi(appManagerPage, 'enable', true);

      await recognitionHubPage.navigateRecognitionHubViaEndpoint(PAGE_ENDPOINTS.RECOGNITION_HUB);
      await recognitionHubPage.givePeerRecognition(0, 0);
      await recognitionHubPage.postRecognitionAward({
        shareToHub: false,
        shareToSite: false,
        shareToSlack: false,
        nonUnifiedPost: true,
      });
      const { postUrl: _unusedPostUrl3, awardId } = await recognitionHubPage.copyLinkFromPost(0);
      const shareMessage = `Recognition award share message_${Date.now()}`;
      await recognitionHubPage.shareRecognitionPostFromHubToFeed(shareMessage, 'home feed');

      // Seed initial comment while enabled
      await feedPage.navigateFeedPageViaEndpoint(PAGE_ENDPOINTS.FEED, 'home feed');
      await feedPage.clickViewRecognitionLinkOnFeedPage(0, 'home feed');
      await recognitionHubPage.verifyCommentingAllowedForPost(true);
      const initialCount = await recognitionHubPage.countTheComments();
      const seededComment = `Auto seeded comment ${Date.now()}`;
      await recognitionHubPage.commentOnPost(seededComment);
      const countAfterSeed = await recognitionHubPage.countTheComments();
      expect(countAfterSeed).toBeGreaterThan(initialCount);

      // Disable comments and verify hidden / not allowed
      await manageAppSettingsApi.enableDisableCommentsSettingViaApi(appManagerPage, 'disable', false);
      await feedPage.navigateFeedPageViaEndpoint(PAGE_ENDPOINTS.FEED, 'home feed');
      await feedPage.clickViewRecognitionLinkOnFeedPage(0, 'home feed');
      await recognitionHubPage.verifyCommentingAllowedForPost(false);
      const countAfterDisable = await recognitionHubPage.countTheComments();
      expect(countAfterDisable).toBe(0);

      // Standard user should also not see/add comments
      await LoginHelper.logoutByNavigatingToLogoutPage(appManagerPage);
      await LoginHelper.loginWithPassword(appManagerPage, {
        email: getRecognitionTenantConfigFromCache().endUserEmail!,
        password: getRecognitionTenantConfigFromCache().endUserPassword!,
      });
      await feedPage.navigateFeedPageViaEndpoint(PAGE_ENDPOINTS.FEED, 'home feed');
      await feedPage.clickViewRecognitionLinkOnFeedPage(0, 'home feed');
      await recognitionHubPage.verifyCommentingAllowedForPost(false);
      const countAfterDisableEndUser = await recognitionHubPage.countTheComments();
      expect(countAfterDisableEndUser).toBe(0);

      // Cleanup - delete recognition award as an app manager
      await LoginHelper.logoutByNavigatingToLogoutPage(appManagerPage);
      await LoginHelper.loginWithPassword(appManagerPage, {
        email: getRecognitionTenantConfigFromCache().appManagerEmail!,
        password: getRecognitionTenantConfigFromCache().appManagerPassword!,
      });
      await recognitionHubApi.deleteRecognitionAwardPostViaApi(appManagerPage, 'Peer recognition', awardId);
    }
  );

  test(
    'Verify previously made comments to unified posts when comments are enabled on site feed',
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
        zephyrTestId: 'RC-7242',
        storyId: 'RC-6615',
      });
      const { page: appManagerPage } = appManagerFixture;
      const manageAppSettingsApi = new ManageAppSettingsApiService();
      const recognitionHubPage = new RecognitionHubPage(appManagerPage);
      const feedPage = new FeedPage(appManagerPage);

      // Enable comments
      await manageAppSettingsApi.enableDisableCommentsSettingViaApi(appManagerPage, 'enable', true);

      // Create unified post and share to site feed
      await recognitionHubPage.navigateRecognitionHubViaEndpoint(PAGE_ENDPOINTS.RECOGNITION_HUB);
      await recognitionHubPage.givePeerRecognition(0, 0);
      await recognitionHubPage.postRecognitionAward({
        shareToHub: false,
        shareToSite: false,
        shareToSlack: false,
        nonUnifiedPost: true,
      });
      const { postUrl: _unusedPostUrl4, awardId } = await recognitionHubPage.copyLinkFromPost(0);
      const shareMessage = `Recognition award share message_${Date.now()}`;
      await recognitionHubPage.shareRecognitionPostFromHubToFeed(
        shareMessage,
        'site feed',
        commonRecognitionTestData.siteName
      );

      // Seed comment as app manager on site feed
      await feedPage.navigateFeedPageViaEndpoint(
        PAGE_ENDPOINTS.SEARCH_SITE_FEED + commonRecognitionTestData.siteName,
        'site feed',
        commonRecognitionTestData.siteName
      );
      await feedPage.clickViewRecognitionLinkOnFeedPage(0, 'site feed');
      await recognitionHubPage.verifyCommentingAllowedForPost(true);
      const initialCount = await recognitionHubPage.countTheComments();
      const seededComment = `Auto seeded comment ${Date.now()}`;
      await recognitionHubPage.commentOnPost(seededComment);
      const countAfterSeed = await recognitionHubPage.countTheComments();
      expect(countAfterSeed).toBeGreaterThan(initialCount);

      // Standard user should see previous comments and can add new
      await LoginHelper.logoutByNavigatingToLogoutPage(appManagerPage);
      await LoginHelper.loginWithPassword(appManagerPage, {
        email: getRecognitionTenantConfigFromCache().endUserEmail!,
        password: getRecognitionTenantConfigFromCache().endUserPassword!,
      });
      await feedPage.navigateFeedPageViaEndpoint(
        PAGE_ENDPOINTS.SEARCH_SITE_FEED + commonRecognitionTestData.siteName,
        'site feed',
        commonRecognitionTestData.siteName
      );
      await feedPage.clickViewRecognitionLinkOnFeedPage(0, 'site feed');
      await recognitionHubPage.verifyCommentingAllowedForPost(true);
      const countVisibleEndUser = await recognitionHubPage.countTheComments();
      expect(countVisibleEndUser).toBeGreaterThan(0);
      const endUserComment = `End user comment ${Date.now()}`;
      await recognitionHubPage.commentOnPost(endUserComment);
      const countAfterEndUser = await recognitionHubPage.countTheComments();
      expect(countAfterEndUser).toBeGreaterThan(countVisibleEndUser);

      // Cleanup - delete recognition award as an app manager
      await LoginHelper.logoutByNavigatingToLogoutPage(appManagerPage);
      await LoginHelper.loginWithPassword(appManagerPage, {
        email: getRecognitionTenantConfigFromCache().appManagerEmail!,
        password: getRecognitionTenantConfigFromCache().appManagerPassword!,
      });
      await recognitionHubApi.deleteRecognitionAwardPostViaApi(appManagerPage, 'Peer recognition', awardId);
    }
  );

  test(
    'Verify disabled/re-enabled comments for unified post in hub and home feed',
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
        zephyrTestId: 'RC-7245',
        storyId: 'RC-6615',
      });
      const { page: appManagerPage } = appManagerFixture;
      const manageAppSettingsApi = new ManageAppSettingsApiService();
      const recognitionHubPage = new RecognitionHubPage(appManagerPage);
      const feedPage = new FeedPage(appManagerPage);

      // Enable comments and create post
      await manageAppSettingsApi.enableDisableCommentsSettingViaApi(appManagerPage, 'enable', true);
      await recognitionHubPage.navigateRecognitionHubViaEndpoint(PAGE_ENDPOINTS.RECOGNITION_HUB);
      await recognitionHubPage.givePeerRecognition(0, 0);
      await recognitionHubPage.postRecognitionAward({
        shareToHub: false,
        shareToSite: false,
        shareToSlack: false,
        nonUnifiedPost: true,
      });
      const { postUrl: _unusedPostUrl5, awardId } = await recognitionHubPage.copyLinkFromPost(0);
      const shareMessage = `Recognition award share message_${Date.now()}`;
      await recognitionHubPage.shareRecognitionPostFromHubToFeed(shareMessage, 'home feed');

      // Seed initial comment while enabled
      await feedPage.navigateFeedPageViaEndpoint(PAGE_ENDPOINTS.FEED, 'home feed');
      await feedPage.clickViewRecognitionLinkOnFeedPage(0, 'home feed');
      await recognitionHubPage.verifyCommentingAllowedForPost(true);
      const initialCount = await recognitionHubPage.countTheComments();
      const seededComment = `Auto seeded comment ${Date.now()}`;
      await recognitionHubPage.commentOnPost(seededComment);
      const countAfterSeed = await recognitionHubPage.countTheComments();
      expect(countAfterSeed).toBeGreaterThan(initialCount);

      // Disable comments and verify hidden
      await manageAppSettingsApi.enableDisableCommentsSettingViaApi(appManagerPage, 'disable', false);
      await feedPage.navigateFeedPageViaEndpoint(PAGE_ENDPOINTS.FEED, 'home feed');
      await feedPage.clickViewRecognitionLinkOnFeedPage(0, 'home feed');
      await recognitionHubPage.verifyCommentingAllowedForPost(false);
      const countAfterDisable = await recognitionHubPage.countTheComments();
      expect(countAfterDisable).toBe(0);

      // Re-enable comments and ensure previous comments reappear and new ones can be added
      await manageAppSettingsApi.enableDisableCommentsSettingViaApi(appManagerPage, 'enable', true);
      await feedPage.navigateFeedPageViaEndpoint(PAGE_ENDPOINTS.FEED, 'home feed');
      await feedPage.clickViewRecognitionLinkOnFeedPage(0, 'home feed');
      await recognitionHubPage.verifyCommentingAllowedForPost(true);
      const countAfterReEnable = await recognitionHubPage.countTheComments();
      expect(countAfterReEnable).toBeGreaterThan(0);
      const newComment = `Auto re-enabled comment ${Date.now()}`;
      await recognitionHubPage.commentOnPost(newComment);
      const countAfterNew = await recognitionHubPage.countTheComments();
      expect(countAfterNew).toBeGreaterThan(countAfterReEnable);

      // Cleanup - delete recognition award as an app manager
      await LoginHelper.logoutByNavigatingToLogoutPage(appManagerPage);
      await LoginHelper.loginWithPassword(appManagerPage, {
        email: getRecognitionTenantConfigFromCache().appManagerEmail!,
        password: getRecognitionTenantConfigFromCache().appManagerPassword!,
      });
      await recognitionHubApi.deleteRecognitionAwardPostViaApi(appManagerPage, 'Peer recognition', awardId);
    }
  );
});

test.describe('Share peer recognition from hub - Site feed', () => {
  test(
    'Validate recognition post can be shared to Site feed while posting it on Hub',
    {
      tag: [RecognitionSuitTags.REGRESSION_TEST, TestPriority.P2, TestGroupType.REGRESSION],
    },
    async ({ appManagerFixture, recognitionHubApi }) => {
      tagTest(test.info(), {
        zephyrTestId: 'RC-4214',
        storyId: 'RC-1526',
      });
      const { page: appManagerPage } = appManagerFixture;
      const recognitionHubPage = new RecognitionHubPage(appManagerPage);
      const dialogContainerForm = new DialogContainerForm(appManagerPage);
      await recognitionHubPage.navigateRecognitionHubViaEndpoint(PAGE_ENDPOINTS.RECOGNITION_HUB);
      await recognitionHubPage.givePeerRecognition(0, 0);
      await dialogContainerForm.crossButton.click();
      await recognitionHubPage.shareRecognitionPostFromHubToFeed(
        `Recognition award share message_${Date.now()}`,
        'site feed',
        commonRecognitionTestData.siteName
      );
      const { awardId: recognitionAwardId } = await recognitionHubPage.copyLinkFromPost(0);
      await recognitionHubApi.deleteRecognitionAwardPostViaApi(appManagerPage, 'Peer recognition', recognitionAwardId);
    }
  );
});
