import { expect } from '@playwright/test';
import { WorkAnniversaryFeatureTags } from '@recognition/constants/testTags';
import { recognitionTestFixture as test } from '@recognition/fixtures/recognitionFixture';
import {
  AutomatedAwardPage,
  EditAutomatedAwardPage,
  ManageAutomatedAwardPage,
} from '@recognition/ui/pages/manage/work-anniversary';

import { TestGroupType, TestPriority, TIMEOUTS } from '@core/constants';
import { PAGE_ENDPOINTS } from '@core/constants/pageEndpoints';
import { tagTest } from '@core/utils';

test.describe(
  'Edit details from Recognition Author section',
  { tag: [WorkAnniversaryFeatureTags.MANAGE_WORK_ANNIVERSARY] },
  () => {
    test.beforeEach(async ({ appManagerFixture }) => {
      const { page: appManagerPage } = appManagerFixture;
      const manageAutomatedAwardPage = new ManageAutomatedAwardPage(appManagerPage);
      await manageAutomatedAwardPage.navigateViaUrl(PAGE_ENDPOINTS.MANAGE_RECOGNITION_MILESTONES);
      await expect(manageAutomatedAwardPage.page).toHaveURL(PAGE_ENDPOINTS.MANAGE_RECOGNITION_MILESTONES);
      await expect(manageAutomatedAwardPage.recognitionHeader).toBeVisible({
        timeout: TIMEOUTS.MEDIUM,
      });
      await manageAutomatedAwardPage.automatedAwards.getThreeDotsButton(0).click();
      await manageAutomatedAwardPage.automatedAwards.editMenuItem.click();
    });

    test(
      '[RC-5075] Validate if user is able to set recognition author as "no author" for automated award',
      {
        tag: [WorkAnniversaryFeatureTags.WORK_ANNIVERSARY, TestPriority.P0, TestGroupType.SANITY],
      },
      async ({ appManagerFixture }) => {
        tagTest(test.info(), {
          zephyrTestId: 'RC-5075',
        });
        const { page: appManagerPage } = appManagerFixture;
        const editAutomatedAwardPage = new EditAutomatedAwardPage(appManagerPage);
        const automatedAwardPage = new AutomatedAwardPage(appManagerPage);
        const manageAutomatedAwardPage = new ManageAutomatedAwardPage(appManagerPage);

        await editAutomatedAwardPage.setRecognitionAuthorAsNoAuthor(automatedAwardPage, manageAutomatedAwardPage);
      }
    );

    test(
      '[RC-5170] Validate Intranet name on edit automated award page post editing orgname',
      {
        tag: [WorkAnniversaryFeatureTags.WORK_ANNIVERSARY, TestPriority.P1, TestGroupType.REGRESSION],
      },
      async ({ appManagerFixture }) => {
        tagTest(test.info(), {
          zephyrTestId: 'RC-5170',
        });
        const { page: appManagerPage } = appManagerFixture;
        const editAutomatedAwardPage = new EditAutomatedAwardPage(appManagerPage);
        const manageAutomatedAwardPage = new ManageAutomatedAwardPage(appManagerPage);

        const intranetNameBefore = await editAutomatedAwardPage.getIntranetNameFromRecognitionAuthor();

        const newIntranetName = 'intranetNameByTestAutomation_' + Math.floor(Math.random() * 1000);
        await manageAutomatedAwardPage.navigateViaUrl(PAGE_ENDPOINTS.APPLICATION_SETTINGS);
        await manageAutomatedAwardPage.getTextBoxByPassingText('Intranet name').fill(newIntranetName);
        await manageAutomatedAwardPage.getButtonByPassingText('Save').scrollIntoViewIfNeeded();
        await manageAutomatedAwardPage.getButtonByPassingText('Save').click();
        await expect(manageAutomatedAwardPage.toastAlertText).toHaveText('Saved changes successfully');

        await manageAutomatedAwardPage.navigateToAutomatedAwardsPage();
        const threeDotsButton = manageAutomatedAwardPage.automatedAwards.getThreeDotsButton(0);
        await expect(threeDotsButton).toBeVisible({ timeout: TIMEOUTS.MEDIUM });
        await threeDotsButton.click();
        await manageAutomatedAwardPage.automatedAwards.editMenuItem.click();
        await editAutomatedAwardPage.verifyIntranetNameUpdated(intranetNameBefore, newIntranetName);
      }
    );

    test(
      '[RC-4443] Validate Changing Default Author to "Selected user" for work anniversary award',
      {
        tag: [WorkAnniversaryFeatureTags.WORK_ANNIVERSARY, TestPriority.P0, TestGroupType.SANITY],
      },
      async ({ appManagerFixture }) => {
        tagTest(test.info(), {
          zephyrTestId: 'RC-4443',
        });
        const { page: appManagerPage } = appManagerFixture;
        const manageAutomatedAwardPage = new ManageAutomatedAwardPage(appManagerPage);
        const editAutomatedAwardPage = new EditAutomatedAwardPage(appManagerPage);
        const automatedAwardPage = new AutomatedAwardPage(appManagerPage);

        await editAutomatedAwardPage.changeDefaultAuthorToSelectedUser(automatedAwardPage, manageAutomatedAwardPage);
      }
    );
  }
);
