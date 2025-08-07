import { expect } from '@playwright/test';
import { rewardTestFixture as test } from '@rewards/fixtures/rewardFixture';

import { TestPriority } from '@core/constants/testPriority';
import { TestGroupType } from '@core/constants/testType';
import { tagTest } from '@core/utils/testDecorator';
import { REWARD_SUITE_TAGS } from '@modules/reward/constants/testTags';
import { ManageRewardsPage } from '@modules/reward/pages/manage-rewards-page';
import { RewardOptionsPage } from '@modules/reward/pages/reward-options-page';

test.describe('Reward Options', { tag: [REWARD_SUITE_TAGS.REWARD_OPTIONS] }, () => {
  test(
    'A - Verify Reward options only visible to App managers',
    {
      tag: [REWARD_SUITE_TAGS.REGRESSION_TEST, TestPriority.P0, TestGroupType.SMOKE],
    },
    async ({ appManagerPage }) => {
      tagTest(test.info(), {
        description: 'Verify Reward options only visible to App managers',
        zephyrTestId: 'RC-5371',
        storyId: 'RC-5251',
      });
      let rewardOptionsIsVisible: string | null;
      const manageRewardsPage = new ManageRewardsPage(appManagerPage);
      const rewardOptionsPage = new RewardOptionsPage(appManagerPage);

      await test.step('Verify the Rewards options is visible', async () => {
        await manageRewardsPage.visit();
        await manageRewardsPage.verifyThePageIsLoaded();
        rewardOptionsIsVisible = await manageRewardsPage.fetchKeyValueFromHarnessResponse('reward_options');
        expect(rewardOptionsIsVisible).toBeTruthy();
        await rewardOptionsPage.validateVisibilityOfRewardOptionsLink(Boolean(rewardOptionsIsVisible));
      });
    }
  );

  test(
    'B - Verify Reward options only visible to recognition managers',
    {
      tag: [REWARD_SUITE_TAGS.REGRESSION_TEST, TestPriority.P0, TestGroupType.SMOKE],
    },
    async ({ recoManagerPage }) => {
      tagTest(test.info(), {
        description: 'Verify Reward options only visible to recognition managers',
        zephyrTestId: 'RC-5371',
        storyId: 'RC-5251',
      });

      let rewardOptionsIsVisible: string | null;
      const manageRewardsPage = new ManageRewardsPage(recoManagerPage);
      const rewardOptionsPage = new RewardOptionsPage(recoManagerPage);

      await test.step('Verify the Rewards options is visible', async () => {
        await manageRewardsPage.visit();
        await manageRewardsPage.verifyThePageIsLoaded();
        rewardOptionsIsVisible = await manageRewardsPage.fetchKeyValueFromHarnessResponse('reward_options');
        expect(rewardOptionsIsVisible).toBeTruthy();
        await rewardOptionsPage.validateVisibilityOfRewardOptionsLink(Boolean(rewardOptionsIsVisible));
      });
    }
  );

  test(
    'Verify Reward options not visible to user other than recognition managers',
    {
      tag: [REWARD_SUITE_TAGS.REGRESSION_TEST, TestPriority.P0, TestGroupType.SMOKE],
    },
    async ({ standardUserPage }) => {
      tagTest(test.info(), {
        description: 'Verify Reward options not visible to user other than recognition managers',
        zephyrTestId: 'RC-5374',
        storyId: 'RC-5251',
      });
      const manageRewardsPage = new ManageRewardsPage(standardUserPage);

      await test.step('Verify the Rewards options is visible', async () => {
        const rewardIsEnabled = await manageRewardsPage.hasManageRecognitionPermission();
        expect(rewardIsEnabled).toBeFalsy();
        await manageRewardsPage.visit();
        await manageRewardsPage.verifyPageIsNotFound();
      });
    }
  );
});
