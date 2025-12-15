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

test.describe('daily All Purpose Survey Creation Tests', () => {
  let surveyCreationPage: SurveyCreationPage;

  test.beforeEach(async ({ appManagersPage }) => {
    const { surveyCreationPage: scp } = await setupSurveyTestContext(appManagersPage);
    surveyCreationPage = scp;
    await surveyCreationPage.navigateToSurveysViaMenu();
  });

  test(
    'daily execution - create all purpose survey with default intro and thanks message for India audience',
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
          'Daily execution test to create an all purpose survey with "default" intro "default" thanks message and "India" as audience using question bank search and selection',
        zephyrTestId: 'LS-DAILY-ALL-PURPOSE-001',
        storyId: 'EL-Daily Survey Creation',
      });

      const timestamp = new Date().toISOString().slice(0, 10);
      await surveyCreationPage.createBasicSurveySetup(`Daily All Purpose ${timestamp}`);
      await surveyCreationPage.selectAudiences(['India']);
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
