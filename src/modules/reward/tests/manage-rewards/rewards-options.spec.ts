import { expect, test } from '@playwright/test';

import { TestPriority } from '@core/constants/testPriority';
import { TestGroupType } from '@core/constants/testType';
import { LoginHelper } from '@core/helpers/loginHelper';
import { getEnvConfig } from '@core/utils/getEnvConfig';
import { tagTest } from '@core/utils/testDecorator';
import { REWARD_SUITE_TAGS } from '@modules/reward/constants/testTags';
import { ManageRewardsPage } from '@modules/reward/pages/manage-rewards-page';
import { RewardOptionsPage } from '@modules/reward/pages/reward-options-page';

import { NewUxHomePage } from '@/src/core/pages/homePage/newUxHomePage';
import { OldUxHomePage } from '@/src/core/pages/homePage/oldUxHomePage';

test.describe('Reward Options', { tag: [REWARD_SUITE_TAGS.REWARD_OPTIONS] }, () => {
  test(
    'A - Verify Reward options only visible to App managers',
    {
      tag: [REWARD_SUITE_TAGS.REGRESSION_TEST, TestPriority.P0, TestGroupType.SMOKE],
    },
    async ({ page }) => {
      tagTest(test.info(), {
        description: 'Verify Reward options only visible to App managers',
        zephyrTestId: 'RC-5371',
        storyId: 'RC-5251',
      });
      let homePage: OldUxHomePage | NewUxHomePage;
      let rewardOptionsIsVisible: boolean;
      let rewardIsEnabled: string | null;
      homePage = await LoginHelper.loginWithPassword(page, {
        email: getEnvConfig().appManagerEmail,
        password: getEnvConfig().appManagerPassword,
      });
      const rewardOptionsPage = new RewardOptionsPage(homePage.page);
      const manageRewardsPage = new ManageRewardsPage(homePage.page);

      await test.step('Login to the application', async () => {
        await homePage.verifyThePageIsLoaded();
      });

      await test.step('Verify the Rewards options is visible', async () => {
        await manageRewardsPage.visit();
        rewardIsEnabled = await manageRewardsPage.getTheKeyValueFromTheRewardsCall('enabled');
        rewardOptionsIsVisible =
          await rewardOptionsPage.getTheRewardsOptionsValueFromTheEvaluationCall('reward_options');
        await manageRewardsPage.verifyThePageIsLoaded();
        console.log('Reward Options is visible:', rewardOptionsIsVisible);
        if (Boolean(rewardIsEnabled)) {
          rewardOptionsIsVisible
            ? await expect(rewardOptionsPage.rewardOptionLink).toBeVisible()
            : await expect(rewardOptionsPage.rewardOptionLink).toBeHidden();
          if (rewardOptionsIsVisible) {
            await rewardOptionsPage.rewardOptionLink.click();
            await rewardOptionsPage.verifyThePageIsLoaded();
          }
        } else {
          console.log('Reward is not enabled, skipping reward options verification');
        }
      });
    }
  );

  test(
    'B - Verify Reward options only visible to recognition managers',
    {
      tag: [REWARD_SUITE_TAGS.REGRESSION_TEST, TestPriority.P0, TestGroupType.SMOKE],
    },
    async ({ page }) => {
      tagTest(test.info(), {
        description: 'Verify Reward options only visible to recognition managers',
        zephyrTestId: 'RC-5371',
        storyId: 'RC-5251',
      });
      let homePage: OldUxHomePage | NewUxHomePage;
      let rewardOptionsIsVisible;
      let rewardIsEnabled: string | null;
      homePage = await LoginHelper.loginWithPassword(page, {
        email: String(process.env['RECOGNITION_USER_USERNAME']),
        password: String(process.env['RECOGNITION_USER_PASSWORD']),
      });
      const rewardOptionsPage = new RewardOptionsPage(homePage.page);
      const manageRewardsPage = new ManageRewardsPage(homePage.page);

      await test.step('Login to the application', async () => {
        await homePage.verifyThePageIsLoaded();
      });

      await test.step('Verify the Rewards options is visible', async () => {
        await manageRewardsPage.visit();
        rewardIsEnabled = await manageRewardsPage.getTheKeyValueFromTheRewardsCall('enabled');
        rewardOptionsIsVisible =
          await rewardOptionsPage.getTheRewardsOptionsValueFromTheEvaluationCall('reward_options');
        await manageRewardsPage.verifyThePageIsLoaded();
        console.log('Reward Options is visible:', rewardOptionsIsVisible);
        if (Boolean(rewardIsEnabled)) {
          rewardOptionsIsVisible
            ? await expect(rewardOptionsPage.rewardOptionLink).toBeVisible()
            : await expect(rewardOptionsPage.rewardOptionLink).toBeHidden();
          if (rewardOptionsIsVisible) {
            await rewardOptionsPage.rewardOptionLink.click();
            await rewardOptionsPage.verifyThePageIsLoaded();
          }
        } else {
          console.log('Reward is not enabled, skipping reward options verification');
        }
      });
    }
  );

  test(
    'Verify Reward options not visible to user other than recognition managers',
    {
      tag: [REWARD_SUITE_TAGS.REGRESSION_TEST, TestPriority.P0, TestGroupType.SMOKE],
    },
    async ({ page }) => {
      tagTest(test.info(), {
        description: 'Verify Reward options not visible to user other than recognition managers',
        zephyrTestId: 'RC-5374',
        storyId: 'RC-5251',
      });
      let homePage: OldUxHomePage | NewUxHomePage;
      let rewardOptionsIsVisible;
      let rewardIsEnabled: string | null;
      homePage = await LoginHelper.loginWithPassword(page, {
        email: String(process.env['RECOGNITION_USER_USERNAME']),
        password: String(process.env['RECOGNITION_USER_PASSWORD']),
      });
      const rewardOptionsPage = new RewardOptionsPage(homePage.page);
      const manageRewardsPage = new ManageRewardsPage(homePage.page);

      await test.step('Login to the application', async () => {
        await homePage.verifyThePageIsLoaded();
      });

      await test.step('Verify the Rewards options is visible', async () => {
        await manageRewardsPage.visit();
        rewardIsEnabled = await manageRewardsPage.getTheKeyValueFromTheRewardsCall('enabled');
        rewardOptionsIsVisible =
          await rewardOptionsPage.getTheRewardsOptionsValueFromTheEvaluationCall('reward_options');
        await manageRewardsPage.verifyThePageIsLoaded();
        if (Boolean(rewardIsEnabled)) {
          rewardOptionsIsVisible
            ? await expect(rewardOptionsPage.rewardOptionLink).toBeVisible()
            : await expect(rewardOptionsPage.rewardOptionLink).toBeHidden();
          if (rewardOptionsIsVisible) {
            await rewardOptionsPage.rewardOptionLink.click();
            await rewardOptionsPage.verifyThePageIsLoaded();
          }
        } else {
          console.log('Reward is not enabled, skipping reward options verification');
        }
      });
    }
  );
});
