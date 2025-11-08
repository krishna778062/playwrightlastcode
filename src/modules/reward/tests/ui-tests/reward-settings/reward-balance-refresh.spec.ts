import { expect } from '@playwright/test';
import { REWARD_FEATURE_TAGS, REWARD_SUITE_TAGS } from '@rewards/constants/testTags';
import { rewardTestFixture as test } from '@rewards/fixtures/rewardFixture';
import { GiveRecognitionDialogBox } from '@rewards-components/recognition/give-recognition-dialog-box';
import { ManageRewardsOverviewPage } from '@rewards-pages/manage-rewards/manage-rewards-overview-page';
import { RecognitionHubPage } from '@rewards-pages/recognition-hub/recognition-hub-page';

import { TestPriority } from '@core/constants/testPriority';
import { TestGroupType } from '@core/constants/testType';
import { LoginHelper } from '@core/helpers/loginHelper';
import { tagTest } from '@core/utils/testDecorator';

test.describe('manage rewards', { tag: [REWARD_SUITE_TAGS.MANAGE_REWARD] }, () => {
  test.beforeEach(async ({ appManagerFixture }) => {
    const manageRewardsPage = new ManageRewardsOverviewPage(appManagerFixture.page);
    await manageRewardsPage.enableTheRewardsAndPeerGiftingIfDisabled();
  });

  test(
    "[RC-3163] Verify point balance distribution when user's recognition is deleted and user is not part of users allowance config",
    {
      tag: [
        REWARD_FEATURE_TAGS.REWARDS_ALLOWANCE_REFRESH,
        TestPriority.P0,
        TestGroupType.REGRESSION,
        TestGroupType.SMOKE,
      ],
    },
    async ({ appManagerFixture }) => {
      tagTest(test.info(), {
        description:
          "Verify point balance distribution when user's recognition is deleted and user is not part of users allowance config",
        zephyrTestId: 'RC-3163',
        storyId: 'RC-3163',
      });

      const manageRewardsPage = new ManageRewardsOverviewPage(appManagerFixture.page);
      let userAllowanceIsDisabled: boolean = false;
      let contextB: any;
      let pageB: any;
      const userName2 = process.env.STANDARD_USER_FULL_NAME!;

      // User should be on Manage Rewards page
      await manageRewardsPage.verifier.waitUntilPageHasNavigatedTo('/manage/recognition/rewards/overview');
      await manageRewardsPage.verifier.verifyTheElementIsVisible(manageRewardsPage.header);

      // Set the Gifting Options
      const recognitionHub = new RecognitionHubPage(appManagerFixture.page);
      const existingOptions = await recognitionHub.visitRecognitionHub();
      if (existingOptions.length < 2) {
        await recognitionHub.setupTheMultipleGiftingOptions();
      }

      // Remove the Users allowance
      await manageRewardsPage.rewardsAllowance.visitAllowancePage();
      await manageRewardsPage.verifier.waitUntilPageHasNavigatedTo(
        '/manage/recognition/rewards/peer-gifting/allowances'
      );
      await manageRewardsPage.verifier.verifyTheElementIsVisible(manageRewardsPage.header);

      if (
        await manageRewardsPage.verifier.isTheElementVisible(
          manageRewardsPage.rewardsAllowance.rewardsUserAllowance.removeUserAllowance,
          { timeout: 5000 }
        )
      ) {
        if (await manageRewardsPage.rewardsAllowance.rewardsUserAllowance.removeUserAllowance.isEnabled()) {
          await manageRewardsPage.rewardsAllowance.removeTheExistingAllowance('user');
          await manageRewardsPage.rewardsAllowance.validateToastMessage('Saved changes successfully');
        } else {
          console.log('Remove User allowance is disable, we need to add the individual Allowance');
          userAllowanceIsDisabled = true;
        }
      } else {
        console.log('Remove User Allowance button is not present.');
      }

      // Set the user allowance as 200 points
      if (!userAllowanceIsDisabled) {
        if (
          await manageRewardsPage.verifier.isTheElementVisible(
            manageRewardsPage.rewardsAllowance.rewardsIndividualAllowance.removeIndividualAllowance,
            { timeout: 5000 }
          )
        ) {
          if (
            await manageRewardsPage.rewardsAllowance.rewardsIndividualAllowance.removeIndividualAllowance.isEnabled()
          ) {
            await manageRewardsPage.rewardsAllowance.removeTheExistingAllowance('individual');
            await manageRewardsPage.rewardsAllowance.validateToastMessage('Saved changes successfully');
            await manageRewardsPage.clickOnElement(
              manageRewardsPage.rewardsAllowance.rewardsIndividualAllowance.addIndividualAllowance,
              {
                stepInfo: 'Clicking on add individual allowance button',
              }
            );
          } else {
            await manageRewardsPage.clickOnElement(
              manageRewardsPage.rewardsAllowance.rewardsIndividualAllowance.editIndividualAllowance,
              {
                stepInfo: 'Clicking on edit individual allowance button',
              }
            );
          }
        } else {
          await manageRewardsPage.clickOnElement(
            manageRewardsPage.rewardsAllowance.rewardsIndividualAllowance.addIndividualAllowance,
            {
              stepInfo: 'Clicking on add individual allowance button',
            }
          );
        }
        await manageRewardsPage.rewardsAllowance.rewardsIndividualAllowance.setTheIndividualAllowanceForAUser(
          userName2,
          200,
          false
        );
      }

      await manageRewardsPage.verifier.waitUntilElementIsVisible(
        manageRewardsPage.rewardsAllowance.monthlyAllowanceIllustration,
        {
          stepInfo: 'Wait for monthly allowance illustration to be visible',
        }
      );
      await manageRewardsPage.verifier.verifyElementHasText(
        manageRewardsPage.rewardsAllowance.monthlyAllowanceIllustrationDescriptionText,
        '*Monthly totals are for guidance only, based on latest edits and current active users.'
      );
      await manageRewardsPage.verifier.verifyTheElementIsVisible(
        manageRewardsPage.rewardsAllowance.monthlyAllowanceIllustrationIndividualRow
      );

      // Run the Seed
      await manageRewardsPage.rewardsAllowance.page.goto('/manage/recognition/distribute-allowances');
      await manageRewardsPage.page.waitForTimeout(15000);

      // Open the 2nd browser instance and login with user2 creds, and check the points in Recognition hub
      const browser = manageRewardsPage.page.context().browser();
      if (!browser) throw new Error('Browser instance is null');
      contextB = await browser.newContext();
      pageB = await contextB.newPage();
      await pageB.bringToFront();

      await LoginHelper.logoutByNavigatingToLogoutPage(pageB);
      await LoginHelper.loginWithPassword(pageB, {
        email: process.env.STANDARD_USER_USERNAME!,
        password: process.env.STANDARD_USER_PASSWORD!,
      });

      const recognitionHubB = new RecognitionHubPage(pageB);
      await recognitionHubB.verifier.waitUntilElementIsVisible(recognitionHubB.pointsToGive, {
        stepInfo: 'Wait for points to give element',
      });
      const availablePoints = recognitionHubB.pointsToGive;
      await expect(availablePoints).toHaveText('200');

      // Create a Recognition with some points and check the points to give
      const rewardOptionIndex = 3;
      await recognitionHubB.clickOnGiveRecognition();
      const giveRecognitionModal = new GiveRecognitionDialogBox(pageB);
      const pointValueInRecognitionPost = await giveRecognitionModal.recognizePeerRecognitionWithRewardPoints(
        0,
        process.env.RECOGNITION_USER_FULL_NAME,
        'Test Message' + Math.floor(Math.random() * 1000),
        rewardOptionIndex
      );

      // Switch to first browser, Remove the user's allowance
      await manageRewardsPage.page.bringToFront();
      await manageRewardsPage.rewardsAllowance.visitAllowancePage();
      await manageRewardsPage.verifier.waitUntilPageHasNavigatedTo(
        '/manage/recognition/rewards/peer-gifting/allowances'
      );
      await manageRewardsPage.verifier.verifyTheElementIsVisible(manageRewardsPage.header);

      if (
        await manageRewardsPage.verifier.isTheElementVisible(
          manageRewardsPage.rewardsAllowance.rewardsIndividualAllowance.removeIndividualAllowance,
          { timeout: 5000 }
        )
      ) {
        if (await manageRewardsPage.rewardsAllowance.rewardsIndividualAllowance.removeIndividualAllowance.isEnabled()) {
          await manageRewardsPage.rewardsAllowance.removeTheExistingAllowance('individual');
          await manageRewardsPage.rewardsAllowance.validateToastMessage('Saved changes successfully');
          await manageRewardsPage.clickOnElement(
            manageRewardsPage.rewardsAllowance.rewardsIndividualAllowance.addIndividualAllowance,
            {
              stepInfo: 'Clicking on add individual allowance button',
            }
          );
        } else {
          await manageRewardsPage.clickOnElement(
            manageRewardsPage.rewardsAllowance.rewardsIndividualAllowance.editIndividualAllowance,
            {
              stepInfo: 'Clicking on edit individual allowance button',
            }
          );
        }
      } else {
        await manageRewardsPage.clickOnElement(
          manageRewardsPage.rewardsAllowance.rewardsIndividualAllowance.addIndividualAllowance,
          {
            stepInfo: 'Clicking on add individual allowance button',
          }
        );
      }
      await manageRewardsPage.rewardsAllowance.rewardsIndividualAllowance.setTheIndividualAllowanceForAUser(
        userName2,
        200,
        true
      );

      // Run the Seed
      await manageRewardsPage.rewardsAllowance.page.goto('/manage/recognition/distribute-allowances');
      await manageRewardsPage.page.waitForTimeout(15000);

      // Open the 2nd browser instance and login with user2 creds, and check the points in Recognition hub
      await pageB.bringToFront();
      await LoginHelper.logoutByNavigatingToLogoutPage(pageB);
      await LoginHelper.loginWithPassword(pageB, {
        email: process.env.STANDARD_USER_USERNAME!,
        password: process.env.STANDARD_USER_PASSWORD!,
      });

      await recognitionHubB.verifier.waitUntilElementIsVisible(recognitionHubB.pointsToGive, {
        stepInfo: 'Wait for points to give element',
      });
      await expect(recognitionHubB.pointsToGive).toHaveText('0');

      // Switch to first browser, Remove the user2's created recognition with points revoke
      await manageRewardsPage.page.bringToFront();
      const recognitionHubMain = new RecognitionHubPage(manageRewardsPage.page);
      await recognitionHubMain.visitRecognitionHub();
      await recognitionHubMain.clickOnTheFirstPostMoreOption('Delete');
      await recognitionHubMain.verifier.waitUntilElementIsVisible(
        recognitionHubMain.deleteRecognitionDialogBoxContainer,
        {
          stepInfo: 'Wait for delete recognition dialog',
        }
      );
      await recognitionHubMain.verifier.verifyElementHasText(
        recognitionHubMain.deleteRecognitionDialogBoxTitle,
        'Delete recognition'
      );
      await recognitionHubMain.verifier.verifyTheElementIsEnabled(
        recognitionHubMain.deleteRecognitionDialogBoxDeleteButton
      );
      await manageRewardsPage.clickOnElement(recognitionHubMain.deleteRecognitionDialogBoxDeleteButton, {
        stepInfo: 'Clicking on delete recognition button',
      });
      await recognitionHubMain.verifier.verifyTheElementIsNotVisible(
        recognitionHubMain.deleteRecognitionDialogBoxContainer
      );
      await manageRewardsPage.rewardsAllowance.validateToastMessage('Recognition deleted');

      // Open the 2nd browser instance and login with user2 creds, and check the points in Recognition hub is not changed
      await pageB.bringToFront();
      await recognitionHubB.page.reload();
      await recognitionHubB.loadPage();
      await recognitionHubB.verifier.waitUntilElementIsVisible(recognitionHubB.pointsToGive, {
        stepInfo: 'Wait for points to give element',
      });
      await expect(recognitionHubB.pointsToGive).toHaveText('0');
    }
  );

  test(
    "[RC-3164] Verify point balance distribution when user's recognition is deleted and user is not part of users allowance config",
    {
      tag: [
        REWARD_FEATURE_TAGS.REWARDS_ALLOWANCE_REFRESH,
        TestPriority.P0,
        TestGroupType.REGRESSION,
        TestGroupType.SMOKE,
      ],
    },
    async ({ appManagerFixture }) => {
      tagTest(test.info(), {
        description:
          "Verify point balance distribution when user's recognition is deleted and user is not part of users allowance config",
        zephyrTestId: 'RC-3164',
        storyId: 'RC-3164',
      });

      const manageRewardsPage = new ManageRewardsOverviewPage(appManagerFixture.page);
      let userAllowanceIsDisabled: boolean = false;
      let contextB: any;
      let pageB: any;
      const userName2 = process.env.STANDARD_USER_FULL_NAME!;

      // User should be on Manage Rewards page
      await manageRewardsPage.verifier.waitUntilPageHasNavigatedTo('/manage/recognition/rewards/overview');
      await manageRewardsPage.verifier.verifyTheElementIsVisible(manageRewardsPage.header);

      // Set the Gifting Options
      const recognitionHub = new RecognitionHubPage(appManagerFixture.page);
      const existingOptions = await recognitionHub.visitRecognitionHub();
      if (existingOptions.length < 2) {
        await recognitionHub.setupTheMultipleGiftingOptions();
      }

      // Remove the Users allowance
      await manageRewardsPage.rewardsAllowance.visitAllowancePage();
      await manageRewardsPage.verifier.waitUntilPageHasNavigatedTo(
        '/manage/recognition/rewards/peer-gifting/allowances'
      );
      await manageRewardsPage.verifier.verifyTheElementIsVisible(manageRewardsPage.header);

      if (
        await manageRewardsPage.verifier.isTheElementVisible(
          manageRewardsPage.rewardsAllowance.rewardsUserAllowance.removeUserAllowance,
          { timeout: 5000 }
        )
      ) {
        if (await manageRewardsPage.rewardsAllowance.rewardsUserAllowance.removeUserAllowance.isEnabled()) {
          await manageRewardsPage.rewardsAllowance.removeTheExistingAllowance('user');
          await manageRewardsPage.rewardsAllowance.validateToastMessage('Saved changes successfully');
          await manageRewardsPage.clickOnElement(
            manageRewardsPage.rewardsAllowance.rewardsUserAllowance.addUserAllowance,
            {
              stepInfo: 'Clicking on add user allowance button',
            }
          );
          await manageRewardsPage.rewardsAllowance.rewardsUserAllowance.enterThePointAmount(500);
          await manageRewardsPage.rewardsAllowance.saveAmount();
          await manageRewardsPage.page.waitForTimeout(2000);
          await manageRewardsPage.rewardsAllowance.validateToastMessage('Saved changes successfully');
        } else {
          console.log('Remove User allowance is disable, we need to add the individual Allowance');
          await manageRewardsPage.clickOnElement(
            manageRewardsPage.rewardsAllowance.rewardsUserAllowance.editUserAllowance,
            {
              stepInfo: 'Clicking on edit user allowance button',
            }
          );
          await manageRewardsPage.rewardsAllowance.rewardsUserAllowance.enterThePointAmount(500);
          await manageRewardsPage.rewardsAllowance.saveAmount();
          await manageRewardsPage.page.waitForTimeout(2000);
          await manageRewardsPage.rewardsAllowance.validateToastMessage('Saved changes successfully');
          userAllowanceIsDisabled = true;

          if (
            await manageRewardsPage.verifier.isTheElementVisible(
              manageRewardsPage.rewardsAllowance.rewardsIndividualAllowance.removeIndividualAllowance,
              { timeout: 5000 }
            )
          ) {
            if (
              await manageRewardsPage.rewardsAllowance.rewardsIndividualAllowance.removeIndividualAllowance.isEnabled()
            ) {
              await manageRewardsPage.rewardsAllowance.removeTheExistingAllowance('individual');
              await manageRewardsPage.rewardsAllowance.validateToastMessage('Saved changes successfully');
              await manageRewardsPage.clickOnElement(
                manageRewardsPage.rewardsAllowance.rewardsIndividualAllowance.addIndividualAllowance,
                {
                  stepInfo: 'Clicking on add individual allowance button',
                }
              );
            } else {
              await manageRewardsPage.clickOnElement(
                manageRewardsPage.rewardsAllowance.rewardsIndividualAllowance.editIndividualAllowance,
                {
                  stepInfo: 'Clicking on edit individual allowance button',
                }
              );
            }
          } else {
            await manageRewardsPage.clickOnElement(
              manageRewardsPage.rewardsAllowance.rewardsIndividualAllowance.addIndividualAllowance,
              {
                stepInfo: 'Clicking on add individual allowance button',
              }
            );
          }
          await manageRewardsPage.rewardsAllowance.rewardsIndividualAllowance.setTheIndividualAllowanceForAUser(
            userName2,
            200,
            false
          );
        }
      } else {
        console.log('Remove User Allowance button is not present.');
        await manageRewardsPage.clickOnElement(
          manageRewardsPage.rewardsAllowance.rewardsUserAllowance.addUserAllowance,
          {
            stepInfo: 'Clicking on add user allowance button',
          }
        );
        await manageRewardsPage.rewardsAllowance.rewardsUserAllowance.enterThePointAmount(500);
        await manageRewardsPage.rewardsAllowance.saveAmount();
        await manageRewardsPage.page.waitForTimeout(2000);
        await manageRewardsPage.rewardsAllowance.validateToastMessage('Saved changes successfully');
      }

      // Set the user allowance as 200 points
      if (!userAllowanceIsDisabled) {
        if (
          await manageRewardsPage.verifier.isTheElementVisible(
            manageRewardsPage.rewardsAllowance.rewardsIndividualAllowance.removeIndividualAllowance,
            { timeout: 5000 }
          )
        ) {
          if (
            await manageRewardsPage.rewardsAllowance.rewardsIndividualAllowance.removeIndividualAllowance.isEnabled()
          ) {
            await manageRewardsPage.rewardsAllowance.removeTheExistingAllowance('individual');
            await manageRewardsPage.rewardsAllowance.validateToastMessage('Saved changes successfully');
            await manageRewardsPage.clickOnElement(
              manageRewardsPage.rewardsAllowance.rewardsIndividualAllowance.addIndividualAllowance,
              {
                stepInfo: 'Clicking on add individual allowance button',
              }
            );
          } else {
            await manageRewardsPage.clickOnElement(
              manageRewardsPage.rewardsAllowance.rewardsIndividualAllowance.editIndividualAllowance,
              {
                stepInfo: 'Clicking on edit individual allowance button',
              }
            );
          }
        } else {
          await manageRewardsPage.clickOnElement(
            manageRewardsPage.rewardsAllowance.rewardsIndividualAllowance.addIndividualAllowance,
            {
              stepInfo: 'Clicking on add individual allowance button',
            }
          );
        }
        await manageRewardsPage.rewardsAllowance.rewardsIndividualAllowance.setTheIndividualAllowanceForAUser(
          userName2,
          200,
          true
        );
      }

      await manageRewardsPage.verifier.waitUntilElementIsVisible(
        manageRewardsPage.rewardsAllowance.monthlyAllowanceIllustration,
        {
          stepInfo: 'Wait for monthly allowance illustration to be visible',
        }
      );
      await manageRewardsPage.verifier.verifyElementHasText(
        manageRewardsPage.rewardsAllowance.monthlyAllowanceIllustrationDescriptionText,
        '*Monthly totals are for guidance only, based on latest edits and current active users.'
      );
      await manageRewardsPage.verifier.verifyTheElementIsVisible(
        manageRewardsPage.rewardsAllowance.monthlyAllowanceIllustrationIndividualRow
      );
      const individualAllowanceAmount =
        await manageRewardsPage.rewardsAllowance.monthlyAllowanceIllustrationIndividualColumn.nth(2).textContent();
      expect(200).toEqual(Number(individualAllowanceAmount));

      // Run the Seed
      await manageRewardsPage.rewardsAllowance.page.goto('/manage/recognition/distribute-allowances');
      await manageRewardsPage.verifyThePageIsLoaded();
      await manageRewardsPage.page.waitForTimeout(15000);

      // Open the 2nd browser instance and login with user2 creds, and check the points in Recognition hub
      contextB = manageRewardsPage.page.context();
      pageB = await contextB.newPage();
      await pageB.bringToFront();

      await LoginHelper.logoutByNavigatingToLogoutPage(pageB);
      await LoginHelper.loginWithPassword(pageB, {
        email: process.env.STANDARD_USER_USERNAME!,
        password: process.env.STANDARD_USER_PASSWORD!,
      });

      const recognitionHubB = new RecognitionHubPage(pageB);
      await recognitionHubB.verifier.waitUntilElementIsVisible(recognitionHubB.pointsToGive, {
        stepInfo: 'Wait for points to give element',
      });
      const availablePoints = recognitionHubB.pointsToGive;
      await expect(availablePoints).toHaveText('200');

      // Create a Recognition with some points and check the points to give
      await pageB.bringToFront();
      const rewardOptionIndex = 3;
      await recognitionHubB.clickOnGiveRecognition();
      const giveRecognitionModal = new GiveRecognitionDialogBox(pageB);
      const pointValueInRecognitionPost = await giveRecognitionModal.recognizePeerRecognitionWithRewardPoints(
        0,
        process.env.RECOGNITION_USER_FULL_NAME,
        'Test Message' + Math.floor(Math.random() * 1000),
        rewardOptionIndex
      );

      // Switch to first browser, Remove the user's allowance
      await manageRewardsPage.page.bringToFront();
      await manageRewardsPage.rewardsAllowance.visitAllowancePage();
      await manageRewardsPage.verifier.waitUntilPageHasNavigatedTo(
        '/manage/recognition/rewards/peer-gifting/allowances'
      );
      await manageRewardsPage.verifier.verifyTheElementIsVisible(manageRewardsPage.header);

      if (
        await manageRewardsPage.verifier.isTheElementVisible(
          manageRewardsPage.rewardsAllowance.rewardsIndividualAllowance.removeIndividualAllowance,
          { timeout: 5000 }
        )
      ) {
        if (await manageRewardsPage.rewardsAllowance.rewardsIndividualAllowance.removeIndividualAllowance.isEnabled()) {
          await manageRewardsPage.rewardsAllowance.removeTheExistingAllowance('individual');
          await manageRewardsPage.rewardsAllowance.validateToastMessage('Saved changes successfully');
          await manageRewardsPage.clickOnElement(
            manageRewardsPage.rewardsAllowance.rewardsIndividualAllowance.addIndividualAllowance,
            {
              stepInfo: 'Clicking on add individual allowance button',
            }
          );
        } else {
          await manageRewardsPage.clickOnElement(
            manageRewardsPage.rewardsAllowance.rewardsIndividualAllowance.editIndividualAllowance,
            {
              stepInfo: 'Clicking on edit individual allowance button',
            }
          );
        }
      } else {
        await manageRewardsPage.clickOnElement(
          manageRewardsPage.rewardsAllowance.rewardsIndividualAllowance.addIndividualAllowance,
          {
            stepInfo: 'Clicking on add individual allowance button',
          }
        );
      }
      await manageRewardsPage.rewardsAllowance.rewardsIndividualAllowance.addOneIndividualUserInTheAllowance(10);
      await manageRewardsPage.verifier.verifyTheElementIsVisible(
        manageRewardsPage.rewardsAllowance.rewardsIndividualAllowance.recentlyAddedUsers
      );
      await manageRewardsPage.verifier.verifyTheElementIsEnabled(manageRewardsPage.rewardsAllowance.saveButton);
      await manageRewardsPage.clickOnElement(manageRewardsPage.rewardsAllowance.saveButton, {
        stepInfo: 'Clicking on save button',
      });
      await manageRewardsPage.rewardsAllowance.validateToastMessage('Saved changes successfully');

      // Run the Seed
      await manageRewardsPage.rewardsAllowance.page.goto('/manage/recognition/distribute-allowances');
      await manageRewardsPage.verifyThePageIsLoaded();
      await manageRewardsPage.page.waitForTimeout(15000);

      // Open the 2nd browser instance and login with user2 creds, and check the points in Recognition hub
      await pageB.bringToFront();
      await recognitionHubB.page.reload();
      await recognitionHubB.loadPage();
      await recognitionHubB.verifier.waitUntilElementIsVisible(recognitionHubB.pointsToGive, {
        stepInfo: 'Wait for points to give element',
      });
      await expect(recognitionHubB.pointsToGive).toHaveText('0');

      // Switch to first browser, Remove the user2's created recognition with points revoke
      await manageRewardsPage.page.bringToFront();
      const recognitionHubMain = new RecognitionHubPage(manageRewardsPage.page);
      await recognitionHubMain.visitRecognitionHub();
      await recognitionHubMain.clickOnTheFirstPostMoreOption('Delete');
      await recognitionHubMain.verifier.waitUntilElementIsVisible(
        recognitionHubMain.deleteRecognitionDialogBoxContainer,
        {
          stepInfo: 'Wait for delete recognition dialog',
        }
      );
      await recognitionHubMain.verifier.verifyElementHasText(
        recognitionHubMain.deleteRecognitionDialogBoxTitle,
        'Delete recognition'
      );
      await recognitionHubMain.verifier.verifyTheElementIsEnabled(
        recognitionHubMain.deleteRecognitionDialogBoxDeleteButton
      );
      await manageRewardsPage.clickOnElement(recognitionHubMain.deleteRecognitionDialogBoxDeleteButton, {
        stepInfo: 'Clicking on delete recognition button',
      });
      await recognitionHubMain.verifier.verifyTheElementIsNotVisible(
        recognitionHubMain.deleteRecognitionDialogBoxContainer
      );
      await manageRewardsPage.rewardsAllowance.validateToastMessage('Recognition deleted');

      // Open the 2nd browser instance and login with user2 creds, and check the points in Recognition hub is not changed
      await pageB.bringToFront();
      await recognitionHubB.page.reload();
      await recognitionHubB.loadPage();
      await recognitionHubB.verifier.waitUntilElementIsVisible(recognitionHubB.pointsToGive, {
        stepInfo: 'Wait for points to give element',
      });
      await expect(recognitionHubB.pointsToGive).toHaveText('0');
    }
  );
});
