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
      const rewardOptionsPage = new RewardOptionsPage(appManagerPage);
      await manageRewardsPage.visit();
      await manageRewardsPage.verifyThePageIsLoaded();
      const rewardOptionsIsVisible = await manageRewardsPage.fetchKeyValueFromHarnessResponse('reward_options');
      expect(rewardOptionsIsVisible).toBeTruthy();
      await rewardOptionsPage.validateVisibilityOfRewardOptionsLink(Boolean(rewardOptionsIsVisible));
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
      const rewardOptionsPage = new RewardOptionsPage(recoManagerPage);
      await manageRewardsPage.visit();
      await manageRewardsPage.verifyThePageIsLoaded();
      const rewardOptionsIsVisible = await manageRewardsPage.fetchKeyValueFromHarnessResponse('reward_options');
      expect(rewardOptionsIsVisible).toBeTruthy();
      await rewardOptionsPage.validateVisibilityOfRewardOptionsLink(Boolean(rewardOptionsIsVisible));
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
      await manageRewardsPage.visit();
      await manageRewardsPage.verifyPageIsNotFound();
    }
  );

  test(
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
      const manageRewardsPage = new ManageRewardsPage(recoManagerPage);
      const rewardOptionsPage = new RewardOptionsPage(recoManagerPage);
      await manageRewardsPage.visit();
      await manageRewardsPage.verifyThePageIsLoaded();
      const rewardOptionsIsVisible = await manageRewardsPage.fetchKeyValueFromHarnessResponse('reward_options');
      expect(rewardOptionsIsVisible).toBeTruthy();
      await rewardOptionsPage.visit();
      await rewardOptionsPage.performSearchAndValidate('Amazon', true);
      await rewardOptionsPage.performSearchAndValidate('UnableToFindThisReward', false);
      await rewardOptionsPage.performSearchAndValidate('Appl', true);
      await rewardOptionsPage.performSearchAndValidate('#$%^&*()_+', false);
      await rewardOptionsPage.performSearchAndValidate(' Apple ', true);
      await rewardOptionsPage.performSearchAndValidate('Amazon', true);
      await rewardOptionsPage.checkTheCopiedURLOfSearchResultInNewTab('Amazon', true);
    }
  );

  const giftCards = [{ country: 'Turkey', name: 'A101 Turkey' }];
  for (const giftCard of giftCards) {
    test.describe(`Gift Card Visibility Tests for ${giftCard.name}`, () => {
      test(
        'RC-5565 - Gift card should NOT be visible when set to Inactive',
        { tag: [REWARD_SUITE_TAGS.REGRESSION_TEST, TestPriority.P0, TestGroupType.SMOKE] },
        async ({ recoManagerPage }) => {
          const manageRewardsPage = new ManageRewardsPage(recoManagerPage);
          const rewardOptionsPage = new RewardOptionsPage(recoManagerPage);
          const rewardsStorePage = new RewardsStore(recoManagerPage);

          await manageRewardsPage.visit();
          await manageRewardsPage.verifyThePageIsLoaded();
          expect(await manageRewardsPage.fetchKeyValueFromHarnessResponse('reward_options')).toBeTruthy();

          await rewardOptionsPage.setGiftCardState(rewardOptionsPage, giftCard.name, 'Inactive');

          await rewardsStorePage.visit();
          await rewardsStorePage.selectCountry(giftCard.country);
          await rewardsStorePage.searchForGiftCard(giftCard.name);
          await rewardsStorePage.verifyGiftCardNotVisible();
        }
      );

      test(
        'RC-5376 - Gift card SHOULD be visible when set to Active',
        { tag: [REWARD_SUITE_TAGS.REGRESSION_TEST, TestPriority.P0, TestGroupType.SMOKE] },
        async ({ recoManagerPage }) => {
          const manageRewardsPage = new ManageRewardsPage(recoManagerPage);
          const rewardOptionsPage = new RewardOptionsPage(recoManagerPage);
          const rewardsStorePage = new RewardsStore(recoManagerPage);

          await manageRewardsPage.visit();
          await manageRewardsPage.verifyThePageIsLoaded();
          expect(await manageRewardsPage.fetchKeyValueFromHarnessResponse('reward_options')).toBeTruthy();

          await rewardOptionsPage.visit();
          await rewardOptionsPage.setGiftCardState(rewardOptionsPage, giftCard.name, 'Active');

          await rewardsStorePage.visit();
          await rewardsStorePage.selectCountry(giftCard.country);
          await rewardsStorePage.searchForGiftCard(giftCard.name);
          await rewardsStorePage.verifyGiftCardVisible(giftCard.name);
        }
      );
    });
  }
});
