import { expect } from '@playwright/test';
import { REWARD_FEATURE_TAGS, REWARD_SUITE_TAGS } from '@rewards/constants/testTags';
import { rewardTestFixture as test } from '@rewards/fixtures/rewardFixture';
import { ManageRewardsOverviewPage } from '@rewards-pages/manage-rewards/manage-rewards-overview-page';
import { RewardsAllowancePage } from '@rewards-pages/manage-rewards/rewards-allowance-page';

import { TestPriority } from '@core/constants/testPriority';
import { TestGroupType } from '@core/constants/testType';
import { tagTest } from '@core/utils/testDecorator';

test.describe('allowance Flows', { tag: [REWARD_SUITE_TAGS.MANAGE_REWARD] }, () => {
  test.beforeEach(async ({ appManagerFixture }) => {
    const manageRewardsPage = new ManageRewardsOverviewPage(appManagerFixture.page);
    await manageRewardsPage.loadPageWithHarness();
    await manageRewardsPage.verifyThePageIsLoaded();
    await manageRewardsPage.enableTheRewardsAndPeerGiftingIfDisabled();
  });

  test(
    '[RC-2448] Verify user allowances index page for user allowances',
    {
      tag: [REWARD_FEATURE_TAGS.REWARDS_ALLOWANCE, TestPriority.P0, TestGroupType.REGRESSION],
    },
    async ({ appManagerFixture }) => {
      tagTest(test.info(), {
        description: 'Verify user allowances index page for user allowances',
        zephyrTestId: 'RC-2448',
        storyId: 'RC-2448',
      });

      const manageRewardsPage = new ManageRewardsOverviewPage(appManagerFixture.page);
      const allowancePage = new RewardsAllowancePage(appManagerFixture.page);
      const amountToBeSetForUserAllowance = 10;

      await manageRewardsPage.verifier.waitUntilPageHasNavigatedTo('/manage/recognition/rewards/overview');
      await manageRewardsPage.verifier.verifyTheElementIsVisible(manageRewardsPage.header);

      await manageRewardsPage.rewardsAllowance.visitAllowancePage();
      await allowancePage.verifier.waitUntilPageHasNavigatedTo('/manage/recognition/rewards/peer-gifting/allowances');
      await allowancePage.verifier.verifyTheElementIsVisible(allowancePage.header);
      await allowancePage.verifier.verifyTheElementIsVisible(allowancePage.rewardsUserAllowance.userAllowanceIcon);
      await allowancePage.verifier.verifyElementHasText(
        allowancePage.rewardsUserAllowance.userAllowanceHeading,
        'Users allowance'
      );
      const userAllowanceDescription = 'Add a monthly allowance for all intranet users';
      await allowancePage.verifier.verifyElementHasText(
        allowancePage.rewardsUserAllowance.userAllowanceDescription,
        userAllowanceDescription
      );

      if (await allowancePage.verifier.isTheElementVisible(allowancePage.rewardsUserAllowance.removeUserAllowance)) {
        if (await allowancePage.rewardsUserAllowance.removeUserAllowance.isEnabled()) {
          await allowancePage.removeTheExistingAllowance('user');
          await allowancePage.validateToastMessage('Saved changes successfully');
          await allowancePage.clickOnElement(allowancePage.rewardsUserAllowance.addUserAllowance, {
            stepInfo: 'Clicking add user allowance button',
          });
        } else {
          await allowancePage.clickOnElement(allowancePage.rewardsUserAllowance.editUserAllowance, {
            stepInfo: 'Clicking edit user allowance button',
          });
        }
      } else {
        await allowancePage.clickOnElement(allowancePage.rewardsUserAllowance.addUserAllowance, {
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
      await allowancePage.rewardsUserAllowance.validateTheUsersAllowanceElements();

      await allowancePage.rewardsUserAllowance.enterThePointAmount(0);
      await allowancePage.clickOnElement(allowancePage.rewardsUserAllowance.currencyConversionInfoIcon, {
        stepInfo: 'Clicking currency conversion info icon',
      });
      await allowancePage.verifier.verifyTheElementIsVisible(allowancePage.rewardsUserAllowance.pointAmountLimitError);

      await allowancePage.rewardsUserAllowance.increaseTheAmountBy(amountToBeSetForUserAllowance);
      const currentAmount = await allowancePage.rewardsUserAllowance.getTheCurrentAmountInInputBox();
      expect(currentAmount).toBe(amountToBeSetForUserAllowance);

      await allowancePage.saveAmount();
      await allowancePage.validateToastMessage('Saved changes successfully');

      await allowancePage.verifier.verifyTheElementIsVisible(allowancePage.rewardsUserAllowance.editUserAllowance);
      await allowancePage.clickOnElement(allowancePage.rewardsUserAllowance.editUserAllowance, {
        stepInfo: 'Clicking edit user allowance button',
      });

      await allowancePage.rewardsUserAllowance.decreaseTheAmountBy(2);
      const currentAmountAfterDecrease = await allowancePage.rewardsUserAllowance.getTheCurrentAmountInInputBox();
      expect(currentAmountAfterDecrease).toBe(amountToBeSetForUserAllowance - 2);

      await allowancePage.saveAmount();
      await allowancePage.validateToastMessage('Saved changes successfully');

      await allowancePage.verifier.verifyTheElementIsVisible(allowancePage.rewardsUserAllowance.userAllowanceIcon);
      await allowancePage.verifier.verifyTheElementIsVisible(allowancePage.rewardsUserAllowance.userAllowanceGreenTick);
      await allowancePage.verifier.verifyTheElementIsVisible(allowancePage.rewardsUserAllowance.removeUserAllowance);
      await allowancePage.verifier.verifyTheElementIsVisible(allowancePage.rewardsUserAllowance.editUserAllowance);
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
      const amountToBeSetForUserAllowance = 10;

      await manageRewardsPage.verifier.waitUntilPageHasNavigatedTo('/manage/recognition/rewards/overview');
      await manageRewardsPage.verifier.verifyTheElementIsVisible(manageRewardsPage.header);

      await manageRewardsPage.rewardsAllowance.visitAllowancePage();
      await allowancePage.verifier.waitUntilPageHasNavigatedTo('/manage/recognition/rewards/peer-gifting/allowances');
      await allowancePage.verifier.verifyTheElementIsVisible(allowancePage.header);
      await allowancePage.verifier.verifyTheElementIsVisible(allowancePage.rewardsUserAllowance.userAllowanceIcon);
      await allowancePage.verifier.verifyElementHasText(
        allowancePage.rewardsUserAllowance.userAllowanceHeading,
        'Users allowance'
      );
      const userAllowanceDescription = 'Add a monthly allowance for all intranet users';
      await allowancePage.verifier.verifyElementHasText(
        allowancePage.rewardsUserAllowance.userAllowanceDescription,
        userAllowanceDescription
      );

      if (await allowancePage.verifier.isTheElementVisible(allowancePage.rewardsUserAllowance.removeUserAllowance)) {
        if (await allowancePage.rewardsUserAllowance.removeUserAllowance.isEnabled()) {
          await allowancePage.removeTheExistingAllowance('user');
          await allowancePage.validateToastMessage('Saved changes successfully');
          await allowancePage.clickOnElement(allowancePage.rewardsUserAllowance.addUserAllowance, {
            stepInfo: 'Clicking add user allowance button',
          });
        } else {
          await allowancePage.clickOnElement(allowancePage.rewardsUserAllowance.editUserAllowance, {
            stepInfo: 'Clicking edit user allowance button',
          });
        }
      } else {
        await allowancePage.clickOnElement(allowancePage.rewardsUserAllowance.addUserAllowance, {
          stepInfo: 'Clicking add user allowance button',
        });
      }

      await allowancePage.rewardsUserAllowance.increaseTheAmountBy(amountToBeSetForUserAllowance);
      const currentAmount = await allowancePage.rewardsUserAllowance.getTheCurrentAmountInInputBox();
      expect(currentAmount).toBe(amountToBeSetForUserAllowance);

      await allowancePage.clickOnElement(allowancePage.cancelButton, { force: true });
      allowancePage.page.once('dialog', async dialog => {
        await dialog.dismiss();
      });

      const currentAmountAfterCancel = await allowancePage.rewardsUserAllowance.getTheCurrentAmountInInputBox();
      expect(currentAmountAfterCancel).toBe(amountToBeSetForUserAllowance);

      await allowancePage.clickOnElement(allowancePage.cancelButton);
      allowancePage.page.once('dialog', async dialog => {
        await dialog.accept();
      });

      await manageRewardsPage.rewardsAllowance.visitAllowancePage();
      await allowancePage.verifier.verifyTheElementIsVisible(allowancePage.rewardsUserAllowance.addUserAllowance);
      await allowancePage.clickOnElement(allowancePage.rewardsUserAllowance.addUserAllowance, {
        stepInfo: 'Clicking add user allowance button',
      });
      const currentAmountAfterAccept = await allowancePage.rewardsUserAllowance.getTheCurrentAmountInInputBox();
      expect(currentAmountAfterAccept).not.toBe(amountToBeSetForUserAllowance);
    }
  );

  test(
    '[RC-2459] Verify user allowances index page for audience allowances',
    {
      tag: [REWARD_FEATURE_TAGS.REWARDS_ALLOWANCE, TestPriority.P0, TestGroupType.REGRESSION],
    },
    async ({ appManagerFixture }) => {
      tagTest(test.info(), {
        description: 'Verify user allowances index page for audience allowances',
        zephyrTestId: 'RC-2459',
        storyId: 'RC-2459',
      });

      const manageRewardsPage = new ManageRewardsOverviewPage(appManagerFixture.page);
      const allowancePage = new RewardsAllowancePage(appManagerFixture.page);
      const amountToBeSetForAudienceAllowance = 10;

      await manageRewardsPage.verifier.waitUntilPageHasNavigatedTo('/manage/recognition/rewards/overview');
      await manageRewardsPage.verifier.verifyTheElementIsVisible(manageRewardsPage.header);

      await manageRewardsPage.rewardsAllowance.visitAllowancePage();
      await allowancePage.verifier.waitUntilPageHasNavigatedTo('/manage/recognition/rewards/peer-gifting/allowances');
      await allowancePage.verifier.verifyTheElementIsVisible(allowancePage.header);
      await allowancePage.verifier.verifyTheElementIsVisible(allowancePage.rewardsAudienceAllowance.audienceAllowance);
      await allowancePage.verifier.verifyElementHasText(
        allowancePage.rewardsAudienceAllowance.audienceAllowanceHeading,
        'Audience allowances'
      );
      const userAllowanceDescription = 'Add monthly allowances for users in selected audiences';
      await allowancePage.verifier.verifyElementHasText(
        allowancePage.rewardsAudienceAllowance.audienceAllowanceDescription,
        userAllowanceDescription
      );

      if (
        await allowancePage.verifier.isTheElementVisible(allowancePage.rewardsAudienceAllowance.removeAudienceAllowance)
      ) {
        if (await allowancePage.rewardsAudienceAllowance.removeAudienceAllowance.isEnabled()) {
          await allowancePage.removeTheExistingAllowance('audience');
          await allowancePage.validateToastMessage('Saved changes successfully');
          await allowancePage.clickOnElement(allowancePage.rewardsAudienceAllowance.addAudienceAllowance, {
            stepInfo: 'Clicking add audience allowance button',
          });
        } else {
          await allowancePage.clickOnElement(allowancePage.rewardsAudienceAllowance.editAudienceAllowance, {
            stepInfo: 'Clicking edit audience allowance button',
          });
        }
      } else {
        await allowancePage.clickOnElement(allowancePage.rewardsAudienceAllowance.addAudienceAllowance, {
          stepInfo: 'Clicking add audience allowance button',
        });
      }

      let currentAmount: number, userCount: number;
      await allowancePage.rewardsAudienceAllowance.addOneAudienceInTheAllowance(amountToBeSetForAudienceAllowance);
      currentAmount = await allowancePage.rewardsAudienceAllowance.getTheCurrentAmountForLatestAddedAudience();
      userCount = await allowancePage.rewardsAudienceAllowance.getTheCurrentUserCountForLatestAddedAudience();
      expect(currentAmount).toBe(amountToBeSetForAudienceAllowance);
      await allowancePage.verifier.verifyTheElementIsVisible(
        allowancePage.rewardsAudienceAllowance.recentlyAddedIndicator
      );
      await allowancePage.verifier.verifyTheElementIsEnabled(allowancePage.saveButton);
      await allowancePage.clickOnElement(allowancePage.saveButton, {
        stepInfo: 'Clicking save button',
      });

      await allowancePage.verifier.verifyTheElementIsVisible(
        allowancePage.rewardsAudienceAllowance.audienceAllowanceGreenTick
      );
      await allowancePage.verifier.verifyTheElementIsVisible(
        allowancePage.rewardsAudienceAllowance.removeAudienceAllowance
      );
      await allowancePage.verifier.verifyTheElementIsVisible(
        allowancePage.rewardsAudienceAllowance.editAudienceAllowance
      );

      await allowancePage.monthlyAllowanceIllustration.waitFor({
        state: 'visible',
        timeout: 15000,
      });
      await allowancePage.verifier.verifyElementHasText(
        allowancePage.monthlyAllowanceIllustrationDescriptionText,
        '*Monthly totals are for guidance only, based on latest edits and current active users.'
      );
      await allowancePage.verifier.verifyTheElementIsVisible(allowancePage.monthlyAllowanceIllustrationAudienceRow);
      const audienceAllowanceAmount = await allowancePage.monthlyAllowanceIllustrationAudienceColumn
        .nth(2)
        .textContent();
      expect(currentAmount * userCount).toEqual(Number(audienceAllowanceAmount));
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
      const amountToBeSetForIndividualUsersAllowance = 10;

      await manageRewardsPage.verifier.waitUntilPageHasNavigatedTo('/manage/recognition/rewards/overview');
      await manageRewardsPage.verifier.verifyTheElementIsVisible(manageRewardsPage.header);

      await manageRewardsPage.rewardsAllowance.visitAllowancePage();
      await allowancePage.verifier.waitUntilPageHasNavigatedTo('/manage/recognition/rewards/peer-gifting/allowances');
      await allowancePage.verifier.verifyTheElementIsVisible(allowancePage.header);
      await allowancePage.verifier.verifyTheElementIsVisible(
        allowancePage.rewardsIndividualAllowance.individualAllowance
      );
      await allowancePage.verifier.verifyElementHasText(
        allowancePage.rewardsIndividualAllowance.individualAllowanceHeading,
        'Individual allowances'
      );
      const userAllowanceDescription = 'Add individual monthly allowances for selected users';
      await allowancePage.verifier.verifyElementHasText(
        allowancePage.rewardsIndividualAllowance.individualAllowanceDescription,
        userAllowanceDescription
      );

      if (
        await allowancePage.verifier.isTheElementVisible(
          allowancePage.rewardsIndividualAllowance.removeIndividualAllowance
        )
      ) {
        if (await allowancePage.rewardsIndividualAllowance.removeIndividualAllowance.isEnabled()) {
          await allowancePage.removeTheExistingAllowance('individual');
          await allowancePage.validateToastMessage('Saved changes successfully');
          await allowancePage.clickOnElement(allowancePage.rewardsIndividualAllowance.addIndividualAllowance, {
            stepInfo: 'Clicking add individual allowance button',
          });
        } else {
          await allowancePage.clickOnElement(allowancePage.rewardsIndividualAllowance.editIndividualAllowance, {
            stepInfo: 'Clicking edit individual allowance button',
          });
        }
      } else {
        await allowancePage.clickOnElement(allowancePage.rewardsIndividualAllowance.addIndividualAllowance, {
          stepInfo: 'Clicking add individual allowance button',
        });
      }

      await allowancePage.rewardsIndividualAllowance.validateTheIndividualAllowanceElements();

      let currentAmount: number;
      await allowancePage.rewardsIndividualAllowance.addOneIndividualUserInTheAllowance(
        amountToBeSetForIndividualUsersAllowance
      );
      currentAmount =
        await allowancePage.rewardsIndividualAllowance.getTheCurrentAmountForLatestAddedUserInIndividualAllowance();
      expect(currentAmount).toBe(amountToBeSetForIndividualUsersAllowance);
      await allowancePage.verifier.verifyTheElementIsVisible(
        allowancePage.rewardsIndividualAllowance.recentlyAddedUsers
      );
      await allowancePage.verifier.verifyTheElementIsEnabled(allowancePage.saveButton);
      await allowancePage.clickOnElement(allowancePage.saveButton, {
        stepInfo: 'Clicking save button',
      });
      await allowancePage.validateToastMessage('Saved changes successfully');

      await allowancePage.verifier.verifyTheElementIsVisible(
        allowancePage.rewardsIndividualAllowance.individualAllowanceGreenTick
      );
      await allowancePage.verifier.verifyTheElementIsVisible(
        allowancePage.rewardsIndividualAllowance.removeIndividualAllowance
      );
      await allowancePage.verifier.verifyTheElementIsVisible(
        allowancePage.rewardsIndividualAllowance.editIndividualAllowance
      );

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
      await allowancePage.verifier.verifyTheElementIsVisible(allowancePage.rewardsAudienceAllowance.audienceAllowance);
      await allowancePage.verifier.verifyElementHasText(
        allowancePage.rewardsAudienceAllowance.audienceAllowanceHeading,
        'Audience allowances'
      );
      const audienceAllowanceText = 'Add monthly allowances for users in selected audiences';
      await allowancePage.verifier.verifyElementHasText(
        allowancePage.rewardsAudienceAllowance.audienceAllowanceDescription,
        audienceAllowanceText
      );

      if (
        await allowancePage.verifier.isTheElementVisible(allowancePage.rewardsAudienceAllowance.removeAudienceAllowance)
      ) {
        await allowancePage.clickOnElement(allowancePage.rewardsAudienceAllowance.editAudienceAllowance, {
          stepInfo: 'Clicking edit audience allowance button',
        });
      } else {
        await allowancePage.clickOnElement(allowancePage.rewardsAudienceAllowance.addAudienceAllowance, {
          stepInfo: 'Clicking add audience allowance button',
        });
      }
      await allowancePage.page.waitForLoadState('load');

      await allowancePage.rewardsAudienceAllowance.validateTheAudienceAllowanceElements();
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
      const amountToBeSetForAudienceAllowance = 10;

      await manageRewardsPage.verifier.waitUntilPageHasNavigatedTo('/manage/recognition/rewards/overview');
      await manageRewardsPage.verifier.verifyTheElementIsVisible(manageRewardsPage.header);

      await manageRewardsPage.rewardsAllowance.visitAllowancePage();
      await allowancePage.verifier.waitUntilPageHasNavigatedTo('/manage/recognition/rewards/peer-gifting/allowances');
      await allowancePage.verifier.verifyTheElementIsVisible(allowancePage.header);
      await allowancePage.verifier.verifyTheElementIsVisible(allowancePage.rewardsAudienceAllowance.audienceAllowance);
      await allowancePage.verifier.verifyElementHasText(
        allowancePage.rewardsAudienceAllowance.audienceAllowanceHeading,
        'Audience allowances'
      );
      const audienceAllowanceDescription = 'Add monthly allowances for users in selected audiences';
      await allowancePage.verifier.verifyElementHasText(
        allowancePage.rewardsAudienceAllowance.audienceAllowanceDescription,
        audienceAllowanceDescription
      );

      if (
        await allowancePage.verifier.isTheElementVisible(
          allowancePage.rewardsAudienceAllowance.removeAudienceAllowance,
          { timeout: 5000 }
        )
      ) {
        if (await allowancePage.rewardsAudienceAllowance.removeAudienceAllowance.isEnabled()) {
          await allowancePage.removeTheExistingAllowance('audience');
          await allowancePage.validateToastMessage('Saved changes successfully');
          await allowancePage.clickOnElement(allowancePage.rewardsAudienceAllowance.addAudienceAllowance, {
            stepInfo: 'Clicking add audience allowance button',
          });
        } else {
          await allowancePage.clickOnElement(allowancePage.rewardsAudienceAllowance.editAudienceAllowance, {
            stepInfo: 'Clicking edit audience allowance button',
          });
        }
      } else {
        await allowancePage.clickOnElement(allowancePage.rewardsAudienceAllowance.addAudienceAllowance, {
          stepInfo: 'Clicking add audience allowance button',
        });
      }

      await allowancePage.rewardsAudienceAllowance.addOneAudienceInTheAllowance(amountToBeSetForAudienceAllowance);
      const currentAmount = await allowancePage.rewardsAudienceAllowance.getTheCurrentAmountForLatestAddedAudience();
      expect(currentAmount).toBe(amountToBeSetForAudienceAllowance);

      await allowancePage.clickOnElement(allowancePage.cancelButton, { force: true });
      allowancePage.page.once('dialog', async dialog => {
        await dialog.dismiss();
      });

      const currentAmountAfterCancel =
        await allowancePage.rewardsAudienceAllowance.getTheCurrentAmountForLatestAddedAudience();
      expect(currentAmountAfterCancel).toBe(amountToBeSetForAudienceAllowance);

      await allowancePage.clickOnElement(allowancePage.cancelButton);
      allowancePage.page.once('dialog', async dialog => {
        await dialog.accept();
      });

      await manageRewardsPage.rewardsAllowance.visitAllowancePage();
      await allowancePage.verifier.verifyTheElementIsVisible(
        allowancePage.rewardsAudienceAllowance.addAudienceAllowance
      );
      await allowancePage.clickOnElement(allowancePage.rewardsAudienceAllowance.addAudienceAllowance, {
        stepInfo: 'Clicking add audience allowance button',
      });
      await allowancePage.verifier.verifyTheElementIsVisible(allowancePage.rewardsAudienceAllowance.addAudienceButton);
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
      const amountToBeSetForIndividualAllowance = 10;

      await manageRewardsPage.verifier.waitUntilPageHasNavigatedTo('/manage/recognition/rewards/overview');
      await manageRewardsPage.verifier.verifyTheElementIsVisible(manageRewardsPage.header);

      await manageRewardsPage.rewardsAllowance.visitAllowancePage();
      await allowancePage.verifier.waitUntilPageHasNavigatedTo('/manage/recognition/rewards/peer-gifting/allowances');
      await allowancePage.verifier.verifyTheElementIsVisible(allowancePage.header);
      await allowancePage.verifier.verifyTheElementIsVisible(
        allowancePage.rewardsIndividualAllowance.individualAllowance
      );
      await allowancePage.verifier.verifyElementHasText(
        allowancePage.rewardsIndividualAllowance.individualAllowanceHeading,
        'Individual allowances'
      );
      const individualAllowanceDescription = 'Add individual monthly allowances for selected users';
      await allowancePage.verifier.verifyElementHasText(
        allowancePage.rewardsIndividualAllowance.individualAllowanceDescription,
        individualAllowanceDescription
      );

      let status: string;
      if (
        await allowancePage.verifier.isTheElementVisible(
          allowancePage.rewardsIndividualAllowance.removeIndividualAllowance
        )
      ) {
        if (await allowancePage.rewardsIndividualAllowance.removeIndividualAllowance.isEnabled()) {
          await allowancePage.removeTheExistingAllowance('individual');
          await allowancePage.validateToastMessage('Saved changes successfully');
          await allowancePage.clickOnElement(allowancePage.rewardsIndividualAllowance.addIndividualAllowance, {
            stepInfo: 'Clicking add individual allowance button',
          });
          status = 'removed the added';
        } else {
          await allowancePage.clickOnElement(allowancePage.rewardsIndividualAllowance.editIndividualAllowance, {
            stepInfo: 'Clicking edit individual allowance button',
          });
          status = 'edited the existing';
        }
      } else {
        await allowancePage.clickOnElement(allowancePage.rewardsIndividualAllowance.addIndividualAllowance, {
          stepInfo: 'Clicking add individual allowance button',
        });
        status = 'adding new';
      }

      await allowancePage.rewardsIndividualAllowance.addOneIndividualUserInTheAllowance(
        amountToBeSetForIndividualAllowance
      );
      const currentAmount =
        await allowancePage.rewardsIndividualAllowance.getTheCurrentAmountForLatestAddedUserInIndividualAllowance();
      expect(currentAmount).toBe(amountToBeSetForIndividualAllowance);

      await allowancePage.clickOnElement(allowancePage.cancelButton, { force: true });
      allowancePage.page.once('dialog', async dialog => {
        await dialog.dismiss();
      });

      const currentAmountAfterCancel =
        await allowancePage.rewardsIndividualAllowance.getTheCurrentAmountForLatestAddedUserInIndividualAllowance();
      expect(currentAmountAfterCancel).toBe(amountToBeSetForIndividualAllowance);

      await allowancePage.clickOnElement(allowancePage.cancelButton);
      allowancePage.page.once('dialog', async dialog => {
        await dialog.accept();
      });

      await manageRewardsPage.rewardsAllowance.visitAllowancePage();
      if (status === 'removed the added') {
        await allowancePage.verifier.verifyTheElementIsVisible(
          allowancePage.rewardsIndividualAllowance.addIndividualAllowance
        );
        await allowancePage.clickOnElement(allowancePage.rewardsIndividualAllowance.addIndividualAllowance, {
          stepInfo: 'Clicking add individual allowance button',
        });
        await allowancePage.verifier.verifyTheElementIsVisible(
          allowancePage.rewardsIndividualAllowance.addIndividualButton
        );
      } else if (status === 'edited the existing') {
        await allowancePage.verifier.verifyTheElementIsVisible(
          allowancePage.rewardsIndividualAllowance.editIndividualAllowance
        );
        await allowancePage.clickOnElement(allowancePage.rewardsIndividualAllowance.editIndividualAllowance, {
          stepInfo: 'Clicking edit individual allowance button',
        });
      } else {
        await allowancePage.verifier.verifyTheElementIsVisible(
          allowancePage.rewardsIndividualAllowance.editIndividualAllowance
        );
        await allowancePage.clickOnElement(allowancePage.rewardsIndividualAllowance.editIndividualAllowance, {
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
      const amountToBeSetForIndividualAllowance = 10;
      let currentAmount: number;

      await manageRewardsPage.verifier.waitUntilPageHasNavigatedTo('/manage/recognition/rewards/overview');
      await manageRewardsPage.verifier.verifyTheElementIsVisible(manageRewardsPage.header);

      await manageRewardsPage.rewardsAllowance.visitAllowancePage();
      await allowancePage.verifier.waitUntilPageHasNavigatedTo('/manage/recognition/rewards/peer-gifting/allowances');
      await allowancePage.verifier.verifyTheElementIsVisible(allowancePage.header);
      await allowancePage.verifier.verifyTheElementIsVisible(
        allowancePage.rewardsIndividualAllowance.individualAllowance
      );
      await allowancePage.verifier.verifyElementHasText(
        allowancePage.rewardsIndividualAllowance.individualAllowanceHeading,
        'Individual allowances'
      );
      const individualAllowanceDescription = 'Add individual monthly allowances for selected users';
      await allowancePage.verifier.verifyElementHasText(
        allowancePage.rewardsIndividualAllowance.individualAllowanceDescription,
        individualAllowanceDescription
      );

      if (
        await allowancePage.verifier.isTheElementVisible(
          allowancePage.rewardsIndividualAllowance.removeIndividualAllowance
        )
      ) {
        if (await allowancePage.rewardsIndividualAllowance.removeIndividualAllowance.isEnabled()) {
          await allowancePage.removeTheExistingAllowance('individual');
          await allowancePage.validateToastMessage('Saved changes successfully');
          await allowancePage.clickOnElement(allowancePage.rewardsIndividualAllowance.addIndividualAllowance, {
            stepInfo: 'Clicking add individual allowance button',
          });
        } else {
          await allowancePage.clickOnElement(allowancePage.rewardsIndividualAllowance.editIndividualAllowance, {
            stepInfo: 'Clicking edit individual allowance button',
          });
        }
      } else {
        await allowancePage.clickOnElement(allowancePage.rewardsIndividualAllowance.addIndividualAllowance, {
          stepInfo: 'Clicking add individual allowance button',
        });
      }

      await allowancePage.rewardsIndividualAllowance.addOneIndividualUserInTheAllowance(
        amountToBeSetForIndividualAllowance
      );
      currentAmount =
        await allowancePage.rewardsIndividualAllowance.getTheCurrentAmountForLatestAddedUserInIndividualAllowance();
      expect(currentAmount).toBe(amountToBeSetForIndividualAllowance);

      await allowancePage.rewardsIndividualAllowance.increaseTheAmountBy(5);
      currentAmount =
        await allowancePage.rewardsIndividualAllowance.getTheCurrentAmountForLatestAddedUserInIndividualAllowance();
      expect(currentAmount).toBe(amountToBeSetForIndividualAllowance + 5);

      await allowancePage.rewardsIndividualAllowance.decreaseTheAmountBy(2);
      currentAmount =
        await allowancePage.rewardsIndividualAllowance.getTheCurrentAmountForLatestAddedUserInIndividualAllowance();
      expect(currentAmount).toBe(amountToBeSetForIndividualAllowance + 3);

      await allowancePage.clickOnElement(allowancePage.rewardsIndividualAllowance.saveButton, {
        stepInfo: 'Clicking save button',
      });

      await allowancePage.verifier.verifyTheElementIsVisible(
        allowancePage.rewardsIndividualAllowance.editIndividualAllowance
      );
      await allowancePage.clickOnElement(allowancePage.rewardsIndividualAllowance.editIndividualAllowance, {
        stepInfo: 'Clicking edit individual allowance button',
      });
      currentAmount =
        await allowancePage.rewardsIndividualAllowance.getTheCurrentAmountForLatestAddedUserInIndividualAllowance();
      await allowancePage.clickOnElement(allowancePage.cancelButton, {
        stepInfo: 'Clicking cancel button',
      });

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

      await manageRewardsPage.verifier.waitUntilPageHasNavigatedTo('/manage/recognition/rewards/overview');
      await manageRewardsPage.verifier.verifyTheElementIsVisible(manageRewardsPage.header);

      await manageRewardsPage.rewardsAllowance.visitAllowancePage();
      await allowancePage.verifier.waitUntilPageHasNavigatedTo('/manage/recognition/rewards/peer-gifting/allowances');
      await allowancePage.verifier.verifyTheElementIsVisible(allowancePage.header);
      await allowancePage.verifier.verifyTheElementIsVisible(allowancePage.rewardsManagerAllowance.managerAllowance);
      await allowancePage.verifier.verifyElementHasText(
        allowancePage.rewardsManagerAllowance.managerAllowanceHeading,
        'Manager allowances'
      );
      const individualAllowanceDescription = 'Add monthly allowances for people managers';
      await allowancePage.verifier.verifyElementHasText(
        allowancePage.rewardsManagerAllowance.managerAllowanceDescription,
        individualAllowanceDescription
      );

      if (
        await allowancePage.verifier.isTheElementVisible(allowancePage.rewardsManagerAllowance.removeManagerAllowance)
      ) {
        await allowancePage.clickOnElement(allowancePage.rewardsManagerAllowance.editManagerAllowance, {
          stepInfo: 'Clicking edit manager allowance button',
        });
      } else {
        await allowancePage.clickOnElement(allowancePage.rewardsManagerAllowance.addManagerAllowance, {
          stepInfo: 'Clicking add manager allowance button',
        });
      }

      await allowancePage.rewardsManagerAllowance.validateTheManagerAllowanceElements();

      await manageRewardsPage.rewardsAllowance.visitAllowancePage();
      await allowancePage.verifier.waitUntilPageHasNavigatedTo('/manage/recognition/rewards/peer-gifting/allowances');
      await allowancePage.verifier.verifyTheElementIsVisible(allowancePage.header);
      await allowancePage.verifier.verifyTheElementIsVisible(allowancePage.rewardsAudienceAllowance.audienceAllowance);
      await allowancePage.verifier.verifyElementHasText(
        allowancePage.rewardsAudienceAllowance.audienceAllowanceHeading,
        'Audience allowances'
      );
      const individualAllowanceDescription2 = 'Add monthly allowances for users in selected audiences';
      await allowancePage.verifier.verifyElementHasText(
        allowancePage.rewardsAudienceAllowance.audienceAllowanceDescription,
        individualAllowanceDescription2
      );

      if (
        await allowancePage.verifier.isTheElementVisible(allowancePage.rewardsAudienceAllowance.removeAudienceAllowance)
      ) {
        await allowancePage.clickOnElement(allowancePage.rewardsAudienceAllowance.editAudienceAllowance, {
          stepInfo: 'Clicking edit audience allowance button',
        });
      } else {
        await allowancePage.clickOnElement(allowancePage.rewardsAudienceAllowance.addAudienceAllowance, {
          stepInfo: 'Clicking add audience allowance button',
        });
      }
      await allowancePage.page.waitForLoadState('load');

      await allowancePage.rewardsAudienceAllowance.validateTheAudienceAllowanceElements();
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
      const amountToBeSetForIndividualAllowance = 10;
      let currentAmount: number;

      await manageRewardsPage.verifier.waitUntilPageHasNavigatedTo('/manage/recognition/rewards/overview');
      await manageRewardsPage.verifier.verifyTheElementIsVisible(manageRewardsPage.header);

      await manageRewardsPage.rewardsAllowance.visitAllowancePage();
      await allowancePage.verifier.waitUntilPageHasNavigatedTo('/manage/recognition/rewards/peer-gifting/allowances');
      await allowancePage.verifier.verifyTheElementIsVisible(allowancePage.header);
      await allowancePage.verifier.verifyTheElementIsVisible(
        allowancePage.rewardsIndividualAllowance.individualAllowance
      );
      await allowancePage.verifier.verifyElementHasText(
        allowancePage.rewardsIndividualAllowance.individualAllowanceHeading,
        'Individual allowances'
      );
      const individualAllowanceDescription = 'Add individual monthly allowances for selected users';
      await allowancePage.verifier.verifyElementHasText(
        allowancePage.rewardsIndividualAllowance.individualAllowanceDescription,
        individualAllowanceDescription
      );

      if (
        await allowancePage.verifier.isTheElementVisible(
          allowancePage.rewardsIndividualAllowance.removeIndividualAllowance
        )
      ) {
        if (await allowancePage.rewardsIndividualAllowance.removeIndividualAllowance.isEnabled()) {
          await allowancePage.removeTheExistingAllowance('individual');
          await allowancePage.validateToastMessage('Saved changes successfully');
          await allowancePage.clickOnElement(allowancePage.rewardsIndividualAllowance.addIndividualAllowance, {
            stepInfo: 'Clicking add individual allowance button',
          });
        } else {
          await allowancePage.clickOnElement(allowancePage.rewardsIndividualAllowance.editIndividualAllowance, {
            stepInfo: 'Clicking edit individual allowance button',
          });
        }
      } else {
        await allowancePage.clickOnElement(allowancePage.rewardsIndividualAllowance.addIndividualAllowance, {
          stepInfo: 'Clicking add individual allowance button',
        });
      }

      await allowancePage.rewardsIndividualAllowance.addOneIndividualUserInTheAllowance(
        amountToBeSetForIndividualAllowance
      );
      currentAmount =
        await allowancePage.rewardsIndividualAllowance.getTheCurrentAmountForLatestAddedUserInIndividualAllowance();
      expect(currentAmount).toBe(amountToBeSetForIndividualAllowance);

      await allowancePage.clickOnElement(allowancePage.rewardsIndividualAllowance.saveButton, {
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
      await allowancePage.verifier.verifyTheElementIsVisible(allowancePage.rewardsManagerAllowance.managerAllowance);
      await allowancePage.verifier.verifyElementHasText(
        allowancePage.rewardsManagerAllowance.managerAllowanceHeading,
        'Manager allowances'
      );
      const managerAllowanceDescription = 'Add monthly allowances for people managers';
      await allowancePage.verifier.verifyElementHasText(
        allowancePage.rewardsManagerAllowance.managerAllowanceDescription,
        managerAllowanceDescription
      );

      if (
        await allowancePage.verifier.isTheElementVisible(allowancePage.rewardsManagerAllowance.removeManagerAllowance)
      ) {
        if (await allowancePage.rewardsManagerAllowance.removeManagerAllowance.isEnabled()) {
          await allowancePage.removeTheExistingAllowance('manager');
          await allowancePage.validateToastMessage('Saved changes successfully');
          await allowancePage.clickOnElement(allowancePage.rewardsManagerAllowance.addManagerAllowance, {
            stepInfo: 'Clicking add manager allowance button',
          });
        } else {
          await allowancePage.clickOnElement(allowancePage.rewardsManagerAllowance.editManagerAllowance, {
            stepInfo: 'Clicking edit manager allowance button',
          });
        }
      } else {
        await allowancePage.clickOnElement(allowancePage.rewardsManagerAllowance.addManagerAllowance, {
          stepInfo: 'Clicking add manager allowance button',
        });
      }

      const headingText = 'Manager allowances';
      const headingDescriptionLine1 = 'Add monthly allowances for people managers.';
      const headingDescriptionLine2 =
        'Allowances refresh on the 1st of every month. Unused points expire and are not charged for.';
      await allowancePage.validateAllowanceAddAndEditPageHeader(
        headingText,
        headingDescriptionLine1,
        headingDescriptionLine2
      );
      await allowancePage.rewardsManagerAllowance.validateTheManagerAllowanceElements();

      await allowancePage.rewardsManagerAllowance.enterThePointAmount(0);
      await allowancePage.clickOnElement(allowancePage.rewardsManagerAllowance.fixedCurrencyConversionInfoIcon, {
        stepInfo: 'Clicking fixed currency conversion info icon',
      });
      await allowancePage.verifier.verifyTheElementIsVisible(
        allowancePage.rewardsManagerAllowance.fixedPointAmountLimitError
      );

      await allowancePage.rewardsManagerAllowance.increaseTheFXMonthlyAmountBy(amountToBeSetForFixedMonthlyAllowance);
      const currentAmount = await allowancePage.rewardsManagerAllowance.getTheCurrentAmountInFixedInputBox();
      expect(currentAmount).toBe(amountToBeSetForFixedMonthlyAllowance);

      await allowancePage.saveAmount();
      await allowancePage.validateToastMessage('Saved changes successfully');

      await allowancePage.verifier.verifyTheElementIsVisible(
        allowancePage.rewardsManagerAllowance.editManagerAllowance
      );
      await allowancePage.clickOnElement(allowancePage.rewardsManagerAllowance.editManagerAllowance, {
        stepInfo: 'Clicking edit manager allowance button',
      });

      await allowancePage.rewardsManagerAllowance.decreaseTheFXMonthlyAmountBy(2);
      const currentAmountAfterDecrease =
        await allowancePage.rewardsManagerAllowance.getTheCurrentAmountInFixedInputBox();
      expect(currentAmountAfterDecrease).toBe(amountToBeSetForFixedMonthlyAllowance - 2);

      await allowancePage.saveAmount();
      await allowancePage.validateToastMessage('Saved changes successfully');

      await allowancePage.verifier.verifyTheElementIsVisible(
        allowancePage.rewardsManagerAllowance.editManagerAllowance
      );
      await allowancePage.clickOnElement(allowancePage.rewardsManagerAllowance.editManagerAllowance, {
        stepInfo: 'Clicking edit manager allowance button',
      });

      await allowancePage.rewardsManagerAllowance.addTheVariableAmount(amountToBeSetForVariableMonthlyAllowance);
      const currentVariableAmount = await allowancePage.rewardsManagerAllowance.getTheCurrentAmountInVariableInputBox();
      expect(currentVariableAmount).toBe(amountToBeSetForVariableMonthlyAllowance);

      await allowancePage.saveAmount();
      await allowancePage.validateToastMessage('Saved changes successfully');

      await allowancePage.verifier.verifyTheElementIsVisible(
        allowancePage.rewardsManagerAllowance.managerAllowanceIcon
      );
      await allowancePage.verifier.verifyTheElementIsVisible(
        allowancePage.rewardsManagerAllowance.managerAllowanceGreenTick
      );
      await allowancePage.verifier.verifyTheElementIsVisible(
        allowancePage.rewardsManagerAllowance.removeManagerAllowance
      );
      await allowancePage.verifier.verifyTheElementIsVisible(
        allowancePage.rewardsManagerAllowance.editManagerAllowance
      );
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

      await manageRewardsPage.verifier.waitUntilPageHasNavigatedTo('/manage/recognition/rewards/overview');
      await manageRewardsPage.verifier.verifyTheElementIsVisible(manageRewardsPage.header);

      await allowancePage.rewardsAudienceAllowance.visitAudienceAllowancePage();
      await allowancePage.rewardsAudienceAllowance.visitToAllowanceWithInterruption();
      await allowancePage.rewardsAudienceAllowance.verifyErrorMessage();
      await allowancePage.rewardsAudienceAllowance.clickOnReloadButtonWithoutAnyInterruption();
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
    '[RC-3325] Validate that the user cannot add any allowance when Allowances are refreshing',
    {
      tag: [REWARD_FEATURE_TAGS.REWARDS_ALLOWANCE, TestPriority.P0, TestGroupType.REGRESSION],
    },
    async ({ appManagerFixture }) => {
      tagTest(test.info(), {
        description: 'Validate that the user cannot add any allowance when Allowances are refreshing',
        zephyrTestId: 'RC-3325',
        storyId: 'RC-3325',
      });

      const manageRewardsPage = new ManageRewardsOverviewPage(appManagerFixture.page);
      const allowancePage = new RewardsAllowancePage(appManagerFixture.page);

      await manageRewardsPage.verifier.waitUntilPageHasNavigatedTo('/manage/recognition/rewards/overview');
      await manageRewardsPage.verifier.verifyTheElementIsVisible(manageRewardsPage.header);

      // Mock the API to simulate distribution failure
      await appManagerFixture.page.route('**/recognition/admin/rewards/distribution/status', route =>
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ isRefreshing: true }),
        })
      );

      await manageRewardsPage.rewardsAllowance.visitAllowancePage();
      await allowancePage.verifier.waitUntilPageHasNavigatedTo('/manage/recognition/rewards/peer-gifting/allowances');

      // Validate tooltips for disabled add buttons
      await manageRewardsPage.validateTheAddButtonTooltip('users');
      await manageRewardsPage.validateTheAddButtonTooltip('managers');
      await manageRewardsPage.validateTheAddButtonTooltip('audiences');
      await manageRewardsPage.validateTheAddButtonTooltip('individuals');

      // Restore normal API behavior
      await appManagerFixture.page.unroute('**/recognition/admin/rewards/distribution/status');
    }
  );

  test(
    '[RC-3323] Validate that the user cannot edit any allowance when Allowances are refreshing',
    {
      tag: [REWARD_FEATURE_TAGS.REWARDS_ALLOWANCE, TestPriority.P0, TestGroupType.REGRESSION],
    },
    async ({ appManagerFixture }) => {
      tagTest(test.info(), {
        description: 'Validate that the user cannot edit any allowance when Allowances are refreshing',
        zephyrTestId: 'RC-3323',
        storyId: 'RC-3323',
      });

      const manageRewardsPage = new ManageRewardsOverviewPage(appManagerFixture.page);
      const allowancePage = new RewardsAllowancePage(appManagerFixture.page);

      await manageRewardsPage.verifier.waitUntilPageHasNavigatedTo('/manage/recognition/rewards/overview');
      await manageRewardsPage.verifier.verifyTheElementIsVisible(manageRewardsPage.header);

      // Mock the API to simulate distribution failure
      await appManagerFixture.page.route('**/recognition/admin/rewards/distribution/status', route =>
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ isRefreshing: true }),
        })
      );

      await manageRewardsPage.rewardsAllowance.visitAllowancePage();
      await allowancePage.verifier.waitUntilPageHasNavigatedTo('/manage/recognition/rewards/peer-gifting/allowances');

      // Validate tooltips for disabled edit buttons
      await manageRewardsPage.validateTheEditButtonTooltip('users');
      await manageRewardsPage.validateTheEditButtonTooltip('managers');
      await manageRewardsPage.validateTheEditButtonTooltip('audiences');
      await manageRewardsPage.validateTheEditButtonTooltip('individuals');

      // Restore normal API behavior
      await appManagerFixture.page.unroute('**/recognition/admin/rewards/distribution/status');
    }
  );

  test(
    '[RC-3324] Validate that the user cannot remove any allowance when Allowances are refreshing',
    {
      tag: [REWARD_FEATURE_TAGS.REWARDS_ALLOWANCE, TestPriority.P0, TestGroupType.REGRESSION],
    },
    async ({ appManagerFixture }) => {
      tagTest(test.info(), {
        description: 'Validate that the user cannot remove any allowance when Allowances are refreshing',
        zephyrTestId: 'RC-3324',
        storyId: 'RC-3324',
      });

      const manageRewardsPage = new ManageRewardsOverviewPage(appManagerFixture.page);
      const allowancePage = new RewardsAllowancePage(appManagerFixture.page);

      await manageRewardsPage.verifier.waitUntilPageHasNavigatedTo('/manage/recognition/rewards/overview');
      await manageRewardsPage.verifier.verifyTheElementIsVisible(manageRewardsPage.header);

      // Mock the API to simulate distribution failure
      await appManagerFixture.page.route('**/recognition/admin/rewards/distribution/status', route =>
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ isRefreshing: true }),
        })
      );

      await manageRewardsPage.rewardsAllowance.visitAllowancePage();
      await allowancePage.verifier.waitUntilPageHasNavigatedTo('/manage/recognition/rewards/peer-gifting/allowances');

      // Validate tooltips for disabled remove buttons
      await manageRewardsPage.validateTheRemoveButtonTooltip('users');
      await manageRewardsPage.validateTheRemoveButtonTooltip('managers');
      await manageRewardsPage.validateTheRemoveButtonTooltip('audiences');
      await manageRewardsPage.validateTheRemoveButtonTooltip('individuals');

      // Restore normal API behavior
      await appManagerFixture.page.unroute('**/recognition/admin/rewards/distribution/status');
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
      const amountToBeSetForIndividualAllowance = 10;

      await manageRewardsPage.verifier.waitUntilPageHasNavigatedTo('/manage/recognition/rewards/overview');
      await manageRewardsPage.verifier.verifyTheElementIsVisible(manageRewardsPage.header);

      await manageRewardsPage.rewardsAllowance.visitAllowancePage();
      await allowancePage.verifier.waitUntilPageHasNavigatedTo('/manage/recognition/rewards/peer-gifting/allowances');
      await allowancePage.verifier.verifyTheElementIsVisible(allowancePage.header);
      await allowancePage.verifier.verifyTheElementIsVisible(allowancePage.rewardsManagerAllowance.managerAllowance);
      await allowancePage.verifier.verifyElementHasText(
        allowancePage.rewardsManagerAllowance.managerAllowanceHeading,
        'Manager allowances'
      );
      const individualAllowanceDescription = 'Add monthly allowances for people managers';
      await allowancePage.verifier.verifyElementHasText(
        allowancePage.rewardsManagerAllowance.managerAllowanceDescription,
        individualAllowanceDescription
      );

      if (
        await allowancePage.verifier.isTheElementVisible(allowancePage.rewardsManagerAllowance.removeManagerAllowance)
      ) {
        if (await allowancePage.rewardsManagerAllowance.removeManagerAllowance.isEnabled()) {
          await allowancePage.removeTheExistingAllowance('manager');
          await allowancePage.validateToastMessage('Saved changes successfully');
          await allowancePage.clickOnElement(allowancePage.rewardsManagerAllowance.addManagerAllowance, {
            stepInfo: 'Clicking add manager allowance button',
          });
        } else {
          await allowancePage.clickOnElement(allowancePage.rewardsManagerAllowance.editManagerAllowance, {
            stepInfo: 'Clicking edit manager allowance button',
          });
        }
      } else {
        await allowancePage.clickOnElement(allowancePage.rewardsManagerAllowance.addManagerAllowance, {
          stepInfo: 'Clicking add manager allowance button',
        });
      }

      await allowancePage.rewardsManagerAllowance.enterThePointAmount(amountToBeSetForIndividualAllowance);
      const currentAmount = await allowancePage.rewardsManagerAllowance.getTheCurrentAmountInFixedInputBox();
      expect(currentAmount).toBe(amountToBeSetForIndividualAllowance);

      await allowancePage.clickOnElement(allowancePage.cancelButton, { force: true });
      allowancePage.page.once('dialog', async dialog => {
        await dialog.dismiss();
      });

      const currentAmountAfterCancel = await allowancePage.rewardsManagerAllowance.getTheCurrentAmountInFixedInputBox();
      expect(currentAmountAfterCancel).toBe(amountToBeSetForIndividualAllowance);

      await allowancePage.clickOnElement(allowancePage.cancelButton);
      allowancePage.page.once('dialog', async dialog => {
        await dialog.accept();
      });

      await manageRewardsPage.rewardsAllowance.visitAllowancePage();
      await allowancePage.verifier.verifyTheElementIsVisible(allowancePage.rewardsManagerAllowance.addManagerAllowance);
      await allowancePage.clickOnElement(allowancePage.rewardsManagerAllowance.addManagerAllowance, {
        stepInfo: 'Clicking add manager allowance button',
      });
      const currentAmountAfterAccept = await allowancePage.rewardsManagerAllowance.getTheCurrentAmountInFixedInputBox();
      expect(currentAmountAfterAccept).toBe(0);
    }
  );
});
