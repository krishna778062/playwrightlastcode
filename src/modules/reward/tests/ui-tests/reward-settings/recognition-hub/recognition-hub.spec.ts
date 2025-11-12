import { getRewardTenantConfigFromCache } from '@rewards/config/rewardConfig';
import { REWARD_FEATURE_TAGS } from '@rewards/constants/testTags';
import { rewardTestFixture as test } from '@rewards/fixtures/rewardFixture';
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
    const rewardOptionIndex = 3;

    // Visit the Recognition Hub and give one recognition
    const existingOptions = await recognitionHub.visitRecognitionHub();
    if (existingOptions.length < 2) {
      await recognitionHub.setupTheMultipleGiftingOptions();
    }
    await recognitionHub.clickOnGiveRecognition();
    const giveRecognitionModal = new GiveRecognitionDialogBox(appManagerFixture.page);
    const rewardOptionText = await giveRecognitionModal.recognizePeerRecognitionWithRewardPoints(
      0,
      getRewardTenantConfigFromCache().recognitionManagerName,
      'Test Message' + Math.floor(Math.random() * 1000),
      rewardOptionIndex
    );

    // Validate the Peer award outer ring, reward point pill, tooltip icon
    await recognitionHub.visitRecognitionHub();
    await recognitionHub.verifyThePageIsLoaded();
    await recognitionHub.validateTheRewardElementsInRecognitionPost(
      true,
      rewardOptionText,
      'Only visible to recipients, their managers and app administrators'
    );

    // Disable the Rewards and Check the points are not visible
    await manageRewardsPage.loadPage();
    await manageRewardsPage.verifyThePageIsLoaded();
    await manageRewardsPage.disableTheRewards();
    await recognitionHub.visitRecognitionHub();
    await recognitionHub.validateTheRewardElementsInRecognitionPost(
      false,
      rewardOptionText,
      'Only visible to recipients, their managers and app administrators'
    );

    // Enable the Rewards again
    await manageRewardsPage.loadPage();
    await manageRewardsPage.verifyThePageIsLoaded();
    await manageRewardsPage.enableTheRewards();
    await recognitionHub.visitRecognitionHub();
    await recognitionHub.validateTheRewardElementsInRecognitionPost(
      true,
      rewardOptionText,
      'Only visible to recipients, their managers and app administrators'
    );
  }
);
