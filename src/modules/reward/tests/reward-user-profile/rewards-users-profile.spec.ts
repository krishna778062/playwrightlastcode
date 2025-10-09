import { rewardTestFixture as test } from '@rewards/fixtures/rewardFixture';

import { TestPriority } from '@core/constants/testPriority';
import { TestGroupType } from '@core/constants/testType';
import { LoginHelper } from '@core/helpers/loginHelper';
import { tagTest } from '@core/utils/testDecorator';
import { REWARD_FEATURE_TAGS, REWARD_SUITE_TAGS } from '@modules/reward/constants/testTags';
import { ManageRewardsOverviewPage } from '@modules/reward/pages/manage-rewards/manage-rewards-overview-page';
import { RecognitionHubPage } from '@modules/reward/pages/recognition-hub/recognition-hub-page';
import { RewardsStore } from '@modules/reward/pages/reward-store/reward-store';
import { UserProfilePage } from '@modules/reward/pages/user-profile/user-profile-page';

test.describe('User Profile', { tag: [REWARD_SUITE_TAGS.REWARD_STORE] }, () => {
  test.beforeEach(async ({ appManagerPage }) => {
    const manageRewardsPage = new ManageRewardsOverviewPage(appManagerPage);
    await manageRewardsPage.enableTheRewardsAndPeerGiftingIfDisabled();
  });

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
      await rewardsStore.loginAsAppManagerAndNavigateToRewardsStore();
      await rewardsStore.selectCountryAndRedeemGiftCard('United States', 'Amazon');
      await rewardsStore.navigateToUserProfileAndValidateViewOrders(userProfilePage);
    }
  );

  test(
    "[RC-3261] B Verify user profile should show a 'View orders' button in the Recognition section in Recognition User profile page",
    {
      tag: [REWARD_FEATURE_TAGS.REWARD_STORE, TestGroupType.REGRESSION, TestPriority.P0],
    },
    async ({ appManagerPage }) => {
      tagTest(test.info(), {
        description:
          "Verify user profile should show a 'View orders' button in the Recognition section in Recognition User profile page",
        zephyrTestId: 'RC-3261',
        storyId: 'RC-3261',
      });

      const rewardsStore = new RewardsStore(appManagerPage);
      const userProfilePage = new UserProfilePage(appManagerPage);
      await rewardsStore.loginAsRecognitionUserAndNavigateToRewardsStore();
      await rewardsStore.selectCountryAndRedeemGiftCard('United States', 'Amazon');
      await rewardsStore.navigateToUserProfileAndValidateViewOrders(userProfilePage);
    }
  );

  test(
    "[RC-3261] C Verify user profile should show a 'View orders' button in the Recognition section in Standard User profile page",
    {
      tag: [REWARD_FEATURE_TAGS.REWARD_STORE, TestGroupType.REGRESSION, TestPriority.P0],
    },
    async ({ appManagerPage }) => {
      tagTest(test.info(), {
        description:
          "Verify user profile should show a 'View orders' button in the Recognition section in Standard User profile page",
        zephyrTestId: 'RC-3261',
        storyId: 'RC-3261',
      });

      const rewardsStore = new RewardsStore(appManagerPage);
      const userProfilePage = new UserProfilePage(appManagerPage);
      await rewardsStore.loginAsStandardUserAndNavigateToRewardsStore();
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

      await LoginHelper.logoutByNavigatingToLogoutPage(appManagerPage);
      await LoginHelper.loginWithPassword(appManagerPage, {
        email: process.env.STANDARD_USER_USERNAME!,
        password: process.env.STANDARD_USER_PASSWORD!,
      });

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
      await rewardsStore.loginAsRecognitionUserAndNavigateToRewardsStore();
      await rewardsStore.redeemGiftCardWithFailure('United States', 'Amazon');
      await rewardsStore.validateRedemptionFailure();
    }
  );

  test(
    '[RC-3418] Verify the tooltip on the User wallet section, when Allowances are refreshing',
    {
      tag: [REWARD_FEATURE_TAGS.REWARD_STORE, TestGroupType.REGRESSION, TestPriority.P0],
    },
    async ({ appManagerPage }) => {
      tagTest(test.info(), {
        description: 'Verify the tooltip on the User wallet section, when Allowances are refreshing',
        zephyrTestId: 'RC-3418',
        storyId: 'RC-3418',
      });

      const userProfilePage = new UserProfilePage(appManagerPage);
      const recognitionHub = new RecognitionHubPage(appManagerPage);
      await userProfilePage.page.waitForLoadState('domcontentloaded');
      await recognitionHub.navigateToRecognitionHubAndValidateAllowanceRefreshing();
      await recognitionHub.enableDistributionAllowanceAsFailed();
      await recognitionHub.validateAllowanceRefreshingTooltipInRecognitionHub();
      await userProfilePage.navigateToCurrentUserProfile();
      await userProfilePage.validateAllowanceRefreshingTooltip();
      await recognitionHub.disableDistributionAllowanceAsSuccess();
    }
  );
});
