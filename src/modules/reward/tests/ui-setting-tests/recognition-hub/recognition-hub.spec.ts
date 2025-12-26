import { REWARD_FEATURE_TAGS } from '@rewards/constants/testTags';
import { rewardTestFixture as test } from '@rewards/fixtures/rewardFixture';
import { ManageRewardsOverviewPage } from '@rewards-pages/manage-rewards/manage-rewards-overview-page';
import { RecognitionHubPage } from '@rewards-pages/recognition-hub/recognition-hub-page';

import { tagTest, TestGroupType, TestPriority } from '@/src/core';

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
    await recognitionHub.enableTheRewardsAndPeerGiftingForHubIfDisabled();
    const rewardOptionIndex = 3;
    await recognitionHub.setupTheMultipleGiftingOptions();
    await recognitionHub.navigateToRecognitionHub();
    const recognitionPostId = await recognitionHub.giveRecognitionAndGetRecognitionId(0, 0, rewardOptionIndex);

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
