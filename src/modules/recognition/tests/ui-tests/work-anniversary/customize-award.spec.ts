import { expect } from '@playwright/test';
import { recognitionTestFixture as test } from '@recognition/fixtures/recognitionFixture';
import {
  AutomatedAwardPage,
  EditAutomatedAwardPage,
  ManageRecognitionPage,
  milestoneEndpointUrls,
} from '@recognition/ui/pages/manage/work-anniversary';
import { REWARD_FEATURE_TAGS, REWARD_SUITE_TAGS } from '@rewards/constants/testTags';

import { PAGE_ENDPOINTS, TestGroupType, TestPriority, TIMEOUTS } from '@core/constants';
import { tagTest } from '@core/utils';

test.describe('Customize work anniversary award', { tag: [REWARD_SUITE_TAGS.MANAGE_WORK_ANNIVERSARY] }, () => {
  test.beforeEach(async ({ appManagerFixture }) => {
    const { page: appManagerPage } = appManagerFixture;
    const manageRecognitionPage = new ManageRecognitionPage(appManagerPage);
    const automatedAwardPage = new AutomatedAwardPage(appManagerPage);
    await manageRecognitionPage.navigateViaUrl(milestoneEndpointUrls.milestoneEndpointUrl);
    await expect(manageRecognitionPage.page).toHaveURL(PAGE_ENDPOINTS.MANAGE_RECOGNITION_MILESTONES);
    // Check for error page first
    const errorMessage = appManagerPage.getByText('Something went wrong', { exact: false });
    const isErrorVisible = await errorMessage.isVisible().catch(() => false);
    if (isErrorVisible) {
      throw new Error('Page loaded with error: "Something went wrong - please try again later"');
    }
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
    '[RC-5077] Validate if user is able set recognition author as "no author" for work anniversary award instance',
    {
      tag: [REWARD_FEATURE_TAGS.REWARDS_WORK_ANNIVERSARY, TestPriority.P0, TestGroupType.SANITY],
    },
    async ({ appManagerFixture }) => {
      tagTest(test.info(), {
        zephyrTestId: 'RC-5077',
      });
      const { page: appManagerPage } = appManagerFixture;
      const editAutomatedAwardPage = new EditAutomatedAwardPage(appManagerPage);
      const automatedAwardPage = new AutomatedAwardPage(appManagerPage);
      const manageRecognitionPage = new ManageRecognitionPage(appManagerPage);

      await editAutomatedAwardPage.setAuthorAsNoAuthorForAwardInstance(automatedAwardPage, manageRecognitionPage, 2);
    }
  );

  test(
    '[RC-5076] Validate if user is able to set recognition author as "custom" for work anniversary award instance',
    {
      tag: [REWARD_FEATURE_TAGS.REWARDS_WORK_ANNIVERSARY, TestPriority.P0, TestGroupType.SANITY],
    },
    async ({ appManagerFixture }) => {
      tagTest(test.info(), {
        zephyrTestId: 'RC-5076',
      });
      const { page: appManagerPage } = appManagerFixture;
      const editAutomatedAwardPage = new EditAutomatedAwardPage(appManagerPage);
      const automatedAwardPage = new AutomatedAwardPage(appManagerPage);
      const manageRecognitionPage = new ManageRecognitionPage(appManagerPage);

      await editAutomatedAwardPage.setAuthorAsCustomForAwardInstance(automatedAwardPage, manageRecognitionPage, 2);
    }
  );

  test(
    '[RC-5074] Validate if user is able to set recognition author as "selected user" for work anniversary award instance',
    {
      tag: [REWARD_FEATURE_TAGS.REWARDS_WORK_ANNIVERSARY, TestPriority.P0, TestGroupType.SANITY],
    },
    async ({ appManagerFixture }) => {
      tagTest(test.info(), {
        zephyrTestId: 'RC-5074',
      });
      const { page: appManagerPage } = appManagerFixture;
      const editAutomatedAwardPage = new EditAutomatedAwardPage(appManagerPage);
      const automatedAwardPage = new AutomatedAwardPage(appManagerPage);
      const manageRecognitionPage = new ManageRecognitionPage(appManagerPage);

      await editAutomatedAwardPage.setAuthorAsSelectedUserForAwardInstance(
        automatedAwardPage,
        manageRecognitionPage,
        4
      );
    }
  );

  test(
    '[RC-4582] Verify that author of the work anniversary award instance can be edited and selected as "Intranet name"',
    {
      tag: [REWARD_FEATURE_TAGS.REWARDS_WORK_ANNIVERSARY, TestPriority.P0, TestGroupType.SANITY],
    },
    async ({ appManagerFixture }) => {
      tagTest(test.info(), {
        zephyrTestId: 'RC-4582',
      });
      const { page: appManagerPage } = appManagerFixture;
      const editAutomatedAwardPage = new EditAutomatedAwardPage(appManagerPage);
      const automatedAwardPage = new AutomatedAwardPage(appManagerPage);
      const manageRecognitionPage = new ManageRecognitionPage(appManagerPage);

      await editAutomatedAwardPage.setAuthorAsIntranetNameForAwardInstance(
        automatedAwardPage,
        manageRecognitionPage,
        1
      );
    }
  );

  test(
    '[RC-5417] Validate character limit in custom message of work anniversary award instance',
    {
      tag: [REWARD_FEATURE_TAGS.REWARDS_WORK_ANNIVERSARY, TestPriority.P1, TestGroupType.REGRESSION],
    },
    async ({ appManagerFixture }) => {
      tagTest(test.info(), {
        zephyrTestId: 'RC-5417',
      });
      const { page: appManagerPage } = appManagerFixture;
      const editAutomatedAwardPage = new EditAutomatedAwardPage(appManagerPage);
      const automatedAwardPage = new AutomatedAwardPage(appManagerPage);
      const manageRecognitionPage = new ManageRecognitionPage(appManagerPage);

      await editAutomatedAwardPage.validateCharacterLimitInCustomMessage(automatedAwardPage, manageRecognitionPage, 0);
    }
  );
});
