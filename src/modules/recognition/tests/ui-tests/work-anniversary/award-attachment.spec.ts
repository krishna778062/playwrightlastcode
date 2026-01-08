import { expect } from '@playwright/test';
import { recognitionTestFixture as test } from '@recognition/fixtures/recognitionFixture';
import {
  AutomatedAwardPage,
  EditAutomatedAwardPage,
  ManageRecognitionPage,
} from '@recognition/ui/pages/manage/work-anniversary';
import { REWARD_FEATURE_TAGS, REWARD_SUITE_TAGS } from '@rewards/constants/testTags';
import path from 'node:path';

import { PAGE_ENDPOINTS, TestGroupType, TestPriority, TIMEOUTS } from '@core/constants';
import { tagTest } from '@core/utils';

import { DialogContainerForm } from '../../../ui/components/common/workAnniversary-dialog-container-form';

// Get the image file path - directly use content module's test data path
const imagePath = path.resolve(__dirname, '../../../../content/test-data/static-files/images/image1.jpg');

test.describe('Image attachment for automated award', { tag: [REWARD_SUITE_TAGS.MANAGE_WORK_ANNIVERSARY] }, () => {
  test.beforeEach(async ({ appManagerFixture }) => {
    const { page: appManagerPage } = appManagerFixture;
    const manageRecognitionPage = new ManageRecognitionPage(appManagerPage);
    const automatedAwardPage = new AutomatedAwardPage(appManagerPage);
    await manageRecognitionPage.navigateViaUrl(PAGE_ENDPOINTS.MANAGE_RECOGNITION_MILESTONES);
    await expect(manageRecognitionPage.page).toHaveURL(PAGE_ENDPOINTS.MANAGE_RECOGNITION_MILESTONES);
    await expect(manageRecognitionPage.recognitionHeader).toBeVisible({
      timeout: TIMEOUTS.MEDIUM,
    });
    const threeDotsButton = manageRecognitionPage.automatedAwards.getThreeDotsButton(0);
    await expect(threeDotsButton).toBeVisible({ timeout: TIMEOUTS.MEDIUM });
    await threeDotsButton.click();
    await manageRecognitionPage.automatedAwards.editMenuItem.click();
    await automatedAwardPage.editMilestoneTitle.waitFor({ state: 'visible' });
  });

  test(
    '[RC-5328 RC-5327] Validate if user is able to attach and delete image in custom message in automated award',
    {
      tag: [REWARD_FEATURE_TAGS.REWARDS_WORK_ANNIVERSARY, TestPriority.P0, TestGroupType.SANITY],
    },
    async ({ appManagerFixture }) => {
      tagTest(test.info(), {
        zephyrTestId: 'RC-5328,RC-5327',
      });
      const { page: appManagerPage } = appManagerFixture;
      const editAutomatedAwardPage = new EditAutomatedAwardPage(appManagerPage);
      const automatedAwardPage = new AutomatedAwardPage(appManagerPage);
      const manageRecognitionPage = new ManageRecognitionPage(appManagerPage);

      // Select custom award message if not already selected
      await editAutomatedAwardPage.selectCustomAwardMessageRadioButton(automatedAwardPage);

      // Attach image
      await editAutomatedAwardPage.attachImageInCustomAwardMessage(automatedAwardPage, imagePath);

      // Verify cancel reverts changes
      await editAutomatedAwardPage.verifyImageNotPresentAfterCancel(automatedAwardPage, manageRecognitionPage);

      // Select custom award message again
      await editAutomatedAwardPage.selectCustomAwardMessageRadioButton(automatedAwardPage);

      // Attach image again
      await editAutomatedAwardPage.attachImageInCustomAwardMessage(automatedAwardPage, imagePath);

      // Save and verify image is attached
      await editAutomatedAwardPage.saveAndVerifyImageAttached(automatedAwardPage, manageRecognitionPage);

      // Remove image and verify it remains after cancel
      await editAutomatedAwardPage.removeImageAndVerifyRemainsAfterCancel(automatedAwardPage, manageRecognitionPage);

      // Remove image and verify it's deleted after save
      await editAutomatedAwardPage.removeImageAndVerifyDeletedAfterSave(automatedAwardPage, manageRecognitionPage);
    }
  );

  test(
    '[RC-4639 RC-5329] Validate if user can add and delete image in work anniversary award instance',
    {
      tag: [REWARD_FEATURE_TAGS.REWARDS_WORK_ANNIVERSARY, TestPriority.P0, TestGroupType.SANITY],
    },
    async ({ appManagerFixture }) => {
      tagTest(test.info(), {
        zephyrTestId: 'RC-4639,RC-5329',
      });
      const { page: appManagerPage } = appManagerFixture;
      const editAutomatedAwardPage = new EditAutomatedAwardPage(appManagerPage);
      const automatedAwardPage = new AutomatedAwardPage(appManagerPage);
      const dialogContainerForm = new DialogContainerForm(appManagerPage);

      // Open edit award instance dialog
      await editAutomatedAwardPage.openEditAwardInstanceDialog(dialogContainerForm);

      // Add text in customize message section
      await editAutomatedAwardPage.customizeMessageInAwardInstance(automatedAwardPage, dialogContainerForm);

      // Attach image
      await editAutomatedAwardPage.attachImageInAwardInstance(automatedAwardPage, dialogContainerForm, imagePath);

      // Verify cancel reverts changes
      await editAutomatedAwardPage.verifyCancelRevertsImageChangesInAwardInstance(dialogContainerForm);

      // Add text again and verify no image
      await editAutomatedAwardPage.addTextInCustomizeMessageAndVerifyNoImage(dialogContainerForm);

      // Attach image again
      await editAutomatedAwardPage.attachImageInAwardInstance(automatedAwardPage, dialogContainerForm, imagePath);

      // Save and verify image is attached
      await editAutomatedAwardPage.saveAndVerifyImageAttachedInAwardInstance(dialogContainerForm);

      // Remove image and verify it remains after cancel
      await editAutomatedAwardPage.removeImageAndVerifyRemainsAfterCancelInAwardInstance(
        automatedAwardPage,
        dialogContainerForm
      );

      // Remove image and verify it's deleted after save
      await editAutomatedAwardPage.removeImageAndVerifyDeletedAfterSaveInAwardInstance(
        automatedAwardPage,
        dialogContainerForm
      );
    }
  );
});
