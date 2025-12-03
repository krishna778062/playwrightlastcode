import { TestPriority } from '@/src/core/constants/testPriority';
import { TestGroupType } from '@/src/core/constants/testType';
import { tagTest } from '@/src/core/utils/testDecorator';
import { SurveyManagementService } from '@/src/modules/employee-listening/api/services/SurveyManagementService';
import {
  EmployeeListeningFeatureTags,
  EmployeeListeningSuiteTags,
} from '@/src/modules/employee-listening/constants/testTags';
import { test } from '@/src/modules/employee-listening/fixtures/loginFixture';
import { SurveyCreationPage } from '@/src/modules/employee-listening/pages/surveys/surveyCreation';
import { SURVEY_QUESTION_BANK } from '@/src/modules/employee-listening/test-data/surveyQuestions';
import { setupSurveyTestContext } from '@/src/modules/employee-listening/utils/surveys';

test.describe('all Purpose Survey Creation Tests', () => {
  let surveyCreationPage: SurveyCreationPage;
  let createdSurveyId: string | undefined;
  let surveyManagementService: SurveyManagementService;

  test.beforeEach(async ({ appManagersPage }) => {
    const { surveyCreationPage: scp, surveyManagementService: sms } = await setupSurveyTestContext(appManagersPage);
    surveyCreationPage = scp;
    surveyManagementService = sms;
    await surveyCreationPage.navigateToSurveysViaMenu();
  });

  test.afterEach(async () => {
    if (createdSurveyId) {
      await surveyCreationPage.cleanupSurveyById(createdSurveyId, surveyManagementService);
      createdSurveyId = undefined;
    }
  });

  test(
    'verify that the app manager can create a all purpose survey with "default" intro "default" thanks message and recipient type set to All org',
    {
      tag: [
        TestPriority.P0,
        TestGroupType.SMOKE,
        EmployeeListeningSuiteTags.SURVEYS,
        EmployeeListeningFeatureTags.SURVEYS_CREATE,
      ],
    },
    async () => {
      tagTest(test.info(), {
        description:
          'Verify that the app manager can create an all purpose survey with "default" intro "default" thanks message and "India" as audience',
        zephyrTestId: 'LS-SURVEY-001',
        storyId: 'EL-Survey Creation',
      });
      await surveyCreationPage.createBasicSurveySetup('All pp');
      await surveyCreationPage.selectAudiences(['India']);
      await surveyCreationPage.selectDefaultIntroAndThanks();
      await surveyCreationPage.selectDefaultFormAddress();
      await surveyCreationPage.selectSendDate();
      await surveyCreationPage.clickConfigureSurveyNextButton();
      await surveyCreationPage.addScaleQuestionFromData(0, 'Sentiment');
      await surveyCreationPage.addFreeTextQuestionFromData(0);
      await surveyCreationPage.clickAddQuestionNextButton();
      createdSurveyId = await surveyCreationPage.captureSurveyIdAfterSchedule();
      await surveyCreationPage.verifySurveyScheduledMessage();
    }
  );

  test(
    'verify that the app manager can create a All Purpose survey with a custom introduction and thank you message custom participation window for the “India” audience',
    {
      tag: [
        TestPriority.P1,
        TestGroupType.REGRESSION,
        EmployeeListeningSuiteTags.SURVEYS,
        EmployeeListeningFeatureTags.SURVEYS_CREATE,
      ],
    },
    async () => {
      tagTest(test.info(), {
        description:
          'Verify that the app manager can create an All Purpose survey with custom introduction and thank you message, custom participation window for the audience recipient type',
        zephyrTestId: 'LS-SURVEY-002',
        storyId: 'EL-Survey Creation',
      });
      await surveyCreationPage.createBasicSurveySetup('All pp');
      await surveyCreationPage.selectCustomIntroMessage();
      await surveyCreationPage.selectCustomThanksMessage();
      await surveyCreationPage.selectDefaultFormAddress();
      await surveyCreationPage.selectAudiences(['India']);
      await surveyCreationPage.selectSendDate();
      await surveyCreationPage.selectCustomParticipationWindow('5');
      await surveyCreationPage.clickConfigureSurveyNextButton();
      await surveyCreationPage.addMultipleChoiceQuestionFromData(2);
      await surveyCreationPage.clickAddQuestionNextButton();
      createdSurveyId = await surveyCreationPage.captureSurveyIdAfterSchedule();
      await surveyCreationPage.verifySurveyScheduledMessage();
    }
  );

  test(
    'verify that the app manager can create a All Purpose survey with a custom participation window for the for the “India” audience',
    {
      tag: [
        TestPriority.P1,
        TestGroupType.REGRESSION,
        EmployeeListeningSuiteTags.SURVEYS,
        EmployeeListeningFeatureTags.SURVEYS_CREATE,
      ],
    },
    async () => {
      tagTest(test.info(), {
        description:
          'Verify that the app manager can create an All Purpose survey with custom participation window for the site recipient type',
        zephyrTestId: 'LS-SURVEY-003',
        storyId: 'EL-Survey Creation',
      });
      await surveyCreationPage.createBasicSurveySetup('All pp');
      await surveyCreationPage.selectDefaultIntroAndThanks();
      await surveyCreationPage.selectCustomThanksMessage();
      await surveyCreationPage.selectDefaultFormAddress();
      await surveyCreationPage.selectAudiences(['India']);
      await surveyCreationPage.selectSendDate();
      await surveyCreationPage.clickConfigureSurveyNextButton();
      await surveyCreationPage.addMultipleChoiceQuestionFromData(2);
      await surveyCreationPage.addScaleQuestionFromData(0, 'Emoji');
      await surveyCreationPage.addFreeTextQuestionFromData(0);
      await surveyCreationPage.clickAddQuestionNextButton();
      createdSurveyId = await surveyCreationPage.captureSurveyIdAfterSchedule();
      await surveyCreationPage.verifySurveyScheduledMessage();
    }
  );

  test(
    'verify app manager able to delete All Purpose survey created for All org',
    {
      tag: [
        TestPriority.P1,
        TestGroupType.REGRESSION,
        EmployeeListeningSuiteTags.SURVEYS,
        EmployeeListeningFeatureTags.SURVEYS_CREATE,
      ],
    },
    async () => {
      tagTest(test.info(), {
        description: 'Verify that the app manager can delete All Purpose survey created for All Employees',
        zephyrTestId: 'LS-SURVEY-004',
        storyId: 'EL-Survey Creation',
      });
      await surveyCreationPage.createBasicSurveySetup('All pp');
      await surveyCreationPage.selectDefaultIntroAndThanks();
      await surveyCreationPage.selectAudiences(['All Employees']);
      await surveyCreationPage.selectDefaultFormAddress();
      await surveyCreationPage.selectSendDate();
      await surveyCreationPage.clickConfigureSurveyNextButton();
      await surveyCreationPage.addMultipleChoiceQuestionFromData(2);
      await surveyCreationPage.addScaleQuestionFromData(0, 'Emoji');
      await surveyCreationPage.addFreeTextQuestionFromData(0);
      await surveyCreationPage.clickAddQuestionNextButton();
      createdSurveyId = await surveyCreationPage.captureSurveyIdAfterSchedule();
      await surveyCreationPage.verifySurveyScheduledMessage();
      await surveyCreationPage.clickBackToSurveysLink();
      await surveyCreationPage.clickFirstSurveyManageButton();
      await surveyCreationPage.clickDeleteButton();
      await surveyCreationPage.clickConfirmDeleteButton();
    }
  );

  test(
    'validate Creation of an All Purpose Survey with All org and Multiple Section and Question Name Verifications',
    {
      tag: [
        TestPriority.P1,
        TestGroupType.REGRESSION,
        EmployeeListeningSuiteTags.SURVEYS,
        EmployeeListeningFeatureTags.SURVEYS_CREATE,
      ],
    },
    async () => {
      tagTest(test.info(), {
        description:
          'Validate Creation of an All Purpose Survey with All org Recipient Type and Multiple Section and Question Name Verifications',
        zephyrTestId: 'LS-SURVEY-005',
        storyId: 'EL-Survey Creation',
      });
      const surveyName = `All pp ${Date.now()}`;
      await surveyCreationPage.createBasicSurveySetup(surveyName);
      await surveyCreationPage.selectDefaultIntroAndThanks();
      await surveyCreationPage.selectAudiences(['All Employees']);
      await surveyCreationPage.selectDefaultFormAddress();
      await surveyCreationPage.selectSendDate();
      await surveyCreationPage.clickConfigureSurveyNextButton();
      await surveyCreationPage.clickAddNewSectionButton();
      await surveyCreationPage.clickAddNewSectionButton();
      await surveyCreationPage.enterSectionNames([
        'All Purpose Section-1',
        'All Purpose Section-2',
        'All Purpose Section-3',
      ]);
      await surveyCreationPage.createSectionScaleQuestion(1, 0, 'Sentiment');
      await surveyCreationPage.createSectionMultipleChoiceQuestion(
        2,
        0,
        ['Yes', 'No'],
        SURVEY_QUESTION_BANK.MCQ[0].theme
      );
      await surveyCreationPage.createSectionFreeTextQuestion(3, 0);
      await surveyCreationPage.clickPreviewLabel();
      await surveyCreationPage.validateQuestionsAndSectionsOnPreview([
        { section: 'All Purpose Section-1', question: SURVEY_QUESTION_BANK.SCALE[0].question + '*' },
        { section: 'All Purpose Section-2', question: SURVEY_QUESTION_BANK.MCQ[0].question + '*' },
        { section: 'All Purpose Section-3', question: SURVEY_QUESTION_BANK.FREE_TEXT[0].question + '*' },
      ]);
      await surveyCreationPage.closePreviewDialog();
      await surveyCreationPage.clickAddQuestionNextButton();
      createdSurveyId = await surveyCreationPage.captureSurveyIdAfterSchedule();
      await surveyCreationPage.verifySurveyScheduledMessage();
    }
  );

  test(
    'verify new added questions are preserved when duplicating an All Purpose survey',
    {
      tag: [
        TestPriority.P1,
        TestGroupType.REGRESSION,
        EmployeeListeningSuiteTags.SURVEYS,
        EmployeeListeningFeatureTags.SURVEYS_CREATE,
      ],
    },
    async () => {
      tagTest(test.info(), {
        description: 'Verify that new added questions are preserved when duplicating an All Purpose survey',
        zephyrTestId: 'LS-SURVEY-006',
        storyId: 'EL-Survey Creation',
      });
      const surveyName = `All pp ${Date.now()}`;
      await surveyCreationPage.createBasicSurveySetup(surveyName);
      await surveyCreationPage.selectDefaultIntroAndThanks();
      await surveyCreationPage.selectAudiences(['All Employees']);
      await surveyCreationPage.selectDefaultFormAddress();
      await surveyCreationPage.selectSendDate();
      await surveyCreationPage.clickConfigureSurveyNextButton();
      await surveyCreationPage.addScaleQuestionFromData(0, 'Sentiment');
      await surveyCreationPage.addFreeTextQuestionFromData(0);
      await surveyCreationPage.clickAddQuestionNextButton();
      createdSurveyId = await surveyCreationPage.captureSurveyIdAfterSchedule();
      await surveyCreationPage.verifySurveyScheduledMessage();
      await surveyCreationPage.clickBackToSurveysLink();
      await surveyCreationPage.searchSurveyByName(surveyName);
      await surveyCreationPage.clickFirstSurveyManageButton();
      await surveyCreationPage.clickDuplicateOption();
      await surveyCreationPage.selectSendDate();
      await surveyCreationPage.selectDefaultFormAddress();
      await surveyCreationPage.clickConfigureSurveyNextButton();
      await surveyCreationPage.waitForQuestionButtonVisible(SURVEY_QUESTION_BANK.SCALE[0].question);
      await surveyCreationPage.waitForQuestionButtonVisible(SURVEY_QUESTION_BANK.FREE_TEXT[0].question);
      await surveyCreationPage.validateAddedQuestions([
        SURVEY_QUESTION_BANK.SCALE[0].question,
        SURVEY_QUESTION_BANK.FREE_TEXT[0].question,
      ]);
      await surveyCreationPage.clickAddQuestionNextButton();
      createdSurveyId = await surveyCreationPage.captureSurveyIdAfterSchedule();
      await surveyCreationPage.verifySurveyScheduledMessage();
    }
  );

  test(
    'verify that app manager can schedule an all purpose survey from draft state',
    {
      tag: [
        TestPriority.P1,
        TestGroupType.REGRESSION,
        EmployeeListeningSuiteTags.SURVEYS,
        EmployeeListeningFeatureTags.SURVEYS_CREATE,
      ],
    },
    async () => {
      tagTest(test.info(), {
        description: 'Verify that app manager can schedule an all purpose survey from draft state',
        zephyrTestId: 'LS-SURVEY-007',
        storyId: 'EL-Survey Creation',
      });
      const surveyName = `All pp ${Date.now()}`;
      await surveyCreationPage.createBasicSurveySetup(surveyName);
      await surveyCreationPage.selectDefaultIntroAndThanks();
      await surveyCreationPage.selectAudiences(['All Employees']);
      await surveyCreationPage.selectDefaultFormAddress();
      await surveyCreationPage.validateDraftPopupOnNext();
      await surveyCreationPage.navigateToSurveysViaMenu();
      await surveyCreationPage.searchSurveyByName(surveyName);
      await surveyCreationPage.clickFirstSurveyManageButton();
      await surveyCreationPage.clickConfigureOption();
      await surveyCreationPage.selectSendDate();
      await surveyCreationPage.clickConfigureSurveyNextButton();
      await surveyCreationPage.addMultipleChoiceQuestionFromData(2);
      await surveyCreationPage.addFreeTextQuestionFromData(0);
      await surveyCreationPage.clickAddQuestionNextButton();
      createdSurveyId = await surveyCreationPage.captureSurveyIdAfterSchedule();
      await surveyCreationPage.verifySurveyScheduledMessage();
    }
  );

  test(
    'verify user able to create all-purpose survey for sites by creating own questions',
    {
      tag: [
        TestPriority.P1,
        TestGroupType.REGRESSION,
        EmployeeListeningSuiteTags.SURVEYS,
        EmployeeListeningFeatureTags.SURVEYS_CREATE,
      ],
    },
    async () => {
      tagTest(test.info(), {
        description: 'Verify user able to create all-purpose survey for sites by creating own questions',
        zephyrTestId: 'LS-SURVEY-008',
        storyId: 'EL-Survey Creation',
      });
      await surveyCreationPage.createBasicSurveySetup('All pp');
      await surveyCreationPage.selectDefaultIntroAndThanks();
      await surveyCreationPage.selectAudiences(['All Employees']);
      await surveyCreationPage.selectDefaultFormAddress();
      await surveyCreationPage.selectSendDate();
      await surveyCreationPage.clickConfigureSurveyNextButton();
      await surveyCreationPage.addScaleQuestionFromData(0, 'Emoji');
      await surveyCreationPage.addMultipleChoiceQuestionFromData(0, ['Yes', 'No', 'Optional'], 'Employee engagement');
      await surveyCreationPage.addFreeTextQuestionFromData(0);
      await surveyCreationPage.addScaleQuestionFromData(1, 'Awareness');
      await surveyCreationPage.clickAddQuestionNextButton();
      createdSurveyId = await surveyCreationPage.captureSurveyIdAfterSchedule();
      await surveyCreationPage.verifySurveyScheduledMessage();
    }
  );

  test(
    'verify app manager should able to duplicate a completed All Purpose survey',
    {
      tag: [
        TestPriority.P1,
        TestGroupType.REGRESSION,
        EmployeeListeningSuiteTags.SURVEYS,
        EmployeeListeningFeatureTags.SURVEYS_CREATE,
      ],
    },
    async () => {
      tagTest(test.info(), {
        description: 'Verify app manager should able to duplicate a completed All Purpose survey',
        zephyrTestId: 'LS-SURVEY-009',
        storyId: 'EL-Survey Creation',
      });
      await surveyCreationPage.createBasicSurveySetup('All pp Survey to Complete');
      await surveyCreationPage.selectDefaultIntroAndThanks();
      await surveyCreationPage.selectAudiences(['All Employees']);
      await surveyCreationPage.selectDefaultFormAddress();
      await surveyCreationPage.selectSendDate();
      await surveyCreationPage.clickConfigureSurveyNextButton();
      await surveyCreationPage.addFreeTextQuestionFromData(0);
      await surveyCreationPage.clickAddQuestionNextButton();
      createdSurveyId = await surveyCreationPage.captureSurveyIdAfterSchedule();
      await surveyCreationPage.verifySurveyScheduledMessage();
      await surveyCreationPage.clickBackToSurveysLink();
      await surveyCreationPage.clickCompleteOption();
      await surveyCreationPage.clickCompleteButton();
      await surveyCreationPage.clickResetButton();
      await surveyCreationPage.clickFirstSurveyManageButton();
      await surveyCreationPage.clickDuplicateOption();
      await surveyCreationPage.selectSendDate();
      await surveyCreationPage.selectDefaultFormAddress();
      await surveyCreationPage.clickConfigureSurveyNextButton();
      await surveyCreationPage.addFreeTextQuestionFromData(0);
      await surveyCreationPage.clickAddQuestionNextButton();
      createdSurveyId = await surveyCreationPage.captureSurveyIdAfterSchedule();
      await surveyCreationPage.verifySurveyScheduledMessage();
    }
  );

  test(
    'verify app manager should able to complete a all purpose survey',
    {
      tag: [
        TestPriority.P1,
        TestGroupType.REGRESSION,
        EmployeeListeningSuiteTags.SURVEYS,
        EmployeeListeningFeatureTags.SURVEYS_CREATE,
      ],
    },
    async () => {
      tagTest(test.info(), {
        description: 'Verify app manager should able to complete a all purpose survey',
        zephyrTestId: 'LS-SURVEY-010',
        storyId: 'EL-Survey Creation',
      });
      await surveyCreationPage.createBasicSurveySetup('All pp Survey to Complete');
      await surveyCreationPage.selectDefaultIntroAndThanks();
      await surveyCreationPage.selectAudiences(['All Employees']);
      await surveyCreationPage.selectDefaultFormAddress();
      await surveyCreationPage.selectSendDate();
      await surveyCreationPage.clickConfigureSurveyNextButton();
      await surveyCreationPage.addFreeTextQuestionFromData(0);
      await surveyCreationPage.clickAddQuestionNextButton();
      createdSurveyId = await surveyCreationPage.captureSurveyIdAfterSchedule();
      await surveyCreationPage.verifySurveyScheduledMessage();
      await surveyCreationPage.clickBackToSurveysLink();
      await surveyCreationPage.clickCompleteOption();
      await surveyCreationPage.clickCompleteButton();
      await surveyCreationPage.clickResetButton();
      await surveyCreationPage.applyTypeFilter('All-purpose');
      await surveyCreationPage.applyStatusFilter('Completed');
      await surveyCreationPage.waitForAndVerifyCompletedStatus();
    }
  );

  test(
    'verify all details on configuration page remain unchanged when saving survey for later using not yet option',
    {
      tag: [
        TestPriority.P1,
        TestGroupType.REGRESSION,
        EmployeeListeningSuiteTags.SURVEYS,
        EmployeeListeningFeatureTags.SURVEYS_CREATE,
      ],
    },
    async () => {
      tagTest(test.info(), {
        description:
          'Verify all details on configuration page remain unchanged when saving survey for later using not yet option',
        zephyrTestId: 'LS-SURVEY-011',
        storyId: 'EL-Survey Creation',
      });
      const surveyName = `All pp ${Date.now()}`;
      await surveyCreationPage.createBasicSurveySetup(surveyName);
      await surveyCreationPage.selectDefaultIntroAndThanks();
      await surveyCreationPage.selectAudiences(['All Employees']);
      await surveyCreationPage.selectDefaultFormAddress();
      await surveyCreationPage.verifySendDateOptions();
      await surveyCreationPage.validateDraftPopupOnNext();
      await surveyCreationPage.clickCreateYourOwnButton();
      await surveyCreationPage.selectFreeTextQuestionType();
      await surveyCreationPage.enterQuestionTitle('Test Free Text question');
      await surveyCreationPage.clickAddButton();
      await surveyCreationPage.validateQuestionAddedPopup();
      await surveyCreationPage.validateQuestionAddedSuccessfully('Test Free Text question');
      await surveyCreationPage.validateDraftPopupOnNext();
      await surveyCreationPage.navigateToSurveysViaMenu();
      await surveyCreationPage.searchSurveyByName(surveyName);
      await surveyCreationPage.clickFirstSurveyManageButton();
      await surveyCreationPage.clickConfigureOption();
      await surveyCreationPage.verifySurveyNameOnConfigPage('All pp');
      await surveyCreationPage.verifyAddNewRecipientsText();
      await surveyCreationPage.clickConfigureSurveyNextButton();
      await surveyCreationPage.addFreeTextQuestionFromData(0);
      await surveyCreationPage.clickAddQuestionNextButton();
      await surveyCreationPage.verifyConfigurationDetails();
    }
  );

  test(
    'user should see save button on preview and confirm screen if "not yet" option is selected',
    {
      tag: [
        TestPriority.P1,
        TestGroupType.REGRESSION,
        EmployeeListeningSuiteTags.SURVEYS,
        EmployeeListeningFeatureTags.SURVEYS_CREATE,
      ],
    },
    async () => {
      tagTest(test.info(), {
        description: 'Verify Save button is visible on preview and confirm screen when "not yet" option is selected',
        zephyrTestId: 'LS-SURVEY-012',
        storyId: 'EL-Survey Creation',
      });
      const surveyName = `All pp ${Date.now()}`;
      await surveyCreationPage.createBasicSurveySetup(surveyName);
      await surveyCreationPage.selectDefaultIntroAndThanks();
      await surveyCreationPage.selectAudiences(['All Employees']);
      await surveyCreationPage.selectDefaultFormAddress();
      await surveyCreationPage.verifySendDateOptions();
      await surveyCreationPage.validateDraftPopupOnNext();
      await surveyCreationPage.clickCreateYourOwnButton();
      await surveyCreationPage.selectFreeTextQuestionType();
      await surveyCreationPage.enterQuestionTitle('Test Free Text question');
      await surveyCreationPage.clickAddButton();
      await surveyCreationPage.validateQuestionAddedPopup();
      await surveyCreationPage.validateQuestionAddedSuccessfully('Test Free Text question');
      await surveyCreationPage.validateDraftPopupOnNext();
      await surveyCreationPage.verifySaveButtonOnPreviewConfirm();
    }
  );
});
