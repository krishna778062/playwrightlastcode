import { expect } from '@playwright/test';
import { rewardTestFixture as test } from '@rewards/fixtures/rewardFixture';

import { TestPriority } from '@core/constants/testPriority';
import { TestGroupType } from '@core/constants/testType';
import { tagTest } from '@core/utils/testDecorator';
import { REWARD_SUITE_TAGS } from '@modules/reward/constants/testTags';
import { ManageRewardsPage } from '@modules/reward/pages/manage-rewards/manage-rewards-page';
import { RewardOptionsPage } from '@modules/reward/pages/manage-rewards/reward-options-page';
import { RewardsStore } from '@modules/reward/pages/reward-store/reward-store';

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

  const scenarios = [
    {
      zephyrTestId: 'RC-5565',
      description: 'Verify gifting card is invisible on reward store page when it is in inactive status',
      giftCardDetails: { country: 'Turkey', name: 'A101 Turkey' },
      toggleStates: ['Inactive'],
    },
    {
      zephyrTestId: 'RC-5376',
      description: 'Verify gifting card is visible on reward store page when it is in active status',
      giftCardDetails: { country: 'Turkey', name: 'A101 Turkey' },
      toggleStates: ['Active'], // only check active scenario
    },
  ];

  for (const { zephyrTestId, description, giftCardDetails, toggleStates } of scenarios) {
    test(
      description,
      {
        tag: [REWARD_SUITE_TAGS.REGRESSION_TEST, TestPriority.P0, TestGroupType.SMOKE],
      },
      async ({ recoManagerPage }) => {
        tagTest(test.info(), {
          description,
          zephyrTestId,
          storyId: 'RC-5251',
        });

        const manageRewardsPage = new ManageRewardsPage(recoManagerPage);
        const rewardOptionsPage = new RewardOptionsPage(recoManagerPage);

        await manageRewardsPage.visit();
        await manageRewardsPage.verifyThePageIsLoaded();
        const rewardOptionsIsVisible = await manageRewardsPage.fetchKeyValueFromHarnessResponse('reward_options');
        expect(rewardOptionsIsVisible).toBeTruthy();
        await rewardOptionsPage.visit();

        if (toggleStates.includes('Inactive')) {
          await test.step(`Set the ${giftCardDetails.name} gift card as Inactive for ${giftCardDetails.country} country`, async () => {
            await rewardOptionsPage.setGiftCardState(rewardOptionsPage, giftCardDetails.name, 'Inactive');
          });

          await test.step(`Verify the ${giftCardDetails.name} gift card is not visible for ${giftCardDetails.country} country in Reward Store`, async () => {
            const rewardStore = new RewardsStore(rewardOptionsPage.page);
            await rewardStore.visit();
            await rewardStore.selectCountry(giftCardDetails.country);
            await rewardStore.searchForGiftCard(giftCardDetails.name);
            await expect(rewardStore.noRewardsFoundHeading).toBeVisible();
            await expect(rewardStore.noRewardsFoundText).toBeVisible();
          });
        }

        if (toggleStates.includes('Active')) {
          await test.step(`Set the ${giftCardDetails.name} gift card as Active for ${giftCardDetails.country} country`, async () => {
            await rewardOptionsPage.setGiftCardState(rewardOptionsPage, giftCardDetails.name, 'Active');
          });

          await test.step(`Verify the ${giftCardDetails.name} gift card is visible for ${giftCardDetails.country} country in Reward Store`, async () => {
            const rewardStore = new RewardsStore(rewardOptionsPage.page);
            await rewardStore.visit();
            await rewardStore.selectCountry(giftCardDetails.country);
            await rewardStore.searchForGiftCard(giftCardDetails.name);
            await expect(rewardStore.giftCardNames.first()).toBeVisible();
            await expect(rewardStore.giftCardNames.first()).toHaveText(giftCardDetails.name);
          });
        }
      }
    );
  }
});
