import { expect } from '@playwright/test';
import { REWARD_FEATURE_TAGS, REWARD_SUITE_TAGS } from '@rewards/constants/testTags';
import { rewardTestFixture as test } from '@rewards/fixtures/rewardFixture';
import { RecognitionHubPage } from '@rewards-pages/recognition-hub/recognition-hub-page';

import { TestPriority } from '@core/constants/testPriority';
import { TestGroupType } from '@core/constants/testType';
import { tagTest } from '@core/utils/testDecorator';

test.describe('single Gifting options', { tag: [REWARD_SUITE_TAGS.RECOGNITION_HUB] }, () => {
  test.beforeEach(async ({ appManagerFixture }) => {
    const recognitionHub = new RecognitionHubPage(appManagerFixture.page);
    await recognitionHub.enableTheRewardsAndPeerGiftingForHubIfDisabled();
  });

  test(
    '[RC-2837] Verify for single gifting option and multiple recipients',
    {
      tag: [
        REWARD_FEATURE_TAGS.CREATE_RECOGNITION_WITH_POINTS,
        TestGroupType.REGRESSION,
        TestPriority.P0,
        TestGroupType.SMOKE,
      ],
    },
    async ({ appManagerFixture }) => {
      tagTest(test.info(), {
        description: 'Verify for single gifting option and multiple recipients',
        zephyrTestId: 'RC-2837',
        storyId: 'RC-2837',
      });

      const recognitionHub = new RecognitionHubPage(appManagerFixture.page);
      const userCount = 3;
      await recognitionHub.visitRecognitionHub();
      await recognitionHub.verifyThePageIsLoaded();
      await recognitionHub.verifier.verifyTheElementIsVisible(recognitionHub.pointsToGive);
      const availablePoints = (await recognitionHub.pointsToGive.textContent()) || '0';
      const rewardOption = await recognitionHub.setupTheSingleGiftingOptions(availablePoints);
      await recognitionHub.visitRecognitionHub();
      await recognitionHub.verifier.verifyTheElementIsVisible(recognitionHub.rewardRecognitionFirstPost);
      await recognitionHub.mockTheWalletPoints(Number(rewardOption) * (userCount - 1), 100, 1000);
      await recognitionHub.verifier.verifyTheElementIsVisible(recognitionHub.rewardRecognitionFirstPost);
      await recognitionHub.clickOnGiveRecognition();
      await recognitionHub.enableTheGiftingOption(true);
      await recognitionHub.selectUsersInTheAwardee(userCount);
      await recognitionHub.validatedTheInsufficientPointError(recognitionHub, rewardOption, userCount);
    }
  );

  test(
    '[RC-2720] Validate single gifting option/value',
    {
      tag: [
        REWARD_FEATURE_TAGS.CREATE_RECOGNITION_WITH_POINTS,
        TestGroupType.REGRESSION,
        TestPriority.P0,
        TestGroupType.SMOKE,
      ],
    },
    async ({ appManagerFixture }) => {
      tagTest(test.info(), {
        description: 'Validate single gifting option/value',
        zephyrTestId: 'RC-2720',
        storyId: 'RC-2720',
      });
      tagTest(test.info(), {
        description: "Validate peer gifting points selection for the 'give recognition' modal.",
        zephyrTestId: 'RC-2719',
        storyId: 'RC-2719',
      });
      const recognitionHub = new RecognitionHubPage(appManagerFixture.page);
      const userCount = 3;
      await recognitionHub.visitRecognitionHub();
      await recognitionHub.verifyThePageIsLoaded();
      await recognitionHub.verifier.verifyTheElementIsVisible(recognitionHub.pointsToGive);
      const availablePoints = (await recognitionHub.pointsToGive.textContent()) || '0';
      const rewardOption = await recognitionHub.setupTheSingleGiftingOptions(availablePoints);
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
      await recognitionHub.mockTheWalletPoints(Number(rewardOption) * (userCount - 1), 100, 1000);
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
