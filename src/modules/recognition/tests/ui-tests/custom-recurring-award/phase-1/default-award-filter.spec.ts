import { RecognitionFeatureTags, RecognitionSuitTags } from '@recognition/constants/testTags';
import { recognitionTestFixture as test } from '@recognition/fixtures/recognitionFixture';

import { TestPriority } from '@core/constants/testPriority';
import { TestGroupType } from '@core/constants/testType';
import { tagTest } from '@core/utils/testDecorator';

import { PAGE_ENDPOINTS } from '@/src/core/constants/pageEndpoints';
import { RecurringAwardPage } from '@/src/modules/recognition/ui/pages/manage/recurringAwardPage';

test.describe('default setting for custom recurring award', () => {
  test(
    'verify default options for Quarterly award for participation window and nomination close date',
    {
      tag: [
        RecognitionSuitTags.REGRESSION_TEST,
        RecognitionFeatureTags.CUSTOM_RECURRING_AWARD,
        RecognitionFeatureTags.CUSTOM_NOMINATION,
        TestPriority.P2,
        TestGroupType.SANITY,
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
      await recurringAwardPage.clickRecurringAwardNewButton();
      await recurringAwardPage.fillRecurringAwardFormPageOne();
      await recurringAwardPage.selectAwardFrequency('Quarterly');
      await recurringAwardPage.verifyDefaultScheduleOptionsByFrequency('Quarterly');
    }
  );

  test(
    'verify default options for Monthly award for participation window and nomination close date',
    {
      tag: [
        RecognitionSuitTags.REGRESSION_TEST,
        RecognitionFeatureTags.CUSTOM_RECURRING_AWARD,
        RecognitionFeatureTags.CUSTOM_NOMINATION,
        TestPriority.P2,
        TestGroupType.SANITY,
      ],
    },
    async ({ appManagerFixture }) => {
      tagTest(test.info(), {
        zephyrTestId: 'RC-6091',
        storyId: 'RC-3426',
      });
      const { page: appManagerPage } = appManagerFixture;
      const recurringAwardPage = new RecurringAwardPage(appManagerPage);
      await recurringAwardPage.navigateRecurringAwardPageViaEndpoint(PAGE_ENDPOINTS.MANAGE_RECURRING_RECOGNITION);
      await recurringAwardPage.clickRecurringAwardNewButton();
      await recurringAwardPage.fillRecurringAwardFormPageOne();
      await recurringAwardPage.selectAwardFrequency('Monthly');
      await recurringAwardPage.verifyDefaultScheduleOptionsByFrequency('Monthly');
    }
  );
});
