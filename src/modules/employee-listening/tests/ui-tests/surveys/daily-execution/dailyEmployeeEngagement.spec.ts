import { TestPriority } from '@/src/core/constants/testPriority';
import { TestGroupType } from '@/src/core/constants/testType';
import { tagTest } from '@/src/core/utils/testDecorator';
import {
  EmployeeListeningFeatureTags,
  EmployeeListeningSuiteTags,
} from '@/src/modules/employee-listening/constants/testTags';
import { test } from '@/src/modules/employee-listening/fixtures/loginFixture';
import { SurveyCreationPage } from '@/src/modules/employee-listening/pages/surveys/surveyCreation';
import { setupSurveyTestContext } from '@/src/modules/employee-listening/utils/surveys';

test.describe('daily Employee Engagement Survey Creation Tests', () => {
  let surveyCreationPage: SurveyCreationPage;

  test.beforeEach(async ({ appManagersPage }) => {
    const { surveyCreationPage: scp } = await setupSurveyTestContext(appManagersPage);
    surveyCreationPage = scp;
    await surveyCreationPage.navigateToSurveysViaMenu();
  });

  test(
    'daily execution - create employee engagement survey with default intro and thanks message for All Employees',
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
          'Daily execution test to create an employee engagement survey with "default" intro "default" thanks message and "All Employees" as audience using question bank search and selection',
        zephyrTestId: 'LS-DAILY-EMPLOYEE-ENGAGEMENT-001',
        storyId: 'EL-Daily Employee Engagement Survey Creation',
      });

      const timestamp = new Date().toISOString().slice(0, 10); // YYYY-MM-DD format
      await surveyCreationPage.createBasicSurveySetup(`Daily Employee Engagement ${timestamp}`);
      await surveyCreationPage.selectAudiences(['All Employees']);
      await surveyCreationPage.selectDefaultIntroAndThanks();
      await surveyCreationPage.selectDefaultFormAddress();
      await surveyCreationPage.selectSendDate();
      await surveyCreationPage.clickConfigureSurveyNextButton();
      await surveyCreationPage.addScaleQuestionFromBankWithSearch();
      await surveyCreationPage.addMultipleChoiceQuestionFromBankWithSearch();
      await surveyCreationPage.clickAddQuestionNextButton();
      await surveyCreationPage.captureSurveyIdAfterSchedule();
      await surveyCreationPage.verifySurveyScheduledMessage();
    }
  );
});
