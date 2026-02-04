import { expect } from '@playwright/test';
import { REWARD_FEATURE_TAGS, REWARD_SUITE_TAGS } from '@rewards/constants/testTags';
import { rewardTestFixture as test } from '@rewards/fixtures/rewardFixture';
import { ManageRewardsOverviewPage } from '@rewards-pages/manage-rewards/manage-rewards-overview-page';
import { RewardOptionsPage } from '@rewards-pages/manage-rewards/reward-options-page';
import { RewardsStore } from '@rewards-pages/reward-store/reward-store';

import { TestGroupType, TestPriority } from '@core/constants';
import { tagTest } from '@core/utils';

test.describe('reward Options', { tag: [REWARD_SUITE_TAGS.MANAGE_REWARD] }, () => {
  const giftCards = [
    { rcCode: 'RC-5565', country: 'Turkey', name: 'A101 Turkey', visibility: 'Active' },
    { rcCode: 'RC-5376', country: 'Turkey', name: 'A101 Turkey', visibility: 'Inactive' },
  ];
  for (const giftCard of giftCards) {
    test(
      `[${giftCard.rcCode}] Gift card should ${giftCard.visibility === 'Active' ? 'be visible' : 'not be visible'} when set to ${giftCard.visibility}`,
      { tag: [REWARD_FEATURE_TAGS.REWARD_OPTIONS, TestGroupType.REGRESSION, TestPriority.P0, TestGroupType.SMOKE] },
      async ({ recoManagerFixture }) => {
        tagTest(test.info(), {
          description: `[${giftCard.rcCode}]- Gift card should ${giftCard.visibility === 'Active' ? 'be visible' : 'not be visible'} when set to ${giftCard.visibility}`,
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
          giftCard.visibility === 'Active' ? 'Active' : 'Inactive'
        );

        await rewardsStorePage.loadPage();
        await rewardsStorePage.selectCountry(giftCard.country);
        await rewardsStorePage.searchForGiftCard(giftCard.name);
        await rewardsStorePage.verifyGiftCardVisibility(
          giftCard.name,
          giftCard.visibility === 'Active' ? 'Active' : 'Inactive'
        );
      }
    );
  }

  test(
    'RC-5433 Validate gift card on order history after user deactivate it',
    {
      tag: [REWARD_FEATURE_TAGS.REWARD_OPTIONS, TestGroupType.REGRESSION, TestPriority.P0, TestGroupType.SMOKE],
    },
    async ({ recoManagerFixture }) => {
      tagTest(test.info(), {
        description: 'Validate gift card on order history after user deactivate it',
        zephyrTestId: 'RC-5433',
        storyId: 'RC-5433',
      });
      const rewardOptionsPage = new RewardOptionsPage(recoManagerFixture.page);
      const rewardsStorePage = new RewardsStore(recoManagerFixture.page);
      const giftCardDetails = { country: 'United States', name: "Domino's" };

      // Navigate to the Rewards option page and check the gift card is enabled
      await rewardOptionsPage.setGiftCardState(rewardOptionsPage, giftCardDetails.name, 'Active');

      // Redeem the gift card
      await rewardsStorePage.loadPage();
      await rewardsStorePage.verifyThePageIsLoaded();
      await rewardsStorePage.selectCountry(giftCardDetails.country);
      await rewardsStorePage.searchForGiftCard(giftCardDetails.name);
      await rewardsStorePage.clickOnTheNthGiftCard(1);
      await rewardsStorePage.rewardsDialogBox.clickOnTheCheckoutButton();
      await rewardsStorePage.rewardsDialogBox.enterTheConfirmEmail();
      await rewardsStorePage.rewardsDialogBox.checkTheTermsAndConditionCheckbox();
      await rewardsStorePage.verifier.verifyTheElementIsEnabled(rewardsStorePage.rewardsDialogBox.confirmOrder);
      await rewardsStorePage.rewardsDialogBox.clickOnConfirmOrder();

      // Navigate to Rewards option page again and deactivate the gift card
      await rewardOptionsPage.setGiftCardState(rewardOptionsPage, giftCardDetails.name, 'Inactive');

      // Go to the Order History page and validate order for gift card
      await rewardsStorePage.visit();
      await rewardsStorePage.verifyThePageIsLoaded();
      await rewardsStorePage.visitTheOrderHistory();
      await rewardsStorePage.verifier.verifyTheElementIsVisible(rewardsStorePage.orderHistoryPanel.first());
      await rewardsStorePage.verifier.verifyTheElementIsVisible(
        rewardsStorePage.orderHistoryPanel.first().locator(`img[alt^="${giftCardDetails.name}"]`)
      );
      await rewardsStorePage.verifier.verifyElementContainsText(
        rewardsStorePage.orderHistoryPanelRewardName.first(),
        giftCardDetails.name
      );
      await rewardsStorePage.verifier.verifyTheElementIsVisible(
        rewardsStorePage.orderHistoryPanelRewardResendButton.first()
      );
      await rewardsStorePage.validateTheOrderHistoryElements();
      await rewardsStorePage.clickOnTheResendButton(1);
      await rewardsStorePage.clickOnTheCancelButtonInResendReward();
      await rewardsStorePage.clickOnTheResendButton(1);
      await rewardsStorePage.enterAllTheDetailsAndClickOnResend('sonu.kumar+12@simmplr.com');
      await rewardsStorePage.validateTheResentConfirmation();

      // Navigate to the Rewards option page and Set the Active again for the gift card
      await rewardOptionsPage.setGiftCardState(rewardOptionsPage, giftCardDetails.name, 'Active');
    }
  );
});
