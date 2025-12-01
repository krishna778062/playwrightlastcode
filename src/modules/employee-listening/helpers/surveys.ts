import { SurveyCreationPage } from '@/src/modules/employee-listening/pages/surveys/surveyCreation';
import { SurveysListingPage } from '@/src/modules/employee-listening/pages/surveys/surveysListingPage';

export interface SurveyForm {
  surveyName: string;
  introMessage?: 'default' | 'custom';
  thanksMessage?: 'default' | 'custom';
  recipientType?: 'all-org' | 'custom';
  formAddress?: 'default' | 'custom';
  questions?: SurveyQuestion[];
}

export interface SurveyQuestion {
  type: 'free-text' | 'multiple-choice' | 'rating';
  title: string;
  options?: string[];
}

export interface SurveyOperationOptions {
  verifySteps?: boolean;
}

export class SurveysHelper {
  constructor(
    private readonly surveyCreationPage: SurveyCreationPage,
    private readonly surveysListingPage?: SurveysListingPage
  ) {}

  async navigateToSurveysManagePage(): Promise<void> {
    if (this.surveysListingPage) {
      await this.surveysListingPage.loadPage({ stepInfo: 'Loading Surveys Management page' });
      await this.surveysListingPage.verifyThePageIsLoaded();
    }
  }

  async createAllPurposeSurvey(form: SurveyForm, options: SurveyOperationOptions = {}): Promise<void> {
    const { verifySteps = true } = options;

    await this.surveyCreationPage.navigateToSurveysViaMenu();

    await this.surveyCreationPage.clickCreateSurveyButton();
    await this.surveyCreationPage.clickAllPurposeSurvey();
    await this.surveyCreationPage.clickCreateButton();

    await this.surveyCreationPage.configureDefaultSurveySettings(form.surveyName);
    await this.surveyCreationPage.clickConfigureSurveyNextButton();
    await this.surveyCreationPage.clickCreateYourOwnButton();

    if (form.questions && form.questions.length > 0) {
      for (const question of form.questions) {
        await this.createQuestion(question);
      }
    }

    await this.surveyCreationPage.clickAddQuestionNextButton();
    await this.surveyCreationPage.clickScheduleSurveyButton();

    if (verifySteps) {
      await this.surveyCreationPage.verifySurveyScheduledMessage();
    }
  }

  private async createQuestion(question: SurveyQuestion): Promise<void> {
    if (question.type === 'free-text') {
      await this.surveyCreationPage.createFreeTextQuestion(question.title);
    } else {
      throw new Error(`Unsupported question type: ${question.type}`);
    }
  }
}
