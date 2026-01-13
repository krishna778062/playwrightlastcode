import { expect } from '@playwright/test';
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

test.describe('Customize work anniversary award', { tag: [WorkAnniversaryFeatureTags.MANAGE_WORK_ANNIVERSARY] }, () => {
  test.beforeEach(async ({ appManagerFixture }) => {
    const { page: appManagerPage } = appManagerFixture;
    const manageAutomatedAwardPage = new ManageAutomatedAwardPage(appManagerPage);
    const automatedAwardPage = new AutomatedAwardPage(appManagerPage);
    await manageAutomatedAwardPage.navigateViaUrl(PAGE_ENDPOINTS.MANAGE_RECOGNITION_MILESTONES);
    await expect(manageAutomatedAwardPage.page).toHaveURL(PAGE_ENDPOINTS.MANAGE_RECOGNITION_MILESTONES);
    // Check for error page first
    const errorMessage = appManagerPage.getByText('Something went wrong', { exact: false });
    const isErrorVisible = await errorMessage.isVisible().catch(() => false);
    if (isErrorVisible) {
      throw new Error('Page loaded with error: "Something went wrong - please try again later"');
    }
    await expect(manageAutomatedAwardPage.recognitionHeader).toBeVisible({
      timeout: TIMEOUTS.MEDIUM,
    });
    const threeDotsButton = manageAutomatedAwardPage.automatedAwards.getThreeDotsButton(0);
    await expect(threeDotsButton).toBeVisible({ timeout: TIMEOUTS.MEDIUM });
    await threeDotsButton.click();
    await manageAutomatedAwardPage.automatedAwards.editMenuItem.click();
    await automatedAwardPage.editMilestoneTitle.waitFor({ state: 'visible' });
  });

  test(
    '[RC-5077] Validate if user is able set recognition author as "no author" for work anniversary award instance',
    {
      tag: [WorkAnniversaryFeatureTags.WORK_ANNIVERSARY, TestPriority.P0, TestGroupType.SANITY],
    },
    async ({ appManagerFixture }) => {
      tagTest(test.info(), {
        zephyrTestId: 'RC-5077',
      });
      const { page: appManagerPage } = appManagerFixture;
      const editAutomatedAwardPage = new EditAutomatedAwardPage(appManagerPage);
      const automatedAwardPage = new AutomatedAwardPage(appManagerPage);
      const dialogContainerForm = new DialogContainerForm(appManagerPage);

      await editAutomatedAwardPage.setAuthorAsNoAuthorForAwardInstance(automatedAwardPage, dialogContainerForm, 2);
    }
  );

  test(
    '[RC-5076] Validate if user is able to set recognition author as "custom" for work anniversary award instance',
    {
      tag: [WorkAnniversaryFeatureTags.WORK_ANNIVERSARY, TestPriority.P0, TestGroupType.SANITY],
    },
    async ({ appManagerFixture }) => {
      tagTest(test.info(), {
        zephyrTestId: 'RC-5076',
      });
      const { page: appManagerPage } = appManagerFixture;
      const editAutomatedAwardPage = new EditAutomatedAwardPage(appManagerPage);
      const automatedAwardPage = new AutomatedAwardPage(appManagerPage);
      const dialogContainerForm = new DialogContainerForm(appManagerPage);

      await editAutomatedAwardPage.setAuthorAsCustomForAwardInstance(automatedAwardPage, dialogContainerForm, 2);
    }
  );

  test(
    '[RC-5074] Validate if user is able to set recognition author as "selected user" for work anniversary award instance',
    {
      tag: [WorkAnniversaryFeatureTags.WORK_ANNIVERSARY, TestPriority.P0, TestGroupType.SANITY],
    },
    async ({ appManagerFixture }) => {
      tagTest(test.info(), {
        zephyrTestId: 'RC-5074',
      });
      const { page: appManagerPage } = appManagerFixture;
      const editAutomatedAwardPage = new EditAutomatedAwardPage(appManagerPage);
      const automatedAwardPage = new AutomatedAwardPage(appManagerPage);
      const dialogContainerForm = new DialogContainerForm(appManagerPage);

      await editAutomatedAwardPage.setAuthorAsSelectedUserForAwardInstance(automatedAwardPage, dialogContainerForm, 4);
    }
  );

  test(
    '[RC-4582] Verify that author of the work anniversary award instance can be edited and selected as "Intranet name"',
    {
      tag: [WorkAnniversaryFeatureTags.WORK_ANNIVERSARY, TestPriority.P0, TestGroupType.SANITY],
    },
    async ({ appManagerFixture }) => {
      tagTest(test.info(), {
        zephyrTestId: 'RC-4582',
      });
      const { page: appManagerPage } = appManagerFixture;
      const editAutomatedAwardPage = new EditAutomatedAwardPage(appManagerPage);
      const automatedAwardPage = new AutomatedAwardPage(appManagerPage);
      const dialogContainerForm = new DialogContainerForm(appManagerPage);

      await editAutomatedAwardPage.setAuthorAsIntranetNameForAwardInstance(automatedAwardPage, dialogContainerForm, 1);
    }
  );

  test(
    '[RC-5417] Validate character limit in custom message of work anniversary award instance',
    {
      tag: [WorkAnniversaryFeatureTags.WORK_ANNIVERSARY, TestPriority.P1, TestGroupType.REGRESSION],
    },
    async ({ appManagerFixture }) => {
      tagTest(test.info(), {
        zephyrTestId: 'RC-5417',
      });
      const { page: appManagerPage } = appManagerFixture;
      const editAutomatedAwardPage = new EditAutomatedAwardPage(appManagerPage);
      const automatedAwardPage = new AutomatedAwardPage(appManagerPage);
      const dialogContainerForm = new DialogContainerForm(appManagerPage);

      await editAutomatedAwardPage.validateCharacterLimitInCustomMessage(automatedAwardPage, dialogContainerForm, 0);
    }
  );
});
