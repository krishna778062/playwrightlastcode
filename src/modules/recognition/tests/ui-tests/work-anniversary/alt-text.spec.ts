import { expect } from '@playwright/test';
import { recognitionTestFixture as test } from '@recognition/fixtures/recognitionFixture';
import { REWARD_FEATURE_TAGS, REWARD_SUITE_TAGS } from '@rewards/constants/testTags';
import { ManageRecognitionPage } from '@rewards-pages/manage-recognition';
import { AutomatedAwardPage, EditAutomatedAwardPage, milestoneEndpointUrls } from '@rewards-pages/work-anniversary';
import path from 'node:path';

import { PAGE_ENDPOINTS, TestGroupType, TestPriority, TIMEOUTS } from '@core/constants';
import { tagTest } from '@core/utils';

// Get the image file path - directly use content module's test data path
const imagePath = path.resolve(__dirname, '../../../../content/test-data/static-files/images/image1.jpg');

test.describe('Work anniversary - Alt text addition', { tag: [REWARD_SUITE_TAGS.MANAGE_WORK_ANNIVERSARY] }, () => {
  test.beforeEach(async ({ appManagerFixture }) => {
    const { page: appManagerPage } = appManagerFixture;
    const manageRecognitionPage = new ManageRecognitionPage(appManagerPage);
    const automatedAwardPage = new AutomatedAwardPage(appManagerPage);
    await manageRecognitionPage.navigateViaUrl(milestoneEndpointUrls.milestoneEndpointUrl);
    await expect(manageRecognitionPage.page).toHaveURL(PAGE_ENDPOINTS.MANAGE_RECOGNITION_MILESTONES);
    await expect(manageRecognitionPage.header).toBeVisible({
      timeout: TIMEOUTS.MEDIUM,
    });
    const threeDotsButton = manageRecognitionPage.automatedAwards.getThreeDotsButton(0);
    await expect(threeDotsButton).toBeVisible({ timeout: TIMEOUTS.MEDIUM });
    await threeDotsButton.click();
    await manageRecognitionPage.automatedAwards.editMenuItem.click();
    await automatedAwardPage.editMilestoneTitle.waitFor({ state: 'visible' });
  });

  test(
    '[RC-4695] Verify that custom message is saved along with Alt Text in work anniversary award',
    {
      tag: [REWARD_FEATURE_TAGS.REWARDS_WORK_ANNIVERSARY, TestPriority.P0, TestGroupType.SANITY],
    },
    async ({ appManagerFixture }) => {
      tagTest(test.info(), {
        zephyrTestId: 'RC-4695',
      });
      const { page: appManagerPage } = appManagerFixture;
      const editAutomatedAwardPage = new EditAutomatedAwardPage(appManagerPage);
      const automatedAwardPage = new AutomatedAwardPage(appManagerPage);
      const manageRecognitionPage = new ManageRecognitionPage(appManagerPage);

      // Select custom award message if not already selected
      await editAutomatedAwardPage.selectCustomAwardMessageRadioButton(automatedAwardPage);

      // Attach image
      await editAutomatedAwardPage.attachImageInCustomAwardMessage(automatedAwardPage, imagePath);

      // Validate alt text icon and UI elements
      await editAutomatedAwardPage.validateAltTextIconAndUIElements(automatedAwardPage);

      // Verify cancel reverts alt text changes
      await editAutomatedAwardPage.verifyCancelRevertsAltTextChanges(automatedAwardPage);

      // Add and update alt text
      await editAutomatedAwardPage.addAndUpdateAltText(automatedAwardPage, manageRecognitionPage);

      // Save and verify image with alt text is attached
      await editAutomatedAwardPage.saveAndVerifyImageWithAltTextAttached(automatedAwardPage, manageRecognitionPage);

      // Remove image and verify it's deleted after save
      await editAutomatedAwardPage.removeImageAndVerifyDeletedAfterSaveForAltText(
        automatedAwardPage,
        manageRecognitionPage
      );
    }
  );

  test(
    '[RC-5423 RC-5424] Verify that custom message can be saved and edited along with Alt Text for work anniversary award instance',
    {
      tag: [REWARD_FEATURE_TAGS.REWARDS_WORK_ANNIVERSARY, TestPriority.P0, TestGroupType.SANITY],
    },
    async ({ appManagerFixture }) => {
      tagTest(test.info(), {
        zephyrTestId: 'RC-5423,RC-5424',
      });
      const { page: appManagerPage } = appManagerFixture;
      const editAutomatedAwardPage = new EditAutomatedAwardPage(appManagerPage);
      const automatedAwardPage = new AutomatedAwardPage(appManagerPage);
      const manageRecognitionPage = new ManageRecognitionPage(appManagerPage);

      // Open edit award instance dialog
      await editAutomatedAwardPage.openEditAwardInstanceDialog(manageRecognitionPage);

      // Add text in customize message section
      await editAutomatedAwardPage.customizeMessageInAwardInstance(automatedAwardPage, manageRecognitionPage);

      // Attach image
      await editAutomatedAwardPage.attachImageInAwardInstance(automatedAwardPage, manageRecognitionPage, imagePath);

      // Validate alt text icon and UI elements
      await editAutomatedAwardPage.validateAltTextIconAndUIElementsInAwardInstance(
        automatedAwardPage,
        manageRecognitionPage
      );

      // Verify cancel reverts alt text changes
      await editAutomatedAwardPage.verifyCancelRevertsAltTextChangesInAwardInstance(
        automatedAwardPage,
        manageRecognitionPage
      );

      // Add and update alt text
      await editAutomatedAwardPage.addAndUpdateAltTextInAwardInstance(automatedAwardPage, manageRecognitionPage);

      // Save and verify image with alt text is attached
      await editAutomatedAwardPage.saveAndVerifyImageWithAltTextAttachedInAwardInstance(manageRecognitionPage);

      // Remove image and verify it's deleted after save
      await editAutomatedAwardPage.removeImageAndVerifyDeletedAfterSaveForAltTextInAwardInstance(manageRecognitionPage);
    }
  );
});
