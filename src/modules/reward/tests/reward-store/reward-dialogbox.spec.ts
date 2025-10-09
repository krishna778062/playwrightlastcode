import { expect } from '@playwright/test';
import { rewardTestFixture as test } from '@rewards/fixtures/rewardFixture';

import { TestPriority } from '@core/constants/testPriority';
import { TestGroupType } from '@core/constants/testType';
import { tagTest } from '@core/utils/testDecorator';
import { REWARD_FEATURE_TAGS, REWARD_SUITE_TAGS } from '@modules/reward/constants/testTags';
import { RewardsStore } from '@modules/reward/pages/reward-store/reward-store';

test.describe('Reward Dialog Box', { tag: [REWARD_SUITE_TAGS.REWARD_STORE] }, () => {
  test.beforeEach(async ({ appManagerPage }) => {
    const rewardsStore = new RewardsStore(appManagerPage);
    await rewardsStore.enableTheRewardStoreAndPeerGiftingIfDisabled();
  });

  test(
    '[RC-2985] Validate Reward Detail Dialog Box on Rewards store page',
    {
      tag: [REWARD_FEATURE_TAGS.REWARD_STORE, TestGroupType.REGRESSION, TestPriority.P0, TestGroupType.SMOKE],
    },
    async ({ appManagerPage }) => {
      tagTest(test.info(), {
        description: 'Validate Reward Detail Dialog Box on Rewards store page',
        zephyrTestId: 'RC-2985',
        storyId: 'RC-2985',
      });
      const rewardsStore = new RewardsStore(appManagerPage);
      const rewardName = 'Amazon.in';

      // Navigate to rewards store and validate
      await rewardsStore.verifier.waitUntilPageHasNavigatedTo('/rewards-store/gift-cards');
      await rewardsStore.verifier.verifyTheElementIsVisible(rewardsStore.header);
      const selectedCountry = await rewardsStore.rewardCountry.inputValue();

      // Click on one of the rewards displayed
      await rewardsStore.selectDropdownByLabel(rewardsStore.rewardCountry, 'India');
      await rewardsStore.cards(rewardName).click();
      await rewardsStore.verifier.verifyTheElementIsVisible(rewardsStore.rewardsDialogBox.container);

      // Verify Reward dialog Title
      await rewardsStore.verifier.verifyElementHasText(rewardsStore.rewardsDialogBox.title, rewardName);

      // Click on cancel button and Verify
      await rewardsStore.verifier.verifyTheElementIsVisible(rewardsStore.rewardsDialogBox.closeButton);
      await rewardsStore.rewardsDialogBox.closeButton.click();
      await rewardsStore.verifier.verifyTheElementIsNotVisible(rewardsStore.rewardsDialogBox.container);

      // Verify logo on Dialog
      await rewardsStore.cards(rewardName).click();
      await rewardsStore.verifier.verifyTheElementIsVisible(rewardsStore.rewardsDialogBox.logo(rewardName));

      // Verify Reward description
      await rewardsStore.verifier.verifyTheElementIsVisible(rewardsStore.rewardsDialogBox.description);

      // Click on reward value dropdown and validate result
      await rewardsStore.verifier.verifyTheElementIsVisible(rewardsStore.rewardsDialogBox.selectRewardValueLabel);
      await rewardsStore.rewardsDialogBox.selectRewardValueDropdown.click();
      const options = await rewardsStore.rewardsDialogBox.selectRewardValueDropdown.locator('option').allTextContents();
      expect(options.length).toBeGreaterThan(0);

      // Matching reward values should be displayed in the local currency (₹) and points
      options.forEach(option => {
        expect(option).toMatch(/₹(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)\s*\((\d{1,3}(?:,\d{3})*)\s+points\)/);
      });

      // User should be able to select value
      await rewardsStore.rewardsDialogBox.selectRewardValueDropdown.selectOption({ label: options[0] });

      // Verify available spending points
      await rewardsStore.verifier.verifyTheElementIsVisible(rewardsStore.rewardsDialogBox.pointsAvailable);

      // Click and verify Checkout button
      await rewardsStore.verifier.verifyTheElementIsVisible(rewardsStore.rewardsDialogBox.checkoutButton);
      await rewardsStore.rewardsDialogBox.checkoutButton.click();
      await rewardsStore.verifier.verifyElementHasText(rewardsStore.rewardsDialogBox.title, 'Confirm your order');

      // Restore original country
      await rewardsStore.selectDropdownByLabel(rewardsStore.rewardCountry, selectedCountry);
    }
  );

  test(
    '[RC-3539] Validate Error Message Logic for Variable amount gift card redemptions',
    {
      tag: [REWARD_FEATURE_TAGS.REWARD_STORE, TestGroupType.REGRESSION, TestPriority.P0, TestGroupType.SMOKE],
    },
    async ({ appManagerPage }) => {
      tagTest(test.info(), {
        description: 'Validate Error Message Logic for Variable amount gift card redemptions',
        zephyrTestId: 'RC-3539',
        storyId: 'RC-3539',
      });
      const rewardsStore = new RewardsStore(appManagerPage);
      const giftCardName = 'Aéropostale';
      let limitText: string, limits: number[];

      // Navigate to rewards store and validate
      await rewardsStore.verifier.waitUntilPageHasNavigatedTo('/rewards-store/gift-cards');
      await rewardsStore.verifier.verifyTheElementIsVisible(rewardsStore.header);
      await rewardsStore.selectDropdownByLabel(rewardsStore.rewardCountry, 'United States');

      // Open reward and get limits
      await rewardsStore.searchForGiftCard(giftCardName);
      await rewardsStore.clickOnTheNthGiftCard(1);
      await rewardsStore.verifier.verifyTheElementIsVisible(rewardsStore.rewardsDialogBox.container);
      await rewardsStore.verifier.verifyElementContainsText(rewardsStore.rewardsDialogBox.title, giftCardName);
      limitText = await rewardsStore.rewardsDialogBox.rewardAmountsLimits.textContent();
      limits = limitText?.match(/\d{1,3}(?:,\d{3})*|\d+/g)?.map(s => Number(s.replace(/,/g, ''))) || [];
      await rewardsStore.rewardsDialogBox.closeButton.click();

      // Test insufficient funds minimum error
      await rewardsStore.mockTheAvailablePoints(Number(limits[0] - 10));
      await rewardsStore.searchForGiftCard(giftCardName);
      await rewardsStore.clickOnTheNthGiftCard(1);
      await rewardsStore.verifier.verifyTheElementIsVisible(rewardsStore.rewardsDialogBox.container);
      await rewardsStore.rewardsDialogBox.rewardAmountInputBox.fill(String(Number(limits[0] - 10)));
      await rewardsStore.rewardsDialogBox.rewardAmountInputBox.blur();
      await rewardsStore.verifier.verifyTheElementIsVisible(rewardsStore.rewardsDialogBox.rewardBalanceError);
      await rewardsStore.verifier.verifyElementHasText(
        rewardsStore.rewardsDialogBox.rewardBalanceError,
        `Insufficient funds. A minimum of ${limits[0].toLocaleString()} points is required.`
      );
      await rewardsStore.rewardsDialogBox.closeButton.click();

      // Test minimum redemption amount error
      await rewardsStore.mockTheAvailablePoints(Number(limits[0] + 10));
      await rewardsStore.searchForGiftCard(giftCardName);
      await rewardsStore.clickOnTheNthGiftCard(1);
      await rewardsStore.verifier.verifyTheElementIsVisible(rewardsStore.rewardsDialogBox.container);
      await rewardsStore.rewardsDialogBox.rewardAmountInputBox.fill(String(Number(limits[0] - 1)));
      await rewardsStore.rewardsDialogBox.rewardAmountInputBox.blur();
      await rewardsStore.verifier.verifyTheElementIsVisible(rewardsStore.rewardsDialogBox.rewardBalanceError);
      await rewardsStore.verifier.verifyElementHasText(
        rewardsStore.rewardsDialogBox.rewardBalanceError,
        `This reward has a minimum redemption amount of ${limits[0]} points.`
      );
      await rewardsStore.rewardsDialogBox.closeButton.click();

      // Test insufficient funds general error
      await rewardsStore.mockTheAvailablePoints(limits[0] + 10);
      await rewardsStore.searchForGiftCard(giftCardName);
      await rewardsStore.clickOnTheNthGiftCard(1);
      await rewardsStore.verifier.verifyTheElementIsVisible(rewardsStore.rewardsDialogBox.container);
      const availableAmountText = await rewardsStore.rewardsDialogBox.rewardAmountsAvailablePoints.textContent();
      const availablePoints = Number(
        availableAmountText?.match(/\d{1,3}(?:,\d{3})*|\d+/)?.[0]?.replace(/,/g, '') || '0'
      );
      await rewardsStore.rewardsDialogBox.rewardAmountInputBox.fill(String(availablePoints + 5));
      await rewardsStore.rewardsDialogBox.rewardAmountInputBox.blur();
      await rewardsStore.verifier.verifyTheElementIsVisible(rewardsStore.rewardsDialogBox.rewardBalanceError);
      await rewardsStore.verifier.verifyElementHasText(
        rewardsStore.rewardsDialogBox.rewardBalanceError,
        'Insufficient funds.'
      );
      await rewardsStore.rewardsDialogBox.closeButton.click();

      // Test insufficient funds maximum error
      await rewardsStore.mockTheAvailablePoints(limits[1] - 10);
      await rewardsStore.searchForGiftCard(giftCardName);
      await rewardsStore.clickOnTheNthGiftCard(1);
      await rewardsStore.verifier.verifyTheElementIsVisible(rewardsStore.rewardsDialogBox.container);
      await rewardsStore.rewardsDialogBox.rewardAmountInputBox.fill(String(Number(limits[1] + 1)));
      await rewardsStore.rewardsDialogBox.rewardAmountInputBox.blur();
      await rewardsStore.verifier.verifyTheElementIsVisible(rewardsStore.rewardsDialogBox.rewardBalanceError);
      await rewardsStore.verifier.verifyElementHasText(
        rewardsStore.rewardsDialogBox.rewardBalanceError,
        `Insufficient funds. A maximum of ${limits[1].toLocaleString()} points is allowed.`
      );
      await rewardsStore.rewardsDialogBox.closeButton.click();

      // Test maximum redemption amount error
      await rewardsStore.mockTheAvailablePoints(limits[1] + 10);
      await rewardsStore.searchForGiftCard(giftCardName);
      await rewardsStore.clickOnTheNthGiftCard(1);
      await rewardsStore.verifier.verifyTheElementIsVisible(rewardsStore.rewardsDialogBox.container);
      await rewardsStore.rewardsDialogBox.rewardAmountInputBox.fill(String(Number(limits[1] + 1)));
      await rewardsStore.rewardsDialogBox.rewardAmountInputBox.blur();
      await rewardsStore.verifier.verifyTheElementIsVisible(rewardsStore.rewardsDialogBox.rewardBalanceError);
      await rewardsStore.verifier.verifyElementHasText(
        rewardsStore.rewardsDialogBox.rewardBalanceError,
        `A maximum of ${limits[1].toLocaleString()} points is allowed.`
      );
      await rewardsStore.rewardsDialogBox.closeButton.click();
    }
  );

  test(
    '[RC-3263] Validate Truncating the description in Redemption Dialog',
    {
      tag: [REWARD_FEATURE_TAGS.REWARD_STORE, TestGroupType.REGRESSION, TestPriority.P0, TestGroupType.SMOKE],
    },
    async ({ appManagerPage }) => {
      tagTest(test.info(), {
        description: 'Validate Truncating the description in Redemption Dialog',
        zephyrTestId: 'RC-3263',
        storyId: 'RC-3263',
      });
      const rewardsStore = new RewardsStore(appManagerPage);
      const giftCardName = 'Ace';

      // Navigate to rewards store and validate
      await rewardsStore.verifier.waitUntilPageHasNavigatedTo('/rewards-store/gift-cards');
      await rewardsStore.verifier.verifyTheElementIsVisible(rewardsStore.header);
      await rewardsStore.selectDropdownByLabel(rewardsStore.rewardCountry, 'United States');

      // Check the short description, fallback to use the long one
      await rewardsStore.searchForGiftCard(giftCardName);
      await rewardsStore.clickOnTheNthGiftCard(1);
      await rewardsStore.verifier.verifyTheElementIsVisible(rewardsStore.rewardsDialogBox.container);
      await rewardsStore.verifier.verifyElementContainsText(rewardsStore.rewardsDialogBox.title, giftCardName);
      await rewardsStore.verifier.verifyElementContainsText(rewardsStore.rewardsDialogBox.description, giftCardName);

      // Validate description is truncated
      const lineHeight = await rewardsStore.rewardsDialogBox.description.evaluate(el =>
        parseFloat(getComputedStyle(el).lineHeight)
      );
      const height = await rewardsStore.rewardsDialogBox.description.evaluate(el => el.getBoundingClientRect().height);
      const visibleLines = Math.round(height / lineHeight);
      expect(visibleLines).toBeLessThanOrEqual(4);

      const descriptionShortText = await rewardsStore.rewardsDialogBox.description.textContent();
      await rewardsStore.verifier.verifyTheElementIsVisible(
        rewardsStore.rewardsDialogBox.descriptionTextShowMoreButton
      );
      await rewardsStore.rewardsDialogBox.descriptionTextShowMoreButton.click();

      // Validate full text is visible and has 4+ lines
      const newHeight = await rewardsStore.rewardsDialogBox.description.evaluate(
        el => el.getBoundingClientRect().height
      );
      const newVisibleLines = Math.round(newHeight / lineHeight);
      expect(newVisibleLines).toBeGreaterThanOrEqual(4);

      // Store full text
      const descriptionFullText = await rewardsStore.rewardsDialogBox.description.textContent();
      expect(descriptionFullText).toContain(descriptionShortText?.trim());
    }
  );

  test(
    '[RC-3464] Validate fixed reward dialog for points available',
    {
      tag: [REWARD_FEATURE_TAGS.REWARD_STORE, TestGroupType.REGRESSION, TestPriority.P0, TestGroupType.SMOKE],
    },
    async ({ appManagerPage }) => {
      tagTest(test.info(), {
        description: 'Validate fixed reward dialog for points available',
        zephyrTestId: 'RC-3464',
        storyId: 'RC-3464',
      });
      const rewardsStore = new RewardsStore(appManagerPage);
      await rewardsStore.selectDropdownByLabel(rewardsStore.rewardCountry, 'United States');

      // Open 1 fixed reward with 100 points
      const fixedGiftCardName = 'Cinemark';
      await rewardsStore.mockTheAvailablePoints(Number(100));
      await rewardsStore.searchForGiftCard(fixedGiftCardName);
      await rewardsStore.clickOnTheNthGiftCard(1);
      await rewardsStore.verifier.verifyTheElementIsVisible(rewardsStore.rewardsDialogBox.container);
      await rewardsStore.verifier.verifyElementContainsText(rewardsStore.rewardsDialogBox.title, fixedGiftCardName);
      await rewardsStore.rewardsDialogBox.closeButton.click();

      // Open 1 variable reward with 100 points
      const variableGiftCardName = 'Amazon';
      await rewardsStore.mockTheAvailablePoints(Number(100));
      await rewardsStore.searchForGiftCard(variableGiftCardName);
      await rewardsStore.clickOnTheNthGiftCard(1);
      await rewardsStore.verifier.verifyTheElementIsVisible(rewardsStore.rewardsDialogBox.container);
      await rewardsStore.verifier.verifyElementContainsText(rewardsStore.rewardsDialogBox.title, variableGiftCardName);
      await rewardsStore.rewardsDialogBox.closeButton.click();

      // Open 1 variable reward with 0 points
      await rewardsStore.mockTheAvailablePoints(Number(0));
      await rewardsStore.searchForGiftCard(variableGiftCardName);
      await rewardsStore.clickOnTheNthGiftCard(0);
      await rewardsStore.verifier.verifyTheElementIsVisible(rewardsStore.rewardsDialogBox.container);
      await rewardsStore.verifier.verifyElementContainsText(rewardsStore.rewardsDialogBox.title, variableGiftCardName);
      await rewardsStore.verifier.verifyTheElementIsVisible(
        rewardsStore.rewardsDialogBox.redemptionZeroPointErrorDialogBox
      );
      await rewardsStore.verifier.verifyElementHasText(
        rewardsStore.rewardsDialogBox.zeroBalanceError,
        '0 points available'
      );
      await rewardsStore.verifier.verifyTheElementIsDisabled(rewardsStore.rewardsDialogBox.checkoutButton);
      await rewardsStore.rewardsDialogBox.closeButton.click();

      // Open 1 fixed reward with 0 points
      await rewardsStore.mockTheAvailablePoints(Number(0));
      await rewardsStore.searchForGiftCard(fixedGiftCardName);
      await rewardsStore.clickOnTheNthGiftCard(0);
      await rewardsStore.verifier.verifyTheElementIsVisible(rewardsStore.rewardsDialogBox.container);
      await rewardsStore.verifier.verifyElementContainsText(rewardsStore.rewardsDialogBox.title, fixedGiftCardName);
      await rewardsStore.verifier.verifyTheElementIsVisible(
        rewardsStore.rewardsDialogBox.redemptionZeroPointErrorDialogBox
      );
      await rewardsStore.verifier.verifyElementHasText(
        rewardsStore.rewardsDialogBox.zeroBalanceError,
        '0 points available'
      );
      await rewardsStore.verifier.verifyTheElementIsDisabled(rewardsStore.rewardsDialogBox.checkoutButton);
      await rewardsStore.rewardsDialogBox.closeButton.click();
    }
  );

  test(
    '[RC-3256] Validate form validation when the redemption dialog is opened and display error message',
    {
      tag: [REWARD_FEATURE_TAGS.REWARD_STORE, TestGroupType.REGRESSION, TestPriority.P0, TestGroupType.SMOKE],
    },
    async ({ appManagerPage }) => {
      tagTest(test.info(), {
        description: 'Validate form validation when the redemption dialog is opened and display error message',
        zephyrTestId: 'RC-3256',
        storyId: 'RC-3256',
      });
      const rewardsStore = new RewardsStore(appManagerPage);

      // Navigate to rewards store and validate
      await rewardsStore.verifier.waitUntilPageHasNavigatedTo('/rewards-store/gift-cards');
      await rewardsStore.verifier.verifyTheElementIsVisible(rewardsStore.header);
      await rewardsStore.selectDropdownByLabel(rewardsStore.rewardCountry, 'United States');

      // Open 1 variable reward with 0 points
      const variableGiftCardName = 'Aéropostale';
      await rewardsStore.mockTheAvailablePoints(Number(0));
      await rewardsStore.searchForGiftCard(variableGiftCardName);
      await rewardsStore.clickOnTheNthGiftCard(1);
      await rewardsStore.verifier.verifyTheElementIsVisible(rewardsStore.rewardsDialogBox.container);
      await rewardsStore.verifier.verifyElementContainsText(rewardsStore.rewardsDialogBox.title, variableGiftCardName);
      await rewardsStore.verifier.verifyTheElementIsVisible(
        rewardsStore.rewardsDialogBox.redemptionZeroPointErrorDialogBox
      );
      await rewardsStore.verifier.verifyElementHasText(
        rewardsStore.rewardsDialogBox.zeroBalanceError,
        '0 points available'
      );
      await rewardsStore.rewardsDialogBox.closeButton.click();

      // Open 1 fixed reward with 0 points
      const fixedGiftCardName = 'Cinemark';
      await rewardsStore.mockTheAvailablePoints(Number(0));
      await rewardsStore.searchForGiftCard(fixedGiftCardName);
      await rewardsStore.clickOnTheNthGiftCard(1);
      await rewardsStore.verifier.verifyTheElementIsVisible(rewardsStore.rewardsDialogBox.container);
      await rewardsStore.verifier.verifyElementContainsText(rewardsStore.rewardsDialogBox.title, fixedGiftCardName);
      await rewardsStore.verifier.verifyTheElementIsVisible(
        rewardsStore.rewardsDialogBox.redemptionZeroPointErrorDialogBox
      );
      await rewardsStore.verifier.verifyElementHasText(
        rewardsStore.rewardsDialogBox.zeroBalanceError,
        '0 points available'
      );
      await rewardsStore.rewardsDialogBox.closeButton.click();
    }
  );
});
