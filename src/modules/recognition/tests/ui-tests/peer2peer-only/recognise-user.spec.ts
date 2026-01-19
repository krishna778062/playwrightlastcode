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

test.describe('Recognition user from hub - only peer enablement mode', () => {
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
});
