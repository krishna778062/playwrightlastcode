import { expect } from '@playwright/test';
import { REWARD_FEATURE_TAGS, REWARD_SUITE_TAGS } from '@rewards/constants/testTags';
import { rewardTestFixture as test } from '@rewards/fixtures/rewardFixture';
import { ManageRewardsOverviewPage } from '@rewards-pages/manage-rewards/manage-rewards-overview-page';
import { RecognitionHubPage } from '@rewards-pages/recognition-hub/recognition-hub-page';

import { tagTest, TestGroupType, TestPriority, TIMEOUTS } from '@/src/core';

test.describe('single Gifting options', { tag: [REWARD_SUITE_TAGS.RECOGNITION_HUB] }, () => {
  test.beforeEach(async ({ appManagerFixture }) => {
    const recognitionHub = new RecognitionHubPage(appManagerFixture.page);
    await recognitionHub.enableTheRewardsAndPeerGiftingForHubIfDisabled();
  });

  test(
    'RC-2837 Verify for single gifting option and multiple recipients',
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
      await recognitionHub.verifier.verifyTheElementIsVisible(recognitionHub.pointsToGive, {
        timeout: TIMEOUTS.MEDIUM,
        assertionMessage: 'Points to give value is visible on UI',
      });
      const availablePoints = (await recognitionHub.pointsToGive.textContent()) || '0';
      const rewardOption = await recognitionHub.setupTheSingleGiftingOptions(availablePoints);
      await recognitionHub.navigateToRecognitionHub();
      await recognitionHub.mockTheWalletPoints(Number(rewardOption) * (userCount - 1), 100, 1000);
      await recognitionHub.verifyThePageIsLoaded();
      await recognitionHub.clickOnGiveRecognition();
      await recognitionHub.enableTheGiftingOption(true);
      await recognitionHub.selectUsersInTheAwardee(userCount);
      await recognitionHub.validatedTheInsufficientPointError(recognitionHub, rewardOption, userCount);
    }
  );

  test(
    'RC-2720 Validate single gifting option/value',
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
      await recognitionHub.navigateToRecognitionHub();
      await recognitionHub.verifier.verifyTheElementIsVisible(recognitionHub.pointsToGive, {
        timeout: TIMEOUTS.MEDIUM,
        assertionMessage: 'Points to give value is visible on UI',
      });
      const availablePoints = (await recognitionHub.pointsToGive.textContent()) || '0';
      const rewardOption = await recognitionHub.setupTheSingleGiftingOptions(availablePoints);
      await recognitionHub.navigateToRecognitionHub();
      await recognitionHub.clickOnGiveRecognition();

      // Select one user and enable the Gifting option toggle
      await recognitionHub.selectUsersInTheAwardee(1);
      await recognitionHub.enableTheGiftingOption(true);
      const textOfRecognitionButton = await recognitionHub.recognitionButtonText();
      const insufficientErrorMessage = await recognitionHub.insufficientPointErrorMessageIsDisplaying();
      expect(textOfRecognitionButton).toContain(`Recognize & gift ${Number(rewardOption).toLocaleString()} point`);
      expect(insufficientErrorMessage).toBe(false);

      // Select more user and check the Recognize button is disabled
      await recognitionHub.mockTheWalletPoints(Number(rewardOption) * (userCount - 1), 100, 1000);
      await recognitionHub.verifyThePageIsLoaded();
      await recognitionHub.clickOnGiveRecognition();
      await recognitionHub.enableTheGiftingOption(true);
      await recognitionHub.selectUsersInTheAwardee(userCount);
      const textOfRecognitionButtonMultiple = await recognitionHub.recognitionButtonText();
      const insufficientErrorMessageMultiple = await recognitionHub.insufficientPointErrorMessageIsDisplaying();
      expect(textOfRecognitionButtonMultiple).toContain(
        `Recognize & gift ${(Number(rewardOption) * userCount).toLocaleString()} point`
      );
      expect(insufficientErrorMessageMultiple).toBe(true);
    }
  );

  test(
    'RC-3099 Validate rewards points are not shown on posts when rewards is disabled.',
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
      const rewardOptionIndex = 3;
      const existingOptions = await recognitionHub.visitRecognitionHub();
      await recognitionHub.verifyThePageIsLoaded();
      if (existingOptions.length <= 1) {
        await recognitionHub.setupTheMultipleGiftingOptions();
      }
      await recognitionHub.navigateToRecognitionHub();
      const recognitionPostId = await recognitionHub.giveRecognitionAndGetRecognitionId(0, 0, rewardOptionIndex);

      // Disable the Rewards and Check the points are not visible
      await manageRewardsPage.loadPage();
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
});
