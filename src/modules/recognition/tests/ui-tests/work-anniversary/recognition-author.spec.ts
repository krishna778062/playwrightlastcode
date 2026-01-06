import { expect } from '@playwright/test';
import { recognitionTestFixture as test } from '@recognition/fixtures/recognitionFixture';
import {
  AutomatedAwardPage,
  EditAutomatedAwardPage,
  ManageRecognitionPage,
} from '@recognition/ui/pages/manage/work-anniversary';
import { REWARD_FEATURE_TAGS, REWARD_SUITE_TAGS } from '@rewards/constants/testTags';

import { TestGroupType, TestPriority, TIMEOUTS } from '@core/constants';
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
      await expect(manageRecognitionPage.page).toHaveURL(PAGE_ENDPOINTS.MANAGE_RECOGNITION_MILESTONES);
      await expect(manageRecognitionPage.header).toBeVisible({
        timeout: TIMEOUTS.MEDIUM,
      });
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
        const threeDotsButton = manageRecognitionPage.automatedAwards.getThreeDotsButton(0);
        await expect(threeDotsButton).toBeVisible({ timeout: TIMEOUTS.MEDIUM });
        await threeDotsButton.click();
        await manageRecognitionPage.automatedAwards.editMenuItem.click();
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
