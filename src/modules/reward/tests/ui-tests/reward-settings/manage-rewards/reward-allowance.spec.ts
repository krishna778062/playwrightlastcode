import { expect } from '@playwright/test';
import { REWARD_FEATURE_TAGS, REWARD_SUITE_TAGS } from '@rewards/constants/testTags';
import { rewardTestFixture as test } from '@rewards/fixtures/rewardFixture';
import { TestDbScenarios } from '@rewards/utils/testDatabaseHelper';
import { RewardsAllowance } from '@rewards-components/manage-rewards/rewards-allowance';
import { ManageRewardsOverviewPage } from '@rewards-pages/manage-rewards/manage-rewards-overview-page';
import { RewardsAllowancePage } from '@rewards-pages/manage-rewards/rewards-allowance-page';

import { TestPriority } from '@core/constants/testPriority';
import { TestGroupType } from '@core/constants/testType';
import { tagTest } from '@core/utils/testDecorator';

test.describe('allowance Flows', { tag: [REWARD_SUITE_TAGS.MANAGE_REWARD, '@allowanceTestCaseOnly'] }, () => {
  test.beforeEach(async ({ appManagerFixture }) => {
    const manageRewardsPage = new ManageRewardsOverviewPage(appManagerFixture.page);
    await manageRewardsPage.enableTheRewardsAndPeerGiftingIfDisabled();
  });

  test(
    '[RC-2448] Verify user allowances index page for user allowances',
    {
      tag: [
        REWARD_FEATURE_TAGS.REWARDS_ALLOWANCE,
        TestPriority.P0,
        TestGroupType.REGRESSION,
        TestGroupType.HEALTHCHECK,
      ],
    },
    async ({ appManagerFixture }) => {
      tagTest(test.info(), {
        description: 'Verify user allowances index page for user allowances',
        zephyrTestId: 'RC-2448',
        storyId: 'RC-2448',
      });

      const manageRewardsPage = new ManageRewardsOverviewPage(appManagerFixture.page);
      const allowancePage = new RewardsAllowancePage(appManagerFixture.page);
      const userAllowance = new RewardsAllowance(appManagerFixture.page).rewardsUserAllowance;
      const amountToBeSetForUserAllowance = 10;
      await manageRewardsPage.rewardsAllowance.visitAllowancePage();
      await allowancePage.verifier.waitUntilPageHasNavigatedTo('/manage/recognition/rewards/peer-gifting/allowances');
      await allowancePage.verifier.verifyTheElementIsVisible(allowancePage.header);
      await allowancePage.verifier.verifyTheElementIsVisible(allowancePage.userAllowanceIcon);
      await allowancePage.verifier.verifyElementHasText(allowancePage.userAllowanceHeading, 'Users allowance');
      const userAllowanceDescription = 'Add a monthly allowance for all intranet users';
      await allowancePage.verifier.verifyElementHasText(
        allowancePage.userAllowanceDescription,
        userAllowanceDescription
      );

      if (await allowancePage.verifier.isTheElementVisible(allowancePage.removeUserAllowance)) {
        if (await allowancePage.removeUserAllowance.isEnabled()) {
          await allowancePage.removeTheExistingAllowance('user');
          await allowancePage.validateToastMessage('Saved changes successfully');
          await allowancePage.clickOnElement(allowancePage.addUserAllowance, {
            stepInfo: 'Clicking add user allowance button',
          });
        } else {
          await allowancePage.clickOnElement(allowancePage.editUserAllowance, {
            stepInfo: 'Clicking edit user allowance button',
          });
        }
      } else {
        await allowancePage.clickOnElement(allowancePage.addUserAllowance, {
          stepInfo: 'Clicking add user allowance button',
        });
      }

      const headingText = 'Users allowance';
      const headingDescriptionLine1 = 'Add a monthly allowance for all intranet users.';
      const headingDescriptionLine2 =
        'Allowances refresh on the 1st of every month. Unused points expire and are not charged for.';
      await allowancePage.validateAllowanceAddAndEditPageHeader(
        headingText,
        headingDescriptionLine1,
        headingDescriptionLine2
      );
      await allowancePage.validateTheUsersAllowanceElements();

      await allowancePage.enterThePointAmount(0);
      await allowancePage.clickOnElement(allowancePage.currencyConversionInfoIcon, {
        stepInfo: 'Clicking currency conversion info icon',
      });
      await allowancePage.verifier.verifyTheElementIsVisible(allowancePage.pointAmountLimitError);

      await userAllowance.increaseTheUserAmountBy(amountToBeSetForUserAllowance);
      const currentAmount = await allowancePage.getTheCurrentAmountInInputBox();
      expect(currentAmount).toBe(amountToBeSetForUserAllowance);

      await allowancePage.saveAmount();
      await allowancePage.validateToastMessage('Saved changes successfully');

      await allowancePage.verifier.verifyTheElementIsVisible(allowancePage.editUserAllowance);
      await allowancePage.clickOnElement(allowancePage.editUserAllowance, {
        stepInfo: 'Clicking edit user allowance button',
      });

      await userAllowance.decreaseTheUserAmountBy(2);
      const currentAmountAfterDecrease = await allowancePage.getTheCurrentAmountInInputBox();
      expect(currentAmountAfterDecrease).toBe(amountToBeSetForUserAllowance - 2);

      await allowancePage.saveAmount();
      await allowancePage.validateToastMessage('Saved changes successfully');

      await allowancePage.verifier.verifyTheElementIsVisible(allowancePage.userAllowanceIcon);
      await allowancePage.verifier.verifyTheElementIsVisible(allowancePage.userAllowanceGreenTick);
      await allowancePage.verifier.verifyTheElementIsVisible(allowancePage.removeUserAllowance);
      await allowancePage.verifier.verifyTheElementIsVisible(allowancePage.editUserAllowance);
    }
  );

  test(
    '[RC-3117] Verify dialog for unsaved changes when user in user allowance page navigates to different page or refreshes',
    {
      tag: [REWARD_FEATURE_TAGS.REWARDS_ALLOWANCE, TestPriority.P0, TestGroupType.REGRESSION],
    },
    async ({ appManagerFixture }) => {
      tagTest(test.info(), {
        description:
          'Verify dialog for unsaved changes when user in user allowance page navigates to different page or refreshes',
        zephyrTestId: 'RC-3117',
        storyId: 'RC-3117',
      });

      const manageRewardsPage = new ManageRewardsOverviewPage(appManagerFixture.page);
      const allowancePage = new RewardsAllowancePage(appManagerFixture.page);
      const userAllowance = new RewardsAllowance(appManagerFixture.page).rewardsUserAllowance;
      const amountToBeSetForUserAllowance = 10;

      await manageRewardsPage.rewardsAllowance.visitAllowancePage();
      await allowancePage.verifier.waitUntilPageHasNavigatedTo('/manage/recognition/rewards/peer-gifting/allowances');
      await allowancePage.verifier.verifyTheElementIsVisible(allowancePage.header);
      await allowancePage.verifier.verifyTheElementIsVisible(allowancePage.userAllowanceIcon);
      await allowancePage.verifier.verifyElementHasText(allowancePage.userAllowanceHeading, 'Users allowance');
      const userAllowanceDescription = 'Add a monthly allowance for all intranet users';
      await allowancePage.verifier.verifyElementHasText(
        allowancePage.userAllowanceDescription,
        userAllowanceDescription
      );

      if (await allowancePage.verifier.isTheElementVisible(allowancePage.removeUserAllowance)) {
        if (await allowancePage.removeUserAllowance.isEnabled()) {
          await allowancePage.removeTheExistingAllowance('user');
          await allowancePage.validateToastMessage('Saved changes successfully');
          await allowancePage.clickOnElement(allowancePage.addUserAllowance, {
            stepInfo: 'Clicking add user allowance button',
          });
        } else {
          await allowancePage.clickOnElement(allowancePage.editUserAllowance, {
            stepInfo: 'Clicking edit user allowance button',
          });
        }
      } else {
        await allowancePage.clickOnElement(allowancePage.addUserAllowance, {
          stepInfo: 'Clicking add user allowance button',
        });
      }

      await userAllowance.increaseTheUserAmountBy(amountToBeSetForUserAllowance);
      const currentAmount = await userAllowance.getTheCurrentAmountInInputBox();
      expect(currentAmount).toBe(amountToBeSetForUserAllowance);

      await allowancePage.clickOnElement(allowancePage.cancelButton, { force: true });
      allowancePage.page.once('dialog', async dialog => {
        await dialog.dismiss();
      });

      const currentAmountAfterCancel = await allowancePage.getTheCurrentAmountInInputBox();
      expect(currentAmountAfterCancel).toBe(amountToBeSetForUserAllowance);

      await allowancePage.clickOnElement(allowancePage.cancelButton);
      allowancePage.page.once('dialog', async dialog => {
        await dialog.accept();
      });

      await manageRewardsPage.rewardsAllowance.visitAllowancePage();
      await allowancePage.verifier.verifyTheElementIsVisible(allowancePage.addUserAllowance);
      await allowancePage.clickOnElement(allowancePage.addUserAllowance, {
        stepInfo: 'Clicking add user allowance button',
      });
      const currentAmountAfterAccept = await allowancePage.getTheCurrentAmountInInputBox();
      expect(currentAmountAfterAccept).not.toBe(amountToBeSetForUserAllowance);
    }
  );

  test(
    '[RC-2459] Verify index page for audience allowances',
    {
      tag: [REWARD_FEATURE_TAGS.REWARDS_ALLOWANCE, TestPriority.P0, TestGroupType.REGRESSION, TestGroupType.SMOKE],
    },
    async ({ appManagerFixture }) => {
      tagTest(test.info(), {
        description: 'Verify index page for audience allowances',
        zephyrTestId: 'RC-2459',
        storyId: 'RC-2459',
      });

      const manageRewardsPage = new ManageRewardsOverviewPage(appManagerFixture.page);
      const allowancePage = new RewardsAllowancePage(appManagerFixture.page);
      const audiencePage = new RewardsAllowance(appManagerFixture.page).rewardsAudienceAllowance;
      const amountToBeSetForAudienceAllowance = 10;
      await manageRewardsPage.rewardsAllowance.visitAllowancePage();
      await allowancePage.verifier.waitUntilPageHasNavigatedTo('/manage/recognition/rewards/peer-gifting/allowances');
      await allowancePage.verifier.verifyTheElementIsVisible(allowancePage.header);
      await allowancePage.verifier.verifyTheElementIsVisible(allowancePage.audienceAllowance);
      await allowancePage.verifier.verifyElementHasText(allowancePage.audienceAllowanceHeading, 'Audience allowances');
      const userAllowanceDescription = 'Add monthly allowances for users in selected audiences';
      await allowancePage.verifier.verifyElementHasText(
        allowancePage.audienceAllowanceDescription,
        userAllowanceDescription
      );

      if (await allowancePage.verifier.isTheElementVisible(allowancePage.removeAudienceAllowance)) {
        if (await allowancePage.removeAudienceAllowance.isEnabled()) {
          await allowancePage.removeTheExistingAllowance('audience');
          await allowancePage.validateToastMessage('Saved changes successfully');
          await allowancePage.clickOnElement(allowancePage.addAudienceAllowance, {
            stepInfo: 'Clicking add audience allowance button',
          });
        } else {
          await allowancePage.clickOnElement(allowancePage.editAudienceAllowance, {
            stepInfo: 'Clicking edit audience allowance button',
          });
        }
      } else {
        await allowancePage.clickOnElement(allowancePage.addAudienceAllowance, {
          stepInfo: 'Clicking add audience allowance button',
        });
      }

      await audiencePage.addOneAudienceInTheAllowance(amountToBeSetForAudienceAllowance);
      const currentAmount = await audiencePage.getTheCurrentAmountForLatestAddedAudience();
      expect(currentAmount).toBe(amountToBeSetForAudienceAllowance);
      await audiencePage.verifier.verifyTheElementIsVisible(audiencePage.recentlyAddedIndicator);
      await audiencePage.verifier.verifyTheElementIsEnabled(allowancePage.saveButton);
      await audiencePage.clickOnElement(allowancePage.saveButton, {
        stepInfo: 'Clicking save button',
      });
      await allowancePage.waitForCallToBeCompleted('/recognition/admin/rewards/allowances/monthly/estimate');
      await allowancePage.verifier.verifyTheElementIsVisible(allowancePage.audienceAllowanceGreenTick);
      await allowancePage.verifier.verifyTheElementIsVisible(allowancePage.removeAudienceAllowance);
      await allowancePage.verifier.verifyTheElementIsVisible(allowancePage.editAudienceAllowance);
      await allowancePage.verifier.waitUntilElementIsVisible(allowancePage.monthlyAllowanceIllustration);
      await allowancePage.monthlyAllowanceIllustration.scrollIntoViewIfNeeded();
      await allowancePage.verifier.verifyElementHasText(
        allowancePage.monthlyAllowanceIllustrationDescriptionText,
        '*Monthly totals are for guidance only, based on latest edits and current active users.'
      );
      await allowancePage.verifier.verifyTheElementIsVisible(allowancePage.monthlyAllowanceIllustrationAudienceRow);
      await allowancePage.verifier.verifyTheElementIsVisible(
        allowancePage.monthlyAllowanceIllustrationAudienceColumn.last()
      );
    }
  );

  test(
    '[RC-2486] Verify individual allowances page once allowance is added',
    {
      tag: [REWARD_FEATURE_TAGS.REWARDS_ALLOWANCE, TestPriority.P0, TestGroupType.REGRESSION],
    },
    async ({ appManagerFixture }) => {
      tagTest(test.info(), {
        description: 'Verify individual allowances page once allowance is added',
        zephyrTestId: 'RC-2486',
        storyId: 'RC-2486',
      });

      const manageRewardsPage = new ManageRewardsOverviewPage(appManagerFixture.page);
      const allowancePage = new RewardsAllowancePage(appManagerFixture.page);
      const individualAllowance = new RewardsAllowance(appManagerFixture.page).rewardsIndividualAllowance;
      const amountToBeSetForIndividualUsersAllowance = 10;

      await manageRewardsPage.verifier.waitUntilPageHasNavigatedTo('/manage/recognition/rewards/overview');
      await manageRewardsPage.verifier.verifyTheElementIsVisible(manageRewardsPage.header);

      await manageRewardsPage.rewardsAllowance.visitAllowancePage();
      await allowancePage.verifier.waitUntilPageHasNavigatedTo('/manage/recognition/rewards/peer-gifting/allowances');
      await allowancePage.verifier.verifyTheElementIsVisible(allowancePage.header);
      await allowancePage.verifier.verifyTheElementIsVisible(allowancePage.individualAllowance);
      await allowancePage.verifier.verifyElementHasText(
        allowancePage.individualAllowanceHeading,
        'Individual allowances'
      );
      const indiAllowanceDescription = 'Add individual monthly allowances for selected users';
      await allowancePage.verifier.verifyElementHasText(
        allowancePage.individualAllowanceDescription,
        indiAllowanceDescription
      );

      if (await allowancePage.verifier.isTheElementVisible(allowancePage.removeIndividualAllowance)) {
        if (await allowancePage.removeIndividualAllowance.isEnabled()) {
          await allowancePage.removeTheExistingAllowance('individual');
          await allowancePage.validateToastMessage('Saved changes successfully');
          await allowancePage.clickOnElement(allowancePage.addIndividualAllowance, {
            stepInfo: 'Clicking add individual allowance button',
          });
        } else {
          await allowancePage.clickOnElement(allowancePage.editIndividualAllowance, {
            stepInfo: 'Clicking edit individual allowance button',
          });
        }
      } else {
        await allowancePage.clickOnElement(allowancePage.addIndividualAllowance, {
          stepInfo: 'Clicking add individual allowance button',
        });
      }

      await individualAllowance.validateTheIndividualAllowanceElements();
      await individualAllowance.addOneIndividualUserInTheAllowance(amountToBeSetForIndividualUsersAllowance);
      const currentAmount = await individualAllowance.getTheCurrentAmountForLatestAddedUserInIndividualAllowance();
      expect(currentAmount).toBe(amountToBeSetForIndividualUsersAllowance);
      await allowancePage.verifier.verifyTheElementIsVisible(individualAllowance.recentlyAddedUsers);
      await allowancePage.verifier.verifyTheElementIsEnabled(allowancePage.saveButton);
      await allowancePage.clickOnElement(allowancePage.saveButton, {
        stepInfo: 'Clicking save button',
      });
      await allowancePage.validateToastMessage('Saved changes successfully');

      await allowancePage.verifier.verifyTheElementIsVisible(allowancePage.individualAllowanceGreenTick);
      await allowancePage.verifier.verifyTheElementIsVisible(allowancePage.removeIndividualAllowance);
      await allowancePage.verifier.verifyTheElementIsVisible(allowancePage.editIndividualAllowance);

      await allowancePage.monthlyAllowanceIllustration.waitFor({ state: 'visible' });
      await allowancePage.verifier.verifyElementHasText(
        allowancePage.monthlyAllowanceIllustrationDescriptionText,
        '*Monthly totals are for guidance only, based on latest edits and current active users.'
      );
      await allowancePage.verifier.verifyTheElementIsVisible(allowancePage.monthlyAllowanceIllustrationIndividualRow);
      const individualAllowanceAmount = await allowancePage.monthlyAllowanceIllustrationIndividualColumn
        .nth(2)
        .textContent();
      expect(currentAmount).toEqual(Number(individualAllowanceAmount));
    }
  );

  test(
    '[RC-2491] Verify audience allowances page',
    {
      tag: [REWARD_FEATURE_TAGS.REWARDS_ALLOWANCE, TestPriority.P0, TestGroupType.REGRESSION],
    },
    async ({ appManagerFixture }) => {
      tagTest(test.info(), {
        description: 'Verify audience allowances page',
        zephyrTestId: 'RC-2491',
        storyId: 'RC-2491',
      });

      const manageRewardsPage = new ManageRewardsOverviewPage(appManagerFixture.page);
      const allowancePage = new RewardsAllowancePage(appManagerFixture.page);

      await manageRewardsPage.verifier.waitUntilPageHasNavigatedTo('/manage/recognition/rewards/overview');
      await manageRewardsPage.verifier.verifyTheElementIsVisible(manageRewardsPage.header);

      await manageRewardsPage.rewardsAllowance.visitAllowancePage();
      await allowancePage.verifier.waitUntilPageHasNavigatedTo('/manage/recognition/rewards/peer-gifting/allowances');
      await allowancePage.verifier.verifyTheElementIsVisible(allowancePage.header);
      await allowancePage.verifier.verifyTheElementIsVisible(allowancePage.audienceAllowance);
      await allowancePage.verifier.verifyElementHasText(allowancePage.audienceAllowanceHeading, 'Audience allowances');
      const audienceAllowanceText = 'Add monthly allowances for users in selected audiences';
      await allowancePage.verifier.verifyElementHasText(
        allowancePage.audienceAllowanceDescription,
        audienceAllowanceText
      );

      if (await allowancePage.verifier.isTheElementVisible(allowancePage.removeAudienceAllowance)) {
        await allowancePage.clickOnElement(allowancePage.editAudienceAllowance, {
          stepInfo: 'Clicking edit audience allowance button',
        });
      } else {
        await allowancePage.clickOnElement(allowancePage.addAudienceAllowance, {
          stepInfo: 'Clicking add audience allowance button',
        });
      }
      const audienceAllowance = new RewardsAllowance(appManagerFixture.page).rewardsAudienceAllowance;
      await audienceAllowance.validateTheAudienceAllowanceElements();
    }
  );

  test(
    '[RC-3119] Verify dialog for unsaved changes when audience in audience allowance page navigates to different page or refreshes',
    {
      tag: [REWARD_FEATURE_TAGS.REWARDS_ALLOWANCE, TestPriority.P0, TestGroupType.REGRESSION],
    },
    async ({ appManagerFixture }) => {
      tagTest(test.info(), {
        description:
          'Verify dialog for unsaved changes when audience in audience allowance page navigates to different page or refreshes',
        zephyrTestId: 'RC-3119',
        storyId: 'RC-3119',
      });

      const manageRewardsPage = new ManageRewardsOverviewPage(appManagerFixture.page);
      const allowancePage = new RewardsAllowancePage(appManagerFixture.page);
      const audiencePage = new RewardsAllowance(appManagerFixture.page).rewardsAudienceAllowance;
      const amountToBeSetForAudienceAllowance = 10;
      await manageRewardsPage.rewardsAllowance.visitAllowancePage();
      await allowancePage.verifier.waitUntilPageHasNavigatedTo('/manage/recognition/rewards/peer-gifting/allowances');
      await allowancePage.verifier.verifyTheElementIsVisible(allowancePage.header);
      await allowancePage.verifier.verifyTheElementIsVisible(allowancePage.audienceAllowance);
      await allowancePage.verifier.verifyElementHasText(allowancePage.audienceAllowanceHeading, 'Audience allowances');
      const audienceAllowanceDescription = 'Add monthly allowances for users in selected audiences';
      await allowancePage.verifier.verifyElementHasText(
        allowancePage.audienceAllowanceDescription,
        audienceAllowanceDescription
      );

      if (
        await allowancePage.verifier.isTheElementVisible(allowancePage.removeAudienceAllowance, {
          timeout: 5000,
        })
      ) {
        if (await allowancePage.removeAudienceAllowance.isEnabled()) {
          await allowancePage.removeTheExistingAllowance('audience');
          await allowancePage.validateToastMessage('Saved changes successfully');
          await allowancePage.clickOnElement(allowancePage.addAudienceAllowance, {
            stepInfo: 'Clicking add audience allowance button',
          });
        } else {
          await allowancePage.clickOnElement(allowancePage.editAudienceAllowance, {
            stepInfo: 'Clicking edit audience allowance button',
          });
        }
      } else {
        await allowancePage.clickOnElement(allowancePage.addAudienceAllowance, {
          stepInfo: 'Clicking add audience allowance button',
        });
      }

      await audiencePage.addOneAudienceInTheAllowance(amountToBeSetForAudienceAllowance);
      const currentAmount = await audiencePage.getTheCurrentAmountForLatestAddedAudience();
      expect(currentAmount).toBe(amountToBeSetForAudienceAllowance);

      await allowancePage.clickOnElement(allowancePage.cancelButton, { force: true });
      allowancePage.page.once('dialog', async dialog => {
        await dialog.dismiss();
      });

      const currentAmountAfterCancel = await audiencePage.getTheCurrentAmountForLatestAddedAudience();
      expect(currentAmountAfterCancel).toBe(amountToBeSetForAudienceAllowance);

      await allowancePage.clickOnElement(allowancePage.cancelButton);
      allowancePage.page.once('dialog', async dialog => {
        await dialog.accept();
      });

      await manageRewardsPage.rewardsAllowance.visitAllowancePage();
      await allowancePage.verifier.verifyTheElementIsVisible(allowancePage.addAudienceAllowance);
      await allowancePage.clickOnElement(allowancePage.addAudienceAllowance, {
        stepInfo: 'Clicking add audience allowance button',
      });
      await allowancePage.verifier.verifyTheElementIsVisible(audiencePage.addAudienceButton);
    }
  );

  test(
    '[RC-3120] Verify dialog for unsaved changes when user in individual allowance page navigates to different page or refreshes',
    {
      tag: [REWARD_FEATURE_TAGS.REWARDS_ALLOWANCE, TestPriority.P0, TestGroupType.REGRESSION],
    },
    async ({ appManagerFixture }) => {
      tagTest(test.info(), {
        description:
          'Verify dialog for unsaved changes when user in individual allowance page navigates to different page or refreshes',
        zephyrTestId: 'RC-3120',
        storyId: 'RC-3120',
      });

      const manageRewardsPage = new ManageRewardsOverviewPage(appManagerFixture.page);
      const allowancePage = new RewardsAllowancePage(appManagerFixture.page);
      const audiencePage = new RewardsAllowance(appManagerFixture.page).rewardsIndividualAllowance;
      const amountToBeSetForIndividualAllowance = 10;
      await manageRewardsPage.rewardsAllowance.visitAllowancePage();
      await allowancePage.verifier.waitUntilPageHasNavigatedTo('/manage/recognition/rewards/peer-gifting/allowances');
      await allowancePage.verifier.verifyTheElementIsVisible(allowancePage.header);
      await allowancePage.verifier.verifyTheElementIsVisible(allowancePage.individualAllowance);
      await allowancePage.verifier.verifyElementHasText(
        allowancePage.individualAllowanceHeading,
        'Individual allowances'
      );
      const individualAllowanceDescription = 'Add individual monthly allowances for selected users';
      await allowancePage.verifier.verifyElementHasText(
        allowancePage.individualAllowanceDescription,
        individualAllowanceDescription
      );

      let status: string;
      if (await allowancePage.verifier.isTheElementVisible(allowancePage.removeIndividualAllowance)) {
        if (await allowancePage.removeIndividualAllowance.isEnabled()) {
          await allowancePage.removeTheExistingAllowance('individual');
          await allowancePage.validateToastMessage('Saved changes successfully');
          await allowancePage.clickOnElement(allowancePage.addIndividualAllowance, {
            stepInfo: 'Clicking add individual allowance button',
          });
          status = 'removed the added';
        } else {
          await allowancePage.clickOnElement(allowancePage.editIndividualAllowance, {
            stepInfo: 'Clicking edit individual allowance button',
          });
          status = 'edited the existing';
        }
      } else {
        await allowancePage.clickOnElement(allowancePage.addIndividualAllowance, {
          stepInfo: 'Clicking add individual allowance button',
        });
        status = 'adding new';
      }

      await audiencePage.addOneIndividualUserInTheAllowance(amountToBeSetForIndividualAllowance);
      const currentAmount = await audiencePage.getTheCurrentAmountForLatestAddedUserInIndividualAllowance();
      expect(currentAmount).toBe(amountToBeSetForIndividualAllowance);

      await allowancePage.clickOnElement(allowancePage.cancelButton, { force: true });
      allowancePage.page.once('dialog', async dialog => {
        await dialog.dismiss();
      });

      const currentAmountAfterCancel = await audiencePage.getTheCurrentAmountForLatestAddedUserInIndividualAllowance();
      expect(currentAmountAfterCancel).toBe(amountToBeSetForIndividualAllowance);

      await allowancePage.clickOnElement(allowancePage.cancelButton);
      allowancePage.page.once('dialog', async dialog => {
        await dialog.accept();
      });

      await manageRewardsPage.rewardsAllowance.visitAllowancePage();
      if (status === 'removed the added') {
        await allowancePage.verifier.verifyTheElementIsVisible(allowancePage.addIndividualAllowance);
        await allowancePage.clickOnElement(allowancePage.addIndividualAllowance, {
          stepInfo: 'Clicking add individual allowance button',
        });
        await allowancePage.verifier.verifyTheElementIsVisible(audiencePage.addIndividualButton);
      } else if (status === 'edited the existing') {
        await allowancePage.verifier.verifyTheElementIsVisible(allowancePage.editIndividualAllowance);
        await allowancePage.clickOnElement(allowancePage.editIndividualAllowance, {
          stepInfo: 'Clicking edit individual allowance button',
        });
      } else {
        await allowancePage.verifier.verifyTheElementIsVisible(allowancePage.editIndividualAllowance);
        await allowancePage.clickOnElement(allowancePage.editIndividualAllowance, {
          stepInfo: 'Clicking edit individual allowance button',
        });
      }
    }
  );

  test(
    '[RC-2138] Validate allowances index page for individual allowances',
    {
      tag: [REWARD_FEATURE_TAGS.REWARDS_ALLOWANCE, TestPriority.P0, TestGroupType.REGRESSION],
    },
    async ({ appManagerFixture }) => {
      tagTest(test.info(), {
        description: 'Validate allowances index page for individual allowances',
        zephyrTestId: 'RC-2138',
        storyId: 'RC-2138',
      });

      const manageRewardsPage = new ManageRewardsOverviewPage(appManagerFixture.page);
      const allowancePage = new RewardsAllowancePage(appManagerFixture.page);
      const individualAllowance = new RewardsAllowance(appManagerFixture.page).rewardsIndividualAllowance;
      const amountToBeSetForIndividualAllowance = 10;
      let currentAmount: number;
      await manageRewardsPage.rewardsAllowance.visitAllowancePage();
      await allowancePage.verifier.waitUntilPageHasNavigatedTo('/manage/recognition/rewards/peer-gifting/allowances');
      await allowancePage.verifier.verifyTheElementIsVisible(allowancePage.header);
      await allowancePage.verifier.verifyTheElementIsVisible(allowancePage.individualAllowance);
      await allowancePage.verifier.verifyElementHasText(
        allowancePage.individualAllowanceHeading,
        'Individual allowances'
      );
      const individualAllowanceDescription = 'Add individual monthly allowances for selected users';
      await allowancePage.verifier.verifyElementHasText(
        allowancePage.individualAllowanceDescription,
        individualAllowanceDescription
      );

      if (await allowancePage.verifier.isTheElementVisible(allowancePage.removeIndividualAllowance)) {
        if (await allowancePage.removeIndividualAllowance.isEnabled()) {
          await allowancePage.removeTheExistingAllowance('individual');
          await allowancePage.validateToastMessage('Saved changes successfully');
          await allowancePage.clickOnElement(allowancePage.addIndividualAllowance, {
            stepInfo: 'Clicking add individual allowance button',
          });
        } else {
          await allowancePage.clickOnElement(allowancePage.editIndividualAllowance, {
            stepInfo: 'Clicking edit individual allowance button',
          });
        }
      } else {
        await allowancePage.clickOnElement(allowancePage.addIndividualAllowance, {
          stepInfo: 'Clicking add individual allowance button',
        });
      }

      await individualAllowance.addOneIndividualUserInTheAllowance(amountToBeSetForIndividualAllowance);
      currentAmount = await individualAllowance.getTheCurrentAmountForLatestAddedUserInIndividualAllowance();
      expect(currentAmount).toBe(amountToBeSetForIndividualAllowance);

      await individualAllowance.increaseTheIndividualAmountBy(5);
      currentAmount = await individualAllowance.getTheCurrentAmountForLatestAddedUserInIndividualAllowance();
      expect(currentAmount).toBe(amountToBeSetForIndividualAllowance + 5);

      await individualAllowance.decreaseTheIndividualAmountBy(2);
      currentAmount = await individualAllowance.getTheCurrentAmountForLatestAddedUserInIndividualAllowance();
      expect(currentAmount).toBe(amountToBeSetForIndividualAllowance + 3);

      await allowancePage.clickOnElement(allowancePage.saveButton, {
        stepInfo: 'Clicking save button',
      });

      await allowancePage.verifier.verifyTheElementIsVisible(allowancePage.editIndividualAllowance);
      await allowancePage.clickOnElement(allowancePage.editIndividualAllowance, {
        stepInfo: 'Clicking edit individual allowance button',
      });
      currentAmount = await individualAllowance.getTheCurrentAmountForLatestAddedUserInIndividualAllowance();
      await allowancePage.clickOnElement(allowancePage.cancelButton, {
        stepInfo: 'Clicking cancel button',
      });

      await allowancePage.monthlyAllowanceIllustration.waitFor({ state: 'visible' });
      await allowancePage.verifier.verifyElementHasText(
        allowancePage.monthlyAllowanceIllustrationDescriptionText,
        '*Monthly totals are for guidance only, based on latest edits and current active users.'
      );
      await allowancePage.verifier.verifyTheElementIsVisible(allowancePage.monthlyAllowanceIllustrationIndividualRow);
      await allowancePage.verifier.verifyTheElementIsVisible(
        allowancePage.monthlyAllowanceIllustrationIndividualColumn.last()
      );
    }
  );

  test(
    '[RC-3240] Validate the panel text in Manager/Audience allowances page',
    {
      tag: [REWARD_FEATURE_TAGS.REWARDS_ALLOWANCE, TestPriority.P0, TestGroupType.REGRESSION],
    },
    async ({ appManagerFixture }) => {
      tagTest(test.info(), {
        description: 'Validate the panel text in Manager/Audience allowances page',
        zephyrTestId: 'RC-3240',
        storyId: 'RC-3240',
      });

      const manageRewardsPage = new ManageRewardsOverviewPage(appManagerFixture.page);
      const allowancePage = new RewardsAllowancePage(appManagerFixture.page);
      const manageAllowance = new RewardsAllowance(appManagerFixture.page).rewardsManagerAllowance;
      await manageRewardsPage.rewardsAllowance.visitAllowancePage();
      await allowancePage.verifier.waitUntilPageHasNavigatedTo('/manage/recognition/rewards/peer-gifting/allowances');
      await allowancePage.verifier.verifyTheElementIsVisible(allowancePage.header);
      await allowancePage.verifier.verifyTheElementIsVisible(allowancePage.managerAllowance);
      await allowancePage.verifier.verifyElementHasText(allowancePage.managerAllowanceHeading, 'Manager allowances');
      const individualAllowanceDescription = 'Add monthly allowances for people managers';
      await allowancePage.verifier.verifyElementHasText(
        allowancePage.managerAllowanceDescription,
        individualAllowanceDescription
      );

      if (await allowancePage.verifier.isTheElementVisible(allowancePage.removeManagerAllowance)) {
        await allowancePage.clickOnElement(allowancePage.editManagerAllowance, {
          stepInfo: 'Clicking edit manager allowance button',
        });
      } else {
        await allowancePage.clickOnElement(allowancePage.addManagerAllowance, {
          stepInfo: 'Clicking add manager allowance button',
        });
      }

      await manageAllowance.validateTheManagerAllowanceElements();

      const audienceAllowance = new RewardsAllowance(appManagerFixture.page).rewardsAudienceAllowance;
      await manageRewardsPage.rewardsAllowance.visitAllowancePage();
      await allowancePage.verifier.verifyTheElementIsVisible(allowancePage.header);
      await allowancePage.verifier.verifyTheElementIsVisible(allowancePage.audienceAllowance);
      await allowancePage.verifier.verifyElementHasText(allowancePage.audienceAllowanceHeading, 'Audience allowances');
      const individualAllowanceDescription2 = 'Add monthly allowances for users in selected audiences';
      await allowancePage.verifier.verifyElementHasText(
        allowancePage.audienceAllowanceDescription,
        individualAllowanceDescription2
      );

      if (await allowancePage.verifier.isTheElementVisible(allowancePage.removeAudienceAllowance)) {
        await allowancePage.clickOnElement(allowancePage.editAudienceAllowance, {
          stepInfo: 'Clicking edit audience allowance button',
        });
      } else {
        await allowancePage.clickOnElement(allowancePage.addAudienceAllowance, {
          stepInfo: 'Clicking add audience allowance button',
        });
      }

      await audienceAllowance.validateTheAudienceAllowanceElements();
    }
  );

  test(
    '[RC-3454] Validate update allowance estimation loading UI',
    {
      tag: [REWARD_FEATURE_TAGS.REWARDS_ALLOWANCE, TestPriority.P0, TestGroupType.REGRESSION],
    },
    async ({ appManagerFixture }) => {
      tagTest(test.info(), {
        description: 'Validate update allowance estimation loading UI',
        zephyrTestId: 'RC-3454',
        storyId: 'RC-3454',
      });

      const manageRewardsPage = new ManageRewardsOverviewPage(appManagerFixture.page);
      const allowancePage = new RewardsAllowancePage(appManagerFixture.page);
      const individualAllowance = new RewardsAllowance(appManagerFixture.page).rewardsIndividualAllowance;
      const amountToBeSetForIndividualAllowance = 10;

      await manageRewardsPage.verifier.waitUntilPageHasNavigatedTo('/manage/recognition/rewards/overview');
      await manageRewardsPage.verifier.verifyTheElementIsVisible(manageRewardsPage.header);

      await manageRewardsPage.rewardsAllowance.visitAllowancePage();
      await allowancePage.verifier.waitUntilPageHasNavigatedTo('/manage/recognition/rewards/peer-gifting/allowances');
      await allowancePage.verifier.verifyTheElementIsVisible(allowancePage.header);
      await allowancePage.verifier.verifyTheElementIsVisible(allowancePage.individualAllowance);
      await allowancePage.verifier.verifyElementHasText(
        allowancePage.individualAllowanceHeading,
        'Individual allowances'
      );
      const individualAllowanceDescription = 'Add individual monthly allowances for selected users';
      await allowancePage.verifier.verifyElementHasText(
        allowancePage.individualAllowanceDescription,
        individualAllowanceDescription
      );

      if (await allowancePage.verifier.isTheElementVisible(allowancePage.removeIndividualAllowance)) {
        if (await allowancePage.removeIndividualAllowance.isEnabled()) {
          await allowancePage.removeTheExistingAllowance('individual');
          await allowancePage.validateToastMessage('Saved changes successfully');
          await allowancePage.clickOnElement(allowancePage.addIndividualAllowance, {
            stepInfo: 'Clicking add individual allowance button',
          });
        } else {
          await allowancePage.clickOnElement(allowancePage.editIndividualAllowance, {
            stepInfo: 'Clicking edit individual allowance button',
          });
        }
      } else {
        await allowancePage.clickOnElement(allowancePage.addIndividualAllowance, {
          stepInfo: 'Clicking add individual allowance button',
        });
      }

      await individualAllowance.addOneIndividualUserInTheAllowance(amountToBeSetForIndividualAllowance);
      const currentAmount = await individualAllowance.getTheCurrentAmountForLatestAddedUserInIndividualAllowance();
      expect(currentAmount).toBe(amountToBeSetForIndividualAllowance);

      await allowancePage.clickOnElement(allowancePage.saveButton, {
        stepInfo: 'Clicking save button',
      });

      await allowancePage.monthlyAllowanceIllustration.waitFor({ state: 'visible' });
      await allowancePage.verifier.verifyElementHasText(
        allowancePage.monthlyAllowanceIllustrationDescriptionText,
        '*Monthly totals are for guidance only, based on latest edits and current active users.'
      );
      await allowancePage.verifier.verifyTheElementIsVisible(allowancePage.monthlyAllowanceIllustrationIndividualRow);
      const individualAllowanceUserCount = await allowancePage.monthlyAllowanceIllustrationIndividualColumn
        .nth(1)
        .textContent();
      expect(1).toEqual(Number(individualAllowanceUserCount));
      const individualAllowanceAmount = await allowancePage.monthlyAllowanceIllustrationIndividualColumn
        .nth(2)
        .textContent();
      expect(currentAmount).toEqual(Number(individualAllowanceAmount));
    }
  );

  test(
    '[RC-2460] Validate index page for manager allowances',
    {
      tag: [REWARD_FEATURE_TAGS.REWARDS_ALLOWANCE, TestPriority.P0, TestGroupType.REGRESSION],
    },
    async ({ appManagerFixture }) => {
      tagTest(test.info(), {
        description: 'Validate index page for manager allowances',
        zephyrTestId: 'RC-2460',
        storyId: 'RC-2460',
      });

      const manageRewardsPage = new ManageRewardsOverviewPage(appManagerFixture.page);
      const allowancePage = new RewardsAllowancePage(appManagerFixture.page);
      const amountToBeSetForFixedMonthlyAllowance = 10;
      const amountToBeSetForVariableMonthlyAllowance = 5;

      await manageRewardsPage.verifier.waitUntilPageHasNavigatedTo('/manage/recognition/rewards/overview');
      await manageRewardsPage.verifier.verifyTheElementIsVisible(manageRewardsPage.header);

      await manageRewardsPage.rewardsAllowance.visitAllowancePage();
      await allowancePage.verifier.waitUntilPageHasNavigatedTo('/manage/recognition/rewards/peer-gifting/allowances');
      await allowancePage.verifier.verifyTheElementIsVisible(allowancePage.header);
      await allowancePage.verifier.verifyTheElementIsVisible(allowancePage.managerAllowance);
      await allowancePage.verifier.verifyElementHasText(allowancePage.managerAllowanceHeading, 'Manager allowances');
      const managerAllowanceDescription = 'Add monthly allowances for people managers';
      await allowancePage.verifier.verifyElementHasText(
        allowancePage.managerAllowanceDescription,
        managerAllowanceDescription
      );

      if (await allowancePage.verifier.isTheElementVisible(allowancePage.removeManagerAllowance)) {
        if (await allowancePage.removeManagerAllowance.isEnabled()) {
          await allowancePage.removeTheExistingAllowance('manager');
          await allowancePage.validateToastMessage('Saved changes successfully');
          await allowancePage.clickOnElement(allowancePage.addManagerAllowance, {
            stepInfo: 'Clicking add manager allowance button',
          });
        } else {
          await allowancePage.clickOnElement(allowancePage.editManagerAllowance, {
            stepInfo: 'Clicking edit manager allowance button',
          });
        }
      } else {
        await allowancePage.clickOnElement(allowancePage.addManagerAllowance, {
          stepInfo: 'Clicking add manager allowance button',
        });
      }

      const headingText = 'Manager allowances';
      const headingDescriptionLine1 = `Add monthly allowances for simpplifiers managers.`;
      const headingDescriptionLine2 =
        'Allowances refresh on the 1st of every month. Unused points expire and are not charged for.';
      await allowancePage.validateAllowanceAddAndEditPageHeader(
        headingText,
        headingDescriptionLine1,
        headingDescriptionLine2
      );
      await allowancePage.validateTheManagerAllowanceElements();

      await allowancePage.enterThePointAmount(0);
      await allowancePage.clickOnElement(allowancePage.fixedCurrencyConversionInfoIcon, {
        stepInfo: 'Clicking fixed currency conversion info icon',
      });
      await allowancePage.verifier.verifyTheElementIsVisible(allowancePage.fixedPointAmountLimitError);

      await allowancePage.increaseTheFXMonthlyAmountBy(amountToBeSetForFixedMonthlyAllowance);
      const currentAmount = await allowancePage.getTheCurrentAmountInFixedInputBox();
      expect(currentAmount).toBe(amountToBeSetForFixedMonthlyAllowance);

      await allowancePage.saveAmount();
      await allowancePage.validateToastMessage('Saved changes successfully');

      await allowancePage.verifier.verifyTheElementIsVisible(allowancePage.editManagerAllowance);
      await allowancePage.clickOnElement(allowancePage.editManagerAllowance, {
        stepInfo: 'Clicking edit manager allowance button',
      });

      await allowancePage.decreaseTheFXMonthlyAmountBy(2);
      const currentAmountAfterDecrease = await allowancePage.getTheCurrentAmountInFixedInputBox();
      expect(currentAmountAfterDecrease).toBe(amountToBeSetForFixedMonthlyAllowance - 2);

      await allowancePage.saveAmount();
      await allowancePage.validateToastMessage('Saved changes successfully');

      await allowancePage.verifier.verifyTheElementIsVisible(allowancePage.editManagerAllowance);
      await allowancePage.clickOnElement(allowancePage.editManagerAllowance, {
        stepInfo: 'Clicking edit manager allowance button',
      });

      await allowancePage.addTheVariableAmount(amountToBeSetForVariableMonthlyAllowance);
      const currentVariableAmount = await allowancePage.getTheCurrentAmountInVariableInputBox();
      expect(currentVariableAmount).toBe(amountToBeSetForVariableMonthlyAllowance);

      await allowancePage.saveAmount();
      await allowancePage.validateToastMessage('Saved changes successfully');

      await allowancePage.verifier.verifyTheElementIsVisible(allowancePage.managerAllowanceIcon);
      await allowancePage.verifier.verifyTheElementIsVisible(allowancePage.managerAllowanceGreenTick);
      await allowancePage.verifier.verifyTheElementIsVisible(allowancePage.removeManagerAllowance);
      await allowancePage.verifier.verifyTheElementIsVisible(allowancePage.editManagerAllowance);
    }
  );

  test(
    '[RC-2511] Verify error message when offline and reload functionality',
    {
      tag: [REWARD_FEATURE_TAGS.REWARDS_ALLOWANCE, TestPriority.P0, TestGroupType.REGRESSION],
    },
    async ({ appManagerFixture }) => {
      tagTest(test.info(), {
        description: 'Verify error message when offline and reload functionality',
        zephyrTestId: 'RC-2511',
        storyId: 'RC-2511',
      });

      const manageRewardsPage = new ManageRewardsOverviewPage(appManagerFixture.page);
      const allowancePage = new RewardsAllowancePage(appManagerFixture.page);
      const audiencePage = new RewardsAllowance(appManagerFixture.page).rewardsAudienceAllowance;

      await manageRewardsPage.verifier.waitUntilPageHasNavigatedTo('/manage/recognition/rewards/overview');
      await manageRewardsPage.verifier.verifyTheElementIsVisible(manageRewardsPage.header);

      await allowancePage.visitToAllowanceWithInterruption();
      await audiencePage.verifyErrorMessage();
      await audiencePage.clickOnReloadButtonWithoutAnyInterruption();
    }
  );

  test(
    '[RC-5409] Validate the single allowance can not be deleted in the Rewards Allowance',
    {
      tag: [REWARD_FEATURE_TAGS.REWARDS_ALLOWANCE, TestPriority.P0, TestGroupType.REGRESSION],
    },
    async ({ appManagerFixture }) => {
      tagTest(test.info(), {
        description: 'Validate the single allowance can not be deleted in the Rewards Allowance',
        zephyrTestId: 'RC-5409',
        storyId: 'RC-5409',
      });

      const manageRewardsPage = new ManageRewardsOverviewPage(appManagerFixture.page);
      const allowancePage = new RewardsAllowancePage(appManagerFixture.page);

      await manageRewardsPage.verifier.waitUntilPageHasNavigatedTo('/manage/recognition/rewards/overview');
      await manageRewardsPage.verifier.verifyTheElementIsVisible(manageRewardsPage.header);

      await manageRewardsPage.rewardsAllowance.visitAllowancePage();
      await allowancePage.verifier.waitUntilPageHasNavigatedTo('/manage/recognition/rewards/peer-gifting/allowances');
      await allowancePage.verifier.verifyTheElementIsVisible(allowancePage.header);

      await allowancePage.checkTheSingleDeletion(appManagerFixture.page);
    }
  );

  test(
    '[RC-3325] Validate that the user cannot add/edit/remove any allowance when Allowances are refreshing',
    {
      tag: [REWARD_FEATURE_TAGS.REWARDS_ALLOWANCE, REWARD_FEATURE_TAGS.REWARDS_DB_CASES, TestPriority.P3],
    },
    async ({ appManagerFixture }) => {
      tagTest(test.info(), {
        description: 'Validate that the user cannot add any allowance when Allowances are refreshing',
        zephyrTestId: 'RC-3325',
        storyId: 'RC-3325',
      });
      tagTest(test.info(), {
        description: 'Validate that the user cannot edit any allowance when Allowances are refreshing',
        zephyrTestId: 'RC-3323',
        storyId: 'RC-3323',
      });
      tagTest(test.info(), {
        description: 'Validate that the user cannot remove any allowance when Allowances are refreshing',
        zephyrTestId: 'RC-3324',
        storyId: 'RC-3324',
      });

      const manageRewardsPage = new ManageRewardsOverviewPage(appManagerFixture.page);
      await manageRewardsPage.loadPage();
      await manageRewardsPage.verifyThePageIsLoaded();
      await manageRewardsPage.verifier.waitUntilPageHasNavigatedTo('/manage/recognition/rewards/overview');
      await manageRewardsPage.verifier.verifyTheElementIsVisible(manageRewardsPage.header);

      const tenantCode = await appManagerFixture.page.evaluate(() => {
        return (window as any).Simpplr?.Settings?.accountId;
      });
      try {
        await TestDbScenarios.setupAllowanceRefresh(tenantCode);
        await manageRewardsPage.rewardsAllowance.visitAllowancePage();
        await manageRewardsPage.rewardsAllowance.mockTheAllowances(false, false, false, false);
        //Add button tooltip
        await manageRewardsPage.validateTheAddButtonTooltip('Users allowance');
        await manageRewardsPage.validateTheAddButtonTooltip('Manager allowances');
        await manageRewardsPage.validateTheAddButtonTooltip('Audience allowances');
        await manageRewardsPage.validateTheAddButtonTooltip('Individual allowances');
        await manageRewardsPage.rewardsAllowance.mockTheAllowances(true, true, true, true);
        //Edit button tooltip
        await manageRewardsPage.validateTheEditButtonTooltip('Users allowance');
        await manageRewardsPage.validateTheEditButtonTooltip('Manager allowances');
        await manageRewardsPage.validateTheEditButtonTooltip('Audience allowances');
        await manageRewardsPage.validateTheEditButtonTooltip('Individual allowances');
        //Remove button tooltip
        await manageRewardsPage.validateTheRemoveButtonTooltip('Users allowance');
        await manageRewardsPage.validateTheRemoveButtonTooltip('Manager allowances');
        await manageRewardsPage.validateTheRemoveButtonTooltip('Audience allowances');
        await manageRewardsPage.validateTheRemoveButtonTooltip('Individual allowances');
        await manageRewardsPage.rewardsAllowance.removeRewardAPIMocks();
        await TestDbScenarios.cleanupAllowanceRefresh(tenantCode);
      } catch (e) {
        console.log(`${e}`);
      } finally {
        await TestDbScenarios.cleanupAllowanceRefresh(tenantCode);
      }
    }
  );

  test(
    '[RC-3118] Verify dialog for unsaved changes when user in manager allowance page navigates to different page or refreshes',
    {
      tag: [REWARD_FEATURE_TAGS.REWARDS_ALLOWANCE, TestPriority.P0, TestGroupType.REGRESSION],
    },
    async ({ appManagerFixture }) => {
      tagTest(test.info(), {
        description:
          'Verify dialog for unsaved changes when user in manager allowance page navigates to different page or refreshes',
        zephyrTestId: 'RC-3118',
        storyId: 'RC-3118',
      });

      const manageRewardsPage = new ManageRewardsOverviewPage(appManagerFixture.page);
      const allowancePage = new RewardsAllowancePage(appManagerFixture.page);
      const managerAllowance = new RewardsAllowance(appManagerFixture.page).rewardsManagerAllowance;
      const amountToBeSetForIndividualAllowance = 10;

      await manageRewardsPage.verifier.waitUntilPageHasNavigatedTo('/manage/recognition/rewards/overview');
      await manageRewardsPage.verifier.verifyTheElementIsVisible(manageRewardsPage.header);

      await manageRewardsPage.rewardsAllowance.visitAllowancePage();
      await allowancePage.verifier.waitUntilPageHasNavigatedTo('/manage/recognition/rewards/peer-gifting/allowances');
      await allowancePage.verifier.verifyTheElementIsVisible(allowancePage.header);
      await allowancePage.verifier.verifyTheElementIsVisible(allowancePage.managerAllowance);
      await allowancePage.verifier.verifyElementHasText(allowancePage.managerAllowanceHeading, 'Manager allowances');
      const individualAllowanceDescription = 'Add monthly allowances for people managers';
      await allowancePage.verifier.verifyElementHasText(
        allowancePage.managerAllowanceDescription,
        individualAllowanceDescription
      );

      if (await allowancePage.verifier.isTheElementVisible(allowancePage.removeManagerAllowance)) {
        if (await allowancePage.removeManagerAllowance.isEnabled()) {
          await allowancePage.removeTheExistingAllowance('manager');
          await allowancePage.validateToastMessage('Saved changes successfully');
          await allowancePage.clickOnElement(allowancePage.addManagerAllowance, {
            stepInfo: 'Clicking add manager allowance button',
          });
        } else {
          await allowancePage.clickOnElement(allowancePage.editManagerAllowance, {
            stepInfo: 'Clicking edit manager allowance button',
          });
        }
      } else {
        await allowancePage.clickOnElement(allowancePage.addManagerAllowance, {
          stepInfo: 'Clicking add manager allowance button',
        });
      }

      await managerAllowance.enterThePointAmount(amountToBeSetForIndividualAllowance);
      const currentAmount = await managerAllowance.getTheCurrentAmountInFixedInputBox();
      expect(currentAmount).toBe(amountToBeSetForIndividualAllowance);

      await allowancePage.clickOnElement(allowancePage.cancelButton, { force: true });
      allowancePage.page.once('dialog', async dialog => {
        await dialog.dismiss();
      });

      const currentAmountAfterCancel = await allowancePage.getTheCurrentAmountInFixedInputBox();
      expect(currentAmountAfterCancel).toBe(amountToBeSetForIndividualAllowance);

      await allowancePage.clickOnElement(allowancePage.cancelButton);
      allowancePage.page.once('dialog', async dialog => {
        await dialog.accept();
      });

      await manageRewardsPage.rewardsAllowance.visitAllowancePage();
      await allowancePage.verifier.verifyTheElementIsVisible(allowancePage.addManagerAllowance);
      await allowancePage.clickOnElement(allowancePage.addManagerAllowance, {
        stepInfo: 'Clicking add manager allowance button',
      });
      const currentAmountAfterAccept = await allowancePage.getTheCurrentAmountInFixedInputBox();
      expect(currentAmountAfterAccept).toBe(0);
    }
  );
});
