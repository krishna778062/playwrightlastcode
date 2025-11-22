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

test.describe('pulse Survey Creation Tests', () => {
  let surveyCreationPage: SurveyCreationPage;
  let pulseSurveyPage: PulseSurveyPage;

  test.beforeEach(async ({ appManagersPage }) => {
    surveyCreationPage = new SurveyCreationPage(appManagersPage);
    pulseSurveyPage = new PulseSurveyPage(appManagersPage);
    await surveyCreationPage.navigateToSurveysViaMenu();
  });

  test(
    'verify that the app manager can create a pulse survey with custom end date frequency type of Every three months and the recipient type set to All org',
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
          'Verify that the app manager can create a pulse survey with custom end date frequency type of Every three months and the recipient type set to All org',
        zephyrTestId: 'LS-PULSE-001',
        storyId: 'EL-Pulse Survey Creation',
      });
      await surveyCreationPage.clickCreateSurveyButton();
      await pulseSurveyPage.clickPulseSurvey();
      await surveyCreationPage.clickCreateButton();
      await surveyCreationPage.enterSurveyName('Pulse');
      await surveyCreationPage.selectDefaultIntroMessage();
      await surveyCreationPage.selectDefaultThanksMessage();
      await surveyCreationPage.selectAudiences(['All Employees']);
      await surveyCreationPage.selectDefaultFormAddress();
      await pulseSurveyPage.selectFrequency('Every three months');
      await pulseSurveyPage.clickOnTheRadioButton();
      await pulseSurveyPage.selectCurrentRecurrenceDate();
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
      // Add a short wait after clicking Next to allow page transition
      await surveyCreationPage.page.waitForTimeout(2000);
      await pulseSurveyPage.addScaleQuestionFromDataWithoutType(surveyCreationPage, 0, 'Sentiment');
      await surveyCreationPage.clickAddQuestionNextButton();
      await surveyCreationPage.clickScheduleSurveyButton();
      await surveyCreationPage.verifySurveyScheduledMessage();
    }
  );

  test(
    'verify that the app manager can create a pulse survey with frequency type of Monthly and the recipient type set to Audience',
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
          'Verify that the app manager can create a pulse survey with frequency type of Monthly and the recipient type set to Audience',
        zephyrTestId: 'LS-PULSE-002',
        storyId: 'EL-Pulse Survey Creation',
      });
      await surveyCreationPage.clickCreateSurveyButton();
      await pulseSurveyPage.clickPulseSurvey();
      await surveyCreationPage.clickCreateButton();
      await surveyCreationPage.enterSurveyName('Pulse');
      await surveyCreationPage.selectDefaultIntroMessage();
      await surveyCreationPage.selectDefaultThanksMessage();
      await surveyCreationPage.selectAudiences(['India']);
      await surveyCreationPage.selectDefaultFormAddress();
      await pulseSurveyPage.selectFrequency('Monthly');
      await pulseSurveyPage.selectCurrentRecurrenceDate();
      await pulseSurveyPage.selectCustomParticipationWindow('3');
      await pulseSurveyPage.selectSendDate({
        frequencyRadioName: 'Monthly',
        recurrenceDate: '15',
        participationWindow: '3',
        sendDateMenuName: '2,',
        endDateRadioName: 'Choose end date',
        endDateButtonName: 'Select date…',
      });
      await surveyCreationPage.clickConfigureSurveyNextButton();
      // Add a short wait after clicking Next to allow page transition
      await surveyCreationPage.page.waitForTimeout(2000);
      await pulseSurveyPage.addScaleQuestionFromDataWithoutType(surveyCreationPage, 0, 'Sentiment');
      await surveyCreationPage.clickAddQuestionNextButton();
      await surveyCreationPage.clickScheduleSurveyButton();
      await surveyCreationPage.verifySurveyScheduledMessage();
    }
  );

  test(
    'verify that the app manager can create a pulse survey with frequency type of Every two weeks and the recipient type set to Site',
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
          'Verify that the app manager can create a pulse survey with frequency type of Every two weeks and the recipient type set to Site',
        zephyrTestId: 'LS-PULSE-003',
        storyId: 'EL-Pulse Survey Creation',
      });
      await surveyCreationPage.clickCreateSurveyButton();
      await pulseSurveyPage.clickPulseSurvey();
      await surveyCreationPage.clickCreateButton();
      await surveyCreationPage.enterSurveyName('Pulse');
      await surveyCreationPage.selectDefaultIntroMessage();
      await surveyCreationPage.selectDefaultThanksMessage();
      await pulseSurveyPage.selectSite('EL-site');
      await surveyCreationPage.selectDefaultFormAddress();
      await pulseSurveyPage.selectFrequency('Every two weeks');
      await pulseSurveyPage.selectCurrentRecurrenceDay();
      await pulseSurveyPage.selectCustomParticipationWindow('1');
      await pulseSurveyPage.selectSendDate({
        frequencyRadioName: 'Every two weeks',
        recurrenceDate: '10',
        participationWindow: '1',
        sendDateMenuName: '2',
        endDateRadioName: 'Choose end date',
        endDateButtonName: 'Select date…',
      });
      await surveyCreationPage.clickConfigureSurveyNextButton();
      // Add a short wait after clicking Next to allow page transition
      await surveyCreationPage.page.waitForTimeout(2000);
      await pulseSurveyPage.addScaleQuestionFromDataWithoutType(surveyCreationPage, 0, 'Sentiment');
      await surveyCreationPage.clickAddQuestionNextButton();
      await surveyCreationPage.clickScheduleSurveyButton();
      await surveyCreationPage.verifySurveyScheduledMessage();
    }
  );

  test(
    'verify user able to create a pulse survey for site by creating own questions',
    {
      tag: [
        TestPriority.P1,
        TestGroupType.REGRESSION,
        EmployeeListeningSuiteTags.SURVEYS,
        EmployeeListeningFeatureTags.SURVEYS_CREATE,
        '@pulse-survey',
      ],
    },
    async () => {
      tagTest(test.info(), {
        description: 'Verify user able to create a pulse survey for site by creating own questions',
        zephyrTestId: 'LS-PULSE-004',
        storyId: 'EL-Pulse Survey Creation',
      });
      await surveyCreationPage.clickCreateSurveyButton();
      await pulseSurveyPage.clickPulseSurvey();
      await surveyCreationPage.clickCreateButton();
      await surveyCreationPage.enterSurveyName('Pulse');
      await surveyCreationPage.selectDefaultIntroMessage();
      await surveyCreationPage.selectDefaultThanksMessage();
      await pulseSurveyPage.selectSite('EL-site');
      await surveyCreationPage.selectDefaultFormAddress();
      await pulseSurveyPage.selectCurrentRecurrenceDay();
      await pulseSurveyPage.selectCurrentRecurrenceDate();
      await pulseSurveyPage.selectCustomParticipationWindow('3');
      await pulseSurveyPage.selectSendDate({
        frequencyRadioName: 'Monthly',
        recurrenceDate: '15',
        participationWindow: '3',
        sendDateMenuName: '3',
        endDateRadioName: 'Choose end date',
        endDateButtonName: 'Select date…',
      });
      await surveyCreationPage.clickConfigureSurveyNextButton();
      // Add a short wait after clicking Next to allow page transition
      await surveyCreationPage.page.waitForTimeout(2000);
      await pulseSurveyPage.addScaleQuestionFromDataWithoutType(surveyCreationPage, 0, 'Sentiment');
      await surveyCreationPage.clickAddQuestionNextButton();
      await surveyCreationPage.clickScheduleSurveyButton();
      await surveyCreationPage.verifySurveyScheduledMessage();
    }
  );

  test(
    'verify app manager able to delete pulse survey created for audience',
    {
      tag: [
        TestPriority.P1,
        TestGroupType.REGRESSION,
        EmployeeListeningSuiteTags.SURVEYS,
        EmployeeListeningFeatureTags.SURVEYS_CREATE,
        '@pulse-survey',
      ],
    },
    async () => {
      tagTest(test.info(), {
        description: 'Verify app manager able to delete pulse survey created for audience',
        zephyrTestId: 'LS-PULSE-005',
        storyId: 'EL-Pulse Survey Deletion',
      });
      await surveyCreationPage.clickCreateSurveyButton();
      await pulseSurveyPage.clickPulseSurvey();
      await surveyCreationPage.clickCreateButton();
      const surveyName = `Pulse ${Date.now()}`;
      await surveyCreationPage.enterSurveyName(surveyName);
      await surveyCreationPage.selectDefaultIntroMessage();
      await surveyCreationPage.selectDefaultThanksMessage();
      await surveyCreationPage.selectAudiences(['India']);
      await surveyCreationPage.selectDefaultFormAddress();
      await pulseSurveyPage.selectCurrentRecurrenceDate();
      await pulseSurveyPage.selectCustomParticipationWindow('3');
      await pulseSurveyPage.selectSendDate({
        frequencyRadioName: 'Monthly',
        recurrenceDate: '15',
        participationWindow: '3',
        sendDateMenuName: '2',
        endDateRadioName: 'Choose end date',
        endDateButtonName: 'Select date…',
      });
      await surveyCreationPage.clickConfigureSurveyNextButton();
      // Add a short wait after clicking Next to allow page transition
      await surveyCreationPage.page.waitForTimeout(2000);
      await pulseSurveyPage.addScaleQuestionFromDataWithoutType(surveyCreationPage, 0, 'Sentiment');
      await surveyCreationPage.clickAddQuestionNextButton();
      await surveyCreationPage.clickScheduleSurveyButton();
      await surveyCreationPage.verifySurveyScheduledMessage();
      // Navigate to manage page and delete
      await surveyCreationPage.navigateToSurveysViaMenu();
      await surveyCreationPage.searchSurveyByName(surveyName);
      await surveyCreationPage.clickFirstSurveyManageButton();
      await surveyCreationPage.clickDeleteButton();
      await surveyCreationPage.clickConfirmDeleteButton();
      await surveyCreationPage.page
        .getByText('Survey deleted successfully')
        .waitFor({ state: 'visible', timeout: 5000 });
      await surveyCreationPage.searchSurveyByName(surveyName);
      await pulseSurveyPage.verifyNoResultsMessage();
    }
  );

  test('verify duplicate Pulse survey preserves custom configuration and questions for audience recipient', async () => {
    // Create and schedule the original survey
    await surveyCreationPage.clickCreateSurveyButton();
    await pulseSurveyPage.clickPulseSurvey();
    await surveyCreationPage.clickCreateButton();
    const surveyName = `Pulse ${Date.now()}`;
    await surveyCreationPage.enterSurveyName(surveyName);
    await surveyCreationPage.selectCustomIntroMessage();
    await surveyCreationPage.selectDefaultThanksMessage();
    await surveyCreationPage.selectAudiences(['India']);
    await surveyCreationPage.selectDefaultFormAddress();
    await pulseSurveyPage.selectSendDate({
      frequencyRadioName: 'Every three months A great',
      recurrenceDate: '25',
      participationWindow: '12',
      sendDateMenuName: '3',
      endDateRadioName: 'Choose end date',
      endDateButtonName: 'Select date…',
    });
    await surveyCreationPage.clickConfigureSurveyNextButton();
    await surveyCreationPage.clickCreateYourOwnButton();
    await surveyCreationPage.enterQuestionTitle('Test Scale type question-1');
    await surveyCreationPage.selectAwarenessAnswerScale();
    await surveyCreationPage.selectTheme('Business agility');
    await surveyCreationPage.clickAddButton();
    await surveyCreationPage.validateQuestionAddedPopup();
    await surveyCreationPage.clickCreateYourOwnButton();
    await surveyCreationPage.enterQuestionTitle('Test Scale type question-2');
    await surveyCreationPage.selectAwarenessAnswerScale();
    await surveyCreationPage.selectTheme('Business agility');
    await surveyCreationPage.clickAddButton();
    await surveyCreationPage.validateQuestionAddedPopup();
    await surveyCreationPage.clickAddQuestionNextButton();
    await surveyCreationPage.clickScheduleSurveyButton();
    await surveyCreationPage.verifySurveyScheduledMessage();
    // Duplicate the survey and validate questions
    await surveyCreationPage.navigateToSurveysViaMenu();
    await surveyCreationPage.searchSurveyByName(surveyName);
    await surveyCreationPage.clickFirstSurveyManageButton();
    await surveyCreationPage.clickDuplicateOption();
    await surveyCreationPage.clickConfigureSurveyNextButton();
    await surveyCreationPage.validateQuestionsOnPreview(['Test Scale type question-1', 'Test Scale type question-2']);
    await surveyCreationPage.clickAddQuestionNextButton();
    await surveyCreationPage.page.getByText('Survey draft was saved').waitFor({ state: 'visible', timeout: 5000 });
    await surveyCreationPage.page.getByRole('button', { name: 'Save' }).click();
  });

  test('verify scheduling a draft pulse survey after modifying to site recipient type', async () => {
    // Create and schedule a draft survey
    await surveyCreationPage.clickCreateSurveyButton();
    await pulseSurveyPage.clickPulseSurvey();
    await surveyCreationPage.clickCreateButton();
    const surveyName = `Pulse ${Date.now()}`;
    await surveyCreationPage.enterSurveyName(surveyName);
    await surveyCreationPage.selectDefaultIntroMessage();
    await surveyCreationPage.selectDefaultThanksMessage();
    await surveyCreationPage.selectAudiences(['All Employees']);
    await surveyCreationPage.selectDefaultFormAddress();
    await pulseSurveyPage.selectFrequency('Pulse');
    await pulseSurveyPage.selectFrequency('Weekly');
    await pulseSurveyPage.selectCurrentRecurrenceDay();
    await pulseSurveyPage.selectCustomParticipationWindow('2');
    await pulseSurveyPage.selectSendDate({
      frequencyRadioName: 'Every two weeks',
      recurrenceDate: '25',
      participationWindow: '12',
      sendDateMenuName: '6',
      endDateRadioName: 'Choose end date',
      endDateButtonName: 'Select date…',
    });
    await surveyCreationPage.clickConfigureSurveyNextButton();
    await surveyCreationPage.clickCreateYourOwnButton();
    await surveyCreationPage.enterQuestionTitle('Test Scale type question-1');
    await surveyCreationPage.selectAwarenessAnswerScale();
    await surveyCreationPage.selectTheme('Business agility');
    await surveyCreationPage.clickAddButton();
    await surveyCreationPage.validateQuestionAddedPopup();
    await surveyCreationPage.clickAddQuestionNextButton();
    // Configure as site recipient and schedule
    await surveyCreationPage.navigateToSurveysViaMenu();
    await surveyCreationPage.searchSurveyByName(surveyName);
    await surveyCreationPage.clickFirstSurveyManageButton();
    await surveyCreationPage.clickConfigureOption();
    await surveyCreationPage.clickCreateYourOwnButton();
    await surveyCreationPage.enterQuestionTitle('Test Scale type question-1');
    await surveyCreationPage.selectAwarenessAnswerScale();
    await surveyCreationPage.selectTheme('Business agility');
    await surveyCreationPage.clickAddButton();
    await surveyCreationPage.clickAddQuestionNextButton();

    await surveyCreationPage.clickScheduleSurveyButton();
    await surveyCreationPage.verifySurveyScheduledMessage();
  });

  test('verify app manager should able to duplicate a paused survey', async () => {
    await surveyCreationPage.navigateToHome();
    await surveyCreationPage.clickManageFeaturesMenuItem();
    await surveyCreationPage.clickSurveysButton();
    await surveyCreationPage.page.waitForTimeout(5000);
    await surveyCreationPage.applyTypeFilter('Pulse');
    await surveyCreationPage.applyStatusFilter('Active');
    await pulseSurveyPage.clickFirstSurveyManageButton();
    await pulseSurveyPage.pauseSurvey();
    await pulseSurveyPage.confirmPauseSurvey();
    await surveyCreationPage.clickResetButton();
    await surveyCreationPage.applyTypeFilter('Pulse');
    await surveyCreationPage.applyStatusFilter('Paused');
    await pulseSurveyPage.page.keyboard.press('Escape');
    await pulseSurveyPage.clickFirstSurveyManageButton();
    await surveyCreationPage.clickDuplicateOption();
    await pulseSurveyPage.selectFrequency('Every three months');
    await pulseSurveyPage.selectFrequency('Weekly');
    await pulseSurveyPage.selectCurrentRecurrenceDay();
    await pulseSurveyPage.selectCustomParticipationWindow('2');
    await surveyCreationPage.selectDefaultFormAddress();
    await pulseSurveyPage.selectSendDate({
      frequencyRadioName: 'Every three months',
      recurrenceDate: '25',
      participationWindow: '12',
      sendDateMenuName: '6',
      endDateRadioName: 'Choose end date',
      endDateButtonName: 'Select date…',
    });
    await surveyCreationPage.clickConfigureSurveyNextButton();
    await surveyCreationPage.clickAddQuestionNextButton();
    await surveyCreationPage.clickScheduleSurveyButton();
    await surveyCreationPage.verifySurveyScheduledMessage();
  });

  test('verify “Copy link to survey” hyperlink available on share screen', async () => {
    await surveyCreationPage.navigateToSurveysViaMenu();
    await surveyCreationPage.applyTypeFilter('Pulse');
    await surveyCreationPage.applyStatusFilter('Active');
    await pulseSurveyPage.applySortFilter('Last sent');
    await pulseSurveyPage.clickFirstSurveyManageButton();
    await pulseSurveyPage.copySurveyLink();
    await pulseSurveyPage.verifyLinkCopiedPopup();
    await pulseSurveyPage.openNewTabAndPasteLink();
  });

  test('verify “Not yet” and “Schedule date and time” option will not be available if user try to edit active pulse surveys', async () => {
    await surveyCreationPage.navigateToSurveysViaMenu();
    await pulseSurveyPage.applyTypeFilter('Pulse');
    await pulseSurveyPage.applyStatusFilter('Active');
    await pulseSurveyPage.applySortFilter('Last sent');
    await pulseSurveyPage.clickFirstSurveyManageButton();
    await pulseSurveyPage.editSurvey();
    await pulseSurveyPage.configureSurvey();
    await pulseSurveyPage.verifyNotYetAndScheduleDateTimeNotVisible();
  });
});
