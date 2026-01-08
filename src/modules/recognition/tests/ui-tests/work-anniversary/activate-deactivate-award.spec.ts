import { expect } from '@playwright/test';
import { automatedAwardMsgs } from '@recognition/constants/automated-award-constants';
import { recognitionTestFixture as test } from '@recognition/fixtures/recognitionFixture';
import {
  AutomatedAwardPage,
  EditAutomatedAwardPage,
  ManageRecognitionPage,
} from '@recognition/ui/pages/manage/work-anniversary';
import { REWARD_FEATURE_TAGS, REWARD_SUITE_TAGS } from '@rewards/constants/testTags';

import { PAGE_ENDPOINTS, TestGroupType, TestPriority, TIMEOUTS } from '@core/constants';
import { tagTest } from '@core/utils';

test.describe(
  'Work anniversary award activation by Admin',
  { tag: [REWARD_SUITE_TAGS.MANAGE_WORK_ANNIVERSARY] },
  () => {
    test.beforeEach(async ({ appManagerFixture }) => {
      const { page: appManagerPage } = appManagerFixture;
      const manageRecognitionPage = new ManageRecognitionPage(appManagerPage);
      await manageRecognitionPage.navigateViaUrl(PAGE_ENDPOINTS.MANAGE_RECOGNITION_MILESTONES);
      await expect(manageRecognitionPage.page).toHaveURL(PAGE_ENDPOINTS.MANAGE_RECOGNITION_MILESTONES);
      await expect(manageRecognitionPage.recognitionHeader).toBeVisible({
        timeout: TIMEOUTS.MEDIUM,
      });
    });

    test(
      '[RC-5087] Verify if user is able to activate automated award from award listing page',
      {
        tag: [REWARD_FEATURE_TAGS.REWARDS_WORK_ANNIVERSARY, TestPriority.P0, TestGroupType.SANITY],
      },
      async ({ appManagerFixture }) => {
        tagTest(test.info(), {
          zephyrTestId: 'RC-5087',
        });
        const { page: appManagerPage } = appManagerFixture;
        const automatedAwardPage = new AutomatedAwardPage(appManagerPage);
        const manageRecognitionPage = new ManageRecognitionPage(appManagerPage);

        // Inactivate the award if active
        await automatedAwardPage.inactivateAwardIfActive(manageRecognitionPage);

        // Activate award from listing page
        await automatedAwardPage.activateAwardFromListingPage(manageRecognitionPage);
      }
    );

    test(
      '[RC-4367] Verify award activation post doing edits on work anniversary award from edit automated page',
      {
        tag: [REWARD_FEATURE_TAGS.REWARDS_WORK_ANNIVERSARY, TestPriority.P0, TestGroupType.SANITY],
      },
      async ({ appManagerFixture }) => {
        tagTest(test.info(), {
          zephyrTestId: 'RC-4367',
        });
        const { page: appManagerPage } = appManagerFixture;
        const editAutomatedAwardPage = new EditAutomatedAwardPage(appManagerPage);
        const automatedAwardPage = new AutomatedAwardPage(appManagerPage);
        const manageRecognitionPage = new ManageRecognitionPage(appManagerPage);

        // Inactivate the award if active
        await editAutomatedAwardPage.inactivateAwardIfActive(automatedAwardPage, manageRecognitionPage);

        // Edit award message and activate
        await editAutomatedAwardPage.editAwardMessageAndActivate(automatedAwardPage, manageRecognitionPage);
      }
    );
  }
);

test.describe('Work anniversary award activation by Recognition Manager', () => {
  test.beforeEach(async ({ appManagerFixture }) => {
    const { page: appManagerPage } = appManagerFixture;
    const manageRecognitionPage = new ManageRecognitionPage(appManagerPage);
    await manageRecognitionPage.navigateViaUrl(PAGE_ENDPOINTS.MANAGE_RECOGNITION_MILESTONES);
    await expect(manageRecognitionPage.page).toHaveURL(PAGE_ENDPOINTS.MANAGE_RECOGNITION_MILESTONES);
    await expect(manageRecognitionPage.recognitionHeader).toBeVisible({
      timeout: TIMEOUTS.MEDIUM,
    });
  });

  test(
    '[RC-4359] Verify Rec Managers Can Activate the Work Anniversary Award',
    {
      tag: [REWARD_FEATURE_TAGS.REWARDS_WORK_ANNIVERSARY, TestPriority.P0, TestGroupType.SANITY],
    },
    async ({ appManagerFixture }) => {
      tagTest(test.info(), {
        zephyrTestId: 'RC-4359',
      });
      const { page: appManagerPage } = appManagerFixture;
      const editAutomatedAwardPage = new EditAutomatedAwardPage(appManagerPage);
      const automatedAwardPage = new AutomatedAwardPage(appManagerPage);
      const manageRecognitionPage = new ManageRecognitionPage(appManagerPage);

      // Inactivate the award if active
      await editAutomatedAwardPage.inactivateAwardIfActive(automatedAwardPage, manageRecognitionPage);

      // Navigate back to the listing page and wait for it to load
      await manageRecognitionPage.navigateViaUrl(PAGE_ENDPOINTS.MANAGE_RECOGNITION_MILESTONES);
      await expect(manageRecognitionPage.page).toHaveURL(PAGE_ENDPOINTS.MANAGE_RECOGNITION_MILESTONES);
      // Check for error page first
      const errorMessage = appManagerPage.getByText('Something went wrong', { exact: false });
      const isErrorVisible = await errorMessage.isVisible().catch(() => false);
      if (isErrorVisible) {
        throw new Error('Page loaded with error: "Something went wrong - please try again later"');
      }
      await expect(manageRecognitionPage.recognitionHeader).toBeVisible({
        timeout: TIMEOUTS.MEDIUM,
      });

      // Open edit page
      const threeDotsButton = manageRecognitionPage.automatedAwards.getThreeDotsButton(0);
      await expect(threeDotsButton).toBeVisible({ timeout: TIMEOUTS.MEDIUM });
      await threeDotsButton.click();
      await manageRecognitionPage.automatedAwards.editMenuItem.click();
      await automatedAwardPage.editMilestoneTitle.waitFor({ state: 'visible' });

      // Validate UI elements for Activate this award section
      await editAutomatedAwardPage.validateActivateAwardUIElements(automatedAwardMsgs);

      // Activate award via toggle
      await editAutomatedAwardPage.activateAwardViaToggle(automatedAwardPage, manageRecognitionPage);
    }
  );
});
