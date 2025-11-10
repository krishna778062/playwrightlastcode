import { REWARD_FEATURE_TAGS, REWARD_SUITE_TAGS } from '@rewards/constants/testTags';
import { rewardTestFixture as test } from '@rewards/fixtures/rewardFixture';
import { RewardsStore } from '@rewards-pages/reward-store/reward-store';

import { TestPriority } from '@core/constants/testPriority';
import { TestGroupType } from '@core/constants/testType';
import { tagTest } from '@core/utils/testDecorator';

test.describe('rewards order history', { tag: [REWARD_SUITE_TAGS.REWARD_STORE] }, () => {
  test.beforeEach(async ({ appManagerFixture }) => {
    const rewardsStore = new RewardsStore(appManagerFixture.page);
    await rewardsStore.enableTheRewardStoreAndPeerGiftingIfDisabled();
  });

  test(
    '[RC-3538] Validate reward value of rewards on Order History page',
    {
      tag: [
        REWARD_FEATURE_TAGS.REWARD_ORDERS_HISTORY_PAGE,
        TestGroupType.REGRESSION,
        TestPriority.P0,
        TestGroupType.SMOKE,
      ],
    },
    async ({ appManagerFixture }) => {
      tagTest(test.info(), {
        description: 'Validate reward value of rewards on Order History page',
        zephyrTestId: 'RC-3538',
        storyId: 'RC-3538',
      });
      const rewardsStore = new RewardsStore(appManagerFixture.page);

      await rewardsStore.verifier.waitUntilPageHasNavigatedTo('/rewards-store/gift-cards');
      await rewardsStore.verifier.verifyTheElementIsVisible(rewardsStore.header);

      const usGiftCards = ['Amazon', 'Apple', 'Virtual Promotional Prepaid Mastercard', 'American Cancer Society'];
      await rewardsStore.selectDropdownByLabel(rewardsStore.rewardCountry, 'United States');

      await rewardsStore.redeemAndValidateWithOrderHistory({
        tab: rewardsStore.giftCardsTab,
        giftCard: usGiftCards[0],
        successMessage: 'Your reward has been sent',
        additionalMessages: ['Please check your email inbox for your reward details'],
      });

      await rewardsStore.redeemAndValidateWithOrderHistory({
        tab: rewardsStore.giftCardsTab,
        giftCard: usGiftCards[1],
        successMessage: 'Your reward has been sent',
        additionalMessages: ['Please check your email inbox for your reward details'],
      });

      await rewardsStore.redeemAndValidateWithOrderHistory({
        tab: rewardsStore.prepaidCardsTab,
        giftCard: usGiftCards[2],
        successMessage: 'Your reward has been sent',
        additionalMessages: ['Please check your email inbox for your reward details'],
      });

      await rewardsStore.redeemAndValidateWithOrderHistory({
        tab: rewardsStore.charityDonationsTab,
        giftCard: usGiftCards[3],
        successMessage: 'Your donation has been sent',
        additionalMessages: ['Thank you for your generosity', 'Please check your email inbox for your reward details'],
      });

      const canadaGiftCards = [
        'Amazon',
        'Bass Pro Shops®',
        'Virtual Promotional Prepaid Mastercard',
        'Canadian Red Cross',
      ];
      await rewardsStore.clickOnElement(rewardsStore.giftCardsTab, {
        stepInfo: 'Clicking on gift cards tab for Canada',
      });
      await rewardsStore.selectDropdownByLabel(rewardsStore.rewardCountry, 'Canada');

      await rewardsStore.redeemAndValidateWithOrderHistory({
        tab: rewardsStore.giftCardsTab,
        giftCard: canadaGiftCards[0],
        successMessage: 'Your reward has been sent',
        additionalMessages: ['Please check your email inbox for your reward details'],
      });

      await rewardsStore.redeemAndValidateWithOrderHistory({
        tab: rewardsStore.giftCardsTab,
        giftCard: canadaGiftCards[1],
        successMessage: 'Your reward has been sent',
        additionalMessages: ['Please check your email inbox for your reward details'],
      });

      await rewardsStore.redeemAndValidateWithOrderHistory({
        tab: rewardsStore.prepaidCardsTab,
        giftCard: canadaGiftCards[2],
        successMessage: 'Your reward has been sent',
        additionalMessages: ['Please check your email inbox for your reward details'],
      });

      await rewardsStore.redeemAndValidateWithOrderHistory({
        tab: rewardsStore.charityDonationsTab,
        giftCard: canadaGiftCards[3],
        successMessage: 'Your donation has been sent',
        additionalMessages: ['Thank you for your generosity', 'Please check your email inbox for your reward details'],
      });
    }
  );
});
