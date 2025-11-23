import { expect } from '@playwright/test';
import { REWARD_FEATURE_TAGS, REWARD_SUITE_TAGS } from '@rewards/constants/testTags';
import { rewardTestFixture as test } from '@rewards/fixtures/rewardFixture';
import { ManageRewardsOverviewPage } from '@rewards-pages/manage-rewards/manage-rewards-overview-page';

import { TestPriority } from '@core/constants/testPriority';
import { TestGroupType } from '@core/constants/testType';
import { tagTest } from '@core/utils/testDecorator';

test.describe('budget flows when Reward is disabled', { tag: [REWARD_SUITE_TAGS.MANAGE_REWARD] }, () => {
  test.beforeEach(async ({ appManagerFixture }) => {
    const manageRewardsPage = new ManageRewardsOverviewPage(appManagerFixture.page);
    await manageRewardsPage.loadPageWithHarness();
    await manageRewardsPage.verifyThePageIsLoaded();
    await manageRewardsPage.enableTheRewardsAndPeerGiftingIfDisabled();
  });

  test(
    '[RC-3216] Validate Edit Budget flow modal when Rewards is disabled',
    {
      tag: [REWARD_FEATURE_TAGS.REWARDS_BUDGET_SUMMARY, TestPriority.P0, TestGroupType.REGRESSION],
    },
    async ({ appManagerFixture }) => {
      tagTest(test.info(), {
        description: 'Validate Edit Budget flow modal when Rewards is disabled',
        zephyrTestId: 'RC-3216',
        storyId: 'RC-3216',
      });

      const manageRewardsPage = new ManageRewardsOverviewPage(appManagerFixture.page);

      await Promise.all([
        manageRewardsPage.page.waitForResponse(
          response => response.url().includes('/recognition/admin/rewards') && response.status() === 200
        ),
        manageRewardsPage.loadPage(),
      ]);

      await manageRewardsPage.verifier.waitUntilPageHasNavigatedTo('/manage/recognition/rewards/overview');
      await manageRewardsPage.verifier.verifyTheElementIsVisible(manageRewardsPage.header);
      await manageRewardsPage.rewardsTabHeading.waitFor({
        state: 'attached',
        timeout: 20000,
      });
      if ((await manageRewardsPage.rewardsTabHeading.textContent()) === 'Rewards overview') {
        if (await manageRewardsPage.verifier.verifyTheElementIsVisible(manageRewardsPage.disableRewardLink)) {
          await manageRewardsPage.disableTheRewards();
        } else {
          console.log('Rewards are already disabled, skipping disable action.');
        }
      }

      await manageRewardsPage.clickOnDisabledRewardsAddEditBudgetButton();
      await manageRewardsPage.verifier.verifyTheElementIsVisible(manageRewardsPage.dialogContainerForm.container);
      await manageRewardsPage.verifier.verifyElementContainsText(
        manageRewardsPage.budgetModal.budgetPanelHeader,
        'rewards budget'
      );

      await manageRewardsPage.budgetModal.selectTheBudgetFrequency('Annual');
      await manageRewardsPage.selectRadioIfNotSelected(
        manageRewardsPage.budgetModal.budgetBalanceApplicationFullAnnualBudget
      );
      await manageRewardsPage.fillInElement(manageRewardsPage.budgetModal.budgetPanelInputBox, '99999', {
        stepInfo: 'Filling budget input with 99999',
      });
      await manageRewardsPage.budgetModal.budgetPanelInputBox.blur();
      await manageRewardsPage.clickOnElement(manageRewardsPage.budgetModal.budgetPanelSaveButton, {
        stepInfo: 'Clicking on save button',
      });
      await manageRewardsPage.verifier.verifyTheElementIsNotVisible(manageRewardsPage.dialogContainerForm.container);
      await manageRewardsPage.rewardsAllowance.validateToastMessage('Saved changes successfully');

      await manageRewardsPage.clickOnDisabledRewardsAddEditBudgetButton();
      await manageRewardsPage.verifier.verifyTheElementIsVisible(manageRewardsPage.dialogContainerForm.container);

      await manageRewardsPage.budgetModal.selectTheBudgetFrequency('Quarterly');
      await manageRewardsPage.fillInElement(manageRewardsPage.budgetModal.budgetPanelInputBox, '99999', {
        stepInfo: 'Filling budget input with 99999',
      });
      await manageRewardsPage.budgetModal.budgetPanelInputBox.blur();
      await manageRewardsPage.clickOnElement(manageRewardsPage.budgetModal.budgetPanelSaveButton, {
        stepInfo: 'Clicking on save button',
      });
      await manageRewardsPage.verifier.verifyTheElementIsNotVisible(manageRewardsPage.dialogContainerForm.container);
      await manageRewardsPage.rewardsAllowance.validateToastMessage('Saved changes successfully');

      await manageRewardsPage.clickOnDisabledRewardsAddEditBudgetButton();
      await manageRewardsPage.verifier.verifyTheElementIsVisible(manageRewardsPage.dialogContainerForm.container);

      await manageRewardsPage.budgetModal.selectTheBudgetFrequency('Remove');
      await manageRewardsPage.clickOnElement(manageRewardsPage.budgetModal.budgetPanelSaveButton, {
        stepInfo: 'Clicking on save button',
      });
      await manageRewardsPage.verifier.verifyTheElementIsNotVisible(manageRewardsPage.dialogContainerForm.container);
      await manageRewardsPage.rewardsAllowance.validateToastMessage('Saved changes successfully');
      await manageRewardsPage.verifier.verifyTheElementIsVisible(manageRewardsPage.disabledRewardAddBudgetButton);

      await Promise.all([
        manageRewardsPage.page.waitForResponse(
          response => response.url().includes('/recognition/admin/rewards') && response.status() === 200
        ),
        manageRewardsPage.loadPage(),
      ]);

      await manageRewardsPage.verifier.waitUntilPageHasNavigatedTo('/manage/recognition/rewards/overview');
      await manageRewardsPage.verifier.verifyTheElementIsVisible(manageRewardsPage.header);
      await manageRewardsPage.rewardsTabHeading.waitFor({
        state: 'attached',
        timeout: 20000,
      });
      if ((await manageRewardsPage.rewardsTabHeading.textContent()) === 'Recognition rewards') {
        await manageRewardsPage.enableTheRewards();
      }
    }
  );

  test(
    '[RC-3043] Validate the Add Budget flow modal when rewards is disabled',
    {
      tag: [REWARD_FEATURE_TAGS.REWARDS_BUDGET_SUMMARY, TestPriority.P0, TestGroupType.REGRESSION],
    },
    async ({ appManagerFixture }) => {
      tagTest(test.info(), {
        description: 'Validate the Add Budget flow modal when rewards is disabled',
        zephyrTestId: 'RC-3043',
        storyId: 'RC-3043',
      });

      const manageRewardsPage = new ManageRewardsOverviewPage(appManagerFixture.page);

      await manageRewardsPage.verifier.waitUntilPageHasNavigatedTo('/manage/recognition/rewards/overview');
      await manageRewardsPage.verifier.verifyTheElementIsVisible(manageRewardsPage.header);
      await manageRewardsPage.verifier.isTheElementVisible(manageRewardsPage.rewardsTabHeading, { timeout: 15000 });
      if (
        await manageRewardsPage.verifier.isTheElementVisible(manageRewardsPage.disableRewardLink, { timeout: 15000 })
      ) {
        await manageRewardsPage.disableTheRewards();
      } else {
        console.log('Rewards are already disabled, skipping disable action.');
      }

      await manageRewardsPage.clickOnDisabledRewardsAddEditBudgetButton();
      await manageRewardsPage.verifier.verifyTheElementIsVisible(manageRewardsPage.dialogContainerForm.container);
      if (!(await manageRewardsPage.budgetModal.budgetPanelRemoveRadioInputBox.isHidden({ timeout: 5000 }))) {
        await manageRewardsPage.verifier.verifyElementContainsText(
          manageRewardsPage.budgetModal.budgetPanelHeader,
          'rewards budget'
        );
        await manageRewardsPage.budgetModal.selectTheBudgetFrequency('Remove');
        await manageRewardsPage.clickOnElement(manageRewardsPage.budgetModal.budgetPanelSaveButton, {
          stepInfo: 'Clicking on save button',
        });
        await manageRewardsPage.verifier.verifyTheElementIsNotVisible(manageRewardsPage.dialogContainerForm.container);
        await manageRewardsPage.rewardsAllowance.validateToastMessage('Saved changes successfully');
        await manageRewardsPage.verifier.verifyTheElementIsVisible(manageRewardsPage.disabledRewardAddBudgetButton);
      } else {
        await manageRewardsPage.clickOnElement(manageRewardsPage.dialogContainerForm.cancelButton, {
          stepInfo: 'Clicking on cancel button',
        });
      }

      await manageRewardsPage.clickOnDisabledRewardsAddEditBudgetButton();
      await manageRewardsPage.budgetModal.selectTheBudgetFrequency('Annual');
      await manageRewardsPage.fillInElement(manageRewardsPage.budgetModal.budgetPanelInputBox, '99999', {
        stepInfo: 'Filling budget input with 99999',
      });
      await manageRewardsPage.budgetModal.budgetPanelInputBox.blur();
      await manageRewardsPage.clickOnElement(manageRewardsPage.budgetModal.budgetPanelSaveButton, {
        stepInfo: 'Clicking on save button',
      });
      await manageRewardsPage.verifier.verifyTheElementIsNotVisible(manageRewardsPage.dialogContainerForm.container);
      await manageRewardsPage.rewardsAllowance.validateToastMessage('Saved changes successfully');
      await manageRewardsPage.page.reload();
      const apiResponse = await manageRewardsPage.page.waitForResponse(
        response => response.url().includes('/recognition/admin/rewards') && response.status() === 200
      );
      const body = await apiResponse.json();
      console.log('before remove', body);
      expect(body.isBudgetConfigured).toBe(true);

      await Promise.all([
        manageRewardsPage.page.waitForResponse(
          response => response.url().includes('/recognition/admin/rewards') && response.status() === 200
        ),
        manageRewardsPage.loadPage(),
      ]);

      await manageRewardsPage.verifier.waitUntilPageHasNavigatedTo('/manage/recognition/rewards/overview');
      await manageRewardsPage.verifier.verifyTheElementIsVisible(manageRewardsPage.header);
      await manageRewardsPage.rewardsTabHeading.waitFor({
        state: 'attached',
        timeout: 20000,
      });
      if ((await manageRewardsPage.rewardsTabHeading.textContent()) === 'Recognition rewards') {
        await manageRewardsPage.enableTheRewards();
      }
    }
  );

  test(
    '[RC-3251] Validate if adding "Rewards Budget" is an optional option to enable rewards',
    {
      tag: [REWARD_FEATURE_TAGS.REWARDS_BUDGET_SUMMARY, TestPriority.P0, TestGroupType.REGRESSION],
    },
    async ({ appManagerFixture }) => {
      tagTest(test.info(), {
        description: 'Validate if adding "Rewards Budget" is an optional option to enable rewards',
        zephyrTestId: 'RC-3251',
        storyId: 'RC-3251',
      });

      const manageRewardsPage = new ManageRewardsOverviewPage(appManagerFixture.page);
      const customBudget = manageRewardsPage.getRandomNo(50000, 99999);

      await manageRewardsPage.clickOnAddEditBudgetButton();
      await manageRewardsPage.verifier.verifyTheElementIsVisible(manageRewardsPage.dialogContainerForm.container);
      await manageRewardsPage.verifier.verifyElementContainsText(
        manageRewardsPage.budgetModal.budgetPanelHeader,
        'rewards budget'
      );
      await manageRewardsPage.budgetModal.selectTheBudgetFrequency('Annual');
      await manageRewardsPage.fillInElement(manageRewardsPage.budgetModal.budgetPanelInputBox, String(customBudget), {
        stepInfo: 'Filling budget input with custom budget',
      });
      await manageRewardsPage.budgetModal.budgetPanelInputBox.blur();
      await manageRewardsPage.clickOnElement(manageRewardsPage.budgetModal.budgetPanelSaveButton, {
        stepInfo: 'Clicking on save button',
      });
      await manageRewardsPage.verifier.verifyTheElementIsNotVisible(manageRewardsPage.dialogContainerForm.container);
      await manageRewardsPage.rewardsAllowance.validateToastMessage('Saved changes successfully');
      await manageRewardsPage.page.reload();
      const apiResponse = await manageRewardsPage.page.waitForResponse(
        response => response.url().includes('/recognition/admin/rewards') && response.status() === 200
      );
      const body = await apiResponse.json();
      console.log('before remove', body);
      expect(body.isBudgetConfigured).toBe(true);

      await manageRewardsPage.verifier.verifyTheElementIsVisible(manageRewardsPage.pointBalanceSummaryAllowancePoints);
      await manageRewardsPage.budgetSummaryAnnualBudgetBalanceValue.last().waitFor({
        state: 'visible',
        timeout: 20000,
      });
      const budgetValue = await manageRewardsPage.budgetSummaryAnnualBudgetBalanceValue.last().textContent();
      const numericValue = budgetValue?.split('/$')[1].replace(/,/g, '').trim();
      expect(numericValue).toContain(String(customBudget));

      await manageRewardsPage.verifier.waitUntilPageHasNavigatedTo('/manage/recognition/rewards/overview');
      await manageRewardsPage.verifier.verifyTheElementIsVisible(manageRewardsPage.header);
      await manageRewardsPage.verifier.isTheElementVisible(manageRewardsPage.rewardsTabHeading, { timeout: 15000 });
      if (
        await manageRewardsPage.verifier.isTheElementVisible(manageRewardsPage.disableRewardLink, { timeout: 15000 })
      ) {
        await manageRewardsPage.disableTheRewards();
      } else {
        console.log('Rewards are already disabled, skipping disable action.');
      }

      await manageRewardsPage.clickOnElement(manageRewardsPage.disabledRewardPeerGiftingContainer, {
        stepInfo: 'Clicking on disabled reward peer gifting container',
      });
      await manageRewardsPage.clickOnElement(manageRewardsPage.disabledRewardRewardsBudgetContainer, {
        stepInfo: 'Clicking on disabled reward rewards budget container',
      });
      await manageRewardsPage.clickOnElement(manageRewardsPage.disabledRewardCurrencyConversionContainer, {
        stepInfo: 'Clicking on disabled reward currency conversion container',
      });

      await manageRewardsPage.clickOnDisabledRewardsAddEditBudgetButton();
      await manageRewardsPage.verifier.verifyTheElementIsVisible(manageRewardsPage.dialogContainerForm.container);
      if (
        await manageRewardsPage.verifier.isTheElementVisible(
          manageRewardsPage.budgetModal.budgetPanelRemoveRadioInputBox,
          { timeout: 5000 }
        )
      ) {
        await manageRewardsPage.verifier.verifyElementContainsText(
          manageRewardsPage.budgetModal.budgetPanelHeader,
          'rewards budget'
        );
        await manageRewardsPage.budgetModal.selectTheBudgetFrequency('Remove');
        await manageRewardsPage.clickOnElement(manageRewardsPage.budgetModal.budgetPanelSaveButton, {
          stepInfo: 'Clicking on save button',
        });
        await manageRewardsPage.verifier.verifyTheElementIsNotVisible(manageRewardsPage.dialogContainerForm.container);
        await manageRewardsPage.verifier.verifyTheElementIsVisible(manageRewardsPage.disabledRewardAddBudgetButton);
        await manageRewardsPage.rewardsAllowance.validateToastMessage('Saved changes successfully');
      } else {
        await manageRewardsPage.clickOnElement(manageRewardsPage.dialogContainerForm.cancelButton, {
          stepInfo: 'Clicking on cancel button',
        });
      }

      await manageRewardsPage.verifier.waitUntilPageHasNavigatedTo('/manage/recognition/rewards/overview');
      await manageRewardsPage.verifier.verifyTheElementIsVisible(manageRewardsPage.header);
      await manageRewardsPage.rewardsTabHeading.waitFor({
        state: 'attached',
        timeout: 20000,
      });
      if ((await manageRewardsPage.rewardsTabHeading.textContent()) === 'Recognition rewards') {
        await manageRewardsPage.verifier.verifyTheElementIsEnabled(manageRewardsPage.enableRewardsButton);
        await manageRewardsPage.enableTheRewards();
      }
      await manageRewardsPage.verifier.isTheElementVisible(manageRewardsPage.budgetSummaryActionBarButton, {
        timeout: 5000,
      });
      await expect(manageRewardsPage.budgetSummaryActionBarButton).toHaveText('Add budget');
    }
  );

  test(
    '[RC-3250] Validate "Add Rewards budget" option on Rewards overview page',
    {
      tag: [REWARD_FEATURE_TAGS.REWARDS_BUDGET_SUMMARY, TestPriority.P0, TestGroupType.REGRESSION],
    },
    async ({ appManagerFixture }) => {
      tagTest(test.info(), {
        description: 'Validate "Add Rewards budget" option on Rewards overview page',
        zephyrTestId: 'RC-3250',
        storyId: 'RC-3250',
      });

      const manageRewardsPage = new ManageRewardsOverviewPage(appManagerFixture.page);

      await Promise.all([
        manageRewardsPage.page.waitForResponse(
          response => response.url().includes('/recognition/admin/rewards') && response.status() === 200
        ),
        manageRewardsPage.loadPage(),
      ]);

      await manageRewardsPage.verifier.waitUntilPageHasNavigatedTo('/manage/recognition/rewards/overview');
      await manageRewardsPage.verifier.verifyTheElementIsVisible(manageRewardsPage.header);
      await manageRewardsPage.rewardsTabHeading.waitFor({
        state: 'attached',
        timeout: 20000,
      });
      if ((await manageRewardsPage.rewardsTabHeading.textContent()) === 'Rewards overview') {
        const _appName = await manageRewardsPage.page.evaluate(() => {
          return (window as any).Simpplr?.Settings?.appName;
        });
        if (await manageRewardsPage.verifier.isTheElementVisible(manageRewardsPage.disableRewardLink)) {
          await manageRewardsPage.disableTheRewards();
        } else {
          console.log('Rewards are already disabled, skipping disable action.');
        }
      }

      await manageRewardsPage.clickOnElement(manageRewardsPage.disabledRewardPeerGiftingContainer, {
        stepInfo: 'Clicking on disabled reward peer gifting container',
      });
      await manageRewardsPage.clickOnElement(manageRewardsPage.disabledRewardRewardsBudgetContainer, {
        stepInfo: 'Clicking on disabled reward rewards budget container',
      });
      await manageRewardsPage.clickOnElement(manageRewardsPage.disabledRewardCurrencyConversionContainer, {
        stepInfo: 'Clicking on disabled reward currency conversion container',
      });
      await manageRewardsPage.clickOnDisabledRewardsAddEditBudgetButton();
      await manageRewardsPage.verifier.verifyTheElementIsVisible(manageRewardsPage.dialogContainerForm.container);
      await manageRewardsPage.verifier.verifyElementContainsText(
        manageRewardsPage.budgetModal.budgetPanelHeader,
        'rewards budget'
      );
      await manageRewardsPage.clickOnElement(manageRewardsPage.dialogContainerForm.cancelButton, {
        stepInfo: 'Clicking on cancel button',
      });
      await manageRewardsPage.verifier.verifyTheElementIsNotVisible(manageRewardsPage.dialogContainerForm.container);

      await Promise.all([
        manageRewardsPage.page.waitForResponse(
          response => response.url().includes('/recognition/admin/rewards') && response.status() === 200
        ),
        manageRewardsPage.loadPage(),
      ]);

      await manageRewardsPage.verifier.waitUntilPageHasNavigatedTo('/manage/recognition/rewards/overview');
      await manageRewardsPage.verifier.verifyTheElementIsVisible(manageRewardsPage.header);
      await manageRewardsPage.rewardsTabHeading.waitFor({
        state: 'attached',
        timeout: 20000,
      });
      if ((await manageRewardsPage.rewardsTabHeading.textContent()) === 'Recognition rewards') {
        await manageRewardsPage.enableTheRewards();
      }
    }
  );
});
