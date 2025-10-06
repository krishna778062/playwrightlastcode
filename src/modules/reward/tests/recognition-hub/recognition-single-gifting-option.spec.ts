import { expect } from '@playwright/test';
import { rewardTestFixture as test } from '@rewards/fixtures/rewardFixture';

import { TestPriority } from '@core/constants/testPriority';
import { tagTest } from '@core/utils/testDecorator';
import { REWARD_SUITE_TAGS } from '@modules/reward/constants/testTags';
import { RewardGiftingOptionsPage } from '@modules/reward/pages/manage-rewards/reward-gifting-options-page';
import { RecognitionHubPage } from '@modules/reward/pages/recognition-hub/recognition-hub-page';
import { RewardsStore } from '@modules/reward/pages/reward-store/reward-store';

test.describe('Single Gifting options', { tag: [REWARD_SUITE_TAGS.MANAGE_REWARD] }, () => {
  test.beforeEach(async ({ appManagerPage }) => {
    const recognitionHub = new RecognitionHubPage(appManagerPage);
    await recognitionHub.enableTheRewardStoreAndPeerGiftingIfDisabled();
  });

  test(
    '[RC-2837] Verify for single gifting option and multiple recipients',
    {
      tag: [REWARD_SUITE_TAGS.REGRESSION_TEST, TestPriority.P1],
    },
    async ({ appManagerPage }) => {
      tagTest(test.info(), {
        description: 'Verify for single gifting option and multiple recipients',
        zephyrTestId: 'RC-2837',
        storyId: 'RC-2837',
      });

      const recognitionHub = new RecognitionHubPage(appManagerPage);
      const rewardGiftingOptions = new RewardGiftingOptionsPage(appManagerPage);
      const rewardsStore = new RewardsStore(appManagerPage);
      const userCount = 3;

      // Navigate to Recognition Hub and Click on Give recognition Modal
      await recognitionHub.visitRecognitionHub();
      await recognitionHub.pointsToGive.waitFor({ state: 'attached' });
      const availablePoints = (await recognitionHub.pointsToGive.textContent()) || '0';

      // Set the Single Reward Option
      await rewardGiftingOptions.loadPage();
      await rewardGiftingOptions.verifier.waitUntilPageHasNavigatedTo(
        '/manage/recognition/rewards/peer-gifting/options'
      );
      const existingValue = await rewardGiftingOptions.getTheExistingValueInGiftingOptions();
      const rewardOption =
        Math.floor(Math.random() * (Number(availablePoints.replace(',', '')) - 1 - Number(existingValue))) + 1;

      // Enter value and set the Gifting options
      await rewardGiftingOptions.enterTheAmountAndValidateNoError(String(rewardOption));
      await rewardGiftingOptions.clickOnSaveButton();
      await rewardGiftingOptions.verifyToastMessageIsVisibleWithText('Saved changes successfully');

      // Select more user and check the Recognize button is disabled
      await rewardsStore.mockTheAvailablePoints(Number(rewardOption) * (userCount - 1));
      await recognitionHub.visitRecognitionHub();
      await recognitionHub.pointsToGive.waitFor({ state: 'attached' });
      await recognitionHub.clickOnGiveRecognition();
      await recognitionHub.enableTheGiftingOption(true);
      await recognitionHub.selectUsersInTheAwardee(userCount);
      const textOfRecognitionButton = await recognitionHub.recognitionButtonText();
      const insufficientErrorMessage = await recognitionHub.insufficientPointErrorMessageIsDisplaying();
      const insufficientPointsWithRecipients = await recognitionHub.insufficientPointWithRecipientsErrorMessage();
      expect(textOfRecognitionButton).toContain(
        `Recognize & gift ${(Number(rewardOption) * userCount).toLocaleString()} points`
      );
      expect(insufficientPointsWithRecipients).toContain(
        `${userCount} recipients = ${(Number(rewardOption) * userCount).toLocaleString()} points`
      );
      expect(insufficientErrorMessage).toBe(true);
    }
  );

  test(
    '[RC-2720] Validate single gifting option/value',
    {
      tag: [REWARD_SUITE_TAGS.REGRESSION_TEST, TestPriority.P1],
    },
    async ({ appManagerPage }) => {
      tagTest(test.info(), {
        description: 'Validate single gifting option/value',
        zephyrTestId: 'RC-2720',
        storyId: 'RC-2720',
      });

      const recognitionHub = new RecognitionHubPage(appManagerPage);
      const rewardGiftingOptions = new RewardGiftingOptionsPage(appManagerPage);
      const rewardsStore = new RewardsStore(appManagerPage);
      const userCount = 3;

      // Navigate to Recognition Hub and Click on Give recognition Modal
      await recognitionHub.visitRecognitionHub();
      await recognitionHub.pointsToGive.waitFor({ state: 'attached' });
      const availablePoints = (await recognitionHub.pointsToGive.textContent()) || '0';

      // Set the Single Reward Option
      await rewardGiftingOptions.loadPage();
      await rewardGiftingOptions.verifier.waitUntilPageHasNavigatedTo(
        '/manage/recognition/rewards/peer-gifting/options'
      );
      const existingValue = await rewardGiftingOptions.getTheExistingValueInGiftingOptions();
      const rewardOption =
        Math.floor(Math.random() * (Number(availablePoints.replace(',', '')) - 1 - Number(existingValue))) + 1;

      // Enter value and set the Gifting options
      await rewardGiftingOptions.enterTheAmountAndValidateNoError(String(rewardOption));
      await rewardGiftingOptions.clickOnSaveButton();
      await rewardGiftingOptions.verifyToastMessageIsVisibleWithText('Saved changes successfully');

      // Navigate to Recognition Hub and Click on Give recognition Modal
      await recognitionHub.visitRecognitionHub();
      await recognitionHub.clickOnGiveRecognition();

      // Select one user and enable the Gifting option toggle
      await recognitionHub.selectUsersInTheAwardee(1);
      await recognitionHub.enableTheGiftingOption(true);
      const textOfRecognitionButton = await recognitionHub.recognitionButtonText();
      const insufficientErrorMessage = await recognitionHub.insufficientPointErrorMessageIsDisplaying();
      expect(textOfRecognitionButton).toContain(`Recognize & gift ${Number(rewardOption).toLocaleString()} points`);
      expect(insufficientErrorMessage).toBe(false);

      // Select more user and check the Recognize button is disabled
      await rewardsStore.mockTheAvailablePoints(Number(rewardOption) * (userCount - 1));
      await recognitionHub.clickOnGiveRecognition();
      await recognitionHub.enableTheGiftingOption(true);
      await recognitionHub.selectUsersInTheAwardee(userCount);
      const textOfRecognitionButtonMultiple = await recognitionHub.recognitionButtonText();
      const insufficientErrorMessageMultiple = await recognitionHub.insufficientPointErrorMessageIsDisplaying();
      expect(textOfRecognitionButtonMultiple).toContain(
        `Recognize & gift ${(Number(rewardOption) * userCount).toLocaleString()} points`
      );
      expect(insufficientErrorMessageMultiple).toBe(true);
    }
  );
});
