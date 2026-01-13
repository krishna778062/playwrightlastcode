import { expect } from '@playwright/test';
import { automatedAwardMsgs } from '@recognition/constants/automated-award-constants';
import { WorkAnniversaryFeatureTags } from '@recognition/constants/testTags';
import { recognitionTestFixture as test } from '@recognition/fixtures/recognitionFixture';
import {
  AutomatedAwardPage,
  EditAutomatedAwardPage,
  ManageAutomatedAwardPage,
} from '@recognition/ui/pages/manage/work-anniversary';

import { PAGE_ENDPOINTS, TestGroupType, TestPriority, TIMEOUTS } from '@core/constants';
import { tagTest } from '@core/utils';

import { DialogContainerForm } from '../../../ui/components/workAnniversary-dialog-container-form';

test.describe('Edit work anniversary award', { tag: [WorkAnniversaryFeatureTags.MANAGE_WORK_ANNIVERSARY] }, () => {
  test.beforeEach(async ({ appManagerFixture }) => {
    const { page: appManagerPage } = appManagerFixture;
    const manageAutomatedAwardPage = new ManageAutomatedAwardPage(appManagerPage);
    const automatedAwardPage = new AutomatedAwardPage(appManagerPage);
    await manageAutomatedAwardPage.navigateViaUrl(PAGE_ENDPOINTS.MANAGE_RECOGNITION_MILESTONES);
    const threeDotsButton = manageAutomatedAwardPage.automatedAwards.getThreeDotsButton(0);
    await expect(threeDotsButton).toBeVisible({ timeout: TIMEOUTS.MEDIUM });
    await threeDotsButton.click();
    await manageAutomatedAwardPage.automatedAwards.editMenuItem.click();
    await automatedAwardPage.editMilestoneTitle.waitFor({ state: 'visible' });
  });

  test(
    '[RC-4585] Validate icons on work anniversary award instance post editing',
    {
      tag: [WorkAnniversaryFeatureTags.WORK_ANNIVERSARY, TestPriority.P1, TestGroupType.REGRESSION],
    },
    async ({ appManagerFixture }) => {
      tagTest(test.info(), {
        zephyrTestId: 'RC-4585',
      });
      const { page: appManagerPage } = appManagerFixture;
      const editAutomatedAwardPage = new EditAutomatedAwardPage(appManagerPage);
      const automatedAwardPage = new AutomatedAwardPage(appManagerPage);
      const dialogContainerForm = new DialogContainerForm(appManagerPage);

      await editAutomatedAwardPage.removeAllCustomizationsFromAwardInstance(automatedAwardPage, dialogContainerForm);
      await editAutomatedAwardPage.validateAwardScheduleAndOpenEditInstance(dialogContainerForm);
      await editAutomatedAwardPage.validateEditAwardInstanceDialogElements(dialogContainerForm);
      await editAutomatedAwardPage.customizeMessageInAwardInstance(automatedAwardPage, dialogContainerForm);
      await editAutomatedAwardPage.customizeAuthorInAwardInstance(automatedAwardPage, dialogContainerForm);
      await editAutomatedAwardPage.customizeBadgeInAwardInstance(automatedAwardPage, dialogContainerForm);
      await editAutomatedAwardPage.validateIconsOnAwardInstancePostEditing(dialogContainerForm);
      await editAutomatedAwardPage.removeAllCustomizationsFromAwardInstance(automatedAwardPage, dialogContainerForm);
    }
  );

  test(
    '[RC-4579 RC-4444] Validate Pagination in Award Schedule section on automated awards configuration page',
    {
      tag: [WorkAnniversaryFeatureTags.WORK_ANNIVERSARY, TestPriority.P0, TestGroupType.SANITY],
    },
    async ({ appManagerFixture }) => {
      tagTest(test.info(), {
        zephyrTestId: 'RC-4579,RC-4444',
      });
      const { page: appManagerPage } = appManagerFixture;
      const manageAutomatedAwardPage = new ManageAutomatedAwardPage(appManagerPage);
      const editAutomatedAwardPage = new EditAutomatedAwardPage(appManagerPage);
      const automatedAwardPage = new AutomatedAwardPage(appManagerPage);

      await editAutomatedAwardPage.validatePaginationInAwardSchedule(manageAutomatedAwardPage, automatedAwardPage);
    }
  );

  test(
    '[RC-4578] Verify that all work anniversary award instances are correctly displayed with its UI elements',
    {
      tag: [WorkAnniversaryFeatureTags.WORK_ANNIVERSARY, TestPriority.P0, TestGroupType.SANITY],
    },
    async ({ appManagerFixture }) => {
      tagTest(test.info(), {
        zephyrTestId: 'RC-4578',
      });
      const { page: appManagerPage } = appManagerFixture;
      const manageAutomatedAwardPage = new ManageAutomatedAwardPage(appManagerPage);
      const editAutomatedAwardPage = new EditAutomatedAwardPage(appManagerPage);
      const automatedAwardPage = new AutomatedAwardPage(appManagerPage);

      await editAutomatedAwardPage.verifyAllAwardInstancesWithUIElements(manageAutomatedAwardPage, automatedAwardPage);
    }
  );

  test(
    '[RC-5088] Validate if user is able to preview automated award',
    {
      tag: [WorkAnniversaryFeatureTags.WORK_ANNIVERSARY, TestPriority.P0, TestGroupType.SANITY],
    },
    async ({ appManagerFixture }) => {
      tagTest(test.info(), {
        zephyrTestId: 'RC-5088',
      });
      const { page: appManagerPage } = appManagerFixture;
      const editAutomatedAwardPage = new EditAutomatedAwardPage(appManagerPage);
      const dialogContainerForm = new DialogContainerForm(appManagerPage);

      await editAutomatedAwardPage.validatePreviewAutomatedAward(dialogContainerForm, automatedAwardMsgs);
    }
  );

  test(
    '[RC-5070] Validate if user is able to customize message for work anniversary award instance',
    {
      tag: [WorkAnniversaryFeatureTags.WORK_ANNIVERSARY, TestPriority.P1, TestGroupType.REGRESSION],
    },
    async ({ appManagerFixture }) => {
      tagTest(test.info(), {
        zephyrTestId: 'RC-5070',
      });
      const { page: appManagerPage } = appManagerFixture;
      const editAutomatedAwardPage = new EditAutomatedAwardPage(appManagerPage);
      const automatedAwardPage = new AutomatedAwardPage(appManagerPage);
      const manageAutomatedAwardPage = new ManageAutomatedAwardPage(appManagerPage);
      const dialogContainerForm = new DialogContainerForm(appManagerPage);

      await editAutomatedAwardPage.customizeMessageForAwardInstance(
        automatedAwardPage,
        dialogContainerForm,
        manageAutomatedAwardPage
      );
    }
  );
});

test.describe('Edit work anniversary award verification by Admin User', () => {
  test.beforeEach(async ({ appManagerFixture }) => {
    const { page: appManagerPage } = appManagerFixture;
    const manageAutomatedAwardPage = new ManageAutomatedAwardPage(appManagerPage);
    await manageAutomatedAwardPage.navigateViaUrl(PAGE_ENDPOINTS.MANAGE_RECOGNITION_MILESTONES);
    await manageAutomatedAwardPage.recognitionHeader.waitFor({ state: 'visible' });
  });

  test(
    '[RC-4369] Validate default settings of work anniversary award',
    {
      tag: [WorkAnniversaryFeatureTags.WORK_ANNIVERSARY, TestPriority.P0, TestGroupType.SANITY],
    },
    async ({ appManagerFixture }) => {
      tagTest(test.info(), {
        zephyrTestId: 'RC-4369',
      });
      const { page: appManagerPage } = appManagerFixture;
      const manageAutomatedAwardPage = new ManageAutomatedAwardPage(appManagerPage);
      const editAutomatedAwardPage = new EditAutomatedAwardPage(appManagerPage);
      const automatedAwardPage = new AutomatedAwardPage(appManagerPage);

      await editAutomatedAwardPage.inactivateAwardIfActive(automatedAwardPage, manageAutomatedAwardPage);
      await manageAutomatedAwardPage.navigateViaUrl(PAGE_ENDPOINTS.MANAGE_RECOGNITION_MILESTONES);
      const threeDotsButton = manageAutomatedAwardPage.automatedAwards.getThreeDotsButton(0);
      await expect(threeDotsButton).toBeVisible({ timeout: TIMEOUTS.MEDIUM });
      await threeDotsButton.click();
      await manageAutomatedAwardPage.automatedAwards.editMenuItem.click();
      await automatedAwardPage.editMilestoneTitle.waitFor({ state: 'visible' });

      await editAutomatedAwardPage.validateDefaultUIElements(automatedAwardMsgs);
    }
  );

  test(
    '[RC-4580] Verify that any instance of the work anniversary award can be previewed via eye icon',
    {
      tag: [WorkAnniversaryFeatureTags.WORK_ANNIVERSARY, TestPriority.P0, TestGroupType.SANITY],
    },
    async ({ appManagerFixture }) => {
      tagTest(test.info(), {
        zephyrTestId: 'RC-4580',
      });
      const { page: appManagerPage } = appManagerFixture;
      const manageAutomatedAwardPage = new ManageAutomatedAwardPage(appManagerPage);
      const editAutomatedAwardPage = new EditAutomatedAwardPage(appManagerPage);
      const automatedAwardPage = new AutomatedAwardPage(appManagerPage);
      const dialogContainerForm = new DialogContainerForm(appManagerPage);

      await manageAutomatedAwardPage.navigateViaUrl(PAGE_ENDPOINTS.MANAGE_RECOGNITION_MILESTONES);
      const threeDotsButton = manageAutomatedAwardPage.automatedAwards.getThreeDotsButton(0);
      await expect(threeDotsButton).toBeVisible({ timeout: TIMEOUTS.MEDIUM });
      await threeDotsButton.click();
      await manageAutomatedAwardPage.automatedAwards.editMenuItem.click();
      await automatedAwardPage.editMilestoneTitle.waitFor({ state: 'visible' });

      await editAutomatedAwardPage.verifyPreviewAwardInstanceViaEyeIcon(
        automatedAwardPage,
        dialogContainerForm,
        automatedAwardMsgs
      );
    }
  );
});
