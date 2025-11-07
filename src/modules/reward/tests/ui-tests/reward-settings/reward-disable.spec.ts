import { expect } from '@playwright/test';
import { REWARD_FEATURE_TAGS, REWARD_SUITE_TAGS } from '@rewards/constants/testTags';
import { rewardTestFixture as test } from '@rewards/fixtures/rewardFixture';
import { DialogBox } from '@rewards-components/common/dialog-box';
import { ManageRewardsOverviewPage } from '@rewards-pages/manage-rewards/manage-rewards-overview-page';
import { UserProfilePage } from '@rewards-pages/user-profile/user-profile-page';

import { TestPriority } from '@core/constants/testPriority';
import { TestGroupType } from '@core/constants/testType';
import { tagTest } from '@core/utils/testDecorator';

test.describe('disable Rewards flow', { tag: [REWARD_SUITE_TAGS.MANAGE_REWARD] }, () => {
  test(
    '[RC-2198] Validate disable rewards flow',
    {
      tag: [TestGroupType.REGRESSION, REWARD_FEATURE_TAGS.DISABLE_REWARD, TestPriority.P0, '@only-running-test'],
    },
    async ({ appManagerFixture }) => {
      tagTest(test.info(), {
        description: 'Validate disable rewards flow',
        zephyrTestId: 'RC-2198',
        storyId: 'RC-2198',
      });

      const manageRewardsPage = new ManageRewardsOverviewPage(appManagerFixture.page);
      await manageRewardsPage.loadPageWithHarness();
      await manageRewardsPage.verifyThePageIsLoaded();
      await manageRewardsPage.enableTheRewardsAndPeerGiftingIfDisabled();

      await test.step('Click on Disable Rewards button', async () => {
        await manageRewardsPage.disableRewardLink.waitFor({ state: 'visible', timeout: 15000 });
        const appName = await manageRewardsPage.page.evaluate(() => {
          return (window as any).Simpplr?.Settings?.appName;
        });
        const isDisableButtonVisible = await manageRewardsPage.verifier.isTheElementVisible(
          manageRewardsPage.disableRewardLink
        );
        if (isDisableButtonVisible) {
          await manageRewardsPage.clickOnElement(manageRewardsPage.disableRewardLink, {
            stepInfo: 'Clicking on disable rewards link',
          });
          await manageRewardsPage.disableRewardButton.waitFor({ state: 'visible', timeout: 15000 });
          await manageRewardsPage.clickOnElement(manageRewardsPage.disableRewardButton, {
            stepInfo: 'Clicking on disable rewards button',
          });
          const dialogBox = new DialogBox(manageRewardsPage.page);
          await dialogBox.title.waitFor({ state: 'visible' });
          await expect(dialogBox.title).toHaveText('Disable rewards');
          await dialogBox.descriptionText.last().waitFor({ state: 'visible', timeout: 5000 });
          const paraElements = await dialogBox.descriptionText.allTextContents();
          expect(paraElements).toContain('Are you sure you want to disable rewards?');
          expect(paraElements).toContain(
            `Users will no longer be able to give, receive or redeem points in ${appName}.`
          );
          await expect(dialogBox.descriptionText.last()).toContainText(
            /Type [‘'’]confirm[’']? above to disable rewards and revoke points from wallets/
          );
        } else {
          console.log('Rewards are already disabled, skipping disable action.');
        }
      });

      await test.step('Check the input functionality and validate the Disable button', async () => {
        const dialogBox = new DialogBox(manageRewardsPage.page);
        await dialogBox.title.waitFor({ state: 'visible' });
        await expect(dialogBox.title).toHaveText('Disable rewards');
        const isDialogVisible = await manageRewardsPage.verifier.isTheElementVisible(dialogBox.title);
        if (isDialogVisible) {
          await dialogBox.inputBox.fill('SUCCESS');
          await dialogBox.inputBox.blur();
          await expect(dialogBox.confirmButton).toBeDisabled();
          await expect(dialogBox.inputBoxError).toBeVisible();

          await dialogBox.inputBox.fill('पुष्टि करें');
          await dialogBox.inputBox.blur();
          await expect(dialogBox.confirmButton).toBeDisabled();
          await expect(dialogBox.inputBoxError).toBeVisible();

          await dialogBox.inputBox.fill('DISABLE');
          await dialogBox.inputBox.blur();
          await expect(dialogBox.confirmButton).toBeDisabled();
          await expect(dialogBox.inputBoxError).toBeVisible();

          await dialogBox.inputBox.fill('ConFiRM');
          await dialogBox.inputBox.blur();
          await expect(dialogBox.confirmButton).toBeEnabled();

          await dialogBox.inputBox.fill('confirm');
          await dialogBox.inputBox.blur();
          await expect(dialogBox.confirmButton).toBeEnabled();

          await dialogBox.inputBox.fill('confirm');
          await dialogBox.inputBox.blur();
          await expect(dialogBox.confirmButton).toBeEnabled();
        }
      });

      await test.step("Enter the 'confirm' in input box and click the Disable button", async () => {
        const dialogBox = new DialogBox(manageRewardsPage.page);
        await dialogBox.title.waitFor({ state: 'visible' });
        await expect(dialogBox.title).toHaveText('Disable rewards');
        const isDialogVisible = await manageRewardsPage.verifier.isTheElementVisible(dialogBox.title);
        if (isDialogVisible) {
          await dialogBox.inputBox.fill('confirm');
          await dialogBox.inputBox.blur();
          await dialogBox.confirmButton.click();
        }
        await manageRewardsPage.verifyToastMessageIsVisibleWithText('Rewards disabled');
        await manageRewardsPage.rewardsTabHeading.waitFor({ state: 'visible' });
        await manageRewardsPage.page.reload();
        await manageRewardsPage.verifier.waitUntilElementIsVisible(manageRewardsPage.rewardsTabHeading);
        await expect(manageRewardsPage.rewardsTabHeading).toHaveText('Recognition rewards');
      });
    }
  );

  test(
    '[RC-3247] Validate Disable rewards flow, if there are no unredeemed points in users wallets',
    {
      tag: [TestGroupType.REGRESSION, REWARD_FEATURE_TAGS.DISABLE_REWARD, TestPriority.P0],
    },
    async ({ appManagerFixture }) => {
      tagTest(test.info(), {
        description: 'Validate Disable rewards flow, if there are no unredeemed points in users wallets',
        zephyrTestId: 'RC-3247',
        storyId: 'RC-3247',
      });

      const manageRewardsPage = new ManageRewardsOverviewPage(appManagerFixture.page);
      await manageRewardsPage.loadPageWithHarness();
      await manageRewardsPage.verifyThePageIsLoaded();
      await manageRewardsPage.enableTheRewardsAndPeerGiftingIfDisabled();

      await test.step('Click on Disable Rewards button', async () => {
        await manageRewardsPage.disableRewardLink.waitFor({ state: 'visible', timeout: 15000 });
        const appName = await manageRewardsPage.page.evaluate(() => {
          return (window as any).Simpplr?.Settings?.appName;
        });
        const isDisableButtonVisible = await manageRewardsPage.verifier.isTheElementVisible(
          manageRewardsPage.disableRewardLink
        );
        if (isDisableButtonVisible) {
          await manageRewardsPage.mockTheWalletsApiResponse();
          await manageRewardsPage.clickOnElement(manageRewardsPage.disableRewardLink, {
            stepInfo: 'Clicking on disable rewards link',
          });
          await manageRewardsPage.disableRewardButton.waitFor({ state: 'visible', timeout: 15000 });
          await manageRewardsPage.clickOnElement(manageRewardsPage.disableRewardButton, {
            stepInfo: 'Clicking on disable rewards button',
          });
          const dialogBox = new DialogBox(manageRewardsPage.page);
          await dialogBox.title.waitFor({ state: 'visible' });
          await expect(dialogBox.title).toHaveText('Disable rewards');
          await dialogBox.descriptionText.last().waitFor({ state: 'visible', timeout: 5000 });
          const paraElements = await dialogBox.descriptionText.allTextContents();
          expect(paraElements).toContain('Are you sure you want to disable rewards?');
          expect(paraElements).toContain(`Users will no longer be able to give or receive points in ${appName}.`);
        } else {
          console.log('Rewards are already disabled, skipping disable action.');
        }
      });

      await test.step("Enter the 'confirm' in input box and click the Disable button", async () => {
        const dialogBox = new DialogBox(manageRewardsPage.page);
        await dialogBox.title.waitFor({ state: 'visible' });
        await expect(dialogBox.title).toHaveText('Disable rewards');
        await expect(dialogBox.inputBox).not.toBeVisible();
        await dialogBox.confirmButton.click();
        await manageRewardsPage.verifyToastMessageIsVisibleWithText('Rewards disabled');
        await manageRewardsPage.rewardsTabHeading.waitFor({ state: 'visible' });
        await manageRewardsPage.page.reload();
        await manageRewardsPage.verifier.waitUntilElementIsVisible(manageRewardsPage.rewardsTabHeading);
        await expect(manageRewardsPage.rewardsTabHeading).toHaveText('Recognition rewards');
      });

      await test.step('Enable the Rewards Again', async () => {
        const isEnableRewardButtonDisplayed = await manageRewardsPage.verifier.isTheElementVisible(
          manageRewardsPage.enableRewardsButton
        );
        if (isEnableRewardButtonDisplayed) {
          await manageRewardsPage.clickOnElement(manageRewardsPage.enableRewardsButton, {
            stepInfo: 'Clicking on enable rewards button',
          });
          await manageRewardsPage.verifyToastMessageIsVisibleWithText('Rewards enabled');
          await expect(manageRewardsPage.rewardsTabHeading).toHaveText('Rewards overview');
        }
      });
    }
  );

  test(
    '[RC-3249] Validate localisation for "confirm" field on Disable rewards confirmation dialogue.',
    {
      tag: [TestGroupType.REGRESSION, REWARD_FEATURE_TAGS.DISABLE_REWARD, TestPriority.P0],
    },
    async ({ appManagerFixture }) => {
      tagTest(test.info(), {
        description: 'Validate localisation for "confirm" field on Disable rewards confirmation dialogue.',
        zephyrTestId: 'RC-3249',
        storyId: 'RC-3249',
      });

      const manageRewardsPage = new ManageRewardsOverviewPage(appManagerFixture.page);
      const userProfile = new UserProfilePage(manageRewardsPage.page);
      await manageRewardsPage.loadPageWithHarness();
      await manageRewardsPage.verifyThePageIsLoaded();
      await manageRewardsPage.enableTheRewardsAndPeerGiftingIfDisabled();

      await test.step('Set the Language as "French", And check the Disable message', async () => {
        await userProfile.mockAppConfigLanguage(manageRewardsPage.page, 3);
        await manageRewardsPage.disableRewardLink.waitFor({ state: 'visible', timeout: 15000 });
        const isDisableButtonVisible = await manageRewardsPage.verifier.isTheElementVisible(
          manageRewardsPage.disableRewardLink
        );
        if (isDisableButtonVisible) {
          await manageRewardsPage.clickOnElement(manageRewardsPage.disableRewardLink, {
            stepInfo: 'Clicking on disable rewards link',
          });
          await manageRewardsPage.disableRewardButton.waitFor({ state: 'visible', timeout: 15000 });
          await manageRewardsPage.clickOnElement(manageRewardsPage.disableRewardButton, {
            stepInfo: 'Clicking on disable rewards button',
          });
          const dialogBox = new DialogBox(manageRewardsPage.page);
          await dialogBox.title.waitFor({ state: 'visible' });
          await expect(dialogBox.title).toBeVisible();
          await dialogBox.descriptionText.last().waitFor({ state: 'visible', timeout: 5000 });
          await manageRewardsPage.disableRewardsForDifferentLanguage('Cnfirm', false);
          await manageRewardsPage.disableRewardsForDifferentLanguage('Konfirm', false);
          await manageRewardsPage.disableRewardsForDifferentLanguage('CCCONNNFFFFRRRRMMM', false);
          await manageRewardsPage.disableRewardsForDifferentLanguage('confirmer', true);
        }
        await userProfile.restoreAppConfigMock(manageRewardsPage.page);
      });

      await test.step('Set the Language as "German", Get All the categories in German language and validate', async () => {
        await userProfile.mockAppConfigLanguage(manageRewardsPage.page, 6);
        await manageRewardsPage.disableRewardLink.waitFor({ state: 'visible', timeout: 15000 });
        const isDisableButtonVisible = await manageRewardsPage.verifier.isTheElementVisible(
          manageRewardsPage.disableRewardLink
        );
        if (isDisableButtonVisible) {
          await manageRewardsPage.clickOnElement(manageRewardsPage.disableRewardLink, {
            stepInfo: 'Clicking on disable rewards link',
          });
          await manageRewardsPage.disableRewardButton.waitFor({ state: 'visible', timeout: 15000 });
          await manageRewardsPage.clickOnElement(manageRewardsPage.disableRewardButton, {
            stepInfo: 'Clicking on disable rewards button',
          });
          const dialogBox = new DialogBox(manageRewardsPage.page);
          await dialogBox.title.waitFor({ state: 'visible' });
          await dialogBox.descriptionText.last().waitFor({ state: 'visible', timeout: 5000 });
          await manageRewardsPage.disableRewardsForDifferentLanguage('Cnfirm', false);
          await manageRewardsPage.disableRewardsForDifferentLanguage('Konfirm', false);
          await manageRewardsPage.disableRewardsForDifferentLanguage('CCCONNNFFFFRRRRMMM', false);
          await manageRewardsPage.disableRewardsForDifferentLanguage('bestätigen', true);
        }
        await userProfile.restoreAppConfigMock(manageRewardsPage.page);
      });
    }
  );
});
