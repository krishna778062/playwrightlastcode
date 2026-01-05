import { expect } from '@playwright/test';
import { recognitionTestFixture as test } from '@recognition/fixtures/recognitionFixture';
import { REWARD_FEATURE_TAGS, REWARD_SUITE_TAGS } from '@rewards/constants/testTags';
import { ManageRecognitionPage } from '@rewards-pages/manage-recognition';
import { AutomatedAwardPage, EditAutomatedAwardPage, milestoneEndpointUrls } from '@rewards-pages/work-anniversary';

import { PAGE_ENDPOINTS, TestGroupType, TestPriority, TIMEOUTS } from '@core/constants';
import { tagTest } from '@core/utils';

test.describe('Edit details from Award Message section', { tag: [REWARD_SUITE_TAGS.MANAGE_WORK_ANNIVERSARY] }, () => {
  test.beforeEach(async ({ appManagerFixture }) => {
    const { page: appManagerPage } = appManagerFixture;
    const manageRecognitionPage = new ManageRecognitionPage(appManagerPage);
    const automatedAwardPage = new AutomatedAwardPage(appManagerPage);
    await manageRecognitionPage.navigateViaUrl(milestoneEndpointUrls.milestoneEndpointUrl);
    await expect(manageRecognitionPage.page).toHaveURL(PAGE_ENDPOINTS.MANAGE_RECOGNITION_MILESTONES);

    // Check for error page before proceeding
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
    '[RC-4383 RC-4382] Verify if user is able to set <firstName> and <fullName> Placeholder in Edit automated award page',
    {
      tag: [REWARD_FEATURE_TAGS.REWARDS_WORK_ANNIVERSARY, TestPriority.P1, TestGroupType.REGRESSION],
    },
    async ({ appManagerFixture }) => {
      tagTest(test.info(), {
        zephyrTestId: 'RC-4383,RC-4382',
      });
      const { page: appManagerPage } = appManagerFixture;
      const editAutomatedAwardPage = new EditAutomatedAwardPage(appManagerPage);
      const automatedAwardPage = new AutomatedAwardPage(appManagerPage);
      const manageRecognitionPage = new ManageRecognitionPage(appManagerPage);

      const defaultMessage = `Congratulations <fullName> on reaching your <milestone> work anniversary! We're grateful to have you as part of our company!`;

      await editAutomatedAwardPage.selectCustomAwardMessageRadioButton(automatedAwardPage);

      // Test <firstName> placeholder
      const randomSuffix1 = Math.random().toString(36).substring(2, 7);
      const firstNameMessage = `Congratulations <firstName> on reaching your <year> work anniversary! We're grateful to have you as part of our company! updating message via automation ${randomSuffix1}`;
      await editAutomatedAwardPage.updateCustomAwardMessageAndVerify(
        automatedAwardPage,
        manageRecognitionPage,
        firstNameMessage
      );

      // Test <fullName> placeholder
      const randomSuffix2 = Math.random().toString(36).substring(2, 7);
      const fullNameMessage = `Congratulations <fullName> on reaching your <milestone> work anniversary! We're grateful to have you as part of our company!_updating message via automation_${randomSuffix2}`;
      await editAutomatedAwardPage.updateCustomAwardMessageAndVerify(
        automatedAwardPage,
        manageRecognitionPage,
        fullNameMessage
      );

      // Clean up - Reset to default
      await editAutomatedAwardPage.resetCustomAwardMessageToDefault(automatedAwardPage, defaultMessage);
    }
  );

  test(
    '[RC-5068] Verify if user is able to set <years> placeholder in custom message in edit automated award page',
    {
      tag: [REWARD_FEATURE_TAGS.REWARDS_WORK_ANNIVERSARY, TestPriority.P1, TestGroupType.REGRESSION],
    },
    async ({ appManagerFixture }) => {
      tagTest(test.info(), {
        zephyrTestId: 'RC-5068',
      });
      const { page: appManagerPage } = appManagerFixture;
      const editAutomatedAwardPage = new EditAutomatedAwardPage(appManagerPage);
      const automatedAwardPage = new AutomatedAwardPage(appManagerPage);
      const manageRecognitionPage = new ManageRecognitionPage(appManagerPage);

      const randomSuffix = Math.random().toString(36).substring(2, 7);
      const customAwardMsg = `Congratulations <fullName> on reaching your <milestone> work anniversary! We're grateful to have you as part of our company!_${randomSuffix}`;

      await editAutomatedAwardPage.selectCustomAwardMessageRadioButton(automatedAwardPage);
      await editAutomatedAwardPage.updateCustomAwardMessageAndVerify(
        automatedAwardPage,
        manageRecognitionPage,
        customAwardMsg
      );
    }
  );

  test(
    '[RC-5416] Validate character limit in custom message of work anniversary award',
    {
      tag: [REWARD_FEATURE_TAGS.REWARDS_WORK_ANNIVERSARY, TestPriority.P1, TestGroupType.REGRESSION],
    },
    async ({ appManagerFixture }) => {
      tagTest(test.info(), {
        zephyrTestId: 'RC-5416',
      });
      const { page: appManagerPage } = appManagerFixture;
      const editAutomatedAwardPage = new EditAutomatedAwardPage(appManagerPage);
      const automatedAwardPage = new AutomatedAwardPage(appManagerPage);

      const defaultMessage = `Congratulations <fullName> on reaching your <milestone> work anniversary! We're grateful to have you as part of our company!`;

      await editAutomatedAwardPage.selectCustomAwardMessageRadioButton(automatedAwardPage);
      await editAutomatedAwardPage.validateCharacterLimitInCustomAwardMessage(automatedAwardPage, defaultMessage);
    }
  );
});
