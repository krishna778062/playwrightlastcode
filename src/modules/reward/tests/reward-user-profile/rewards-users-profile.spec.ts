import { rewardTestFixture as test } from '@rewards/fixtures/rewardFixture';

import { TestPriority } from '@core/constants/testPriority';
import { TestGroupType } from '@core/constants/testType';
import { tagTest } from '@core/utils/testDecorator';
import { REWARD_FEATURE_TAGS, REWARD_SUITE_TAGS } from '@modules/reward/constants/testTags';
import { RecognitionHubPage } from '@modules/reward/pages/recognition-hub/recognition-hub-page';
import { RewardsStore } from '@modules/reward/pages/reward-store/reward-store';
import { UserProfilePage } from '@modules/reward/pages/user-profile/user-profile-page';

test.describe('User Profile', { tag: [REWARD_SUITE_TAGS.MANAGE_REWARD, REWARD_SUITE_TAGS.USER_PROFILE] }, () => {
  test(
    "[RC-3261] A Verify user profile should show a 'View orders' button in the Recognition section in Admin User profile page",
    {
      tag: [REWARD_FEATURE_TAGS.REWARD_STORE, TestGroupType.REGRESSION, TestPriority.P0],
    },
    async ({ appManagerPage }) => {
      tagTest(test.info(), {
        description:
          "Verify user profile should show a 'View orders' button in the Recognition section in Admin User profile page",
        zephyrTestId: 'RC-3261',
        storyId: 'RC-3261',
      });
      const rewardsStore = new RewardsStore(appManagerPage);
      const userProfilePage = new UserProfilePage(appManagerPage);
      await rewardsStore.enableTheRewardStoreAndPeerGiftingIfDisabled();
      await rewardsStore.selectCountryAndRedeemGiftCard('United States', 'Amazon');
      await rewardsStore.navigateToUserProfileAndValidateViewOrders(userProfilePage);
    }
  );

  test(
    "[RC-3261] B Verify user profile should show a 'View orders' button in the Recognition section in Recognition User profile page",
    {
      tag: [REWARD_FEATURE_TAGS.REWARD_STORE, TestGroupType.REGRESSION, TestPriority.P0],
    },
    async ({ recoManagerPage }) => {
      tagTest(test.info(), {
        description:
          "Verify user profile should show a 'View orders' button in the Recognition section in Recognition User profile page",
        zephyrTestId: 'RC-3261',
        storyId: 'RC-3261',
      });
      const rewardsStore = new RewardsStore(recoManagerPage);
      const userProfilePage = new UserProfilePage(recoManagerPage);
      await rewardsStore.loadPage();
      await rewardsStore.verifyThePageIsLoaded();
      await rewardsStore.selectCountryAndRedeemGiftCard('United States', 'Amazon');
      await rewardsStore.navigateToUserProfileAndValidateViewOrders(userProfilePage);
    }
  );

  test(
    "[RC-3261] C Verify user profile should show a 'View orders' button in the Recognition section in Standard User profile page",
    {
      tag: [REWARD_FEATURE_TAGS.REWARD_STORE, TestGroupType.REGRESSION, TestPriority.P0],
    },
    async ({ standardUserPage }) => {
      tagTest(test.info(), {
        description:
          "Verify user profile should show a 'View orders' button in the Recognition section in Standard User profile page",
        zephyrTestId: 'RC-3261',
        storyId: 'RC-3261',
      });

      const rewardsStore = new RewardsStore(standardUserPage);
      const userProfilePage = new UserProfilePage(standardUserPage);
      await rewardsStore.loadPage();
      await rewardsStore.verifier.waitUntilPageHasNavigatedTo('/rewards-store/gift-cards');
      await rewardsStore.verifier.verifyTheElementIsVisible(rewardsStore.header);
      await rewardsStore.selectCountryAndRedeemGiftCard('United States', 'Amazon');
      await rewardsStore.navigateToUserProfileAndValidateViewOrders(userProfilePage);
    }
  );

  test(
    '[RC-2963] Verify user wallet in users profile',
    {
      tag: [REWARD_FEATURE_TAGS.REWARD_STORE, TestGroupType.REGRESSION, TestPriority.P0],
    },
    async ({ appManagerPage }) => {
      tagTest(test.info(), {
        description: 'Verify user wallet in users profile',
        zephyrTestId: 'RC-2963',
        storyId: 'RC-2963',
      });

      const rewardsStore = new RewardsStore(appManagerPage);
      const userProfilePage = new UserProfilePage(appManagerPage);
      await rewardsStore.loadPage();
      await rewardsStore.verifier.waitUntilPageHasNavigatedTo('/rewards-store/gift-cards');
      await rewardsStore.verifier.verifyTheElementIsVisible(rewardsStore.header);
      await userProfilePage.navigateToCurrentUserProfile();
      const walletData = await userProfilePage.navigateToUserProfileAndCaptureWalletData();
      await userProfilePage.validateWalletDataStructure(walletData);
      await userProfilePage.validateWalletDataInUI(walletData);
      await userProfilePage.validateZeroValuesOnPage();
    }
  );

  test(
    '[RC-3000] Validate Reward redeeming failure',
    {
      tag: [REWARD_FEATURE_TAGS.REWARD_STORE, TestGroupType.REGRESSION, TestPriority.P0],
    },
    async ({ appManagerPage }) => {
      tagTest(test.info(), {
        description: 'Validate Reward redeeming failure',
        zephyrTestId: 'RC-3000',
        storyId: 'RC-3000',
      });

      const rewardsStore = new RewardsStore(appManagerPage);
      await rewardsStore.loadPage();
      await rewardsStore.redeemGiftCardWithFailure('United States', 'Amazon');
      await rewardsStore.validateRedemptionFailure();
    }
  );

  test(
    '[RC-3418] Verify the tooltip on the User wallet section, when Allowances are refreshing',
    {
      tag: [REWARD_FEATURE_TAGS.REWARD_STORE, REWARD_FEATURE_TAGS.REWARDS_DB_CASES, TestPriority.P2],
    },
    async ({ appManagerPage }) => {
      tagTest(test.info(), {
        description: 'Verify the tooltip on the User wallet section, when Allowances are refreshing',
        zephyrTestId: 'RC-3418',
        storyId: 'RC-3418',
      });

      const userProfilePage = new UserProfilePage(appManagerPage);
      const recognitionHub = new RecognitionHubPage(appManagerPage);
      await recognitionHub.visitRecognitionHub();
      await recognitionHub.enableDistributionAllowanceAsFailed();
      await userProfilePage.navigateToCurrentUserProfile();
      await userProfilePage.validateAllowanceRefreshingTooltip();
      await recognitionHub.disableDistributionAllowanceAsSuccess();
    }
  );
});
