import { expect } from '@playwright/test';
import { REWARD_FEATURE_TAGS } from '@rewards/constants/testTags';
import { rewardTestFixture as test } from '@rewards/fixtures/rewardFixture';
import { ManageRewardsOverviewPage } from '@rewards-pages/manage-rewards/manage-rewards-overview-page';
import { RewardGiftingOptionsPage } from '@rewards-pages/manage-rewards/reward-gifting-options-page';

import { tagTest, TestGroupType, TestPriority } from '@/src/core';

test.describe('gifting options page exchange rate validation', () => {
  test(
    '[RC-4180] Validate exchange rate option on Gifting option page when FF is enabled',
    {
      tag: [TestGroupType.REGRESSION, REWARD_FEATURE_TAGS.REWARDS_GIFTING_OPTIONS, TestPriority.P0],
    },
    async ({ appManagerFixture }) => {
      tagTest(test.info(), {
        description: 'Validate exchange rate option on Gifting option page when FF is enabled',
        zephyrTestId: 'RC-4180',
        storyId: 'RC-4180',
      });

      const manageRewardsPage = new ManageRewardsOverviewPage(appManagerFixture.page);
      const rewardGiftingOptionsPage = new RewardGiftingOptionsPage(appManagerFixture.page);
      await manageRewardsPage.enableTheRewardsAndPeerGiftingIfDisabled();
      await manageRewardsPage.loadPage();
      await manageRewardsPage.verifyThePageIsLoaded();
      await expect(manageRewardsPage.page).toHaveURL('/manage/recognition/rewards/overview');
      await manageRewardsPage.verifyThePageIsLoaded();

      // Disable rewards if needed
      const isDisableRewardButtonDisplayed = await manageRewardsPage.verifier.isTheElementVisible(
        manageRewardsPage.disableRewardLink,
        { timeout: 15000 }
      );
      if (isDisableRewardButtonDisplayed) {
        await manageRewardsPage.disableTheRewards();
      } else {
        console.log('Rewards are already disabled, skipping disable action.');
      }

      // Enable feature flag and navigate to gifting options
      await rewardGiftingOptionsPage.setTheHarnessValue('point_to_usd_conversion', true);
      await rewardGiftingOptionsPage.loadPage();
      await rewardGiftingOptionsPage.verifyThePageIsLoaded();
      await expect(manageRewardsPage.page).toHaveURL('/manage/recognition/rewards/peer-gifting/options');

      // Validate exchange rate dropdown options
      await rewardGiftingOptionsPage.exchangeRateSelectDropdown.waitFor({
        state: 'visible',
        timeout: 30000,
      });
      const expectedOptions = [
        'Select Exchange Rate',
        '10 points = 1 USD (recommended)',
        '20 points = 1 USD',
        '25 points = 1 USD',
        '50 points = 1 USD',
        '100 points = 1 USD',
        '1 point = 1 USD (not recommended for international organizations)',
      ];
      const actualOptions = await rewardGiftingOptionsPage.exchangeRateSelectDropdown
        .locator('option')
        .allTextContents();
      expect(actualOptions).toEqual(expectedOptions);

      // Select random exchange rate option
      await rewardGiftingOptionsPage.exchangeRateSelectDropdown.waitFor({ state: 'visible' });
      const selectedValue = await rewardGiftingOptionsPage.exchangeRateSelectDropdown.evaluate(
        (select: HTMLSelectElement) => select.value
      );
      const options = rewardGiftingOptionsPage.exchangeRateSelectDropdown.locator('option');
      const count = await options.count();
      const availableValues: string[] = [];
      for (let i = 0; i < count; i++) {
        const value = await options.nth(i).getAttribute('value');
        if (value && value !== selectedValue) {
          availableValues.push(value);
        }
      }
      const randomIndex = Math.floor(Math.random() * availableValues.length);
      const newValue = availableValues[randomIndex];
      await rewardGiftingOptionsPage.exchangeRateSelectDropdown.selectOption(newValue);
      await rewardGiftingOptionsPage.clickOnSaveButton();
      await manageRewardsPage.verifyToastMessageIsVisibleWithText('Saved changes successfully');

      // Disable feature flag and verify dropdown is hidden
      await rewardGiftingOptionsPage.setTheHarnessValue('point_to_usd_conversion', false);
      await rewardGiftingOptionsPage.loadPage();
      await expect(manageRewardsPage.page).toHaveURL('/manage/recognition/rewards/peer-gifting/options');
      await expect(rewardGiftingOptionsPage.exchangeRateSelectDropdown).not.toBeVisible();

      // Re-enable rewards
      await manageRewardsPage.loadPage();
      await manageRewardsPage.clickOnElement(manageRewardsPage.enableRewardsButton, {
        stepInfo: 'Clicking on enable rewards button',
      });
      await manageRewardsPage.verifyToastMessageIsVisibleWithText('Rewards enabled');
      await expect(manageRewardsPage.rewardsTabHeading).toHaveText('Rewards overview');

      // Validate exchange rate in API
      await manageRewardsPage.verifier.isTheElementVisible(manageRewardsPage.activityPanelFiltersButton.last());
      await rewardGiftingOptionsPage.loadPage();
      await rewardGiftingOptionsPage.validateExchangeRateValueInAPI(newValue);
    }
  );

  test(
    '[RC-4267] Validate exchange rate option on Gifting option page when FF is disabled',
    {
      tag: [TestGroupType.REGRESSION, REWARD_FEATURE_TAGS.REWARDS_GIFTING_OPTIONS, TestPriority.P0],
    },
    async ({ appManagerFixture }) => {
      tagTest(test.info(), {
        description: 'Validate exchange rate option on Gifting option page when FF is disabled',
        zephyrTestId: 'RC-4267',
        storyId: 'RC-4267',
      });

      const manageRewardsPage = new ManageRewardsOverviewPage(appManagerFixture.page);
      const rewardGiftingOptionsPage = new RewardGiftingOptionsPage(appManagerFixture.page);

      // Navigate to manage rewards page
      const rewardApiPromise = manageRewardsPage.page.waitForResponse(
        response => response.url().includes('/recognition/admin/rewards') && response.status() === 200
      );
      await manageRewardsPage.loadPage();
      await rewardApiPromise;
      await expect(manageRewardsPage.page).toHaveURL('/manage/recognition/rewards/overview');

      // Disable rewards if needed
      const isDisableRewardButtonDisplayed = await manageRewardsPage.verifier.isTheElementVisible(
        manageRewardsPage.disableRewardLink,
        {
          timeout: 15000,
        }
      );
      if (isDisableRewardButtonDisplayed) {
        await manageRewardsPage.disableTheRewards();
        await manageRewardsPage.verifyThePageIsLoaded();
        await expect(manageRewardsPage.rewardsTabHeading).toHaveText('Recognition rewards');
      } else {
        console.log('Rewards are already disabled, skipping disable action.');
      }

      // Mock feature flag as disabled and navigate to gifting options
      await rewardGiftingOptionsPage.setTheHarnessValue('point_to_usd_conversion', false);
      await rewardGiftingOptionsPage.loadPage();
      await rewardGiftingOptionsPage.verifyThePageIsLoaded();
      await expect(manageRewardsPage.page).toHaveURL('/manage/recognition/rewards/peer-gifting/options');
      await rewardGiftingOptionsPage.exchangeRateSelectDropdown.waitFor({ state: 'detached' });
      await expect(manageRewardsPage.disableRewardLink).not.toBeAttached();
      const isVisible = await rewardGiftingOptionsPage.verifier.isTheElementVisible(
        rewardGiftingOptionsPage.exchangeRateSelectDropdown
      );
      expect(isVisible).toBeFalsy();

      // Re-enable rewards
      await manageRewardsPage.loadPage();
      await manageRewardsPage.enableTheRewards();
      await manageRewardsPage.verifyToastMessageIsVisibleWithText('Rewards enabled');
      await manageRewardsPage.dismissTheToastMessage();
      await expect(manageRewardsPage.rewardsTabHeading).toHaveText('Rewards overview');
    }
  );
});
