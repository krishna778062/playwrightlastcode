import { expect } from '@playwright/test';
import { rewardTestFixture as test } from '@rewards/fixtures/rewardFixture';
import { RewardsStore } from '@rewards/pages/reward-store/reward-store';

import { TestPriority } from '@core/constants/testPriority';
import { TestGroupType } from '@core/constants/testType';
import { tagTest } from '@core/utils/testDecorator';
import { REWARD_SUITE_TAGS } from '@modules/reward/constants/testTags';
import { ManageRewardsPage } from '@modules/reward/pages/manage-rewards/manage-rewards-page';
import { RewardOptionsPage } from '@modules/reward/pages/manage-rewards/reward-options-page';

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
      const manageRewardsPage = new ManageRewardsPage(appManagerPage);
      await manageRewardsPage.loadPage();
      await manageRewardsPage.verifyThePageIsLoaded();
      const rewardOptionsIsVisible = await manageRewardsPage.fetchKeyValueFromHarnessResponse('reward_options');
      expect(rewardOptionsIsVisible).toBeTruthy();
      const rewardOptionsPage = new RewardOptionsPage(appManagerPage);
      await rewardOptionsPage.validateVisibilityOfRewardOptionsLink(true);
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
      const manageRewardsPage = new ManageRewardsPage(recoManagerPage);
      await manageRewardsPage.loadPage();
      await manageRewardsPage.verifyThePageIsLoaded();
      const rewardOptionsIsVisible = await manageRewardsPage.fetchKeyValueFromHarnessResponse('reward_options');
      expect(rewardOptionsIsVisible).toBeTruthy();
      const rewardOptionsPage = new RewardOptionsPage(recoManagerPage);
      await rewardOptionsPage.validateVisibilityOfRewardOptionsLink(true);
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
      const rewardIsEnabled = await manageRewardsPage.hasManageRecognitionPermission();
      expect(rewardIsEnabled).toBeFalsy();
      await manageRewardsPage.loadPage();
      await manageRewardsPage.verifyPageIsNotFound();
    }
  );

  test.only(
    'Validate search box on rewards option page',
    {
      tag: [REWARD_SUITE_TAGS.REGRESSION_TEST, TestPriority.P0, TestGroupType.SMOKE],
    },
    async ({ recoManagerPage }) => {
      tagTest(test.info(), {
        description: 'Validate search box on rewards option page',
        zephyrTestId: 'RC-5386',
        storyId: 'RC-5251',
      });
      const rewardOptionsPage = new RewardOptionsPage(recoManagerPage);

      await rewardOptionsPage.loadPage();
      await rewardOptionsPage.performSearchAndValidate('Amazon', true);
      await rewardOptionsPage.performSearchAndValidate('UnableToFindThisReward', false);
      await rewardOptionsPage.performSearchAndValidate('Appl', true);
      await rewardOptionsPage.performSearchAndValidate('#$%^&*()_+', false);
      await rewardOptionsPage.performSearchAndValidate(' Apple ', true);
      await rewardOptionsPage.performSearchAndValidate('Amazon', true);
      await rewardOptionsPage.checkTheCopiedURLOfSearchResultInNewTab('Amazon', true);
    }
  );

  const giftCards = [
    { country: 'Turkey', name: 'A101 Turkey', visibility: 'Active' },
    { country: 'Turkey', name: 'A101 Turkey', visibility: 'Inactive' },
  ];
  for (const giftCard of giftCards) {
    test(
      `Gift card should ${giftCard.visibility === 'Active' ? 'be visible' : 'not be visible'} when set to ${giftCard.visibility}`,
      { tag: [REWARD_SUITE_TAGS.REGRESSION_TEST, TestPriority.P0, TestGroupType.SMOKE] },
      async ({ recoManagerPage }) => {
        tagTest(test.info(), {
          description: `RC-5565, RC-5376 - Gift card should ${giftCard.visibility === 'Active' ? 'be visible' : 'not be visible'} when set to ${giftCard.visibility}`,
          zephyrTestId: giftCard.visibility === 'Active' ? 'RC-5565' : 'RC-5376',
          storyId: 'RC-5251',
        });
        const manageRewardsPage = new ManageRewardsPage(recoManagerPage);
        const rewardOptionsPage = new RewardOptionsPage(recoManagerPage);
        const rewardsStorePage = new RewardsStore(recoManagerPage);

        await manageRewardsPage.loadPage();
        await manageRewardsPage.verifyThePageIsLoaded();
        expect(await manageRewardsPage.fetchKeyValueFromHarnessResponse('reward_options')).toBeTruthy();

        await rewardOptionsPage.setGiftCardState(
          rewardOptionsPage,
          giftCard.name,
          giftCard.visibility as 'Active' | 'Inactive'
        );

        await rewardsStorePage.loadPage();
        await rewardsStorePage.selectCountry(giftCard.country);
        await rewardsStorePage.searchForGiftCard(giftCard.name);
        await rewardsStorePage.verifyGiftCardVisibility(giftCard.name, giftCard.visibility as 'Active' | 'Inactive');
      }
    );
  }
});
