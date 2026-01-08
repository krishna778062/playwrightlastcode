import { expect } from '@playwright/test';
import { RecognitionFeatureTags, RecognitionSuitTags } from '@recognition/constants/testTags';
import { recognitionTestFixture as test } from '@recognition/fixtures/recognitionFixture';
import { RecurringAwardPage } from '@recognition/ui/pages/manage/recurringAwardPage';

import { PAGE_ENDPOINTS } from '@core/constants/pageEndpoints';
import { TestPriority } from '@core/constants/testPriority';
import { TestGroupType } from '@core/constants/testType';
import { tagTest } from '@core/utils/testDecorator';

test.describe('timezone field validation', () => {
  test(
    '[RC-5843] Verify Timezone field while creating Nomination award',
    {
      tag: [
        RecognitionSuitTags.REGRESSION_TEST,
        RecognitionFeatureTags.CUSTOM_RECURRING_AWARD,
        TestPriority.P0,
        TestGroupType.SANITY,
      ],
    },
    async ({ appManagerFixture }) => {
      tagTest(test.info(), {
        zephyrTestId: 'RC-5843',
        storyId: 'RC-873',
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

      await recurringAwardPage.selectSingleDelegate();
      await recurringAwardPage.fillRecurringAwardFormPageTwoWithoutTimezone(
        whoCanWin,
        awardType,
        whoCanNominate,
        awardFrequency
      );

      await recurringAwardPage.awardCreationForm.nextButton.click();
      await recurringAwardPage.verifyCreateButtonNotVisible();
      await recurringAwardPage.selectAwardTimeZone(awardTimeZone);
      await recurringAwardPage.clearTimezoneField();
      await recurringAwardPage.awardCreationForm.nextButton.click();
      await recurringAwardPage.verifyTimezoneErrorMessage();

      await recurringAwardPage.verifyNominationTimezoneGuidanceText();
      await recurringAwardPage.selectAwardTimeZone(awardTimeZone);
      await recurringAwardPage.awardCreationForm.nextButton.click();
      await recurringAwardPage.verifyCreateButtonVisible();

      await recurringAwardPage.clickCreateButton();
      await recurringAwardPage.selectActiveTab();
      await recurringAwardPage.verifyAwardNameInTable(awardName);
      await recurringAwardPage.deleteRecurringAward(awardName);
    }
  );

  test(
    '[RC-5840] Verify Timezone field while creating direct award',
    {
      tag: [
        RecognitionSuitTags.REGRESSION_TEST,
        RecognitionFeatureTags.CUSTOM_RECURRING_AWARD,
        TestPriority.P1,
        TestGroupType.REGRESSION,
      ],
    },
    async ({ appManagerFixture }) => {
      tagTest(test.info(), {
        zephyrTestId: 'RC-5840',
        storyId: 'RC-873',
      });
      const { page: appManagerPage } = appManagerFixture;
      const recurringAwardPage = new RecurringAwardPage(appManagerPage);
      const whoCanWin = 'All employees';
      const awardType = 'Direct';
      const whoCanNominate = 'All employees';
      const awardFrequency = 'monthly';
      const awardTimeZone = 'Asia/Calcutta (+05:30)';

      await recurringAwardPage.navigateRecurringAwardPageViaEndpoint(PAGE_ENDPOINTS.MANAGE_RECURRING_RECOGNITION);
      await recurringAwardPage.clickRecurringAwardNewButton();
      const awardName = await recurringAwardPage.fillRecurringAwardFormPageOne();

      await recurringAwardPage.selectSingleDelegate();
      await recurringAwardPage.fillRecurringAwardFormPageTwoWithoutTimezone(
        whoCanWin,
        awardType,
        whoCanNominate,
        awardFrequency
      );

      await recurringAwardPage.awardCreationForm.nextButton.click();
      await recurringAwardPage.verifyCreateButtonNotVisible();
      await recurringAwardPage.selectAwardTimeZone(awardTimeZone);
      await recurringAwardPage.clearTimezoneField();
      await recurringAwardPage.awardCreationForm.nextButton.click();
      await recurringAwardPage.verifyTimezoneErrorMessage();

      await recurringAwardPage.verifyDirectAwardTimezoneGuidanceText();
      await recurringAwardPage.selectAwardTimeZone(awardTimeZone);
      await recurringAwardPage.awardCreationForm.nextButton.click();
      await recurringAwardPage.verifyCreateButtonVisible();

      await recurringAwardPage.clickCreateButton();
      await recurringAwardPage.selectActiveTab();
      await recurringAwardPage.verifyAwardNameInTable(awardName);
      await recurringAwardPage.deleteRecurringAward(awardName);
    }
  );

  test(
    '[RC-5841] Verify Timezone field while editing direct awards',
    {
      tag: [
        RecognitionSuitTags.REGRESSION_TEST,
        RecognitionFeatureTags.CUSTOM_RECURRING_AWARD,
        TestPriority.P1,
        TestGroupType.REGRESSION,
      ],
    },
    async ({ appManagerFixture }) => {
      tagTest(test.info(), {
        zephyrTestId: 'RC-5841',
        storyId: 'RC-873',
      });
      const { page: appManagerPage } = appManagerFixture;
      const recurringAwardPage = new RecurringAwardPage(appManagerPage);
      const whoCanWin = 'All employees';
      const awardType = 'Direct';
      const whoCanNominate = 'All employees';
      const awardFrequency = 'quarterly';
      const awardTimeZone = 'Asia/Calcutta (+05:30)';

      await recurringAwardPage.navigateRecurringAwardPageViaEndpoint(PAGE_ENDPOINTS.MANAGE_RECURRING_RECOGNITION);
      await recurringAwardPage.clickRecurringAwardNewButton();
      const awardName = await recurringAwardPage.fillRecurringAwardFormPageOne();

      await recurringAwardPage.selectSingleDelegate();
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

      await recurringAwardPage.clickEditAward(awardName);
      await recurringAwardPage.awardCreationForm.nextButton.click();
      await recurringAwardPage.clickEditAwardFrequencyAndSchedule();
      await recurringAwardPage.awardCreationForm.nextButton.click();
      await expect(recurringAwardPage.awardTimeZoneSelectInput).toBeVisible();

      await recurringAwardPage.clearTimezoneField();
      await recurringAwardPage.awardCreationForm.nextButton.click();
      await recurringAwardPage.verifyTimezoneErrorMessage();

      await recurringAwardPage.selectAwardTimeZone(awardTimeZone);
      await recurringAwardPage.awardCreationForm.nextButton.click();
      await recurringAwardPage.clickSaveChangesButton();

      await recurringAwardPage.selectActiveTab();
      await recurringAwardPage.verifyAwardNameInTable(awardName);
      await recurringAwardPage.deleteRecurringAward(awardName);
    }
  );

  test(
    '[RC-5842] Verify Timezone field while editing Nomination awards',
    {
      tag: [
        RecognitionSuitTags.REGRESSION_TEST,
        RecognitionFeatureTags.CUSTOM_RECURRING_AWARD,
        TestPriority.P1,
        TestGroupType.REGRESSION,
      ],
    },
    async ({ appManagerFixture }) => {
      tagTest(test.info(), {
        zephyrTestId: 'RC-5842',
        storyId: 'RC-873',
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

      await recurringAwardPage.selectSingleDelegate();
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

      await recurringAwardPage.clickEditAward(awardName);
      await recurringAwardPage.awardCreationForm.nextButton.click();
      await recurringAwardPage.clickEditAwardFrequencyAndSchedule();
      await recurringAwardPage.awardCreationForm.nextButton.click();
      await expect(recurringAwardPage.awardTimeZoneSelectInput).toBeVisible();

      await recurringAwardPage.clearTimezoneField();
      await recurringAwardPage.awardCreationForm.nextButton.click();
      await recurringAwardPage.verifyTimezoneErrorMessage();

      await recurringAwardPage.selectAwardTimeZone(awardTimeZone);
      await recurringAwardPage.awardCreationForm.nextButton.click();
      await recurringAwardPage.clickSaveChangesButton();

      await recurringAwardPage.selectActiveTab();
      await recurringAwardPage.verifyAwardNameInTable(awardName);
      await recurringAwardPage.deleteRecurringAward(awardName);
    }
  );
});
