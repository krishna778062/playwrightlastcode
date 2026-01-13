import { automatedAwardMsgs } from '@recognition/constants/automated-award-constants';
import { WorkAnniversaryFeatureTags } from '@recognition/constants/testTags';
import { recognitionTestFixture as test } from '@recognition/fixtures/recognitionFixture';
import { AutomatedAwardPage, ManageAutomatedAwardPage } from '@recognition/ui/pages/manage/work-anniversary';

import { TestGroupType, TestPriority } from '@core/constants';
import { PAGE_ENDPOINTS } from '@core/constants/pageEndpoints';
import { tagTest } from '@core/utils';

test.describe('Work Anniversary tab', { tag: [WorkAnniversaryFeatureTags.MANAGE_WORK_ANNIVERSARY] }, () => {
  test.beforeEach(async ({ appManagerFixture }) => {
    const { page: appManagerPage } = appManagerFixture;
    const manageAutomatedAwardPage = new ManageAutomatedAwardPage(appManagerPage);
    await manageAutomatedAwardPage.navigateViaUrl(PAGE_ENDPOINTS.MANAGE_PEER_RECOGNITION);
    await manageAutomatedAwardPage.verifyThePageIsLoaded();
  });

  test(
    '[RC-4357] Verify Automated Awards tab visibility when ff is enabled',
    {
      tag: [WorkAnniversaryFeatureTags.WORK_ANNIVERSARY, TestPriority.P0, TestGroupType.SANITY],
    },
    async ({ appManagerFixture }) => {
      tagTest(test.info(), {
        zephyrTestId: 'RC-4357',
      });
      const { page: appManagerPage } = appManagerFixture;
      const manageAutomatedAwardPage = new ManageAutomatedAwardPage(appManagerPage);

      await manageAutomatedAwardPage.verifyRecognitionPageLoaded();
      await manageAutomatedAwardPage.verifyAutomatedAwardsTabVisible();
    }
  );

  test(
    '[RC-4725] Validate if User is able to deactivate automated award',
    {
      tag: [WorkAnniversaryFeatureTags.WORK_ANNIVERSARY, TestPriority.P0, TestGroupType.SANITY],
    },
    async ({ appManagerFixture }) => {
      tagTest(test.info(), {
        zephyrTestId: 'RC-4725',
      });
      const { page: appManagerPage } = appManagerFixture;
      const manageAutomatedAwardPage = new ManageAutomatedAwardPage(appManagerPage);
      const automatedAwardPage = new AutomatedAwardPage(appManagerPage);

      await manageAutomatedAwardPage.navigateToAutomatedAwardsPage();
      await automatedAwardPage.verifyAutomatedAwardPageElements();
      await automatedAwardPage.verifyAndDeactivateAward(manageAutomatedAwardPage, automatedAwardMsgs);
    }
  );

  test(
    '[RC-4365] Verify menu items for the Work Anniversary default award',
    {
      tag: [WorkAnniversaryFeatureTags.WORK_ANNIVERSARY, TestPriority.P1, TestGroupType.REGRESSION],
    },
    async ({ appManagerFixture }) => {
      tagTest(test.info(), {
        zephyrTestId: 'RC-4365',
      });
      const { page: appManagerPage } = appManagerFixture;
      const manageAutomatedAwardPage = new ManageAutomatedAwardPage(appManagerPage);
      const automatedAwardPage = new AutomatedAwardPage(appManagerPage);

      await manageAutomatedAwardPage.navigateToAutomatedAwardsPage();
      await automatedAwardPage.verifyMenuItemsForWorkAnniversaryAward(manageAutomatedAwardPage);
    }
  );
});
