import { recognitionTestFixture as test } from '@recognition/fixtures/recognitionFixture';
import {
  automatedAwardMsgs,
  AutomatedAwardPage,
  ManageRecognitionPage,
} from '@recognition/ui/pages/manage/work-anniversary';
import { REWARD_FEATURE_TAGS, REWARD_SUITE_TAGS } from '@rewards/constants/testTags';

import { TestGroupType, TestPriority } from '@core/constants';
import { PAGE_ENDPOINTS } from '@core/constants/pageEndpoints';
import { tagTest } from '@core/utils';

test.describe('Work Anniversary tab', { tag: [REWARD_SUITE_TAGS.MANAGE_WORK_ANNIVERSARY] }, () => {
  test.beforeEach(async ({ appManagerFixture }) => {
    const { page: appManagerPage } = appManagerFixture;
    const manageRecognitionPage = new ManageRecognitionPage(appManagerPage);
    await manageRecognitionPage.navigateViaUrl(PAGE_ENDPOINTS.MANAGE_PEER_RECOGNITION);
    await manageRecognitionPage.verifyThePageIsLoaded();
  });

  test(
    '[RC-4357] Verify Automated Awards tab visibility when ff is enabled',
    {
      tag: [REWARD_FEATURE_TAGS.REWARDS_WORK_ANNIVERSARY, TestPriority.P0, TestGroupType.SANITY],
    },
    async ({ appManagerFixture }) => {
      tagTest(test.info(), {
        zephyrTestId: 'RC-4357',
      });
      const { page: appManagerPage } = appManagerFixture;
      const manageRecognitionPage = new ManageRecognitionPage(appManagerPage);

      await manageRecognitionPage.verifyRecognitionPageLoaded();
      await manageRecognitionPage.verifyAutomatedAwardsTabVisible();
    }
  );

  test(
    '[RC-4725] Validate if User is able to deactivate automated award',
    {
      tag: [REWARD_FEATURE_TAGS.REWARDS_WORK_ANNIVERSARY, TestPriority.P0, TestGroupType.SANITY],
    },
    async ({ appManagerFixture }) => {
      tagTest(test.info(), {
        zephyrTestId: 'RC-4725',
      });
      const { page: appManagerPage } = appManagerFixture;
      const manageRecognitionPage = new ManageRecognitionPage(appManagerPage);
      const automatedAwardPage = new AutomatedAwardPage(appManagerPage);

      await manageRecognitionPage.navigateToAutomatedAwardsPage();
      await automatedAwardPage.verifyAutomatedAwardPageElements();
      await automatedAwardPage.verifyAndDeactivateAward(manageRecognitionPage, automatedAwardMsgs);
    }
  );

  test(
    '[RC-4365] Verify menu items for the Work Anniversary default award',
    {
      tag: [REWARD_FEATURE_TAGS.REWARDS_WORK_ANNIVERSARY, TestPriority.P1, TestGroupType.REGRESSION],
    },
    async ({ appManagerFixture }) => {
      tagTest(test.info(), {
        zephyrTestId: 'RC-4365',
      });
      const { page: appManagerPage } = appManagerFixture;
      const manageRecognitionPage = new ManageRecognitionPage(appManagerPage);
      const automatedAwardPage = new AutomatedAwardPage(appManagerPage);

      await manageRecognitionPage.navigateToAutomatedAwardsPage();
      await automatedAwardPage.verifyMenuItemsForWorkAnniversaryAward(manageRecognitionPage);
    }
  );
});
