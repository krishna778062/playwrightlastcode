import { expect } from '@playwright/test';
import { REWARD_FEATURE_TAGS, REWARD_SUITE_TAGS } from '@rewards/constants/testTags';
import { rewardTestFixture as test } from '@rewards/fixtures/rewardFixture';
import { ManageRecognitionPage } from '@rewards-pages/manage-recognition';
import { AutomatedAwardPage, EditAutomatedAwardPage, milestoneEndpointUrls } from '@rewards-pages/work-anniversary';

import { TestGroupType, TestPriority } from '@core/constants';
import { tagTest } from '@core/utils';

test.describe('edit points in work anniversary award', { tag: [REWARD_SUITE_TAGS.MANAGE_WORK_ANNIVERSARY] }, () => {
  test.beforeEach(async ({ appManagerFixture }) => {
    const manageRecognitionPage = new ManageRecognitionPage(appManagerFixture.page);
    const automatedAwardPage = new AutomatedAwardPage(appManagerFixture.page);
    await manageRecognitionPage.navigateViaUrl(milestoneEndpointUrls.milestoneEndpointUrl);
    await manageRecognitionPage.automatedAwards.getThreeDotsButton(0).click();
    await manageRecognitionPage.automatedAwards.editMenuItem.click();
    await automatedAwardPage.editMilestoneTitle.waitFor({ state: 'visible' });
  });

  test(
    '[RC-5715] Verify "Award points to Receiver" option on Edit milestone award',
    {
      tag: [
        REWARD_FEATURE_TAGS.REWARDS_WORK_ANNIVERSARY,
        REWARD_FEATURE_TAGS.WORK_ANNIVERSARY_WITH_POINTS,
        TestPriority.P0,
        TestGroupType.REGRESSION,
      ],
    },
    async ({ appManagerFixture }) => {
      tagTest(test.info(), {
        description: 'Verify "Award points to Receiver" option on Edit milestone award',
        zephyrTestId: 'RC-5715',
        storyId: 'RC-5715',
      });

      const manageRecognitionPage = new ManageRecognitionPage(appManagerFixture.page);
      const editAutomatedAwardPage = new EditAutomatedAwardPage(appManagerFixture.page);
      const automatedAwardPage = new AutomatedAwardPage(appManagerFixture.page);
      await editAutomatedAwardPage.getHeadingElementByText('Award frequency').scrollIntoViewIfNeeded();
      await expect(editAutomatedAwardPage.awardScheduleEditIcon).toBeVisible();
      await editAutomatedAwardPage.enableAndEditPoints();
      await automatedAwardPage.automatedAwardSaveButton.click();
      await manageRecognitionPage.rewardsAllowance.validateToastMessage('Saved changes successfully');
      await expect(manageRecognitionPage.header).toBeVisible();
    }
  );

  test(
    '[RC-5718] Validate Rewards points option on Edit milestone award page',
    {
      tag: [REWARD_FEATURE_TAGS.REWARDS_WORK_ANNIVERSARY, TestPriority.P0, TestGroupType.REGRESSION],
    },
    async ({ appManagerFixture }) => {
      tagTest(test.info(), {
        description: 'Validate Rewards points option on Edit milestone award page',
        zephyrTestId: 'RC-5718',
        storyId: 'RC-5718',
      });

      const manageRecognitionPage = new ManageRecognitionPage(appManagerFixture.page);
      const editAutomatedAwardPage = new EditAutomatedAwardPage(appManagerFixture.page);
      const automatedAwardPage = new AutomatedAwardPage(appManagerFixture.page);
      await editAutomatedAwardPage.getHeadingElementByText('Award schedule').scrollIntoViewIfNeeded();
      await expect(editAutomatedAwardPage.awardScheduleEditIcon).toBeVisible();
      await editAutomatedAwardPage.verifyTheErrorForInvalidInput(-12);
      await editAutomatedAwardPage.verifyTheErrorForInvalidInput(0);
      await editAutomatedAwardPage.enableAndEditPoints();
      await automatedAwardPage.automatedAwardSaveButton.click();
      await manageRecognitionPage.rewardsAllowance.validateToastMessage('Saved changes successfully');
      await expect(manageRecognitionPage.header).toBeVisible();
    }
  );

  test(
    '[RC-5730] Validate "Award points to receiver option" on edit milestone instance',
    {
      tag: [REWARD_FEATURE_TAGS.REWARDS_WORK_ANNIVERSARY, TestPriority.P0, TestGroupType.REGRESSION],
    },
    async ({ appManagerFixture }) => {
      tagTest(test.info(), {
        description: 'Validate "Award points to receiver option" on edit milestone instance',
        zephyrTestId: 'RC-5730',
        storyId: 'RC-5730',
      });
      tagTest(test.info(), {
        description: 'Verify rewards points icon on Milestone award instance',
        zephyrTestId: 'RC-5721',
        storyId: 'RC-5721',
      });
      tagTest(test.info(), {
        description: 'Validate remove option for rewards points on edit milestone award instance',
        zephyrTestId: 'RC-5731',
        storyId: 'RC-5731',
      });
      tagTest(test.info(), {
        description: 'Verify save button on milestone award instance page while adding reward points',
        zephyrTestId: 'RC-5733',
        storyId: 'RC-5733',
      });

      const manageRecognitionPage = new ManageRecognitionPage(appManagerFixture.page);
      const editAutomatedAwardPage = new EditAutomatedAwardPage(appManagerFixture.page);
      const automatedAwardPage = new AutomatedAwardPage(appManagerFixture.page);
      await manageRecognitionPage.workAnniversaryWithPoints.cleanUpTheDataIfAlreadySet();
      await editAutomatedAwardPage.getHeadingElementByText('Award schedule').scrollIntoViewIfNeeded();
      await manageRecognitionPage.workAnniversaryWithPoints.setTheDefaultPointsInWorkAnniversary(10);
      await expect(editAutomatedAwardPage.awardScheduleEditIcon).toBeVisible();
      await editAutomatedAwardPage.clickWorkAnniversaryAwardInstanceEditButton(0);
      await manageRecognitionPage.verifier.verifyTheElementIsVisible(
        manageRecognitionPage.dialogContainerForm.dialogHeader
      );

      await editAutomatedAwardPage.enableAndEditPointsInDialogBox(automatedAwardPage.page);
      await manageRecognitionPage.dialogContainerForm.dialogSaveBtn.click();
      await editAutomatedAwardPage.getHeadingElementByText('Award schedule').waitFor({ state: 'visible' });
      await expect(editAutomatedAwardPage.awardSchedulePointIcon).toBeVisible();

      await editAutomatedAwardPage.getHeadingElementByText('Award schedule').scrollIntoViewIfNeeded();
      await expect(editAutomatedAwardPage.awardScheduleEditIcon).toBeVisible();
      await editAutomatedAwardPage.clickWorkAnniversaryAwardInstanceEditButton(0);
      await manageRecognitionPage.verifier.verifyTheElementIsVisible(
        manageRecognitionPage.dialogContainerForm.dialogHeader
      );

      await editAutomatedAwardPage.disableTheCustomPoint(automatedAwardPage.page);
      await manageRecognitionPage.dialogContainerForm.dialogSaveBtn.scrollIntoViewIfNeeded();
      await manageRecognitionPage.dialogContainerForm.dialogSaveBtn.click();
      await editAutomatedAwardPage.getHeadingElementByText('Award schedule').waitFor({ state: 'visible' });
      await expect(editAutomatedAwardPage.awardSchedulePointIcon).toBeVisible();

      await editAutomatedAwardPage.getHeadingElementByText('Award schedule').scrollIntoViewIfNeeded();
      await expect(editAutomatedAwardPage.awardScheduleEditIcon).toBeVisible();
      await editAutomatedAwardPage.clickWorkAnniversaryAwardInstanceEditButton(0);
      await manageRecognitionPage.verifier.verifyTheElementIsVisible(
        manageRecognitionPage.dialogContainerForm.dialogHeader
      );

      await editAutomatedAwardPage.removeTheCustomPoint(automatedAwardPage.page);
      await manageRecognitionPage.dialogContainerForm.dialogSaveBtn.scrollIntoViewIfNeeded();
      await manageRecognitionPage.dialogContainerForm.dialogSaveBtn.click();
      await editAutomatedAwardPage.getHeadingElementByText('Award schedule').waitFor({ state: 'visible' });
      await expect(editAutomatedAwardPage.awardSchedulePointIcon).not.toBeVisible();
      await automatedAwardPage.automatedAwardSaveButton.click();
      await manageRecognitionPage.rewardsAllowance.validateToastMessage('Saved changes successfully');
      await expect(manageRecognitionPage.header).toBeVisible();
    }
  );

  test(
    '[RC-5732] Verify cancel button on milestone award instance page while adding reward points',
    {
      tag: [REWARD_FEATURE_TAGS.REWARDS_WORK_ANNIVERSARY, TestPriority.P0, TestGroupType.REGRESSION],
    },
    async ({ appManagerFixture }) => {
      tagTest(test.info(), {
        description: 'Verify cancel button on milestone award instance page while adding reward points',
        zephyrTestId: 'RC-5732',
        storyId: 'RC-5732',
      });

      const manageRecognitionPage = new ManageRecognitionPage(appManagerFixture.page);
      const editAutomatedAwardPage = new EditAutomatedAwardPage(appManagerFixture.page);
      const automatedAwardPage = new AutomatedAwardPage(appManagerFixture.page);

      await manageRecognitionPage.workAnniversaryWithPoints.cleanUpTheDataIfAlreadySet();

      await editAutomatedAwardPage.getHeadingElementByText('Award schedule').scrollIntoViewIfNeeded();
      await expect(editAutomatedAwardPage.awardScheduleEditIcon).toBeVisible();
      await editAutomatedAwardPage.clickWorkAnniversaryAwardInstanceEditButton(0);
      await manageRecognitionPage.dialogContainerForm.dialogHeader.waitFor({ state: 'visible' });

      await editAutomatedAwardPage.enableAndEditPointsInDialogBox(automatedAwardPage.page);
      await manageRecognitionPage.dialogContainerForm.dialogCancelBtn.click();
      await editAutomatedAwardPage.getHeadingElementByText('Award schedule').waitFor({ state: 'visible' });
      await expect(editAutomatedAwardPage.awardSchedulePointIcon).not.toBeVisible();
    }
  );
});
