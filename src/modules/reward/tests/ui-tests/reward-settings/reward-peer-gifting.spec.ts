import { expect } from '@playwright/test';
import { REWARD_FEATURE_TAGS, REWARD_SUITE_TAGS } from '@rewards/constants/testTags';
import { rewardTestFixture as test } from '@rewards/fixtures/rewardFixture';
import { GiveRecognitionDialogBox } from '@rewards-components/recognition/give-recognition-dialog-box';
import { ManageRewardsOverviewPage } from '@rewards-pages/manage-rewards/manage-rewards-overview-page';
import { RecognitionHubPage } from '@rewards-pages/recognition-hub/recognition-hub-page';

import { TestPriority } from '@core/constants/testPriority';
import { TestGroupType } from '@core/constants/testType';
import { tagTest } from '@core/utils/testDecorator';

test.describe('manage rewards', { tag: [REWARD_SUITE_TAGS.MANAGE_REWARD] }, () => {
  test.beforeEach(async ({ appManagerFixture }) => {
    const manageRewardsPage = new ManageRewardsOverviewPage(appManagerFixture.page);
    await manageRewardsPage.loadPage();
    await manageRewardsPage.verifyThePageIsLoaded();
    await manageRewardsPage.enableTheRewardsAndPeerGiftingIfDisabled();
  });

  test(
    '[RC-3234] Validate if peerGiftingEnabled flag, is added in rewards config endpoint on rewards overview page',
    {
      tag: [TestGroupType.REGRESSION, REWARD_FEATURE_TAGS.REWARDS_PEER_GIFTING, TestPriority.P0],
    },
    async ({ appManagerFixture }) => {
      tagTest(test.info(), {
        description:
          'Validate if peerGiftingEnabled flag, is added in rewards config endpoint on rewards overview page',
        zephyrTestId: 'RC-3234',
        storyId: 'RC-3234',
      });

      const manageRewardsPage = new ManageRewardsOverviewPage(appManagerFixture.page);
      await expect(manageRewardsPage.page).toHaveURL('/manage/recognition/rewards/overview');
      await manageRewardsPage.verifyThePageIsLoaded();

      // Disable peer gifting
      await manageRewardsPage.peerGifting.disableThePeerGifting();

      // Validate peerGiftingEnabled is false when disabled
      await manageRewardsPage.page.reload();
      const apiResponse = await manageRewardsPage.page.waitForResponse(
        response => response.url().includes('/recognition/admin/rewards') && response.status() === 200
      );
      const body = await apiResponse.json();
      console.log('After disabling the peer gifting', body);
      expect(body.peerGiftingEnabled).toBe(false);

      // Enable peer gifting with immediately
      await manageRewardsPage.peerGifting.loadPage();
      await manageRewardsPage.peerGifting.peerGiftingHeading.waitFor({
        state: 'visible',
        timeout: 20000,
      });
      await manageRewardsPage.peerGifting.peerGiftingToggleSwitch.click();
      await manageRewardsPage.peerGifting.saveButton.click();
      await manageRewardsPage.peerGifting.selectThePeerGiftingEnableType('Immediately');
      await manageRewardsPage.peerGifting.grantAllowancesConfirmButton.click();
      await manageRewardsPage.verifyToastMessageIsVisibleWithText('Saved changes successfully');
      await manageRewardsPage.loadPage();

      // Validate peerGiftingEnabled is true when enabled
      await manageRewardsPage.page.reload();
      const apiResponse2 = await manageRewardsPage.page.waitForResponse(
        response => response.url().includes('/recognition/admin/rewards') && response.status() === 200
      );
      const body2 = await apiResponse2.json();
      console.log('After enabling the peer gifting', body2);
      expect(body2.peerGiftingEnabled).toBe(true);
    }
  );

  test(
    '[RC-2485] Verify peer gifting warning message when peer gifting option is not configured',
    {
      tag: [TestGroupType.REGRESSION, REWARD_FEATURE_TAGS.REWARDS_PEER_GIFTING, TestPriority.P0],
    },
    async ({ appManagerFixture }) => {
      tagTest(test.info(), {
        description: 'Verify peer gifting warning message when peer gifting option is not configured',
        zephyrTestId: 'RC-2485',
        storyId: 'RC-2485',
      });

      const manageRewardsPage = new ManageRewardsOverviewPage(appManagerFixture.page);
      await expect(manageRewardsPage.page).toHaveURL('/manage/recognition/rewards/overview');
      await manageRewardsPage.verifyThePageIsLoaded();

      // Test disabled peer gifting with no allowances and gifting options
      await manageRewardsPage.peerGifting.mockThePeerGiftingApiResponse(true, false, false);
      await manageRewardsPage.peerGifting.loadPage();
      await expect(manageRewardsPage.peerGifting.addGiftingOptionsAndAllowancesError).toBeVisible();
      await expect(manageRewardsPage.peerGifting.addGiftingOptionsAndAllowancesError).toHaveText(
        'You need to add gifting options and allowances to enable peer gifting'
      );
      await expect(manageRewardsPage.peerGifting.giftingOptionsRequiredError).toBeVisible();
      await expect(manageRewardsPage.peerGifting.allowancesRequiredError).toBeVisible();
      await expect(manageRewardsPage.peerGifting.peerGiftingToggleSwitch).not.toBeEnabled();
      await manageRewardsPage.peerGifting.removePeerGiftingApiMock();

      // Test disabled peer gifting with no gifting options
      await manageRewardsPage.peerGifting.mockThePeerGiftingApiResponse(true, false, true);
      await manageRewardsPage.peerGifting.loadPage();
      await expect(manageRewardsPage.peerGifting.addGiftingOptionsError).toBeVisible();
      await expect(manageRewardsPage.peerGifting.addGiftingOptionsError).toHaveText(
        'You need to add gifting options to enable peer gifting'
      );
      await expect(manageRewardsPage.peerGifting.giftingOptionsRequiredError).toBeVisible();
      await expect(manageRewardsPage.peerGifting.allowancesRequiredError).not.toBeVisible();
      await expect(manageRewardsPage.peerGifting.peerGiftingToggleSwitch).not.toBeEnabled();
      await manageRewardsPage.peerGifting.removePeerGiftingApiMock();

      // Test disabled peer gifting with no allowances
      await manageRewardsPage.peerGifting.mockThePeerGiftingApiResponse(true, true, false);
      await manageRewardsPage.peerGifting.loadPage();
      await expect(manageRewardsPage.peerGifting.addAllowancesError).toBeVisible();
      await expect(manageRewardsPage.peerGifting.addAllowancesError).toHaveText(
        'You need to add allowances to enable peer gifting'
      );
      await expect(manageRewardsPage.peerGifting.giftingOptionsRequiredError).not.toBeVisible();
      await expect(manageRewardsPage.peerGifting.allowancesRequiredError).toBeVisible();
      await expect(manageRewardsPage.peerGifting.peerGiftingToggleSwitch).not.toBeEnabled();
      await manageRewardsPage.peerGifting.removePeerGiftingApiMock();
    }
  );

  test(
    '[RC-2199] Validate peer gifting on Overview UI',
    {
      tag: [TestGroupType.REGRESSION, REWARD_FEATURE_TAGS.REWARDS_PEER_GIFTING, TestPriority.P0],
    },
    async ({ appManagerFixture }) => {
      tagTest(test.info(), {
        description: 'Validate peer gifting on Overview UI',
        zephyrTestId: 'RC-2199',
        storyId: 'RC-2199',
      });

      const manageRewardsPage = new ManageRewardsOverviewPage(appManagerFixture.page);
      const rewardApiPromise = manageRewardsPage.page.waitForResponse(
        response => response.url().includes('/recognition/admin/rewards') && response.status() === 200
      );
      await manageRewardsPage.loadPage();
      await rewardApiPromise;

      if ((await manageRewardsPage.rewardsTabHeading.textContent()) === 'Recognition rewards') {
        await manageRewardsPage.clickOnElement(manageRewardsPage.enableRewardsButton, {
          stepInfo: 'Clicking on enable rewards button',
        });
        await manageRewardsPage.verifyToastMessageIsVisibleWithText('Rewards enabled');
      }

      // Disable peer gifting
      await manageRewardsPage.peerGifting.loadPage();
      await manageRewardsPage.peerGifting.peerGiftingHeading.waitFor({
        state: 'visible',
        timeout: 20000,
      });
      await manageRewardsPage.peerGifting.peerGiftingToggleSwitch.click();
      await manageRewardsPage.peerGifting.saveButton.click();
      await expect(manageRewardsPage.peerGifting.disableDialog).toBeVisible();
      await expect(manageRewardsPage.peerGifting.disableDialogTitle).toHaveText('Disable peer gifting');
      await expect(manageRewardsPage.peerGifting.disableDialogConfirmText).toHaveText(
        'Are you sure you want to disable peer gifting?'
      );
      await expect(manageRewardsPage.peerGifting.disableDialogDescriptionText).toHaveText(
        'Users will lose their monthly allowances and will no longer be able to gift points via peer recognition.'
      );
      await expect(manageRewardsPage.peerGifting.disableDialogCancelButton).toBeVisible();
      await expect(manageRewardsPage.peerGifting.disableDialogDisableButton).toBeVisible();
      await manageRewardsPage.peerGifting.disableDialogDisableButton.click();
      await manageRewardsPage.verifyToastMessageIsVisibleWithText('Saved changes successfully');

      // Enable peer gifting
      await manageRewardsPage.peerGifting.loadPage();
      await manageRewardsPage.peerGifting.peerGiftingHeading.waitFor({
        state: 'visible',
        timeout: 20000,
      });
      await manageRewardsPage.peerGifting.peerGiftingToggleSwitch.click();
      await manageRewardsPage.peerGifting.saveButton.click();
      await manageRewardsPage.peerGifting.selectThePeerGiftingEnableType('Immediately');
      await manageRewardsPage.peerGifting.grantAllowancesConfirmButton.click();
      await manageRewardsPage.verifyToastMessageIsVisibleWithText('Saved changes successfully');
      await manageRewardsPage.loadPage();
    }
  );

  test(
    '[RC-2264] Validate peer gifting flow',
    {
      tag: [TestGroupType.REGRESSION, REWARD_FEATURE_TAGS.REWARDS_PEER_GIFTING, TestPriority.P0],
    },
    async ({ appManagerFixture }) => {
      tagTest(test.info(), {
        description: 'Validate peer gifting flow',
        zephyrTestId: 'RC-2264',
        storyId: 'RC-2264',
      });

      const manageRewardsPage = new ManageRewardsOverviewPage(appManagerFixture.page);
      await expect(manageRewardsPage.page).toHaveURL('/manage/recognition/rewards/overview');
      await manageRewardsPage.verifyThePageIsLoaded();

      // Test disabled peer gifting with no allowances and gifting options
      await manageRewardsPage.peerGifting.mockThePeerGiftingApiResponse(false, false, false);
      await manageRewardsPage.peerGifting.loadPage();
      await manageRewardsPage.peerGifting.verifyThePageIsLoaded();
      await expect(manageRewardsPage.peerGifting.addGiftingOptionsAndAllowancesError).toBeVisible();
      await expect(manageRewardsPage.peerGifting.addGiftingOptionsAndAllowancesError).toHaveText(
        'You need to add gifting options and allowances to enable peer gifting'
      );
      await expect(manageRewardsPage.peerGifting.giftingOptionsRequiredError).toBeVisible();
      await expect(manageRewardsPage.peerGifting.allowancesRequiredError).toBeVisible();
      await expect(manageRewardsPage.peerGifting.peerGiftingToggleSwitch).not.toBeEnabled();
      await manageRewardsPage.peerGifting.removePeerGiftingApiMock();

      // Test disabled peer gifting with no gifting options
      await manageRewardsPage.peerGifting.mockThePeerGiftingApiResponse(false, false, true);
      await manageRewardsPage.peerGifting.loadPage();
      await manageRewardsPage.peerGifting.verifyThePageIsLoaded();
      await expect(manageRewardsPage.peerGifting.addGiftingOptionsError).toBeVisible();
      await expect(manageRewardsPage.peerGifting.addGiftingOptionsError).toHaveText(
        'You need to add gifting options to enable peer gifting'
      );
      await expect(manageRewardsPage.peerGifting.giftingOptionsRequiredError).toBeVisible();
      await expect(manageRewardsPage.peerGifting.allowancesRequiredError).not.toBeVisible();
      await expect(manageRewardsPage.peerGifting.peerGiftingToggleSwitch).not.toBeEnabled();
      await manageRewardsPage.peerGifting.removePeerGiftingApiMock();

      // Test disabled peer gifting with no allowances
      await manageRewardsPage.peerGifting.mockThePeerGiftingApiResponse(false, true, false);
      await manageRewardsPage.peerGifting.loadPage();
      await manageRewardsPage.peerGifting.verifyThePageIsLoaded();
      await expect(manageRewardsPage.peerGifting.addAllowancesError).toBeVisible();
      await expect(manageRewardsPage.peerGifting.addAllowancesError).toHaveText(
        'You need to add allowances to enable peer gifting'
      );
      await expect(manageRewardsPage.peerGifting.giftingOptionsRequiredError).not.toBeVisible();
      await expect(manageRewardsPage.peerGifting.allowancesRequiredError).toBeVisible();
      await expect(manageRewardsPage.peerGifting.peerGiftingToggleSwitch).not.toBeEnabled();
      await manageRewardsPage.peerGifting.removePeerGiftingApiMock();

      // Test enabled peer gifting with gifting options and allowances
      await manageRewardsPage.peerGifting.mockThePeerGiftingApiResponse(true, true, true);
      await manageRewardsPage.peerGifting.loadPage();
      await manageRewardsPage.peerGifting.verifyThePageIsLoaded();
      await expect(manageRewardsPage.peerGifting.addGiftingOptionsAndAllowancesError).not.toBeVisible();
      await expect(manageRewardsPage.peerGifting.addGiftingOptionsError).not.toBeVisible();
      await expect(manageRewardsPage.peerGifting.addAllowancesError).not.toBeVisible();
      await expect(manageRewardsPage.peerGifting.giftingOptionsRequiredError).not.toBeVisible();
      await expect(manageRewardsPage.peerGifting.allowancesRequiredError).not.toBeVisible();
      await expect(manageRewardsPage.peerGifting.peerGiftingToggleSwitch).toBeEnabled();

      // Validate gifting options and allowances panels
      await expect(manageRewardsPage.peerGifting.giftingOptionsPanel).toBeVisible();
      await expect(manageRewardsPage.peerGifting.allowancePanel).toBeVisible();
      await expect(manageRewardsPage.peerGifting.giftingOptionGreenTick).toBeVisible();
      await expect(manageRewardsPage.peerGifting.allowanceGreenTick).toBeVisible();
      await expect(manageRewardsPage.peerGifting.giftingOptionIcon).toBeVisible();
      await expect(manageRewardsPage.peerGifting.AllowanceIcon).toBeVisible();
      await manageRewardsPage.peerGifting.removePeerGiftingApiMock();
    }
  );

  test(
    '[RC-3347] Validate Enable peer gifting option when rewards is live',
    {
      tag: [TestGroupType.REGRESSION, REWARD_FEATURE_TAGS.REWARDS_PEER_GIFTING, TestPriority.P0],
    },
    async ({ appManagerFixture }) => {
      tagTest(test.info(), {
        description: 'Validate Enable peer gifting option when rewards is live',
        zephyrTestId: 'RC-3347',
        storyId: 'RC-3347',
      });

      const manageRewardsPage = new ManageRewardsOverviewPage(appManagerFixture.page);
      const recognitionHub = new RecognitionHubPage(appManagerFixture.page);
      const giveRecognitionModal = new GiveRecognitionDialogBox(appManagerFixture.page);

      await expect(manageRewardsPage.page).toHaveURL('/manage/recognition/rewards/overview');
      await manageRewardsPage.verifyThePageIsLoaded();

      // Disable peer gifting
      await manageRewardsPage.peerGifting.loadPage();
      await manageRewardsPage.peerGifting.peerGiftingHeading.waitFor({
        state: 'visible',
        timeout: 20000,
      });
      await manageRewardsPage.peerGifting.peerGiftingToggleSwitch.click();
      await manageRewardsPage.peerGifting.saveButton.click();
      await expect(manageRewardsPage.peerGifting.disableDialog).toBeVisible();
      await expect(manageRewardsPage.peerGifting.disableDialogTitle).toHaveText('Disable peer gifting');
      await expect(manageRewardsPage.peerGifting.disableDialogConfirmText).toHaveText(
        'Are you sure you want to disable peer gifting?'
      );
      await expect(manageRewardsPage.peerGifting.disableDialogDescriptionText).toHaveText(
        'Users will lose their monthly allowances and will no longer be able to gift points via peer recognition.'
      );
      await expect(manageRewardsPage.peerGifting.disableDialogCancelButton).toBeVisible();
      await expect(manageRewardsPage.peerGifting.disableDialogDisableButton).toBeVisible();
      await manageRewardsPage.peerGifting.disableDialogDisableButton.click();
      await manageRewardsPage.verifyToastMessageIsVisibleWithText('Saved changes successfully');

      // Validate gifting is disabled in recognition modal
      await recognitionHub.visitRecognitionHub();
      await recognitionHub.clickOnGiveRecognition();
      await expect(giveRecognitionModal.giftingToggle).not.toBeVisible();

      // Enable peer gifting
      await manageRewardsPage.peerGifting.loadPage();
      await manageRewardsPage.peerGifting.peerGiftingHeading.waitFor({
        state: 'visible',
        timeout: 20000,
      });
      await manageRewardsPage.peerGifting.peerGiftingToggleSwitch.click();
      await manageRewardsPage.peerGifting.saveButton.click();
      await manageRewardsPage.peerGifting.selectThePeerGiftingEnableType('Immediately');
      await manageRewardsPage.peerGifting.grantAllowancesConfirmButton.click();
      await manageRewardsPage.verifyToastMessageIsVisibleWithText('Saved changes successfully');

      // Validate gifting is enabled in recognition modal
      await recognitionHub.visitRecognitionHub();
      await recognitionHub.clickOnGiveRecognition();
      await expect(giveRecognitionModal.giftingToggle).toBeEnabled();
    }
  );

  test(
    '[RC-5420] Validate when user navigate to tabs under Peer Gifting one by one, rewards and peer api is called for once only',
    {
      tag: [TestGroupType.REGRESSION, REWARD_FEATURE_TAGS.REWARDS_PEER_GIFTING, TestPriority.P0],
    },
    async ({ appManagerFixture }) => {
      tagTest(test.info(), {
        description:
          'Validate when user navigate to tabs under Peer Gifting one by one, rewards and peer api is called for once only',
        zephyrTestId: 'RC-5420',
        storyId: 'RC-5420',
      });

      const manageRewardsPage = new ManageRewardsOverviewPage(appManagerFixture.page);
      await expect(manageRewardsPage.page).toHaveURL('/manage/recognition/rewards/overview');
      await manageRewardsPage.verifyThePageIsLoaded();

      // Test API call frequency
      const peerGiftingApi = '**/recognition/admin/rewards/config/peer';
      const calls: string[] = [];
      await manageRewardsPage.page.route(peerGiftingApi, async route => {
        calls.push(route.request().url());
        await route.continue();
      });

      const expectSingleApiCall = async () => {
        await expect.poll(() => calls.length, { timeout: 2000 }).toBe(1);
        calls.length = 0; // reset for next step
      };

      // Navigate to Peer Gifting tab
      await manageRewardsPage.peerGifting.loadPage();
      await manageRewardsPage.peerGifting.verifyThePageIsLoaded();
      await expectSingleApiCall();

      // Reload page
      await manageRewardsPage.page.reload();
      await expect(manageRewardsPage.peerGifting.peerGiftingHeading).toHaveText('Peer gifting');
      await expectSingleApiCall();

      // Navigate through sub-tabs
      const subTabs = ['Gifting options', 'Allowances', 'Reward options', 'Currency conversions', 'Disable rewards'];

      for (const tab of subTabs) {
        await manageRewardsPage.page.getByRole('tab', { name: tab }).click();
        await expect(manageRewardsPage.page.getByRole('tab', { name: tab })).toHaveAttribute('aria-selected', 'true');
        await manageRewardsPage.page.waitForTimeout(500); // small wait to catch unexpected calls
        expect(calls.length).toBe(0); // no new API calls
      }
    }
  );

  test(
    '[RC-3431] Validate peer gifting option enabling in the same month as disabled when rewards is live and changes to allowances',
    {
      tag: [TestGroupType.REGRESSION, REWARD_FEATURE_TAGS.REWARDS_PEER_GIFTING, TestPriority.P0],
    },
    async ({ appManagerFixture }) => {
      tagTest(test.info(), {
        description:
          'Validate peer gifting option enabling in the same month as disabled when rewards is live and changes to allowances',
        zephyrTestId: 'RC-3431',
        storyId: 'RC-3431',
      });

      const manageRewardsPage = new ManageRewardsOverviewPage(appManagerFixture.page);
      const recognitionHub = new RecognitionHubPage(appManagerFixture.page);
      const giveRecognitionModal = new GiveRecognitionDialogBox(appManagerFixture.page);

      await manageRewardsPage.verifier.waitUntilPageHasNavigatedTo('/manage/recognition/rewards/overview');
      await manageRewardsPage.verifier.verifyTheElementIsVisible(manageRewardsPage.header);

      await manageRewardsPage.peerGifting.loadPage();
      await manageRewardsPage.peerGifting.peerGiftingHeading.waitFor({
        state: 'visible',
        timeout: 20000,
      });
      await manageRewardsPage.clickOnElement(manageRewardsPage.peerGifting.peerGiftingToggleSwitch, {
        stepInfo: 'Clicking on peer gifting toggle switch',
      });
      await manageRewardsPage.clickOnElement(manageRewardsPage.peerGifting.saveButton, {
        stepInfo: 'Clicking on save button',
      });
      await manageRewardsPage.verifier.verifyTheElementIsVisible(manageRewardsPage.peerGifting.disableDialog);
      await manageRewardsPage.verifier.verifyElementHasText(
        manageRewardsPage.peerGifting.disableDialogTitle,
        'Disable peer gifting'
      );
      await manageRewardsPage.verifier.verifyElementHasText(
        manageRewardsPage.peerGifting.disableDialogConfirmText,
        'Are you sure you want to disable peer gifting?'
      );
      await manageRewardsPage.verifier.verifyElementHasText(
        manageRewardsPage.peerGifting.disableDialogDescriptionText,
        'Users will lose their monthly allowances and will no longer be able to gift points via peer recognition.'
      );
      await manageRewardsPage.verifier.verifyTheElementIsVisible(
        manageRewardsPage.peerGifting.disableDialogCancelButton
      );
      await manageRewardsPage.verifier.verifyTheElementIsVisible(
        manageRewardsPage.peerGifting.disableDialogDisableButton
      );
      await manageRewardsPage.clickOnElement(manageRewardsPage.peerGifting.disableDialogDisableButton, {
        stepInfo: 'Clicking on disable button in dialog',
      });
      await manageRewardsPage.verifyToastMessageIsVisibleWithText('Saved changes successfully');

      await recognitionHub.visitRecognitionHub();
      await recognitionHub.clickOnGiveRecognition();
      await manageRewardsPage.verifier.verifyTheElementIsNotVisible(giveRecognitionModal.giftingToggle);

      const amountToBeSetForUserAllowance = 15;
      await manageRewardsPage.rewardsAllowance.visitAllowancePage();
      await manageRewardsPage.verifier.waitUntilPageHasNavigatedTo(
        '/manage/recognition/rewards/peer-gifting/allowances'
      );
      await manageRewardsPage.verifier.verifyTheElementIsVisible(manageRewardsPage.header);
      await manageRewardsPage.verifier.verifyTheElementIsVisible(
        manageRewardsPage.rewardsAllowance.rewardsUserAllowance.userAllowanceIcon
      );
      await manageRewardsPage.verifier.verifyElementHasText(
        manageRewardsPage.rewardsAllowance.rewardsUserAllowance.userAllowanceHeading,
        'Users allowance'
      );
      const userAllowanceDescription = 'Add a monthly allowance for all intranet users';
      await manageRewardsPage.verifier.verifyElementHasText(
        manageRewardsPage.rewardsAllowance.rewardsUserAllowance.userAllowanceDescription,
        userAllowanceDescription
      );

      if (
        await manageRewardsPage.verifier.isTheElementVisible(
          manageRewardsPage.rewardsAllowance.rewardsUserAllowance.removeUserAllowance
        )
      ) {
        if (await manageRewardsPage.rewardsAllowance.rewardsUserAllowance.removeUserAllowance.isEnabled()) {
          await manageRewardsPage.rewardsAllowance.removeTheExistingAllowance('user');
          await manageRewardsPage.rewardsAllowance.validateToastMessage('Saved changes successfully');
          await manageRewardsPage.clickOnElement(
            manageRewardsPage.rewardsAllowance.rewardsUserAllowance.addUserAllowance,
            {
              stepInfo: 'Clicking add user allowance button',
            }
          );
        } else {
          await manageRewardsPage.clickOnElement(
            manageRewardsPage.rewardsAllowance.rewardsUserAllowance.editUserAllowance,
            {
              stepInfo: 'Clicking edit user allowance button',
            }
          );
        }
      } else {
        await manageRewardsPage.clickOnElement(
          manageRewardsPage.rewardsAllowance.rewardsUserAllowance.addUserAllowance,
          {
            stepInfo: 'Clicking add user allowance button',
          }
        );
      }

      await manageRewardsPage.rewardsAllowance.rewardsUserAllowance.increaseTheUserAmountBy(
        amountToBeSetForUserAllowance
      );
      const currentAmount =
        await manageRewardsPage.rewardsAllowance.rewardsUserAllowance.getTheCurrentAmountInInputBox();
      expect(currentAmount).toBe(amountToBeSetForUserAllowance);

      await manageRewardsPage.rewardsAllowance.saveAmount();
      await manageRewardsPage.page.waitForTimeout(2000);
      await manageRewardsPage.rewardsAllowance.validateToastMessage('Saved changes successfully');

      await manageRewardsPage.peerGifting.loadPage();
      await manageRewardsPage.peerGifting.peerGiftingHeading.waitFor({
        state: 'visible',
        timeout: 20000,
      });
      await manageRewardsPage.clickOnElement(manageRewardsPage.peerGifting.peerGiftingToggleSwitch, {
        stepInfo: 'Clicking on peer gifting toggle switch',
      });
      await manageRewardsPage.clickOnElement(manageRewardsPage.peerGifting.saveButton, {
        stepInfo: 'Clicking on save button',
      });
      await manageRewardsPage.peerGifting.selectThePeerGiftingEnableType('Immediately');
      await manageRewardsPage.verifier.verifyElementHasText(
        manageRewardsPage.peerGifting.grantAllowanceBoxDescription.nth(0),
        'Allowances have been edited since peer gifting was disabled.'
      );
      await manageRewardsPage.verifier.verifyElementHasText(
        manageRewardsPage.peerGifting.grantAllowanceBoxDescription.nth(1),
        'Users will receive the remainder of their previous allowances for the current month. New allowances will be applied from next month.'
      );
      await manageRewardsPage.clickOnElement(manageRewardsPage.peerGifting.grantAllowancesConfirmButton, {
        stepInfo: 'Clicking on grant allowances confirm button',
      });
      await manageRewardsPage.rewardsAllowance.validateToastMessage('Saved changes successfully');

      await recognitionHub.visitRecognitionHub();
      await recognitionHub.clickOnGiveRecognition();
      await manageRewardsPage.verifier.verifyTheElementIsVisible(giveRecognitionModal.giftingToggle);
    }
  );

  test(
    '[RC-3430] Validate peer gifting option enabling in the same month as disabled when rewards is live and changes to allowances',
    {
      tag: [TestGroupType.REGRESSION, REWARD_FEATURE_TAGS.REWARDS_PEER_GIFTING, TestPriority.P0],
    },
    async ({ appManagerFixture }) => {
      tagTest(test.info(), {
        description:
          'Validate peer gifting option enabling in the same month as disabled when rewards is live and changes to allowances',
        zephyrTestId: 'RC-3430',
        storyId: 'RC-3430',
      });

      const manageRewardsPage = new ManageRewardsOverviewPage(appManagerFixture.page);
      const recognitionHub = new RecognitionHubPage(appManagerFixture.page);
      const giveRecognitionModal = new GiveRecognitionDialogBox(appManagerFixture.page);

      await manageRewardsPage.verifier.waitUntilPageHasNavigatedTo('/manage/recognition/rewards/overview');
      await manageRewardsPage.verifier.verifyTheElementIsVisible(manageRewardsPage.header);

      await manageRewardsPage.peerGifting.loadPage();
      await manageRewardsPage.peerGifting.peerGiftingHeading.waitFor({
        state: 'visible',
        timeout: 20000,
      });
      await manageRewardsPage.clickOnElement(manageRewardsPage.peerGifting.peerGiftingToggleSwitch, {
        stepInfo: 'Clicking on peer gifting toggle switch',
      });
      await manageRewardsPage.clickOnElement(manageRewardsPage.peerGifting.saveButton, {
        stepInfo: 'Clicking on save button',
      });
      await manageRewardsPage.verifier.verifyTheElementIsVisible(manageRewardsPage.peerGifting.disableDialog);
      await manageRewardsPage.verifier.verifyElementHasText(
        manageRewardsPage.peerGifting.disableDialogTitle,
        'Disable peer gifting'
      );
      await manageRewardsPage.verifier.verifyElementHasText(
        manageRewardsPage.peerGifting.disableDialogConfirmText,
        'Are you sure you want to disable peer gifting?'
      );
      await manageRewardsPage.verifier.verifyElementHasText(
        manageRewardsPage.peerGifting.disableDialogDescriptionText,
        'Users will lose their monthly allowances and will no longer be able to gift points via peer recognition.'
      );
      await manageRewardsPage.verifier.verifyTheElementIsVisible(
        manageRewardsPage.peerGifting.disableDialogCancelButton
      );
      await manageRewardsPage.verifier.verifyTheElementIsVisible(
        manageRewardsPage.peerGifting.disableDialogDisableButton
      );
      await manageRewardsPage.clickOnElement(manageRewardsPage.peerGifting.disableDialogDisableButton, {
        stepInfo: 'Clicking on disable button in dialog',
      });
      await manageRewardsPage.verifyToastMessageIsVisibleWithText('Saved changes successfully');

      await recognitionHub.visitRecognitionHub();
      await recognitionHub.clickOnGiveRecognition();
      await manageRewardsPage.verifier.verifyTheElementIsNotVisible(giveRecognitionModal.giftingToggle);

      const amountToBeSetForUserAllowance = 15;
      await manageRewardsPage.rewardsAllowance.visitAllowancePage();
      await manageRewardsPage.verifier.waitUntilPageHasNavigatedTo(
        '/manage/recognition/rewards/peer-gifting/allowances'
      );
      await manageRewardsPage.verifier.verifyTheElementIsVisible(manageRewardsPage.header);
      await manageRewardsPage.verifier.verifyTheElementIsVisible(
        manageRewardsPage.rewardsAllowance.rewardsUserAllowance.userAllowanceIcon
      );
      await manageRewardsPage.verifier.verifyElementHasText(
        manageRewardsPage.rewardsAllowance.rewardsUserAllowance.userAllowanceHeading,
        'Users allowance'
      );
      const userAllowanceDescription = 'Add a monthly allowance for all intranet users';
      await manageRewardsPage.verifier.verifyElementHasText(
        manageRewardsPage.rewardsAllowance.rewardsUserAllowance.userAllowanceDescription,
        userAllowanceDescription
      );

      if (
        await manageRewardsPage.verifier.isTheElementVisible(
          manageRewardsPage.rewardsAllowance.rewardsUserAllowance.removeUserAllowance
        )
      ) {
        if (await manageRewardsPage.rewardsAllowance.rewardsUserAllowance.removeUserAllowance.isEnabled()) {
          await manageRewardsPage.rewardsAllowance.removeTheExistingAllowance('user');
          await manageRewardsPage.rewardsAllowance.validateToastMessage('Saved changes successfully');
          await manageRewardsPage.clickOnElement(
            manageRewardsPage.rewardsAllowance.rewardsUserAllowance.addUserAllowance,
            {
              stepInfo: 'Clicking add user allowance button',
            }
          );
        } else {
          await manageRewardsPage.clickOnElement(
            manageRewardsPage.rewardsAllowance.rewardsUserAllowance.editUserAllowance,
            {
              stepInfo: 'Clicking edit user allowance button',
            }
          );
        }
      } else {
        await manageRewardsPage.clickOnElement(
          manageRewardsPage.rewardsAllowance.rewardsUserAllowance.addUserAllowance,
          {
            stepInfo: 'Clicking add user allowance button',
          }
        );
      }

      await manageRewardsPage.rewardsAllowance.rewardsUserAllowance.increaseTheUserAmountBy(
        amountToBeSetForUserAllowance
      );
      const currentAmount =
        await manageRewardsPage.rewardsAllowance.rewardsUserAllowance.getTheCurrentAmountInInputBox();
      expect(currentAmount).toBe(amountToBeSetForUserAllowance);

      await manageRewardsPage.rewardsAllowance.saveAmount();
      await manageRewardsPage.page.waitForTimeout(2000);
      await manageRewardsPage.rewardsAllowance.validateToastMessage('Saved changes successfully');

      await manageRewardsPage.peerGifting.loadPage();
      await manageRewardsPage.peerGifting.peerGiftingHeading.waitFor({
        state: 'visible',
        timeout: 20000,
      });
      await manageRewardsPage.clickOnElement(manageRewardsPage.peerGifting.peerGiftingToggleSwitch, {
        stepInfo: 'Clicking on peer gifting toggle switch',
      });
      await manageRewardsPage.clickOnElement(manageRewardsPage.peerGifting.saveButton, {
        stepInfo: 'Clicking on save button',
      });
      await manageRewardsPage.peerGifting.selectThePeerGiftingEnableType('Immediately');
      await manageRewardsPage.verifier.verifyElementHasText(
        manageRewardsPage.peerGifting.grantAllowanceBoxDescription.nth(0),
        'Allowances have been edited since peer gifting was disabled.'
      );
      await manageRewardsPage.verifier.verifyElementHasText(
        manageRewardsPage.peerGifting.grantAllowanceBoxDescription.nth(1),
        'Users will receive the remainder of their previous allowances for the current month. New allowances will be applied from next month.'
      );
      await manageRewardsPage.clickOnElement(manageRewardsPage.peerGifting.grantAllowancesConfirmButton, {
        stepInfo: 'Clicking on grant allowances confirm button',
      });
      await manageRewardsPage.rewardsAllowance.validateToastMessage('Saved changes successfully');

      await recognitionHub.visitRecognitionHub();
      await recognitionHub.clickOnGiveRecognition();
      await manageRewardsPage.verifier.verifyTheElementIsVisible(giveRecognitionModal.giftingToggle);
    }
  );

  test(
    '[RC-3432] Validate peer gifting option enabling in the same month as disabled when rewards is live and changes to allowances',
    {
      tag: [TestGroupType.REGRESSION, REWARD_FEATURE_TAGS.REWARDS_PEER_GIFTING, TestPriority.P0],
    },
    async ({ appManagerFixture }) => {
      tagTest(test.info(), {
        description:
          'Validate peer gifting option enabling in the same month as disabled when rewards is live and changes to allowances',
        zephyrTestId: 'RC-3432',
        storyId: 'RC-3432',
      });

      const manageRewardsPage = new ManageRewardsOverviewPage(appManagerFixture.page);
      const recognitionHub = new RecognitionHubPage(appManagerFixture.page);
      const giveRecognitionModal = new GiveRecognitionDialogBox(appManagerFixture.page);

      await manageRewardsPage.verifier.waitUntilPageHasNavigatedTo('/manage/recognition/rewards/overview');
      await manageRewardsPage.verifier.verifyTheElementIsVisible(manageRewardsPage.header);

      await manageRewardsPage.peerGifting.loadPage();
      await manageRewardsPage.peerGifting.peerGiftingHeading.waitFor({
        state: 'visible',
        timeout: 20000,
      });
      await manageRewardsPage.clickOnElement(manageRewardsPage.peerGifting.peerGiftingToggleSwitch, {
        stepInfo: 'Clicking on peer gifting toggle switch',
      });
      await manageRewardsPage.clickOnElement(manageRewardsPage.peerGifting.saveButton, {
        stepInfo: 'Clicking on save button',
      });
      await manageRewardsPage.verifier.verifyTheElementIsVisible(manageRewardsPage.peerGifting.disableDialog);
      await manageRewardsPage.verifier.verifyElementHasText(
        manageRewardsPage.peerGifting.disableDialogTitle,
        'Disable peer gifting'
      );
      await manageRewardsPage.verifier.verifyElementHasText(
        manageRewardsPage.peerGifting.disableDialogConfirmText,
        'Are you sure you want to disable peer gifting?'
      );
      await manageRewardsPage.verifier.verifyElementHasText(
        manageRewardsPage.peerGifting.disableDialogDescriptionText,
        'Users will lose their monthly allowances and will no longer be able to gift points via peer recognition.'
      );
      await manageRewardsPage.verifier.verifyTheElementIsVisible(
        manageRewardsPage.peerGifting.disableDialogCancelButton
      );
      await manageRewardsPage.verifier.verifyTheElementIsVisible(
        manageRewardsPage.peerGifting.disableDialogDisableButton
      );
      await manageRewardsPage.clickOnElement(manageRewardsPage.peerGifting.disableDialogDisableButton, {
        stepInfo: 'Clicking on disable button in dialog',
      });
      await manageRewardsPage.verifyToastMessageIsVisibleWithText('Saved changes successfully');

      await recognitionHub.visitRecognitionHub();
      await recognitionHub.clickOnGiveRecognition();
      await manageRewardsPage.verifier.verifyTheElementIsNotVisible(giveRecognitionModal.giftingToggle);

      const amountToBeSetForUserAllowance = 15;
      await manageRewardsPage.rewardsAllowance.visitAllowancePage();
      await manageRewardsPage.verifier.waitUntilPageHasNavigatedTo(
        '/manage/recognition/rewards/peer-gifting/allowances'
      );
      await manageRewardsPage.verifier.verifyTheElementIsVisible(manageRewardsPage.header);
      await manageRewardsPage.verifier.verifyTheElementIsVisible(
        manageRewardsPage.rewardsAllowance.rewardsUserAllowance.userAllowanceIcon
      );
      await manageRewardsPage.verifier.verifyElementHasText(
        manageRewardsPage.rewardsAllowance.rewardsUserAllowance.userAllowanceHeading,
        'Users allowance'
      );
      const userAllowanceDescription = 'Add a monthly allowance for all intranet users';
      await manageRewardsPage.verifier.verifyElementHasText(
        manageRewardsPage.rewardsAllowance.rewardsUserAllowance.userAllowanceDescription,
        userAllowanceDescription
      );

      if (
        await manageRewardsPage.verifier.isTheElementVisible(
          manageRewardsPage.rewardsAllowance.rewardsUserAllowance.removeUserAllowance
        )
      ) {
        if (await manageRewardsPage.rewardsAllowance.rewardsUserAllowance.removeUserAllowance.isEnabled()) {
          await manageRewardsPage.rewardsAllowance.removeTheExistingAllowance('user');
          await manageRewardsPage.rewardsAllowance.validateToastMessage('Saved changes successfully');
          await manageRewardsPage.clickOnElement(
            manageRewardsPage.rewardsAllowance.rewardsUserAllowance.addUserAllowance,
            {
              stepInfo: 'Clicking add user allowance button',
            }
          );
        } else {
          await manageRewardsPage.clickOnElement(
            manageRewardsPage.rewardsAllowance.rewardsUserAllowance.editUserAllowance,
            {
              stepInfo: 'Clicking edit user allowance button',
            }
          );
        }
      } else {
        await manageRewardsPage.clickOnElement(
          manageRewardsPage.rewardsAllowance.rewardsUserAllowance.addUserAllowance,
          {
            stepInfo: 'Clicking add user allowance button',
          }
        );
      }

      await manageRewardsPage.rewardsAllowance.rewardsUserAllowance.increaseTheUserAmountBy(
        amountToBeSetForUserAllowance
      );
      const currentAmount =
        await manageRewardsPage.rewardsAllowance.rewardsUserAllowance.getTheCurrentAmountInInputBox();
      expect(currentAmount).toBe(amountToBeSetForUserAllowance);

      await manageRewardsPage.rewardsAllowance.saveAmount();
      await manageRewardsPage.page.waitForTimeout(2000);
      await manageRewardsPage.rewardsAllowance.validateToastMessage('Saved changes successfully');

      await manageRewardsPage.peerGifting.loadPage();
      await manageRewardsPage.peerGifting.peerGiftingHeading.waitFor({
        state: 'visible',
        timeout: 20000,
      });
      await manageRewardsPage.clickOnElement(manageRewardsPage.peerGifting.peerGiftingToggleSwitch, {
        stepInfo: 'Clicking on peer gifting toggle switch',
      });
      await manageRewardsPage.clickOnElement(manageRewardsPage.peerGifting.saveButton, {
        stepInfo: 'Clicking on save button',
      });
      await manageRewardsPage.peerGifting.selectThePeerGiftingEnableType('Immediately');
      await manageRewardsPage.verifier.verifyElementHasText(
        manageRewardsPage.peerGifting.grantAllowanceBoxDescription.nth(0),
        'Allowances have been edited since peer gifting was disabled.'
      );
      await manageRewardsPage.verifier.verifyElementHasText(
        manageRewardsPage.peerGifting.grantAllowanceBoxDescription.nth(1),
        'Users will receive the remainder of their previous allowances for the current month. New allowances will be applied from next month.'
      );
      await manageRewardsPage.clickOnElement(manageRewardsPage.peerGifting.grantAllowancesConfirmButton, {
        stepInfo: 'Clicking on grant allowances confirm button',
      });
      await manageRewardsPage.rewardsAllowance.validateToastMessage('Saved changes successfully');

      await recognitionHub.visitRecognitionHub();
      await recognitionHub.clickOnGiveRecognition();
      await manageRewardsPage.verifier.verifyTheElementIsVisible(giveRecognitionModal.giftingToggle);
    }
  );
});
