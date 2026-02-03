import { RecognitionFeatureTags, RecognitionSuitTags } from '@recognition/constants/testTags';
import { recognitionTestFixture as test } from '@recognition/fixtures/recognitionFixture';
import { RecurringAwardPage } from '@recognition/ui/pages/manage/recurringAwardPage';

import { PAGE_ENDPOINTS } from '@core/constants/pageEndpoints';
import { TestPriority } from '@core/constants/testPriority';
import { TestGroupType } from '@core/constants/testType';
import { tagTest } from '@core/utils/testDecorator';

test.describe('create & edit multi delegate award', () => {
  test(
    '[RC-5632 RC-5631 RC-5598 RC-5587] Validate multiple delegates can be selected while creating a recurring award',
    {
      tag: [
        RecognitionSuitTags.REGRESSION_TEST,
        RecognitionFeatureTags.CUSTOM_RECURRING_AWARD,
        TestPriority.P1,
        TestGroupType.SANITY,
        TestGroupType.SMOKE,
        TestGroupType.REGRESSION,
      ],
    },
    async ({ appManagerFixture }) => {
      tagTest(test.info(), {
        zephyrTestId: 'RC-5632,RC-5631,RC-5598,RC-5587',
        storyId: 'RC-1493',
      });
      const { page: appManagerPage } = appManagerFixture;
      const recurringAwardPage = new RecurringAwardPage(appManagerPage);
      const whoCanWin = 'All employees';
      const awardType = 'Nomination';
      const whoCanNominate = 'All employees';
      const awardFrequency = 'monthly';
      const awardTimeZone = 'Asia/Calcutta (+05:30)';

      await recurringAwardPage.navigateRecurringAwardPageViaEndpoint(PAGE_ENDPOINTS.MANAGE_RECURRING_RECOGNITION);
      await recurringAwardPage.clickRecurringAwardNewButton();
      const awardName = await recurringAwardPage.fillRecurringAwardFormPageOne();

      await recurringAwardPage.selectMultipleDelegates(3);
      await recurringAwardPage.deselectAllDelegates();
      const pickedDelegateArrayAfterReselect = await recurringAwardPage.selectMultipleDelegates(3);

      await recurringAwardPage.fillRecurringAwardConfigureForm(
        whoCanWin,
        awardType,
        whoCanNominate,
        awardFrequency,
        awardTimeZone
      );

      await recurringAwardPage.clickCreateButton();
      await recurringAwardPage.selectActiveTab();
      await recurringAwardPage.verifyAwardNameInTable(awardName);
      await recurringAwardPage.verifyMultipleDelegatesInTable(awardName, pickedDelegateArrayAfterReselect);
      await recurringAwardPage.deleteRecurringAward(awardName);
    }
  );

  test(
    '[RC-5597] Verify recognition manager can update and modify multiple delegates for an existing recurring award',
    {
      tag: [
        RecognitionSuitTags.REGRESSION_TEST,
        RecognitionFeatureTags.CUSTOM_RECURRING_AWARD,
        TestPriority.P2,
        TestGroupType.REGRESSION,
      ],
    },
    async ({ appManagerFixture }) => {
      tagTest(test.info(), {
        zephyrTestId: 'RC-5597',
        storyId: 'RC-1493',
      });
      const { page: appManagerPage } = appManagerFixture;
      const recurringAwardPage = new RecurringAwardPage(appManagerPage);
      const whoCanWin = 'All employees';
      const awardType = 'Nomination';
      const whoCanNominate = 'All employees';
      const awardFrequency = 'quarterly';
      const awardTimeZone = 'Asia/Calcutta (+05:30)';

      await recurringAwardPage.navigateRecurringAwardPageViaEndpoint(PAGE_ENDPOINTS.MANAGE_RECURRING_RECOGNITION);
      await recurringAwardPage.clickRecurringAwardNewButton();
      const awardName = await recurringAwardPage.fillRecurringAwardFormPageOne();

      await recurringAwardPage.selectMultipleDelegates(1);

      await recurringAwardPage.fillRecurringAwardConfigureForm(
        whoCanWin,
        awardType,
        whoCanNominate,
        awardFrequency,
        awardTimeZone
      );

      await recurringAwardPage.clickCreateButton();
      await recurringAwardPage.selectActiveTab();
      await recurringAwardPage.verifyAwardNameInTable(awardName);
      await recurringAwardPage.verifySingleDelegateInTable(awardName);

      await recurringAwardPage.clickEditAward(awardName);
      const pickedDelegateArray = await recurringAwardPage.selectMultipleDelegates(4);
      await recurringAwardPage.awardCreationForm.nextButton.click();

      await recurringAwardPage.clickSaveChangesButton();
      await recurringAwardPage.selectActiveTab();
      await recurringAwardPage.verifyAwardNameInTable(awardName);
      await recurringAwardPage.verifyMultipleDelegatesInTable(awardName, pickedDelegateArray);
      await recurringAwardPage.deleteRecurringAward(awardName);
    }
  );
});
