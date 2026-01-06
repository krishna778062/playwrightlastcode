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

test.describe('Edit details from Award Frequency section', { tag: [REWARD_SUITE_TAGS.MANAGE_WORK_ANNIVERSARY] }, () => {
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
    '[RC-4458] Verify that Work anniversary award frequency can be changed from default to specific anniversaries',
    {
      tag: [REWARD_FEATURE_TAGS.REWARDS_WORK_ANNIVERSARY, TestPriority.P0, TestGroupType.SANITY],
    },
    async ({ appManagerFixture }) => {
      tagTest(test.info(), {
        zephyrTestId: 'RC-4458',
      });
      const { page: appManagerPage } = appManagerFixture;
      const editAutomatedAwardPage = new EditAutomatedAwardPage(appManagerPage);
      const automatedAwardPage = new AutomatedAwardPage(appManagerPage);
      const manageRecognitionPage = new ManageRecognitionPage(appManagerPage);

      const specificAnniversariesRadioBtn =
        await editAutomatedAwardPage.selectSpecificAnniversariesRadioButton(automatedAwardPage);

      const randomPickedAnniversaries = editAutomatedAwardPage.pickUniqueRandomNumbers(4, 60);
      await editAutomatedAwardPage.fillSpecificAnniversariesAndVerifyInstances(
        automatedAwardPage,
        randomPickedAnniversaries
      );

      await editAutomatedAwardPage.saveSpecificAnniversariesAndVerify(
        automatedAwardPage,
        manageRecognitionPage,
        specificAnniversariesRadioBtn
      );

      await editAutomatedAwardPage.resetToAllWorkAnniversaries(automatedAwardPage);
    }
  );

  test(
    '[RC-4461 RC-5414] Validate error handling when user tries to create anniversaries beyond 60 years, add duplicate entry and special characters, spaces',
    {
      tag: [REWARD_FEATURE_TAGS.REWARDS_WORK_ANNIVERSARY, TestPriority.P0, TestGroupType.SANITY],
    },
    async ({ appManagerFixture }) => {
      tagTest(test.info(), {
        zephyrTestId: 'RC-4461,RC-5414',
      });
      const { page: appManagerPage } = appManagerFixture;
      const editAutomatedAwardPage = new EditAutomatedAwardPage(appManagerPage);
      const automatedAwardPage = new AutomatedAwardPage(appManagerPage);

      await editAutomatedAwardPage.selectSpecificAnniversariesRadioButton(automatedAwardPage);
      await editAutomatedAwardPage.validateAllSpecificAnniversariesErrors(automatedAwardPage);
      await editAutomatedAwardPage.resetToAllWorkAnniversaries(automatedAwardPage);
    }
  );
});
