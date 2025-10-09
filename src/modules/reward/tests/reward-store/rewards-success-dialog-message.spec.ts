import { expect } from '@playwright/test';
import { rewardTestFixture as test } from '@rewards/fixtures/rewardFixture';

import { TestPriority } from '@core/constants/testPriority';
import { TestGroupType } from '@core/constants/testType';
import { tagTest } from '@core/utils/testDecorator';
import { REWARD_FEATURE_TAGS, REWARD_SUITE_TAGS } from '@modules/reward/constants/testTags';
import { RewardsStore } from '@modules/reward/pages/reward-store/reward-store';

test.describe('Rewards Success Dialog box message', { tag: [REWARD_SUITE_TAGS.REWARD_STORE] }, () => {
  test.beforeEach(async ({ appManagerPage }) => {
    const rewardsStore = new RewardsStore(appManagerPage);
    await rewardsStore.enableTheRewardStoreAndPeerGiftingIfDisabled();
  });

  test(
    '[RC-3015] Validate successful reward redemption based on type of reward',
    {
      tag: [REWARD_FEATURE_TAGS.REWARD_STORE, TestGroupType.REGRESSION, TestPriority.P0, TestGroupType.SMOKE],
    },
    async ({ appManagerPage }) => {
      tagTest(test.info(), {
        description: 'Validate successful reward redemption based on type of reward',
        zephyrTestId: 'RC-3015',
        storyId: 'RC-3015',
      });
      const rewardsStore = new RewardsStore(appManagerPage);

      // Navigate to rewards store and validate
      await rewardsStore.verifier.waitUntilPageHasNavigatedTo('/rewards-store/gift-cards');
      await rewardsStore.verifier.verifyTheElementIsVisible(rewardsStore.header);
      await rewardsStore.selectDropdownByLabel(rewardsStore.rewardCountry, 'United States');

      // Redeem regular gift card and validate success
      await rewardsStore.redeemAndValidate({
        tab: null,
        giftCard: 'Amazon',
        successMessage: 'Your reward has been sent',
        additionalMessages: ['Please check your email inbox for your reward details'],
      });

      // Redeem prepaid gift card and validate success
      await rewardsStore.redeemAndValidate({
        tab: rewardsStore.prepaidCardsTab,
        giftCard: 'Virtual Promotional Prepaid Mastercard - USA & International Acceptance',
        successMessage: 'Your reward has been sent',
        additionalMessages: ['Please check your email inbox for your reward details'],
      });

      // Redeem charity donation and validate success
      await rewardsStore.redeemAndValidate({
        tab: rewardsStore.charityDonationsTab,
        giftCard: 'American Red Cross',
        successMessage: 'Your donation has been sent',
        additionalMessages: ['Thank you for your generosity', 'Please check your email inbox for your reward details'],
      });
    }
  );

  test(
    '[RC-3001] Validate Reward Order confirmation Dialog',
    {
      tag: [REWARD_FEATURE_TAGS.REWARD_STORE, TestGroupType.REGRESSION, TestPriority.P0, TestGroupType.SMOKE],
    },
    async ({ appManagerPage }) => {
      tagTest(test.info(), {
        description: 'Validate Reward Order confirmation Dialog',
        zephyrTestId: 'RC-3001',
        storyId: 'RC-3001',
      });
      const rewardsStore = new RewardsStore(appManagerPage);
      const giftCardName = 'Amazon';

      // Navigate to rewards store and validate
      await rewardsStore.verifier.waitUntilPageHasNavigatedTo('/rewards-store/gift-cards');
      await rewardsStore.verifier.verifyTheElementIsVisible(rewardsStore.header);

      // Open 1 reward, Select reward value & click on checkout button
      await rewardsStore.searchForGiftCard(giftCardName);
      await rewardsStore.clickOnTheNthGiftCard(1);
      await rewardsStore.verifier.verifyTheElementIsVisible(rewardsStore.rewardsDialogBox.container);
      await rewardsStore.verifier.verifyElementContainsText(rewardsStore.rewardsDialogBox.title, giftCardName);
      await rewardsStore.verifier.verifyTheElementIsEnabled(rewardsStore.rewardsDialogBox.checkoutButton);
      await rewardsStore.rewardsDialogBox.clickOnTheCheckoutButton();
      await rewardsStore.verifier.verifyElementHasText(rewardsStore.rewardsDialogBox.title, 'Confirm your order');

      // Click and verify back arrow
      await rewardsStore.rewardsDialogBox.clickOnBackArrowButton();
      await rewardsStore.verifier.verifyElementContainsText(rewardsStore.rewardsDialogBox.title, giftCardName);

      // Enter the Invalid email and validate the error
      await rewardsStore.rewardsDialogBox.clickOnTheCheckoutButton();
      await rewardsStore.rewardsDialogBox.enterTheInvalidEmailInEmailAddressInputBox();
      await rewardsStore.verifier.verifyTheElementIsVisible(rewardsStore.rewardsDialogBox.InvalidEmailError);
      await rewardsStore.verifier.verifyElementHasText(
        rewardsStore.rewardsDialogBox.InvalidEmailError,
        'This is not a valid email address'
      );
      await rewardsStore.rewardsDialogBox.enterTheDifferentEmailInConfirmEmailAddressInputBox();
      await rewardsStore.verifier.verifyTheElementIsVisible(rewardsStore.rewardsDialogBox.DoNotMatchEmailError);
      await rewardsStore.verifier.verifyElementHasText(
        rewardsStore.rewardsDialogBox.DoNotMatchEmailError,
        'Emails do not match'
      );

      // Click & verify cancel button
      await rewardsStore.rewardsDialogBox.clickOnCancelButton();
      await rewardsStore.verifier.verifyTheElementIsNotVisible(rewardsStore.rewardsDialogBox.title);

      // Click & verify close button
      await rewardsStore.clickOnTheNthGiftCard(1);
      await rewardsStore.rewardsDialogBox.clickOnTheCheckoutButton();
      await rewardsStore.rewardsDialogBox.clickOnCloseButton();
      await rewardsStore.verifier.verifyTheElementIsNotVisible(rewardsStore.rewardsDialogBox.title);

      // Enter email address in "Confirm email" field & verify
      await rewardsStore.clickOnTheNthGiftCard(1);
      await rewardsStore.rewardsDialogBox.clickOnTheCheckoutButton();
      await rewardsStore.rewardsDialogBox.enterTheConfirmEmail();
      await rewardsStore.rewardsDialogBox.checkTheTermsAndConditionCheckbox();
      await rewardsStore.verifier.verifyTheElementIsEnabled(rewardsStore.rewardsDialogBox.confirmOrder);
      await rewardsStore.rewardsDialogBox.clickOnConfirmOrder();

      // Click on Confirm order button and validate the success message
      await rewardsStore.verifier.verifyTheElementIsVisible(rewardsStore.rewardsDialogBox.successOrderLogo);
      await rewardsStore.verifier.verifyElementHasText(
        rewardsStore.rewardsDialogBox.successOrderHeading,
        'Your reward has been sent'
      );
      await rewardsStore.verifier.verifyElementHasText(
        rewardsStore.rewardsDialogBox.successOrderDescription,
        'Please check your email inbox for your reward details'
      );
      await rewardsStore.rewardsDialogBox.closeTheSuccessDialogBox();
    }
  );

  test(
    '[RC-3068] Verify if a redemption of reward fails then points should be refunded',
    {
      tag: [REWARD_FEATURE_TAGS.REWARD_STORE, TestGroupType.REGRESSION, TestPriority.P0, TestGroupType.SMOKE],
    },
    async ({ appManagerPage }) => {
      tagTest(test.info(), {
        description: 'Verify if a redemption of reward fails then points should be refunded',
        zephyrTestId: 'RC-3068',
        storyId: 'RC-3068',
      });
      const rewardsStore = new RewardsStore(appManagerPage);
      let preExistingPoints: string, postExistingPoints: string;

      // Navigate to rewards store and validate
      await rewardsStore.verifier.waitUntilPageHasNavigatedTo('/rewards-store/gift-cards');
      await rewardsStore.verifier.verifyTheElementIsVisible(rewardsStore.header);

      // Get the redeemable points before redemption
      await rewardsStore.giftCardNames.last().waitFor({ state: 'visible' });
      preExistingPoints = (await rewardsStore.pointToSpend.textContent()) || '';

      // Redeem 1 gift card with failure
      await rewardsStore.checkOutTheGiftCardForInterruption('Amazon');

      // Validate the Redemption failure
      await rewardsStore.verifier.verifyTheElementIsVisible(rewardsStore.rewardsDialogBox.container);
      await rewardsStore.verifier.verifyElementHasText(
        rewardsStore.rewardsDialogBox.somethingWentWrongTitle,
        'Something went wrong'
      );
      await rewardsStore.verifier.verifyElementHasText(
        rewardsStore.rewardsDialogBox.somethingWentWrongDescription1,
        'There was an error processing your order. Please try again later.'
      );
      await rewardsStore.verifier.verifyElementHasText(
        rewardsStore.rewardsDialogBox.somethingWentWrongDescription2,
        'You have not been charged any points.'
      );
      await rewardsStore.verifier.verifyTheElementIsVisible(
        rewardsStore.rewardsDialogBox.somethingWentWrongCloseButton.last()
      );
      await rewardsStore.rewardsDialogBox.somethingWentWrongCloseButton.last().click();
      await rewardsStore.verifier.verifyTheElementIsNotVisible(rewardsStore.rewardsDialogBox.container);

      // Get the redeemable points after failed redemption
      const [walletResponse] = await Promise.all([
        rewardsStore.page.waitForResponse(
          resp => resp.url().match(/\/recognition\/rewards\/users\/.*\/wallet/) !== null && resp.status() === 200
        ),
        rewardsStore.page.reload(),
      ]);
      await rewardsStore.pointToSpend.waitFor({ state: 'attached' });
      postExistingPoints = (await rewardsStore.pointToSpend.textContent()) || '';

      // Validate the both points are same
      expect(preExistingPoints).toBe(postExistingPoints);
    }
  );
});
