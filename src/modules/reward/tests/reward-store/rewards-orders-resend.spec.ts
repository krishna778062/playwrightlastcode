import { rewardTestFixture as test } from '@rewards/fixtures/rewardFixture';

import { TestPriority } from '@core/constants/testPriority';
import { TestGroupType } from '@core/constants/testType';
import { tagTest } from '@core/utils/testDecorator';
import { REWARD_FEATURE_TAGS, REWARD_SUITE_TAGS } from '@modules/reward/constants/testTags';
import { RewardsStore } from '@modules/reward/pages/reward-store/reward-store';

test.describe('Rewards store - Order history page', { tag: [REWARD_FEATURE_TAGS.REWARD_STORE] }, () => {
  test.beforeEach(async ({ appManagerPage }) => {
    const rewardsStore = new RewardsStore(appManagerPage);
    await rewardsStore.enableTheRewardStoreAndPeerGiftingIfDisabled();
  });

  test(
    '[RC-3267] Verify the resend reward status when order date is more than 90 days old',
    {
      tag: [REWARD_SUITE_TAGS.REGRESSION_TEST, TestPriority.P0, TestGroupType.SMOKE],
    },
    async ({ appManagerPage }) => {
      tagTest(test.info(), {
        description: 'Verify the resend reward status when order date is more than 90 days old',
        zephyrTestId: 'RC-3267',
        storyId: 'RC-3267',
      });
      const rewardsStore = new RewardsStore(appManagerPage);
      await rewardsStore.loadPage();
      await rewardsStore.verifier.waitUntilPageHasNavigatedTo('/rewards-store/gift-cards');
      await rewardsStore.verifier.verifyTheElementIsVisible(rewardsStore.header);
      await rewardsStore.mockTheOrderAPIResponse();
      await rewardsStore.visitTheOrderHistory();
      await rewardsStore.verifier.waitUntilPageHasNavigatedTo('/rewards-store/order-history');
      await rewardsStore.verifier.verifyTheElementIsVisible(rewardsStore.header);
      await rewardsStore.validateTheOrderResendForMoreThan90Days();
    }
  );

  test(
    '[RC-3245] Validate Resend reward dialogue on order history Resending',
    {
      tag: [REWARD_SUITE_TAGS.REGRESSION_TEST, TestPriority.P0, TestGroupType.SMOKE],
    },
    async ({ appManagerPage }) => {
      tagTest(test.info(), {
        description: 'Validate Resend reward dialogue on order history Resending',
        zephyrTestId: 'RC-3245',
        storyId: 'RC-3245',
      });
      const rewardsStore = new RewardsStore(appManagerPage);
      await rewardsStore.visitTheOrderHistory();
      await rewardsStore.verifier.waitUntilPageHasNavigatedTo('/rewards-store/order-history');
      await rewardsStore.verifier.verifyTheElementIsVisible(rewardsStore.header);
      await rewardsStore.validateTheOrderHistoryElements();
      await rewardsStore.clickOnTheResendButton(1);
      await rewardsStore.clickOnTheCancelButtonInResendReward();
      await rewardsStore.clickOnTheResendButton(1);
      await rewardsStore.validateTheResendDialogElements();
      await rewardsStore.enterAllTheDetailsAndClickOnResend('primary');
      await rewardsStore.validateTheResentConfirmation();
    }
  );

  test(
    '[RC-3242] Validate order history resending using secondary email address',
    {
      tag: [REWARD_SUITE_TAGS.REGRESSION_TEST, TestPriority.P0, TestGroupType.SMOKE],
    },
    async ({ appManagerPage }) => {
      tagTest(test.info(), {
        description: 'Validate order history resending using secondary email address',
        zephyrTestId: 'RC-3242',
        storyId: 'RC-3242',
      });
      const rewardsStore = new RewardsStore(appManagerPage);
      await rewardsStore.loadPage();
      await rewardsStore.visitTheOrderHistory();
      await rewardsStore.verifier.waitUntilPageHasNavigatedTo('/rewards-store/order-history');
      await rewardsStore.verifier.verifyTheElementIsVisible(rewardsStore.header);
      await rewardsStore.validateTheOrderHistoryElements();
      await rewardsStore.clickOnTheResendButton(1);
      await rewardsStore.clickOnTheCancelButtonInResendReward();
      await rewardsStore.clickOnTheResendButton(1);
      await rewardsStore.validateTheResendDialogElements();
      await rewardsStore.enterAllTheDetailsAndClickOnResend('sonu.kumar+15@simmplr.com');
      await rewardsStore.validateTheResentConfirmation();
    }
  );

  test(
    '[RC-3244] Validate(form validation) if both email address field contains same value on resend reward dialogue',
    {
      tag: [REWARD_SUITE_TAGS.REGRESSION_TEST, TestPriority.P0, TestGroupType.SMOKE],
    },
    async ({ appManagerPage }) => {
      tagTest(test.info(), {
        description:
          'Validate(form validation) if both email address field contains same value on resend reward dialogue',
        zephyrTestId: 'RC-3244',
        storyId: 'RC-3244',
      });
      const rewardsStore = new RewardsStore(appManagerPage);
      await rewardsStore.loadPage();
      await rewardsStore.verifier.waitUntilPageHasNavigatedTo('/rewards-store/gift-cards');
      await rewardsStore.verifier.verifyTheElementIsVisible(rewardsStore.header);
      await rewardsStore.visitTheOrderHistory();
      await rewardsStore.verifier.waitUntilPageHasNavigatedTo('/rewards-store/order-history');
      await rewardsStore.verifier.verifyTheElementIsVisible(rewardsStore.header);
      await rewardsStore.validateTheOrderHistoryElements();
      const primaryEmail = await rewardsStore.orderHistoryPanelRewardPrimaryEmail.first().textContent();
      await rewardsStore.clickOnTheResendButton(1);
      await rewardsStore.verifier.verifyElementHasText(
        rewardsStore.resentRewardDialogBoxEmailInput,
        primaryEmail || ''
      );
    }
  );
});
