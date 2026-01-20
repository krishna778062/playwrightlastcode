/* eslint-disable simple-import-sort/imports */
import { expect } from 'playwright/test';

import { PAGE_ENDPOINTS } from '@core/constants/pageEndpoints';
import { TestPriority } from '@core/constants/testPriority';
import { TestGroupType } from '@core/constants/testType';
import { tagTest } from '@core/utils/testDecorator';
import { GiveRecognitionDialogBox } from '@recognition-components/give-recognition-dialog-box';
import { RecognitionFeatureTags, RecognitionSuitTags } from '@recognition/constants/testTags';
import { recognitionTestFixture as test } from '@recognition/fixtures/recognitionFixture';
import { RecognitionHubPage } from '@recognition-pages/recognitionHubPage';
import { UserProfilePage } from '@recognition-pages/userProfilePage';
import { FeedPage } from '@recognition/ui/pages/feedPage';
import { getRecognitionTenantConfigFromCache } from '@recognition/config/recognitionConfig';

test.describe('Recognition user from hub - only peer enablement mode', () => {
  test(
    'Verify peer recognition when giving it from feed when only peer enablement is active',
    {
      tag: [
        RecognitionSuitTags.REGRESSION_TEST,
        RecognitionFeatureTags.MANAGE_RECOGNITION,
        RecognitionFeatureTags.ONLY_P2P_RECOGNITION,
        TestPriority.P2,
        TestGroupType.REGRESSION,
      ],
    },
    async ({ appManagerFixture, recognitionHubApi, manageAwardsApi }) => {
      tagTest(test.info(), {
        zephyrTestId: 'RC-6173',
        storyId: 'RC-6090',
      });

      const { page: appManagerPage } = appManagerFixture;
      const recognitionHubPage = new RecognitionHubPage(appManagerPage);
      const dialog = new GiveRecognitionDialogBox(appManagerPage);
      const feedPage = new FeedPage(appManagerPage);

      // Pre-req: create peer recognition award via api
      const awardName = `Auto P2P Hub Feed ${Date.now()}`;
      const awardDescription = `Automation peer recognition award ${Date.now()}`;
      const { awardId, awardName: createdAwardName } = await manageAwardsApi.createAwardViaApi(
        appManagerPage,
        'Peer to Peer',
        awardName,
        awardDescription
      );
      const recognitionMessage = `Auto hub recognition ${createdAwardName}`;
      const shareMessage = `Share peer recognition ${createdAwardName}`;
      const commentText = `Auto comment ${createdAwardName}`;

      // Open give recognition form on hub (home feed) and verify spot award tab not visible
      await feedPage.navigateFeedPageViaEndpoint(PAGE_ENDPOINTS.FEED, 'home feed');
      await feedPage.clickRecognitionTabFromFeedPage();
      await expect(dialog.spotAwardTab).toBeHidden();

      // Create peer recognition (use first recipient) and recognize
      await feedPage.selectUserForRecognitionFeedPage(0);
      await feedPage.selectAwardForRecognitionFeedPage(createdAwardName);
      await feedPage.enterDescriptionMessageFeedPage(recognitionMessage);
      await feedPage.recognizeButton.click();
      await recognitionHubPage.verifyToastMessageIsVisibleWithText('Recognition published');
      await recognitionHubPage.postRecognitionAward({
        shareToHub: false,
        shareToSite: false,
        shareToSlack: false,
        nonUnifiedPost: true,
      });

      // Share the post and Cheer and comment on the post
      await recognitionHubPage.navigateRecognitionHubViaEndpoint(PAGE_ENDPOINTS.RECOGNITION_HUB);
      const { postUrl, awardId: recognitionAwardId } = await recognitionHubPage.copyLinkFromPost(0);
      await recognitionHubPage.shareRecognitionPostFromHubToFeed(shareMessage, 'home feed');
      await recognitionHubPage.navigateToAwardPostViaUrl(postUrl);
      await recognitionHubPage.toggleCheerOnCard(recognitionHubPage.feedPost.first());
      await recognitionHubPage.verifyCommentingAllowedForPost(true);
      await recognitionHubPage.commentOnPost(commentText);

      // cleanup: delete the created award and the recognition award post
      await recognitionHubApi.deleteRecognitionAwardPostViaApi(appManagerPage, 'Peer recognition', recognitionAwardId);
      await manageAwardsApi.deleteAwardViaApi(appManagerPage, 'Peer to peer', awardId);
    }
  );

  test(
    'Verify peer recognition on hub when only peer enablement is active',
    {
      tag: [
        RecognitionSuitTags.REGRESSION_TEST,
        RecognitionFeatureTags.MANAGE_RECOGNITION,
        RecognitionFeatureTags.ONLY_P2P_RECOGNITION,
        TestPriority.P1,
        TestGroupType.SANITY,
      ],
    },
    async ({ appManagerFixture, recognitionHubApi, manageAwardsApi }) => {
      tagTest(test.info(), {
        zephyrTestId: 'RC-6170',
        storyId: 'RC-6090',
      });
      const { page: appManagerPage } = appManagerFixture;
      const recognitionHubPage = new RecognitionHubPage(appManagerPage);
      const dialog = new GiveRecognitionDialogBox(appManagerPage);

      // Pre-req: create peer recognition award via api
      const awardName = `Auto P2P Hub ${Date.now()}`;
      const awardDescription = `Automation peer recognition award ${Date.now()}`;
      const { awardId, awardName: createdAwardName } = await manageAwardsApi.createAwardViaApi(
        appManagerPage,
        'Peer to Peer',
        awardName,
        awardDescription
      );
      const recognitionMessage = `Auto hub recognition ${createdAwardName}`;
      const shareMessage = `Share peer recognition ${createdAwardName}`;
      const commentText = `Auto comment ${createdAwardName}`;

      // Open give recognition dialog on hub and verify spot award tab not visible
      await recognitionHubPage.navigateRecognitionHubViaEndpoint(PAGE_ENDPOINTS.RECOGNITION_HUB);
      await recognitionHubPage.clickOnGiveRecognition();
      await expect(dialog.spotAwardTab).toBeHidden();

      // Create peer recognition (use first recipient/award) and recognize
      await dialog.selectTheUserForRecognition(0);
      await dialog.selectThePeerRecognitionAwardForRecognition(createdAwardName);
      await dialog.enterTheRecognitionMessage(recognitionMessage);
      await dialog.recognizeButton.click();
      await recognitionHubPage.verifyToastMessageIsVisibleWithText('Recognition published');
      await recognitionHubPage.postRecognitionAward({
        shareToHub: false,
        shareToSite: false,
        shareToSlack: false,
        nonUnifiedPost: true,
      });

      // Share the post and Cheer and comment on the post
      const { postUrl, awardId: recognitionAwardId } = await recognitionHubPage.copyLinkFromPost(0);
      await recognitionHubPage.shareRecognitionPostFromHubToFeed(shareMessage, 'home feed');
      await recognitionHubPage.navigateToAwardPostViaUrl(postUrl);
      await recognitionHubPage.toggleCheerOnCard(recognitionHubPage.feedPost.first());
      await recognitionHubPage.verifyCommentingAllowedForPost(true);
      await recognitionHubPage.commentOnPost(commentText);

      //cleanup: delete the created award and the recognition award post
      await recognitionHubApi.deleteRecognitionAwardPostViaApi(appManagerPage, 'Peer recognition', recognitionAwardId);
      await manageAwardsApi.deleteAwardViaApi(appManagerPage, 'Peer to peer', awardId);
    }
  );

  test(
    'Verify peer recognition on user profile when only peer enablement is active',
    {
      tag: [
        RecognitionSuitTags.REGRESSION_TEST,
        RecognitionFeatureTags.MANAGE_RECOGNITION,
        RecognitionFeatureTags.ONLY_P2P_RECOGNITION,
        TestPriority.P2,
        TestGroupType.REGRESSION,
      ],
    },
    async ({ appManagerFixture, recognitionHubApi, manageAwardsApi }) => {
      tagTest(test.info(), {
        zephyrTestId: 'RC-6172',
        storyId: 'RC-6090',
      });
      const { page: appManagerPage } = appManagerFixture;
      const recognitionHubPage = new RecognitionHubPage(appManagerPage);
      const userProfilePage = new UserProfilePage(appManagerPage);
      const dialog = new GiveRecognitionDialogBox(appManagerPage);

      // Pre-req: create peer recognition award via api
      const awardName = `Auto P2P Profile ${Date.now()}`;
      const awardDescription = `Automation peer recognition award ${Date.now()}`;
      const { awardId, awardName: createdAwardName } = await manageAwardsApi.createAwardViaApi(
        appManagerPage,
        'Peer to Peer',
        awardName,
        awardDescription
      );
      const recognitionMessage = `Auto profile recognition ${createdAwardName}`;
      const commentText = `Auto comment ${createdAwardName}`;

      // Give recognition from another user profile
      await userProfilePage.navigateToAnotherUserProfileViaUrl(
        getRecognitionTenantConfigFromCache().endUserUserId,
        getRecognitionTenantConfigFromCache().endUserName
      );
      await userProfilePage.recognizeButton.click();
      await expect(dialog.spotAwardTab).toBeHidden();
      await dialog.selectTheUserForRecognition(0);
      await dialog.selectThePeerRecognitionAwardForRecognition(createdAwardName);
      await dialog.enterTheRecognitionMessage(recognitionMessage);
      await expect(dialog.recognizeButton).toBeEnabled();
      await dialog.recognizeButton.click();

      // Navigate to recipient profile via feed and validate award presence
      await recognitionHubPage.navigateRecognitionHubViaEndpoint(PAGE_ENDPOINTS.RECOGNITION_HUB);
      const { postUrl, awardId: recognitionAwardId } = await recognitionHubPage.copyLinkFromPost(0);
      await recognitionHubPage.navigateToAwardPostViaUrl(postUrl);
      await recognitionHubPage.verifyCommentingAllowedForPost(true);
      await recognitionHubPage.commentOnPost(commentText);
      await recognitionHubPage.toggleCheerOnCard(recognitionHubPage.feedPost.first());

      // cleanup: delete the created award and the recognition award post
      await recognitionHubApi.deleteRecognitionAwardPostViaApi(appManagerPage, 'Peer recognition', recognitionAwardId);
      await manageAwardsApi.deleteAwardViaApi(appManagerPage, 'Peer to peer', awardId);
    }
  );

  test(
    'Validate Award details in User Profile once user receive peer award from User profile',
    {
      tag: [
        RecognitionSuitTags.REGRESSION_TEST,
        RecognitionFeatureTags.MANAGE_RECOGNITION,
        RecognitionFeatureTags.ONLY_P2P_RECOGNITION,
        TestPriority.P2,
        TestGroupType.REGRESSION,
      ],
    },
    async ({ appManagerFixture, recognitionHubApi, manageAwardsApi }) => {
      tagTest(test.info(), {
        zephyrTestId: 'RC-6171',
        storyId: 'RC-6090',
      });

      const { page: appManagerPage } = appManagerFixture;
      const recognitionHubPage = new RecognitionHubPage(appManagerPage);
      const userProfilePage = new UserProfilePage(appManagerPage);
      const dialog = new GiveRecognitionDialogBox(appManagerPage);

      // Pre-req: create peer recognition award via api
      const awardName = `Auto P2P Profile Award ${Date.now()}`;
      const awardDescription = `Automation peer recognition award ${Date.now()}`;
      const { awardId, awardName: createdAwardName } = await manageAwardsApi.createAwardViaApi(
        appManagerPage,
        'Peer to Peer',
        awardName,
        awardDescription
      );
      const recognitionMessage = `Auto profile recognition ${createdAwardName}`;
      const commentText = `Auto comment ${createdAwardName}`;

      // Give recognition from another user profile
      await userProfilePage.navigateToAnotherUserProfileViaUrl(
        getRecognitionTenantConfigFromCache().endUserUserId,
        getRecognitionTenantConfigFromCache().endUserName
      );
      await userProfilePage.recognizeButton.click();
      await expect(dialog.spotAwardTab).toBeHidden();
      await dialog.selectTheUserForRecognition(0);
      await dialog.selectThePeerRecognitionAwardForRecognition(createdAwardName);
      await dialog.enterTheRecognitionMessage(recognitionMessage);
      await expect(dialog.recognizeButton).toBeEnabled();
      await dialog.recognizeButton.click();

      await recognitionHubPage.postRecognitionAward({
        shareToHub: false,
        shareToSite: false,
        shareToSlack: false,
        nonUnifiedPost: true,
      });

      await userProfilePage.navigateToReceivedAwardFromUserProfile(createdAwardName, 'Peer recognition');
      await userProfilePage.navigateToRecognitionPostFromUserProfile();
      await recognitionHubPage.verifyCommentingAllowedForPost(true);
      await recognitionHubPage.commentOnPost(commentText);
      await recognitionHubPage.toggleCheerOnCard(recognitionHubPage.feedPost.first());
      const { awardId: recognitionAwardId } = await recognitionHubPage.copyLinkFromPost(0);

      // cleanup: delete the created award and the recognition award post
      await recognitionHubApi.deleteRecognitionAwardPostViaApi(appManagerPage, 'Peer recognition', recognitionAwardId);
      await manageAwardsApi.deleteAwardViaApi(appManagerPage, 'Peer to peer', awardId);
    }
  );
});
