import { expect } from '@playwright/test';
import { REWARD_FEATURE_TAGS, REWARD_SUITE_TAGS } from '@rewards/constants/testTags';
import { rewardTestFixture as test } from '@rewards/fixtures/rewardFixture';
import { ManageRewardsOverviewPage } from '@rewards-pages/manage-rewards/manage-rewards-overview-page';

import { TestPriority } from '@core/constants/testPriority';
import { TestGroupType } from '@core/constants/testType';
import { tagTest } from '@core/utils/testDecorator';

import { PAGE_ENDPOINTS } from '@/src/core';

test.describe('budget Flows', { tag: [REWARD_SUITE_TAGS.MANAGE_REWARD] }, () => {
  test.beforeEach(async ({ appManagerFixture }) => {
    const manageRewardsPage = new ManageRewardsOverviewPage(appManagerFixture.page);
    await manageRewardsPage.loadPage();
    await manageRewardsPage.verifyThePageIsLoaded();
    await manageRewardsPage.enableTheRewardsAndPeerGiftingIfDisabled();
  });

  test(
    '[RC-3052] Validate reward overview Budget Summary tile component',
    {
      tag: [REWARD_FEATURE_TAGS.REWARDS_BUDGET_SUMMARY, TestPriority.P0, TestGroupType.SMOKE, TestGroupType.REGRESSION],
    },
    async ({ appManagerFixture }) => {
      tagTest(test.info(), {
        description: 'Validate reward overview Budget Summary tile component',
        zephyrTestId: 'RC-3052',
        storyId: 'RC-3052',
      });

      const manageRewardsPage = new ManageRewardsOverviewPage(appManagerFixture.page);
      await manageRewardsPage.verifyBudgetSummaryElements();
      const budgetOps = await manageRewardsPage.clickOnAddEditBudgetButton();
      await manageRewardsPage.verifier.verifyTheElementIsVisible(manageRewardsPage.budgetModal.budgetContainer);
      await manageRewardsPage.budgetModal.verifyTheElementsInBudgetModalAreVisible(budgetOps);
      await manageRewardsPage.budgetModal.verifyTheBudgetFrequencyRadioButtons(budgetOps);
      await manageRewardsPage.budgetModal.verifyTheBudgetInputBox();
      await manageRewardsPage.budgetModal.verifyTheFinancialStartDateInputBox();
      await manageRewardsPage.budgetModal.verifyTheBudgetBalance();
    }
  );

  test(
    '[RC-3053] Validate Rewards Overview Points Balance summary tile component',
    {
      tag: [
        REWARD_FEATURE_TAGS.REWARDS_POINT_BALANCE_SUMMARY,
        TestPriority.P0,
        TestGroupType.SMOKE,
        TestGroupType.REGRESSION,
      ],
    },
    async ({ appManagerFixture }) => {
      tagTest(test.info(), {
        description: 'Validate Rewards Overview Points Balance summary tile component',
        zephyrTestId: 'RC-3053',
        storyId: 'RC-3053',
      });

      const manageRewardsPage = new ManageRewardsOverviewPage(appManagerFixture.page);

      await manageRewardsPage.verifier.verifyTheElementIsVisible(manageRewardsPage.pointBalanceSummaryContainer);
      await manageRewardsPage.verifier.verifyTheElementIsVisible(manageRewardsPage.pointBalanceSummaryHeadingIcon);
      await manageRewardsPage.verifier.verifyTheElementIsVisible(manageRewardsPage.pointBalanceSummaryHeadingText);
      await manageRewardsPage.verifier.verifyElementHasText(
        manageRewardsPage.pointBalanceSummaryHeadingText,
        'Point balance summary'
      );

      const pointBalanceSummaryFooterButtonText =
        await manageRewardsPage.pointBalanceSummaryActionBarButton.textContent();
      if (pointBalanceSummaryFooterButtonText === 'Enable peer gifting') {
        await manageRewardsPage.peerGifting.enableThePeerGifting();
        await manageRewardsPage.loadPage();
      }

      await manageRewardsPage.verifier.verifyTheElementIsVisible(manageRewardsPage.pointBalanceSummaryAllowanceLabel);
      await manageRewardsPage.verifier.verifyElementHasText(
        manageRewardsPage.pointBalanceSummaryAllowanceLabel,
        'Allowances'
      );
      await manageRewardsPage.verifier.verifyTheElementIsVisible(
        manageRewardsPage.pointBalanceSummaryAllowanceInfoIcon
      );
      await manageRewardsPage.clickOnElement(manageRewardsPage.pointBalanceSummaryAllowanceInfoIcon, {
        stepInfo: 'Clicking on Allowances info icon',
      });
      await manageRewardsPage.verifier.verifyElementHasText(
        manageRewardsPage.pointBalanceSummaryTooltipText,
        'Allowances refresh on the 1st of every month'
      );
      await manageRewardsPage.clickOnElement(manageRewardsPage.pointBalanceSummaryAllowanceInfoIcon, {
        stepInfo: 'Clicking on Allowances info icon to close tooltip',
        force: true,
      });
      await manageRewardsPage.verifier.verifyTheElementIsVisible(manageRewardsPage.pointBalanceSummaryAllowanceValue);
      await manageRewardsPage.verifier.verifyElementContainsText(
        manageRewardsPage.pointBalanceSummaryAllowanceValue,
        'points'
      );

      await manageRewardsPage.verifier.verifyTheElementIsVisible(
        manageRewardsPage.pointBalanceSummaryUserAllowanceLabel
      );
      await manageRewardsPage.verifier.verifyElementHasText(
        manageRewardsPage.pointBalanceSummaryUserAllowanceLabel,
        'User wallets'
      );
      await manageRewardsPage.verifier.verifyTheElementIsVisible(
        manageRewardsPage.pointBalanceSummaryUserAllowanceInfoIcon
      );
      await manageRewardsPage.clickOnElement(manageRewardsPage.pointBalanceSummaryUserAllowanceInfoIcon, {
        stepInfo: 'Clicking on User wallets info icon',
      });
      const tooltipText = await manageRewardsPage.pointBalanceSummaryTooltipText.allTextContents();
      expect(tooltipText).toContain(
        'Points in user wallets are available to be redeemed for rewards and do not expire.'
      );
      expect(tooltipText).toContain('Includes pending points.');
      await manageRewardsPage.clickOnElement(manageRewardsPage.pointBalanceSummaryUserAllowanceInfoIcon, {
        stepInfo: 'Clicking on User wallets info icon to close tooltip',
        force: true,
      });
      await manageRewardsPage.verifier.verifyTheElementIsVisible(
        manageRewardsPage.pointBalanceSummaryUserAllowanceValue
      );
      await manageRewardsPage.verifier.verifyElementContainsText(
        manageRewardsPage.pointBalanceSummaryUserAllowanceValue,
        'points'
      );

      await manageRewardsPage.verifier.verifyTheElementIsVisible(manageRewardsPage.pointBalanceSummaryActionBarLabel);
      await manageRewardsPage.verifier.verifyTheElementIsVisible(manageRewardsPage.pointBalanceSummaryActionBarButton);
      await manageRewardsPage.verifier.verifyElementHasText(
        manageRewardsPage.pointBalanceSummaryActionBarButton,
        'Edit allowances'
      );

      await manageRewardsPage.clickOnElement(manageRewardsPage.pointBalanceSummaryActionBarButton, {
        stepInfo: 'Clicking on Edit allowances button',
      });
      await manageRewardsPage.verifier.waitUntilPageHasNavigatedTo(PAGE_ENDPOINTS.MANAGE_REWARDS_ALLOWANCE_PAGE);

      await manageRewardsPage.rewardsAllowance.allowanceHeader.waitFor({
        state: 'visible',
        timeout: 20000,
      });
      await manageRewardsPage.loadPage();
      await manageRewardsPage.peerGifting.disableThePeerGifting();
      await manageRewardsPage.loadPage();
      await manageRewardsPage.activityPanelFiltersButton.last().waitFor({
        state: 'attached',
        timeout: 20000,
      });
      await manageRewardsPage.loadPage();
      await manageRewardsPage.verifier.verifyTheElementIsVisible(
        manageRewardsPage.pointBalanceSummaryAllowanceInfoIcon
      );
      const pointBalanceSummaryAllowanceValue = await manageRewardsPage.pointBalanceSummaryAllowanceValue.textContent();
      expect(pointBalanceSummaryAllowanceValue).toContain('0 points');
      await manageRewardsPage.verifier.verifyTheElementIsVisible(manageRewardsPage.pointBalanceSummaryActionBarButton);
      await manageRewardsPage.verifier.verifyElementHasText(
        manageRewardsPage.pointBalanceSummaryActionBarButton,
        'Enable peer gifting'
      );
      await manageRewardsPage.clickOnElement(manageRewardsPage.pointBalanceSummaryActionBarButton, {
        stepInfo: 'Clicking on Enable peer gifting button',
      });
      await manageRewardsPage.peerGifting.enableThePeerGifting();
    }
  );

  test(
    '[RC-3133] Validate tooltips on Rewards Overview Budget Summary tile component',
    {
      tag: [REWARD_FEATURE_TAGS.REWARDS_BUDGET_SUMMARY, TestPriority.P0, TestGroupType.REGRESSION],
    },
    async ({ appManagerFixture }) => {
      tagTest(test.info(), {
        description: 'Validate tooltips on Rewards Overview Budget Summary tile component',
        zephyrTestId: 'RC-3133',
        storyId: 'RC-3133',
      });

      const manageRewardsPage = new ManageRewardsOverviewPage(appManagerFixture.page);

      await manageRewardsPage.loadPage();
      await manageRewardsPage.verifier.verifyTheElementIsVisible(manageRewardsPage.pointBalanceSummaryAllowancePoints);
      await manageRewardsPage.clickOnAddEditBudgetButton();
      await manageRewardsPage.verifier.verifyTheElementIsVisible(manageRewardsPage.budgetModal.budgetContainer);
      await manageRewardsPage.budgetModal.selectTheBudgetFrequency('Annual');
      await manageRewardsPage.fillInElement(manageRewardsPage.budgetModal.budgetPanelInputBox, '99999', {
        stepInfo: 'Filling budget input with 99999',
      });
      await manageRewardsPage.budgetModal.budgetPanelInputBox.blur();
      await manageRewardsPage.clickOnElement(manageRewardsPage.budgetModal.budgetPanelSaveButton, {
        stepInfo: 'Clicking on save button',
      });
      await manageRewardsPage.verifyToastMessageIsVisibleWithText('Saved changes successfully');
      await manageRewardsPage.verifier.verifyTheElementIsVisible(manageRewardsPage.pointBalanceSummaryAllowancePoints);

      const budgetJson = await manageRewardsPage.getTheBudgetApiResponse();

      await manageRewardsPage.validateTheLabelAndTooltip(budgetJson, 'Month spend to date');
      await manageRewardsPage.validateTheLabelAndTooltip(budgetJson, 'budget balance');
    }
  );

  test(
    '[RC-3453] Validate format of annual/quarterly budget field error message',
    {
      tag: [REWARD_FEATURE_TAGS.REWARDS_BUDGET_SUMMARY, TestPriority.P0, TestGroupType.SMOKE, TestGroupType.REGRESSION],
    },
    async ({ appManagerFixture }) => {
      tagTest(test.info(), {
        description: 'Validate format of annual/quarterly budget field error message',
        zephyrTestId: 'RC-3453',
        storyId: 'RC-3453',
      });

      const manageRewardsPage = new ManageRewardsOverviewPage(appManagerFixture.page);

      await Promise.all([
        manageRewardsPage.page.waitForResponse(
          response => response.url().includes('/recognition/admin/rewards') && response.status() === 200
        ),
        manageRewardsPage.loadPage(),
      ]);

      await manageRewardsPage.verifier.waitUntilPageHasNavigatedTo('/manage/recognition/rewards/overview');
      await manageRewardsPage.verifier.verifyTheElementIsVisible(manageRewardsPage.rewardsTabHeading);
      await manageRewardsPage.rewardsTabHeading.waitFor({
        state: 'attached',
        timeout: 20000,
      });
      if ((await manageRewardsPage.rewardsTabHeading.textContent()) === 'Recognition rewards') {
        await manageRewardsPage.enableTheRewards();
      }

      await manageRewardsPage.verifier.verifyTheElementIsVisible(manageRewardsPage.pointBalanceSummaryAllowancePoints);
      await manageRewardsPage.clickOnAddEditBudgetButton();
      await manageRewardsPage.verifier.verifyTheElementIsVisible(manageRewardsPage.budgetModal.budgetContainer);
      await manageRewardsPage.verifier.verifyElementContainsText(
        manageRewardsPage.budgetModal.budgetPanelHeader,
        'rewards budget'
      );

      const budgetTypes = ['Annual', 'Quarterly'] as const;
      for (const budgetType of budgetTypes) {
        await manageRewardsPage.budgetModal.selectTheBudgetFrequency(budgetType);
        await manageRewardsPage.fillInElement(manageRewardsPage.budgetModal.budgetPanelInputBox, '999,999,999', {
          stepInfo: `Filling ${budgetType} budget input with 999,999,999`,
        });
        await manageRewardsPage.budgetModal.budgetPanelInputBox.blur();
        await manageRewardsPage.verifier.verifyElementHasText(
          manageRewardsPage.budgetModal.budgetInputErrorMessage,
          'Please enter a number between 1 and 100,000,000'
        );
      }
    }
  );

  test(
    '[RC-3109] Validate if Budget Exceeded warning is removed when budget is no longer in Deficit',
    {
      tag: [REWARD_FEATURE_TAGS.REWARDS_BUDGET_SUMMARY, TestPriority.P0, TestGroupType.REGRESSION],
    },
    async ({ appManagerFixture }) => {
      tagTest(test.info(), {
        description: 'Validate if Budget Exceeded warning is removed when budget is no longer in Deficit',
        zephyrTestId: 'RC-3109',
        storyId: 'RC-3109',
      });

      const manageRewardsPage = new ManageRewardsOverviewPage(appManagerFixture.page);

      await manageRewardsPage.loadPage();
      await manageRewardsPage.verifier.verifyTheElementIsVisible(manageRewardsPage.pointBalanceSummaryAllowancePoints);
      await manageRewardsPage.clickOnAddEditBudgetButton();
      await manageRewardsPage.verifier.verifyTheElementIsVisible(manageRewardsPage.budgetModal.budgetContainer);
      await manageRewardsPage.budgetModal.selectTheBudgetFrequency('Annual');
      await manageRewardsPage.fillInElement(manageRewardsPage.budgetModal.budgetPanelInputBox, '9999', {
        stepInfo: 'Filling budget input with 9999',
      });
      await manageRewardsPage.budgetModal.budgetPanelInputBox.blur();
      await manageRewardsPage.clickOnElement(manageRewardsPage.budgetModal.budgetPanelSaveButton, {
        stepInfo: 'Clicking on save button',
      });
      await manageRewardsPage.verifyToastMessageIsVisibleWithText('Saved changes successfully');

      await manageRewardsPage.mockTheBudgetApiResponse();

      await manageRewardsPage.exceedBudgetIcon.scrollIntoViewIfNeeded();
      await manageRewardsPage.verifier.verifyTheElementIsVisible(manageRewardsPage.exceedBudgetHeadingText);
      const headingText = await manageRewardsPage.exceedBudgetHeadingText.textContent();
      expect(headingText).toContain('Rewards spend has exceeded your annual budget');
      await manageRewardsPage.verifier.verifyTheElementIsVisible(manageRewardsPage.exceedBudgetDescriptionText);
      const descriptionText = await manageRewardsPage.exceedBudgetDescriptionText.textContent();
      expect(descriptionText).toContain(
        'You may disable peer gifting or adjust allowances to prevent or reduce further spend, or edit your budget'
      );

      await manageRewardsPage.clickOnAddEditBudgetButton();
      await manageRewardsPage.verifier.verifyTheElementIsVisible(manageRewardsPage.budgetModal.budgetContainer);
      await manageRewardsPage.budgetModal.selectTheBudgetFrequency('Remove');
      await manageRewardsPage.clickOnElement(manageRewardsPage.budgetModal.budgetPanelSaveButton, {
        stepInfo: 'Clicking on save button',
      });
      await manageRewardsPage.verifyToastMessageIsVisibleWithText('Saved changes successfully');

      await manageRewardsPage.page.unroute('**/recognition/admin/rewards/analytics/budget');
      await manageRewardsPage.page.reload();

      await manageRewardsPage.verifier.verifyCountOfElementsIsEqualTo(manageRewardsPage.exceedBudgetIcon, 0);
      await manageRewardsPage.verifier.verifyCountOfElementsIsEqualTo(manageRewardsPage.exceedBudgetHeadingText, 0);
      await manageRewardsPage.verifier.verifyCountOfElementsIsEqualTo(manageRewardsPage.exceedBudgetDescriptionText, 0);
    }
  );

  test(
    '[RC-3279] Validate the Remove budget option',
    {
      tag: [REWARD_FEATURE_TAGS.REWARDS_BUDGET_SUMMARY, TestPriority.P0, TestGroupType.REGRESSION],
    },
    async ({ appManagerFixture }) => {
      tagTest(test.info(), {
        description: 'Validate the Remove budget option',
        zephyrTestId: 'RC-3279',
        storyId: 'RC-3279',
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
      if ((await manageRewardsPage.rewardsTabHeading.textContent()) === 'Recognition rewards') {
        await manageRewardsPage.enableTheRewards();
      }

      await manageRewardsPage.verifier.verifyTheElementIsVisible(manageRewardsPage.pointBalanceSummaryAllowancePoints);
      await manageRewardsPage.clickOnAddEditBudgetButton();
      await manageRewardsPage.verifier.verifyTheElementIsVisible(manageRewardsPage.dialogContainerForm.container);

      await manageRewardsPage.budgetModal.selectTheBudgetFrequency('Annual');
      await manageRewardsPage.fillInElement(manageRewardsPage.budgetModal.budgetPanelInputBox, '99999', {
        stepInfo: 'Filling budget input with 99999',
      });
      await manageRewardsPage.budgetModal.budgetPanelInputBox.blur();
      await manageRewardsPage.clickOnElement(manageRewardsPage.budgetModal.budgetPanelSaveButton, {
        stepInfo: 'Clicking on save button',
      });
      await manageRewardsPage.verifier.verifyTheElementIsNotVisible(manageRewardsPage.dialogContainerForm.container);

      await manageRewardsPage.verifier.verifyTheElementIsVisible(manageRewardsPage.pointBalanceSummaryAllowancePoints);
      await manageRewardsPage.clickOnAddEditBudgetButton();
      await manageRewardsPage.verifier.verifyTheElementIsVisible(manageRewardsPage.dialogContainerForm.container);

      await manageRewardsPage.budgetModal.selectTheBudgetFrequency('Remove');
      await manageRewardsPage.verifier.verifyTheElementIsNotVisible(manageRewardsPage.budgetModal.budgetPanelInputBox);
      await manageRewardsPage.clickOnElement(manageRewardsPage.budgetModal.budgetPanelSaveButton, {
        stepInfo: 'Clicking on save button',
      });

      await manageRewardsPage.verifier.verifyTheElementIsVisible(manageRewardsPage.budgetModal.addBudgetButton);
    }
  );

  test(
    "[RC-3262] Validate if 'isBudgetConfigured' flag, is added in rewards config endpoint on rewards overview page",
    {
      tag: [REWARD_FEATURE_TAGS.REWARDS_BUDGET_SUMMARY, TestPriority.P0, TestGroupType.REGRESSION],
    },
    async ({ appManagerFixture }) => {
      tagTest(test.info(), {
        description:
          "Validate if 'isBudgetConfigured' flag, is added in rewards config endpoint on rewards overview page",
        zephyrTestId: 'RC-3262',
        storyId: 'RC-3262',
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
      if ((await manageRewardsPage.rewardsTabHeading.textContent()) === 'Recognition rewards') {
        await manageRewardsPage.enableTheRewards();
      }

      await manageRewardsPage.verifier.verifyTheElementIsVisible(manageRewardsPage.pointBalanceSummaryAllowancePoints);
      await manageRewardsPage.clickOnAddEditBudgetButton();
      await manageRewardsPage.verifier.verifyTheElementIsVisible(manageRewardsPage.dialogContainerForm.container);
      await manageRewardsPage.verifier.verifyElementContainsText(
        manageRewardsPage.budgetModal.budgetPanelHeader,
        'rewards budget'
      );

      await manageRewardsPage.budgetModal.selectTheBudgetFrequency('Annual');
      await manageRewardsPage.fillInElement(manageRewardsPage.budgetModal.budgetPanelInputBox, '99999', {
        stepInfo: 'Filling budget input with 99999',
      });
      await manageRewardsPage.budgetModal.budgetPanelInputBox.blur();
      await manageRewardsPage.clickOnElement(manageRewardsPage.budgetModal.budgetPanelSaveButton, {
        stepInfo: 'Clicking on save button',
      });
      await manageRewardsPage.verifier.verifyTheElementIsNotVisible(manageRewardsPage.dialogContainerForm.container);
      await manageRewardsPage.page.reload();
      const apiResponse = await manageRewardsPage.page.waitForResponse(
        response => response.url().includes('/recognition/admin/rewards') && response.status() === 200
      );

      const body = await apiResponse.json();
      console.log('before remove', body);
      expect(body.isBudgetConfigured).toBe(true);

      await manageRewardsPage.verifier.verifyTheElementIsVisible(manageRewardsPage.pointBalanceSummaryAllowancePoints);
      await manageRewardsPage.clickOnAddEditBudgetButton();
      await manageRewardsPage.verifier.verifyTheElementIsVisible(manageRewardsPage.dialogContainerForm.container);

      await manageRewardsPage.budgetModal.selectTheBudgetFrequency('Remove');
      await manageRewardsPage.verifier.verifyTheElementIsNotVisible(manageRewardsPage.budgetModal.budgetPanelInputBox);
      await manageRewardsPage.clickOnElement(manageRewardsPage.budgetModal.budgetPanelSaveButton, {
        stepInfo: 'Clicking on save button',
      });
      await manageRewardsPage.verifier.verifyTheElementIsNotVisible(manageRewardsPage.dialogContainerForm.container);
      await manageRewardsPage.page.reload();
      const apiResponse2 = await manageRewardsPage.page.waitForResponse(
        response => response.url().includes('/recognition/admin/rewards') && response.status() === 200
      );

      const body2 = await apiResponse2.json();
      console.log('After remove:', body2);
      expect(body2.isBudgetConfigured).toBe(false);

      await manageRewardsPage.verifier.verifyTheElementIsVisible(manageRewardsPage.budgetModal.addBudgetButton);
    }
  );

  test(
    '[RC-3217] Validate Edit Budget flow modal when rewards is enabled',
    {
      tag: [REWARD_FEATURE_TAGS.REWARDS_BUDGET_SUMMARY, TestPriority.P0, TestGroupType.REGRESSION],
    },
    async ({ appManagerFixture }) => {
      tagTest(test.info(), {
        description: 'Validate Edit Budget flow modal when rewards is enabled',
        zephyrTestId: 'RC-3217',
        storyId: 'RC-3217',
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
      if ((await manageRewardsPage.rewardsTabHeading.textContent()) === 'Recognition rewards') {
        await manageRewardsPage.enableTheRewards();
      }

      await manageRewardsPage.verifier.verifyTheElementIsVisible(manageRewardsPage.pointBalanceSummaryAllowancePoints);
      await manageRewardsPage.clickOnAddEditBudgetButton();
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
      await manageRewardsPage.page.reload();

      await manageRewardsPage.verifier.verifyTheElementIsVisible(manageRewardsPage.pointBalanceSummaryAllowancePoints);
      await manageRewardsPage.budgetSummaryAnnualBudgetBalanceValue.last().waitFor({
        state: 'visible',
        timeout: 20000,
      });
      const budgetValue = await manageRewardsPage.budgetSummaryAnnualBudgetBalanceValue.last().textContent();
      const numericValue = budgetValue?.split('/$')[1].replace(/,/g, '').trim();
      expect(numericValue).toContain('99999');

      await manageRewardsPage.clickOnAddEditBudgetButton();
      await manageRewardsPage.verifier.verifyTheElementIsVisible(manageRewardsPage.dialogContainerForm.container);

      await manageRewardsPage.budgetModal.selectTheBudgetFrequency('Quarterly');
      await manageRewardsPage.fillInElement(manageRewardsPage.budgetModal.budgetPanelInputBox, '19999', {
        stepInfo: 'Filling budget input with 19999',
      });
      await manageRewardsPage.budgetModal.budgetPanelInputBox.blur();
      await manageRewardsPage.clickOnElement(manageRewardsPage.budgetModal.budgetPanelSaveButton, {
        stepInfo: 'Clicking on save button',
      });
      await manageRewardsPage.verifier.verifyTheElementIsNotVisible(manageRewardsPage.dialogContainerForm.container);
      await manageRewardsPage.rewardsAllowance.validateToastMessage('Saved changes successfully');
      await manageRewardsPage.page.reload();

      await manageRewardsPage.verifier.verifyTheElementIsVisible(manageRewardsPage.pointBalanceSummaryAllowancePoints);
      await manageRewardsPage.budgetSummaryAnnualBudgetBalanceValue.last().waitFor({
        state: 'visible',
        timeout: 20000,
      });
      const budgetValue2 = await manageRewardsPage.budgetSummaryAnnualBudgetBalanceValue.last().textContent();
      const numericValue2 = budgetValue2?.split('/$')[1].replace(/,/g, '').trim();
      expect(numericValue2).toContain('19999');

      await manageRewardsPage.clickOnAddEditBudgetButton();
      await manageRewardsPage.verifier.verifyTheElementIsVisible(manageRewardsPage.dialogContainerForm.container);

      await manageRewardsPage.selectRadioIfNotSelected(
        manageRewardsPage.budgetModal.budgetBalanceApplicationProRATABudget
      );
      await manageRewardsPage.clickOnElement(manageRewardsPage.budgetModal.budgetPanelSaveButton, {
        stepInfo: 'Clicking on save button',
      });
      await manageRewardsPage.verifier.verifyTheElementIsNotVisible(manageRewardsPage.dialogContainerForm.container);
      await manageRewardsPage.rewardsAllowance.validateToastMessage('Saved changes successfully');
      await manageRewardsPage.page.reload();

      await manageRewardsPage.verifier.verifyTheElementIsVisible(manageRewardsPage.pointBalanceSummaryAllowancePoints);
      await manageRewardsPage.budgetSummaryAnnualBudgetBalanceValue.last().waitFor({
        state: 'visible',
        timeout: 20000,
      });
      const budgetValue3 = await manageRewardsPage.budgetSummaryAnnualBudgetBalanceValue.last().textContent();
      const value = budgetValue3?.split('/')[0].replace(/[$,]/g, '').trim();
      expect(Number(value)).toBeLessThan(19999);

      await manageRewardsPage.clickOnAddEditBudgetButton();
      await manageRewardsPage.verifier.verifyTheElementIsVisible(manageRewardsPage.dialogContainerForm.container);

      await manageRewardsPage.budgetModal.selectTheBudgetFrequency('Remove');
      await manageRewardsPage.clickOnElement(manageRewardsPage.budgetModal.budgetPanelSaveButton, {
        stepInfo: 'Clicking on save button',
      });
      await manageRewardsPage.verifier.verifyTheElementIsNotVisible(manageRewardsPage.dialogContainerForm.container);
      await manageRewardsPage.rewardsAllowance.validateToastMessage('Saved changes successfully');
      await manageRewardsPage.verifier.verifyTheElementIsVisible(manageRewardsPage.budgetSummaryActionBarButton);
    }
  );

  test(
    '[RC-3045] Validate the Add Budget flow modal when rewards is enabled',
    {
      tag: [REWARD_FEATURE_TAGS.REWARDS_BUDGET_SUMMARY, TestPriority.P0, TestGroupType.REGRESSION],
    },
    async ({ appManagerFixture }) => {
      tagTest(test.info(), {
        description: 'Validate the Add Budget flow modal when rewards is enabled',
        zephyrTestId: 'RC-3045',
        storyId: 'RC-3045',
      });

      const manageRewardsPage = new ManageRewardsOverviewPage(appManagerFixture.page);
      const customBudget = manageRewardsPage.getRandomNo(50000, 99999);

      await manageRewardsPage.clickOnAddEditBudgetButton();
      await manageRewardsPage.verifier.verifyTheElementIsVisible(manageRewardsPage.dialogContainerForm.container);
      await manageRewardsPage.verifier.verifyElementContainsText(
        manageRewardsPage.budgetModal.budgetPanelHeader,
        'rewards budget'
      );
      await manageRewardsPage.budgetModal.fillAndSaveBudget('Annual', String(customBudget));
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

      await manageRewardsPage.clickOnAddEditBudgetButton();
      await manageRewardsPage.verifier.verifyTheElementIsVisible(manageRewardsPage.dialogContainerForm.container);
      if (await manageRewardsPage.budgetModal.budgetPanelRemoveRadioInputBox.isEnabled({ timeout: 5000 })) {
        await manageRewardsPage.verifier.verifyElementContainsText(
          manageRewardsPage.budgetModal.budgetPanelHeader,
          'rewards budget'
        );
        await manageRewardsPage.budgetModal.fillAndSaveBudget('Remove');
        await manageRewardsPage.verifier.verifyTheElementIsNotVisible(manageRewardsPage.dialogContainerForm.container);
        await manageRewardsPage.rewardsAllowance.validateToastMessage('Saved changes successfully');
        await manageRewardsPage.verifier.verifyTheElementIsVisible(manageRewardsPage.budgetModal.addBudgetButton);
      } else {
        await manageRewardsPage.clickOnElement(manageRewardsPage.dialogContainerForm.cancelButton, {
          stepInfo: 'Clicking on cancel button',
        });
      }
    }
  );

  test(
    '[RC-3046] Validate the Add /Edit rewards budget flow modal',
    {
      tag: [REWARD_FEATURE_TAGS.REWARDS_BUDGET_SUMMARY, TestPriority.P0, TestGroupType.REGRESSION],
    },
    async ({ appManagerFixture }) => {
      tagTest(test.info(), {
        description: 'Validate the Add /Edit rewards budget flow modal',
        zephyrTestId: 'RC-3046',
        storyId: 'RC-3046',
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

      const newCustomBudget = manageRewardsPage.getRandomNo(50000, 99999, customBudget);
      await manageRewardsPage.clickOnAddEditBudgetButton();
      await manageRewardsPage.verifier.verifyTheElementIsVisible(manageRewardsPage.dialogContainerForm.container);
      await manageRewardsPage.verifier.verifyElementContainsText(
        manageRewardsPage.budgetModal.budgetPanelHeader,
        'rewards budget'
      );
      await manageRewardsPage.budgetModal.selectTheBudgetFrequency('Quarterly');
      await manageRewardsPage.fillInElement(
        manageRewardsPage.budgetModal.budgetPanelInputBox,
        String(newCustomBudget),
        {
          stepInfo: 'Filling budget input with new custom budget',
        }
      );
      await manageRewardsPage.budgetModal.budgetPanelInputBox.blur();
      await manageRewardsPage.clickOnElement(manageRewardsPage.budgetModal.budgetPanelSaveButton, {
        stepInfo: 'Clicking on save button',
      });
      await manageRewardsPage.verifier.verifyTheElementIsNotVisible(manageRewardsPage.dialogContainerForm.container);
      await manageRewardsPage.rewardsAllowance.validateToastMessage('Saved changes successfully');
      await manageRewardsPage.page.reload();
      const apiResponse2 = await manageRewardsPage.page.waitForResponse(
        response => response.url().includes('/recognition/admin/rewards') && response.status() === 200
      );
      const body2 = await apiResponse2.json();
      console.log('before remove', body2);
      expect(body2.isBudgetConfigured).toBe(true);

      await manageRewardsPage.verifier.verifyTheElementIsVisible(manageRewardsPage.pointBalanceSummaryAllowancePoints);
      await manageRewardsPage.budgetSummaryAnnualBudgetBalanceValue.last().waitFor({
        state: 'visible',
        timeout: 20000,
      });
      const budgetValue2 = await manageRewardsPage.budgetSummaryAnnualBudgetBalanceValue.last().textContent();
      const numericValue2 = budgetValue2?.split('/$')[1].replace(/,/g, '').trim();
      expect(numericValue2).toContain(String(newCustomBudget));

      await manageRewardsPage.clickOnAddEditBudgetButton();
      await manageRewardsPage.verifier.verifyTheElementIsVisible(manageRewardsPage.dialogContainerForm.container);
      if (await manageRewardsPage.budgetModal.budgetPanelRemoveRadioInputBox.isEnabled({ timeout: 5000 })) {
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
        await manageRewardsPage.verifier.verifyTheElementIsVisible(manageRewardsPage.budgetModal.addBudgetButton);
      } else {
        await manageRewardsPage.clickOnElement(manageRewardsPage.dialogContainerForm.cancelButton, {
          stepInfo: 'Clicking on cancel button',
        });
      }
    }
  );

  test(
    '[RC-3132] Validate if Budget summary component gets highlighted when Budget Exceeds',
    {
      tag: [REWARD_FEATURE_TAGS.REWARDS_BUDGET_SUMMARY, TestPriority.P0, TestGroupType.REGRESSION],
    },
    async ({ appManagerFixture }) => {
      tagTest(test.info(), {
        description: 'Validate if Budget summary component gets highlighted when Budget Exceeds',
        zephyrTestId: 'RC-3132',
        storyId: 'RC-3132',
      });

      const manageRewardsPage = new ManageRewardsOverviewPage(appManagerFixture.page);

      await manageRewardsPage.loadPage();
      await manageRewardsPage.verifier.verifyTheElementIsVisible(manageRewardsPage.pointBalanceSummaryAllowancePoints);
      await manageRewardsPage.clickOnAddEditBudgetButton();
      await manageRewardsPage.verifier.verifyTheElementIsVisible(manageRewardsPage.budgetModal.budgetContainer);
      await manageRewardsPage.budgetModal.selectTheBudgetFrequency('Annual');
      await manageRewardsPage.fillInElement(manageRewardsPage.budgetModal.budgetPanelInputBox, '99999', {
        stepInfo: 'Filling budget input with 99999',
      });
      await manageRewardsPage.budgetModal.budgetPanelInputBox.blur();
      await manageRewardsPage.clickOnElement(manageRewardsPage.budgetModal.budgetPanelSaveButton, {
        stepInfo: 'Clicking on save button',
      });
      await manageRewardsPage.rewardsAllowance.validateToastMessage('Saved changes successfully');

      await manageRewardsPage.mockTheBudgetApiResponse();

      await manageRewardsPage.page.reload();
      await manageRewardsPage.budgetSummaryTileContainer.waitFor({
        state: 'attached',
        timeout: 25000,
      });
      await manageRewardsPage.verifier.verifyElementHasClass(
        manageRewardsPage.budgetSummaryTileContainer,
        /SummaryPanel_hasWarning/
      );

      await manageRewardsPage.page.unroute('**/recognition/admin/rewards/analytics/budget');
      await manageRewardsPage.page.reload();
      await manageRewardsPage.budgetSummaryTileContainer.waitFor({
        state: 'attached',
        timeout: 25000,
      });
      await manageRewardsPage.verifier.verifyElementDoesNotHaveClass(
        manageRewardsPage.budgetSummaryTileContainer,
        /SummaryPanel_hasWarning/
      );
    }
  );

  test(
    '[RC-3255] Validate current total spent endpoint in Add/Edit Budget dialog',
    {
      tag: [REWARD_FEATURE_TAGS.REWARDS_BUDGET_SUMMARY, TestPriority.P0, TestGroupType.REGRESSION],
    },
    async ({ appManagerFixture }) => {
      tagTest(test.info(), {
        description: 'Validate current total spent endpoint in Add/Edit Budget dialog',
        zephyrTestId: 'RC-3255',
        storyId: 'RC-3255',
      });

      const manageRewardsPage = new ManageRewardsOverviewPage(appManagerFixture.page);

      await manageRewardsPage.verifier.waitUntilPageHasNavigatedTo('/manage/recognition/rewards/overview');
      await manageRewardsPage.verifier.verifyTheElementIsVisible(manageRewardsPage.header);

      let newBudget: string;
      const responsePredicate = (resp: any) =>
        resp.url().includes('/recognition/admin/rewards/analytics/budget/balance') && resp.status() === 200;

      const [resp] = await Promise.all([
        manageRewardsPage.page.waitForResponse(responsePredicate, { timeout: 30000 }),
        manageRewardsPage.clickOnAddEditBudgetButton(),
      ]);
      const json = await resp.json();
      const monthlySpent = Number(json?.result?.spentUsdAmount);
      console.log('monthlySpent (USD):', monthlySpent);
      expect(Number.isFinite(monthlySpent)).toBeTruthy();

      await manageRewardsPage.verifier.verifyTheElementIsVisible(manageRewardsPage.budgetModal.budgetContainer);
      await manageRewardsPage.budgetModal.selectTheBudgetFrequency('Annual');
      newBudget = (monthlySpent - 1).toFixed(0);
      await manageRewardsPage.fillInElement(manageRewardsPage.budgetModal.budgetPanelInputBox, newBudget, {
        stepInfo: 'Filling budget input with monthlySpent - 1',
      });
      await manageRewardsPage.budgetModal.budgetPanelInputBox.blur();
      await manageRewardsPage.verifier.verifyTheElementIsVisible(manageRewardsPage.budgetModal.budgetInputErrorMessage);
      newBudget = (monthlySpent + 2).toFixed(0);
      await manageRewardsPage.fillInElement(manageRewardsPage.budgetModal.budgetPanelInputBox, newBudget, {
        stepInfo: 'Filling budget input with monthlySpent + 2',
      });
      await manageRewardsPage.budgetModal.budgetPanelInputBox.blur();
      await manageRewardsPage.verifier.verifyTheElementIsNotVisible(
        manageRewardsPage.budgetModal.budgetInputErrorMessage
      );
      await manageRewardsPage.clickOnElement(manageRewardsPage.budgetModal.budgetPanelSaveButton, {
        stepInfo: 'Clicking on save button',
      });

      await manageRewardsPage.budgetSummaryAnnualBudgetBalanceValue.last().waitFor({ state: 'attached' });
      const budgetValue = await manageRewardsPage.budgetSummaryAnnualBudgetBalanceValue.last().textContent();
      const numericValue = budgetValue?.split('/$')[1].replace(/,/g, '').trim();
      expect(numericValue).toContain(newBudget);
    }
  );

  test(
    '[RC-3055] Validate the Pro-rata budget value for Annual And Quarterly Budget',
    {
      tag: [REWARD_FEATURE_TAGS.REWARDS_BUDGET_SUMMARY, TestPriority.P0, TestGroupType.REGRESSION],
    },
    async ({ appManagerFixture }) => {
      tagTest(test.info(), {
        description: 'Validate the Pro-rata budget value for Annual And Quarterly Budget',
        zephyrTestId: 'RC-3055',
        storyId: 'RC-3055',
      });

      const manageRewardsPage = new ManageRewardsOverviewPage(appManagerFixture.page);

      await manageRewardsPage.verifier.waitUntilPageHasNavigatedTo('/manage/recognition/rewards/overview');
      await manageRewardsPage.verifier.verifyTheElementIsVisible(manageRewardsPage.header);

      const responsePredicate = (resp: any) =>
        resp.url().includes('/recognition/admin/rewards/analytics/budget/balance') && resp.status() === 200;

      const [resp] = await Promise.all([
        manageRewardsPage.page.waitForResponse(responsePredicate, { timeout: 30000 }),
        manageRewardsPage.clickOnAddEditBudgetButton(),
      ]);
      const json = await resp.json();
      const monthlySpent = Number(Math.floor(json?.result?.spentUsdAmount));
      console.log('monthlySpent (USD):', monthlySpent);
      expect(Number.isFinite(monthlySpent)).toBeTruthy();

      await manageRewardsPage.budgetModal.selectTheBudgetFrequency('Annual');
      await manageRewardsPage.fillInElement(
        manageRewardsPage.budgetModal.budgetPanelInputBox,
        String(monthlySpent + 1),
        {
          stepInfo: 'Filling budget input with monthlySpent + 1',
        }
      );
      await manageRewardsPage.budgetModal.budgetPanelInputBox.blur();
      await manageRewardsPage.verifier.verifyTheElementIsNotVisible(
        manageRewardsPage.budgetModal.budgetInputErrorMessage
      );

      const currentlySelectedMonthAndDate: number[] = await manageRewardsPage.setFinancialYearStartDate('future');
      await manageRewardsPage.selectRadioIfNotSelected(
        manageRewardsPage.budgetModal.budgetBalanceApplicationProRATABudget
      );
      const [selectedMonth, selectedDay] = currentlySelectedMonthAndDate;
      const remainingDays = await manageRewardsPage.daysUntilSelectedUTC(selectedMonth, selectedDay);
      const totalDays = 365;
      const expectedProRata = Math.round((monthlySpent + 1) * (remainingDays / totalDays));
      const proRataText = await manageRewardsPage.budgetModal.proRataValue.inputValue();
      const proRataValue = Number(proRataText.replace(/[^0-9.]/g, ''));
      expect(Math.abs(proRataValue - expectedProRata)).toBeLessThanOrEqual(1);
      expect(proRataValue).toEqual(expectedProRata);

      const currentlySelectedMonthAndDatePast: number[] = await manageRewardsPage.setFinancialYearStartDate('past');
      await manageRewardsPage.selectRadioIfNotSelected(
        manageRewardsPage.budgetModal.budgetBalanceApplicationProRATABudget
      );
      const [selectedMonthPast, selectedDayPast] = currentlySelectedMonthAndDatePast;
      const remainingDaysPast = await manageRewardsPage.daysUntilSelectedUTC(selectedMonthPast, selectedDayPast);
      const totalDaysPast = 365;
      const expectedProRataPast = Math.round((monthlySpent + 1) * (remainingDaysPast / totalDaysPast));
      const proRataTextPast = await manageRewardsPage.budgetModal.proRataValue.inputValue();
      const proRataValuePast = Number(proRataTextPast.replace(/[^0-9.]/g, ''));
      expect(Math.abs(proRataValuePast - expectedProRataPast)).toBeLessThanOrEqual(1);
      expect(proRataValuePast).toEqual(expectedProRataPast);

      await manageRewardsPage.budgetModal.selectTheBudgetFrequency('Quarterly');
      await manageRewardsPage.fillInElement(
        manageRewardsPage.budgetModal.budgetPanelInputBox,
        String(monthlySpent + 1),
        {
          stepInfo: 'Filling budget input with monthlySpent + 1 for quarterly',
        }
      );
      await manageRewardsPage.budgetModal.budgetPanelInputBox.blur();
      await manageRewardsPage.verifier.verifyTheElementIsNotVisible(
        manageRewardsPage.budgetModal.budgetInputErrorMessage
      );

      const [selectedMonthQuarterly, selectedDayQuarterly] = await manageRewardsPage.setFinancialYearStartDate('past');
      await manageRewardsPage.selectRadioIfNotSelected(
        manageRewardsPage.budgetModal.budgetBalanceApplicationProRATABudget
      );
      const { totalDays: totalDaysQuarterly, remainingDays: remainingDaysQuarterly } =
        await manageRewardsPage.calculateQuarterDates(selectedMonthQuarterly, selectedDayQuarterly);
      const expectedQuarterProRata = Math.round((monthlySpent + 1) * (remainingDaysQuarterly / totalDaysQuarterly));
      const proRataTextQuarterly = await manageRewardsPage.budgetModal.proRataValue.inputValue();
      const proRataValueQuarterly = Number(proRataTextQuarterly.replace(/[^0-9.]/g, ''));
      expect(proRataValueQuarterly).toEqual(expectedQuarterProRata);

      const [selectedMonthQuarterlyFuture, selectedDayQuarterlyFuture] =
        await manageRewardsPage.setFinancialYearStartDate('future');
      await manageRewardsPage.selectRadioIfNotSelected(
        manageRewardsPage.budgetModal.budgetBalanceApplicationProRATABudget
      );
      const { totalDays: totalDaysQuarterlyFuture, remainingDays: remainingDaysQuarterlyFuture } =
        await manageRewardsPage.calculateQuarterDates(selectedMonthQuarterlyFuture, selectedDayQuarterlyFuture);
      const expectedQuarterProRataFuture = Math.round(
        (monthlySpent + 1) * (remainingDaysQuarterlyFuture / totalDaysQuarterlyFuture)
      );
      const proRataTextQuarterlyFuture = await manageRewardsPage.budgetModal.proRataValue.inputValue();
      const proRataValueQuarterlyFuture = Number(proRataTextQuarterlyFuture.replace(/[^0-9.]/g, ''));
      expect(proRataValueQuarterlyFuture).toEqual(expectedQuarterProRataFuture);
    }
  );
});
