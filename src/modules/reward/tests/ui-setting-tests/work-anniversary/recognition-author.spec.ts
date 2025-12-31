import { expect } from '@playwright/test';
import { REWARD_FEATURE_TAGS, REWARD_SUITE_TAGS } from '@rewards/constants/testTags';
import { rewardTestFixture as test } from '@rewards/fixtures/rewardFixture';
import { ManageRecognitionPage } from '@rewards-pages/manage-recognition';
import { AutomatedAwardPage, EditAutomatedAwardPage } from '@rewards-pages/work-anniversary';

import { TestGroupType, TestPriority } from '@core/constants';
import { PAGE_ENDPOINTS } from '@core/constants/pageEndpoints';
import { tagTest } from '@core/utils';

test.describe(
  'Edit details from Recognition Author section',
  { tag: [REWARD_SUITE_TAGS.MANAGE_WORK_ANNIVERSARY] },
  () => {
    test.beforeEach(async ({ appManagerFixture }) => {
      const { page: appManagerPage } = appManagerFixture;
      const manageRecognitionPage = new ManageRecognitionPage(appManagerPage);
      await manageRecognitionPage.navigateViaUrl(PAGE_ENDPOINTS.MANAGE_RECOGNITION_MILESTONES);
      await expect(manageRecognitionPage.header).toBeVisible();
      await manageRecognitionPage.automatedAwards.getThreeDotsButton(0).click();
      await manageRecognitionPage.automatedAwards.editMenuItem.click();
    });

    test(
      '[RC-5075] Validate if user is able to set recognition author as "no author" for automated award',
      {
        tag: [REWARD_FEATURE_TAGS.REWARDS_WORK_ANNIVERSARY, TestPriority.P0, TestGroupType.SANITY],
      },
      async ({ appManagerFixture }) => {
        tagTest(test.info(), {
          zephyrTestId: 'RC-5075',
        });
        const { page: appManagerPage } = appManagerFixture;
        const editAutomatedAwardPage = new EditAutomatedAwardPage(appManagerPage);
        const automatedAwardPage = new AutomatedAwardPage(appManagerPage);
        const manageRecognitionPage = new ManageRecognitionPage(appManagerPage);

        await editAutomatedAwardPage.setRecognitionAuthorAsNoAuthor(automatedAwardPage, manageRecognitionPage);
      }
    );

    test(
      '[RC-5170] Validate Intranet name on edit automated award page post editing orgname',
      {
        tag: [REWARD_FEATURE_TAGS.REWARDS_WORK_ANNIVERSARY, TestPriority.P1, TestGroupType.REGRESSION],
      },
      async ({ appManagerFixture }) => {
        tagTest(test.info(), {
          zephyrTestId: 'RC-5170',
        });
        const { page: appManagerPage } = appManagerFixture;
        const editAutomatedAwardPage = new EditAutomatedAwardPage(appManagerPage);
        const manageRecognitionPage = new ManageRecognitionPage(appManagerPage);

        const intranetNameBefore = await editAutomatedAwardPage.getIntranetNameFromRecognitionAuthor();

        const newIntranetName = 'intranetNameByTestAutomation_' + Math.floor(Math.random() * 1000);
        await manageRecognitionPage.navigateViaUrl(PAGE_ENDPOINTS.APPLICATION_SETTINGS);
        await manageRecognitionPage.getTextBoxByPassingText('Intranet name').fill(newIntranetName);
        await manageRecognitionPage.getButtonByPassingText('Save').scrollIntoViewIfNeeded();
        await manageRecognitionPage.getButtonByPassingText('Save').click();
        await expect(manageRecognitionPage.toastAlertText).toHaveText('Saved changes successfully');

        await manageRecognitionPage.navigateToAutomatedAwardsPage();
        await manageRecognitionPage.automatedAwards.getThreeDotsButton(0).click();
        await manageRecognitionPage.automatedAwards.editMenuItem.click();
        const recognitionAuthorIntranetNameText = await editAutomatedAwardPage
          .getElementByPassingPartialText('Intranet name')
          .textContent();
        const intranetNameAfter = editAutomatedAwardPage.extractIntranetName(recognitionAuthorIntranetNameText);

        await editAutomatedAwardPage.verifyIntranetNameUpdated(intranetNameBefore, newIntranetName);
      }
    );

    test(
      '[RC-4443] Validate Changing Default Author to "Selected user" for work anniversary award',
      {
        tag: [REWARD_FEATURE_TAGS.REWARDS_WORK_ANNIVERSARY, TestPriority.P0, TestGroupType.SANITY],
      },
      async ({ appManagerFixture }) => {
        tagTest(test.info(), {
          zephyrTestId: 'RC-4443',
        });
        const { page: appManagerPage } = appManagerFixture;
        const manageRecognitionPage = new ManageRecognitionPage(appManagerPage);
        const editAutomatedAwardPage = new EditAutomatedAwardPage(appManagerPage);
        const automatedAwardPage = new AutomatedAwardPage(appManagerPage);

        await editAutomatedAwardPage.changeDefaultAuthorToSelectedUser(automatedAwardPage, manageRecognitionPage);
      }
    );
  }
);
