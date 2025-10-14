import { expect } from '@playwright/test';
import { REWARD_FEATURE_TAGS, REWARD_SUITE_TAGS } from '@rewards/constants/testTags';
import { rewardTestFixture as test } from '@rewards/fixtures/rewardFixture';
import { DialogBox } from '@rewards-components/common/dialog-box';
import { ManageRewardsOverviewPage } from '@rewards-pages/manage-rewards/manage-rewards-overview-page';
import { RewardGiftingOptionsPage } from '@rewards-pages/manage-rewards/reward-gifting-options-page';

import { TestPriority } from '@core/constants/testPriority';
import { TestGroupType } from '@core/constants/testType';
import { tagTest } from '@core/utils/testDecorator';

test.describe('gifting Options', { tag: [REWARD_SUITE_TAGS.MANAGE_REWARD] }, () => {
  test.beforeEach(async ({ appManagerFixture }) => {
    const manageRewardsPage = new ManageRewardsOverviewPage(appManagerFixture.page);
    await manageRewardsPage.enableTheRewardsAndPeerGiftingIfDisabled();
  });

  test(
    '[RC-3116] Verify dialog for unsaved changes when user in peer gifting options page navigates to different page or refreshes',
    {
      tag: [TestGroupType.REGRESSION, REWARD_FEATURE_TAGS.REWARDS_GIFTING_OPTIONS, TestPriority.P0],
    },
    async ({ appManagerFixture }) => {
      tagTest(test.info(), {
        description:
          'Verify dialog for unsaved changes when user in peer gifting options page navigates to different page or refreshes',
        zephyrTestId: 'RC-3116',
        storyId: 'RC-3116',
      });

      const manageRewardsPage = new ManageRewardsOverviewPage(appManagerFixture.page);
      const rewardGiftingOptionsPage = new RewardGiftingOptionsPage(appManagerFixture.page);

      await rewardGiftingOptionsPage.loadPage();
      await expect(manageRewardsPage.page).toHaveURL('/manage/recognition/rewards/peer-gifting/options');

      // Test unsaved changes dialog - Cancel scenario
      await rewardGiftingOptionsPage.enterTheAmountAndValidateNoError('1000');
      manageRewardsPage.page.once('dialog', async dialog => {
        await dialog.dismiss(); // Simulates clicking "Cancel"
      });
      await rewardGiftingOptionsPage.clickOnElement(rewardGiftingOptionsPage.rewardsOverview, {
        stepInfo: 'Clicking on rewards overview link to trigger dialog',
      });
      await expect(rewardGiftingOptionsPage.giftingOptionsInputBox).toHaveValue('1000');

      // Test unsaved changes dialog - Accept scenario
      await rewardGiftingOptionsPage.enterTheAmountAndValidateNoError('1000');
      manageRewardsPage.page.once('dialog', async dialog => {
        await dialog.accept(); // Simulates clicking "Ok"
      });
      await rewardGiftingOptionsPage.clickOnElement(rewardGiftingOptionsPage.rewardsOverview, {
        stepInfo: 'Clicking on rewards overview link to trigger dialog',
      });
      await rewardGiftingOptionsPage.loadPage();
      await rewardGiftingOptionsPage.giftingOptionsInputBox.waitFor({ state: 'visible' });
      await expect(rewardGiftingOptionsPage.giftingOptionsInputBox).not.toHaveValue('1000');
    }
  );

  test(
    '[RC-4424] Validate error message on Reward point gifting options',
    {
      tag: [TestGroupType.REGRESSION, REWARD_FEATURE_TAGS.REWARDS_GIFTING_OPTIONS, TestPriority.P0],
    },
    async ({ appManagerFixture }) => {
      tagTest(test.info(), {
        description: 'Validate error message on Reward point gifting options',
        zephyrTestId: 'RC-4424',
        storyId: 'RC-4424',
      });

      const rewardGiftingOptionsPage = new RewardGiftingOptionsPage(appManagerFixture.page);

      await rewardGiftingOptionsPage.loadPage();
      await expect(rewardGiftingOptionsPage.page).toHaveURL('/manage/recognition/rewards/peer-gifting/options');
      await rewardGiftingOptionsPage.validateTheGiftingOptionsUIElements();

      // Test various error scenarios
      await rewardGiftingOptionsPage.enterTheAmountAndValidateTheError(
        '1000000',
        'Only integer values up to a 100,000 are supported.'
      );

      await rewardGiftingOptionsPage.enterTheAmountAndValidateTheError(
        '999999',
        'Only integer values up to a 100,000 are supported.'
      );

      await rewardGiftingOptionsPage.enterTheAmountAndValidateTheError(
        '999.99',
        'Only integer values up to a 100,000 are supported.'
      );

      await rewardGiftingOptionsPage.enterTheAmountAndValidateTheError(
        '12,egf',
        'Only integer values up to a 100,000 are supported.'
      );

      await rewardGiftingOptionsPage.enterTheAmountAndValidateTheError(
        '100000,0',
        'Only positive values are supported.'
      );

      await rewardGiftingOptionsPage.enterTheAmountAndValidateTheError(
        '10,20,30,40,50,60,70,80,90',
        'Maximum 8 gifting options.'
      );

      await rewardGiftingOptionsPage.enterTheAmountAndValidateTheError(
        '10,5,20,30,5',
        'All gifting option amounts must be unique.'
      );
    }
  );

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
      await manageRewardsPage.verifyThePageIsLoaded();
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
      await manageRewardsPage.verifyThePageIsLoaded();
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
      await manageRewardsPage.activityPanelFiltersButton.last().isVisible();
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
      const isDisableRewardButtonDisplayed = await manageRewardsPage.disableRewardLink.isVisible({
        timeout: 15000,
      });
      if (isDisableRewardButtonDisplayed) {
        await manageRewardsPage.clickOnElement(manageRewardsPage.disableRewardLink, {
          stepInfo: 'Clicking on disable rewards link',
        });
        await manageRewardsPage.disableRewardButton.waitFor({ state: 'visible', timeout: 15000 });
        await manageRewardsPage.clickOnElement(manageRewardsPage.disableRewardButton, {
          stepInfo: 'Clicking on disable rewards button',
        });
        const dialogBox = new DialogBox(manageRewardsPage.page);
        await dialogBox.title.waitFor({ state: 'visible' });
        await expect(dialogBox.title).toHaveText('Disable rewards');
        await dialogBox.descriptionText.last().waitFor({ state: 'visible', timeout: 5000 });
        const isDialogVisible = await manageRewardsPage.verifier.isTheElementVisible(dialogBox.title);
        if (isDialogVisible) {
          await dialogBox.inputBox.fill('confirm');
          await dialogBox.inputBox.blur();
          await dialogBox.confirmButton.click();
        }
        await manageRewardsPage.verifyToastMessageIsVisibleWithText('Rewards disabled');
        await manageRewardsPage.rewardsTabHeading.waitFor({ state: 'visible' });
        await manageRewardsPage.page.reload();
        await manageRewardsPage.verifyThePageIsLoaded();
        await expect(manageRewardsPage.rewardsTabHeading).toHaveText('Recognition rewards');
      } else {
        console.log('Rewards are already disabled, skipping disable action.');
      }

      // Mock feature flag as disabled and navigate to gifting options
      await manageRewardsPage.page.route('**/api/1.0/client/env/**/target/**/evaluations?cluster=2', async route => {
        const response = await route.fetch();
        const body = await response.json();

        const updatedBody = body.map((item: any) => {
          if (item.flag === 'point_to_usd_conversion') {
            return {
              ...item,
              value: 'false',
              identifier: 'false',
            };
          }
          return item;
        });

        await route.fulfill({
          response,
          body: JSON.stringify(updatedBody),
          headers: {
            ...response.headers(),
            'content-type': 'application/json',
          },
        });
      });
      await rewardGiftingOptionsPage.loadPage();
      await manageRewardsPage.page.reload();
      await expect(manageRewardsPage.page).toHaveURL('/manage/recognition/rewards/peer-gifting/options');

      // Validate exchange rate dropdown is not visible
      await rewardGiftingOptionsPage.loadPage();
      await rewardGiftingOptionsPage.giftingOptionsInputBox.waitFor({
        state: 'visible',
        timeout: 25000,
      });
      await rewardGiftingOptionsPage.exchangeRateSelectDropdown.waitFor({ state: 'detached' });
      await expect(manageRewardsPage.disableRewardLink).not.toBeAttached();
      const isVisible = await rewardGiftingOptionsPage.exchangeRateSelectDropdown.isVisible().catch(() => false);
      expect(isVisible).toBeFalsy();

      // Re-enable rewards
      await manageRewardsPage.loadPage();
      await manageRewardsPage.clickOnElement(manageRewardsPage.enableRewardsButton, {
        stepInfo: 'Clicking on enable rewards button',
      });
      await manageRewardsPage.verifyToastMessageIsVisibleWithText('Rewards enabled');
      await expect(manageRewardsPage.rewardsTabHeading).toHaveText('Rewards overview');
    }
  );
});
