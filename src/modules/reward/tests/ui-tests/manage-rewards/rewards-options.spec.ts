import { expect } from '@playwright/test';
import { REWARD_FEATURE_TAGS, REWARD_SUITE_TAGS } from '@rewards/constants/testTags';
import { rewardTestFixture as test } from '@rewards/fixtures/rewardFixture';
import { ManageRewardsOverviewPage } from '@rewards/pages/manage-rewards/manage-rewards-overview-page';
import { RewardOptionsPage } from '@rewards/pages/manage-rewards/reward-options-page';
import { RewardsStore } from '@rewards/pages/reward-store/reward-store';

import { TestGroupType, TestPriority } from '@core/constants';
import { tagTest } from '@core/utils';

test.describe('reward Options', { tag: [REWARD_SUITE_TAGS.MANAGE_REWARD] }, () => {
  test(
    'a - Verify Reward options only visible to App managers',
    {
      tag: [REWARD_FEATURE_TAGS.REWARD_OPTIONS, TestPriority.P0, TestGroupType.SMOKE, TestGroupType.REGRESSION],
    },
    async ({ appManagerFixture }) => {
      tagTest(test.info(), {
        description: 'Verify Reward options only visible to App managers',
        zephyrTestId: 'RC-5371',
        storyId: 'RC-5251',
      });
      const manageRewardsPage = new ManageRewardsOverviewPage(appManagerFixture.page);
      await manageRewardsPage.loadPageWithHarness();
      await manageRewardsPage.verifyThePageIsLoaded();
      const rewardOptionsIsVisible = await manageRewardsPage.fetchKeyValueFromHarnessResponse('reward_options');
      expect(rewardOptionsIsVisible).toBeTruthy();
      const rewardOptionsPage = new RewardOptionsPage(appManagerFixture.page);
      await rewardOptionsPage.validateVisibilityOfRewardOptionsLink(true);
    }
  );

  test(
    'b - Verify Reward options only visible to recognition managers',
    {
      tag: [REWARD_FEATURE_TAGS.REWARD_OPTIONS, TestGroupType.REGRESSION, TestPriority.P0, TestGroupType.SMOKE],
    },
    async ({ recoManagerFixture }) => {
      tagTest(test.info(), {
        description: 'Verify Reward options only visible to recognition managers',
        zephyrTestId: 'RC-5371',
        storyId: 'RC-5251',
      });
      const manageRewardsPage = new ManageRewardsOverviewPage(recoManagerFixture.page);
      await manageRewardsPage.loadPageWithHarness();
      await manageRewardsPage.verifyThePageIsLoaded();
      const rewardOptionsIsVisible = await manageRewardsPage.fetchKeyValueFromHarnessResponse('reward_options');
      expect(rewardOptionsIsVisible).toBeTruthy();
      const rewardOptionsPage = new RewardOptionsPage(recoManagerFixture.page);
      await rewardOptionsPage.validateVisibilityOfRewardOptionsLink(true);
    }
  );

  test(
    'verify Reward options not visible to user other than recognition managers',
    {
      tag: [REWARD_FEATURE_TAGS.REWARD_OPTIONS, TestGroupType.REGRESSION, TestPriority.P0, TestGroupType.SMOKE],
    },
    async ({ standardUserFixture }) => {
      tagTest(test.info(), {
        description: 'Verify Reward options not visible to user other than recognition managers',
        zephyrTestId: 'RC-5374',
        storyId: 'RC-5251',
      });
      const manageRewardsPage = new ManageRewardsOverviewPage(standardUserFixture.page);
      const rewardIsEnabled = await manageRewardsPage.hasManageRecognitionPermission();
      await manageRewardsPage.loadPageWithHarness();
      expect(rewardIsEnabled).toBeFalsy();
      await manageRewardsPage.verifyPageIsNotFound();
    }
  );

  test(
    'validate search box on rewards option page',
    {
      tag: [REWARD_FEATURE_TAGS.REWARD_OPTIONS, TestGroupType.REGRESSION, TestPriority.P0, TestGroupType.SMOKE],
    },
    async ({ recoManagerFixture }) => {
      tagTest(test.info(), {
        description: 'Validate search box on rewards option page',
        zephyrTestId: 'RC-5386',
        storyId: 'RC-5251',
      });
      const rewardOptionsPage = new RewardOptionsPage(recoManagerFixture.page);

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
      { tag: [REWARD_FEATURE_TAGS.REWARD_OPTIONS, TestGroupType.REGRESSION, TestPriority.P0, TestGroupType.SMOKE] },
      async ({ recoManagerFixture }) => {
        tagTest(test.info(), {
          description: `RC-5565, RC-5376 - Gift card should ${giftCard.visibility === 'Active' ? 'be visible' : 'not be visible'} when set to ${giftCard.visibility}`,
          zephyrTestId: giftCard.visibility === 'Active' ? 'RC-5565' : 'RC-5376',
          storyId: 'RC-5251',
        });
        const manageRewardsPage = new ManageRewardsOverviewPage(recoManagerFixture.page);
        const rewardOptionsPage = new RewardOptionsPage(recoManagerFixture.page);
        const rewardsStorePage = new RewardsStore(recoManagerFixture.page);

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
