import { expect } from '@playwright/test';
import { WorkAnniversaryFeatureTags, WorkAnniversarySuitTags } from '@recognition/constants/testTags';
import { recognitionTestFixture as test } from '@recognition/fixtures/recognitionFixture';
import {
  AutomatedAwardPage,
  EditAutomatedAwardPage,
  ManageAutomatedAwardPage,
} from '@recognition/ui/pages/manage/work-anniversary';

import { PAGE_ENDPOINTS, TestGroupType, TestPriority, TIMEOUTS } from '@core/constants';
import { tagTest } from '@core/utils';

test.describe(
  'Edit details from Award Frequency section',
  { tag: [WorkAnniversarySuitTags.MANAGE_WORK_ANNIVERSARY] },
  () => {
    test.beforeEach(async ({ appManagerFixture }) => {
      const { page: appManagerPage } = appManagerFixture;
      const manageAutomatedAwardPage = new ManageAutomatedAwardPage(appManagerPage);
      const automatedAwardPage = new AutomatedAwardPage(appManagerPage);
      await manageAutomatedAwardPage.navigateViaUrl(PAGE_ENDPOINTS.MANAGE_RECOGNITION_MILESTONES);
      await expect(manageAutomatedAwardPage.page).toHaveURL(PAGE_ENDPOINTS.MANAGE_RECOGNITION_MILESTONES);
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
      '[RC-4458] Verify that Work anniversary award frequency can be changed from default to specific anniversaries',
      {
        tag: [WorkAnniversaryFeatureTags.WORK_ANNIVERSARY, TestPriority.P0, TestGroupType.SANITY],
      },
      async ({ appManagerFixture }) => {
        tagTest(test.info(), {
          zephyrTestId: 'RC-4458',
        });
        const { page: appManagerPage } = appManagerFixture;
        const editAutomatedAwardPage = new EditAutomatedAwardPage(appManagerPage);
        const automatedAwardPage = new AutomatedAwardPage(appManagerPage);
        const manageAutomatedAwardPage = new ManageAutomatedAwardPage(appManagerPage);

        const specificAnniversariesRadioBtn =
          await editAutomatedAwardPage.selectSpecificAnniversariesRadioButton(automatedAwardPage);

        const randomPickedAnniversaries = editAutomatedAwardPage.pickUniqueRandomNumbers(4, 60);
        await editAutomatedAwardPage.fillSpecificAnniversariesAndVerifyInstances(
          automatedAwardPage,
          randomPickedAnniversaries
        );

        await editAutomatedAwardPage.saveSpecificAnniversariesAndVerify(
          automatedAwardPage,
          manageAutomatedAwardPage,
          specificAnniversariesRadioBtn
        );

        await editAutomatedAwardPage.resetToAllWorkAnniversaries(automatedAwardPage);
      }
    );

    test(
      '[RC-4461 RC-5414] Validate error handling when user tries to create anniversaries beyond 60 years, add duplicate entry and special characters, spaces',
      {
        tag: [WorkAnniversaryFeatureTags.WORK_ANNIVERSARY, TestPriority.P0, TestGroupType.SANITY],
      },
      async ({ appManagerFixture }) => {
        tagTest(test.info(), {
          zephyrTestId: 'RC-4461,RC-5414',
        });
        const { page: appManagerPage } = appManagerFixture;
        const editAutomatedAwardPage = new EditAutomatedAwardPage(appManagerPage);
        const automatedAwardPage = new AutomatedAwardPage(appManagerPage);

        await editAutomatedAwardPage.selectSpecificAnniversariesRadioButton(automatedAwardPage);
        await editAutomatedAwardPage.validateAllSpecificAnniversariesErrors(automatedAwardPage);
        await editAutomatedAwardPage.resetToAllWorkAnniversaries(automatedAwardPage);
      }
    );
  }
);
