import { expect } from '@playwright/test';
import { REWARD_FEATURE_TAGS, REWARD_SUITE_TAGS } from '@rewards/constants/testTags';
import { rewardTestFixture as test } from '@rewards/fixtures/rewardFixture';
import { GiveRecognitionDialogBox } from '@rewards-components/recognition/give-recognition-dialog-box';
import { ManageRewardsOverviewPage } from '@rewards-pages/manage-rewards/manage-rewards-overview-page';
import { RecognitionHubPage } from '@rewards-pages/recognition-hub/recognition-hub-page';
import { randomInt } from 'node:crypto';

import { TestPriority } from '@core/constants/testPriority';
import { TestGroupType } from '@core/constants/testType';
import { tagTest } from '@core/utils/testDecorator';

test.describe('manage rewards', { tag: [REWARD_SUITE_TAGS.MANAGE_REWARD] }, () => {
  test.beforeEach(async ({ appManagerFixture }) => {
    const manageRewardsPage = new ManageRewardsOverviewPage(appManagerFixture.page);
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
      await manageRewardsPage.peerGifting.verifyThePageIsLoaded();
      await manageRewardsPage.peerGifting.enableThePeerGifting('Immediately');
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
      await manageRewardsPage.peerGifting.mockThePeerGiftingApiResponse(true, false, true);
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
      await manageRewardsPage.peerGifting.mockThePeerGiftingApiResponse(true, true, false);
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
    }
  );

  test(
    '[RC-2199] Validate peer gifting on Overview UI',
    {
      tag: [
        TestGroupType.REGRESSION,
        REWARD_FEATURE_TAGS.REWARDS_PEER_GIFTING,
        TestPriority.P0,
        TestGroupType.HEALTHCHECK,
      ],
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
      await manageRewardsPage.peerGifting.verifyThePageIsLoaded();
      await manageRewardsPage.peerGifting.disableThePeerGifting();

      // Enable peer gifting
      await manageRewardsPage.peerGifting.loadPage();
      await manageRewardsPage.peerGifting.verifyThePageIsLoaded();
      await manageRewardsPage.peerGifting.enableThePeerGifting('Immediately');
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
      await expect(manageRewardsPage.peerGifting.allowanceIcon).toBeVisible();
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
      await manageRewardsPage.peerGifting.visit();
      await manageRewardsPage.peerGifting.disableThePeerGifting();

      // Validate gifting is disabled in recognition modal
      await recognitionHub.navigateToRecognitionHub();
      await recognitionHub.verifyThePageIsLoaded();
      await recognitionHub.clickOnGiveRecognition();
      await expect(giveRecognitionModal.giftingToggle).not.toBeVisible();

      // Enable peer gifting
      await manageRewardsPage.peerGifting.visit();
      await manageRewardsPage.peerGifting.enableThePeerGifting('Immediately');

      // Validate gifting is enabled in recognition modal
      await recognitionHub.navigateToRecognitionHub();
      await recognitionHub.verifyThePageIsLoaded();
      await recognitionHub.clickOnGiveRecognition();
      await expect(giveRecognitionModal.giftingToggle).toBeEnabled();
    }
  );

  test(
    '[RC-5420] Validate when user navigate to tabs under Peer Gifting one by one, rewards and peer api is called for once only',
    {
      tag: [
        TestGroupType.REGRESSION,
        REWARD_FEATURE_TAGS.REWARDS_PEER_GIFTING,
        TestPriority.P0,
        TestGroupType.HEALTHCHECK,
      ],
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
      await manageRewardsPage.peerGifting.disableThePeerGifting();
      await recognitionHub.navigateToRecognitionHub();
      await recognitionHub.verifyThePageIsLoaded();
      await recognitionHub.clickOnGiveRecognition();
      await manageRewardsPage.verifier.verifyTheElementIsNotVisible(giveRecognitionModal.giftingToggle);
      const amountToBeSetForUserAllowance = 15;
      await manageRewardsPage.rewardsAllowance.visitAllowancePage();
      await manageRewardsPage.rewardsAllowance.clickOnTheAddOrEditButton('user');
      await manageRewardsPage.rewardsAllowance.rewardsUserAllowance.enterThePointAmount(amountToBeSetForUserAllowance);
      const currentAmount =
        await manageRewardsPage.rewardsAllowance.rewardsUserAllowance.getTheCurrentAmountInInputBox();
      expect(currentAmount).toBe(amountToBeSetForUserAllowance);
      await expect(manageRewardsPage.rewardsAllowance.saveButton).toBeEnabled();
      await manageRewardsPage.rewardsAllowance.saveAmount();
      await manageRewardsPage.rewardsAllowance.validateToastMessage('Saved changes successfully');

      await manageRewardsPage.peerGifting.loadPage();
      await manageRewardsPage.peerGifting.verifyThePageIsLoaded();
      await manageRewardsPage.peerGifting.enableThePeerGifting('Immediately');

      await recognitionHub.navigateToRecognitionHub();
      await recognitionHub.verifyThePageIsLoaded();
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
      await manageRewardsPage.peerGifting.disableThePeerGifting();
      const amountToBeSetForUserAllowance = 15;
      await manageRewardsPage.rewardsAllowance.rewardsUserAllowance.visitToUserAllowanceSetupPage();
      await manageRewardsPage.rewardsAllowance.rewardsUserAllowance.enterThePointAmount(
        randomInt(amountToBeSetForUserAllowance, 2000)
      );
      await manageRewardsPage.rewardsAllowance.saveAmount();
      await manageRewardsPage.rewardsAllowance.validateToastMessage('Saved changes successfully');
      await manageRewardsPage.peerGifting.loadPage();
      await manageRewardsPage.peerGifting.verifyThePageIsLoaded();
      await manageRewardsPage.peerGifting.enableThePeerGifting(
        'Immediately',
        'Allowances have been edited since peer gifting was disabled.'
      );
    }
  );

  test(
    '[RC-3432] Validate the peer gifting enabling in the Next month when the reward is live',
    {
      tag: [TestGroupType.REGRESSION, REWARD_FEATURE_TAGS.REWARDS_PEER_GIFTING, TestPriority.P0],
    },
    async ({ appManagerFixture }) => {
      tagTest(test.info(), {
        description: 'Validate the peer gifting enabling in the Next month when the reward is live',
        zephyrTestId: 'RC-3432',
        storyId: 'RC-3432',
      });

      const context = appManagerFixture.page.context();
      const manageRewardsPage = new ManageRewardsOverviewPage(appManagerFixture.page);
      const recognitionHub = new RecognitionHubPage(appManagerFixture.page);
      const giveRecognitionModal = new GiveRecognitionDialogBox(appManagerFixture.page);

      await test.step('Login to the application and navigate to Rewards overview', async () => {
        await expect(manageRewardsPage.page).toHaveURL('/manage/recognition/rewards/overview');
        await manageRewardsPage.verifyThePageIsLoaded();
      });

      await test.step('Disable Peer gifting and click on Allowances i button.', async () => {
        await manageRewardsPage.peerGifting.loadPage();
        await manageRewardsPage.peerGifting.verifyThePageIsLoaded();
        await manageRewardsPage.peerGifting.disableThePeerGifting();
      });

      // ---------- Step: change system date to next month (client-side override) ----------
      await test.step('Simulate changing system date to next month in browser', async () => {
        // compute next-month date in ISO form (preserve day/time to avoid timezone surprises)
        const now = new Date();
        const nextMonth = new Date(now.getTime());
        nextMonth.setMonth(now.getMonth() + 1);

        // Normalize to ISO (explicit timezone) to avoid environment-dependent offsets
        const iso = nextMonth.toISOString();

        // Add init script to override Date for all pages in this context (must run before next navigations)
        // The script uses the provided ISO string as the "current" date/time.
        await context.addInitScript({
          content: `
            (() => {
                const forcedIso = "${iso}";
                const OriginalDate = Date;
                const forcedDate = new OriginalDate(forcedIso);
                // Mock Date constructor and Date.now()
                class MockDate extends OriginalDate {
                  constructor(...args) {
                    if (args.length === 0) {
                      // when no args, return the forced date instance (create new to avoid mutability issues)
                      return new OriginalDate(forcedIso);
                    }
                    return new OriginalDate(...args);
                  }
                  static now() {
                    return new OriginalDate(forcedIso).getTime();
                  }
                }
                // copy static methods that may be used
                MockDate.UTC = OriginalDate.UTC;
                MockDate.parse = OriginalDate.parse;
                MockDate.prototype = OriginalDate.prototype;
                // Replace window.Date with MockDate
                window.Date = MockDate;
            })();
        `,
        });
        // Reload the current page so that the new init script takes effect for the application
        await manageRewardsPage.page.reload({ waitUntil: 'domcontentloaded' });
      });

      await test.step(`Enable the Peer gifting with 'Immediately' and validate modal message`, async () => {
        await manageRewardsPage.peerGifting.loadPage();
        await manageRewardsPage.peerGifting.verifyThePageIsLoaded();

        // toggle on (enable)
        await manageRewardsPage.peerGifting.peerGiftingToggleSwitch.click();
        await manageRewardsPage.peerGifting.saveButton.click();
        await manageRewardsPage.peerGifting.selectThePeerGiftingEnableType('Immediately');

        // Validate modal contents per your step 5/6:
        await expect(manageRewardsPage.peerGifting.grantAllowancesDialog).toBeVisible();
        // Confirm the three choices exist (Immediately, From the beginning of the next month, Cancel/Confirm buttons)
        await expect(manageRewardsPage.peerGifting.grantAllowancesRadioImmediately).toBeVisible();
        await expect(manageRewardsPage.peerGifting.grantAllowancesRadioNextMonth).toBeVisible();
        await expect(manageRewardsPage.peerGifting.grantAllowancesCancelButton).toBeVisible();
        await expect(manageRewardsPage.peerGifting.grantAllowancesConfirmButton).toBeVisible();

        await expect(manageRewardsPage.peerGifting.grantAllowanceBoxDescription.nth(0)).toHaveText(
          'Users will receive their fully monthly allowance for the remainder of the current month.'
        );

        // confirm
        await manageRewardsPage.peerGifting.grantAllowancesConfirmButton.click();
        await manageRewardsPage.rewardsAllowance.validateToastMessage('Saved changes successfully');
      });

      await test.step('Validate the Gifting is enabled in the Recognition Modal', async () => {
        await recognitionHub.visitRecognitionHub();
        await recognitionHub.clickOnGiveRecognition();
        await expect(giveRecognitionModal.giftingToggle).toBeVisible();
      });
    }
  );
});
