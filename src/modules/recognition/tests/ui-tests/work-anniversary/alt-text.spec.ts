import { expect } from '@playwright/test';
import { WorkAnniversaryFeatureTags, WorkAnniversarySuitTags } from '@recognition/constants/testTags';
import { recognitionTestFixture as test } from '@recognition/fixtures/recognitionFixture';
import {
  AutomatedAwardPage,
  EditAutomatedAwardPage,
  ManageAutomatedAwardPage,
} from '@recognition/ui/pages/manage/work-anniversary';
import path from 'node:path';

import { PAGE_ENDPOINTS, TestGroupType, TestPriority, TIMEOUTS } from '@core/constants';
import { tagTest } from '@core/utils';

import { DialogContainerForm } from '../../../ui/components/workAnniversary-dialog-container-form';

// Get the image file path - directly use content module's test data path
const imagePath = path.resolve(__dirname, '../../../../content/test-data/static-files/images/image1.jpg');

test.describe(
  'Work anniversary - Alt text addition',
  { tag: [WorkAnniversarySuitTags.MANAGE_WORK_ANNIVERSARY] },
  () => {
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
      '[RC-4695] Verify that custom message is saved along with Alt Text in work anniversary award',
      {
        tag: [WorkAnniversaryFeatureTags.WORK_ANNIVERSARY, TestPriority.P0, TestGroupType.SANITY],
      },
      async ({ appManagerFixture }) => {
        tagTest(test.info(), {
          zephyrTestId: 'RC-4695',
        });
        const { page: appManagerPage } = appManagerFixture;
        const editAutomatedAwardPage = new EditAutomatedAwardPage(appManagerPage);
        const automatedAwardPage = new AutomatedAwardPage(appManagerPage);
        const manageAutomatedAwardPage = new ManageAutomatedAwardPage(appManagerPage);
        const dialogContainerForm = new DialogContainerForm(appManagerPage);

        // Select custom award message if not already selected
        await editAutomatedAwardPage.selectCustomAwardMessageRadioButton(automatedAwardPage);

        // Attach image
        await editAutomatedAwardPage.attachImageInCustomAwardMessage(automatedAwardPage, imagePath);

        // Validate alt text icon and UI elements
        await editAutomatedAwardPage.validateAltTextIconAndUIElements(automatedAwardPage);

        // Verify cancel reverts alt text changes
        await editAutomatedAwardPage.verifyCancelRevertsAltTextChanges(automatedAwardPage);

        // Add and update alt text
        await editAutomatedAwardPage.addAndUpdateAltText(automatedAwardPage, dialogContainerForm);

        // Save and verify image with alt text is attached
        await editAutomatedAwardPage.saveAndVerifyImageWithAltTextAttached(
          automatedAwardPage,
          manageAutomatedAwardPage
        );

        // Remove image and verify it's deleted after save
        await editAutomatedAwardPage.removeImageAndVerifyDeletedAfterSaveForAltText(
          automatedAwardPage,
          manageAutomatedAwardPage
        );
      }
    );

    test(
      '[RC-5423 RC-5424] Verify that custom message can be saved and edited along with Alt Text for work anniversary award instance',
      {
        tag: [WorkAnniversaryFeatureTags.WORK_ANNIVERSARY, TestPriority.P0, TestGroupType.SANITY],
      },
      async ({ appManagerFixture }) => {
        tagTest(test.info(), {
          zephyrTestId: 'RC-5423,RC-5424',
        });
        const { page: appManagerPage } = appManagerFixture;
        const editAutomatedAwardPage = new EditAutomatedAwardPage(appManagerPage);
        const automatedAwardPage = new AutomatedAwardPage(appManagerPage);
        const manageAutomatedAwardPage = new ManageAutomatedAwardPage(appManagerPage);
        const dialogContainerForm = new DialogContainerForm(appManagerPage);

        // Open edit award instance dialog
        await editAutomatedAwardPage.openEditAwardInstanceDialog(dialogContainerForm);

        // Add text in customize message section
        await editAutomatedAwardPage.customizeMessageInAwardInstance(automatedAwardPage, dialogContainerForm);

        // Attach image
        await editAutomatedAwardPage.attachImageInAwardInstance(automatedAwardPage, dialogContainerForm, imagePath);

        // Validate alt text icon and UI elements
        await editAutomatedAwardPage.validateAltTextIconAndUIElementsInAwardInstance(
          automatedAwardPage,
          dialogContainerForm
        );

        // Verify cancel reverts alt text changes
        await editAutomatedAwardPage.verifyCancelRevertsAltTextChangesInAwardInstance(
          automatedAwardPage,
          dialogContainerForm
        );

        // Add and update alt text
        await editAutomatedAwardPage.addAndUpdateAltTextInAwardInstance(automatedAwardPage, dialogContainerForm);

        // Save and verify image with alt text is attached
        await editAutomatedAwardPage.saveAndVerifyImageWithAltTextAttachedInAwardInstance(dialogContainerForm);

        // Remove image and verify it's deleted after save
        await editAutomatedAwardPage.removeImageAndVerifyDeletedAfterSaveForAltTextInAwardInstance(dialogContainerForm);
      }
    );
  }
);
