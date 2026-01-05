import { expect } from '@playwright/test';
import { recognitionTestFixture as test } from '@recognition/fixtures/recognitionFixture';
import { REWARD_FEATURE_TAGS, REWARD_SUITE_TAGS } from '@rewards/constants/testTags';
import { ManageRecognitionPage } from '@rewards-pages/manage-recognition';
import {
  automatedAwardMsgs,
  AutomatedAwardPage,
  EditAutomatedAwardPage,
  milestoneEndpointUrls,
} from '@rewards-pages/work-anniversary';

import { TestGroupType, TestPriority, TIMEOUTS } from '@core/constants';
import { tagTest } from '@core/utils';

test.describe('Edit work anniversary award', { tag: [REWARD_SUITE_TAGS.MANAGE_WORK_ANNIVERSARY] }, () => {
  test.beforeEach(async ({ appManagerFixture }) => {
    const { page: appManagerPage } = appManagerFixture;
    const manageRecognitionPage = new ManageRecognitionPage(appManagerPage);
    const automatedAwardPage = new AutomatedAwardPage(appManagerPage);
    await manageRecognitionPage.navigateViaUrl(milestoneEndpointUrls.milestoneEndpointUrl);
    const threeDotsButton = manageRecognitionPage.automatedAwards.getThreeDotsButton(0);
    await expect(threeDotsButton).toBeVisible({ timeout: TIMEOUTS.MEDIUM });
    await threeDotsButton.click();
    await manageRecognitionPage.automatedAwards.editMenuItem.click();
    await automatedAwardPage.editMilestoneTitle.waitFor({ state: 'visible' });
  });

  test(
    '[RC-4585] Validate icons on work anniversary award instance post editing',
    {
      tag: [REWARD_FEATURE_TAGS.REWARDS_WORK_ANNIVERSARY, TestPriority.P1, TestGroupType.REGRESSION],
    },
    async ({ appManagerFixture }) => {
      tagTest(test.info(), {
        zephyrTestId: 'RC-4585',
      });
      const { page: appManagerPage } = appManagerFixture;
      const editAutomatedAwardPage = new EditAutomatedAwardPage(appManagerPage);
      const automatedAwardPage = new AutomatedAwardPage(appManagerPage);
      const manageRecognitionPage = new ManageRecognitionPage(appManagerPage);

      await editAutomatedAwardPage.removeAllCustomizationsFromAwardInstance(automatedAwardPage, manageRecognitionPage);
      await editAutomatedAwardPage.validateAwardScheduleAndOpenEditInstance(manageRecognitionPage);
      await editAutomatedAwardPage.validateEditAwardInstanceDialogElements(manageRecognitionPage);
      await editAutomatedAwardPage.customizeMessageInAwardInstance(automatedAwardPage, manageRecognitionPage);
      await editAutomatedAwardPage.customizeAuthorInAwardInstance(automatedAwardPage, manageRecognitionPage);
      await editAutomatedAwardPage.customizeBadgeInAwardInstance(automatedAwardPage, manageRecognitionPage);
      await editAutomatedAwardPage.validateIconsOnAwardInstancePostEditing(manageRecognitionPage);
      await editAutomatedAwardPage.removeAllCustomizationsFromAwardInstance(automatedAwardPage, manageRecognitionPage);
    }
  );

  test(
    '[RC-4579 RC-4444] Validate Pagination in Award Schedule section on automated awards configuration page',
    {
      tag: [REWARD_FEATURE_TAGS.REWARDS_WORK_ANNIVERSARY, TestPriority.P0, TestGroupType.SANITY],
    },
    async ({ appManagerFixture }) => {
      tagTest(test.info(), {
        zephyrTestId: 'RC-4579,RC-4444',
      });
      const { page: appManagerPage } = appManagerFixture;
      const manageRecognitionPage = new ManageRecognitionPage(appManagerPage);
      const editAutomatedAwardPage = new EditAutomatedAwardPage(appManagerPage);
      const automatedAwardPage = new AutomatedAwardPage(appManagerPage);

      await editAutomatedAwardPage.validatePaginationInAwardSchedule(manageRecognitionPage, automatedAwardPage);
    }
  );

  test(
    '[RC-4578] Verify that all work anniversary award instances are correctly displayed with its UI elements',
    {
      tag: [REWARD_FEATURE_TAGS.REWARDS_WORK_ANNIVERSARY, TestPriority.P0, TestGroupType.SANITY],
    },
    async ({ appManagerFixture }) => {
      tagTest(test.info(), {
        zephyrTestId: 'RC-4578',
      });
      const { page: appManagerPage } = appManagerFixture;
      const manageRecognitionPage = new ManageRecognitionPage(appManagerPage);
      const editAutomatedAwardPage = new EditAutomatedAwardPage(appManagerPage);
      const automatedAwardPage = new AutomatedAwardPage(appManagerPage);

      await editAutomatedAwardPage.verifyAllAwardInstancesWithUIElements(manageRecognitionPage, automatedAwardPage);
    }
  );

  test(
    '[RC-5088] Validate if user is able to preview automated award',
    {
      tag: [REWARD_FEATURE_TAGS.REWARDS_WORK_ANNIVERSARY, TestPriority.P0, TestGroupType.SANITY],
    },
    async ({ appManagerFixture }) => {
      tagTest(test.info(), {
        zephyrTestId: 'RC-5088',
      });
      const { page: appManagerPage } = appManagerFixture;
      const manageRecognitionPage = new ManageRecognitionPage(appManagerPage);
      const editAutomatedAwardPage = new EditAutomatedAwardPage(appManagerPage);

      await editAutomatedAwardPage.validatePreviewAutomatedAward(manageRecognitionPage, automatedAwardMsgs);
    }
  );

  test(
    '[RC-5070] Validate if user is able to customize message for work anniversary award instance',
    {
      tag: [REWARD_FEATURE_TAGS.REWARDS_WORK_ANNIVERSARY, TestPriority.P1, TestGroupType.REGRESSION],
    },
    async ({ appManagerFixture }) => {
      tagTest(test.info(), {
        zephyrTestId: 'RC-5070',
      });
      const { page: appManagerPage } = appManagerFixture;
      const editAutomatedAwardPage = new EditAutomatedAwardPage(appManagerPage);
      const automatedAwardPage = new AutomatedAwardPage(appManagerPage);
      const manageRecognitionPage = new ManageRecognitionPage(appManagerPage);

      await editAutomatedAwardPage.customizeMessageForAwardInstance(automatedAwardPage, manageRecognitionPage);
    }
  );
});

test.describe('Edit work anniversary award verification by Admin User', () => {
  test.beforeEach(async ({ appManagerFixture }) => {
    const { page: appManagerPage } = appManagerFixture;
    const manageRecognitionPage = new ManageRecognitionPage(appManagerPage);
    await manageRecognitionPage.navigateViaUrl(milestoneEndpointUrls.milestoneEndpointUrl);
    await manageRecognitionPage.header.waitFor({ state: 'visible' });
  });

  test(
    '[RC-4369] Validate default settings of work anniversary award',
    {
      tag: [REWARD_FEATURE_TAGS.REWARDS_WORK_ANNIVERSARY, TestPriority.P0, TestGroupType.SANITY],
    },
    async ({ appManagerFixture }) => {
      tagTest(test.info(), {
        zephyrTestId: 'RC-4369',
      });
      const { page: appManagerPage } = appManagerFixture;
      const manageRecognitionPage = new ManageRecognitionPage(appManagerPage);
      const editAutomatedAwardPage = new EditAutomatedAwardPage(appManagerPage);
      const automatedAwardPage = new AutomatedAwardPage(appManagerPage);

      await editAutomatedAwardPage.inactivateAwardIfActive(automatedAwardPage, manageRecognitionPage);
      await manageRecognitionPage.navigateViaUrl(milestoneEndpointUrls.milestoneEndpointUrl);
      const threeDotsButton = manageRecognitionPage.automatedAwards.getThreeDotsButton(0);
      await expect(threeDotsButton).toBeVisible({ timeout: TIMEOUTS.MEDIUM });
      await threeDotsButton.click();
      await manageRecognitionPage.automatedAwards.editMenuItem.click();
      await automatedAwardPage.editMilestoneTitle.waitFor({ state: 'visible' });

      await editAutomatedAwardPage.validateDefaultUIElements(automatedAwardMsgs);
    }
  );

  test(
    '[RC-4580] Verify that any instance of the work anniversary award can be previewed via eye icon',
    {
      tag: [REWARD_FEATURE_TAGS.REWARDS_WORK_ANNIVERSARY, TestPriority.P0, TestGroupType.SANITY],
    },
    async ({ appManagerFixture }) => {
      tagTest(test.info(), {
        zephyrTestId: 'RC-4580',
      });
      const { page: appManagerPage } = appManagerFixture;
      const manageRecognitionPage = new ManageRecognitionPage(appManagerPage);
      const editAutomatedAwardPage = new EditAutomatedAwardPage(appManagerPage);
      const automatedAwardPage = new AutomatedAwardPage(appManagerPage);

      await manageRecognitionPage.navigateViaUrl(milestoneEndpointUrls.milestoneEndpointUrl);
      const threeDotsButton = manageRecognitionPage.automatedAwards.getThreeDotsButton(0);
      await expect(threeDotsButton).toBeVisible({ timeout: TIMEOUTS.MEDIUM });
      await threeDotsButton.click();
      await manageRecognitionPage.automatedAwards.editMenuItem.click();
      await automatedAwardPage.editMilestoneTitle.waitFor({ state: 'visible' });

      await editAutomatedAwardPage.verifyPreviewAwardInstanceViaEyeIcon(
        automatedAwardPage,
        manageRecognitionPage,
        automatedAwardMsgs
      );
    }
  );
});
