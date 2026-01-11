/* eslint-disable simple-import-sort/imports */
import { TestPriority } from '@core/constants/testPriority';
import { TestGroupType } from '@core/constants/testType';
import { tagTest } from '@core/utils/testDecorator';
import { RecognitionFeatureTags, RecognitionSuitTags } from '@recognition/constants/testTags';
import { recognitionTestFixture as test } from '@recognition/fixtures/recognitionFixture';

import { ManageAppSettingsApiService } from '@recognition-api/services/ManageAppSettingsApiService';
import { RecognitionHubPage } from '@recognition-pages/recognitionHubPage';
import { LoginHelper } from '@/src/core/helpers';

import { getRecognitionTenantConfigFromCache } from '@recognition/config/recognitionConfig';

import { PAGE_ENDPOINTS } from '@/src/core/constants/pageEndpoints';
import { expect } from 'playwright/test';

test.describe('Add comments to non-unified posts', () => {
  test(
    'Verify add new comments to non-unified posts when comments are enabled',
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
        zephyrTestId: 'RC-7239',
        storyId: 'RC-6615',
      });
      const { page: appManagerPage } = appManagerFixture;
      const manageAppSettingsApi = new ManageAppSettingsApiService();
      const recognitionHubPage = new RecognitionHubPage(appManagerPage);

      // Pre-req: comments enabled
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
      await recognitionHubPage.navigateToAwardPostViaUrl(postUrl);
      await recognitionHubPage.verifyCommentingAllowedForPost(true);

      // Count before adding any comments in this test run
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
      await recognitionHubApi.deleteAwardViaApi(appManagerPage, 'Peer recognition', awardId);
    }
  );

  test(
    'Verify add new comments to non-unified posts when comments are disabled',
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
        zephyrTestId: 'RC-7237',
        storyId: 'RC-6615',
      });
      const { page: appManagerPage } = appManagerFixture;
      const manageAppSettingsApi = new ManageAppSettingsApiService();
      const recognitionHubPage = new RecognitionHubPage(appManagerPage);

      // Pre-req: comments disabled
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
      await recognitionHubPage.navigateToAwardPostViaUrl(postUrl);
      await recognitionHubPage.verifyCommentingAllowedForPost(false);

      // standard user login
      await LoginHelper.logoutByNavigatingToLogoutPage(appManagerFixture.page);
      await LoginHelper.loginWithPassword(appManagerFixture.page, {
        email: getRecognitionTenantConfigFromCache().endUserEmail!,
        password: getRecognitionTenantConfigFromCache().endUserPassword!,
      });
      await appManagerPage.goto(postUrl);
      await recognitionHubPage.verifyCommentingAllowedForPost(false);

      //clean up now delete recognition award as an app manager
      await LoginHelper.logoutByNavigatingToLogoutPage(appManagerPage);
      await LoginHelper.loginWithPassword(appManagerPage, {
        email: getRecognitionTenantConfigFromCache().appManagerEmail!,
        password: getRecognitionTenantConfigFromCache().appManagerPassword!,
      });
      // clean up
      await recognitionHubApi.deleteAwardViaApi(appManagerPage, 'Peer recognition', awardId);
      await manageAppSettingsApi.enableDisableCommentsSettingViaApi(appManagerPage, 'enable', true);
    }
  );

  test(
    'Verify previously made comments to non-unified posts when comments are disabled',
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
        zephyrTestId: 'RC-7241',
        storyId: 'RC-6615',
      });
      const { page: appManagerPage } = appManagerFixture;
      const manageAppSettingsApi = new ManageAppSettingsApiService();
      const recognitionHubPage = new RecognitionHubPage(appManagerPage);

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
      await recognitionHubPage.navigateToAwardPostViaUrl(postUrl);
      await recognitionHubPage.verifyCommentingAllowedForPost(true);
      const commentCountBefore = await recognitionHubPage.countTheComments();
      // Add comment as app manager and validate increment
      const commentText = `Auto comment ${Date.now()}`;
      await recognitionHubPage.commentOnPost(commentText);
      const commentCountAfterManager = await recognitionHubPage.countTheComments();
      expect(commentCountAfterManager).toBeGreaterThan(commentCountBefore);

      // Pre-req: comments disable
      await manageAppSettingsApi.enableDisableCommentsSettingViaApi(appManagerPage, 'disable', false);
      // check comment count is not visible
      await recognitionHubPage.navigateRecognitionHubViaEndpoint(PAGE_ENDPOINTS.RECOGNITION_HUB);
      await recognitionHubPage.navigateToAwardPostViaUrl(postUrl);
      await recognitionHubPage.verifyCommentingAllowedForPost(false);
      await expect(recognitionHubPage.commentCountIndicator).not.toBeAttached();
      await expect(recognitionHubPage.commentCountIndicator).toHaveCount(0);

      //clean up now delete recognition award as an app manager
      await recognitionHubApi.deleteAwardViaApi(appManagerPage, 'Peer recognition', awardId);
      await manageAppSettingsApi.enableDisableCommentsSettingViaApi(appManagerPage, 'enable', true);
    }
  );

  test(
    'Verify previously made comments to non-unified posts when comments are enabled',
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
        zephyrTestId: 'RC-7243',
        storyId: 'RC-6615',
      });
      const { page: appManagerPage } = appManagerFixture;
      const manageAppSettingsApi = new ManageAppSettingsApiService();
      const recognitionHubPage = new RecognitionHubPage(appManagerPage);

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
      await recognitionHubPage.navigateToAwardPostViaUrl(postUrl);
      await recognitionHubPage.verifyCommentingAllowedForPost(true);
      const commentCountBefore = await recognitionHubPage.countTheComments();
      // Add comment and validate increment
      const commentText = `Auto comment ${Date.now()}`;
      await recognitionHubPage.commentOnPost(commentText);
      const commentCountAfterManager = await recognitionHubPage.countTheComments();
      expect(commentCountAfterManager).toBeGreaterThan(commentCountBefore);

      // Add another comment and validate increment again
      const commentTextStd = `Auto comment std ${Date.now()}`;
      await recognitionHubPage.commentOnPost(commentTextStd);
      const commentCountAfter = await recognitionHubPage.countTheComments();
      expect(commentCountAfter).toBeGreaterThan(commentCountAfterManager);

      //clean up now delete recognition award as an app manager
      await recognitionHubApi.deleteAwardViaApi(appManagerPage, 'Peer recognition', awardId);
    }
  );
});
