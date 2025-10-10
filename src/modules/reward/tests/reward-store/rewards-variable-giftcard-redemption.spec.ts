import { rewardTestFixture as test } from '@rewards/fixtures/rewardFixture';

import { TestPriority } from '@core/constants/testPriority';
import { TestGroupType } from '@core/constants/testType';
import { tagTest } from '@core/utils/testDecorator';
import { REWARD_FEATURE_TAGS, REWARD_SUITE_TAGS } from '@modules/reward/constants/testTags';

import { RewardsStore } from '../../ui/pages/reward-store/reward-store';

test.describe('rewards Variable Gift Card Redemption', { tag: [REWARD_FEATURE_TAGS.REWARD_STORE] }, () => {
  test.beforeEach(async ({ appManagerPage }) => {
    const rewardsStore = new RewardsStore(appManagerPage);
    await rewardsStore.enableTheRewardStoreAndPeerGiftingIfDisabled();
  });

  test(
    '[RC-3227] Validate Variable amount gift card redemptions',
    {
      tag: [REWARD_SUITE_TAGS.REGRESSION_TEST, TestPriority.P0, TestGroupType.SMOKE],
    },
    async ({ appManagerPage }) => {
      tagTest(test.info(), {
        description: 'Validate Variable amount gift card redemptions',
        zephyrTestId: 'RC-3227',
        storyId: 'RC-3227',
      });
      const rewardsStore = new RewardsStore(appManagerPage);
      const giftCardName = 'Airbnb';
      let limits: number[] = [];

      await rewardsStore.verifier.waitUntilPageHasNavigatedTo('/rewards-store/gift-cards');
      await rewardsStore.verifier.verifyTheElementIsVisible(rewardsStore.header);

      // Open 1 reward, Select reward value & click on checkout button
      await rewardsStore.selectDropdownByLabel(rewardsStore.rewardCountry, 'United States');
      await rewardsStore.searchForGiftCard(giftCardName);
      await rewardsStore.clickOnTheNthGiftCard(1);
      await rewardsStore.verifier.verifyTheElementIsVisible(rewardsStore.rewardsDialogBox.container);
      await rewardsStore.verifier.verifyElementContainsText(rewardsStore.rewardsDialogBox.title, giftCardName);
      const limitText = await rewardsStore.rewardsDialogBox.rewardAmountsLimits.textContent();
      if (limitText) {
        limits = limitText.match(/\d{1,3}(?:,\d{3})*|\d+/g)?.map(s => Number(s.replace(/,/g, ''))) || [];
      }
      await rewardsStore.clickOnElement(rewardsStore.rewardsDialogBox.closeButton, {
        stepInfo: 'Clicking on close button',
      });

      // Verify error messages for different scenarios
      await rewardsStore.verifyErrorScenario(
        giftCardName,
        limits[0] - 10,
        limits[0] - 10,
        `Insufficient funds. A minimum of ${limits[0].toLocaleString()} points is required.`
      );
      await rewardsStore.verifyErrorScenario(
        giftCardName,
        limits[0] + 10,
        limits[0] - 1,
        `This reward has a minimum redemption amount of ${limits[0]} points.`
      );
      await rewardsStore.verifyInsufficientFundsError(giftCardName, limits[0] + 10);
      await rewardsStore.verifyErrorScenario(
        giftCardName,
        limits[1] - 10,
        limits[1] + 1,
        `Insufficient funds. A maximum of ${limits[1].toLocaleString()} points is allowed.`
      );
      await rewardsStore.verifyErrorScenario(
        giftCardName,
        limits[1] + 10,
        limits[1] + 1,
        `A maximum of ${limits[1].toLocaleString()} points is allowed.`
      );
    }
  );
});
