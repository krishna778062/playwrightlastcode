import { TestPriority } from '@/src/core/constants/testPriority';
import { TestGroupType } from '@/src/core/constants/testType';
import { tagTest } from '@/src/core/utils/testDecorator';
import {
  EmployeeListeningFeatureTags,
  EmployeeListeningSuiteTags,
} from '@/src/modules/employee-listening/constants/testTags';
import { test } from '@/src/modules/employee-listening/fixtures/loginFixture';
import { PulseSurveyPage } from '@/src/modules/employee-listening/pages/surveys/pulseSurveyPage';
import { SurveyCreationPage } from '@/src/modules/employee-listening/pages/surveys/surveyCreation';
import { setupSurveyTestContext } from '@/src/modules/employee-listening/utils/surveys';

test.describe('daily Pulse Survey Creation Tests', () => {
  let surveyCreationPage: SurveyCreationPage;
  let pulseSurveyPage: PulseSurveyPage;

  test.beforeEach(async ({ appManagersPage }) => {
    const { surveyCreationPage: scp } = await setupSurveyTestContext(appManagersPage);
    surveyCreationPage = scp;
    pulseSurveyPage = new PulseSurveyPage(appManagersPage);
    await surveyCreationPage.navigateToSurveysViaMenu();
  });

  test(
    'daily execution - create pulse survey with custom end date frequency type of Every three months',
    {
      tag: [
        TestPriority.P0,
        TestGroupType.SMOKE,
        EmployeeListeningSuiteTags.SURVEYS,
        EmployeeListeningFeatureTags.SURVEYS_CREATE,
        '@pulse-survey',
      ],
    },
    async () => {
      tagTest(test.info(), {
        description:
          'Daily execution test to create a pulse survey with custom end date frequency type of Every three months using question bank search and selection',
        zephyrTestId: 'LS-DAILY-PULSE-001',
        storyId: 'EL-Daily Pulse Survey Creation',
      });

      const timestamp = new Date().toISOString().slice(0, 10); // YYYY-MM-DD format
      await surveyCreationPage.clickCreateSurveyButton();
      await pulseSurveyPage.clickPulseSurvey();
      await surveyCreationPage.clickCreateButton();
      await surveyCreationPage.enterSurveyName(`Daily Pulse ${timestamp}`);
      await surveyCreationPage.selectDefaultIntroAndThanks();
      await surveyCreationPage.selectAudiences(['All Employees']);
      await surveyCreationPage.selectDefaultFormAddress();
      await pulseSurveyPage.selectFrequency('Every three months');
      await pulseSurveyPage.clickOnTheRadioButton();
      await pulseSurveyPage.selectCustomParticipationWindow('10');
      await pulseSurveyPage.selectSendDate({
        frequencyRadioName: 'Every three months A great',
        recurrenceDate: '25',
        participationWindow: '12',
        sendDateMenuName: '6',
        endDateRadioName: 'Choose end date',
        endDateButtonName: 'Select date…',
      });
      await surveyCreationPage.clickConfigureSurveyNextButton();
      await surveyCreationPage.addScaleQuestionFromBankWithSearch();
      await surveyCreationPage.clickAddQuestionNextButton();
      await surveyCreationPage.captureSurveyIdAfterSchedule();
      await surveyCreationPage.verifySurveyScheduledMessage();
    }
  );
});
