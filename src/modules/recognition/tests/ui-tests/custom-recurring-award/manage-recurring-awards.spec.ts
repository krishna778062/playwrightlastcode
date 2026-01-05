import { RecognitionSuitTags, RecurringAwardsFeatureTags } from '@recognition/constants/testTags';
import { recognitionTestFixture as test } from '@recognition/fixtures/recognitionFixture';

import { TestPriority } from '@core/constants/testPriority';
import { TestGroupType } from '@core/constants/testType';
import { tagTest } from '@core/utils/testDecorator';

import { PAGE_ENDPOINTS } from '@/src/core/constants/pageEndpoints';
import { RecurringAwardPage } from '@/src/modules/recognition/ui/pages/manage/recurringAwardPage';

test.describe('manage recurring awards', () => {
  test(
    'validate the Manage Recurring Awards page UI',
    {
      tag: [
        RecognitionSuitTags.REGRESSION_TEST,
        RecurringAwardsFeatureTags.RECURRING_AWARD,
        TestPriority.P0,
        TestGroupType.REGRESSION,
        TestGroupType.SANITY,
        TestGroupType.SMOKE,
      ],
    },
    async ({ appManagerFixture }) => {
      tagTest(test.info(), {
        zephyrTestId: 'RC-6092',
        storyId: 'RC-3426',
      });
      const { page: appManagerPage } = appManagerFixture;
      const recurringAwardPage = new RecurringAwardPage(appManagerPage);
      await recurringAwardPage.navigateRecurringAwardPageViaEndpoint(PAGE_ENDPOINTS.MANAGE_RECURRING_RECOGNITION);
      await recurringAwardPage.validateTheFilters();
      await recurringAwardPage.validateNewRecurringAwardCreationButton();
      await recurringAwardPage.validateTheRecurringAwardTable();
    }
  );

  test(
    'validate the No Recurring Award UI state on Manage Recurring Awards page',
    {
      tag: [
        RecognitionSuitTags.REGRESSION_TEST,
        RecurringAwardsFeatureTags.RECURRING_AWARD,
        TestPriority.P0,
        TestGroupType.REGRESSION,
        TestGroupType.SANITY,
        TestGroupType.SMOKE,
      ],
    },
    async ({ appManagerFixture }) => {
      tagTest(test.info(), {
        zephyrTestId: 'RC-6092',
        storyId: 'RC-3426',
      });
      const { page: appManagerPage } = appManagerFixture;
      const recurringAwardPage = new RecurringAwardPage(appManagerPage);
      await recurringAwardPage.navigateRecurringAwardPageViaEndpoint(PAGE_ENDPOINTS.MANAGE_RECURRING_RECOGNITION);
      await recurringAwardPage.mockTheRecurringAwardListApidCall();
      await recurringAwardPage.validateNoRecurringAwardsMessage();
      await recurringAwardPage.unrouteTheRecurringAwardListApidCall();
      await recurringAwardPage.validateTheRecurringAwardTable();
    }
  );
});
