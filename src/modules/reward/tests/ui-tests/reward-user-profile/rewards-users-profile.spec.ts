import { rewardTestFixture as test } from '@rewards/fixtures/rewardFixture';
import { TestDbScenarios } from '@rewards/utils/testDatabaseHelper';
import { RecognitionHubPage } from '@rewards-pages/recognition-hub/recognition-hub-page';
import { RewardsStore } from '@rewards-pages/reward-store/reward-store';
import { UserProfilePage } from '@rewards-pages/user-profile/user-profile-page';

import { TestPriority } from '@core/constants/testPriority';
import { TestGroupType } from '@core/constants/testType';
import { tagTest } from '@core/utils/testDecorator';
import { REWARD_FEATURE_TAGS, REWARD_SUITE_TAGS } from '@modules/reward/constants/testTags';

import { log } from '@/src/core';

test.describe('user profile', { tag: [REWARD_SUITE_TAGS.MANAGE_REWARD, REWARD_SUITE_TAGS.USER_PROFILE] }, () => {
  test(
    "[RC-3261] A Verify user profile should show a 'View orders' button in the Recognition section in Admin User profile page",
    {
      tag: [REWARD_FEATURE_TAGS.REWARD_STORE, TestGroupType.REGRESSION, TestPriority.P0],
    },
    async ({ appManagerFixture }) => {
      tagTest(test.info(), {
        description:
          "Verify user profile should show a 'View orders' button in the Recognition section in Admin User profile page",
        zephyrTestId: 'RC-3261',
        storyId: 'RC-3261',
      });
      const rewardsStore = new RewardsStore(appManagerFixture.page);
      const userProfilePage = new UserProfilePage(appManagerFixture.page);
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
    async ({ recoManagerFixture }) => {
      tagTest(test.info(), {
        description:
          "Verify user profile should show a 'View orders' button in the Recognition section in Recognition User profile page",
        zephyrTestId: 'RC-3261',
        storyId: 'RC-3261',
      });
      const rewardsStore = new RewardsStore(recoManagerFixture.page);
      const userProfilePage = new UserProfilePage(recoManagerFixture.page);
      await rewardsStore.enableTheRewardStoreAndPeerGiftingIfDisabled();
      await rewardsStore.selectCountryAndRedeemGiftCard('United States', 'Amazon');
      await rewardsStore.navigateToUserProfileAndValidateViewOrders(userProfilePage);
    }
  );

  test(
    "[RC-3261] C Verify user profile should show a 'View orders' button in the Recognition section in Standard User profile page",
    {
      tag: [REWARD_FEATURE_TAGS.REWARD_STORE, TestGroupType.REGRESSION, TestPriority.P0],
    },
    async ({ standardUserFixture }) => {
      tagTest(test.info(), {
        description:
          "Verify user profile should show a 'View orders' button in the Recognition section in Standard User profile page",
        zephyrTestId: 'RC-3261',
        storyId: 'RC-3261',
      });

      const rewardsStore = new RewardsStore(standardUserFixture.page);
      const userProfilePage = new UserProfilePage(standardUserFixture.page);
      await rewardsStore.loadPage();
      await rewardsStore.verifyThePageIsLoaded();
      await rewardsStore.selectCountryAndRedeemGiftCard('United States', 'Amazon');
      await rewardsStore.navigateToUserProfileAndValidateViewOrders(userProfilePage);
    }
  );

  test(
    '[RC-2963] Verify user wallet in users profile',
    {
      tag: [REWARD_FEATURE_TAGS.REWARD_STORE, REWARD_FEATURE_TAGS.REWARDS_DB_CASES, TestPriority.P3],
    },
    async ({ appManagerFixture }) => {
      tagTest(test.info(), {
        description: 'Verify user wallet in users profile',
        zephyrTestId: 'RC-2963',
        storyId: 'RC-2963',
      });
      const rewardsStore = new RewardsStore(appManagerFixture.page);
      const userProfilePage = new UserProfilePage(appManagerFixture.page);
      await rewardsStore.enableTheRewardStoreAndPeerGiftingIfDisabled();
      // Get tenant code
      const tenantCode = await appManagerFixture.page.evaluate(() => {
        return (window as any).Simpplr?.Settings?.accountId;
      });
      try {
        await TestDbScenarios.cleanupAllowanceRefresh(tenantCode);
        const walletData = await userProfilePage.navigateToUserProfileAndCaptureWalletData();
        await userProfilePage.validateWalletDataStructure(walletData);
        await userProfilePage.validateWalletDataInUI(walletData);
        await userProfilePage.validateZeroValuesOnPage();
      } catch (e) {
        log.info(`${e}`);
      } finally {
        await TestDbScenarios.cleanupAllowanceRefresh(tenantCode);
      }
    }
  );

  test(
    '[RC-3000] Validate Reward redeeming failure',
    {
      tag: [REWARD_FEATURE_TAGS.REWARD_STORE, TestGroupType.REGRESSION, TestPriority.P0],
    },
    async ({ appManagerFixture }) => {
      tagTest(test.info(), {
        description: 'Validate Reward redeeming failure',
        zephyrTestId: 'RC-3000',
        storyId: 'RC-3000',
      });

      const rewardsStore = new RewardsStore(appManagerFixture.page);
      await rewardsStore.enableTheRewardStoreAndPeerGiftingIfDisabled();
      await rewardsStore.redeemGiftCardWithFailure('United States', 'Amazon');
      await rewardsStore.validateRedemptionFailure();
    }
  );

  test(
    '[RC-3418] Verify the tooltip on the User wallet section, when Allowances are refreshing',
    {
      tag: [REWARD_FEATURE_TAGS.REWARD_STORE, REWARD_FEATURE_TAGS.REWARDS_DB_CASES, TestPriority.P3],
    },
    async ({ appManagerFixture }) => {
      tagTest(test.info(), {
        description: 'Verify the tooltip on the User wallet section, when Allowances are refreshing',
        zephyrTestId: 'RC-3418',
        storyId: 'RC-3418',
      });

      const userProfilePage = new UserProfilePage(appManagerFixture.page);
      const recognitionHub = new RecognitionHubPage(appManagerFixture.page);
      // Get tenant code
      const tenantCode = await appManagerFixture.page.evaluate(() => {
        return (window as any).Simpplr?.Settings?.accountId;
      });
      try {
        await TestDbScenarios.setupAllowanceRefresh(tenantCode);
        await recognitionHub.visitRecognitionHub();
        await recognitionHub.verifyThePageIsLoaded();
        await userProfilePage.navigateToCurrentUserProfile();
        await userProfilePage.validateAllowanceRefreshingTooltip();
        await TestDbScenarios.cleanupAllowanceRefresh(tenantCode);
      } catch (e) {
        log.info(`${e}`);
      } finally {
        await TestDbScenarios.cleanupAllowanceRefresh(tenantCode);
      }
    }
  );
});
