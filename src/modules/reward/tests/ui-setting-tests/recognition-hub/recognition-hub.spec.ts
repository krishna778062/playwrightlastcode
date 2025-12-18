import { expect } from '@playwright/test';
import { getRewardTenantConfigFromCache } from '@rewards/config/rewardConfig';
import { REWARD_FEATURE_TAGS } from '@rewards/constants/testTags';
import { rewardTestFixture as test } from '@rewards/fixtures/rewardFixture';
import { DialogBox } from '@rewards-components/common/dialog-box';
import { GiveRecognitionDialogBox } from '@rewards-components/recognition/give-recognition-dialog-box';
import { ManageRewardsOverviewPage } from '@rewards-pages/manage-rewards/manage-rewards-overview-page';
import { RecognitionHubPage } from '@rewards-pages/recognition-hub/recognition-hub-page';

import { tagTest, TestGroupType, TestPriority } from '@/src/core';

test(
  '[RC-3099] Validate rewards points are not shown on posts when rewards is disabled.',
  {
    tag: [
      REWARD_FEATURE_TAGS.RECOGNITION_POINT_LABELING,
      TestPriority.P0,
      TestGroupType.REGRESSION,
      TestGroupType.SMOKE,
      TestGroupType.HEALTHCHECK,
    ],
  },
  async ({ appManagerFixture }) => {
    tagTest(test.info(), {
      description: 'Validate rewards points are not shown on posts when rewards is disabled.',
      zephyrTestId: 'RC-3099',
      storyId: 'RC-3099',
    });

    const recognitionHub = new RecognitionHubPage(appManagerFixture.page);
    const manageRewardsPage = new ManageRewardsOverviewPage(appManagerFixture.page);
    await recognitionHub.enableTheRewardsAndPeerGiftingForHubIfDisabled();
    await recognitionHub.navigateToRecognitionHub();
    const rewardOptionIndex = 3;

    // Visit the Recognition Hub and give one recognition
    const existingOptions = await recognitionHub.visitRecognitionHub();
    await recognitionHub.verifyThePageIsLoaded();
    if (existingOptions.length <= 1) {
      await recognitionHub.setupTheMultipleGiftingOptions();
    }
    await recognitionHub.clickOnGiveRecognition();
    const giveRecognitionModal = new GiveRecognitionDialogBox(appManagerFixture.page);
    await giveRecognitionModal.selectTheUserForRecognition(getRewardTenantConfigFromCache().endUserName);
    await giveRecognitionModal.selectTheUserForRecognition(2);
    await giveRecognitionModal.selectThePeerRecognitionAwardForRecognition(1);
    const recognitionPostMessage = 'Test Message' + Math.floor(Math.random() * 1000);
    await giveRecognitionModal.enterTheRecognitionMessage(recognitionPostMessage);
    await giveRecognitionModal.giftThePoints(rewardOptionIndex);
    const [response] = await Promise.all([
      recognitionHub.page.waitForResponse(resp => resp.url().includes('/recognition/create')),
      giveRecognitionModal.recognizeButton.click({ force: true }),
    ]);

    const body = await response.json();
    if (!body?.id) throw new Error(`No id in response: ${JSON.stringify(body)}`);
    const recognitionPostId = String(body.id);

    // Handle dialog box if it appears
    const dialogBox = new DialogBox(appManagerFixture.page);
    if (await recognitionHub.verifier.isTheElementVisible(dialogBox.container)) {
      await dialogBox.container.waitFor({ state: 'visible' });
      await dialogBox.skipButton.click();
      await expect(dialogBox.container).not.toBeVisible();
    }

    await recognitionHub.page.goto(`/recognition/recognition/${recognitionPostId}`);
    await recognitionHub.verifyThePageIsLoaded();
    await recognitionHub.validateTheRewardElementsInRecognitionPost(
      true,
      String(rewardOptionIndex),
      'Only visible to recipients, their managers and app administrators'
    );

    // Disable the Rewards and Check the points are not visible
    await manageRewardsPage.loadPage();
    await manageRewardsPage.verifyThePageIsLoaded();
    await manageRewardsPage.disableTheRewards();
    await recognitionHub.page.goto(`/recognition/recognition/${recognitionPostId}`);
    await recognitionHub.verifyThePageIsLoaded();
    await recognitionHub.validateTheRewardElementsInRecognitionPost(
      false,
      String(rewardOptionIndex),
      'Only visible to recipients, their managers and app administrators'
    );

    // Enable the Rewards again
    await manageRewardsPage.loadPage();
    await manageRewardsPage.verifyThePageIsLoaded();
    await manageRewardsPage.enableTheRewards();
    await recognitionHub.page.goto(`/recognition/recognition/${recognitionPostId}`);
    await recognitionHub.verifyThePageIsLoaded();
    await recognitionHub.validateTheRewardElementsInRecognitionPost(
      true,
      String(rewardOptionIndex),
      'Only visible to recipients, their managers and app administrators'
    );
    await recognitionHub.deleteTheFirstRecognitionPost();
  }
);
