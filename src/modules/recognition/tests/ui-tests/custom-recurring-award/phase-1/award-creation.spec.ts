import { RecognitionFeatureTags, RecognitionSuitTags } from '@recognition/constants/testTags';
import { recognitionTestFixture as test } from '@recognition/fixtures/recognitionFixture';

import { TestPriority } from '@core/constants/testPriority';
import { TestGroupType } from '@core/constants/testType';
import { tagTest } from '@core/utils/testDecorator';

import { PAGE_ENDPOINTS } from '@/src/core/constants/pageEndpoints';
import { getRecognitionTenantConfigFromCache } from '@/src/modules/recognition/config/recognitionConfig';
import { MESSAGES } from '@/src/modules/recognition/constants/messages';
import { ManageRecognitionPage } from '@/src/modules/recognition/ui/pages/manage/manageRecognitionPage';
import { RecurringAwardPage } from '@/src/modules/recognition/ui/pages/manage/recurringAwardPage';

test.describe('custom recurring award creation', () => {
  test(
    'verify if user is able to create recurring award with no overdue setting',
    {
      tag: [
        RecognitionSuitTags.REGRESSION_TEST,
        RecognitionFeatureTags.CUSTOM_RECURRING_AWARD,
        RecognitionFeatureTags.CUSTOM_NOMINATION,
        TestPriority.P0,
        TestGroupType.SANITY,
        TestGroupType.HEALTHCHECK,
      ],
    },
    async ({ appManagerFixture }) => {
      tagTest(test.info(), {
        zephyrTestId: 'RC-6341',
        storyId: 'RC-3426',
      });
      const { page: appManagerPage } = appManagerFixture;
      const recurringAwardPage = new RecurringAwardPage(appManagerPage);
      const manageRecognitionPage = new ManageRecognitionPage(appManagerPage);
      const appManagerName = getRecognitionTenantConfigFromCache().appManagerName;
      await recurringAwardPage.navigateRecurringAwardPageViaEndpoint(PAGE_ENDPOINTS.MANAGE_RECURRING_RECOGNITION);
      await recurringAwardPage.clickRecurringAwardNewButton();
      await recurringAwardPage.fillRecurringAwardFormPageOne();
      await recurringAwardPage.fillRecurringAwardFormPageTwo(
        appManagerName,
        'Nominations',
        'Monthly',
        'America/Los_Angeles'
      );
      await recurringAwardPage.confirmAndCreateRecurringAward();
      await recurringAwardPage.submitRecurringAward();
      await manageRecognitionPage.assertToastMessageIsVisible(MESSAGES.NEW_AWARD_CREATED);
      await manageRecognitionPage.cleanupCreatedAward();
    }
  );
});
